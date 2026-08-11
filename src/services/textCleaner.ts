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
  /切勿沉迷/i
];

/**
 * Intelligent Web Text Cleaner
 * Takes raw text copied from JJWXC, Qidian, or 69shuba,
 * strips website menus, footers, ad clutter, and paragraph numbers,
 * and extracts the clean novel title, chapter title, and story prose.
 */
export function smartCleanWebNovelText(rawInput: string): CleanedChapter {
  if (!rawInput) {
    return { chapterTitle: 'New Chapter', contentZh: '', strippedLinesCount: 0 };
  }

  const lines = rawInput.split('\n');
  let novelTitle: string | undefined;
  let author: string | undefined;
  let chapterTitle = 'New Chapter';
  let cleanLines: string[] = [];
  let strippedCount = 0;
  let insideStory = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (insideStory) cleanLines.push('');
      continue;
    }

    // Check if line matches known website noise patterns
    const isNoise = NOISE_LINE_PATTERNS.some(pattern => pattern.test(trimmed));
    if (isNoise || trimmed.startsWith('[') && trimmed.endsWith(']')) {
      strippedCount++;
      continue;
    }

    // Detect Author line (e.g., 作者：老肝妈)
    if (trimmed.startsWith('作者：') || trimmed.startsWith('作者:')) {
      author = trimmed.replace(/^作者[：:]\s*/, '');
      // The line before author is often the novel title
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
      const isChapterTitleLine = 
        trimmed.includes('狂暴') ||
        trimmed.includes('（') || trimmed.includes('(') ||
        trimmed.includes('第') || trimmed.includes('章') ||
        (trimmed.length < 25 && !trimmed.endsWith('。') && !trimmed.endsWith('！') && !trimmed.endsWith('？'));

      if (isChapterTitleLine) {
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
