import { Section, SectionType } from '@/types/music';
import { InstrumentPresetId } from '@/types/audio';
import { SECTION_TYPES } from '@/data/section-types';

export function generateSectionLabel(type: SectionType, existingSections: Section[]): string {
  const baseName = SECTION_TYPES.find(s => s.type === type)?.name || 'セクション';
  const sameTypeSections = existingSections.filter(s => s.type === type);
  if (sameTypeSections.length === 0) return baseName;
  
  if (sameTypeSections.length === 1) return `${baseName} パターン2`;
  return `${baseName} パターン${sameTypeSections.length + 1}`;
}

export function createEmptySection(
  type: SectionType, 
  defaults: { key: string; drumPatternId: string; bassPatternId: string; backingPatternId: string; instrumentPresetId: InstrumentPresetId },
  existingSections: Section[],
  customBars?: number
): Section {
  const typeInfo = SECTION_TYPES.find(s => s.type === type);
  const bars = customBars || typeInfo?.defaultBars || 8;
  const rootNote = defaults.key.split('/')[0] || 'C';

  return {
    id: crypto.randomUUID(),
    type,
    label: generateSectionLabel(type, existingSections),
    chords: Array(bars).fill(rootNote),
    bars,
    drumPatternId: defaults.drumPatternId,
    bassPatternId: defaults.bassPatternId,
    backingPatternId: defaults.backingPatternId,
    instrumentPresetId: defaults.instrumentPresetId,
    repeat: 1
  };
}

export function calculateTotalBars(sections: Section[]): number {
  return sections.reduce((total, section) => total + (section.bars * section.repeat), 0);
}

export function duplicateSectionData(source: Section, existingSections: Section[]): Section {
  const newSectionCount = existingSections.filter(s => s.type === source.type).length;
  const baseName = SECTION_TYPES.find(s => s.type === source.type)?.name || 'セクション';
  const newLabel = `${baseName} パターン${newSectionCount + 1}`;

  return {
    ...source,
    id: crypto.randomUUID(),
    label: newLabel,
    chords: [...source.chords]
  };
}
