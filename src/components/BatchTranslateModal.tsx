import React, { useState } from 'react';
import type { Novel, Chapter, GlossaryEntry } from '../types';
import { translateChapterWithAI } from '../services/aiProvider';
import { StorageService } from '../services/storage';
import { cleanAndTranslateChapterTitle, type TranslationStyle } from '../services/translationEngine';
import { Layers, X, Play, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface BatchTranslateModalProps {
  novel: Novel;
  chapters: Chapter[];
  glossary: GlossaryEntry[];
  onClose: () => void;
  onBatchComplete: () => void;
}

export const BatchTranslateModal: React.FC<BatchTranslateModalProps> = ({
  novel,
  chapters,
  glossary,
  onClose,
  onBatchComplete
}) => {
  const [startChapterIndex, setStartChapterIndex] = useState(0);
  const [endChapterIndex, setEndChapterIndex] = useState(Math.min(chapters.length - 1, 4));
  const [style, setStyle] = useState<TranslationStyle>('xianxia');
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [logMessages, setLogMessages] = useState<Array<{ chapterTitle: string; status: 'pending' | 'translating' | 'done' | 'error'; words?: number }>>([]);
  const [isFinished, setIsFinished] = useState(false);

  const selectedChapters = chapters.slice(startChapterIndex, endChapterIndex + 1);

  const handleStartBatch = async () => {
    if (selectedChapters.length === 0) return;

    setIsRunning(true);
    setIsFinished(false);
    setCompletedCount(0);

    const initialLogs = selectedChapters.map((ch, idx) => ({
      chapterTitle: cleanAndTranslateChapterTitle(ch.titleZh, ch.chapterNumber || idx + 1),
      status: 'pending' as const
    }));
    setLogMessages(initialLogs);

    for (let i = 0; i < selectedChapters.length; i++) {
      const ch = selectedChapters[i];
      setCurrentIndex(i);

      setLogMessages(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'translating' } : item
      ));

      try {
        const result = await translateChapterWithAI(ch.id, ch.contentZh, glossary);
        
        // Save chapter
        const updatedChapter: Chapter = {
          ...ch,
          contentEn: result.translatedEn,
          titleEn: ch.titleEn || cleanAndTranslateChapterTitle(ch.titleZh, ch.chapterNumber),
          status: 'translated',
          updatedAt: new Date().toISOString()
        };
        StorageService.saveChapter(updatedChapter);

        const wordCount = result.translatedEn.split(/\s+/).filter(Boolean).length;

        setLogMessages(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'done', words: wordCount } : item
        ));
        setCompletedCount(prev => prev + 1);
      } catch (err) {
        console.error(`Batch translation failed on chapter ${ch.id}:`, err);
        setLogMessages(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'error' } : item
        ));
      }

      // Small 300ms breather between chapters
      await new Promise(r => setTimeout(r, 300));
    }

    setIsRunning(false);
    setIsFinished(true);
    setCurrentIndex(null);
    onBatchComplete();
  };

  const progressPercent = selectedChapters.length > 0 
    ? Math.round((completedCount / selectedChapters.length) * 100) 
    : 0;

  return (
    <div className="modal-overlay" onClick={() => { if (!isRunning) onClose(); }} style={{ background: 'rgba(5, 8, 16, 0.85)' }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={20} style={{ color: 'var(--primary-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Batch Chapter Translation</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{novel.titleEn} — Queue multiple chapters with active glossaries</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} disabled={isRunning}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Chapter Range & Style Selector */}
          {!isRunning && !isFinished && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                    Start Chapter
                  </label>
                  <select
                    value={startChapterIndex}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStartChapterIndex(val);
                      if (val > endChapterIndex) setEndChapterIndex(val);
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    {chapters.map((ch, idx) => (
                      <option key={ch.id} value={idx}>
                        Ch. {ch.chapterNumber || idx + 1}: {cleanAndTranslateChapterTitle(ch.titleZh, ch.chapterNumber)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                    End Chapter
                  </label>
                  <select
                    value={endChapterIndex}
                    onChange={(e) => setEndChapterIndex(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    {chapters.slice(startChapterIndex).map((ch, idx) => {
                      const actualIdx = startChapterIndex + idx;
                      return (
                        <option key={ch.id} value={actualIdx}>
                          Ch. {ch.chapterNumber || actualIdx + 1}: {cleanAndTranslateChapterTitle(ch.titleZh, ch.chapterNumber)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Translation Style Selection */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                  Prose Tone Preset
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStyle('xianxia')}
                    className={`btn ${style === 'xianxia' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                  >
                    🐉 Xianxia / Cultivation
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyle('fluent')}
                    className={`btn ${style === 'fluent' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                  >
                    ⚡ Fluent Webnovel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyle('faithful')}
                    className={`btn ${style === 'faithful' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                  >
                    📖 Faithful / Literal
                  </button>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  <span>Chapters to translate: <strong>{selectedChapters.length}</strong></span>
                  <span>Active Glossaries: <strong>{glossary.length} terms</strong></span>
                </div>
              </div>
            </>
          )}

          {/* Progress Section */}
          {(isRunning || isFinished) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {isFinished ? '🎉 Batch Translation Complete!' : `Translating chapter ${(currentIndex ?? 0) + 1} of ${selectedChapters.length}...`}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>
                  {progressPercent}% ({completedCount}/{selectedChapters.length})
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary-cyan), var(--primary-blue))',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {/* Log List */}
              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {logMessages.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: log.status === 'translating' ? 'rgba(0, 242, 254, 0.12)' : 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {log.status === 'done' && <CheckCircle2 size={14} style={{ color: '#10b981' }} />}
                      {log.status === 'translating' && <RefreshCw size={14} className="spin" style={{ color: 'var(--primary-cyan)' }} />}
                      {log.status === 'pending' && <span style={{ color: 'var(--text-dim)' }}>⏳</span>}
                      {log.status === 'error' && <AlertCircle size={14} style={{ color: '#ef4444' }} />}
                      <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{log.chapterTitle}</span>
                    </div>

                    {log.words && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        {log.words.toLocaleString()} words
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!isRunning && !isFinished && (
            <>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleStartBatch} style={{ gap: '0.4rem' }}>
                <Play size={15} /> Start Batch ({selectedChapters.length} Chapters)
              </button>
            </>
          )}

          {isFinished && (
            <button type="button" className="btn btn-primary" onClick={onClose} style={{ gap: '0.4rem' }}>
              <Sparkles size={15} /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
