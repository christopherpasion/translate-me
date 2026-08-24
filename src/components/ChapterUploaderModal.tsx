import React, { useState, useMemo } from 'react';
import type { Novel, Chapter } from '../types';
import { Upload, FileText, Check, X, Layers, Sparkles } from 'lucide-react';
import { cleanAndTranslateChapterTitle } from '../services/translationEngine';

interface ParsedChapterPreview {
  chapterNumber: number;
  titleEn: string;
  titleZh: string;
  contentEn: string;
  contentZh: string;
  wordCount: number;
}

interface ChapterUploaderModalProps {
  novels: Novel[];
  selectedNovelId: string;
  existingChapters: Chapter[];
  onUploadSingleChapter: (novelId: string, chapter: Omit<Chapter, 'id' | 'updatedAt' | 'extractedTermsCount' | 'selfHealedCount'>) => void;
  onUploadBulkChapters: (novelId: string, chapters: Omit<Chapter, 'id' | 'updatedAt' | 'extractedTermsCount' | 'selfHealedCount'>[]) => void;
  onClose: () => void;
}

export const ChapterUploaderModal: React.FC<ChapterUploaderModalProps> = ({
  novels,
  selectedNovelId,
  existingChapters,
  onUploadSingleChapter,
  onUploadBulkChapters,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [novelId, setNovelId] = useState(selectedNovelId);

  // Single Chapter State
  const nextChapNum = useMemo(() => {
    if (!existingChapters || existingChapters.length === 0) return 1;
    const maxNum = Math.max(...existingChapters.map(c => c.chapterNumber || 0));
    return maxNum + 1;
  }, [existingChapters]);

  const [chapNum, setChapNum] = useState<number>(nextChapNum);
  const [titleEn, setTitleEn] = useState(`Chapter ${nextChapNum}`);
  const [titleZh, setTitleZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentZh, setContentZh] = useState('');
  const [isSingleSuccess, setIsSingleSuccess] = useState(false);

  // Bulk Chapters State
  const [bulkRawText, setBulkRawText] = useState('');
  const [bulkFileName, setBulkFileName] = useState('');
  const [isBulkSuccess, setIsBulkSuccess] = useState(false);

  // Parse bulk raw text into distinct chapters
  const parsedChapters = useMemo<ParsedChapterPreview[]>(() => {
    if (!bulkRawText.trim()) return [];

    const lines = bulkRawText.split('\n');
    const chapters: ParsedChapterPreview[] = [];

    // Regex for matching chapter headers (e.g. "Chapter 1", "Chapter 1: The Beginning", "第1章 标题", "### Chapter 1")
    const chapterHeaderRegex = /^(?:#{1,3}\s*)?(?:(?:Chapter|Chap|Ch\.)\s*(\d+)[:\s-]*(.*)|第([0-9一二三四五六七八九十百千万]+)章\s*(.*))$/i;

    let currentChapter: Partial<ParsedChapterPreview> | null = null;
    let currentParagraphs: string[] = [];
    let detectedIndex = existingChapters.length > 0 ? Math.max(...existingChapters.map(c => c.chapterNumber || 0)) + 1 : 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(chapterHeaderRegex);

      if (match) {
        // Save previous chapter if exists
        if (currentChapter && currentParagraphs.length > 0) {
          const content = currentParagraphs.join('\n\n').trim();
          chapters.push({
            chapterNumber: currentChapter.chapterNumber || detectedIndex++,
            titleEn: currentChapter.titleEn || `Chapter ${currentChapter.chapterNumber}`,
            titleZh: currentChapter.titleZh || '',
            contentEn: content,
            contentZh: currentChapter.contentZh || '',
            wordCount: content.split(/\s+/).filter(Boolean).length
          });
          currentParagraphs = [];
        }

        // Parse new chapter
        const numStr = match[1] || match[3];
        const titleStr = (match[2] || match[4] || '').trim();
        const parsedNum = numStr && /^\d+$/.test(numStr) ? parseInt(numStr, 10) : detectedIndex++;
        const cleanedTitle = cleanAndTranslateChapterTitle(titleStr || `Chapter ${parsedNum}`, parsedNum);

        currentChapter = {
          chapterNumber: parsedNum,
          titleEn: cleanedTitle.startsWith('Chapter') ? cleanedTitle : `Chapter ${parsedNum}: ${cleanedTitle}`,
          titleZh: titleStr || '',
          contentZh: ''
        };
      } else {
        if (line) {
          currentParagraphs.push(line);
        }
      }
    }

    // Flush last chapter
    if (currentChapter && currentParagraphs.length > 0) {
      const content = currentParagraphs.join('\n\n').trim();
      chapters.push({
        chapterNumber: currentChapter.chapterNumber || detectedIndex++,
        titleEn: currentChapter.titleEn || `Chapter ${currentChapter.chapterNumber}`,
        titleZh: currentChapter.titleZh || '',
        contentEn: content,
        contentZh: currentChapter.contentZh || '',
        wordCount: content.split(/\s+/).filter(Boolean).length
      });
    } else if (chapters.length === 0 && currentParagraphs.length > 0) {
      // Fallback: If no explicit headers found, treat entire text as single chapter
      const content = currentParagraphs.join('\n\n').trim();
      chapters.push({
        chapterNumber: nextChapNum,
        titleEn: `Chapter ${nextChapNum}`,
        titleZh: '',
        contentEn: content,
        contentZh: '',
        wordCount: content.split(/\s+/).filter(Boolean).length
      });
    }

    return chapters;
  }, [bulkRawText, existingChapters, nextChapNum]);

  // Handle file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBulkRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentEn.trim()) return;

    onUploadSingleChapter(novelId, {
      novelId,
      chapterNumber: chapNum,
      titleEn: titleEn.trim() || `Chapter ${chapNum}`,
      titleZh: titleZh.trim() || '',
      contentEn: contentEn.trim(),
      contentZh: contentZh.trim() || '',
      status: 'translated'
    });

    setIsSingleSuccess(true);
    setTimeout(() => {
      setIsSingleSuccess(false);
      setContentEn('');
      setContentZh('');
      setChapNum(prev => prev + 1);
      setTitleEn(`Chapter ${chapNum + 1}`);
      onClose();
    }, 600);
  };

  const handleBulkSubmit = () => {
    if (parsedChapters.length === 0) return;

    const payload = parsedChapters.map(p => ({
      novelId,
      chapterNumber: p.chapterNumber,
      titleEn: p.titleEn,
      titleZh: p.titleZh,
      contentEn: p.contentEn,
      contentZh: p.contentZh,
      status: 'translated' as const
    }));

    onUploadBulkChapters(novelId, payload);
    setIsBulkSuccess(true);
    setTimeout(() => {
      setIsBulkSuccess(false);
      setBulkRawText('');
      setBulkFileName('');
      onClose();
    }, 700);
  };

  const selectedNovel = novels.find(n => n.id === novelId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', width: '92vw', maxHeight: '90vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Chapter Uploader
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Publish chapters directly for readers to enjoy
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem', overflowY: 'auto' }}>
          {/* Novel Target Selector */}
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', minWidth: '100px' }}>
              Target Novel:
            </label>
            <select
              className="form-control"
              value={novelId}
              onChange={(e) => setNovelId(e.target.value)}
              style={{ flex: 1 }}
            >
              {novels.map(n => (
                <option key={n.id} value={n.id}>
                  {n.titleEn} ({n.titleZh})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.06)',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'single' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'single' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeTab === 'single' ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: activeTab === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <FileText size={14} /> Single Chapter Paste
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'bulk' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'bulk' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeTab === 'bulk' ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: activeTab === 'bulk' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Layers size={14} /> Bulk File Drop & Auto-Splitter
            </button>
          </div>

          {activeTab === 'single' ? (
            /* Single Chapter Form */
            <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Chapter #
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={chapNum}
                    onChange={(e) => setChapNum(parseInt(e.target.value, 10) || 1)}
                    min={1}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    English Chapter Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Chapter 1: The Fallen Genius"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Original Chinese Title (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 第一章 陨落的天才"
                  value={titleZh}
                  onChange={(e) => setTitleZh(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  English Chapter Content (Prose) *
                </label>
                <textarea
                  className="form-control"
                  placeholder="Paste your translated English chapter prose here..."
                  rows={9}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  style={{ fontFamily: 'var(--font-serif)', fontSize: '0.92rem', lineHeight: '1.6' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Original Chinese Text (Optional, for bilingual studio alignment)
                </label>
                <textarea
                  className="form-control"
                  placeholder="Paste raw Chinese text here if you want side-by-side alignment..."
                  rows={4}
                  value={contentZh}
                  onChange={(e) => setContentZh(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isSingleSuccess ? (
                  <>
                    <Check size={18} /> Published Successfully!
                  </>
                ) : (
                  <>
                    <Upload size={18} /> Publish Chapter to {selectedNovel?.titleEn}
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Bulk File Drop & Auto-Splitter */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* File Upload Zone */}
              <div
                style={{
                  border: '2px dashed var(--accent-purple)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'rgba(157, 78, 221, 0.04)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <Upload size={32} style={{ color: 'var(--accent-purple)', margin: '0 auto 0.5rem auto' }} />
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--text-main)' }}>
                  {bulkFileName ? `Uploaded: ${bulkFileName}` : 'Drop a .txt or .md file with multiple chapters here'}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Automatically splits chapters on headers like "Chapter 1", "Chapter 2: Title", or "第X章"
                </span>
              </div>

              {/* Or Paste Raw Text */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Or Paste Multi-Chapter Text directly:
                </label>
                <textarea
                  className="form-control"
                  placeholder="Chapter 1: The Beginning&#10;Prose text for chapter 1...&#10;&#10;Chapter 2: The Journey&#10;Prose text for chapter 2..."
                  rows={6}
                  value={bulkRawText}
                  onChange={(e) => setBulkRawText(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Parsed Preview */}
              {parsedChapters.length > 0 && (
                <div className="glass-panel" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
                      <Sparkles size={16} />
                      <strong style={{ fontSize: '0.9rem' }}>Detected {parsedChapters.length} Chapter{parsedChapters.length === 1 ? '' : 's'}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total Words: {parsedChapters.reduce((acc, c) => acc + c.wordCount, 0).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {parsedChapters.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.6rem',
                          background: 'rgba(0,0,0,0.03)',
                          borderRadius: '6px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {p.titleEn}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {p.wordCount.toLocaleString()} words
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleBulkSubmit}
                    style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    {isBulkSuccess ? (
                      <>
                        <Check size={18} /> Imported {parsedChapters.length} Chapters!
                      </>
                    ) : (
                      <>
                        <Upload size={18} /> Import All {parsedChapters.length} Chapters to {selectedNovel?.titleEn}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
