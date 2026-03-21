---
name: gemini-song-search
description: Gemini API を使って楽曲名からコード進行を検索する機能を実装する。ユーザーが曲名を入力したときにコード進行データを取得するAPI連携を行う際に使用する。
---

# Gemini 楽曲コード検索スキル

## 目的
ユーザーが曲名を入力すると、まず自前データベース（data/famous-songs.ts）を検索し、
見つからない場合は Gemini 2.5 Flash API にフォールバックしてコード進行を取得する機能を実装する。

## アーキテクチャ
```
ユーザー入力（曲名）
    ↓
[クライアント] → API リクエスト
    ↓
[app/api/search-chords/route.ts]
    ↓
Step 1: data/famous-songs.ts を部分一致検索
    ↓ ヒットなし
Step 2: Gemini 2.5 Flash API に問い合わせ
    ↓
構造化されたコード進行データを返却
```

## Gemini API 呼び出し（サーバーサイドのみ）
```typescript
// app/api/search-chords/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const { songTitle } = await request.json();
  
  // Step 1: ローカルDB検索
  const localResult = searchLocalDatabase(songTitle);
  if (localResult) {
    return Response.json({ source: 'local', ...localResult });
  }
  
  // Step 2: Gemini フォールバック
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `
あなたは音楽理論の専門家です。以下の楽曲のコード進行を教えてください。

楽曲名: ${songTitle}

以下のJSON形式で回答してください。確信が持てない場合は confidence を "low" にしてください:
{
  "title": "曲名",
  "artist": "アーティスト名",
  "key": "キー（例: C, Am, G）",
  "bpm": 数値,
  "sections": [
    {
      "label": "Aメロ",
      "chords": ["C", "Am", "F", "G"]
    }
  ],
  "confidence": "high" | "medium" | "low"
}
  `;

  const result = await model.generateContent(prompt);
  // JSON パースしてバリデーション
  // ...
  
  return Response.json({ source: 'ai', ...parsedResult });
}
```

## 重要な注意事項
- API キーは環境変数 `GEMINI_API_KEY` に格納する（Vercel の環境変数設定）
- クライアントサイドから直接 Gemini API を呼ばない
- レートリミットを設ける（1分あたり10リクエスト程度）
- AI 結果には「AIによる推定です。正確でない場合があります」と表示する
- confidence が "low" の場合は警告を強調表示する
- Gemini 2.5 Flash の無料枠: 1日あたり1500リクエスト（2025年1月時点）

## UI表示
- 検索バーはメイン画面上部に配置し、プレースホルダーは「曲名で検索（例: 夜に駆ける）」とする
- 検索結果はモーダルで表示し、セクション（Aメロ / Bメロ / サビ等）ごとにコード進行を表示する
- 「このセクションを取り込む」ボタンを各セクションに配置し、タップすると現在の編集エリアにコードが流し込まれる
- 「全セクションを取り込む」ボタンも用意し、SectionBuilder が有効な場合はセクション構成ごと一括取り込みできる
- ローカルDB由来の結果には ✅ アイコンと「公式データ」ラベルを表示する
- AI由来の結果には 🤖 アイコンと「AI推定（正確でない場合があります）」ラベルを表示する
- confidence が "high" の場合は緑色のバッジ、"medium" は黄色、"low" は赤色で表示する
- 検索履歴を sessionStorage に保持し、直近10件を検索バー下にチップとして表示する
- 検索中はスケルトンローダーを表示する（スピナーではなく）
- スマホでは検索結果モーダルをフルスクリーンのボトムシートで表示する

## エラーハンドリング
- Gemini API がレートリミットに達した場合: 「検索が混み合っています。しばらくしてから再度お試しください」と表示し、リトライボタンを出す
- Gemini API がタイムアウトした場合: 10秒でタイムアウトし、「検索に失敗しました。通信環境を確認してください」と表示する
- JSON パースに失敗した場合: バックエンドで1回リトライ。それでも失敗したら「この曲のコード進行を取得できませんでした」と表示する
- 曲が見つからない場合: 「該当する曲が見つかりませんでした。正式な曲名で再度お試しください」と表示し、類似候補があればサジェストする
- ネットワークエラーの場合: 「インターネット接続を確認してください」と表示する
- 全てのエラーでユーザーが取れるアクション（リトライ、戻る等）を明示する

## 検索の最適化
- クライアント側でデバウンス（300ms）を入れ、タイプ中の連打リクエストを防ぐ
- ローカルDB検索はクライアントサイドでも実行可能にし、ヒットした場合はAPIコールを省略する
- Gemini 結果はサーバー側で24時間キャッシュし、同じ曲名の再検索時にAPIコールを省略する
- ローカルDB検索はタイトルの部分一致に加え、アーティスト名でも検索可能にする
