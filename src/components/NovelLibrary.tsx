import React, { useState } from 'react';
import type { Novel, Genre } from '../types';
import { Plus, Search, Layers, ArrowRight } from 'lucide-react';

interface NovelLibraryProps {
  novels: Novel[];
  onSelectNovel: (id: string) => void;
  onCreateNovel: (newNovel: Omit<Novel, 'id' | 'chaptersCount' | 'translatedCount' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const NovelLibrary: React.FC<NovelLibraryProps> = ({
  novels,
  onSelectNovel,
  onCreateNovel,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="modal-overlay" style={{ background: 'rgba(5, 8, 16, 0.95)' }}>
      <div className="modal-card" style={{ maxWidth: '950px', height: '85vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={24} style={{ color: 'var(--primary-cyan)' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Novel Library Workspace</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>Manage multiple Chinese web novel translation projects with 2-tier glossaries</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Create New Novel</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
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

          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  fontWeight: 600
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Novel Cards Grid */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
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
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <span className={`badge badge-${novel.genre}`} style={{ textTransform: 'uppercase' }}>
                    {novel.genre}
                  </span>
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
      </div>

      {/* Create Novel Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Create New Novel Project</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitNewNovel}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Novel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
