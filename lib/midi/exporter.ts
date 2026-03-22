/**
 * MIDI Export module
 * Converts the current AppState into a 3-track MIDI file (Chords / Bass / Drums)
 * using midi-writer-js.
 */
// @ts-expect-error - Library has broken type resolution for Next.js bundler mode in package.json exports
import MidiWriter from 'midi-writer-js';

import { getChordNotes, getNoteIndex, NOTES_SHARP } from '@/lib/music/chords';
import { drumPatterns } from '@/data/drum-patterns';
import { bassPatterns } from '@/data/bass-patterns';
import { AppState } from '@/lib/store';
import { BassPatternStep, DrumPatternStep } from '@/types/audio';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** MIDI note number for C4 (Middle C). */

/** Octave offset to produce octave 4 voicing (C4 = 60, C2 = 36). */
const CHORD_OCTAVE = 4;
const BASS_OCTAVE = 2;

/** General MIDI drum note numbers (channel 10). */
const DRUM_KICK = 36;  // C2
const DRUM_SNARE = 38; // D2
const DRUM_HIHAT_CLOSED = 42; // F#2
const DRUM_HIHAT_OPEN = 46;   // A#2

/** Duration strings understood by midi-writer-js. */
const DUR_WHOLE = '1';     // 全音符
const DUR_HALF = '2';      // 2分音符
const DUR_QUARTER = '4';   // 4分音符
const DUR_8TH = '8';       // 8分音符
const DUR_16TH = '16';     // 16分音符

/** Number of bars to output (4 bars × 2 loops = 8). */
const TOTAL_LOOPS = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns MIDI note strings for a named chord voiced in the given octave,
 * formatted as 'C4', 'E4', 'G4' etc. (as expected by midi-writer-js).
 * @param chordName - Chord name e.g. 'Cmaj7', 'Am', 'F#m7'
 * @param octave - Target octave (default 4 for chords)
 * @returns Array of pitch strings like ['C4', 'E4', 'G4']
 */
function chordToMidiPitches(chordName: string, octave: number = CHORD_OCTAVE): string[] {
  const notes = getChordNotes(chordName);
  return notes.map(n => {
    const noteIndex = getNoteIndex(n);
    // Ensure notes stay close together (close voicing within one octave)
    const sharpNote = NOTES_SHARP[noteIndex];
    return `${sharpNote}${octave}`;
  });
}

/**
 * Returns the root note MIDI pitch string for a chord, used in bass track.
 * @param chordName - Chord name
 * @param octave - Target octave (default 2 for bass)
 * @returns Pitch string like 'C2'
 */
function chordRootPitch(chordName: string, octave: number = BASS_OCTAVE): string {
  const notes = getChordNotes(chordName);
  if (notes.length === 0) return `C${octave}`;
  const rootIndex = getNoteIndex(notes[0]);
  const sharpNote = NOTES_SHARP[rootIndex];
  return `${sharpNote}${octave}`;
}

/**
 * Returns the octave-up root pitch for a chord (used in bass OCT steps).
 * @param chordName - Chord name
 * @param octave - Base octave
 * @returns Pitch string like 'C3'
 */
function chordRootOctavePitch(chordName: string, octave: number = BASS_OCTAVE): string {
  return chordRootPitch(chordName, octave + 1);
}

/**
 * Maps a BassPatternStep duration string to a midi-writer-js duration string.
 */
function bassStepDuration(duration: BassPatternStep['duration']): string {
  switch (duration) {
    case '16n': return DUR_16TH;
    case '8n':  return DUR_8TH;
    case '4n':  return DUR_QUARTER;
    case '2n':  return DUR_HALF;
    case '1m':  return DUR_WHOLE;
    default:    return DUR_QUARTER;
  }
}

// ---------------------------------------------------------------------------
// Track builders
// ---------------------------------------------------------------------------

/**
 * Builds the Chord track (Piano – GM program 0).
 * Each chord occupies one whole note bar, looped TOTAL_LOOPS times.
 * @param chords - Array of chord names
 * @param tempo - BPM
 * @returns Configured MidiWriter Track
 */
function buildChordTrack(chords: string[], tempo: number): InstanceType<typeof MidiWriter.Track> {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);
  track.addTrackName('Chords');

  // GM program 0: Acoustic Grand Piano
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 0 }));

  for (let loop = 0; loop < TOTAL_LOOPS; loop++) {
    for (const chord of chords) {
      const pitches = chordToMidiPitches(chord, CHORD_OCTAVE);
      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: pitches,
          duration: DUR_WHOLE,
          velocity: 80,
        })
      );
    }
  }

  return track;
}

/**
 * Builds the Bass track (Acoustic Bass – GM program 32).
 * Each chord bar is filled by the selected bass pattern's steps.
 * @param chords - Array of chord names
 * @param bassPatternId - ID of the selected bass pattern
 * @param tempo - BPM
 * @returns Configured MidiWriter Track
 */
function buildBassTrack(
  chords: string[],
  bassPatternId: string,
  tempo: number
): InstanceType<typeof MidiWriter.Track> {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);
  track.addTrackName('Bass');

  // GM program 32: Acoustic Bass
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 32 }));

  const pattern = bassPatterns.find(p => p.id === bassPatternId) ?? bassPatterns[0];

  for (let loop = 0; loop < TOTAL_LOOPS; loop++) {
    for (const chord of chords) {
      const rootPitch = chordRootPitch(chord, BASS_OCTAVE);
      const octPitch = chordRootOctavePitch(chord, BASS_OCTAVE);

      for (const step of pattern.steps) {
        if (step.type === 'REST') {
          // Add a rest by inserting a note with wait equal to its duration
          track.addEvent(
            new MidiWriter.NoteEvent({
              pitch: [rootPitch],
              duration: bassStepDuration(step.duration),
              velocity: 0,
              wait: bassStepDuration(step.duration),
            })
          );
        } else {
          const pitch = step.type === 'OCT' ? octPitch : rootPitch;
          track.addEvent(
            new MidiWriter.NoteEvent({
              pitch: [pitch],
              duration: bassStepDuration(step.duration),
              velocity: 90,
            })
          );
        }
      }
    }
  }

  return track;
}

/**
 * Builds one bar of drum events from a DrumPatternStep array.
 * MIDI channel 10 (1-based = 10, but midi-writer-js uses 0-based channel 9 internally).
 * We encode kicks/snares/hihats as separate NoteEvents in the same track.
 * Steps are assumed to be 16th-note grid.
 * @param steps - 16-step drum grid
 * @returns Array of NoteEvents
 */
function buildDrumBarEvents(steps: DrumPatternStep[]): InstanceType<typeof MidiWriter.NoteEvent>[] {
  const events: InstanceType<typeof MidiWriter.NoteEvent>[] = [];

  for (const step of steps) {
    const activeDrums: number[] = [];
    if (step.kick) activeDrums.push(DRUM_KICK);
    if (step.snare) activeDrums.push(DRUM_SNARE);
    if (step.hihatOpen) activeDrums.push(DRUM_HIHAT_OPEN);
    else if (step.hihatClosed) activeDrums.push(DRUM_HIHAT_CLOSED);

    if (activeDrums.length > 0) {
      events.push(
        new MidiWriter.NoteEvent({
          pitch: activeDrums,
          duration: DUR_16TH,
          channel: 10, // GM Percussion channel
          velocity: 100,
        })
      );
    } else {
      // Silent 16th-note rest to maintain timing
      events.push(
        new MidiWriter.NoteEvent({
          pitch: [DRUM_KICK],
          duration: DUR_16TH,
          channel: 10,
          velocity: 0,
          wait: DUR_16TH,
        })
      );
    }
  }

  return events;
}

/**
 * Builds the Drum track (Channel 10).
 * Each chord bar plays the drum pattern once (loops TOTAL_LOOPS × chords.length times).
 * @param chordsCount - Number of chords (bars per loop)
 * @param drumPatternId - ID of the selected drum pattern
 * @param tempo - BPM
 * @returns Configured MidiWriter Track
 */
function buildDrumTrack(
  chordsCount: number,
  drumPatternId: string,
  tempo: number
): InstanceType<typeof MidiWriter.Track> {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);
  track.addTrackName('Drums');

  const pattern = drumPatterns.find(p => p.id === drumPatternId) ?? drumPatterns[0];
  const totalBars = chordsCount * TOTAL_LOOPS;

  for (let bar = 0; bar < totalBars; bar++) {
    const barEvents = buildDrumBarEvents(pattern.steps);
    track.addEvent(barEvents);
  }

  return track;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Exports the current application state as a MIDI file Blob.
 * Creates 3 tracks:
 *   - Track 1 "Chords": Piano (GM 0), whole notes per bar
 *   - Track 2 "Bass": Acoustic Bass (GM 32), bass pattern per bar
 *   - Track 3 "Drums": Channel 10, drum pattern per bar
 * Total length: 8 bars (chords array × 2 loops).
 *
 * @param state - The current Zustand AppState
 * @returns Blob of type 'audio/midi'
 */
export function exportToMidi(state: Pick<AppState, 'chords' | 'tempo' | 'drumPatternId' | 'bassPatternId'>): Blob {
  const { chords, tempo, drumPatternId, bassPatternId } = state;

  const chordTrack = buildChordTrack(chords, tempo);
  const bassTrack = buildBassTrack(chords, bassPatternId, tempo);
  const drumTrack = buildDrumTrack(chords.length, drumPatternId, tempo);

  const writer = new MidiWriter.Writer([chordTrack, bassTrack, drumTrack]);
  const uint8 = writer.buildFile();
  // Copy to a plain ArrayBuffer to satisfy strict Blob typings
  const buffer = uint8.buffer.slice(
    uint8.byteOffset,
    uint8.byteOffset + uint8.byteLength
  ) as ArrayBuffer;

  return new Blob([buffer], { type: 'audio/midi' });
}
