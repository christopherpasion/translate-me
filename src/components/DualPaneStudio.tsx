import React, { useRef, useState } from 'react';
import type { Chapter, GlossaryEntry, SelfHealingRecord } from '../types';
import { ShieldCheck, Edit2, Check, RefreshCw, Sparkles, Lock, Unlock } from 'lucide-react';

interface DualPaneStudioProps {
  chapter: Chapter | null;
  glossary: GlossaryEntry[];
  healingRecords: SelfHealingRecord[];
  onSaveContent: (contentZh: string, contentEn: string) => void;
  onQuickUpdateGlossary: (originalZh: string, newEn: string) => void;
  onReTranslateChapter: () => void;
  onPolishProse?: () => void;
}

export const DualPaneStudio: React.FC<DualPaneStudioProps> = ({
  chapter,
  glossary,
  healingRecords,
  onSaveContent,
  onQuickUpdateGlossary,
  onReTranslateChapter,
  onPolishProse
}) => {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef<boolean>(false);

  // Inline editing popover state
  const [editingTerm, setEditingTerm] = useState<{ zh: string; en: string; x: number; y: number } | null>(null);
  const [newEnInput, setNewEnInput] = useState('');

  // Synchronous Cross-Highlighting State across Chinese and English panes
  const [hoveredTermZh, setHoveredTermZh] = useState<string | null>(null);

  // Editable raw text states
  const [isEditingZh, setIsEditingZh] = useState(false);
  const [rawZhText, setRawZhText] = useState(chapter?.contentZh || '');
  const [isEditingEn, setIsEditingEn] = useState(false);
  const [rawEnText, setRawEnText] = useState(chapter?.contentEn || '');

  // Scroll Sync Lock Toggle State
  const [isScrollSyncLocked, setIsScrollSyncLocked] = useState(true);

  // Synchronized Paragraph-Aligned Scrolling Logic
  const handleScroll = (source: 'left' | 'right') => {
    if (!isScrollSyncLocked || isSyncingRef.current) return;
    isSyncingRef.current = true;

    const sourcePane = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const targetPane = source === 'left' ? rightPaneRef.current : leftPaneRef.current;

    if (sourcePane && targetPane) {
      const sourceParas = Array.from(sourcePane.querySelectorAll('p'));
      const targetParas = Array.from(targetPane.querySelectorAll('p'));

      if (sourceParas.length > 0 && targetParas.length > 0) {
        const paneTop = sourcePane.getBoundingClientRect().top;
        let activeIdx = 0;

        for (let i = 0; i < sourceParas.length; i++) {
          const pTop = sourceParas[i].getBoundingClientRect().top - paneTop;
          if (pTop >= 0) {
            activeIdx = i;
            break;
          }
        }

        const targetActivePara = targetParas[Math.min(activeIdx, targetParas.length - 1)];
        if (targetActivePara) {
          const targetOffset = targetActivePara.offsetTop - targetPane.offsetTop;
          targetPane.scrollTop = targetOffset;
        }
      } else {
        const percentage = sourcePane.scrollTop / (sourcePane.scrollHeight - sourcePane.clientHeight || 1);
        targetPane.scrollTop = percentage * (targetPane.scrollHeight - targetPane.clientHeight);
      }
    }

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 60);
  };

  if (!chapter) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>No chapter selected. Please create or select a chapter to view.</p>
      </div>
    );
  }

  // Highlight Glossary Terms in Chinese Text
  const renderChineseContent = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split('\n');

    return paragraphs.map((para, pIdx) => {
      if (!para.trim()) return <br key={pIdx} />;

      return (
        <p key={pIdx} style={{ marginBottom: '1rem' }}>
          {renderHighlightedZhParagraph(para)}
        </p>
      );
    });
  };

  const renderHighlightedZhParagraph = (para: string) => {
    const sortedGlossary = [...glossary].sort((a, b) => b.originalZh.length - a.originalZh.length);
    const regexParts = sortedGlossary.map(g => escapeRegExp(g.originalZh)).filter(Boolean);

    if (regexParts.length === 0) return para;

    const regex = new RegExp(`(${regexParts.join('|')})`, 'g');
    const parts = para.split(regex);

    return parts.map((part, i) => {
      const matched = sortedGlossary.find(g => g.originalZh === part);
      if (matched) {
        const isHovered = hoveredTermZh === matched.originalZh;
        return (
          <span
            key={i}
            className={`term-highlight ${isHovered ? 'term-highlight-active' : ''}`}
            title={`Mapped to: "${matched.translatedEn}" (${matched.category})`}
            onMouseEnter={() => setHoveredTermZh(matched.originalZh)}
            onMouseLeave={() => setHoveredTermZh(null)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const isBottomScreen = rect.bottom > window.innerHeight - 200;
              setEditingTerm({
                zh: matched.originalZh,
                en: matched.translatedEn,
                x: rect.left,
                y: isBottomScreen ? rect.top - 165 : rect.bottom + 5
              });
              setNewEnInput(matched.translatedEn);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Render Highlighted English Content with Self-Healing Badges & Synchronous Cross-Highlighting
  const renderEnglishContent = (text: string) => {
    if (!text) return null;
    const rawParagraphs = text.split('\n').map(p => p.trim()).filter(Boolean);
    const titleClean = chapter?.titleEn?.replace(/^Chapter\s+\d+:\s*/i, '').trim().toLowerCase() || '';

    const paragraphs = rawParagraphs.filter((para, idx) => {
      if (idx === 0 && titleClean) {
        const pClean = para.toLowerCase();
        if (pClean === titleClean || titleClean.includes(pClean) || pClean.includes(titleClean)) {
          return false; // Skip redundant title line!
        }
      }
      return true;
    });

    return paragraphs.map((para, pIdx) => {
      return (
        <p key={pIdx} style={{ marginBottom: '1rem' }}>
          {renderHighlightedEnParagraph(para)}
        </p>
      );
    });
  };

  const renderHighlightedEnParagraph = (para: string) => {
    const sortedGlossary = [...glossary].sort((a, b) => b.translatedEn.length - a.translatedEn.length);
    const regexParts = sortedGlossary.map(g => escapeRegExp(g.translatedEn)).filter(Boolean);

    if (regexParts.length === 0) return para;

    const regex = new RegExp(`\\b(${regexParts.join('|')})\\b`, 'gi');
    const parts = para.split(regex);

    return parts.map((part, i) => {
      const matched = sortedGlossary.find(g => g.translatedEn.toLowerCase() === part.toLowerCase());
      if (matched) {
        const isHovered = hoveredTermZh === matched.originalZh;
        const healedRecord = healingRecords.find(h => h.termZh === matched.originalZh);
        if (healedRecord) {
          return (
            <span
              key={i}
              className={`self-healed-badge ${isHovered ? 'term-highlight-active' : ''}`}
              title={`[Self-Healed Agent] Auto-corrected drift "${healedRecord.incorrectEn}" -> "${matched.translatedEn}"`}
              onMouseEnter={() => setHoveredTermZh(matched.originalZh)}
              onMouseLeave={() => setHoveredTermZh(null)}
            >
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
              {part}
            </span>
          );
        }

        return (
          <span
            key={i}
            className={`term-highlight ${isHovered ? 'term-highlight-active' : ''}`}
            title={`Glossary Term (${matched.category}): Original ZH "${matched.originalZh}"`}
            onMouseEnter={() => setHoveredTermZh(matched.originalZh)}
            onMouseLeave={() => setHoveredTermZh(null)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const isBottomScreen = rect.bottom > window.innerHeight - 200;
              setEditingTerm({
                zh: matched.originalZh,
                en: matched.translatedEn,
                x: rect.left,
                y: isBottomScreen ? rect.top - 165 : rect.bottom + 5
              });
              setNewEnInput(matched.translatedEn);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleSaveInlineEdit = () => {
    if (editingTerm && newEnInput.trim()) {
      onQuickUpdateGlossary(editingTerm.zh, newEnInput.trim());
      setEditingTerm(null);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div className="pane-split">
        {/* LEFT PANE: Chinese Raw Text */}
        <div className="editor-pane">
          <div className="pane-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-cyan)' }}></span>
              <span>Raw Chinese Source (原文)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Scroll Sync Lock Toggle */}
              <button
                className={`btn ${isScrollSyncLocked ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                onClick={() => setIsScrollSyncLocked(!isScrollSyncLocked)}
                title={isScrollSyncLocked ? 'Scroll Sync Locked: Both panes scroll together paragraph by paragraph. Click to unlock.' : 'Scroll Sync Unlocked: Panes scroll independently. Click to lock.'}
              >
                {isScrollSyncLocked ? <Lock size={12} style={{ color: 'var(--primary-cyan)' }} /> : <Unlock size={12} />}
                <span>{isScrollSyncLocked ? 'Sync Scroll' : 'Free Scroll'}</span>
              </button>

              {isEditingZh ? (
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    onSaveContent(rawZhText, chapter.contentEn);
                    setIsEditingZh(false);
                  }}
                >
                  <Check size={12} /> Save Raw
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    setRawZhText(chapter.contentZh);
                    setIsEditingZh(true);
                  }}
                >
                  <Edit2 size={12} /> Edit Raw
                </button>
              )}
            </div>
          </div>

          <div
            className="pane-content chinese-text"
            ref={leftPaneRef}
            onScroll={() => handleScroll('left')}
          >
            {isEditingZh ? (
              <textarea
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  color: '#fff',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.15rem',
                  fontFamily: 'var(--font-zh)',
                  lineHeight: '2',
                  resize: 'none'
                }}
                value={rawZhText}
                onChange={(e) => setRawZhText(e.target.value)}
              />
            ) : (
              renderChineseContent(chapter.contentZh)
            )}
          </div>
        </div>

        {/* RIGHT PANE: English Translation */}
        <div className="editor-pane">
          <div className="pane-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
              <span>Self-Healed English Translation</span>
              {chapter.selfHealedCount > 0 && (
                <span className="badge badge-xianxia" style={{ fontSize: '0.7rem' }}>
                  {chapter.selfHealedCount} Terms Auto-Healed
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                onClick={onReTranslateChapter}
                title="Re-translate using updated Glossary Map"
              >
                <RefreshCw size={12} /> Re-Translate
              </button>

              {onPolishProse && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
                  onClick={onPolishProse}
                  title="Upgrade English translation into smooth, literary prose"
                >
                  <Sparkles size={12} /> Polish Prose
                </button>
              )}

              {isEditingEn ? (
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    onSaveContent(chapter.contentZh, rawEnText);
                    setIsEditingEn(false);
                  }}
                >
                  <Check size={12} /> Save Draft
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    setRawEnText(chapter.contentEn);
                    setIsEditingEn(true);
                  }}
                >
                  <Edit2 size={12} /> Edit Draft
                </button>
              )}
            </div>
          </div>

          <div
            className="pane-content"
            ref={rightPaneRef}
            onScroll={() => handleScroll('right')}
          >
            {isEditingEn ? (
              <textarea
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  color: '#fff',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  resize: 'none'
                }}
                value={rawEnText}
                onChange={(e) => setRawEnText(e.target.value)}
              />
            ) : chapter.contentEn ? (
              renderEnglishContent(chapter.contentEn)
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
                <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '1.25rem', borderRadius: '50%', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                  <RefreshCw size={32} style={{ color: 'var(--primary-cyan)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>No English Translation Draft Yet</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', maxWidth: '340px' }}>
                    Click below to run the Self-Healing Translation Engine using your active 2-tier Glossary Map.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={onReTranslateChapter}>
                  <RefreshCw size={16} /> Translate Chapter Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Quick Term Editor Popup */}
      {editingTerm && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            left: `${Math.max(10, Math.min(window.innerWidth - 330, editingTerm.x))}px`,
            top: `${Math.max(10, Math.min(window.innerHeight - 170, editingTerm.y))}px`,
            zIndex: 9999,
            padding: '0.85rem',
            width: '310px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5), var(--shadow-glow)',
            border: '1px solid var(--primary-cyan)',
            background: 'var(--bg-panel)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Self-Learning Edit for: <strong style={{ color: 'var(--primary-cyan)' }}>{editingTerm.zh}</strong>
            </div>
            <button
              onClick={() => setEditingTerm(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.2rem', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newEnInput}
              onChange={(e) => setNewEnInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
              autoFocus
            />
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem' }} onClick={handleSaveInlineEdit}>
              Update
            </button>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Updates Glossary Map and cascades across all chapters automatically.
          </p>
        </div>
      )}
    </div>
  );
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
