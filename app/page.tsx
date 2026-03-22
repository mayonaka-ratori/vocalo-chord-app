import Header from "@/components/header";
import ClientOnly from "@/components/client-only";
import KeyTempoSelector from "@/components/key-tempo-selector";
import MoodTagFilter from "@/components/mood-tag-filter";
import PresetGrid from "@/components/preset-grid";
import ChordTimeline from "@/components/chord-timeline";
import ChordEditModal from "@/components/chord-edit-modal";
import { SongSearchBar } from "@/components/song-search-bar";
import { RhythmSelector } from "@/components/rhythm-selector";
import { TransportControls } from "@/components/transport-controls";
import { FloatingPlayer } from "@/components/floating-player";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 pb-24 selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <Header />
        
        <ClientOnly>
          <SongSearchBar />
          <KeyTempoSelector />
          <MoodTagFilter />
          <PresetGrid />
          <ChordTimeline />
          <RhythmSelector />
          <TransportControls />
        </ClientOnly>
      </div>

      <ClientOnly>
        <FloatingPlayer />
        <ChordEditModal />
      </ClientOnly>
    </main>
  );
}
