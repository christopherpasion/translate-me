import React, { useState, useEffect } from 'react';
import type { Novel, Genre } from '../types';
import { Plus, Search, Layers, ArrowRight, X, Trash2 } from 'lucide-react';

interface NovelLibraryProps {
  novels: Novel[];
  onSelectNovel: (id: string) => void;
  onCreateNovel: (newNovel: Omit<Novel, 'id' | 'chaptersCount' | 'translatedCount' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteNovel?: (id: string) => void;
  onClose: () => void;
}

export const NovelLibrary: React.FC<NovelLibraryProps> = ({
  novels,
  onSelectNovel,
  onCreateNovel,
  onDeleteNovel,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (novelToDelete) {
          setNovelToDelete(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isModalOpen, novelToDelete]);

  // Form state for creating novel
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<Genre>('xianxia');
  const [description, setDescription] = useState('');

  const filteredNovels = novels.filter(novel => {
    const matchesSearch = novel.titleZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          novel.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          novel.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || novel.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleSubmitNewNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleZh || !titleEn) return;

    const gradients = [
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    ];
    const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];

    onCreateNovel({
      titleZh,
      titleEn,
      author: author || 'Unknown Author',
      genre,
      coverGradient,
      description: description || 'Chinese web novel translation project.'
    });

    setIsModalOpen(false);
    setTitleZh('');
    setTitleEn('');
    setAuthor('');
    setDescription('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(5, 8, 16, 0.85)' }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '950px', height: '85vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={24} style={{ color: 'var(--primary-cyan)' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Novel Library Workspace</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>Manage multiple Chinese web novel translation projects with 2-tier glossaries</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span>Create New Novel</span>
            </button>
            <button className="btn btn-secondary btn-icon" onClick={onClose} title="Close Library (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search novels by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          <div className="mobile-scroll-row" style={{ width: '100%' }}>
            {['all', 'xianxia', 'wuxia', 'scifi', 'urban'].map(g => (
              <button
                key={g}
                className={`badge ${selectedGenre === g ? 'badge-active' : ''}`}
                onClick={() => setSelectedGenre(g)}
                style={{
                  cursor: 'pointer',
                  border: selectedGenre === g ? '1px solid var(--primary-cyan)' : '1px solid var(--border-color)',
                  background: selectedGenre === g ? 'rgba(0, 242, 254, 0.15)' : 'var(--bg-card)',
                  color: selectedGenre === g ? 'var(--primary-cyan)' : 'var(--text-muted)',
                  textTransform: 'capitalize',
                  padding: '0.35rem 0.75rem',
                  fontWeight: 600,
                  flexShrink: 0
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Novel Cards Grid or Empty State */}
        {filteredNovels.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0, 242, 254, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid rgba(0, 242, 254, 0.2)'
            }}>
              <Layers size={32} style={{ color: 'var(--primary-cyan)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, marginBottom: '0.4rem' }}>
              {searchQuery ? 'No Matching Novels Found' : 'No Novels in Library'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.5, margin: '0 auto 1.5rem auto' }}>
              {searchQuery
                ? `No novel projects match "${searchQuery}". Try a different search term or clear the filter.`
                : 'Your novel workspace is empty. Create your first novel project to start translating with AI!'}
            </p>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              style={{ padding: '0.6rem 1.25rem', gap: '0.4rem', fontWeight: 700 }}
            >
              <Plus size={18} />
              <span>Create Your First Novel</span>
            </button>
          </div>
        ) : (
          <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', overflowY: 'auto' }}>
            {filteredNovels.map(novel => (
              <div
                key={novel.id}
                onClick={() => {
                  onSelectNovel(novel.id);
                  onClose();
                }}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-elevated)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <span className={`badge badge-${novel.genre}`} style={{ textTransform: 'uppercase' }}>
                      {novel.genre}
                    </span>
                    {onDeleteNovel && (
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNovelToDelete(novel);
                        }}
                        title={`Delete ${novel.titleEn || novel.titleZh}`}
                        style={{
                          padding: '0.25rem 0.45rem',
                          color: 'var(--accent-red)',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.08)'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {novel.titleZh}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--primary-cyan)', fontWeight: 500, marginBottom: '0.5rem' }}>
                    {novel.titleEn}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    By {novel.author}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {novel.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{novel.translatedCount}</strong> / {novel.chaptersCount} chapters
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>Open Novel</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Novel Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
          style={{ zIndex: 120, background: 'rgba(5, 8, 16, 0.85)' }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Create New Novel Project</h3>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(false);
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitNewNovel} onClick={(e) => e.stopPropagation()}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Chinese Title (书名)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 完美世界"
                    value={titleZh}
                    onChange={(e) => setTitleZh(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>English Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Perfect World"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Author (作者)</label>
                    <input
                      type="text"
                      placeholder="e.g. 辰东 (Chen Dong)"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Genre Preset</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value as Genre)}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    >
                      <option value="xianxia">Xianxia (仙侠)</option>
                      <option value="wuxia">Wuxia (武侠)</option>
                      <option value="xuanhuan">Xuanhuan (玄幻)</option>
                      <option value="scifi">Sci-Fi (科幻)</option>
                      <option value="urban">Urban (都市)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Synopsis / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Create Novel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Novel Confirmation Modal */}
      {novelToDelete && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setNovelToDelete(null);
          }}
          style={{ zIndex: 130, background: 'rgba(5, 8, 16, 0.85)' }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-red)' }}>
                <Trash2 size={20} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Delete Novel Confirmation</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setNovelToDelete(null)}
                style={{ border: 'none', background: 'transparent' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                Are you sure you want to permanently delete{' '}
                <strong style={{ color: 'var(--primary-cyan)' }}>
                  {novelToDelete.titleEn || novelToDelete.titleZh}
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
                ⚠️ <strong>Warning:</strong> This will permanently delete this novel, all of its chapters, raw text, translations, and novel-specific glossary terms. This action cannot be undone.
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setNovelToDelete(null)}
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
                  if (onDeleteNovel) {
                    onDeleteNovel(novelToDelete.id);
                  }
                  setNovelToDelete(null);
                }}
              >
                <Trash2 size={14} /> Delete Novel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

