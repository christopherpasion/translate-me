import React, { useState, useEffect, useMemo } from 'react';
import type { Novel, Genre } from '../types';
import { Plus, Search, Layers, ArrowRight, X, Trash2, Edit3, Sparkles, Check, Tag } from 'lucide-react';
import { getGenreMeta, getAllGenreCategories, WEB_NOVEL_TROPE_TAGS, GENRE_DEFINITIONS, detectSuggestedGenre } from '../services/genrePresets';

interface NovelLibraryProps {
  novels: Novel[];
  onSelectNovel: (id: string) => void;
  onCreateNovel: (
    newNovel: Omit<Novel, 'id' | 'chaptersCount' | 'translatedCount' | 'createdAt' | 'updatedAt'>,
    seedStarterGlossary?: boolean
  ) => void;
  onUpdateNovel?: (updatedNovel: Novel) => void;
  onDeleteNovel?: (id: string) => void;
  onClose: () => void;
}

export const NovelLibrary: React.FC<NovelLibraryProps> = ({
  novels,
  onSelectNovel,
  onCreateNovel,
  onUpdateNovel,
  onDeleteNovel,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (novelToDelete) {
          setNovelToDelete(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
          setEditingNovel(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isModalOpen, novelToDelete]);

  // Form state for creating / editing novel
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<Genre>('xianxia');
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const [customGenreText, setCustomGenreText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [seedStarterGlossary, setSeedStarterGlossary] = useState(true);
  const [description, setDescription] = useState('');

  // AI Genre & Trope Auto-Detector
  const aiGenreSuggestion = useMemo(() => {
    if (editingNovel) return null;
    return detectSuggestedGenre({
      titleZh,
      titleEn,
      description
    });
  }, [titleZh, titleEn, description, editingNovel]);

  const openCreateModal = () => {
    setEditingNovel(null);
    setTitleZh('');
    setTitleEn('');
    setAuthor('');
    setGenre('xianxia');
    setIsCustomGenre(false);
    setCustomGenreText('');
    setSelectedTags(['op_mc']);
    setSeedStarterGlossary(true);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (novel: Novel, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNovel(novel);
    setTitleZh(novel.titleZh);
    setTitleEn(novel.titleEn);
    setAuthor(novel.author);
    if (GENRE_DEFINITIONS[novel.genre]) {
      setGenre(novel.genre);
      setIsCustomGenre(false);
      setCustomGenreText('');
    } else {
      setGenre('custom');
      setIsCustomGenre(true);
      setCustomGenreText(novel.genre);
    }
    setSelectedTags(novel.tags || []);
    setSeedStarterGlossary(false);
    setDescription(novel.description);
    setIsModalOpen(true);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const genreCategories = getAllGenreCategories();

  const filteredNovels = novels.filter(novel => {
    const matchesSearch = novel.titleZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          novel.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          novel.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (novel.tags && novel.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesGenre = selectedGenre === 'all' || novel.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleZh || !titleEn) return;

    const finalGenre = isCustomGenre ? (customGenreText.trim() || 'Custom') : genre;

    if (editingNovel && onUpdateNovel) {
      onUpdateNovel({
        ...editingNovel,
        titleZh,
        titleEn,
        author: author || 'Unknown Author',
        genre: finalGenre,
        tags: selectedTags,
        description: description || 'Chinese web novel translation project.',
        updatedAt: new Date().toISOString()
      });
    } else {
      const gradients = [
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      ];
      const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];

      onCreateNovel(
        {
          titleZh,
          titleEn,
          author: author || 'Unknown Author',
          genre: finalGenre,
          tags: selectedTags,
          coverGradient,
          description: description || 'Chinese web novel translation project.'
        },
        seedStarterGlossary
      );
    }

    setIsModalOpen(false);
    setEditingNovel(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(5, 8, 16, 0.85)' }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '980px', height: '88vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={24} style={{ color: 'var(--primary-cyan)' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Novel Library Workspace</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                Manage multiple Chinese web novel translation projects, 20+ genre presets, and 2-tier glossaries
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal();
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

        {/* Filter Toolbar: Search Bar + Categorized Dropdown + Quick Pills */}
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Row 1: Search & Categorized Dropdown */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search novels by title, author, or trope tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            {/* Categorized Genre Filter Dropdown (Replaces horizontal scrollbar) */}
            <div style={{ minWidth: '240px' }}>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">📚 All Genres ({novels.length})</option>
                {genreCategories.map(cat => (
                  <optgroup key={cat.id} label={cat.name} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {cat.genres.map(g => {
                      const count = novels.filter(n => n.genre === g.id).length;
                      return (
                        <option key={g.id} value={g.id}>
                          {g.icon} {g.nameEn.split(' / ')[0]} ({count})
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Popular Quick Filters (4-5 shortcut chips, clean & wrapped) */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.2rem' }}>
              Quick Filters:
            </span>
            {['all', 'xianxia', 'system', 'isekai', 'scifi', 'urban'].map(gId => {
              const isSelected = selectedGenre === gId;
              const gMeta = gId === 'all' ? null : getGenreMeta(gId);
              const count = gId === 'all' ? novels.length : novels.filter(n => n.genre === gId).length;
              const label = gId === 'all' ? 'All' : gMeta?.nameEn.split(' / ')[0];
              const icon = gId === 'all' ? '📚' : gMeta?.icon;

              return (
                <button
                  key={gId}
                  type="button"
                  onClick={() => setSelectedGenre(gId)}
                  style={{
                    padding: '0.22rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid var(--primary-cyan)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--primary-cyan)' : 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{icon}</span>
                  <span>{label} ({count})</span>
                </button>
              );
            })}
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
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5, margin: '0 auto 1.5rem auto' }}>
              {searchQuery
                ? `No novel projects match "${searchQuery}". Try searching another keyword or select All Genres.`
                : 'Your novel library is empty. Create your first novel project to start translating with 20+ genre presets & AI!'}
            </p>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal();
              }}
              style={{ padding: '0.6rem 1.25rem', gap: '0.4rem', fontWeight: 700 }}
            >
              <Plus size={18} />
              <span>Create Your First Novel</span>
            </button>
          </div>
        ) : (
          <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem', overflowY: 'auto' }}>
            {filteredNovels.map(novel => {
              const genreMeta = getGenreMeta(novel.genre);

              return (
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
                    {/* Top Badges & Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: genreMeta.badgeGradient,
                          border: `1px solid ${genreMeta.badgeBorder}`,
                          color: genreMeta.badgeColor,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          textTransform: 'uppercase'
                        }}
                      >
                        <span>{genreMeta.icon}</span>
                        <span>{genreMeta.nameEn.split(' / ')[0]}</span>
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={(e) => openEditModal(novel, e)}
                          title={`Edit ${novel.titleEn || novel.titleZh} details & genre`}
                          style={{
                            padding: '0.25rem 0.45rem',
                            color: 'var(--text-muted)',
                            borderColor: 'var(--border-color)',
                            background: 'var(--bg-card)'
                          }}
                        >
                          <Edit3 size={13} />
                        </button>
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
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {novel.titleZh}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--primary-cyan)', fontWeight: 500, marginBottom: '0.4rem' }}>
                      {novel.titleEn}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                      By {novel.author}
                    </p>

                    {/* Trope Tag Pills */}
                    {novel.tags && novel.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.65rem' }}>
                        {novel.tags.map(tagId => {
                          const tagMeta = WEB_NOVEL_TROPE_TAGS.find(t => t.id === tagId);
                          return (
                            <span
                              key={tagId}
                              style={{
                                fontSize: '0.68rem',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-color)',
                                color: tagMeta ? tagMeta.color : 'var(--text-dim)'
                              }}
                            >
                              🏷️ {tagMeta ? tagMeta.nameEn : tagId}
                            </span>
                          );
                        })}
                      </div>
                    )}

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
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Novel Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
            setEditingNovel(null);
          }}
          style={{ zIndex: 120, background: 'rgba(5, 8, 16, 0.85)' }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={20} style={{ color: 'var(--primary-cyan)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {editingNovel ? 'Edit Novel Project Details' : 'Create New Novel Project'}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(false);
                  setEditingNovel(null);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} onClick={(e) => e.stopPropagation()}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Titles */}
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Chinese Title (书名) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 完美世界 or 诡秘之主 or 全球高武系统"
                    value={titleZh}
                    onChange={(e) => setTitleZh(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                    English Title (Translated Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Perfect World or Lord of Mysteries"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>

                {/* Real-time AI Suggested Genre Banner */}
                {aiGenreSuggestion && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                      <Sparkles size={14} style={{ color: 'var(--primary-cyan)' }} />
                      <span style={{ color: 'var(--text-muted)' }}>AI Suggestion:</span>
                      <strong style={{ color: 'var(--primary-cyan)' }}>
                        {aiGenreSuggestion.genreMeta.icon} {aiGenreSuggestion.genreMeta.nameEn.split(' / ')[0]}
                      </strong>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7, color: 'var(--text-dim)' }}>
                        ({aiGenreSuggestion.confidence}% match • {aiGenreSuggestion.reason})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGenre(aiGenreSuggestion.genre);
                        setIsCustomGenre(false);
                        setSelectedTags(prev => Array.from(new Set([...prev, ...aiGenreSuggestion.suggestedTags])));
                      }}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        background: 'var(--primary-cyan)',
                        color: '#000',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>⚡ Apply Suggestion</span>
                    </button>
                  </div>
                )}

                {/* Author & Categorized Genre Preset */}
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Author (作者)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 辰东 (Chen Dong)"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Genre Preset (20+ Categories)
                    </label>
                    <select
                      value={isCustomGenre ? 'custom' : genre}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setIsCustomGenre(true);
                        } else {
                          setIsCustomGenre(false);
                          setGenre(val as Genre);
                        }
                      }}
                      style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    >
                      {genreCategories.map(cat => (
                        <optgroup key={cat.id} label={cat.name} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                          {cat.genres.map(g => (
                            <option key={g.id} value={g.id}>
                              {g.icon} {g.nameEn} ({g.nameZh})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <optgroup label="✨ Custom Genre" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                        <option value="custom">✨ Custom User Genre...</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Custom Genre Text Field */}
                {isCustomGenre && (
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Custom Genre Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cultivation Cooking, Necromancer Academy, Post-Apocalyptic Farm..."
                      value={customGenreText}
                      onChange={(e) => setCustomGenreText(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--primary-cyan)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontWeight: 600 }}
                    />
                  </div>
                )}

                {/* Web Novel Trope Tags Multi-Selector */}
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem', fontWeight: 600 }}>
                    <Tag size={14} style={{ color: 'var(--primary-cyan)' }} />
                    <span>Popular Web Novel Trope Tags (Multi-Select)</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto', padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    {WEB_NOVEL_TROPE_TAGS.map(tag => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          style={{
                            padding: '0.25rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: isSelected ? `1px solid ${tag.color}` : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'var(--bg-card)',
                            color: isSelected ? tag.color : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {isSelected && <Check size={11} />}
                          <span>{tag.nameEn}</span>
                          <span style={{ opacity: 0.7 }}>({tag.nameZh})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seed Starter Glossary Checkbox (Create Mode Only) */}
                {!editingNovel && (
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(0, 242, 254, 0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 242, 254, 0.2)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <input
                      type="checkbox"
                      id="seedGlossary"
                      checked={seedStarterGlossary}
                      onChange={(e) => setSeedStarterGlossary(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-cyan)' }}
                    />
                    <label htmlFor="seedGlossary" style={{ fontSize: '0.83rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <strong>⚡ Seed Genre Starter Glossary:</strong> Pre-load 10–15 core terminology entries (realms, status screens, titles) into this novel's local glossary.
                    </label>
                  </div>
                )}

                {/* Synopsis / Notes */}
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Synopsis / Project Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description, cultivation power systems, or translation notes..."
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
                    setEditingNovel(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  <Sparkles size={16} />
                  <span>{editingNovel ? 'Save Novel Changes' : 'Create Novel & Open Workspace'}</span>
                </button>
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
                ⚠️ <strong>Warning:</strong> All {novelToDelete.chaptersCount} chapters and custom glossary terms specific to this novel will be deleted from your local workspace.
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setNovelToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (onDeleteNovel) {
                    onDeleteNovel(novelToDelete.id);
                  }
                  setNovelToDelete(null);
                }}
                style={{
                  background: 'var(--accent-red)',
                  borderColor: 'var(--accent-red)',
                  color: '#fff',
                  fontWeight: 700
                }}
              >
                Delete Novel Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
