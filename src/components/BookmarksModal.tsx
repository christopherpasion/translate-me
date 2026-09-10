import React from 'react';
import type { Bookmark } from '../types';
import { Bookmark as BookmarkIcon, BookOpen, Trash2, ArrowRight, X, Clock } from 'lucide-react';

interface BookmarksModalProps {
  bookmarks: Bookmark[];
  onSelectBookmark: (novelId: string, chapterId: string) => void;
  onRemoveBookmark: (novelId: string) => void;
  onClose: () => void;
  onOpenLibrary: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark,
  onClose,
  onOpenLibrary
}) => {
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f5576c, #f093fb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <BookmarkIcon size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                My Reading Bookmarks
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {bookmarks.length} saved novel{bookmarks.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
          {bookmarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <BookOpen size={44} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>No Bookmarks Yet</h4>
              <p style={{ fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
                Click the <strong>Bookmark Chapter</strong> button while reading any chapter to save your progress here!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onOpenLibrary();
                }}
              >
                Explore Novel Library
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookmarks.map((bm) => (
                <div
                  key={bm.novelId}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {bm.novelTitle}
                    </h4>
                    <p style={{
                      margin: '0 0 0.35rem 0',
                      fontSize: '0.82rem',
                      color: 'var(--accent-purple)',
                      fontWeight: 600
                    }}>
                      Chapter {bm.chapterNumber}: {bm.chapterTitle}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      <span>{formatDate(bm.updatedAt)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        onSelectBookmark(bm.novelId, bm.chapterId);
                        onClose();
                      }}
                      style={{ padding: '0.5rem 0.9rem', minHeight: '42px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', touchAction: 'manipulation' }}
                      title="Continue Reading"
                    >
                      <span>Continue</span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon"
                      onClick={() => onRemoveBookmark(bm.novelId)}
                      style={{ padding: '0.5rem', minHeight: '42px', minWidth: '42px', color: '#ff4d4f', touchAction: 'manipulation' }}
                      title="Remove Bookmark"
                      aria-label="Remove Bookmark"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
