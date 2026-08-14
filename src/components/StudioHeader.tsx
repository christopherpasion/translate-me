import React, { useState } from 'react';
import type { Novel, Chapter } from '../types';
import { StorageService } from '../services/storage';
import { cleanAndTranslateChapterTitle } from '../services/translationEngine';
import type { TranslationStyle } from '../services/translationEngine';
import { Sparkles, GitFork, Plus, Sidebar, Trash2, Cpu, BookOpen, Brain, Layers } from 'lucide-react';

interface StudioHeaderProps {
  currentNovel: Novel;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onSelectChapter: (chapterId: string) => void;
  onOpenNewChapterModal: () => void;
  onDeleteChapter?: (chapterId: string) => void;
  onRunEntityScan: () => void;
  onRunSelfHealing?: () => void;
  onOpenCharacterGraph: () => void;
  onToggleSidebar: () => void;
  onOpenAISettings?: () => void;
  onSyncSupabaseCloud?: () => void;
  onOpenDictionaryModal?: () => void;
  onOpenAITrainingModal?: () => void;
  onOpenBatchModal?: () => void;
  translationStyle?: TranslationStyle;
  onSelectTranslationStyle?: (style: TranslationStyle) => void;
  isSidebarOpen: boolean;
  glossaryCount: number;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  currentNovel,
  chapters,
  currentChapter,
  onSelectChapter,
  onOpenNewChapterModal,
  onDeleteChapter,
  onRunEntityScan,
  onOpenCharacterGraph,
  onToggleSidebar,
  onOpenAISettings,
  onSyncSupabaseCloud,
  onOpenDictionaryModal,
  onOpenAITrainingModal,
  onOpenBatchModal,
  translationStyle = 'xianxia',
  onSelectTranslationStyle,
  isSidebarOpen,
  glossaryCount
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const tokenStats = StorageService.getTokenUsage();
  const formattedTokens = tokenStats.totalTokens > 1000 
    ? `${(tokenStats.totalTokens / 1000).toFixed(1)}k` 
    : `${tokenStats.totalTokens}`;
  const formattedCost = `$${tokenStats.totalCostUsd.toFixed(3)}`;

  return (
    <div className="studio-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)' }}>
      {/* Row 1: Novel Meta Info + Chapter Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Left Side: Novel Title & Genre Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            {currentNovel.titleEn || currentNovel.titleZh}
          </h2>
          <span className={`badge badge-${currentNovel.genre}`}>
            {currentNovel.genre.toUpperCase()}
          </span>

          {/* Token Usage & Cost Counter Pill */}
          <button
            onClick={onOpenAISettings}
            title="Click to view AI Token & Cost breakdown / API Settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Cpu size={12} style={{ color: '#60a5fa' }} />
            <span>⚡ {formattedTokens} Tokens ({formattedCost})</span>
          </button>
        </div>

        {/* Chapter Dropdown & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '220px', justifyContent: 'flex-end' }}>
          <select
            value={currentChapter?.id || ''}
            onChange={(e) => onSelectChapter(e.target.value)}
            style={{
              flex: 1,
              maxWidth: '280px',
              minWidth: '120px',
              background: 'var(--bg-elevated)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              textOverflow: 'ellipsis'
            }}
          >
            {chapters.map(ch => {
              const cleanTitle = cleanAndTranslateChapterTitle(ch.titleZh, ch.chapterNumber);
              const displayTitle = ch.titleEn ? ch.titleEn : cleanTitle;
              return (
                <option key={ch.id} value={ch.id} style={{ background: 'var(--bg-elevated)', color: 'var(--text-main)' }}>
                  Ch. {ch.chapterNumber}: {displayTitle.replace(/^Chapter\s+\d+:\s*/i, '')}
                </option>
              );
            })}
          </select>

          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={onOpenNewChapterModal} title="Add New Chapter">
            <Plus size={14} />
            <span>New Ch.</span>
          </button>

          {currentChapter && onDeleteChapter && (
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => setIsDeleteConfirmOpen(true)}
              title="Delete Chapter"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Studio Action Controls (Mobile Scrollable Row) */}
      <div className="mobile-scroll-row" style={{ width: '100%', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          className="btn btn-primary"
          onClick={onOpenNewChapterModal}
          title="Paste raw web novel text to clean & translate into English"
          style={{ fontWeight: 700, gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          <Plus size={14} />
          <span>📋 Paste Chapter</span>
        </button>

        {/* Translation Tone Preset Selector */}
        {onSelectTranslationStyle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
            <select
              value={translationStyle}
              onChange={(e) => onSelectTranslationStyle(e.target.value as TranslationStyle)}
              title="Choose Translation Tone: Xianxia (immersive), Fluent (punchy web novel), or Faithful (direct)"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--primary-cyan)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <option value="xianxia">⚔️ Xianxia</option>
              <option value="fluent">⚡ Fluent</option>
              <option value="faithful">📖 Faithful</option>
            </select>
          </div>
        )}

        {/* Batch Chapter Translate Modal Trigger */}
        {onOpenBatchModal && (
          <button
            className="btn btn-secondary"
            onClick={onOpenBatchModal}
            title="Batch translate multiple chapters in queue with real-time progress"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--primary-cyan)', borderColor: 'rgba(0, 242, 254, 0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <Layers size={14} />
            <span>Batch ({chapters.length})</span>
          </button>
        )}

        {/* Master Dictionary Lookup Modal Trigger */}
        {onOpenDictionaryModal && (
          <button
            className="btn btn-secondary"
            onClick={onOpenDictionaryModal}
            title="Search 5,000+ Chinese-English Xianxia, Wuxia, and Cultivation Terms"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <BookOpen size={14} />
            <span>Dictionary</span>
          </button>
        )}

        {/* AI Parallel Corpus Trainer Modal Trigger */}
        {onOpenAITrainingModal && (
          <button
            className="btn btn-secondary"
            onClick={onOpenAITrainingModal}
            title="Open AI Parallel Corpus Trainer, Style Learner & In-Memory Model fine-tuner"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <Brain size={14} />
            <span>AI Trainer</span>
          </button>
        )}

        {/* Character Graph Modal Trigger */}
        <button
          className="btn btn-secondary"
          onClick={onOpenCharacterGraph}
          title="Explore Dynamic Character & Faction Relationship Network Graph"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--accent-green)', borderColor: 'rgba(16, 185, 129, 0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          <GitFork size={14} />
          <span>Graph</span>
        </button>

        {/* Glossary Sidebar Toggle */}
        <button
          className="btn btn-secondary"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Glossary Sidebar" : "Show Glossary Sidebar"}
          style={{
            padding: '0.35rem 0.65rem',
            fontSize: '0.8rem',
            color: isSidebarOpen ? 'var(--primary-cyan)' : 'var(--text-muted)',
            borderColor: isSidebarOpen ? 'var(--primary-cyan)' : 'var(--border-color)',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <Sidebar size={14} />
          <span>Glossary ({glossaryCount})</span>
        </button>

        {/* Scan Terms Trigger */}
        <button
          className="btn btn-secondary"
          onClick={onRunEntityScan}
          title="Run Named Entity Recognition (NER) to discover character names, factions, and items"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          <Sparkles size={14} style={{ color: 'var(--primary-cyan)' }} />
          <span>Scan Terms</span>
        </button>

        {onSyncSupabaseCloud && (
          <button
            className="btn btn-secondary"
            onClick={onSyncSupabaseCloud}
            title="Sync all chapters & terms to Supabase Cloud Database"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <span>☁️ Cloud Sync</span>
          </button>
        )}
      </div>

      {/* Custom In-App Delete Confirmation Modal */}
      {isDeleteConfirmOpen && currentChapter && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-red)' }}>
                <Trash2 size={20} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Delete Chapter Confirmation</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                style={{ border: 'none', background: 'transparent' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                Are you sure you want to permanently delete{' '}
                <strong style={{ color: 'var(--primary-cyan)' }}>
                  Chapter {currentChapter.chapterNumber}: {currentChapter.titleEn || currentChapter.titleZh}
                </strong>?
              </p>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: '#f87171'
                }}
              >
                ⚠️ <strong>Warning:</strong> This will permanently delete all raw Chinese source text, English translated drafts, and associated paragraph alignments for this chapter. This action cannot be undone.
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 2px 10px rgba(239, 68, 68, 0.35)'
                }}
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  if (onDeleteChapter) {
                    onDeleteChapter(currentChapter.id);
                  }
                }}
              >
                <Trash2 size={14} /> Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
