import type { Novel, Chapter } from '../types';

/**
 * EPUB / E-Book Generator Utility
 * Packages all translated English novel chapters into a clean, standalone .epub / HTML e-book document
 * with a styled Table of Contents ready for Kindle, iPad, or browser reading!
 */
export function exportNovelToEpubHtml(novel: Novel, chapters: Chapter[]): void {
  const publishedChapters = chapters
    .filter(c => c.contentEn && c.contentEn.trim().length > 0)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  if (publishedChapters.length === 0) {
    alert('No translated English chapters available to export yet!');
    return;
  }

  const tocListHtml = publishedChapters.map(c => `
    <li>
      <a href="#chap-${c.chapterNumber}" style="color: #0284c7; text-decoration: none; font-weight: 600;">
        Chapter ${c.chapterNumber}: ${c.titleEn || c.titleZh}
      </a>
    </li>
  `).join('\n');

  const chaptersBodyHtml = publishedChapters.map(c => {
    const paragraphs = c.contentEn.split('\n').map(p => p.trim()).filter(Boolean);
    const bodyParagraphsHtml = paragraphs.map(p => `<p style="margin-bottom: 1.25rem; line-height: 1.8; text-indent: 1.5rem;">${escapeHtml(p)}</p>`).join('\n');

    return `
      <section id="chap-${c.chapterNumber}" style="page-break-before: always; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
        <h2 style="font-size: 1.75rem; color: #0f172a; margin-bottom: 0.5rem; text-align: center;">
          ${escapeHtml(c.titleEn || `Chapter ${c.chapterNumber}`)}
        </h2>
        <p style="text-align: center; color: #64748b; font-size: 0.9rem; margin-bottom: 2rem;">
          Chapter ${c.chapterNumber} • Original: ${escapeHtml(c.titleZh)}
        </p>
        <div class="chapter-body">
          ${bodyParagraphsHtml}
        </div>
      </section>
    `;
  }).join('\n');

  const fullBookHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(novel.titleEn || novel.titleZh)} - Complete Translated E-Book</title>
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.8;
      font-size: 18px;
    }
    h1 { font-family: sans-serif; text-align: center; color: #0284c7; margin-bottom: 0.5rem; }
    .author-subtitle { text-align: center; color: #64748b; font-style: italic; margin-bottom: 2rem; }
    .toc { background: #f8fafc; padding: 1.5rem 2rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 3rem; }
    .toc h3 { font-family: sans-serif; margin-top: 0; color: #0f172a; }
    .toc ul { list-style-type: none; padding-left: 0; line-height: 2; }
  </style>
</head>
<body>
  <header style="text-align: center; padding: 3rem 0; border-bottom: 2px solid #0284c7;">
    <h1>${escapeHtml(novel.titleEn)}</h1>
    <h3 style="color: #64748b; font-weight: normal;">${escapeHtml(novel.titleZh)}</h3>
    <p class="author-subtitle">Author: ${escapeHtml(novel.author || 'Unknown')} • Genre: ${escapeHtml(novel.genre.toUpperCase())}</p>
    <p style="font-size: 0.85rem; color: #94a3b8;">Translated by Self-Healing AI Studio</p>
  </header>

  <nav class="toc">
    <h3>📖 Table of Contents (${publishedChapters.length} Chapters)</h3>
    <ul>
      ${tocListHtml}
    </ul>
  </nav>

  <main>
    ${chaptersBodyHtml}
  </main>
</body>
</html>`;

  // Trigger Download as standalone e-book HTML file
  const blob = new Blob([fullBookHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${novel.titleEn.replace(/[^a-z0-9]/gi, '_')}_Complete_Ebook.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
