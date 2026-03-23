import Header from "@/components/header";
import ClientOnly from "@/components/client-only";
import ChordEditModal from "@/components/chord-edit-modal";
import { FloatingPlayer } from "@/components/floating-player";
import { MainAppContent } from "@/components/main-app-content";
import { CategoryTabs } from "@/components/category-tabs";

export default function Home() {
  return (
    <main className="min-h-screen bg-voca-bg pb-24 selection:bg-voca-accent-purple/30">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        <ClientOnly>
          <CategoryTabs />
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
