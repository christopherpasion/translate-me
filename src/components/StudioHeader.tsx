import React from 'react';
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
  const tokenStats = StorageService.getTokenUsage();
  const formattedTokens = tokenStats.totalTokens > 1000 
    ? `${(tokenStats.totalTokens / 1000).toFixed(1)}k` 
    : tokenStats.totalTokens.toString();
  const formattedCost = tokenStats.totalCostUsd < 0.01 && tokenStats.totalCostUsd > 0
    ? '<$0.01'
    : `$${tokenStats.totalCostUsd.toFixed(4)}`;

  return (
    <div className="studio-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.75rem 1rem' }}>
      {/* Row 1: Novel Meta & Chapter Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {currentNovel.titleEn}
          </h1>
          <span className={`badge badge-${currentNovel.genre}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {currentNovel.genre}
          </span>

          {/* AI Token Tracker Bar */}
          <button
            onClick={onOpenAISettings}
            title={`AI Token Tracker: ${tokenStats.totalTokens.toLocaleString()} Total Tokens (${tokenStats.promptTokens.toLocaleString()} Prompt + ${tokenStats.completionTokens.toLocaleString()} Completion). Estimated Cost: $${tokenStats.totalCostUsd.toFixed(6)} USD.`}
            style={{
              display: 'flex',
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

        {/* Chapter Dropdown & Quick Actions (Rule #3: Clean Chapter Titles) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '240px', justifyContent: 'flex-end' }}>
          <select
            value={currentChapter?.id || ''}
            onChange={(e) => onSelectChapter(e.target.value)}
            style={{
              flex: 1,
              maxWidth: '280px',
              minWidth: '120px',
              background: 'var(--bg-elevated)',
              color: '#fff',
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
                <option key={ch.id} value={ch.id} style={{ background: '#111827' }}>
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
              onClick={() => {
                if (confirm(`Are you sure you want to delete Chapter ${currentChapter.chapterNumber}?`)) {
                  onDeleteChapter(currentChapter.id);
                }
              }}
              title="Delete Chapter"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Studio Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', width: '100%', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          className="btn btn-primary"
          onClick={onOpenNewChapterModal}
          title="Paste raw web novel text to clean & translate into English"
          style={{ fontWeight: 700, gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: 1, minWidth: '130px', justifyContent: 'center' }}
        >
          <Plus size={14} />
          <span>📋 Paste Chapter</span>
        </button>

        {/* Translation Tone Preset Selector */}
        {onSelectTranslationStyle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <select
              value={translationStyle}
              onChange={(e) => onSelectTranslationStyle(e.target.value as TranslationStyle)}
              title="Select Translation Prose Style"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="xianxia">🐉 Xianxia / Cultivation</option>
              <option value="fluent">⚡ Fluent Webnovel</option>
              <option value="faithful">📖 Faithful / Literal</option>
            </select>
          </div>
        )}

        {onOpenBatchModal && (
          <button
            className="btn btn-secondary"
            onClick={onOpenBatchModal}
            title="Batch translate multiple chapters in queue"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}
          >
            <Layers size={14} style={{ color: '#38bdf8' }} />
            <span>Batch ({chapters.length})</span>
          </button>
        )}

        {onOpenDictionaryModal && (
          <button
            className="btn btn-secondary"
            onClick={onOpenDictionaryModal}
            title="Open Master Chinese-English Dictionary & Pinyin Lookup"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#ec4899', borderColor: 'rgba(236,72,153,0.3)' }}
          >
            <BookOpen size={14} />
            <span>Dictionary</span>
          </button>
        )}

        {onOpenAITrainingModal && (
          <button
            className="btn btn-secondary"
            onClick={onOpenAITrainingModal}
            title="View AI Parallel Corpus Training & In-Context Style Benchmarks"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#818cf8', borderColor: 'rgba(129,140,248,0.3)' }}
          >
            <Brain size={14} style={{ color: '#818cf8' }} />
            <span>AI Trainer</span>
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={onRunEntityScan}
          title="Scan raw Chinese chapter for character names, sects, and proper nouns"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
        >
          <Sparkles size={14} style={{ color: 'var(--primary-cyan)' }} />
          <span>Scan Terms</span>
        </button>

        <button
          className={`btn ${isSidebarOpen ? 'btn-primary' : 'btn-secondary'}`}
          onClick={onToggleSidebar}
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
        >
          <Sidebar size={14} />
          <span>Glossary ({glossaryCount})</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenCharacterGraph}
          title="View visual character relationship tree & sect hierarchy"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
        >
          <GitFork size={14} style={{ color: 'var(--accent-purple)' }} />
          <span>Graph</span>
        </button>

        {onSyncSupabaseCloud && (
          <button
            className="btn btn-secondary"
            onClick={onSyncSupabaseCloud}
            title="Sync all chapters & terms to Supabase Cloud Database"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)' }}
          >
            <span>☁️ Cloud Sync</span>
          </button>
        )}
      </div>
    </div>
  );
};
