import React, { useState } from 'react';
import type { Novel, Chapter, GlossaryEntry } from '../types';
import { StorageService } from '../services/storage';
import { BookOpen, ChevronLeft, ChevronRight, MessageSquarePlus, Check, Sparkles, Type, Bookmark as BookmarkIcon } from 'lucide-react';

interface PublicReaderViewProps {
  currentNovel: Novel;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  glossary: GlossaryEntry[];
  onSelectChapter: (chapterId: string) => void;
  onOpenAdminMode: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
}

export type ReaderTheme = 'light' | 'sepia' | 'dark' | 'oled';

export const PublicReaderView: React.FC<PublicReaderViewProps> = ({
  currentNovel,
  chapters,
  currentChapter,
  glossary,
  onSelectChapter,
  onOpenAdminMode,
  onToggleBookmark,
  isBookmarked = false
}) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('light');
  const [hoveredTerm, setHoveredTerm] = useState<GlossaryEntry | null>(null);
  const [isSuggestingOpen, setIsSuggestingOpen] = useState(false);
  const [selectedTextForSuggest, setSelectedTextForSuggest] = useState('');
  const [suggestedFixEn, setSuggestedFixEn] = useState('');
  const [suggestReason, setSuggestReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const publishedChapters = chapters.filter(c => c.contentEn && c.contentEn.length > 0);
  const currentIndex = publishedChapters.findIndex(c => c.id === currentChapter?.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectChapter(publishedChapters[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < publishedChapters.length - 1) {
      onSelectChapter(publishedChapters[currentIndex + 1].id);
    }
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTextForSuggest || !suggestedFixEn) return;

    StorageService.saveReaderSuggestion({
      id: `sug-${Date.now()}`,
      novelId: currentNovel.id,
      chapterNumber: currentChapter?.chapterNumber || 1,
      originalZh: selectedTextForSuggest,
      currentEn: selectedTextForSuggest,
      suggestedEn: suggestedFixEn,
      reason: suggestReason || 'Reader term fix suggestion',
      submittedBy: 'ReaderGuest',
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsSuggestingOpen(false);
      setSelectedTextForSuggest('');
      setSuggestedFixEn('');
      setSuggestReason('');
    }, 1500);
  };

  // Compute theme styles
  const getThemeStyles = () => {
    switch (readerTheme) {
      case 'sepia':
        return {
          bg: '#fbf0d9',
          cardBg: '#f4ecd8',
          text: '#433422',
          textMuted: '#7f6f5d',
          border: '#e4d6be'
        };
      case 'dark':
        return {
          bg: '#0f172a',
          cardBg: '#1e293b',
          text: '#f8fafc',
          textMuted: '#94a3b8',
          border: '#334155'
        };
      case 'oled':
        return {
          bg: '#000000',
          cardBg: '#0a0a0a',
          text: '#e2e8f0',
          textMuted: '#64748b',
          border: '#27272a'
        };
      case 'light':
      default:
        return {
          bg: 'transparent',
          cardBg: 'var(--card-bg, #ffffff)',
          text: 'var(--text-main, #1e293b)',
          textMuted: 'var(--text-muted, #64748b)',
          border: 'var(--border-color, #e2e8f0)'
        };
    }
  };

  const currentTheme = getThemeStyles();

  // Render English Paragraphs with Interactive Glossary Term Tooltips
  const renderInteractiveEnglishParagraphs = (contentEn: string) => {
    if (!contentEn) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: currentTheme.textMuted }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Chapter Content Coming Soon</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>The author is currently preparing this chapter. Please check back soon!</p>
          <button className="btn btn-secondary" onClick={onOpenAdminMode} style={{ marginTop: '1.5rem' }}>
            Open Creator Studio to Upload
          </button>
        </div>
      );
    }

    const rawParagraphs = contentEn.split('\n').map(p => p.trim()).filter(Boolean);
    const rawTitle = currentChapter?.titleEn || '';
    const baseTitle = rawTitle
      .replace(/^Chapter\s+\d+:\s*/i, '')
      .replace(/\s*\(\d+\)\s*$/i, '')
      .trim()
      .toLowerCase();

    const noisePatterns = [
      /^subscription$/i,
      /^qrst$/i,
      /^\d+%$/,
      /^\d+\/\d+$/,
      /^\d+\s*(Indominus Dragon|狂暴龙)/i,
      /^[\s,.'"?!:`~*—…-]*$/,
      /^Ran Region/i,
      /^0\/10000$/
    ];

    // Filter out redundant chapter title headers & web footer noise
    const paragraphs = rawParagraphs.filter((pText, idx) => {
      const trimmed = pText.trim();
      if (noisePatterns.some(pat => pat.test(trimmed))) {
        return false;
      }

      if (idx <= 1) {
        const pClean = trimmed.toLowerCase().replace(/\s*\(\d+\)\s*$/i, '').trim();
        const isHeaderMatch = baseTitle && (pClean === baseTitle || baseTitle.includes(pClean) || pClean.includes(baseTitle));
        const isChapterPattern = /^(Chapter\s+\d+|Ch\.\s*\d+|Indominus Dragon|第一章|第二章|第三章|狂暴龙)/i.test(trimmed);
        const isShortTitleLine = trimmed.length < 35 && !/[.!?]$/.test(trimmed);

        if (isHeaderMatch || (isChapterPattern && isShortTitleLine)) {
          return false;
        }
      }
      return true;
    });

    return (
      <div style={{
        fontSize: `${fontSize}px`,
        lineHeight: '1.9',
        fontFamily: fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' : 'Inter, system-ui, sans-serif',
        color: currentTheme.text
      }}>
        {paragraphs.map((pText, pIdx) => {
          let elements: (string | React.ReactNode)[] = [pText];

          for (const entry of glossary) {
            const termRegex = new RegExp(`\\b(${entry.translatedEn})\\b`, 'gi');
            const nextElements: (string | React.ReactNode)[] = [];

            for (const el of elements) {
              if (typeof el === 'string') {
                const parts = el.split(termRegex);
                for (let i = 0; i < parts.length; i++) {
                  if (parts[i].toLowerCase() === entry.translatedEn.toLowerCase()) {
                    nextElements.push(
                      <span
                        key={`gloss-${pIdx}-${entry.id}-${i}`}
                        className="glossary-highlight"
                        onMouseEnter={() => setHoveredTerm(entry)}
                        onMouseLeave={() => setHoveredTerm(null)}
                        style={{
                          borderBottom: '2px dotted var(--accent-cyan, #00f2fe)',
                          color: 'inherit',
                          fontWeight: 600,
                          cursor: 'help',
                          position: 'relative'
                        }}
                      >
                        {parts[i]}
                      </span>
                    );
                  } else if (parts[i]) {
                    nextElements.push(parts[i]);
                  }
                }
              } else {
                nextElements.push(el);
              }
            }
            elements = nextElements;
          }

          return (
            <p key={pIdx} style={{ marginBottom: '1.5rem', textIndent: '1.5rem' }}>
              {elements}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="reader-container"
      style={{
        flex: 1,
        overflowY: 'auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: currentTheme.bg,
        transition: 'background-color 0.25s ease'
      }}
    >
      <div style={{ width: '100%', maxWidth: '880px', padding: '1.5rem 1rem' }}>
        {/* Reader Controls Toolbar */}
        <div
          className="glass-panel reader-toolbar-box"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-md, 12px)',
            border: `1px solid ${currentTheme.border}`,
            background: currentTheme.cardBg,
            color: currentTheme.text,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {/* Row 1: Novel Meta & Bookmark Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BookOpen size={20} style={{ color: 'var(--accent-cyan, #00f2fe)', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: currentTheme.text, margin: 0 }}>
                  {currentNovel.titleEn}
                </h2>
                <span style={{ fontSize: '0.75rem', color: currentTheme.textMuted }}>
                  By {currentNovel.author || 'Author'} • {publishedChapters.length} Chapter{publishedChapters.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {onToggleBookmark && (
                <button
                  className={`btn ${isBookmarked ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={onToggleBookmark}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    gap: '0.35rem',
                    background: isBookmarked ? 'linear-gradient(135deg, #f5576c, #f093fb)' : undefined,
                    color: isBookmarked ? '#fff' : currentTheme.text
                  }}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this Chapter'}
                >
                  <BookmarkIcon size={14} fill={isBookmarked ? '#fff' : 'none'} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              )}

              <button
                className="btn btn-secondary"
                onClick={() => setIsSuggestingOpen(true)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
              >
                <MessageSquarePlus size={14} /> Suggest Fix
              </button>
            </div>
          </div>

          {/* Row 2: Chapter Selector & Appearance Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: `1px solid ${currentTheme.border}`
          }}>
            {/* Chapter Navigation Pill Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: '220px' }}>
              <button
                className="btn btn-secondary btn-icon"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                title="Previous Chapter"
                style={{ flexShrink: 0 }}
              >
                <ChevronLeft size={16} />
              </button>

              <select
                value={currentChapter?.id || ''}
                onChange={(e) => onSelectChapter(e.target.value)}
                style={{
                  flex: 1,
                  background: currentTheme.bg === 'transparent' ? 'var(--bg-elevated, #f1f5f9)' : currentTheme.bg,
                  color: currentTheme.text,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: 0,
                  textOverflow: 'ellipsis'
                }}
              >
                {publishedChapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.titleEn}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-secondary btn-icon"
                onClick={handleNext}
                disabled={currentIndex >= publishedChapters.length - 1}
                title="Next Chapter"
                style={{ flexShrink: 0 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Reading Theme & Font Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Theme Picker */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 4px',
                borderRadius: '6px',
                border: `1px solid ${currentTheme.border}`
              }}>
                <button
                  onClick={() => setReaderTheme('light')}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: readerTheme === 'light' ? '2px solid var(--accent-purple)' : '1px solid #ccc',
                    cursor: 'pointer'
                  }}
                  title="Light Theme"
                />
                <button
                  onClick={() => setReaderTheme('sepia')}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fbf0d9',
                    border: readerTheme === 'sepia' ? '2px solid var(--accent-purple)' : '1px solid #d4c5ab',
                    cursor: 'pointer'
                  }}
                  title="Sepia Paper Theme"
                />
                <button
                  onClick={() => setReaderTheme('dark')}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    border: readerTheme === 'dark' ? '2px solid var(--accent-cyan)' : '1px solid #475569',
                    cursor: 'pointer'
                  }}
                  title="Dark Theme"
                />
                <button
                  onClick={() => setReaderTheme('oled')}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#000000',
                    border: readerTheme === 'oled' ? '2px solid var(--accent-cyan)' : '1px solid #333',
                    cursor: 'pointer'
                  }}
                  title="OLED Midnight Theme"
                />
              </div>

              {/* Font Family Toggle */}
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
                title={fontFamily === 'serif' ? 'Switch to Sans-Serif Font' : 'Switch to Serif Font'}
                style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 0.5rem' }}
              >
                {fontFamily === 'serif' ? 'Serif' : 'Sans'}
              </button>

              {/* Font Size Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                borderRadius: '6px',
                padding: '0.2rem 0.4rem',
                border: `1px solid ${currentTheme.border}`
              }}>
                <button className="btn btn-secondary btn-icon" onClick={() => setFontSize(Math.max(14, fontSize - 2))} title="Smaller Font">
                  <Type size={12} />
                </button>
                <span style={{ fontSize: '0.8rem', padding: '0 0.3rem', color: currentTheme.text, fontWeight: 600 }}>{fontSize}</span>
                <button className="btn btn-secondary btn-icon" onClick={() => setFontSize(Math.min(28, fontSize + 2))} title="Larger Font">
                  <Type size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chapter Content Card */}
        <div
          className="glass-panel reader-content-card"
          style={{
            background: currentTheme.cardBg,
            color: currentTheme.text,
            borderRadius: 'var(--radius-lg, 16px)',
            border: `1px solid ${currentTheme.border}`,
            padding: '2.5rem 2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            transition: 'all 0.25s ease'
          }}
        >
          {/* Floating Glossary Tooltip */}
          {hoveredTerm && (
            <div
              style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--accent-cyan, #00f2fe)',
                padding: '0.8rem 1.2rem',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,242,254,0.25)',
                zIndex: 100,
                backdropFilter: 'blur(10px)',
                maxWidth: '300px',
                color: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan, #00f2fe)', fontSize: '0.95rem' }}>{hoveredTerm.translatedEn}</span>
                <span className="badge" style={{ background: 'rgba(0,242,254,0.2)', color: '#00f2fe', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>
                  {hoveredTerm.category}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Original: {hoveredTerm.originalZh} {hoveredTerm.pinyin && `(${hoveredTerm.pinyin})`}</div>
              {hoveredTerm.notes && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{hoveredTerm.notes}</div>}
            </div>
          )}

          {/* Chapter Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem', borderBottom: `1px solid ${currentTheme.border}`, paddingBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: currentTheme.text }}>
              {currentChapter?.titleEn || 'Select a Chapter to Read'}
            </h1>
            <span style={{ fontSize: '0.85rem', color: currentTheme.textMuted }}>
              Chapter {currentChapter?.chapterNumber || 1} • {currentNovel.titleEn}
            </span>
          </div>

          {/* Chapter Prose Content */}
          {currentChapter ? (
            renderInteractiveEnglishParagraphs(currentChapter.contentEn)
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: currentTheme.textMuted }}>
              Please select a chapter from the dropdown above.
            </div>
          )}

          {/* Bottom Chapter Navigation Bar */}
          {currentChapter && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '3rem',
                paddingTop: '1.5rem',
                borderTop: `1px solid ${currentTheme.border}`,
                width: '100%'
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                style={{ flexShrink: 0, padding: '0.4rem 0.75rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                <ChevronLeft size={16} />
                <span>Prev Chapter</span>
              </button>

              <select
                value={currentChapter.id}
                onChange={(e) => onSelectChapter(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  maxWidth: '240px',
                  background: currentTheme.bg === 'transparent' ? 'var(--bg-elevated, #f1f5f9)' : currentTheme.bg,
                  color: currentTheme.text,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  textOverflow: 'ellipsis'
                }}
              >
                {publishedChapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.titleEn}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={currentIndex >= publishedChapters.length - 1}
                style={{ flexShrink: 0, padding: '0.4rem 0.75rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                <span>Next Chapter</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Reader Suggestion Modal */}
        {isSuggestingOpen && (
          <div
            className="modal-overlay"
            onClick={() => setIsSuggestingOpen(false)}
            style={{ zIndex: 120, background: 'rgba(5, 8, 16, 0.85)' }}
          >
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Suggest Fix to Author</h3>
                <button className="btn btn-secondary btn-icon" onClick={() => setIsSuggestingOpen(false)}>✕</button>
              </div>

              {isSubmitted ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-cyan)' }}>
                  <Check size={40} style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ color: 'var(--text-main)' }}>Suggestion Submitted!</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Thank you! The author will review your suggestion in their studio panel.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitSuggestion}>
                  <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                        Word or Phrase to Fix
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Character name typo"
                        value={selectedTextForSuggest}
                        onChange={(e) => setSelectedTextForSuggest(e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                        Your Suggested Fix
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Corrected name or term"
                        value={suggestedFixEn}
                        onChange={(e) => setSuggestedFixEn(e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                        Reason / Note (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Why should this be updated?"
                        value={suggestReason}
                        onChange={(e) => setSuggestReason(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setIsSuggestingOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      <Sparkles size={16} />
                      <span>Send Suggestion</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
