import Header from "@/components/header";
import ClientOnly from "@/components/client-only";
import ChordEditModal from "@/components/chord-edit-modal";
import { FloatingPlayer } from "@/components/floating-player";
import { MainAppContent } from "@/components/main-app-content";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 pb-24 selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <Header />
        
        <ClientOnly>
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
