---
name: midi-export
description: midi-writer-js を使ったMIDIファイル書き出し機能を実装する。ユーザーがコード進行やバッキングパターンをDAW用にエクスポートする機能を作る際に使用する。
---

# MIDI書き出しスキル

## 目的
midi-writer-js を使って、現在のコード進行・ベース・ドラムをMIDIファイルとして書き出す機能を実装する。

## ライブラリ
```bash
npm install midi-writer-js
```

## 基本パターン
```typescript
import MidiWriter from 'midi-writer-js';

function exportMidi(chords: string[], bpm: number) {
  // コードトラック
  const chordTrack = new MidiWriter.Track();
  chordTrack.setTempo(bpm);
  
  for (const chord of chords) {
    const notes = chordToMidiNotes(chord); // C4, E4, G4 等
    chordTrack.addEvent(
      new MidiWriter.NoteEvent({
        pitch: notes,
        duration: '1',  // 全音符 = 1小節
      })
    );
  }

  // ベーストラック（別トラック）
  const bassTrack = new MidiWriter.Track();
  // ...

  // ドラムトラック（チャンネル10）
  const drumTrack = new MidiWriter.Track();
  // ...

  const writer = new MidiWriter.Writer([chordTrack, bassTrack, drumTrack]);
  
  // Blob として書き出し
  const blob = new Blob([writer.buildFile()], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  // ダウンロードリンクを作成
}
```

## MIDIノート番号対応
C4 = 60, D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, B4 = 71

## ドラムマッピング (General MIDI)
キック = 36, スネア = 38, クローズHH = 42, オープンHH = 46, クラッシュ = 49

## トラック分離
ユーザーが選択できるようにする:
- 全トラック一括書き出し
- コードトラックのみ
- ベーストラックのみ
- ドラムトラックのみ

詳細は `references/midi-writer-js-guide.md` を参照すること。
