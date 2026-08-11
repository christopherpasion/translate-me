export interface CleanedChapter {
  novelTitle?: string;
  author?: string;
  chapterTitle: string;
  contentZh: string;
  strippedLinesCount: number;
}

// Noise patterns to strip out (Headers, Sidebars, Footers, Comment widgets, Copyrights)
const NOISE_LINE_PATTERNS = [
  /北京时间/i,
  /客户号：/i,
  /欢迎您，/i,
  /我的晋江/i,
  /晋江文学城logo/i,
  /完结文库/i,
  /出版影视/i,
  /小书喵悦读/i,
  /排行榜/i,
  /评论频道/i,
  /作者专区/i,
  /版权专区/i,
  /新闻活动/i,
  /征文活动/i,
  /求助投诉/i,
  /注册\/登入/i,
  /帮助/i,
  /娱乐/i,
  /完结衍生言情/i,
  /-原创性-/i,
  /-视角-/i,
  /-时代-/i,
  /-类型-/i,
  /-标签-/i,
  /筛选/i,
  /请输入关键字/i,
  /作品库/i,
  /深水鱼雷/i,
  /霸王票/i,
  /插入书签/i,
  /作者有话说/i,
  /显示所有文的作话/i,
  /←上一章/i,
  /下一章→/i,
  /作 者 推 文/i,
  /该作者现在暂无推文/i,
  /支持手机扫描二维码/i,
  /打开晋江App/i,
  /App下载点击/i,
  /wap阅读点击/i,
  /炸TA霸王票/i,
  /灌溉营养液/i,
  /评论按回复时间/i,
  /作者加精评论/i,
  /本文相关话题/i,
  /要看本章所有评论/i,
  /关于我们/i,
  /联系方式/i,
  /联系客服/i,
  /权利声明/i,
  /广告服务/i,
  /Copyright By/i,
  /www\.jjwxc\.net/i,
  /Processed in/i,
  /违规内容投诉/i,
  /本站作品/i,
  /请所有用户发布内容/i,
  /京ICP证/i,
  /京ICP备/i,
  /网出证/i,
  /京公网安备/i,
  /可信网站/i,
  /纯属虚构/i,
  /切勿沉迷/i,
  /^写作$/i,
  /^账务$/i,
  /^充值$/i,
  /^退出$/i,
  /^论坛$/i,
  /^繁体版$/i,
  /^APP下载$/i,
  /^关闭广告$/i,
  /^-范围-$/i,
  /^-视角-$/i,
  /^-类型-$/i,
  /^-时代-$/i,
  /^-标签-$/i,
  /^-性向-$/i,
  /^作品$/i,
  /^搜索$/i,
  /^读书$/i,
  /完结/i,
  /衍生/i,
  /纯爱/i,
  /古代纯爱/i,
  /未来幻想/i,
  /现代幻想/i,
  /现代都市/i,
  /佳向/i,
  /段\s*落\s*评\s*论/i,
  /嗑到了/i,
  /kswl/i,
  /打分：/i,
  /月石/i,
  /晋江币/i,
  /地雷/i,
  /手榴弹/i,
  /火箭炮/i,
  /浅水炸弹/i,
  /初级花匠/i,
  /营养液/i,
  /退钱/i,
  /昵称：/i,
  /评论主题：/i,
  /嗑糖功能/i,
  /交流灌水/i,
  /加精评论/i,
  /关段评/i,
  /目录/i,
  /详情页/i,
  /设置/i,
  /晋江APP/i,
  /回顶部/i,
  /★/i,
  /评论规则/i,
  /分享到/i,
  /新浪微博/i,
  /更多动态/i,
  /完整排行/i
];

// Custom Noise Rules LocalStorage Support
const CUSTOM_NOISE_RULES_KEY = 'trans_me_custom_noise_rules_v1';

export function getCustomNoiseRules(): string[] {
  const data = localStorage.getItem(CUSTOM_NOISE_RULES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addCustomNoiseRule(rule: string): string[] {
  const current = getCustomNoiseRules();
  const trimmed = rule.trim();
  if (trimmed && !current.includes(trimmed)) {
    const updated = [...current, trimmed];
    localStorage.setItem(CUSTOM_NOISE_RULES_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
}

export function removeCustomNoiseRule(rule: string): string[] {
  const current = getCustomNoiseRules();
  const updated = current.filter((r: string) => r !== rule);
  localStorage.setItem(CUSTOM_NOISE_RULES_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Intelligent Adaptive Web Text Cleaner
 * Automatically detects whether rawInput is a Full Web Page Dump (Ctrl+A)
 * OR Pure Chapter Story Prose, stripping website noise while preserving 100% of story prose!
 */
export function smartCleanWebNovelText(rawInput: string): CleanedChapter {
  if (!rawInput) {
    return { chapterTitle: 'New Chapter', contentZh: '', strippedLinesCount: 0 };
  }

  const lines = rawInput.split('\n');
  const customRules = getCustomNoiseRules();
  let novelTitle: string | undefined;
  let author: string | undefined;
  let chapterTitle = 'New Chapter';
  let cleanLines: string[] = [];
  let strippedCount = 0;
  let insideStory = false;

  // Check if input contains website navigation headers or custom noise rules
  const isFullPageDump = 
    NOISE_LINE_PATTERNS.some(pattern => pattern.test(rawInput)) || 
    customRules.some((rule: string) => rawInput.toLowerCase().includes(rule.toLowerCase())) ||
    rawInput.includes('晋江文学城') || rawInput.includes('我的晋江');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (insideStory) cleanLines.push('');
      continue;
    }

    // Full Page Dump & Custom Noise Rules Filter:
    if (isFullPageDump) {
      const isBuiltInNoise = NOISE_LINE_PATTERNS.some(pattern => pattern.test(trimmed));
      const isCustomNoise = customRules.some((rule: string) => trimmed.toLowerCase().includes(rule.toLowerCase()));

      if (isBuiltInNoise || isCustomNoise || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        strippedCount++;
        continue;
      }
    }

    // Detect Author line (e.g., 作者：老肝妈)
    if (trimmed.startsWith('作者：') || trimmed.startsWith('作者:')) {
      author = trimmed.replace(/^作者[：:]\s*/, '');
      if (i > 0 && !NOISE_LINE_PATTERNS.some(p => p.test(lines[i - 1]))) {
        const potentialNovelTitle = lines[i - 1].trim();
        if (potentialNovelTitle && !potentialNovelTitle.includes('http')) {
          novelTitle = potentialNovelTitle;
        }
      }
      continue;
    }

    // Detect Chapter Title (e.g. 狂暴龙（1）, 狂暴龙(1), 第1章)
    if (chapterTitle === 'New Chapter') {
      const isExplicitTitle = trimmed.includes('狂暴') || trimmed.includes('（') || trimmed.includes('(') || trimmed.includes('第') || trimmed.includes('章');
      const isNoiseTag = NOISE_LINE_PATTERNS.some(p => p.test(trimmed));
      const isShortTitleLine = isFullPageDump && !isNoiseTag && trimmed.length < 25 && !trimmed.endsWith('。') && !trimmed.endsWith('！') && !trimmed.endsWith('？');

      if (!isNoiseTag && (isExplicitTitle || isShortTitleLine)) {
        chapterTitle = trimmed.replace(/\d+$/, '').trim();
        insideStory = true;
        continue; // Do not duplicate title line into story content
      }
    }

    // Story Paragraph Processing:
    // Strip trailing JJWXC comment overlay numbers (e.g. "她做了一个梦。284" -> "她做了一个梦。")
    let cleanedParagraph = trimmed.replace(/(\D+)\d{1,4}$/, '$1').trim();

    if (cleanedParagraph) {
      insideStory = true;
      cleanLines.push(cleanedParagraph);
    }
  }

  // Remove leading/trailing empty lines
  while (cleanLines.length > 0 && !cleanLines[0]) cleanLines.shift();
  while (cleanLines.length > 0 && !cleanLines[cleanLines.length - 1]) cleanLines.pop();

  return {
    novelTitle,
    author,
    chapterTitle,
    contentZh: cleanLines.join('\n'),
    strippedLinesCount: strippedCount
  };
}

/**
 * Bulk Multi-Chapter Importer & Splitter
 * Detects multiple chapter headers (e.g. 第1章, 第2章, Chapter 1, Chapter 2) in a single pasted text
 * and splits them into an array of clean chapter objects!
 */
export function splitBulkChapters(rawInput: string): CleanedChapter[] {
  if (!rawInput.trim()) return [];

  // Match chapter header boundaries like "第12章", "第十二章", "Chapter 12"
  const chapterHeaderRegex = /(?=\n\s*(?:第\s*[\d一二三四五六七八九十百千]+\s*章|Chapter\s+\d+))/i;
  const rawChunks = rawInput.split(chapterHeaderRegex).map(c => c.trim()).filter(Boolean);

  if (rawChunks.length <= 1) {
    return [smartCleanWebNovelText(rawInput)];
  }

  return rawChunks.map(chunk => smartCleanWebNovelText(chunk));
}
