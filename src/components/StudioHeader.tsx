import React from 'react';
import type { Novel, Chapter } from '../types';
import { Sparkles, GitFork, Plus, Sidebar, Trash2 } from 'lucide-react';

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
  isSidebarOpen,
  glossaryCount
}) => {
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
        </div>

        {/* Chapter Dropdown & Quick Actions */}
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
            {chapters.map(ch => (
              <option key={ch.id} value={ch.id} style={{ background: '#111827' }}>
                Ch. {ch.chapterNumber}: {ch.titleEn.replace(/^Chapter\s+\d+:\s*/i, '')}
              </option>
            ))}
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
                if (confirm(`Are you sure you want to delete Chapter ${currentChapter.chapterNumber}: ${currentChapter.titleEn}?`)) {
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
        {/* Prominent 1-Click Paste & Translate Primary Button */}
        <button
          className="btn btn-primary"
          onClick={onOpenNewChapterModal}
          title="Paste raw web novel text to clean & translate into English"
          style={{ fontWeight: 700, gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: 1, minWidth: '130px', justifyContent: 'center' }}
        >
          <Plus size={14} />
          <span>📋 Paste Chapter</span>
        </button>

        {/* Scan Terms */}
        <button
          className="btn btn-secondary"
          onClick={onRunEntityScan}
          title="Scan raw Chinese chapter for character names, sects, and proper nouns"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
        >
          <Sparkles size={14} style={{ color: 'var(--primary-cyan)' }} />
          <span>Scan Terms</span>
        </button>

        {/* Glossary Sidebar Toggle */}
        <button
          className={`btn ${isSidebarOpen ? 'btn-primary' : 'btn-secondary'}`}
          onClick={onToggleSidebar}
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
        >
          <Sidebar size={14} />
          <span>Glossary ({glossaryCount})</span>
        </button>

        {/* Character Graph */}
        <button
          className="btn btn-secondary"
          onClick={onOpenCharacterGraph}
          title="View visual character relationship tree & sect hierarchy"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
        >
          <GitFork size={14} style={{ color: 'var(--accent-purple)' }} />
          <span>Graph</span>
        </button>
      </div>
    </div>
  );
};
