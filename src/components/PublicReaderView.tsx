import React, { useState } from 'react';
import type { Novel, Chapter, GlossaryEntry } from '../types';
import { StorageService } from '../services/storage';
import { BookOpen, ChevronLeft, ChevronRight, MessageSquarePlus, Check, Sparkles, Sun, Moon, Type } from 'lucide-react';

interface PublicReaderViewProps {
  currentNovel: Novel;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  glossary: GlossaryEntry[];
  onSelectChapter: (chapterId: string) => void;
  onOpenAdminMode: () => void;
}

export const PublicReaderView: React.FC<PublicReaderViewProps> = ({
  currentNovel,
  chapters,
  currentChapter,
  glossary,
  onSelectChapter,
  onOpenAdminMode
}) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'midnight'>('dark');
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

  // Render English Paragraphs with Interactive Glossary Term Tooltips
  const renderInteractiveEnglishParagraphs = (contentEn: string) => {
    if (!contentEn) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Chapter Translation Pending</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>The owner is currently translating this chapter. Please check back soon!</p>
          <button className="btn btn-secondary" onClick={onOpenAdminMode} style={{ marginTop: '1.5rem' }}>
            Switch to Admin Studio Mode
          </button>
        </div>
      );
    }

    const rawParagraphs = contentEn.split('\n').map(p => p.trim()).filter(Boolean);
    const titleClean = currentChapter?.titleEn?.replace(/^Chapter\s+\d+:\s*/i, '').trim().toLowerCase() || '';

    // Filter out redundant title line if it matches the chapter header title
    const paragraphs = rawParagraphs.filter((pText, idx) => {
      if (idx === 0 && titleClean) {
        const pClean = pText.toLowerCase();
        if (pClean === titleClean || titleClean.includes(pClean) || pClean.includes(titleClean)) {
          return false; // Skip redundant title line!
        }
      }
      return true;
    });

    return (
      <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.85', fontFamily: 'var(--font-en)' }}>
        {paragraphs.map((pText, pIdx) => {
          // Highlight glossary terms inside the paragraph
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
                          borderBottom: '2px dotted var(--primary-cyan)',
                          color: 'var(--primary-cyan)',
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
            <p key={pIdx} style={{ marginBottom: '1.4rem', textIndent: '1.5rem' }}>
              {elements}
            </p>
          );
        })}
      </div>
    );
  };

  // Theme Styles
  const themeBgMap = {
    dark: 'rgba(15, 23, 42, 0.75)',
    sepia: '#fbf0d9',
    midnight: '#070b14'
  };
  const themeTextMap = {
    dark: 'var(--text-main)',
    sepia: '#3f2d1d',
    midnight: '#e2e8f0'
  };

  return (
    <div className="reader-container" style={{ flex: 1, overflowY: 'auto', maxWidth: '900px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Reader Controls Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '0.75rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={20} style={{ color: 'var(--primary-cyan)' }} />
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{currentNovel.titleEn}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Public Reader View • 100% Fluent English</span>
          </div>
        </div>

        {/* Reader Display Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Font Size Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', padding: '0.2rem' }}>
            <button className="btn btn-secondary btn-icon" onClick={() => setFontSize(Math.max(14, fontSize - 2))} title="Smaller Font">
              <Type size={12} />
            </button>
            <span style={{ fontSize: '0.8rem', padding: '0 0.4rem', color: '#fff' }}>{fontSize}px</span>
            <button className="btn btn-secondary btn-icon" onClick={() => setFontSize(Math.min(26, fontSize + 2))} title="Larger Font">
              <Type size={16} />
            </button>
          </div>

          {/* Theme Selector */}
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTheme('dark')}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <Moon size={12} /> Dark
            </button>
            <button
              className={`btn ${theme === 'sepia' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTheme('sepia')}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <Sun size={12} /> Sepia
            </button>
          </div>

          {/* Suggest Correction Button */}
          <button
            className="btn btn-secondary"
            onClick={() => setIsSuggestingOpen(true)}
            style={{ fontSize: '0.8rem', color: 'var(--accent-amber)' }}
          >
            <MessageSquarePlus size={14} />
            <span>Suggest Fix</span>
          </button>
        </div>
      </div>

      {/* Novel Reading Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 3rem',
          background: themeBgMap[theme],
          color: themeTextMap[theme],
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          position: 'relative'
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
              border: '1px solid var(--primary-cyan)',
              padding: '0.8rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 25px rgba(0,242,254,0.25)',
              zIndex: 100,
              backdropFilter: 'blur(10px)',
              maxWidth: '300px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary-cyan)', fontSize: '0.95rem' }}>{hoveredTerm.translatedEn}</span>
              <span className={`badge badge-${hoveredTerm.category === 'character' ? 'xianxia' : 'scifi'}`}>
                {hoveredTerm.category}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#fff', fontFamily: 'var(--font-zh)' }}>Original Chinese: {hoveredTerm.originalZh}</div>
            {hoveredTerm.gender && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Gender: {hoveredTerm.gender}</div>}
          </div>
        )}

        {/* Chapter Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: theme === 'sepia' ? '#2c1e11' : '#fff' }}>
            {currentChapter?.titleEn || 'Select a Published Chapter'}
          </h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            Chapter {currentChapter?.chapterNumber || 1} • Translated by Owner Studio
          </p>
        </div>

        {/* Chapter Prose Content */}
        {currentChapter ? (
          renderInteractiveEnglishParagraphs(currentChapter.contentEn)
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Please select a chapter from the dropdown above.</div>
        )}

        {/* Chapter Navigation Footer */}
        {currentChapter && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '3rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <button className="btn btn-secondary" onClick={handlePrev} disabled={currentIndex <= 0}>
              <ChevronLeft size={16} />
              <span>Previous Chapter</span>
            </button>

            <select
              value={currentChapter.id}
              onChange={(e) => onSelectChapter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: theme === 'sepia' ? '#3f2d1d' : '#fff',
                border: '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem'
              }}
            >
              {publishedChapters.map(ch => (
                <option key={ch.id} value={ch.id} style={{ background: '#0f172a', color: '#fff' }}>
                  Ch. {ch.chapterNumber}: {ch.titleEn}
                </option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={handleNext} disabled={currentIndex >= publishedChapters.length - 1}>
              <span>Next Chapter</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Reader Suggestion Modal */}
      {isSuggestingOpen && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Suggest Translation Fix to Owner</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsSuggestingOpen(false)}>✕</button>
            </div>

            {isSubmitted ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--primary-cyan)' }}>
                <Check size={40} style={{ marginBottom: '0.5rem' }} />
                <h4>Suggestion Submitted!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Thank you! The novel owner will review your suggestion in their Owner Governance panel.
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
                      placeholder="e.g. Indominus Dragon or Xiao Yan"
                      value={selectedTextForSuggest}
                      onChange={(e) => setSelectedTextForSuggest(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                      Your Suggested English Translation
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Furious Dragon"
                      value={suggestedFixEn}
                      onChange={(e) => setSuggestedFixEn(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--primary-cyan)', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                      Reason / Note for Owner (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Why should this name or phrase be updated?"
                      value={suggestReason}
                      onChange={(e) => setSuggestReason(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsSuggestingOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <Sparkles size={16} />
                    <span>Send Suggestion to Owner</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
