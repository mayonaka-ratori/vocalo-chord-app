/**
 * 進行に対してバリエーション（テンション追加、代理コードなど）を生成する
 * 今後の拡張のためプレースホルダー実装
 */

export function addTension(chords: string[]): string[] {
  // すべてのメジャーに対して7、マイナーに対してm7をつけるなどの処理
  return chords.map(chord => {
    // 既存に7が含まれていなければ付与
    if (!chord.includes('7') && !chord.includes('dim') && !chord.includes('aug')) {
      if (chord.includes('m')) {
        return chord.replace('m', 'm7');
      } else {
        return chord + 'maj7'; // メジャーならメジャーセブンス
      }
    }
    return chord;
  });
}

/**
 * コードのベース音をルートからルート以外（展開形）に変更・バリエーションを作る
 */
export function createOnChordVariation(chords: string[]): string[] {
  // 今後の実装用：ベースラインが滑らかになるようにルートを変えるなどのアプローチ
  return chords;
}
