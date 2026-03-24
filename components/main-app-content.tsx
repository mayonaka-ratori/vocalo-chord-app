'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import KeyTempoSelector from "@/components/key-tempo-selector";
import MoodTagFilter from "@/components/mood-tag-filter";
import PresetGrid from "@/components/preset-grid";
import ChordTimeline from "@/components/chord-timeline";
import { SongSearchBar } from "@/components/song-search-bar";
import { RhythmSelector } from "@/components/rhythm-selector";
import { TransportControls } from "@/components/transport-controls";
import { SectionNav } from "@/components/section-nav";
import { SectionOverview } from "@/components/section-overview";
import { StructureTemplatePicker } from "@/components/structure-template-picker";
import { CategoryTabs } from "@/components/category-tabs";

const VariationPanel = dynamic(
  () => import("@/components/variation-panel").then(mod => mod.VariationPanel),
  { ssr: false }
);

const InstrumentLoadProgress = dynamic(
  () => import("@/components/instrument-load-progress").then(mod => mod.InstrumentLoadProgress),
  { ssr: false }
);

const InstrumentSelector = dynamic(
  () => import("@/components/instrument-selector").then(mod => mod.InstrumentSelector),
  { ssr: false }
);

const MelodyGuidePanel = dynamic(
  () => import("@/components/melody-guide-panel").then(mod => mod.MelodyGuidePanel),
  { ssr: false }
);

export function MainAppContent() {
  const { isStructureMode, disableStructureMode, showMelodyGuide } = useStore();
  const [showPicker, setShowPicker] = useState(false);

  const handleDisableStructureMode = () => {
    if (window.confirm('シンプルモードに戻りますか？\n現在のセクション構成は失われます（表示中のコード進行のみ残ります）。')) {
      disableStructureMode();
    }
  };

  if (isStructureMode) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1"><SongSearchBar /></div>
          <div className="md:w-64"><KeyTempoSelector /></div>
        </div>

        <InstrumentSelector />
        <InstrumentLoadProgress />
        <TransportControls />
        <CategoryTabs />

        <SectionOverview />
        <SectionNav />

        {/* Desktop: 2-column layout, Mobile: Stack */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-5/12 space-y-6">
            <MoodTagFilter />
            <PresetGrid />
          </div>
          <div className="lg:w-7/12">
            <ChordTimeline />
            <VariationPanel />
            {showMelodyGuide && <MelodyGuidePanel />}
          </div>
        </div>

        <RhythmSelector />

        <div className="flex justify-center pt-8 border-t border-voca-border-subtle">
          <button 
            onClick={handleDisableStructureMode}
            className="text-sm font-bold text-voca-text-muted hover:text-voca-semantic-error transition-colors"
          >
            📝 シンプルモードに戻る (構成を破棄)
          </button>
        </div>
      </div>
    );
  }

  // Flat mode (Default)
  return (
    <div className="space-y-5">
      <SongSearchBar />
      <KeyTempoSelector />

      <InstrumentSelector />
      <InstrumentLoadProgress />

      <ChordTimeline />
      <VariationPanel />

      <TransportControls />

      <CategoryTabs />
      <MoodTagFilter />
      <PresetGrid />

      <div className="flex justify-center my-8">
        <button 
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-8 py-4 bg-voca-accent-cyan hover:bg-voca-accent-cyan/90 text-voca-bg rounded-2xl font-black shadow-lg shadow-voca-accent-cyan/20 active:scale-95 transition-all text-lg"
        >
          <span>🏗️</span> 曲の構成を作る
        </button>
      </div>

      {showMelodyGuide && <MelodyGuidePanel />}
      <RhythmSelector />

      {showPicker && (
        <StructureTemplatePicker onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
