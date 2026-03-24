import { ChordPreset } from '@/types/music';

export const chordPresets: ChordPreset[] = [
  {
    id: 'oudou',
    name: '王道進行',
    nameEn: '4536 Progression',
    description: 'J-POPやアニソンで定番の、切なさと力強さがある進行',
    degrees: ['IV', 'V', 'IIIm', 'VIm'],
    tags: ['エモい', '明るい'],
    famousSongs: ['残酷な天使のテーゼ', '千本桜', 'ギルティクラウン OP'],
    category: 'standard'
  },
  {
    id: 'canon',
    name: 'カノン進行',
    nameEn: 'Canon Progression',
    description: '美しく流れるような定番中の定番進行',
    degrees: ['I', 'V', 'VIm', 'IIIm', 'IV', 'I', 'IV', 'V'],
    tags: ['切ない', '明るい'],
    famousSongs: ['メルト', 'パッヘルベルのカノン', '卒業写真'],
    category: 'standard'
  },
  {
    id: 'komuro',
    name: '小室進行',
    nameEn: 'Komuro Progression',
    description: '疾走感と哀愁が同居する90年代からの定番進行',
    degrees: ['VIm', 'IV', 'V', 'I'],
    tags: ['エモい', '疾走感'],
    famousSongs: ['Get Wild', 'ロストワンの号哭', '残響散歌'],
    category: 'standard'
  },
  {
    id: 'marunouchi',
    name: '丸サ進行',
    nameEn: 'Just The Two Of Us',
    description: '非常にお洒落で中毒性の高い現代の超定番',
    degrees: ['IVmaj7', 'III7', 'VIm7', 'I7'],
    tags: ['オシャレ', '中毒性'],
    famousSongs: ['丸の内サディスティック', '夜に駆ける', 'フォニイ'],
    category: 'standard'
  },
  {
    id: '6236-progression',
    name: '6236進行',
    nameEn: '6236 Progression',
    description: 'ボカロ曲で多用される、ダークで疾走感のあるループ',
    degrees: ['VIm', 'IIm', 'IIIm', 'VIm'],
    tags: ['中毒性', '疾走感', 'ダーク'],
    famousSongs: ['ドーナツホール', 'ベノム', 'アスノヨゾラ哨戒班'],
    category: 'vocaloid'
  },
  {
    id: 'pop-punk',
    name: 'バラード進行',
    nameEn: 'Pop Punk Progression',
    description: '優しくノスタルジックな響き。洋楽ポップスでも定番',
    degrees: ['I', 'V', 'VIm', 'IV'],
    tags: ['切ない', '明るい'],
    famousSongs: ['Let It Be', 'ハルジオン', '前前前世'],
    category: 'standard'
  },
  {
    id: 'ascending',
    name: '上昇進行',
    nameEn: 'Ascending Progression',
    description: '階段を上るように盛り上がるエモい進行',
    degrees: ['IIm', 'IIIm', 'IV', 'V'],
    tags: ['エモい', '疾走感'],
    famousSongs: ['六兆年と一夜物語', '紅蓮華'],
    category: 'vocaloid'
  },
  {
    id: 'retro-50s',
    name: 'レトロ進行',
    nameEn: '50s Progression',
    description: '古き良きオールディーズの雰囲気を持った進行',
    degrees: ['I', 'VIm', 'IV', 'V'],
    tags: ['明るい', '切ない'],
    famousSongs: ['Stand By Me', '世界に一つだけの花'],
    category: 'standard'
  },
  {
    id: 'sdm-progression',
    name: 'サブドミナントマイナー',
    nameEn: 'Subdominant Minor Progression',
    description: '一瞬マイナーの切なさが混ざるお洒落な進行',
    degrees: ['I', 'IVm', 'I', 'V'],
    tags: ['切ない', 'オシャレ'],
    famousSongs: ['花に亡霊', 'Creep'],
    category: 'citypop'
  },
  {
    id: 'yoasobi-style',
    name: 'YOASOBI風交互進行',
    nameEn: 'Alternating Progression',
    description: '王道と丸サを組み合わせたドラマチックな進行',
    degrees: ['IV', 'V', 'IIIm', 'VIm', 'IVmaj7', 'III7', 'VIm7', 'V'],
    tags: ['オシャレ', 'エモい', '中毒性'],
    famousSongs: ['アイドル', '群青'],
    category: 'recent-hit'
  },
  {
    id: 'vaundy-funk',
    name: 'Vaundy風ファンク',
    nameEn: 'Funk Progression',
    description: '複雑なセブンスを絡めたダンサブルでお洒落な進行',
    degrees: ['IVmaj7', 'III7', 'VIm7', 'IIm7', 'IVmaj7', 'III7', 'VIm7', 'V7'],
    tags: ['オシャレ', '中毒性'],
    famousSongs: ['怪獣の花唄', '東京フラッシュ'],
    category: 'recent-hit'
  },
  {
    id: 'yonanuki-style',
    name: 'ヨナ抜き風進行',
    nameEn: 'Yonanuki Style',
    description: 'ペンタトニック的な和風・アジア風の響き',
    degrees: ['I', 'IIm', 'IV', 'V', 'I', 'IIm', 'IV', 'V'],
    tags: ['明るい', '中毒性'],
    famousSongs: ['千本桜(一部)', '和楽器バンド等の楽曲'],
    category: 'vocaloid'
  },
  {
    id: 'dark-minor-loop',
    name: 'ダークマイナーループ',
    nameEn: 'Dark Minor Loop',
    description: '暗くてかっこいい近年のボカロック定番',
    degrees: ['VIm', 'VIm', 'IV', 'V'],
    tags: ['ダーク', 'エモい'],
    famousSongs: ['ロキ', 'シャルル', 'ヴィラン'],
    category: 'vocaloid'
  },
  {
    id: 'vocalock-drop',
    name: 'EDM/ボカロックドロップ',
    nameEn: 'EDM Drop',
    description: '小室進行の変化形で、サビの爆発力がある進行',
    degrees: ['VIm', 'IV', 'I', 'V'],
    tags: ['疾走感', '中毒性', 'ダーク'],
    famousSongs: ['グッバイ宣言', 'フォニイ', 'KING'],
    category: 'vocaloid'
  },
  {
    id: 'melancholy-loop',
    name: '哀愁ループ',
    nameEn: 'Melancholy Loop',
    description: '暗さと美しさが同居する、米津玄師なども多用する進行',
    degrees: ['VIm', 'IV', 'I', 'V'],
    tags: ['切ない', '中毒性'],
    famousSongs: ['Lemon', 'アンノウン・マザーグース'],
    category: 'recent-hit'
  },
  {
    id: 'ageage-pop',
    name: 'アゲアゲポップ',
    nameEn: 'Upbeat Pop',
    description: '最高に明るくて前向きなポップス定番ループ',
    degrees: ['I', 'IV', 'V', 'I', 'VIm', 'IV', 'V', 'I'],
    tags: ['明るい', '疾走感'],
    famousSongs: ['テルユアワールド', 'ハッピーシンセサイザ'],
    category: 'vocaloid'
  },
  {
    id: 'plastic-love',
    name: 'Plastic Love進行',
    nameEn: 'Plastic Love Progression',
    description: '竹内まりやの代表曲に使われたシティポップの象徴的進行',
    degrees: ['IIm7', 'V7', 'Imaj7', 'VIm7'],
    tags: ['オシャレ', '中毒性'],
    famousSongs: ['Plastic Love / 竹内まりや'],
    category: 'citypop'
  },
  {
    id: 'mayonaka-door',
    name: '真夜中のドア進行',
    nameEn: 'Mayonaka no Door Progression',
    description: '松原みきの名曲、世界的に再評価されたシティポップ進行',
    degrees: ['VIm7', 'IIm7', 'V7', 'Imaj7'],
    tags: ['オシャレ', '切ない'],
    famousSongs: ['真夜中のドア〜Stay With Me / 松原みき'],
    category: 'citypop'
  },
  {
    id: 'citypop-jazzy',
    name: 'シティポップ・ジャジーループ',
    nameEn: 'City Pop Jazzy Loop',
    description: '山下達郎や角松敏生を彷彿させる洗練されたコードワーク',
    degrees: ['IVmaj7', 'IIIm7', 'IIm7', 'Imaj7'],
    tags: ['オシャレ', '明るい'],
    famousSongs: ['Ride on Time / 山下達郎', 'Tokyo Tower / 角松敏生'],
    category: 'citypop'
  },
  {
    id: 'ado-style',
    name: 'Ado風アグレッシブ進行',
    nameEn: 'Aggressive Pop Progression',
    description: 'Adoやずとまよに見られる攻撃的でドラマチックな進行',
    degrees: ['VIm', 'IV', 'V', 'IIIm'],
    tags: ['疾走感', 'ダーク', '中毒性'],
    famousSongs: ['うっせぇわ / Ado', 'お勉強しといてよ / ずっと真夜中でいいのに。'],
    category: 'recent-hit'
  },
  {
    id: 'just-the-two-of-us',
    name: 'Just The Two of Us進行',
    nameEn: 'Just The Two of Us Progression',
    description: '都会的で切ないシティポップの定番。夜に駆けるなどで有名',
    degrees: ['IVmaj7', 'V', 'IIIm7', 'VIm'],
    tags: ['オシャレ', '切ない'],
    famousSongs: ['夜に駆ける / YOASOBI', 'Just The Two of Us / Grover Washington Jr.'],
    category: 'citypop'
  }
];
