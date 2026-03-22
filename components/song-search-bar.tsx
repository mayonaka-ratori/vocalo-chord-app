"use client";
import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { famousSongs } from '@/data/famous-songs';
import { SongSearchResult, SearchChordsResponse } from '@/types/music';

const SEARCH_HISTORY_KEY = 'vocalo-search-history';

export const SongSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SongSearchResult | null>(null);
  
  // AI検索関連のState
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const { setKey, setTempo } = useStore();

  // 履歴の初期読み込み
  useEffect(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  // 検索ロジック (Local -> AI)
  useEffect(() => {
    const handler = setTimeout(async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length === 0) {
        setResults([]);
        setIsOpen(false);
        setIsAiLoading(false);
        setAiError(null);
        return;
      }

      setAiError(null);
      const q = trimmedQuery.toLowerCase();
      
      // Step 1: ローカル検索
      const localMatches: SongSearchResult[] = famousSongs.filter(s => {
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
        confidence: 'high' as const,
        source: 'local' as const
      }));

      if (localMatches.length > 0) {
        setResults(localMatches);
        setIsOpen(true);
        setIsAiLoading(false);
      } else {
        // Step 2: AI検索フォールバック
        setResults([]);
        setIsOpen(true);
        setIsAiLoading(true);

        try {
          const response = await fetch('/api/search-chords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: trimmedQuery })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "検索に失敗しました");
          }

          const data: SearchChordsResponse = await response.json();
          setResults(data.results);
          
          // 履歴に追加
          if (data.results.length > 0) {
            const newHistory = [trimmedQuery, ...searchHistory.filter(h => h !== trimmedQuery)].slice(0, 10);
            setSearchHistory(newHistory);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "検索に失敗しました";
          setAiError(errorMessage);
        } finally {
          setIsAiLoading(false);
        }
      }
    }, 500); // 少し長めにデバウンス

    return () => clearTimeout(handler);
  }, [query, searchHistory]);

  const handleApplySection = (chords: string[], key: string, bpm: number) => {
    setKey(key);
    setTempo(bpm);
    useStore.setState({ chords, selectedPresetId: null });
    setIsOpen(false);
    setSelectedResult(null);
    setQuery('');
  };

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'high': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="relative w-full md:max-w-lg md:mx-auto">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="曲名で検索（例: 夜に駆ける）"
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
        />
      </div>

      {/* 検索履歴チップ */}
      {!isOpen && query === '' && searchHistory.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {searchHistory.map((h, i) => (
            <button
              key={i}
              onClick={() => setQuery(h)}
              className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* 検索結果ドロップダウン */}
      {isOpen && !selectedResult && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 max-h-96 overflow-y-auto">
          {isAiLoading && (
            <div className="p-8 space-y-4">
              <div className="flex items-center space-x-3 text-orange-400 animate-pulse">
                <span className="text-xl">🤖</span>
                <span className="font-bold">AIで検索中...</span>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          )}

          {aiError && (
            <div className="p-6 text-center">
              <p className="text-red-400 text-sm mb-3">❌ {aiError}</p>
              <button 
                onClick={() => setQuery(query)} // 再試行
                className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                再試行
              </button>
            </div>
          )}

          {!isAiLoading && !aiError && results.length === 0 && query.length > 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              曲が見つかりませんでした
            </div>
          )}

          {!isAiLoading && results.map((res, i) => (
            <div key={i} className="p-4 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-100 flex items-center space-x-2 flex-wrap gap-y-1">
                    <span>{res.title}</span>
                    {res.source === 'local' ? (
                      <span className="text-green-400 text-[10px] px-1.5 py-0.5 bg-green-400/10 rounded-full border border-green-400/20 whitespace-nowrap">✅ DB</span>
                    ) : (
                      <span className="text-orange-400 text-[10px] px-1.5 py-0.5 bg-orange-400/10 rounded-full border border-orange-400/20 whitespace-nowrap">🤖 AI推定</span>
                    )}
                    {res.source === 'ai' && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-black whitespace-nowrap ${getConfidenceColor(res.confidence)}`}>
                        {res.confidence === 'high' ? '精度:高' : res.confidence === 'medium' ? '精度:中' : '精度:低'}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{res.artist} • Key: {res.key} • BPM: {res.bpm}</p>
                </div>
                <button
                  onClick={() => setSelectedResult(res)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sm font-bold text-orange-400 border border-orange-500/30 rounded-lg transition-colors shrink-0 ml-4"
                >
                  取り込む
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedResult && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-100 flex items-center space-x-2">
              <span>{selectedResult.title}</span>
              <span className="text-xs font-normal text-slate-400">のセクション</span>
            </h4>
            <button 
              onClick={() => setSelectedResult(null)}
              className="text-slate-400 text-sm hover:text-slate-200 bg-slate-800 px-3 py-1 rounded-lg"
            >
              戻る
            </button>
          </div>
          
          {selectedResult.source === 'ai' && (
            <div className="mb-4 p-2 bg-orange-950/20 border border-orange-900/40 rounded text-[10px] text-orange-300">
              ⚠️ AIによる推定値です。正確でない場合があります。
              {selectedResult.confidence === 'low' && (
                <div className="font-black mt-1 text-red-400">※この曲のコード進行はAIの自信が低いため、間違っている可能性が高いです。</div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {selectedResult.sections.map((sec, i) => (
              <button
                key={i}
                onClick={() => handleApplySection(sec.chords, selectedResult.key, selectedResult.bpm)}
                className="w-full text-left p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-orange-500 transition-all text-sm group"
              >
                <div className="font-bold text-slate-200 mb-2 group-hover:text-orange-400 transition-colors">
                  {sec.label}
                  <span className="ml-2 text-[10px] font-normal text-slate-500">({sec.chords.length}小節)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sec.chords.map((c, idx) => (
                    <span key={idx} className="bg-slate-900 px-2 py-1 rounded-md text-slate-300 font-medium font-mono text-xs border border-slate-700/50">
                      {c}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
