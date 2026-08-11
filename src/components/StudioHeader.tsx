import React from 'react';
import type { Novel, Chapter } from '../types';
import { Sparkles, ShieldCheck, GitFork, Plus, Sidebar } from 'lucide-react';

interface StudioHeaderProps {
  currentNovel: Novel;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onSelectChapter: (chapterId: string) => void;
  onOpenNewChapterModal: () => void;
  onRunEntityScan: () => void;
  onRunSelfHealing: () => void;
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
  onRunEntityScan,
  onRunSelfHealing,
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
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
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Pre-Pass Entity Scanner */}
        <button
          className="btn btn-secondary"
          onClick={onRunEntityScan}
          title="Scan raw Chinese chapter for character names, sects, and realms before translation"
        >
          <Sparkles size={16} style={{ color: 'var(--primary-cyan)' }} />
          <span>Entity Scanner</span>
        </button>

        {/* Self-Healing Pass */}
        <button
          className="btn btn-secondary"
          onClick={onRunSelfHealing}
          title="Run Self-Healing agent verification pass to fix term drifts"
        >
          <ShieldCheck size={16} style={{ color: 'var(--accent-amber)' }} />
          <span>Self-Heal Pass</span>
        </button>

        {/* Character Graph */}
        <button
          className="btn btn-secondary"
          onClick={onOpenCharacterGraph}
          title="View visual character relationship tree & sect hierarchy"
        >
          <GitFork size={16} style={{ color: 'var(--accent-purple)' }} />
          <span>Character Graph</span>
        </button>

        {/* Glossary Sidebar Toggle */}
        <button
          className={`btn ${isSidebarOpen ? 'btn-primary' : 'btn-secondary'}`}
          onClick={onToggleSidebar}
        >
          <Sidebar size={16} />
          <span>Glossary ({glossaryCount})</span>
        </button>
      </div>
    </div>
  );
};
