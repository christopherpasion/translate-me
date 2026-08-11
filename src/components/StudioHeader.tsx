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
    <div className="studio-toolbar">
      {/* Novel & Chapter Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              {currentNovel.titleZh}
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', fontWeight: 500 }}>
              ({currentNovel.titleEn})
            </span>
            <span className={`badge badge-${currentNovel.genre}`} style={{ textTransform: 'uppercase' }}>
              {currentNovel.genre}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            {/* Chapter Dropdown */}
            <select
              value={currentChapter?.id || ''}
              onChange={(e) => onSelectChapter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {chapters.map(ch => (
                <option key={ch.id} value={ch.id} style={{ background: '#111827' }}>
                  Ch. {ch.chapterNumber}: {ch.titleZh} ({ch.titleEn})
                </option>
              ))}
            </select>

            <button className="btn btn-secondary btn-icon" style={{ padding: '0.25rem 0.5rem' }} onClick={onOpenNewChapterModal} title="Add New Chapter">
              <Plus size={14} />
              <span style={{ fontSize: '0.75rem' }}>New Ch.</span>
            </button>

            {currentChapter && onDeleteChapter && (
              <button
                className="btn btn-secondary btn-icon"
                style={{ padding: '0.25rem 0.5rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.3)' }}
                onClick={() => {
                  if (confirm(`Are you sure you want to delete Chapter ${currentChapter.chapterNumber}: ${currentChapter.titleZh}?`)) {
                    onDeleteChapter(currentChapter.id);
                  }
                }}
                title="Delete Chapter"
              >
                <Trash2 size={14} />
                <span style={{ fontSize: '0.75rem' }}>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Prominent 1-Click Paste & Translate Primary Button */}
        <button
          className="btn btn-primary"
          onClick={onOpenNewChapterModal}
          title="Paste raw web novel text to clean & translate into English"
          style={{ fontWeight: 700, gap: '0.4rem', padding: '0.45rem 0.9rem' }}
        >
          <Plus size={16} />
          <span>📋 Paste New Chapter</span>
        </button>

        {/* Scan Terms */}
        <button
          className="btn btn-secondary"
          onClick={onRunEntityScan}
          title="Scan raw Chinese chapter for character names, sects, and proper nouns"
        >
          <Sparkles size={16} style={{ color: 'var(--primary-cyan)' }} />
          <span>Scan Terms</span>
        </button>

        {/* Glossary Sidebar Toggle */}
        <button
          className={`btn ${isSidebarOpen ? 'btn-primary' : 'btn-secondary'}`}
          onClick={onToggleSidebar}
        >
          <Sidebar size={16} />
          <span>Glossary ({glossaryCount})</span>
        </button>

        {/* Character Graph */}
        <button
          className="btn btn-secondary"
          onClick={onOpenCharacterGraph}
          title="View visual character relationship tree & sect hierarchy"
        >
          <GitFork size={16} style={{ color: 'var(--accent-purple)' }} />
          <span>Graph</span>
        </button>
      </div>
    </div>
  );
};
