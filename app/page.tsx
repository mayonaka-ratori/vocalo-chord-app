"use client";

import dynamic from 'next/dynamic';
import Header from "@/components/header";
import ClientOnly from "@/components/client-only";
import { CategoryTabs } from "@/components/category-tabs";

const InstrumentLoadProgress = dynamic(
  () => import("@/components/instrument-load-progress").then(mod => mod.InstrumentLoadProgress),
  { ssr: false }
);

const InstrumentSelector = dynamic(
  () => import("@/components/instrument-selector").then(mod => mod.InstrumentSelector),
  { ssr: false }
);

const MainAppContent = dynamic(
  () => import("@/components/main-app-content").then(mod => mod.MainAppContent),
  { ssr: false }
);

const FloatingPlayer = dynamic(
  () => import("@/components/floating-player").then(mod => mod.FloatingPlayer),
  { ssr: false }
);

const ChordEditModal = dynamic(
  () => import("@/components/chord-edit-modal"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-voca-bg pb-24 selection:bg-voca-accent-purple/30">
      <Header />
      <InstrumentLoadProgress />

      
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        <ClientOnly>
          <CategoryTabs />
          <InstrumentSelector />
          <MainAppContent />
        </ClientOnly>
      </div>

      <ClientOnly>
        <FloatingPlayer />
        <ChordEditModal />
      </ClientOnly>
    </main>
  );
}
