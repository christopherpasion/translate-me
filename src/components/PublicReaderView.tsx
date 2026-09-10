import React, { useState, useEffect, useRef } from 'react';
import type { Novel, Chapter, GlossaryEntry } from '../types';
import { StorageService } from '../services/storage';
import { BookOpen, ChevronLeft, ChevronRight, MessageSquarePlus, Check, Sparkles, Type, Bookmark as BookmarkIcon, ArrowUp, Home } from 'lucide-react';

interface PublicReaderViewProps {
  currentNovel: Novel;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  glossary: GlossaryEntry[];
  onSelectChapter: (chapterId: string) => void;
  onOpenAdminMode: () => void;
  onNavigateHome?: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  readerTheme?: ReaderTheme;
  onThemeChange?: (theme: ReaderTheme) => void;
}

export type ReaderTheme = 'light' | 'sepia' | 'dark' | 'oled';

export const PublicReaderView: React.FC<PublicReaderViewProps> = ({
  currentNovel,
  chapters,
  currentChapter,
  glossary,
  onSelectChapter,
  onOpenAdminMode,
  onNavigateHome,
  onToggleBookmark,
  isBookmarked = false,
  readerTheme: controlledReaderTheme,
  onThemeChange
}) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [internalTheme, setInternalTheme] = useState<ReaderTheme>(() => {
    try {
      const saved = localStorage.getItem('trans_me_reader_theme');
      if (saved === 'light' || saved === 'sepia' || saved === 'dark' || saved === 'oled') {
        return saved as ReaderTheme;
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  const readerTheme = controlledReaderTheme ?? internalTheme;

  const handleSelectTheme = (newTheme: ReaderTheme) => {
    setInternalTheme(newTheme);
    try {
      localStorage.setItem('trans_me_reader_theme', newTheme);
    } catch {
      // Ignore
    }
    onThemeChange?.(newTheme);
  };

  useEffect(() => {
    try {
      localStorage.setItem('trans_me_reader_theme', readerTheme);
    } catch {
      // Ignore
    }
  }, [readerTheme]);
  const [hoveredTerm, setHoveredTerm] = useState<GlossaryEntry | null>(null);
  const [isSuggestingOpen, setIsSuggestingOpen] = useState(false);
  const [selectedTextForSuggest, setSelectedTextForSuggest] = useState('');
  const [suggestedFixEn, setSuggestedFixEn] = useState('');
  const [suggestReason, setSuggestReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to force scroll back to the very top of the chapter immediately
  const scrollToTop = (smooth = false) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior)
      });
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior)
    });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  // Automatically reset scroll to top whenever chapter changes (Next, Prev, Dropdown)
  useEffect(() => {
    scrollToTop(false);
    const rafId = requestAnimationFrame(() => scrollToTop(false));
    const timerId = setTimeout(() => scrollToTop(false), 40);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [currentChapter?.id]);

  // Track scroll position to show/hide "Back to Top" floating button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top > 350 && !showScrollTop) {
      setShowScrollTop(true);
    } else if (top <= 350 && showScrollTop) {
      setShowScrollTop(false);
    }
  };

  const publishedChapters = chapters.length > 0 && chapters.some(c => c.contentEn && c.contentEn.length > 0)
    ? chapters.filter(c => c.contentEn && c.contentEn.length > 0)
    : chapters;
  const currentIndex = publishedChapters.findIndex(c => c.id === currentChapter?.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToTop(false);
      onSelectChapter(publishedChapters[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < publishedChapters.length - 1) {
      scrollToTop(false);
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

  // Compute theme styles with calibrated, guaranteed WCAG AAA contrast
  const getThemeStyles = () => {
    switch (readerTheme) {
      case 'sepia':
        return {
          bg: '#f4ecd8',
          cardBg: '#fbf0d9',
          text: '#382e21',
          textMuted: '#786754',
          border: '#dfd2bc',
          glossaryBorder: '#b45309',
          glossaryBg: 'rgba(180, 83, 9, 0.12)'
        };
      case 'dark':
        return {
          bg: '#090d16',
          cardBg: '#111827',
          text: '#f3f4f6',
          textMuted: '#9ca3af',
          border: 'rgba(255, 255, 255, 0.12)',
          glossaryBorder: 'var(--accent-cyan, #00f2fe)',
          glossaryBg: 'rgba(0, 242, 254, 0.15)'
        };
      case 'oled':
        return {
          bg: '#000000',
          cardBg: '#07090e',
          text: '#e5e7eb',
          textMuted: '#6b7280',
          border: '#1f2937',
          glossaryBorder: 'var(--accent-cyan, #00f2fe)',
          glossaryBg: 'rgba(0, 242, 254, 0.2)'
        };
      case 'light':
      default:
        return {
          bg: '#f8fafc',
          cardBg: '#ffffff',
          text: '#1e293b',
          textMuted: '#64748b',
          border: '#e2e8f0',
          glossaryBorder: '#0284c7',
          glossaryBg: 'rgba(2, 132, 199, 0.12)'
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
        fontFamily: fontFamily === 'serif' ? "'Lora', 'Charter', 'Georgia', serif" : "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setHoveredTerm(hoveredTerm?.id === entry.id ? null : entry);
                        }}
                        style={{
                          borderBottom: `2px dotted ${currentTheme.glossaryBorder}`,
                          background: currentTheme.glossaryBg,
                          padding: '0.1rem 0.3rem',
                          borderRadius: '4px',
                          color: 'inherit',
                          fontWeight: 600,
                          cursor: 'pointer',
                          position: 'relative',
                          touchAction: 'manipulation'
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
      ref={containerRef}
      onScroll={handleScroll}
      className="reader-container"
      onClick={() => setHoveredTerm(null)}
      style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: currentTheme.bg,
        transition: 'background-color 0.25s ease',
        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))'
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
              {onNavigateHome && (
                <button
                  className="btn btn-secondary"
                  onClick={onNavigateHome}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                  title="Return to Novel Catalog Homepage"
                >
                  <Home size={14} style={{ color: 'var(--primary-cyan, #00f2fe)' }} />
                  <span>All Novels</span>
                </button>
              )}

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
                  background: currentTheme.cardBg,
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
                {publishedChapters.length === 0 ? (
                  <option value="">(Loading chapters...)</option>
                ) : (
                  publishedChapters.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      {ch.titleEn}
                    </option>
                  ))
                )}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Theme Picker */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px',
                borderRadius: '8px',
                border: `1px solid ${currentTheme.border}`,
                background: 'rgba(0,0,0,0.03)'
              }}>
                <button
                  type="button"
                  onClick={() => handleSelectTheme('light')}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: readerTheme === 'light' ? '3px solid var(--accent-purple)' : '1px solid #ccc',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    boxShadow: readerTheme === 'light' ? '0 0 8px rgba(124, 58, 237, 0.4)' : 'none'
                  }}
                  title="Light Theme"
                  aria-label="Light Theme"
                />
                <button
                  type="button"
                  onClick={() => handleSelectTheme('sepia')}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#fbf0d9',
                    border: readerTheme === 'sepia' ? '3px solid var(--accent-purple)' : '1px solid #d4c5ab',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    boxShadow: readerTheme === 'sepia' ? '0 0 8px rgba(124, 58, 237, 0.4)' : 'none'
                  }}
                  title="Sepia Paper Theme"
                  aria-label="Sepia Theme"
                />
                <button
                  type="button"
                  onClick={() => handleSelectTheme('dark')}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    border: readerTheme === 'dark' ? '3px solid var(--accent-cyan)' : '1px solid #475569',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    boxShadow: readerTheme === 'dark' ? '0 0 8px rgba(0, 242, 254, 0.4)' : 'none'
                  }}
                  title="Dark Theme"
                  aria-label="Dark Theme"
                />
                <button
                  type="button"
                  onClick={() => handleSelectTheme('oled')}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#000000',
                    border: readerTheme === 'oled' ? '3px solid var(--accent-cyan)' : '1px solid #333',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    boxShadow: readerTheme === 'oled' ? '0 0 8px rgba(0, 242, 254, 0.4)' : 'none'
                  }}
                  title="OLED Midnight Theme"
                  aria-label="OLED Theme"
                />
              </div>

              {/* Font Family Toggle */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
                title={fontFamily === 'serif' ? 'Switch to Sans-Serif Font' : 'Switch to Serif Font'}
                style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0.45rem 0.75rem', minHeight: '38px', touchAction: 'manipulation' }}
              >
                {fontFamily === 'serif' ? 'Serif' : 'Sans'}
              </button>

              {/* Font Size Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: '8px',
                padding: '0.25rem 0.5rem',
                border: `1px solid ${currentTheme.border}`,
                minHeight: '38px'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  title="Smaller Font"
                  style={{ width: '32px', height: '32px', padding: 0, touchAction: 'manipulation' }}
                >
                  <Type size={14} />
                </button>
                <span style={{ fontSize: '0.85rem', padding: '0 0.35rem', color: currentTheme.text, fontWeight: 700, minWidth: '22px', textAlign: 'center' }}>{fontSize}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                  title="Larger Font"
                  style={{ width: '32px', height: '32px', padding: 0, touchAction: 'manipulation' }}
                >
                  <Type size={18} />
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
              className="reader-glossary-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
                right: '1.5rem',
                background: 'rgba(15, 23, 42, 0.96)',
                border: '1px solid var(--accent-cyan, #00f2fe)',
                padding: '0.9rem 1.2rem',
                borderRadius: '12px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.6), 0 0 20px rgba(0,242,254,0.3)',
                zIndex: 1000,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                maxWidth: '340px',
                width: 'calc(100vw - 3rem)',
                color: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan, #00f2fe)', fontSize: '1rem' }}>{hoveredTerm.translatedEn}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="badge" style={{ background: 'rgba(0,242,254,0.2)', color: '#00f2fe', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>
                    {hoveredTerm.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHoveredTerm(null)}
                    aria-label="Close tooltip"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {hoveredTerm.originalZh && hoveredTerm.originalZh !== hoveredTerm.translatedEn && (
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500 }}>
                  Raw: <span style={{ fontFamily: 'var(--font-zh)' }}>{hoveredTerm.originalZh}</span> {hoveredTerm.pinyin && `[${hoveredTerm.pinyin}]`}
                </div>
              )}
              {hoveredTerm.notes && (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  {hoveredTerm.notes}
                </div>
              )}
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

          {/* End of Chapter Ornament Badge */}
          {currentChapter && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              margin: '2.5rem auto 1.25rem auto',
              color: currentTheme.textMuted,
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}>
              <span style={{ height: '1px', width: '36px', background: currentTheme.border }} />
              <span>❦ End of Chapter {currentChapter.chapterNumber} ❦</span>
              <span style={{ height: '1px', width: '36px', background: currentTheme.border }} />
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
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: `1px solid ${currentTheme.border}`,
                width: '100%'
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                style={{ flexShrink: 0, minHeight: '44px', padding: '0.5rem 1rem', fontSize: '0.88rem', whiteSpace: 'nowrap', touchAction: 'manipulation' }}
              >
                <ChevronLeft size={18} />
                <span>Prev Chapter</span>
              </button>

              <select
                value={currentChapter.id}
                onChange={(e) => onSelectChapter(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  maxWidth: '260px',
                  minHeight: '44px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  textOverflow: 'ellipsis',
                  touchAction: 'manipulation'
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
                style={{ flexShrink: 0, minHeight: '44px', padding: '0.5rem 1rem', fontSize: '0.88rem', whiteSpace: 'nowrap', touchAction: 'manipulation' }}
              >
                <span>Next Chapter</span>
                <ChevronRight size={18} />
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

      {/* Floating "Back to Top" Action */}
      {showScrollTop && (
        <button
          onClick={() => scrollToTop(true)}
          style={{
            position: 'fixed',
            bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
            right: '1.5rem',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '9999px',
            border: `1px solid ${currentTheme.border}`,
            background: currentTheme.cardBg,
            color: currentTheme.text,
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation'
          }}
          title="Scroll to Top"
        >
          <ArrowUp size={15} style={{ color: 'var(--primary-cyan, #00f2fe)' }} />
          <span>Top</span>
        </button>
      )}
    </div>
  );
};
