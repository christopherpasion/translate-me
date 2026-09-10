import React, { useState, useMemo, useCallback } from 'react';
import type { Novel, Chapter, Bookmark, UserProfile } from '../types';
import { BookOpen, Search, Sparkles, Layers, ArrowRight, BookMarked, Upload, ChevronRight, X, Clock } from 'lucide-react';
import { StorageService } from '../services/storage';
import { getGenreMeta, GENRE_DEFINITIONS } from '../services/genrePresets';

interface NovelHomepageProps {
  novels: Novel[];
  currentUser?: UserProfile | null;
  onSelectNovel: (novelId: string) => void;
  onStartReading: (novelId: string, chapterId?: string) => void;
  onOpenStudio: (novelId: string) => void;
  onOpenUploader: () => void;
  onOpenLibrary: () => void;
  onOpenBookmarks: () => void;
  bookmarks: Bookmark[];
}

export const NovelHomepage: React.FC<NovelHomepageProps> = ({
  novels,
  currentUser,
  onSelectNovel,
  onStartReading,
  onOpenStudio,
  onOpenUploader,
  onOpenLibrary,
  onOpenBookmarks,
  bookmarks
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [activeTocNovel, setActiveTocNovel] = useState<Novel | null>(null);
  const [tocChapters, setTocChapters] = useState<Chapter[]>([]);
  const [tocSearch, setTocSearch] = useState('');

  const genres = useMemo(() => ['all', ...Object.keys(GENRE_DEFINITIONS)], []);

  // Filter novels by search and genre
  const filteredNovels = useMemo(() => {
    return novels.filter(novel => {
      const titleEn = novel.titleEn?.toLowerCase() || '';
      const titleZh = novel.titleZh?.toLowerCase() || '';
      const author = novel.author?.toLowerCase() || '';
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || titleEn.includes(q) || titleZh.includes(q) || author.includes(q);
      const matchesGenre = selectedGenre === 'all' || novel.genre === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [novels, searchQuery, selectedGenre]);

  // Open Table of Contents for a novel
  const handleOpenToc = (novel: Novel) => {
    const chaps = StorageService.getChapters(novel.id);
    setTocChapters(chaps);
    setActiveTocNovel(novel);
    setTocSearch('');
  };

  // Get saved reading progress chapter ID for a novel
  const getSavedChapterForNovel = useCallback((novelId: string): { chapterId?: string; chapterNumber?: number } => {
    try {
      const savedChapId = localStorage.getItem(`trans_me_active_chapter_${novelId}`);
      if (savedChapId) {
        const chaps = StorageService.getChapters(novelId);
        const match = chaps.find(c => c.id === savedChapId);
        if (match) return { chapterId: match.id, chapterNumber: match.chapterNumber };
      }
    } catch {
      // Ignore
    }
    const bm = bookmarks.find(b => b.novelId === novelId);
    if (bm) return { chapterId: bm.chapterId, chapterNumber: bm.chapterNumber };
    return {};
  }, [bookmarks]);

  // Most recent novel with saved progress for the "Continue Reading" hero card
  const recentNovel = useMemo(() => {
    for (const novel of novels) {
      const progress = getSavedChapterForNovel(novel.id);
      if (progress.chapterId) {
        return { novel, ...progress };
      }
    }
    return null;
  }, [novels, getSavedChapterForNovel]);

  // Filtered chapters for Table of Contents
  const filteredTocChapters = useMemo(() => {
    if (!tocSearch.trim()) return tocChapters;
    const q = tocSearch.toLowerCase().trim();
    return tocChapters.filter(c => 
      c.titleEn?.toLowerCase().includes(q) || 
      c.titleZh?.toLowerCase().includes(q) || 
      `chapter ${c.chapterNumber}`.includes(q)
    );
  }, [tocChapters, tocSearch]);

  return (
    <div className="homepage-container" style={{
      flex: 1,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      width: '100%',
      paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))',
      background: 'var(--bg-dark)',
      color: 'var(--text-main)'
    }}>
      {/* Hero Showcase Banner */}
      <section style={{
        padding: '3rem 1.5rem 2rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          background: 'rgba(0, 242, 254, 0.1)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          color: 'var(--primary-cyan)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1rem',
          letterSpacing: '0.5px'
        }}>
          <Sparkles size={14} />
          <span>WEBNOVEL READING & LOCALIZATION HUB</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          lineHeight: 1.15,
          marginBottom: '0.85rem',
          background: 'linear-gradient(135deg, var(--text-main) 30%, var(--primary-cyan) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Discover & Read Web Novels
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-muted)',
          maxWidth: '640px',
          lineHeight: 1.6,
          marginBottom: '1.75rem'
        }}>
          Explore curated web novels with interactive glossary tooltips, rich reading themes, instant cloud synchronization, and offline bookmarks.
        </p>

        {/* Quick Actions Row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={onOpenUploader}
            title={currentUser?.role === 'creator' ? "Upload novel or bulk chapters" : "Admin credentials required to upload"}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', gap: '0.45rem', fontWeight: 700 }}
          >
            <Upload size={16} />
            <span>{currentUser?.role === 'creator' ? 'Upload Novel / Chapter' : 'Upload Chapter (Admin)'}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenBookmarks}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', gap: '0.45rem' }}
          >
            <BookMarked size={16} />
            <span>My Bookmarks ({bookmarks.length})</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenLibrary}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', gap: '0.45rem' }}
          >
            <Layers size={16} />
            <span>Library Management</span>
          </button>
        </div>
      </section>

      {/* Continue Reading Quick Card (if user has active reading progress) */}
      {recentNovel && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 2rem auto', padding: '0 1.5rem' }}>
          <div className="glass-panel" style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '4px solid var(--primary-cyan)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                background: recentNovel.novel.coverGradient || 'linear-gradient(135deg, #00f2fe, #4facfe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <BookOpen size={24} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 700 }}>
                  <Clock size={12} />
                  <span>CONTINUE READING</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0', color: 'var(--text-main)' }}>
                  {recentNovel.novel.titleEn || recentNovel.novel.titleZh}
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Resume at Chapter {recentNovel.chapterNumber || 1}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleOpenToc(recentNovel.novel)}
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
              >
                Table of Contents
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onStartReading(recentNovel.novel.id, recentNovel.chapterId)}
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.88rem', fontWeight: 700, gap: '0.4rem' }}
              >
                <span>Continue Reading</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Catalog Search & Filter Controls */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 1.5rem 1.5rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--bg-elevated)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search novels by title, Chinese raw name, or author..."
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Genre Category Pills */}
          <div className="mobile-scroll-row" style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {genres.map(genreKey => {
              const meta = genreKey === 'all' ? null : getGenreMeta(genreKey);
              const isActive = selectedGenre === genreKey;
              const label = genreKey === 'all' ? 'All Genres' : `${meta?.icon || '📖'} ${meta?.nameEn || genreKey}`;
              const badgeColor = meta?.badgeColor || 'var(--primary-cyan)';
              return (
                <button
                  key={genreKey}
                  onClick={() => setSelectedGenre(genreKey)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    border: isActive ? `1px solid ${badgeColor}` : '1px solid var(--border-color)',
                    background: isActive ? `${badgeColor}20` : 'var(--bg-card)',
                    color: isActive ? badgeColor : 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Novels Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Published Novels ({filteredNovels.length})
          </h2>
        </div>

        {filteredNovels.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
            <BookOpen size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Novels Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              No web novels matched your search query or genre filter.
            </p>
            <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setSelectedGenre('all'); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredNovels.map(novel => {
              const genreMeta = getGenreMeta(novel.genre);
              const progress = getSavedChapterForNovel(novel.id);
              const hasProgress = Boolean(progress.chapterId);

              return (
                <div
                  key={novel.id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)'
                  }}
                >
                  {/* Novel Card Header / Cover Gradient */}
                  <div style={{
                    height: '110px',
                    background: novel.coverGradient || 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {genreMeta.icon} {genreMeta.nameEn}
                      </span>

                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {novel.chaptersCount || 0} Chapter{novel.chaptersCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                      <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>By {novel.author || 'Author'}</span>
                    </div>
                  </div>

                  {/* Novel Content Info */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      margin: '0 0 0.25rem 0',
                      color: 'var(--text-main)',
                      lineHeight: 1.3
                    }}>
                      {novel.titleEn || novel.titleZh}
                    </h3>

                    {novel.titleZh && novel.titleZh !== novel.titleEn && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem', display: 'block' }}>
                        Raw: {novel.titleZh}
                      </span>
                    )}

                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      margin: '0 0 1.25rem 0',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {novel.description || 'No synopsis provided for this web novel.'}
                    </p>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.6rem',
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)'
                    }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenToc(novel)}
                        style={{ padding: '0.45rem 0.6rem', fontSize: '0.8rem', justifyContent: 'center' }}
                      >
                        Chapters ({novel.chaptersCount || 0})
                      </button>

                      <button
                        className="btn btn-primary"
                        onClick={() => onStartReading(novel.id, progress.chapterId)}
                        style={{
                          padding: '0.45rem 0.6rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <span>{hasProgress ? `Ch. ${progress.chapterNumber || 1}` : 'Start'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onSelectNovel(novel.id);
                        onOpenStudio(novel.id);
                      }}
                      style={{
                        marginTop: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        textDecoration: 'underline'
                      }}
                    >
                      Open Creator Studio & Terms
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Table of Contents Drawer / Modal */}
      {activeTocNovel && (
        <div className="modal-overlay" onClick={() => setActiveTocNovel(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BookOpen size={20} style={{ color: 'var(--primary-cyan)' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    {activeTocNovel.titleEn || activeTocNovel.titleZh}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Table of Contents • {tocChapters.length} Chapter{tocChapters.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <button className="icon-button" onClick={() => setActiveTocNovel(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <input
                type="text"
                className="search-input"
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
                placeholder="Filter chapters (e.g. Chapter 1, title)..."
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
              />
            </div>

            <div className="modal-body" style={{ padding: '0.75rem 1.25rem', overflowY: 'auto', flex: 1 }}>
              {filteredTocChapters.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No chapters found matching "{tocSearch}".
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {filteredTocChapters.map(chapter => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        setActiveTocNovel(null);
                        onStartReading(activeTocNovel.id, chapter.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      className="glass-panel-hover"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--primary-cyan)',
                          minWidth: '40px'
                        }}>
                          #{chapter.chapterNumber}
                        </span>
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block' }}>
                            {chapter.titleEn || `Chapter ${chapter.chapterNumber}`}
                          </span>
                          {chapter.titleZh && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {chapter.titleZh}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Click any chapter to begin reading immediately.
              </span>
              <button className="btn btn-secondary" onClick={() => setActiveTocNovel(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
