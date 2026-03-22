import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { famousSongs } from '@/data/famous-songs';
import { SongSearchResult } from '@/types/music';

// --- Types & Constants ---
interface CacheEntry {
  data: SongSearchResult[];
  timestamp: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, CacheEntry>();

// Rate limiting state
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;



// --- Helper Functions ---

/** IPベースのレートリミットチェック */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

/** ローカルDB検索 */
function searchLocal(query: string): SongSearchResult[] {
  const q = query.toLowerCase();
  return famousSongs.filter(s => {
    if (s.title.toLowerCase().includes(q)) return true;
    if (s.artist.toLowerCase().includes(q)) return true;
    if (s.searchAliases?.some(alias => alias.toLowerCase().includes(q))) return true;
    return false;
  }).map(s => ({
    title: s.title,
    artist: s.artist,
    key: s.key,
    bpm: s.bpm,
    sections: s.sections,
    confidence: 'high',
    source: 'local'
  }));
}

// --- API Route Handler ---

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  // 1. レートリミットチェック
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "検索が混み合っています。しばらくしてから再度お試しください。（1分間に10回まで）" },
      { status: 429 }
    );
  }

  const { query } = await req.json();
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: "クエリが不正です" }, { status: 400 });
  }

  const normalizedQuery = query.trim().toLowerCase();

  // 2. ローカルDB検索 (エイリアス対応済み)
  const localResults = searchLocal(normalizedQuery);
  if (localResults.length > 0) {
    return NextResponse.json({ results: localResults, source: 'local' });
  }

  // 3. キャッシュチェック
  const cached = cache.get(normalizedQuery);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ results: cached.data, source: 'ai' });
  }

  // 4. Gemini API 呼び出し
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini APIキーが設定されていません。.env.local に GEMINI_API_KEY を設定してください。" },
      { status: 503 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5-flash as it's highly compatible

    const prompt = `あなたは音楽理論の専門家です。「${query}」のコード進行を教えてください。
以下のJSON形式のみで回答してください（前後に余分なテキストを含めないでください）:
{
  "title": "曲名",
  "artist": "アーティスト名",
  "key": "キー（例: C, Am, Eb）",
  "bpm": 数値,
  "sections": [
    {
      "label": "サビ",
      "chords": ["C", "G", "Am", "F"]
    }
  ],
  "confidence": "high"
}
confidence は "high" | "medium" | "low" のいずれか。`;

    // タイムアウト処理 (10秒)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const generateWithRetry = async (retryPrompt?: string) => {
      const result = await model.generateContent(retryPrompt || prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSONの抽出（Markdownの ```json ... ``` 等を除去）
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("JSONが見つかりませんでした");
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // バリデーション
      if (!parsed.title || !parsed.sections || !Array.isArray(parsed.sections)) {
        throw new Error("JSON形式が不正です");
      }
      
      return parsed;
    };

    let aiData;
    try {
      aiData = await generateWithRetry();
    } catch (e) {
      console.error("Gemini parse error, retrying...", e);
      // 一度だけリトライ
      aiData = await generateWithRetry(`前回の回答をJSONのみに修正してください。JSONの前後に説明テキストは不要です。\n\n${prompt}`);
    } finally {
      clearTimeout(timeout);
    }

    const searchResult: SongSearchResult = {
      title: aiData.title,
      artist: aiData.artist || "Unknown",
      key: aiData.key || "C",
      bpm: aiData.bpm || 120,
      sections: aiData.sections,
      confidence: aiData.confidence || 'medium',
      source: 'ai'
    };

    const results = [searchResult];

    // キャッシュ保存
    cache.set(normalizedQuery, { data: results, timestamp: Date.now() });

    return NextResponse.json({ results, source: 'ai' });

  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: "検索がタイムアウトしました。もう一度お試しください。" }, { status: 504 });
    }
    return NextResponse.json({ error: "AI検索中にエラーが発生しました。" }, { status: 502 });
  }
}
