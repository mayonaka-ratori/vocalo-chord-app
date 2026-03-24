"use client";
import React, { useRef } from 'react';
import { useStore } from '@/lib/store';

const CATEGORIES = [
  { id: null, label: 'すべて' },
  { id: 'standard', label: '定番' },
  { id: 'citypop', label: 'City Pop' },
  { id: 'vocaloid', label: 'ボカロ' },
  { id: 'recent-hit', label: '最近のヒット' },
];

export function CategoryTabs() {
  const { categoryFilter, setCategoryFilter } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide md:justify-center"
      >
        {CATEGORIES.map((cat) => {
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id ?? 'all'}
              onClick={() => setCategoryFilter(cat.id)}
              className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-hero text-white font-bold shadow-glow-cyan' 
                  : 'bg-voca-bg-card text-voca-text-sub hover:text-voca-text hover:bg-voca-bg-section border border-voca-border-subtle'
                }
              `}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
