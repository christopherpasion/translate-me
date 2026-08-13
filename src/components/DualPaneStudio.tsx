import React, { useState, useEffect, useMemo } from 'react';
import type { Chapter, GlossaryEntry, SelfHealingRecord, ChineseScript } from '../types';
import { getPinyinForText } from '../services/pinyinService';
import { convertToTraditional, convertToSimplified } from '../services/scriptConverter';
import { retranslateParagraph, getParagraphAlternatives, type TranslationStyle } from '../services/translationEngine';
import { extractEntitiesFromChinese, type ExtractedEntity } from '../services/nerExtractor';
import { ShieldCheck, Edit2, Check, Sparkles, BookOpen, RefreshCw, Wand2, Plus } from 'lucide-react';

interface DualPaneStudioProps {
  chapter: Chapter | null;
  glossary: GlossaryEntry[];
  healingRecords: SelfHealingRecord[];
  onSaveContent: (contentZh: string, contentEn: string) => void;
  onQuickUpdateGlossary: (originalZh: string, newEn: string) => void;
  onReTranslateChapter?: () => void;
  onPolishProse?: () => void;
  onOpenDictionaryModal?: () => void;
  translationStyle?: TranslationStyle;
}

export const DualPaneStudio: React.FC<DualPaneStudioProps> = ({
  chapter,
  glossary,
  healingRecords,
  onSaveContent,
  onQuickUpdateGlossary,
  onReTranslateChapter,
  onPolishProse,
  onOpenDictionaryModal,
  translationStyle = 'xianxia'
}) => {
  // Inline editing popover state
  const [editingTerm, setEditingTerm] = useState<{ zh: string; en: string; x: number; y: number } | null>(null);
  const [newEnInput, setNewEnInput] = useState('');

  // Synchronous Cross-Highlighting State across Chinese and English panes
  const [hoveredTermZh, setHoveredTermZh] = useState<string | null>(null);
  const [hoveredParaIdx, setHoveredParaIdx] = useState<number | null>(null);

  // Paragraph alternatives state
  const [alternativesState, setAlternativesState] = useState<{ paraIdx: number; alts: string[] } | null>(null);

  // Editable raw text states
  const [isEditingZh, setIsEditingZh] = useState(false);
  const [rawZhText, setRawZhText] = useState(chapter?.contentZh || '');
  const [isEditingEn, setIsEditingEn] = useState(false);
  const [rawEnText, setRawEnText] = useState(chapter?.contentEn || '');

  // Chinese Script View Mode ('simplified' | 'traditional')
  const [scriptMode, setScriptMode] = useState<ChineseScript>('simplified');

  // Mobile Active Tab State ('all' | 'zh' | 'en')
  const [mobileTab, setMobileTab] = useState<'all' | 'zh' | 'en'>('all');

  // Synchronize raw text state when chapter props change
  useEffect(() => {
    if (chapter) {
      setRawZhText(chapter.contentZh || '');
      setRawEnText(stripMarkdown(chapter.contentEn || ''));
    }
  }, [chapter]);

  // Scan for unmapped entities to suggest 1-click addition to glossary
  const unmappedDiscoveredEntities = useMemo<ExtractedEntity[]>(() => {
    if (!chapter?.contentZh) return [];
    return extractEntitiesFromChinese(chapter.contentZh, glossary).slice(0, 6);
  }, [chapter?.contentZh, glossary]);

  // Unified Row-by-Row Paragraph Pairs (Guarantees 100% Side-by-Side Alignment with ZERO drift)
  const alignedRows = useMemo(() => {
    if (!chapter) return [];
    const displayText = scriptMode === 'traditional' ? convertToTraditional(chapter.contentZh || '') : convertToSimplified(chapter.contentZh || '');
    const zhParas = displayText.split('\n').map(p => p.trim()).filter(Boolean);
    const cleanEn = stripMarkdown(chapter.contentEn || '');
    const enParas = cleanEn.split('\n').map(p => p.trim()).filter(Boolean);
    const maxCount = Math.max(zhParas.length, enParas.length);

    const rows = [];
    for (let i = 0; i < maxCount; i++) {
      rows.push({
        idx: i,
        zh: zhParas[i] || '',
        en: enParas[i] || ''
      });
    }
    return rows;
  }, [chapter, scriptMode]);

  if (!chapter) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>No chapter selected. Please create or select a chapter to view.</p>
      </div>
    );
  }

  const handleRetranslateSinglePara = (pIdx: number) => {
    if (!chapter) return;
    const zhParas = (chapter.contentZh || '').split('\n').map(p => p.trim()).filter(Boolean);
    const enParas = (chapter.contentEn || '').split('\n').map(p => p.trim()).filter(Boolean);
    const targetZh = zhParas[pIdx] || '';
    if (!targetZh.trim()) return;

    const newEnDraft = retranslateParagraph(targetZh, glossary, translationStyle);
    
    // Replace paragraph in English content
    const updatedEnParas = [...enParas];
    while (updatedEnParas.length <= pIdx) updatedEnParas.push('');
    updatedEnParas[pIdx] = newEnDraft;

    const newEnContent = updatedEnParas.join('\n\n');
    setRawEnText(newEnContent);
    onSaveContent(chapter.contentZh, newEnContent);
  };

  const handleShowAlternatives = (pIdx: number) => {
    if (!chapter) return;
    const zhParas = (chapter.contentZh || '').split('\n').map(p => p.trim()).filter(Boolean);
    const enParas = (chapter.contentEn || '').split('\n').map(p => p.trim()).filter(Boolean);
    const targetZh = zhParas[pIdx] || '';
    const currentEn = enParas[pIdx] || '';

    const alts = getParagraphAlternatives(targetZh, currentEn, glossary);
    setAlternativesState({ paraIdx: pIdx, alts });
  };

  const handleApplyAlternative = (pIdx: number, selectedEn: string) => {
    if (!chapter) return;
    const enParas = (chapter.contentEn || '').split('\n').map(p => p.trim()).filter(Boolean);
    const updatedEnParas = [...enParas];
    while (updatedEnParas.length <= pIdx) updatedEnParas.push('');
    updatedEnParas[pIdx] = selectedEn;

    const newEnContent = updatedEnParas.join('\n\n');
    setRawEnText(newEnContent);
    onSaveContent(chapter.contentZh, newEnContent);
    setAlternativesState(null);
  };

  const renderHighlightedZhParagraph = (para: string) => {
    if (!para) return null;
    const sortedGlossary = [...glossary].sort((a, b) => b.originalZh.length - a.originalZh.length);
    const regexParts = sortedGlossary.map(g => escapeRegExp(g.originalZh)).filter(Boolean);

    if (regexParts.length === 0) return para;

    const regex = new RegExp(`(${regexParts.join('|')})`, 'g');
    const parts = para.split(regex);

    return parts.map((part, i) => {
      const matched = sortedGlossary.find(g =>
        g.originalZh === part || convertToTraditional(g.originalZh) === part
      );

      if (matched) {
        const isHovered = hoveredTermZh === matched.originalZh;
        const pinyinText = matched.pinyin || getPinyinForText(matched.originalZh);

        return (
          <span
            key={i}
            className={`term-highlight ${isHovered ? 'term-highlight-active' : ''}`}
            title={`Pinyin: ${pinyinText} | EN: "${matched.translatedEn}" (${matched.category})`}
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
            <sub className="pinyin-sub" style={{ fontSize: '0.65em', opacity: 0.8, marginLeft: '2px', color: '#ec4899' }}>
              [{pinyinText}]
            </sub>
          </span>
        );
      }
      return part;
    });
  };

  const renderHighlightedEnParagraph = (para: string) => {
    if (!para) return null;
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
        const pinyinText = matched.pinyin || getPinyinForText(matched.originalZh);

        if (healedRecord) {
          return (
            <span
              key={i}
              className={`self-healed-badge ${isHovered ? 'term-highlight-active' : ''}`}
              title={`[Self-Healed Agent] Auto-corrected drift "${healedRecord.incorrectEn}" -> "${matched.translatedEn}" (${pinyinText})`}
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
            title={`Glossary Term (${matched.category}): ZH "${matched.originalZh}" [${pinyinText}]`}
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
      {/* Mobile Touch Tab Bar (< 768px) */}
      <div className="mobile-tab-bar">
        <button
          className={`mobile-tab-btn ${mobileTab === 'all' ? 'active' : ''}`}
          onClick={() => setMobileTab('all')}
        >
          Both
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'zh' ? 'active' : ''}`}
          onClick={() => setMobileTab('zh')}
        >
          Chinese
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'en' ? 'active' : ''}`}
          onClick={() => setMobileTab('en')}
        >
          English
        </button>
      </div>

      {/* Main Studio Toolbar & Subheader */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Script Mode:</span>
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '2px' }}>
            <button
              className={`pill-toggle ${scriptMode === 'simplified' ? 'active' : ''}`}
              onClick={() => setScriptMode('simplified')}
              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            >
              简体 (Simplified)
            </button>
            <button
              className={`pill-toggle ${scriptMode === 'traditional' ? 'active' : ''}`}
              onClick={() => setScriptMode('traditional')}
              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            >
              繁體 (Traditional)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onOpenDictionaryModal && (
            <button className="btn-action secondary" onClick={onOpenDictionaryModal} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              <BookOpen size={14} /> Master Dictionary
            </button>
          )}
        </div>
      </div>

      {/* Discovered Entities Quick-Add Banner */}
      {unmappedDiscoveredEntities.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            background: 'rgba(0, 242, 254, 0.05)',
            borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
            fontSize: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ color: 'var(--primary-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={12} /> Discovered Entities:
          </span>
          {unmappedDiscoveredEntities.map((ent: ExtractedEntity, eIdx: number) => (
            <button
              key={eIdx}
              onClick={() => onQuickUpdateGlossary(ent.originalZh, ent.suggestedEn)}
              title={`Click to add "${ent.originalZh}" -> "${ent.suggestedEn}" to glossary`}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '0.1rem 0.5rem',
                color: 'var(--text-main)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'border-color 0.15s ease'
              }}
            >
              <span>{ent.originalZh}</span>
              <span style={{ color: 'var(--primary-cyan)' }}>→ {ent.suggestedEn}</span>
              <Plus size={10} style={{ color: '#10b981' }} />
            </button>
          ))}
        </div>
      )}

      {/* Raw Edit Mode Overlays */}
      {isEditingZh ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>Editing Raw Chinese Text</span>
            <button className="btn btn-primary" onClick={() => { setIsEditingZh(false); onSaveContent(rawZhText, rawEnText); }}>
              <Check size={14} /> Done
            </button>
          </div>
          <textarea
            className="raw-textarea"
            value={rawZhText}
            onChange={(e) => setRawZhText(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      ) : isEditingEn ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>Editing English Translation Draft</span>
            <button className="btn btn-primary" onClick={() => { const cleaned = stripMarkdown(rawEnText); setIsEditingEn(false); setRawEnText(cleaned); onSaveContent(rawZhText, cleaned); }}>
              <Check size={14} /> Done
            </button>
          </div>
          <textarea
            className="raw-textarea"
            value={rawEnText}
            onChange={(e) => setRawEnText(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      ) : (
        /* Unified Row-Aligned Translation Grid */
        <div className="aligned-translation-grid">
          {/* Sticky Column Headers */}
          <div className="aligned-grid-sticky-header">
            <div className={`header-col ${mobileTab === 'en' ? 'hidden-mobile' : ''}`}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Chinese Source ({scriptMode === 'traditional' ? '繁體' : '简体'})
              </h3>
              <button className="icon-button" onClick={() => setIsEditingZh(true)} title="Edit Raw Chinese Text">
                <Edit2 size={14} />
              </button>
            </div>

            <div className={`header-col ${mobileTab === 'zh' ? 'hidden-mobile' : ''}`}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                English Translation Draft
              </h3>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                {onReTranslateChapter && (
                  <button
                    className="btn-action secondary"
                    onClick={onReTranslateChapter}
                    title="Re-run full AI translation on this chapter"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    🔄 Retranslate
                  </button>
                )}
                {onPolishProse && (
                  <button
                    className="btn-action secondary"
                    onClick={onPolishProse}
                    title="Polish English prose style"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    <Sparkles size={11} /> Polish Prose
                  </button>
                )}
                <button className="icon-button" onClick={() => setIsEditingEn(true)} title="Edit English Text">
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Aligned Paragraph Rows */}
          {alignedRows.map((row) => {
            const isHovered = hoveredParaIdx === row.idx;
            const isShowingAlternatives = alternativesState?.paraIdx === row.idx;

            return (
              <div
                key={row.idx}
                className={`translation-row ${isHovered ? 'row-active' : ''}`}
                onMouseEnter={() => setHoveredParaIdx(row.idx)}
                onMouseLeave={() => setHoveredParaIdx(null)}
              >
                {/* Left Cell: Chinese Paragraph */}
                <div className={`translation-cell chinese-cell ${mobileTab === 'en' ? 'hidden-mobile' : ''}`}>
                  {isHovered && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '0px',
                        background: 'var(--primary-cyan)',
                        color: '#000',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        zIndex: 10
                      }}
                    >
                      ¶ {row.idx + 1}
                    </span>
                  )}
                  <p className="chinese-text" style={{ margin: 0, paddingTop: '0.25rem' }}>
                    {renderHighlightedZhParagraph(row.zh)}
                  </p>
                </div>

                {/* Right Cell: English Paragraph */}
                <div className={`translation-cell english-cell ${mobileTab === 'zh' ? 'hidden-mobile' : ''}`}>
                  {isHovered && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '0px',
                        background: '#3b82f6',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        zIndex: 10
                      }}
                    >
                      ¶ {row.idx + 1}
                    </span>
                  )}

                  {/* Paragraph Action Bar on Hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '0px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '9999px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 10
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRetranslateSinglePara(row.idx)}
                        title="Re-translate only this paragraph with current style & glossary"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary-cyan)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: '2px 4px'
                        }}
                      >
                        <RefreshCw size={11} />
                        <span>Re-translate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShowAlternatives(row.idx)}
                        title="View alternate phrasing suggestions"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent-purple)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: '2px 4px'
                        }}
                      >
                        <Wand2 size={11} />
                        <span>Phrasings</span>
                      </button>
                    </div>
                  )}

                  <p style={{ margin: 0, lineHeight: 1.8, paddingTop: '0.25rem' }}>
                    {renderHighlightedEnParagraph(row.en)}
                  </p>

                  {/* Alternate Phrasings Dropdown */}
                  {isShowingAlternatives && alternativesState && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-glow)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>
                          💡 Select Alternate Phrasing:
                        </span>
                        <button
                          onClick={() => setAlternativesState(null)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {alternativesState.alts.map((alt, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleApplyAlternative(row.idx, alt)}
                            style={{
                              textAlign: 'left',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '4px',
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-main)',
                              fontSize: '0.78rem',
                              lineHeight: '1.4',
                              cursor: 'pointer',
                              transition: 'border-color 0.15s ease'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-cyan)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                          >
                            "{alt}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Term Editor Popover */}
      {editingTerm && (
        <div
          className="inline-popover"
          style={{ top: `${editingTerm.y}px`, left: `${editingTerm.x}px` }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Quick Edit: "{editingTerm.zh}" [{getPinyinForText(editingTerm.zh)}]
          </div>
          <input
            type="text"
            className="search-input"
            value={newEnInput}
            onChange={(e) => setNewEnInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineEdit()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn-action secondary" onClick={() => setEditingTerm(null)}>
              Cancel
            </button>
            <button className="btn-action primary" onClick={handleSaveInlineEdit}>
              Update & Cascade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strips common markdown formatting artifacts that AI models emit
 * e.g. **bold**, *italic*, # Headers, --- separators, backtick code blocks
 * Safe to run on translated English prose without altering meaning.
 */
function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    // Remove bold/italic: ***text***, **text**, *text*, __text__, _text_
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')
    .replace(/_{1,2}([^_\n]+)_{1,2}/g, '$1')
    // Remove heading markers: ## Heading
    .replace(/^#{1,6}\s+/gm, '')
    // Remove horizontal rules: ---, ***, ___
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove blockquotes: > text
    .replace(/^>\s?/gm, '')
    // Collapse multiple blank lines to single
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
