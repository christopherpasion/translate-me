import type { Genre, EntityCategory } from '../types';

export interface GenreMetadata {
  id: Genre;
  nameEn: string;
  nameZh: string;
  category: 'cultivation' | 'transmigration' | 'modern' | 'history' | 'romance_suspense' | 'other';
  icon: string;
  badgeGradient: string;
  badgeBorder: string;
  badgeColor: string;
  description: string;
  translationToneGuide: string;
}

export interface StarterGlossaryItem {
  originalZh: string;
  translatedEn: string;
  category: EntityCategory;
  notes?: string;
}

export interface TropeTag {
  id: string;
  nameEn: string;
  nameZh: string;
  color: string;
}

export const GENRE_DEFINITIONS: Record<string, GenreMetadata> = {
  xianxia: {
    id: 'xianxia',
    nameEn: 'Xianxia / Immortal Cultivation',
    nameZh: '仙侠 / 修真',
    category: 'cultivation',
    icon: '⚔️',
    badgeGradient: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25) 0%, rgba(79, 70, 229, 0.25) 100%)',
    badgeBorder: 'rgba(0, 242, 254, 0.4)',
    badgeColor: 'var(--primary-cyan)',
    description: 'Immortal cultivation, Daoism, heavenly tribulations, and ascending the realms.',
    translationToneGuide: 'Grand, mystical cultivation prose. Preserve authentic terminology (Dantian, Golden Core, Dao Heart, Nascent Soul). Use epic archaic phrasing for martial techniques.'
  },
  xuanhuan: {
    id: 'xuanhuan',
    nameEn: 'Xuanhuan / Eastern Fantasy',
    nameZh: '玄幻 / 异界',
    category: 'cultivation',
    icon: '🐉',
    badgeGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
    badgeBorder: 'rgba(168, 85, 247, 0.4)',
    badgeColor: '#c084fc',
    description: 'High eastern fantasy, spirit beasts, divine bloodlines, and world dominators.',
    translationToneGuide: 'Majestic fantasy prose, imposing aura descriptions, dynamic fight choreography, and vibrant mythical creatures.'
  },
  wuxia: {
    id: 'wuxia',
    nameEn: 'Wuxia / Martial Arts',
    nameZh: '武侠 / 江湖',
    category: 'cultivation',
    icon: '🗡️',
    badgeGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
    badgeColor: '#fbbf24',
    description: 'Mortal martial heroes, sects, chivalry, Jianghu codes, and internal energy.',
    translationToneGuide: 'Poetic, chivalric martial arts prose with classical Chinese idioms translated fluently into English.'
  },
  'western-fantasy': {
    id: 'western-fantasy',
    nameEn: 'Western Fantasy & Magic',
    nameZh: '西幻 / 魔法',
    category: 'cultivation',
    icon: '🧙‍♂️',
    badgeGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(147, 51, 234, 0.25) 100%)',
    badgeBorder: 'rgba(59, 130, 246, 0.4)',
    badgeColor: '#60a5fa',
    description: 'Knights, dragons, archmages, mana circles, and continent wars.',
    translationToneGuide: 'High-fantasy Western narrative style with crisp magical incantations, chivalric knight titles, and medieval noble dialogue.'
  },
  isekai: {
    id: 'isekai',
    nameEn: 'Isekai / Transmigration',
    nameZh: '穿越 / 重生',
    category: 'transmigration',
    icon: '🌀',
    badgeGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
    badgeBorder: 'rgba(16, 185, 129, 0.4)',
    badgeColor: '#34d399',
    description: 'Soul transmigration, second-chance rebirth, and modern knowledge in ancient worlds.',
    translationToneGuide: 'Contrast the protagonist\'s modern internal monologue with ancient surroundings for natural, engaging storytelling.'
  },
  system: {
    id: 'system',
    nameEn: 'System & LitRPG',
    nameZh: '系统流 / 面板',
    category: 'transmigration',
    icon: '💻',
    badgeGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
    badgeBorder: 'rgba(6, 182, 212, 0.4)',
    badgeColor: 'var(--primary-cyan)',
    description: 'Status screens, attribute points, system notifications, quests, and cheat skills.',
    translationToneGuide: 'Format system notifications crisply with brackets e.g. [System Prompt: +10 Agility]. Keep game menus, stat readouts, and quest logs clean and formatted.'
  },
  gaming: {
    id: 'gaming',
    nameEn: 'Virtual Reality & Gaming',
    nameZh: '网游 / 电竞',
    category: 'transmigration',
    icon: '🎮',
    badgeGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(217, 70, 239, 0.25) 100%)',
    badgeBorder: 'rgba(139, 92, 246, 0.4)',
    badgeColor: '#a78bfa',
    description: 'Full-dive VRMMORPG, dungeon raiding, guild wars, and esports tournaments.',
    translationToneGuide: 'Modern gaming slang, DPS/Tank/Healer roles, cooldown timers, boss mechanics, and fast-paced competitive esports commentary.'
  },
  urban: {
    id: 'urban',
    nameEn: 'Modern Urban & Slice of Life',
    nameZh: '都市 / 生活',
    category: 'modern',
    icon: '🏙️',
    badgeGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(249, 115, 22, 0.25) 100%)',
    badgeBorder: 'rgba(234, 179, 8, 0.4)',
    badgeColor: '#facc15',
    description: 'Modern city life, campus romance, celebrity careers, and hidden masters in the city.',
    translationToneGuide: 'Natural, fluent modern colloquial dialogue with witty conversational timing.'
  },
  supernatural: {
    id: 'supernatural',
    nameEn: 'Supernatural & Urban Mystery',
    nameZh: '都市异能 / 灵异',
    category: 'modern',
    icon: '⚡',
    badgeGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
    badgeBorder: 'rgba(236, 72, 153, 0.4)',
    badgeColor: '#f472b6',
    description: 'Awakened espers, secret monster investigation agencies, and hidden superpowers.',
    translationToneGuide: 'Sleek urban action, tense suspense, esper power classifications (Rank E to SSS), and atmospheric investigations.'
  },
  business: {
    id: 'business',
    nameEn: 'Tycoon & Corporate Battle',
    nameZh: '商战 / 神豪',
    category: 'modern',
    icon: '💼',
    badgeGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(202, 138, 4, 0.25) 100%)',
    badgeBorder: 'rgba(16, 185, 129, 0.4)',
    badgeColor: '#34d399',
    description: 'Stock market dominance, tech conglomerates, acquisitions, and billionaire lifestyles.',
    translationToneGuide: 'Professional corporate terminology, executive hierarchy, financial strategy, and sharp high-stakes board negotiations.'
  },
  scifi: {
    id: 'scifi',
    nameEn: 'Sci-Fi, Cyberpunk & Mecha',
    nameZh: '科幻 / 赛博 / 机甲',
    category: 'modern',
    icon: '🚀',
    badgeGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
    badgeBorder: 'rgba(14, 165, 233, 0.4)',
    badgeColor: '#38bdf8',
    description: 'Starfleets, mecha battles, AI companions, cyberpunk megacorps, and interstellar colonizers.',
    translationToneGuide: 'Futuristic technical jargon, neural synchronization readouts, hard sci-fi terminology, and fast-paced space naval combat.'
  },
  historical: {
    id: 'historical',
    nameEn: 'Historical Kingdom & War',
    nameZh: '历史争霸 / 穿越架空',
    category: 'history',
    icon: '🏯',
    badgeGradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(180, 83, 9, 0.25) 100%)',
    badgeBorder: 'rgba(217, 119, 6, 0.4)',
    badgeColor: '#f59e0b',
    description: 'Dynasty wars, historical kingdom conquests, ancient weaponry, and military alliances.',
    translationToneGuide: 'Formal historical prose, authentic imperial titles (Your Majesty, General, Prime Minister), and strategic military analysis.'
  },
  court: {
    id: 'court',
    nameEn: 'Palace & Court Intrigue',
    nameZh: '宫斗 / 权谋 / 宅斗',
    category: 'history',
    icon: '👑',
    badgeGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(225, 29, 72, 0.25) 100%)',
    badgeBorder: 'rgba(244, 63, 94, 0.4)',
    badgeColor: '#fb7185',
    description: 'Harem intrigue, noble family schemes, imperial concubines, and throne succession.',
    translationToneGuide: 'Subtle, eloquent, and cutting dialogue filled with double meanings, imperial ranks, and formal etiquette.'
  },
  military: {
    id: 'military',
    nameEn: 'Military & Tactical Strategy',
    nameZh: '军事 / 战略',
    category: 'history',
    icon: '🎖️',
    badgeGradient: 'linear-gradient(135deg, rgba(100, 116, 139, 0.25) 0%, rgba(71, 85, 105, 0.25) 100%)',
    badgeBorder: 'rgba(100, 116, 139, 0.4)',
    badgeColor: '#94a3b8',
    description: 'Battlefield tactics, sieges, cavalry charges, logistics, and army command.',
    translationToneGuide: 'Crisp military commands, tactical formations, defensive lines, and relentless battlefield realism.'
  },
  romance: {
    id: 'romance',
    nameEn: 'Romance & Drama',
    nameZh: '言情 / 甜宠',
    category: 'romance_suspense',
    icon: '💖',
    badgeGradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.25) 0%, rgba(251, 113, 133, 0.25) 100%)',
    badgeBorder: 'rgba(244, 114, 182, 0.4)',
    badgeColor: '#f472b6',
    description: 'Emotional romance, sweet pampering, modern or ancient romantic drama.',
    translationToneGuide: 'Emotionally resonant, tender prose with dynamic romantic tension and natural emotional chemistry.'
  },
  danmei: {
    id: 'danmei',
    nameEn: 'Danmei / BL & GL',
    nameZh: '耽美 / 百合',
    category: 'romance_suspense',
    icon: '🌸',
    badgeGradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.25) 0%, rgba(244, 114, 182, 0.25) 100%)',
    badgeBorder: 'rgba(192, 132, 252, 0.4)',
    badgeColor: '#e879f9',
    description: 'Boy Love & Girl Love narratives, deep bonds, cultivation/modern partner dynamics.',
    translationToneGuide: 'Expressive, poignant, and elegant emotional pacing with strong character intimacy.'
  },
  horror: {
    id: 'horror',
    nameEn: 'Horror & Paranormal',
    nameZh: '灵异 / 惊悚恐怖',
    category: 'romance_suspense',
    icon: '👻',
    badgeGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(127, 29, 29, 0.25) 100%)',
    badgeBorder: 'rgba(239, 68, 68, 0.4)',
    badgeColor: '#f87171',
    description: 'Ghosts, urban legends, haunted rules, cursed items, and terrifying survival.',
    translationToneGuide: 'Atmospheric, chilling, and tense prose pacing with visceral dread and spine-tingling suspense.'
  },
  mystery: {
    id: 'mystery',
    nameEn: 'Mystery & Detective Suspense',
    nameZh: '悬疑 / 推理',
    category: 'romance_suspense',
    icon: '🔍',
    badgeGradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.25) 0%, rgba(51, 65, 85, 0.25) 100%)',
    badgeBorder: 'rgba(148, 163, 184, 0.4)',
    badgeColor: '#cbd5e1',
    description: 'Complex crime deduction, puzzles, secret societies, and psychological thrillers.',
    translationToneGuide: 'Intricate, analytical narrative rhythm with sharp deductive reasoning and plot twists.'
  },
  apocalyptic: {
    id: 'apocalyptic',
    nameEn: 'Post-Apocalyptic & Wasteland',
    nameZh: '末世 / 废土求生',
    category: 'romance_suspense',
    icon: '☣️',
    badgeGradient: 'linear-gradient(135deg, rgba(132, 204, 22, 0.25) 0%, rgba(101, 163, 13, 0.25) 100%)',
    badgeBorder: 'rgba(132, 204, 22, 0.4)',
    badgeColor: '#a3e635',
    description: 'Zombie apocalypse, wasteland survival, base building, and evolutionary mutations.',
    translationToneGuide: 'Gritty, desperate survival tone highlighting resource scarcity, mutation levels, and fortified sanctuary defenses.'
  },
  comedy: {
    id: 'comedy',
    nameEn: 'Comedy & Parody',
    nameZh: '轻松 / 沙雕搞笑',
    category: 'romance_suspense',
    icon: '🤣',
    badgeGradient: 'linear-gradient(135deg, rgba(250, 204, 21, 0.25) 0%, rgba(251, 146, 60, 0.25) 100%)',
    badgeBorder: 'rgba(250, 204, 21, 0.4)',
    badgeColor: '#fde047',
    description: 'Hilarious tropes, parody subversions, gag comedy, and lighthearted misunderstandings.',
    translationToneGuide: 'Breezy, comical, and witty prose with punchy comedic timing and hilarious localized banter.'
  }
};

export const WEB_NOVEL_TROPE_TAGS: TropeTag[] = [
  { id: 'op_mc', nameEn: 'Overpowered MC', nameZh: '无敌流', color: '#00f2fe' },
  { id: 'face_slapping', nameEn: 'Face Slapping', nameZh: '打脸爽文', color: '#f43f5e' },
  { id: 'kingdom_building', nameEn: 'Kingdom Building', nameZh: '种田流', color: '#10b981' },
  { id: 'infinite_flow', nameEn: 'Infinite Flow / Survival', nameZh: '无限流', color: '#8b5cf6' },
  { id: 'beast_taming', nameEn: 'Beast Taming', nameZh: '御兽流', color: '#f59e0b' },
  { id: 'alchemy', nameEn: 'Alchemy & Crafting', nameZh: '炼丹炼器', color: '#06b6d4' },
  { id: 'female_lead', nameEn: 'Female Protagonist', nameZh: '大女主', color: '#ec4899' },
  { id: 'invincible_start', nameEn: 'Invincible From Start', nameZh: '开局无敌', color: '#3b82f6' },
  { id: 'slow_burn', nameEn: 'Slow Burn Progression', nameZh: '凡人流', color: '#64748b' },
  { id: 'harem', nameEn: 'Multiple Leads / Harem', nameZh: '多女主', color: '#fb7185' },
  { id: 'villain_mc', nameEn: 'Villain Protagonist', nameZh: '反派流', color: '#ef4444' },
  { id: 'cozy_life', nameEn: 'Cozy & Daily Life', nameZh: '日常慢节奏', color: '#a3e635' }
];

export const GENRE_STARTER_GLOSSARIES: Record<string, StarterGlossaryItem[]> = {
  xianxia: [
    { originalZh: '丹田', translatedEn: 'Dantian', category: 'realm', notes: 'Energy center in lower abdomen' },
    { originalZh: '金丹', translatedEn: 'Golden Core', category: 'realm', notes: 'Core Formation realm' },
    { originalZh: '元婴', translatedEn: 'Nascent Soul', category: 'realm', notes: 'High cultivation realm' },
    { originalZh: '筑基', translatedEn: 'Foundation Establishment', category: 'realm', notes: 'Early cultivation realm' },
    { originalZh: '炼气', translatedEn: 'Qi Condensation', category: 'realm', notes: 'Entry realm' },
    { originalZh: '灵石', translatedEn: 'Spirit Stones', category: 'item', notes: 'Cultivation currency' },
    { originalZh: '天劫', translatedEn: 'Heavenly Tribulation', category: 'realm', notes: 'Divine lightning trial' },
    { originalZh: '飞剑', translatedEn: 'Flying Sword', category: 'item', notes: 'Cultivator weapon' },
    { originalZh: '储物袋', translatedEn: 'Storage Pouch', category: 'item', notes: 'Spatial pocket item' },
    { originalZh: '道心', translatedEn: 'Dao Heart', category: 'realm', notes: 'Cultivation resolve' }
  ],
  wuxia: [
    { originalZh: '江湖', translatedEn: 'Jianghu', category: 'location', notes: 'The martial world' },
    { originalZh: '轻功', translatedEn: 'Qinggong', category: 'item', notes: 'Lightness agility skill' },
    { originalZh: '内力', translatedEn: 'Internal Energy', category: 'realm', notes: 'Neigong energy' },
    { originalZh: '经脉', translatedEn: 'Meridians', category: 'realm', notes: 'Energy channels in body' },
    { originalZh: '穴道', translatedEn: 'Acupoints', category: 'realm', notes: 'Acupuncture pressure points' },
    { originalZh: '掌门', translatedEn: 'Sect Leader', category: 'character', notes: 'Head of a martial sect' },
    { originalZh: '暗器', translatedEn: 'Concealed Weapons', category: 'item', notes: 'Daggers, needles, darts' },
    { originalZh: '走火入魔', translatedEn: 'Qi Deviation', category: 'idiom', notes: 'Internal cultivation madness' }
  ],
  system: [
    { originalZh: '属性面板', translatedEn: 'Status Window', category: 'item', notes: 'System interface' },
    { originalZh: '经验值', translatedEn: 'Experience Points (EXP)', category: 'realm', notes: 'Level progression' },
    { originalZh: '主线任务', translatedEn: 'Main Quest', category: 'item', notes: 'System assigned objective' },
    { originalZh: '属性点', translatedEn: 'Attribute Points', category: 'item', notes: 'Stat distribution points' },
    { originalZh: '新手大礼包', translatedEn: 'Novice Gift Pack', category: 'item', notes: 'Starter reward bundle' },
    { originalZh: '技能树', translatedEn: 'Skill Tree', category: 'item', notes: 'Ability progression path' }
  ],
  historical: [
    { originalZh: '皇上', translatedEn: 'Your Majesty', category: 'character', notes: 'Imperial address' },
    { originalZh: '太子', translatedEn: 'Crown Prince', category: 'character', notes: 'Throne heir' },
    { originalZh: '丞相', translatedEn: 'Prime Minister', category: 'character', notes: 'Chief civil advisor' },
    { originalZh: '太后', translatedEn: 'Empress Dowager', category: 'character', notes: 'Mother of the Emperor' },
    { originalZh: '贵妃', translatedEn: 'Imperial Noble Consort', category: 'character', notes: 'High imperial consort' },
    { originalZh: '奉天承运', translatedEn: 'By the mandate of Heaven', category: 'idiom', notes: 'Imperial decree opening' }
  ],
  scifi: [
    { originalZh: '量子引擎', translatedEn: 'Quantum Engine', category: 'item', notes: 'Starship power drive' },
    { originalZh: '机甲', translatedEn: 'Mecha', category: 'item', notes: 'Piloted combat suit' },
    { originalZh: '星舰', translatedEn: 'Starship', category: 'item', notes: 'Interstellar combat vessel' },
    { originalZh: '曲率跃迁', translatedEn: 'Warp Jump', category: 'realm', notes: 'Faster-than-light travel' },
    { originalZh: '神经链接', translatedEn: 'Neural Link', category: 'item', notes: 'Direct cybernetic brain link' }
  ]
};

export function getGenreMeta(genreId: string | undefined): GenreMetadata {
  if (!genreId) return GENRE_DEFINITIONS.xianxia;
  const normalized = genreId.toLowerCase().trim();
  if (GENRE_DEFINITIONS[normalized]) {
    return GENRE_DEFINITIONS[normalized];
  }

  // Custom User Genre Fallback
  return {
    id: genreId,
    nameEn: genreId.charAt(0).toUpperCase() + genreId.slice(1),
    nameZh: genreId,
    category: 'other',
    icon: '✨',
    badgeGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
    badgeBorder: 'rgba(168, 85, 247, 0.4)',
    badgeColor: '#c084fc',
    description: `Custom genre: ${genreId}`,
    translationToneGuide: 'Translate faithfully with rich contextual prose suited to the narrative tone.'
  };
}

export function getAllGenreCategories(): Array<{ id: string; name: string; icon: string; genres: GenreMetadata[] }> {
  return [
    {
      id: 'cultivation',
      name: 'Immortal Cultivation & Fantasy (修真 / 玄幻)',
      icon: '⚔️',
      genres: [GENRE_DEFINITIONS.xianxia, GENRE_DEFINITIONS.xuanhuan, GENRE_DEFINITIONS.wuxia, GENRE_DEFINITIONS['western-fantasy']]
    },
    {
      id: 'transmigration',
      name: 'Transmigration & Systems (穿越 / 系统)',
      icon: '🌀',
      genres: [GENRE_DEFINITIONS.isekai, GENRE_DEFINITIONS.system, GENRE_DEFINITIONS.gaming]
    },
    {
      id: 'modern',
      name: 'Modern, Sci-Fi & Superpowers (都市 / 科幻)',
      icon: '🏙️',
      genres: [GENRE_DEFINITIONS.urban, GENRE_DEFINITIONS.supernatural, GENRE_DEFINITIONS.business, GENRE_DEFINITIONS.scifi]
    },
    {
      id: 'history',
      name: 'History, Court & Strategy (历史 / 权谋)',
      icon: '👑',
      genres: [GENRE_DEFINITIONS.historical, GENRE_DEFINITIONS.court, GENRE_DEFINITIONS.military]
    },
    {
      id: 'romance_suspense',
      name: 'Romance, Horror & Suspense (言情 / 悬疑)',
      icon: '💖',
      genres: [GENRE_DEFINITIONS.romance, GENRE_DEFINITIONS.danmei, GENRE_DEFINITIONS.horror, GENRE_DEFINITIONS.mystery, GENRE_DEFINITIONS.apocalyptic, GENRE_DEFINITIONS.comedy]
    }
  ];
}

export function getStarterGlossaryForGenre(genreId: string): StarterGlossaryItem[] {
  const normalized = genreId.toLowerCase().trim();
  if (GENRE_STARTER_GLOSSARIES[normalized]) {
    return GENRE_STARTER_GLOSSARIES[normalized];
  }
  if (normalized.includes('xianxia') || normalized.includes('xuanhuan') || normalized.includes('cultivation')) {
    return GENRE_STARTER_GLOSSARIES.xianxia;
  }
  if (normalized.includes('wuxia') || normalized.includes('martial')) {
    return GENRE_STARTER_GLOSSARIES.wuxia;
  }
  if (normalized.includes('system') || normalized.includes('litrpg') || normalized.includes('game')) {
    return GENRE_STARTER_GLOSSARIES.system;
  }
  if (normalized.includes('history') || normalized.includes('court') || normalized.includes('dynasty')) {
    return GENRE_STARTER_GLOSSARIES.historical;
  }
  if (normalized.includes('scifi') || normalized.includes('mecha') || normalized.includes('space')) {
    return GENRE_STARTER_GLOSSARIES.scifi;
  }
  return [];
}
