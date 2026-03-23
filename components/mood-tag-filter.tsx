"use client";

import { useStore } from "@/lib/store";

const TAGS = [
  { label: 'すべて', value: 'ALL' },
  { label: '🔥 エモい', value: 'エモい' },
  { label: '💨 疾走感', value: '疾走感' },
  { label: '🌃 オシャレ', value: 'オシャレ' },
  { label: '💧 切ない', value: '切ない' },
  { label: '☀️ 明るい', value: '明るい' },
  { label: '🌀 中毒性', value: '中毒性' },
  { label: '🌑 ダーク', value: 'ダーク' },
  { label: '🎤 ボカロP', value: 'ボカロP' },
  { label: '🌟 意外性', value: '意外性' }
];

export default function MoodTagFilter() {
  const { activeMoodTags, setMoodTags } = useStore();

  const handleTagClick = (val: string) => {
    if (val === 'ALL') {
      setMoodTags([]);
      return;
    }

    if (activeMoodTags.includes(val)) {
      setMoodTags(activeMoodTags.filter(t => t !== val));
    } else {
      setMoodTags([...activeMoodTags, val]);
    }
  };

  const isAllActive = activeMoodTags.length === 0;

  return (
    <div className="mb-6">
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {TAGS.map((tag) => {
          const isActive = tag.value === 'ALL' ? isAllActive : activeMoodTags.includes(tag.value);
          
          return (
            <button
              key={tag.value}
              onClick={() => handleTagClick(tag.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                isActive
                  ? 'bg-voca-accent-cyan/10 text-voca-accent-cyan border-voca-accent-cyan shadow-glow-cyan'
                  : 'bg-voca-bg-card text-voca-text-sub border-voca-border-subtle hover:bg-voca-bg-section hover:text-voca-text hover:border-voca-accent-cyan'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
