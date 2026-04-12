/**
 * コード進行バリエーション生成ロジック
 *
 * 与えられたコード進行に対して、リハーモナイズ技法を適用した
 * バリエーション提案を生成する。
 */

import { ChordVariation } from '@/types/music';
import { getNoteIndex, getNoteFromIndexForKey, parseChord } from './chords';
import { NoteName } from '@/types/music';

// =============================
// 内部ヘルパー関数
// =============================

/**
 * キー文字列（"C/Am" や "C" 形式）をパースする
 */
function parseKey(key: string): { root: string; isMinor: boolean } {
  const parts = key.split('/');
  const root = parts[0].trim();
  return { root, isMinor: false };
}

/**
 * コードのルート音から、キーのルートに対する半音差（0-11）を計算する
 * 返値: 0=I, 2=II, 4=III, 5=IV, 7=V, 9=VI, 11=VII (メジャースケール音程)
 */
function getSemitoneFromKey(chordRoot: string, keyRoot: string): number {
  const keyIdx = getNoteIndex(keyRoot as NoteName);
  const chordIdx = getNoteIndex(chordRoot as NoteName);
  return ((chordIdx - keyIdx) + 12) % 12;
}

/**
 * コードがメジャークオリティ（付加音なし、またはmaj7）かどうか判定する
 */
function isMajorChord(quality: string): boolean {
  return quality === '' || quality === 'M';
}

/**
 * コードがマイナークオリティかどうか判定する
 */
function isMinorChord(quality: string): boolean {
  return quality === 'm' || quality === 'm7' || quality === 'mM7';
}

/**
 * コードが既にセブンスを持っているかどうか判定する
 */
function hasSeventh(quality: string): boolean {
  return quality.includes('7');
}

/**
 * バリエーション結果の重複を `modifiedChords` の文字列一致で除去する
 */
function deduplicate(variations: ChordVariation[]): ChordVariation[] {
  const seen = new Set<string>();
  return variations.filter(v => {
    const key = v.modifiedChords.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// =============================
// 8つのバリエーションルール
// =============================

/**
 * Rule 1: サブドミナントマイナー (minor-iv)
 * IV（メジャー）→ IVm に変更。切なさが激増する定番テクニック。
 */
function applyMinorIv(
  chords: string[],
  keyRoot: string
): ChordVariation | null {
  const changedIndices: number[] = [];
  const newChords = [...chords];

  // IVの半音差 = 5
  chords.forEach((chord, i) => {
    const { root, quality } = parseChord(chord);
    if (getSemitoneFromKey(root, keyRoot) === 5 && isMajorChord(quality)) {
      newChords[i] = `${root}m`;
      changedIndices.push(i);
    }
  });

  if (changedIndices.length === 0) return null;

  return {
    id: '',
    name: '切なさUP',
    icon: '🥲',
    description: '4番目のコードをマイナーに変えると、急に切ない空気に',
    originalChords: chords,
    modifiedChords: newChords,
    changedIndices,
    technique: 'minor-iv',
    moodShift: '切ない',
    impactScore: 6,
  };
}

/**
 * Rule 2: セカンダリドミナント (secondary-dominant)
 * IIIm → III7（VImへ向かうセカンダリドミナント）または IIm → II7 に変更。
 */
function applySecondaryDominant(
  chords: string[],
  keyRoot: string
): ChordVariation | null {
  const changedIndices: number[] = [];
  const newChords = [...chords];

  // IIIm(半音差=4) の後に VIm(半音差=9) が続く場合: IIIm → III7
  // IIm(半音差=2) の後に V(半音差=7) が続く場合: IIm → II7
  const patterns: Array<{ from: number; to: number }> = [
    { from: 4, to: 9 },  // IIIm → III7 (before VIm)
    { from: 2, to: 7 },  // IIm → II7 or IIm7 → II7 (before V)
  ];

  chords.forEach((chord, i) => {
    if (i >= chords.length - 1) return; // 最後のコードはスキップ
    const { root, quality } = parseChord(chord);
    const nextChord = chords[i + 1];
    const { root: nextRoot } = parseChord(nextChord);
    const semitone = getSemitoneFromKey(root, keyRoot);
    const nextSemitone = getSemitoneFromKey(nextRoot, keyRoot);

    const matchedPattern = patterns.find(
      p => p.from === semitone && p.to === nextSemitone
    );

    if (matchedPattern && (isMinorChord(quality) || quality === 'm7')) {
      // マイナー → ドミナント7th に変換 (ルートはそのまま)
      newChords[i] = `${root}7`;
      changedIndices.push(i);
    }
  });

  if (changedIndices.length === 0) return null;

  return {
    id: '',
    name: 'オシャレ度UP',
    icon: '✨',
    description: '次のコードに向かう「引力」を強くして、プロっぽい響きに',
    originalChords: chords,
    modifiedChords: newChords,
    changedIndices,
    technique: 'secondary-dominant',
    moodShift: 'オシャレ',
    impactScore: 7,
  };
}

/**
 * Rule 3: セブンス化 (add-seventh)
 * 三和音にセブンスを追加。V→V7, IV→IVmaj7, I→Imaj7 の優先順位で最大2箇所。
 */
function applyAddSeventh(
  chords: string[],
  keyRoot: string
): ChordVariation | null {
  const newChords = [...chords];
  const changedIndices: number[] = [];

  // 優先度: V(7), IV(maj7), I(maj7), その他マイナー(m7)
  const targets: Array<{ semitone: number; addedQuality: string; baseQuality: string }> = [
    { semitone: 7, addedQuality: '7', baseQuality: '' },        // V → V7
    { semitone: 5, addedQuality: 'maj7', baseQuality: '' },     // IV → IVmaj7
    { semitone: 0, addedQuality: 'maj7', baseQuality: '' },     // I → Imaj7
    { semitone: 9, addedQuality: 'm7', baseQuality: 'm' },      // VIm → VIm7
    { semitone: 2, addedQuality: 'm7', baseQuality: 'm' },      // IIm → IIm7
    { semitone: 4, addedQuality: 'm7', baseQuality: 'm' },      // IIIm → IIIm7
  ];

  for (const target of targets) {
    if (changedIndices.length >= 2) break;

    chords.forEach((chord, i) => {
      if (changedIndices.length >= 2 || changedIndices.includes(i)) return;
      const { root, quality } = parseChord(chord);
      if (
        getSemitoneFromKey(root, keyRoot) === target.semitone &&
        quality === target.baseQuality &&
        !hasSeventh(quality)
      ) {
        newChords[i] = `${root}${target.addedQuality}`;
        changedIndices.push(i);
      }
    });
  }

  if (changedIndices.length === 0) return null;

  return {
    id: '',
    name: '大人っぽく',
    icon: '🎩',
    description: '7thを足すだけで、一気に大人な雰囲気に',
    originalChords: chords,
    modifiedChords: newChords,
    changedIndices,
    technique: 'add-seventh',
    moodShift: 'オシャレ',
    impactScore: 4,
  };
}

/**
 * Rule 4: サスフォー解決 (sus4-resolve)
 * V → Vsus4 に変更。解決を焦らして期待感を高める。
 */
function applySus4Resolve(
  chords: string[],
  keyRoot: string
): ChordVariation | null {
  const newChords = [...chords];
  const changedIndices: number[] = [];

  chords.forEach((chord, i) => {
    const { root, quality } = parseChord(chord);
    // V (半音差=7) かつ素のメジャーコード
    if (getSemitoneFromKey(root, keyRoot) === 7 && isMajorChord(quality)) {
      newChords[i] = `${root}sus4`;
      changedIndices.push(i);
    }
  });

  if (changedIndices.length === 0) return null;

  return {
    id: '',
    name: '焦らし効果',
    icon: '😏',
    description: '解決を焦らすことで、サビへの期待感がグッと上がる',
    originalChords: chords,
    modifiedChords: newChords,
    changedIndices,
    technique: 'sus4-resolve',
    moodShift: 'エモい',
    impactScore: 5,
  };
}

/**
 * Rule 5: ツーファイブ挿入 (two-five)
 * 末尾が I or VIm の場合、末尾の手前コードを IIm7 に置換。
 * ジャズ的な流れを作る。
 */
function applyTwoFive(
  chords: string[],
  keyRoot: string
): ChordVariation | null {
  if (chords.length < 2) return null;

  const lastChord = chords[chords.length - 1];
  const { root: lastRoot, quality: lastQuality } = parseChord(lastChord);
  const lastSemitone = getSemitoneFromKey(lastRoot, keyRoot);

  // 末尾が I(0) か VIm(9) か確認
  const isTonicEnd = lastSemitone === 0 && isMajorChord(lastQuality);
  const isRelativeMinorEnd = lastSemitone === 9 && isMinorChord(lastQuality);

  if (!isTonicEnd && !isRelativeMinorEnd) return null;

  // ツーファイブの "Two" コードをキーに基づいて計算
  // I への II-V: IIm7 → V7 → I → Dm7 (key C)
  // VIm への II-V: #IIm7 → #V7 → VIm → 例(key C)→ Am へ向かう場合: Bm7 → E7 → Am
  let twoRoot: string;
  if (isTonicEnd) {
    // IIm7: ルートから全音上 (半音差2)
    twoRoot = getNoteFromIndexForKey(getNoteIndex(keyRoot as NoteName) + 2, keyRoot);
  } else {
    // VIm への II-V: VIm の完全5度上 = IIIm
    // VIm root: keyRoot + 9 semitones
    const viRoot = getNoteIndex(keyRoot as NoteName) + 9;
    twoRoot = getNoteFromIndexForKey(viRoot + 2, keyRoot); // VIm から全音上
  }

  const newChords = [...chords];
  const targetIndex = chords.length - 2;
  newChords[targetIndex] = `${twoRoot}m7`;

  // 元のコードと同じになる場合はスキップ
  if (newChords[targetIndex] === chords[targetIndex]) return null;

  return {
    id: '',
    name: 'ジャズ風味',
    icon: '🎷',
    description: 'ジャズの定番テクニックで、流れるような展開に',
    originalChords: chords,
    modifiedChords: newChords,
    changedIndices: [targetIndex],
    technique: 'two-five',
    moodShift: 'オシャレ',
    impactScore: 7,
  };
}

/**
 * Rule 6: 同主調借用 (modal-interchange)
 * メジャーキーで V が含まれる場合、その V をフラット7度（bVII）メジャーに変換。
 * 同主短調からの借用コード。
 */
function applyModalInterchange(
  chords: string[],
  keyRoot: string
): ChordVariation | null {
  const newChords = [...chords];
  const changedIndices: number[] = [];

  // bVII = keyRoot - 2 半音 (= 完全5度下の全音上)
  const bVIIIndex = (getNoteIndex(keyRoot as NoteName) + 10) % 12;
  const bVIIRoot = getNoteFromIndexForKey(bVIIIndex, keyRoot);

  // V (半音差=7) のメジャーコードを bVII に置換
  chords.forEach((chord, i) => {
    if (changedIndices.length >= 1) return; // 最初の1つだけ
    const { root, quality } = parseChord(chord);
    if (getSemitoneFromKey(root, keyRoot) === 7 && isMajorChord(quality)) {
      newChords[i] = bVIIRoot;
      changedIndices.push(i);
    }
  });

  if (changedIndices.length === 0) return null;

  return {
    id: '',
    name: '意外な展開',
    icon: '🌀',
    description: '別の調からコードを借りてくることで、ハッとする瞬間を作る',
    originalChords: chords,
    modifiedChords: newChords,
    changedIndices,
    technique: 'modal-interchange',
    moodShift: '意外性',
    impactScore: 9,
  };
}

/**
 * Rule 7: ディミニッシュ経過 (diminished-pass)
 * 全音差（2半音）で隣接するコードの前者を #IVdim（または適切なdim）に置換。
 * ドキッとする不安定感を演出する。
 */
function applyDiminishedPass(
  chords: string[],
  keyRoot: string
): ChordVariation | null {
  const newChords = [...chords];
  const changedIndices: number[] = [];

  for (let i = 0; i < chords.length - 1; i++) {
    if (changedIndices.length >= 1) break; // 1か所のみ
    const { root: r1 } = parseChord(chords[i]);
    const { root: r2 } = parseChord(chords[i + 1]);
    const idx1 = getNoteIndex(r1 as NoteName);
    const idx2 = getNoteIndex(r2 as NoteName);
    const diff = ((idx2 - idx1) + 12) % 12;

    // 全音差（2半音）の場合、間にdimを挟む
    // → 前者を「次のコードのルートから半音下のdim」に置換
    if (diff === 2) {
      const dimRootIdx = (idx2 - 1 + 12) % 12;
      const dimRoot = getNoteFromIndexForKey(dimRootIdx, keyRoot);
      newChords[i] = `${dimRoot}dim`;
      changedIndices.push(i);
    }
  }

  if (changedIndices.length === 0) return null;

  return {
    id: '',
    name: '緊張感プラス',
    icon: '😈',
    description: '不安定なディミニッシュを挟んで、ドキッとする瞬間を',
    originalChords: chords,
    modifiedChords: newChords,
    changedIndices,
    technique: 'diminished-pass',
    moodShift: 'ダーク',
    impactScore: 8,
  };
}

/**
 * Rule 8: 明るくチェンジ (relative-major-minor)
 * VIm を IV（または I）に変更してポジティブな雰囲気に。
 */
function applyRelativeMajorMinor(
  chords: string[],
  keyRoot: string
): ChordVariation | null {
  const newChords = [...chords];
  const changedIndices: number[] = [];

  // IVのルート = keyRoot + 5 半音
  const ivRoot = getNoteFromIndexForKey(getNoteIndex(keyRoot as NoteName) + 5, keyRoot);

  chords.forEach((chord, i) => {
    if (changedIndices.length >= 1) return; // 1か所のみ
    const { root, quality } = parseChord(chord);
    // VIm (半音差=9) かつマイナーコード
    if (getSemitoneFromKey(root, keyRoot) === 9 && isMinorChord(quality)) {
      newChords[i] = ivRoot;
      changedIndices.push(i);
    }
  });

  if (changedIndices.length === 0) return null;

  return {
    id: '',
    name: '明るくチェンジ',
    icon: '☀️',
    description: 'マイナーをメジャーに変えて、パッと明るい印象に',
    originalChords: chords,
    modifiedChords: newChords,
    changedIndices,
    technique: 'relative-major-minor',
    moodShift: '明るい',
    impactScore: 5,
  };
}

// =============================
// メイン関数
// =============================

/**
 * コード進行に対してバリエーション提案を生成する
 *
 * @param chords 現在のコード進行（例: ["F", "G", "Em", "Am"]）
 * @param key キー文字列（例: "C/Am" または "C"）
 * @param count 返すバリエーションの最大数（デフォルト: 5）
 * @returns バリエーション提案の配列（インパクト順ソート済み）
 */
export function generateVariations(
  chords: string[],
  key: string,
  count = 5
): ChordVariation[] {
  if (chords.length === 0) return [];

  const { root: keyRoot } = parseKey(key);

  // 各ルールを適用してバリエーション候補を収集
  const ruleFunctions: Array<
    (chords: string[], keyRoot: string) => ChordVariation | null
  > = [
    applyMinorIv,
    applySecondaryDominant,
    applyAddSeventh,
    applySus4Resolve,
    applyTwoFive,
    applyModalInterchange,
    applyDiminishedPass,
    applyRelativeMajorMinor,
  ];

  const candidates: ChordVariation[] = [];

  for (const rule of ruleFunctions) {
    const result = rule(chords, keyRoot);
    if (result !== null) {
      candidates.push(result);
    }
  }

  // 重複排除（modifiedChords が同じものを除去）
  const unique = deduplicate(candidates);

  // インパクトスコアで降順ソート
  unique.sort((a, b) => b.impactScore - a.impactScore);

  // IDを確定的な連番に付け直す（重複しないUUID風）
  return unique.slice(0, count).map((v, i) => ({
    ...v,
    id: `variation-${v.technique}-${i}`,
  }));
}
