import { FamousSong } from '@/types/music';

// 有名曲コード進行データベース。歌詞は含めない。
export const famousSongs: FamousSong[] = [
  {
    id: 'yoru-ni-kakeru',
    title: '夜に駆ける',
    artist: 'YOASOBI',
    year: 2019,
    key: 'Eb',
    bpm: 130,
    sections: [
      { label: 'Aメロ', chords: ['Abmaj7', 'G7', 'Cm7', 'Bb7'] },
      { label: 'サビ', chords: ['Abmaj7', 'G7', 'Cm7', 'Bbm7', 'Eb7'] }
    ],
    tags: ['オシャレ', '中毒性', 'ボカロP'],
    searchAliases: ['よるにかける', 'yoru ni kakeru', 'racing into the night', 'yorunikakeru'],
    category: 'recent-hit'
  },
  {
    id: 'idol',
    title: 'アイドル',
    artist: 'YOASOBI',
    year: 2023,
    key: 'Ab',
    bpm: 166,
    sections: [
      { label: 'Aメロ', chords: ['Fm', 'Db', 'Eb', 'Cm'] },
      { label: 'サビ', chords: ['Db', 'Eb', 'Cm', 'Fm', 'Dbmaj7', 'C7', 'Fm', 'Eb'] }
    ],
    tags: ['エモい', '疾走感', '中毒性'],
    searchAliases: ['あいどる', 'oshi no ko', '推しの子'],
    category: 'recent-hit'
  },
  {
    id: 'senbonzakura',
    title: '千本桜',
    artist: '黒うさP',
    year: 2011,
    key: 'Bm',
    bpm: 154,
    sections: [
      { label: 'Aメロ', chords: ['Bm', 'F#m', 'G', 'A'] },
      { label: 'サビ', chords: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'F#m', 'Bm'] }
    ],
    tags: ['疾走感', 'エモい'],
    searchAliases: ['せんぼんざくら', 'senbonzakura', '千本桜', 'kuro usa p', '黒うさ'],
    category: 'vocaloid'
  },
  {
    id: 'charles',
    title: 'シャルル',
    artist: 'バルーン',
    year: 2016,
    key: 'G',
    bpm: 167,
    sections: [
      { label: 'Aメロ', chords: ['Em', 'C', 'G', "D"] },
      { label: 'サビ', chords: ['C', 'D', 'Bm', 'Em', 'C', 'D', 'G', 'G'] }
    ],
    tags: ['エモい', '疾走感', '切ない'],
    searchAliases: ['しゃるる', 'sharuru', 'balloon', 'バルーン'],
    category: 'vocaloid'
  },
  {
    id: 'lemon',
    title: 'Lemon',
    artist: '米津玄師',
    year: 2018,
    key: 'G#m',
    bpm: 87,
    sections: [
      { label: 'Aメロ', chords: ['G#m', 'E', 'B', 'F#'] },
      { label: 'サビ', chords: ['E', 'F#', 'D#m', 'G#m', 'E', 'F#', 'B', 'B'] }
    ],
    tags: ['切ない', 'エモい'],
    searchAliases: ['れもん', 'yonezu kenshi', '米津玄師', 'kenshi yonezu'],
    category: 'recent-hit'
  },
  {
    id: 'roki',
    title: 'ロキ',
    artist: 'みきとP',
    year: 2018,
    key: 'Bm',
    bpm: 150,
    sections: [
      { label: 'Aメロ', chords: ['Bm', 'Bm', 'G', 'A'] },
      { label: 'サビ', chords: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'Bm', 'Bm'] }
    ],
    tags: ['疾走感', 'ダーク', '中毒性'],
    searchAliases: ['ろき', 'mikito p', 'みきとp'],
    category: 'vocaloid'
  },
  {
    id: 'phony',
    title: 'フォニイ',
    artist: 'ツミキ',
    year: 2021,
    key: 'Dm',
    bpm: 160,
    sections: [
      { label: 'Aメロ', chords: ['Dm', 'Bb', 'C', 'Am'] },
      { label: 'サビ', chords: ['Bb', 'C', 'Am', 'Dm', 'Bb', 'C', 'Dm', 'Dm'] }
    ],
    tags: ['疾走感', '中毒性', 'ダーク'],
    searchAliases: ['ふぉにい', 'phony', 'tsumiki', 'ツミキ'],
    category: 'vocaloid'
  },
  {
    id: 'goodbye-sengen',
    title: 'グッバイ宣言',
    artist: 'Chinozo',
    year: 2020,
    key: 'D',
    bpm: 190,
    sections: [
      { label: 'サビ', chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'Bm', 'G'] }
    ],
    tags: ['明るい', '疾走感'],
    searchAliases: ['ぐっばいせんげん', 'goodbye declaration', 'goodbye sengen', 'chinozo'],
    category: 'vocaloid'
  },
  {
    id: 'king',
    title: 'KING',
    artist: 'Kanaria',
    year: 2020,
    key: 'Gm',
    bpm: 146,
    sections: [
      { label: 'Aメロ', chords: ['Gm', 'Eb', "F", 'D'] },
      { label: 'サビ', chords: ['Eb', 'F', 'Dm', 'Gm', 'Eb', 'F', 'Gm', 'Gm'] }
    ],
    tags: ['ダーク', '中毒性', '疾走感'],
    searchAliases: ['きんぐ', 'kanaria', 'かなりあ'],
    category: 'vocaloid'
  },
  {
    id: 'melt',
    title: 'メルト',
    artist: 'ryo(supercell)',
    year: 2007,
    key: 'D',
    bpm: 152,
    sections: [
      { label: 'Aメロ', chords: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'] },
      { label: 'サビ', chords: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D'] }
    ],
    tags: ['明るい', '切ない'],
    searchAliases: ['めると', 'melt', 'ryo', 'supercell'],
    category: 'vocaloid'
  },
  {
    id: 'lost-ones-weeping',
    title: 'ロストワンの号哭',
    artist: 'Neru',
    year: 2013,
    key: 'Bm',
    bpm: 162,
    sections: [
      { label: 'サビ', chords: ['Bm', 'G', 'A', 'D', 'Bm', 'G', "A", "Bm"] }
    ],
    tags: ['エモい', '疾走感', 'ダーク'],
    searchAliases: ['ろすとわんのごうこく', 'lost ones weeping', 'neru', 'ねる'],
    category: 'vocaloid'
  },
  {
    id: 'villain',
    title: 'ヴィラン',
    artist: 'てにをは',
    year: 2020,
    key: 'Am',
    bpm: 136,
    sections: [
      { label: 'Aメロ', chords: ['Am', 'F', 'C', 'G'] },
      { label: 'サビ', chords: ['F', 'G', 'Em', 'Am', 'F', 'G', 'Am', 'Am'] }
    ],
    tags: ['ダーク', 'オシャレ', '中毒性'],
    searchAliases: ['ヴィラン', 'びらん', 'villain', 'teniwoha', 'てにをは'],
    category: 'vocaloid'
  },

  // --- Batch 1 ---
  {
    id: "plastic-love",
    title: "プラスティック・ラブ",
    artist: "竹内まりや",
    year: 1984,
    key: "Dm",
    bpm: 108,
    sections: [{ label: 'サビ', chords: ["Gm7", "C7", "Am7", "Dm7"] }],
    tags: ["オシャレ"],
    category: "citypop",
    searchAliases: ["plastic love", "plasticlove", "takeuchi mariya", "竹内まりや"]
  },
  {
    id: "mayonaka-no-door",
    title: "真夜中のドア〜Stay With Me",
    artist: "松原みき",
    year: 1979,
    key: "F",
    bpm: 108,
    sections: [{ label: 'サビ', chords: ["Am7", "Gm7", "C7", "Fmaj7"] }],
    tags: ["オシャレ"],
    category: "citypop",
    searchAliases: ["mayonaka no door", "stay with me", "matsubara miki", "松原みき"]
  },
  {
    id: "christmas-eve",
    title: "クリスマス・イブ",
    artist: "山下達郎",
    year: 1983,
    key: "D",
    bpm: 120,
    sections: [{ label: 'サビ', chords: ["D", "A/C#", "Bm", "D/A", "G", "D/F#", "Em", "A"] }],
    tags: ["エモい"],
    category: "citypop",
    searchAliases: ["christmas eve", "yamashita tatsuro", "山下達郎"]
  },
  {
    id: "ride-on-time",
    title: "RIDE ON TIME",
    artist: "山下達郎",
    year: 1980,
    key: "A",
    bpm: 118,
    sections: [{ label: 'サビ', chords: ["Amaj7", "G#m7", "C#m7", "F#m7"] }],
    tags: ["明るい"],
    category: "citypop",
    searchAliases: ["ride on time", "yamashita"]
  },
  {
    id: "marunouchi-sadistic",
    title: "丸ノ内サディスティック",
    artist: "椎名林檎",
    year: 1999,
    key: "Eb",
    bpm: 100,
    sections: [{ label: 'サビ', chords: ["Abmaj7", "G7", "Cm7", "Bbm7", "Eb7"] }],
    tags: ["オシャレ"],
    category: "citypop",
    searchAliases: ["marunouchi sadistic", "shiina ringo", "椎名林檎", "丸サ"]
  },
  {
    id: "september-takeuchi",
    title: "September",
    artist: "竹内まりや",
    year: 1979,
    key: "C",
    bpm: 112,
    sections: [{ label: 'サビ', chords: ["Cmaj7", "Am7", "Dm7", "G7"] }],
    tags: ["明るい"],
    category: "citypop",
    searchAliases: ["september", "takeuchi"]
  },
  {
    id: "chuo-freeway",
    title: "中央フリーウェイ",
    artist: "荒井由実",
    year: 1976,
    key: "D",
    bpm: 110,
    sections: [{ label: 'サビ', chords: ["Dmaj7", "D7", "Gmaj7", "Gm6"] }],
    tags: ["オシャレ"],
    category: "citypop",
    searchAliases: ["chuo freeway", "arai yumi", "yuming", "荒井由実", "ユーミン"]
  },
  {
    id: "seppun",
    title: "接吻",
    artist: "ORIGINAL LOVE",
    year: 1993,
    key: "D",
    bpm: 114,
    sections: [{ label: 'サビ', chords: ["Gm7", "A7", "F#m7", "Bm7"] }],
    tags: ["オシャレ"],
    category: "citypop",
    searchAliases: ["kiss", "seppun", "original love"]
  },
  {
    id: "sweet-memories",
    title: "SWEET MEMORIES",
    artist: "松田聖子",
    year: 1983,
    key: "F",
    bpm: 72,
    sections: [{ label: 'サビ', chords: ["Fmaj7", "Em7", "A7", "Dm7"] }],
    tags: ["切ない"],
    category: "citypop",
    searchAliases: ["sweet memories", "matsuda seiko", "松田聖子"]
  },
  {
    id: "yume-no-naka-e",
    title: "夢の中へ",
    artist: "井上陽水",
    year: 1973,
    key: "G",
    bpm: 124,
    sections: [{ label: 'サビ', chords: ["G", "C", "D", "Em"] }],
    tags: ["明るい"],
    category: "citypop",
    searchAliases: ["yume no naka e", "inoue yosui", "井上陽水"]
  },
  {
    id: "kick-back",
    title: "KICK BACK",
    artist: "米津玄師",
    year: 2022,
    key: "C#m",
    bpm: 204,
    sections: [{ label: 'サビ', chords: ["C#m", "B", "A", "G#"] }],
    tags: ["明るい", "エモい"],
    category: "recent-hit",
    searchAliases: ["kick back", "kickback", "米津玄師", "chainsaw man", "チェンソーマン"]
  },
  {
    id: "iris-out",
    title: "IRIS OUT",
    artist: "米津玄師",
    year: 2023,
    key: "Em",
    bpm: 135,
    sections: [{ label: 'サビ', chords: ["Am", "Em", "B7", "G"] }],
    tags: ["オシャレ", "エモい"],
    category: "recent-hit",
    searchAliases: ["iris out", "米津玄師", "yonezu"]
  },
  {
    id: "haru-dorobou",
    title: "春泥棒",
    artist: "ヨルシカ",
    year: 2021,
    key: "G",
    bpm: 130,
    sections: [{ label: 'サビ', chords: ["G", "D", "Em", "C"] }],
    tags: ["明るい"],
    category: "recent-hit",
    searchAliases: ["haru dorobou", "春泥棒", "yorushika", "ヨルシカ"]
  },
  {
    id: "odoriko",
    title: "踊り子",
    artist: "Vaundy",
    year: 2021,
    key: "Dm",
    bpm: 113,
    sections: [{ label: 'サビ', chords: ["Dm", "Am", "Bb", "C"] }],
    tags: ["オシャレ"],
    category: "recent-hit",
    searchAliases: ["odoriko", "踊り子", "vaundy"]
  },
  {
    id: "sho",
    title: "唱",
    artist: "Ado",
    year: 2023,
    key: "Dm",
    bpm: 130,
    sections: [{ label: 'サビ', chords: ["Dm", "Gm", "A", "Bb"] }],
    tags: ["エモい", "ダーク"],
    category: "recent-hit",
    searchAliases: ["sho", "唱", "ado"]
  },
  {
    id: "usseewa",
    title: "うっせぇわ",
    artist: "Ado",
    year: 2020,
    key: "Bm",
    bpm: 178,
    sections: [{ label: 'サビ', chords: ["Bm", "G", "A", "F#m"] }],
    tags: ["エモい", "ダーク"],
    category: "recent-hit",
    searchAliases: ["usseewa", "うっせぇわ", "ado"]
  },
  {
    id: "inochi-ni-kirawareteiru",
    title: "命に嫌われている。",
    artist: "カンザキイオリ feat. 初音ミク",
    year: 2017,
    key: "Bm",
    bpm: 162,
    sections: [{ label: 'サビ', chords: ["Bm", "G", "D", "A"] }],
    tags: ["エモい", "ダーク"],
    category: "vocaloid",
    searchAliases: ["inochi ni kirawareteiru", "命に嫌われている", "カンザキイオリ"]
  },
  {
    id: "ghost-rule",
    title: "ゴーストルール",
    artist: "DECO*27 feat. 初音ミク",
    year: 2016,
    key: "Am",
    bpm: 210,
    sections: [{ label: 'サビ', chords: ["Am", "F", "C", "G"] }],
    tags: ["エモい"],
    category: "vocaloid",
    searchAliases: ["ghost rule", "deco27", "ゴーストルール"]
  },
  {
    id: "rolling-girl",
    title: "ローリンガール",
    artist: "wowaka feat. 初音ミク",
    year: 2010,
    key: "Bm",
    bpm: 195,
    sections: [{ label: 'サビ', chords: ["Bm", "G", "D", "F#m"] }],
    tags: ["エモい", "ダーク"],
    category: "vocaloid",
    searchAliases: ["rolling girl", "wowaka", "ローリンガール"]
  },
  {
    id: "love-is-war",
    title: "恋は戦争",
    artist: "ryo(supercell) feat. 初音ミク",
    year: 2008,
    key: "Dm",
    bpm: 175,
    sections: [{ label: 'サビ', chords: ["Dm", "Bb", "C", "A"] }],
    tags: ["エモい"],
    category: "vocaloid",
    searchAliases: ["love is war", "恋は戦争", "supercell"]
  },
  {
    id: "kagerou-days",
    title: "カゲロウデイズ",
    artist: "じん feat. 初音ミク",
    year: 2011,
    key: "Em",
    bpm: 200,
    sections: [{ label: 'サビ', chords: ["Em7", "Bm7", "Cmaj7", "D"] }],
    tags: ["エモい", "明るい"],
    category: "vocaloid",
    searchAliases: ["kagerou days", "カゲロウデイズ", "jin", "じん", "カゲプロ"]
  },
  {
    id: "musekinin-shuugoutai",
    title: "㋰責任集合体",
    artist: "マサラダ feat. 重音テト",
    year: 2023,
    key: "E",
    bpm: 135,
    sections: [{ label: 'サビ', chords: ["Am", "C#m", "Dm", "F#m", "E", "G#"] }],
    tags: ["明るい", "エモい"],
    category: "vocaloid",
    searchAliases: ["musekinin", "無責任集合体", "ム責任集合体", "㋰責任", "UTLAWS", "マサラダ", "masarada"]
  },
  {
    id: "tetris-hiiragi",
    title: "テトリス",
    artist: "柊マグネタイト feat. 重音テト",
    year: 2024,
    key: "C#m",
    bpm: 170,
    sections: [{ label: 'サビ', chords: ["C#m", "G#7", "C#m", "G#7"] }],
    tags: ["エモい", "ダーク"],
    category: "vocaloid",
    searchAliases: ["tetris", "テトリス", "柊マグネタイト", "hiiragi magnetite"]
  },
  {
    id: "quiet-room",
    title: "quiet room",
    artist: "有機酸 feat. 初音ミク",
    year: 2017,
    key: "F",
    bpm: 93,
    sections: [{ label: 'サビ', chords: ["Bbmaj7", "A7sus4", "Am7", "Dm7"] }],
    tags: ["オシャレ", "切ない"],
    category: "vocaloid",
    searchAliases: ["quiet room", "有機酸", "uki3", "ewe"]
  },
  {
    id: "non-breath-oblige",
    title: "ノンブレスオブリージュ",
    artist: "ピノキオピー feat. 初音ミク",
    year: 2021,
    key: "C",
    bpm: 148,
    sections: [{ label: 'サビ', chords: ["Fmaj7", "E7", "Am7", "C7"] }],
    tags: ["オシャレ"],
    category: "vocaloid",
    searchAliases: ["non breath oblige", "ノンブレスオブリージュ", "pinocchiop", "ピノキオピー"]
  },
  {
    id: "shinzou-wo-sasageyo",
    title: "心臓を捧げよ！",
    artist: "Linked Horizon",
    year: 2017,
    key: "Am",
    bpm: 184,
    sections: [{ label: 'サビ', chords: ["Am", "G", "F", "E"] }],
    tags: ["エモい", "明るい"],
    category: "vocaloid",
    searchAliases: ["shinzou wo sasageyo", "心臓を捧げよ", "linked horizon", "進撃の巨人"]
  },
  {
    id: "blessing-plu",
    title: "ブレス",
    artist: "ポルノグラフィティ",
    year: 2018,
    key: "G",
    bpm: 164,
    sections: [{ label: 'サビ', chords: ["G", "D", "Em", "C"] }],
    tags: ["明るい", "エモい"],
    category: "vocaloid",
    searchAliases: ["blessing", "breath", "ブレス", "ポルノグラフィティ"]
  },
  {
    id: "bling-bang-bang-born",
    title: "Bling-Bang-Bang-Born",
    artist: "Creepy Nuts",
    year: 2024,
    key: "Gm",
    bpm: 140,
    sections: [{ label: 'サビ', chords: ["Gm", "Eb", "Bb", "F"] }],
    tags: ["明るい"],
    category: "recent-hit",
    searchAliases: ["bling bang bang born", "creepy nuts", "マッシュル", "mashle"]
  },
  {
    id: "propose-natori",
    title: "プロポーズ",
    artist: "なとり",
    year: 2024,
    key: "F",
    bpm: 176,
    sections: [{ label: 'サビ', chords: ["Dm", "Bbmaj7", "A7", "Dm"] }],
    tags: ["エモい", "オシャレ"],
    category: "recent-hit",
    searchAliases: ["propose", "プロポーズ", "natori", "なとり"]
  },
  {
    id: "bansan-ka",
    title: "晩餐歌",
    artist: "tuki.",
    year: 2023,
    key: "Am",
    bpm: 75,
    sections: [{ label: 'サビ', chords: ["Am", "F", "C", "G"] }],
    tags: ["切ない", "エモい"],
    category: "recent-hit",
    searchAliases: ["bansanka", "晩餐歌", "tuki"]
  }
];
