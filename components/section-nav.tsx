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

  const handleMenuClick = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuAnchorRect({
      bottom: e.currentTarget.getBoundingClientRect().bottom,
      left: e.currentTarget.getBoundingClientRect().left,
      width: e.currentTarget.getBoundingClientRect().width,
      height: e.currentTarget.getBoundingClientRect().height,
      top: e.currentTarget.getBoundingClientRect().top,
      right: e.currentTarget.getBoundingClientRect().right,
      x: e.currentTarget.getBoundingClientRect().x,
      y: e.currentTarget.getBoundingClientRect().y,
      toJSON: () => {}
    } as DOMRect);
    setMenuSectionId(sectionId);
  };

  const menuSection = sections.find(s => s.id === menuSectionId);

  const handleAddClick = (e: React.MouseEvent) => {
    setAddMenuRect({
      bottom: e.currentTarget.getBoundingClientRect().bottom,
      left: e.currentTarget.getBoundingClientRect().left,
      width: e.currentTarget.getBoundingClientRect().width,
      height: e.currentTarget.getBoundingClientRect().height,
      top: e.currentTarget.getBoundingClientRect().top,
      right: e.currentTarget.getBoundingClientRect().right,
      x: e.currentTarget.getBoundingClientRect().x,
      y: e.currentTarget.getBoundingClientRect().y,
      toJSON: () => {}
    } as DOMRect);
    setShowAddMenu(true);
  };

  return (
    <div className="relative mb-6">
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2 py-1 px-4 md:px-0"
      >
        {sections.map((section, idx) => {
          const isActive = idx === activeSectionIndex;
          const typeInfo = SECTION_TYPES.find(s => s.type === section.type);
          const icon = typeInfo?.icon || '🎵';
          
          return (
            <div 
              key={section.id}
              onClick={() => setActiveSection(idx)}
              onContextMenu={(e) => handleMenuClick(e, section.id)}
              className={`flex-none group relative rounded-lg snap-start cursor-pointer transition-all flex items-center h-10 md:h-12 min-w-[80px] md:min-w-[120px] px-3 md:px-4 select-none
                ${isActive 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-md transform scale-100 z-10' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 transform scale-95 opacity-80 z-0 border border-slate-700/50'
                }
                ${isActive && isPlaying && playbackMode === 'song' ? 'animate-pulse ring-2 ring-pink-400/50' : ''}
              `}
            >
              <span className="text-lg mr-2 drop-shadow-sm">{icon}</span>
              <span className={`text-sm md:text-base truncate font-bold ${isActive ? 'text-white' : ''}`}>
                {section.label}
              </span>

              {/* Action Button inside active tab */}
              {isActive && (
                <button 
                  onClick={(e) => handleMenuClick(e, section.id)}
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
          className="flex-none snap-start ml-2 h-10 md:h-12 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-dashed border-slate-600 flex items-center justify-center transition-all"
        >
          <span className="font-bold mr-1">＋</span>
          <span className="text-sm font-medium hidden md:inline">追加</span>
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
          <div className="absolute inset-0 bg-black/40 md:bg-transparent" onClick={() => setShowAddMenu(false)} />
          <div 
            className="absolute bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-2 w-[240px] max-h-[50vh] overflow-y-auto animate-dropdown"
            style={{
               top: windowWidth < 768 ? 'auto' : addMenuRect.bottom + 8,
               left: windowWidth < 768 ? 'auto' : Math.min(addMenuRect.left, windowWidth - 250),
               bottom: windowWidth < 768 ? 20 : 'auto',
               right: windowWidth < 768 ? Math.max(20, windowWidth - addMenuRect.right) : 'auto'
            }}
          >
            <div className="text-xs font-bold text-slate-400 px-3 py-2 mb-1 border-b border-slate-700">セクション追加</div>
            {SECTION_TYPES.filter(type => type.type !== 'verse1-v2' && type.type !== 'verse2-v2' && type.type !== 'chorus-v2').map(type => (
              <button
                key={type.type}
                onClick={() => {
                  addSection(type.type);
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded-lg flex items-center gap-2"
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
                <span className="text-xs text-slate-500 ml-auto">{type.defaultBars}小節</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
