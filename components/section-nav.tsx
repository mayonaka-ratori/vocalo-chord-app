'use client';

import { useStore } from '@/lib/store';
import { SECTION_TYPES } from '@/data/section-types';
import { useEffect, useRef, useState } from 'react';
import { SectionActionMenu } from './section-action-menu';

export function SectionNav() {
  const { sections, activeSectionIndex, setActiveSection, addSection, isPlaying, playbackMode } = useStore();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [menuSectionId, setMenuSectionId] = useState<string | null>(null);
  const [menuAnchorRect, setMenuAnchorRect] = useState<DOMRect | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuRect, setAddMenuRect] = useState<DOMRect | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to active tab
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeTab = scrollContainerRef.current.children[activeSectionIndex] as HTMLElement;
      if (activeTab) {
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const scrollPosition = activeTab.offsetLeft - (containerWidth / 2) + (activeTab.offsetWidth / 2);
        scrollContainerRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [activeSectionIndex, sections.length]);

  const getAnchorRect = (el: EventTarget & Element): DOMRect =>
    el.getBoundingClientRect();

  const handleMenuClick = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuAnchorRect(getAnchorRect(e.currentTarget));
    setMenuSectionId(sectionId);
  };

  const menuSection = sections.find(s => s.id === menuSectionId);

  const handleAddClick = (e: React.MouseEvent) => {
    setAddMenuRect(getAnchorRect(e.currentTarget));
    setShowAddMenu(true);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % sections.length;
      setActiveSection(next);
      const tabs = scrollContainerRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
      tabs?.[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + sections.length) % sections.length;
      setActiveSection(prev);
      const tabs = scrollContainerRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
      tabs?.[prev]?.focus();
    }
  };

  return (
    <div className="relative mb-6">
      <div
        ref={scrollContainerRef}
        role="tablist"
        aria-label="セクション"
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2 py-1 px-4 md:px-0"
      >
        {sections.map((section, idx) => {
          const isActive = idx === activeSectionIndex;
          const typeInfo = SECTION_TYPES.find(s => s.type === section.type);
          const icon = typeInfo?.icon || '🎵';

          return (
            <div
              key={section.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveSection(idx)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              onContextMenu={(e) => handleMenuClick(e, section.id)}
              className={`flex-none group relative rounded-xl snap-start cursor-pointer transition-all flex items-center h-10 md:h-12 min-w-[80px] md:min-w-[120px] px-3 md:px-4 select-none border-2
                ${isActive
                  ? 'bg-gradient-hero border-white/20 shadow-glow-purple scale-100 z-10'
                  : 'bg-voca-bg-card text-voca-text-muted border-voca-border-subtle hover:bg-voca-bg-section hover:border-voca-text-sub scale-95 opacity-80 z-0'
                }
                ${isActive && isPlaying && playbackMode === 'song' ? 'animate-pulse' : ''}
              `}
            >
              <span className="text-lg mr-2 drop-shadow-sm">{icon}</span>
              <span className={`text-sm md:text-base truncate font-bold ${isActive ? 'text-white' : ''}`}>
                {section.label}
              </span>

              {/* Action Button inside active tab */}
              {isActive && (
                <button
                  type="button"
                  onClick={(e) => handleMenuClick(e, section.id)}
                  aria-label="セクションメニュー"
                  className="ml-auto flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors -mr-1 text-white opacity-80 hover:opacity-100"
                >
                  <span className="mb-2">...</span>
                </button>
              )}
            </div>
          );
        })}

        {/* Add Section Button */}
        <button 
          onClick={handleAddClick}
          className="flex-none snap-start ml-2 h-10 md:h-12 px-5 rounded-xl bg-voca-bg-elevated border-2 border-dashed border-voca-border-subtle text-voca-text-muted hover:text-voca-text hover:bg-voca-bg-section hover:border-voca-text-sub transition-all flex items-center justify-center font-black"
        >
          <span className="text-lg mr-1.5">＋</span>
          <span className="text-[11px] uppercase tracking-widest hidden md:inline">ADD</span>
        </button>
      </div>

      {menuSection && (
        <SectionActionMenu 
          section={menuSection} 
          onClose={() => setMenuSectionId(null)} 
          anchorRect={menuAnchorRect}
        />
      )}

      {showAddMenu && addMenuRect && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-voca-bg/60 backdrop-blur-sm md:bg-transparent" onClick={() => setShowAddMenu(false)} />
          <div 
            className="absolute bg-voca-bg-card border border-voca-border-subtle rounded-2xl shadow-2xl p-2 w-[240px] max-h-[60vh] overflow-y-auto animate-dropdown z-50 ring-1 ring-white/10"
            style={{
               top: windowWidth < 768 ? 'auto' : addMenuRect.bottom + 12,
               left: windowWidth < 768 ? 'auto' : Math.min(addMenuRect.left, windowWidth - 260),
               bottom: windowWidth < 768 ? 24 : 'auto',
               right: windowWidth < 768 ? Math.max(20, windowWidth - addMenuRect.right) : 'auto'
            }}
          >
            <div className="text-[10px] font-black text-voca-text-muted px-4 py-3 mb-1 border-b border-voca-border-subtle uppercase tracking-widest">Select Section</div>
            {SECTION_TYPES.filter(type => type.type !== 'verse1-v2' && type.type !== 'verse2-v2' && type.type !== 'chorus-v2').map(type => (
              <button
                key={type.type}
                onClick={() => {
                  addSection(type.type);
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-voca-text hover:bg-voca-bg-section rounded-lg flex items-center gap-2"
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
                <span className="text-xs text-voca-text-muted ml-auto">{type.defaultBars}小節</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
