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

  const { setKey, setTempo, categoryFilter } = useStore();

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
        // カテゴリフィルタ適用
        if (categoryFilter && s.category !== categoryFilter) return false;

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
        source: 'local' as const,
        category: s.category // 追加
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

          // 履歴に追加（関数型更新で依存配列に searchHistory を含めない）
          if (data.results.length > 0) {
            setSearchHistory(prev => {
              const newHistory = [trimmedQuery, ...prev.filter(h => h !== trimmedQuery)].slice(0, 10);
              localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
              return newHistory;
            });
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
  }, [query, categoryFilter]);

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
      case 'high': return 'text-voca-semantic-success bg-voca-semantic-success/10 border-voca-semantic-success/20';
      case 'medium': return 'text-voca-semantic-warning bg-voca-semantic-warning/10 border-voca-semantic-warning/20';
      case 'low': return 'text-voca-semantic-error bg-voca-semantic-error/10 border-voca-semantic-error/20';
      default: return 'text-voca-text-muted bg-voca-bg-card border-voca-border-subtle';
    }
  };

  const getCategoryBadgeStyle = (category?: string) => {
    switch (category) {
      case 'citypop': return 'bg-voca-accent-cyan/20 text-voca-accent-cyan';
      case 'vocaloid': return 'bg-voca-accent-purple/20 text-voca-accent-purple';
      case 'recent-hit': return 'bg-voca-accent-magenta/20 text-voca-accent-magenta';
      case 'vocaloP-artist': return 'bg-gradient-card text-white shadow-sm';
      default: return 'bg-voca-bg-elevated text-voca-text-muted';
    }
  };

  return (
    <div className="relative w-full md:max-w-xl md:mx-auto">
      <div className="relative group">
        <span className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-colors duration-200 ${query ? 'text-voca-accent-cyan' : 'text-voca-text-sub group-focus-within:text-voca-accent-cyan'}`}>
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="曲名で検索（例: 夜に駆ける）"
          className="w-full pl-11 pr-4 py-3 bg-voca-bg-card border border-voca-border-subtle rounded-2xl text-voca-text placeholder-voca-text-muted focus:outline-none focus:border-voca-accent-cyan focus:ring-1 focus:ring-voca-accent-cyan/30 transition-all shadow-glow-cyan/0 focus:shadow-glow-cyan"
        />
      </div>

      {/* 検索履歴チップ */}
      {!isOpen && query === '' && searchHistory.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchHistory.map((h, i) => (
            <button
              key={i}
              onClick={() => setQuery(h)}
              className="px-3 py-1 text-[11px] bg-voca-bg-card text-voca-text-sub rounded-full hover:bg-voca-bg-section border border-voca-border-subtle transition-colors cursor-pointer"
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* 検索結果ドロップダウン */}
      {isOpen && !selectedResult && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-voca-bg-elevated border border-voca-border-subtle rounded-2xl shadow-2xl z-40 max-h-96 overflow-y-auto">
          {isAiLoading && (
            <div className="p-10 space-y-4">
              <div className="flex items-center space-x-3 text-voca-accent-cyan animate-pulse">
                <span className="text-2xl">🤖</span>
                <span className="font-bold tracking-tight">AIで高度な解析中...</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-voca-bg-section rounded-full w-3/4 animate-pulse"></div>
                <div className="h-3 bg-voca-bg-section rounded-full w-1/2 animate-pulse"></div>
              </div>
            </div>
          )}

          {aiError && (
            <div className="p-8 text-center">
              <p className="text-voca-semantic-error text-sm mb-4">❌ {aiError}</p>
              <button 
                onClick={() => setQuery(query)} // 再試行
                className="px-5 py-2 bg-voca-bg-card border border-voca-border-subtle rounded-xl text-xs font-bold text-voca-text hover:bg-voca-bg-section transition-colors"
              >
                再試行
              </button>
            </div>
          )}

          {!isAiLoading && !aiError && results.length === 0 && query.length > 0 && (
            <div className="p-10 text-center text-voca-text-muted text-sm italic">
              該当する楽曲が見つかりませんでした
            </div>
          )}

          {!isAiLoading && results.map((res, i) => (
            <div key={i} className="relative group/item p-4 border-b border-voca-border-subtle/30 last:border-b-0 hover:bg-voca-bg-section transition-colors">
              {/* ボカコレ風の左側グラデーションバー */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-card opacity-0 group-hover/item:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h4 className="font-bold text-voca-text truncate">{res.title}</h4>
                    {res.category && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getCategoryBadgeStyle(res.category)}`}>
                        {res.category === 'vocaloP-artist' ? 'VOCALO P' : res.category}
                      </span>
                    )}
                    {res.source === 'local' ? (
                      <span className="text-[9px] px-1.5 py-0.5 bg-voca-accent-cyan/10 text-voca-accent-cyan rounded border border-voca-accent-cyan/20">DB</span>
                    ) : (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getConfidenceColor(res.confidence || 'medium')}`}>AI</span>
                    )}
                  </div>
                  <p className="text-xs text-voca-text-sub truncate">
                    {res.artist} <span className="mx-1 opacity-30">•</span> Key: {res.key} <span className="mx-1 opacity-30">•</span> BPM: {res.bpm}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResult(res)}
                  className="px-4 py-2 bg-voca-bg-card hover:bg-voca-accent-cyan hover:text-voca-bg text-xs font-black text-voca-accent-cyan border border-voca-accent-cyan/30 rounded-xl transition-all shadow-sm shrink-0"
                >
                  取り込む
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedResult && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-voca-bg-elevated border border-voca-border-subtle rounded-2xl shadow-2xl z-40 p-5">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-bold text-voca-text flex items-center space-x-2">
              <span className="text-gradient-hero">{selectedResult.title}</span>
              <span className="text-[10px] font-normal text-voca-text-sub uppercase tracking-widest">SECTIONS</span>
            </h4>
            <button 
              onClick={() => setSelectedResult(null)}
              className="text-voca-text-sub text-xs hover:text-voca-text bg-voca-bg-card px-3 py-1.5 rounded-lg border border-voca-border-subtle"
            >
              戻る
            </button>
          </div>
          
          {selectedResult.source === 'ai' && (
            <div className="mb-5 p-3 bg-voca-semantic-warning/5 border border-voca-semantic-warning/20 rounded-xl text-[10px] text-voca-semantic-warning leading-relaxed flex gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p>AIによる推定値です。実際の楽曲構成と異なる場合があります。</p>
                {selectedResult.confidence === 'low' && (
                  <p className="font-black mt-1 text-voca-semantic-error">精度が低いため、手動調整を強く推奨します。</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {selectedResult.sections.map((sec, i) => (
              <button
                key={i}
                onClick={() => handleApplySection(sec.chords, selectedResult.key, selectedResult.bpm)}
                className="w-full text-left p-4 rounded-xl border border-voca-border-subtle bg-voca-bg-card hover:bg-voca-bg-section hover:border-voca-accent-cyan transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold text-voca-text group-hover:text-voca-accent-cyan transition-colors">
                    {sec.label}
                  </div>
                  <div className="text-[10px] font-mono text-voca-text-muted">
                    {sec.chords.length} Bars
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sec.chords.map((c, idx) => (
                    <span key={idx} className="bg-voca-bg-section px-2 py-1 rounded text-voca-text-sub font-mono text-[11px] border border-voca-border-subtle/50 group-hover:bg-voca-bg group-hover:text-voca-text group-hover:border-voca-accent-cyan/30">
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
