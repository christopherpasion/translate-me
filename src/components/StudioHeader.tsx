import React, { useState } from 'react';
import type { Novel, Chapter } from '../types';
import { cleanAndTranslateChapterTitle } from '../services/translationEngine';
import { getGenreMeta } from '../services/genrePresets';
import { GitFork, Sidebar, Trash2, Upload, Cloud } from 'lucide-react';

interface StudioHeaderProps {
  currentNovel: Novel;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onSelectChapter: (chapterId: string) => void;
  onOpenUploader: () => void;
  onDeleteChapter?: (chapterId: string) => void;
  onOpenCharacterGraph: () => void;
  onToggleSidebar: () => void;
  onSyncSupabaseCloud?: () => void;
  isSidebarOpen: boolean;
  glossaryCount: number;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  currentNovel,
  chapters,
  currentChapter,
  onSelectChapter,
  onOpenUploader,
  onDeleteChapter,
  onOpenCharacterGraph,
  onToggleSidebar,
  onSyncSupabaseCloud,
  isSidebarOpen,
  glossaryCount
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <div className="studio-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)' }}>
      {/* Row 1: Novel Meta Info + Chapter Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Left Side: Novel Title & Genre Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            {currentNovel.titleEn || currentNovel.titleZh}
          </h2>
          {/* Genre Badge */}
          {(() => {
            const genreMeta = getGenreMeta(currentNovel.genre);
            return (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: genreMeta.badgeGradient,
                  border: `1px solid ${genreMeta.badgeBorder}`,
                  color: genreMeta.badgeColor,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase'
                }}
              >
                <span>{genreMeta.icon}</span>
                <span>{genreMeta.nameEn.split(' / ')[0]}</span>
              </span>
            );
          })()}

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {chapters.length} Chapter{chapters.length === 1 ? '' : 's'} Published
          </span>
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

          <button
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0, gap: '0.3rem' }}
            onClick={onOpenUploader}
            title="Upload single or bulk chapters"
          >
            <Upload size={13} />
            <span>Upload Ch.</span>
          </button>

          {currentChapter && onDeleteChapter && (
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', color: '#ff4d4f', borderColor: 'rgba(239,68,68,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => setIsDeleteConfirmOpen(true)}
              title="Delete Chapter"
              aria-label="Delete Chapter"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Studio Action Controls */}
      <div className="mobile-scroll-row" style={{ width: '100%', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Character Graph Modal Trigger */}
        <button
          className="btn btn-secondary"
          onClick={onOpenCharacterGraph}
          title="Explore Character & Faction Network Graph"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--accent-green)', borderColor: 'rgba(16, 185, 129, 0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          <GitFork size={14} />
          <span>Character Graph</span>
        </button>

        {/* Glossary Sidebar Toggle */}
        <button
          className="btn btn-secondary"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Hide Glossary Sidebar" : "Show Glossary Sidebar"}
          style={{
            padding: '0.35rem 0.65rem',
            fontSize: '0.8rem',
            color: isSidebarOpen ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderColor: isSidebarOpen ? 'var(--accent-cyan)' : 'var(--border-color)',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <Sidebar size={14} />
          <span>Terms ({glossaryCount})</span>
        </button>

        {/* Cloud Sync */}
        {onSyncSupabaseCloud && (
          <button
            className="btn btn-secondary"
            onClick={onSyncSupabaseCloud}
            title="Sync all chapters & terms to Supabase Cloud Database"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <Cloud size={14} />
            <span>Cloud Sync</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && currentChapter && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                <Trash2 size={20} />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Delete Chapter</h2>
              </div>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: 'var(--accent-cyan)' }}>
                  Chapter {currentChapter.chapterNumber}: {currentChapter.titleEn || currentChapter.titleZh}
                </strong>?
              </p>
            </div>

            <div className="modal-footer" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  fontWeight: 700,
                  border: 'none'
                }}
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  if (onDeleteChapter) {
                    onDeleteChapter(currentChapter.id);
                  }
                }}
              >
                <Trash2 size={14} /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
