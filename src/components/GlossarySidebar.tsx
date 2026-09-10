import React, { useState } from 'react';
import type { GlossaryEntry, EntityCategory, Gender } from '../types';
import { Search, Plus, Trash2, Bookmark, Edit2, X, User } from 'lucide-react';

interface GlossarySidebarProps {
  glossary: GlossaryEntry[];
  novelId: string;
  onSaveEntry: (entry: GlossaryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClose: () => void;
}

export const GlossarySidebar: React.FC<GlossarySidebarProps> = ({
  glossary,
  novelId,
  onSaveEntry,
  onDeleteEntry,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<Partial<GlossaryEntry> & { aliasesInput?: string } | null>(null);

  const filtered = glossary.filter(entry => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      entry.translatedEn.toLowerCase().includes(q) ||
      (entry.notes && entry.notes.toLowerCase().includes(q)) ||
      (entry.originalZh && entry.originalZh.toLowerCase().includes(q)) ||
      (entry.aliases && entry.aliases.some(a => a.toLowerCase().includes(q)));
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddForm = () => {
    setEditingEntry({
      category: 'character',
      scope: 'local',
      translatedEn: '',
      originalZh: '',
      notes: '',
      gender: 'male',
      aliasesInput: ''
    });
  };

  const handleOpenEditForm = (entry: GlossaryEntry) => {
    setEditingEntry({
      ...entry,
      aliasesInput: entry.aliases ? entry.aliases.join(', ') : ''
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const termName = (editingEntry?.translatedEn || '').trim();
    if (!termName) return;

    const parsedAliases = editingEntry?.aliasesInput
      ? editingEntry.aliasesInput.split(',').map(a => a.trim()).filter(Boolean)
      : (editingEntry?.aliases || []);

    const newEntry: GlossaryEntry = {
      id: editingEntry?.id || `g-${novelId}-${Date.now()}`,
      originalZh: (editingEntry?.originalZh || '').trim() || termName,
      translatedEn: termName,
      category: (editingEntry?.category as EntityCategory) || 'character',
      scope: 'local',
      gender: editingEntry?.gender,
      aliases: parsedAliases,
      notes: (editingEntry?.notes || '').trim(),
      occurrences: editingEntry?.occurrences || 1,
      updatedAt: new Date().toISOString()
    };

    onSaveEntry(newEntry);
    setEditingEntry(null);
  };

  return (
    <aside className="glossary-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Novel Glossary</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Characters, factions & lore for this novel</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
            onClick={handleOpenAddForm}
          >
            <Plus size={14} />
            <span>Add Term</span>
          </button>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search characters & terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem 0.4rem 2rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'character', label: 'Characters' },
            { id: 'faction', label: 'Factions' },
            { id: 'location', label: 'Locations' },
            { id: 'item', label: 'Items' },
            { id: 'idiom', label: 'Terms / Lore' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`pill-toggle ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Glossary List */}
      <div className="sidebar-content scrollable" style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {searchQuery ? `No terms match "${searchQuery}".` : 'No glossary terms added yet for this novel. Click "+ Add Term" above to add characters, factions, and terms.'}
          </div>
        ) : (
          filtered.map(entry => {
            const hasRawZh = entry.originalZh && entry.originalZh !== entry.translatedEn && /[\u4e00-\u9fa5]/.test(entry.originalZh);

            return (
              <div
                key={entry.id}
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  borderLeft: '3px solid var(--primary-cyan)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>
                      {entry.translatedEn}
                    </span>
                    {hasRawZh && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', opacity: 0.85 }}>
                        ({entry.originalZh})
                      </span>
                    )}
                    <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary-cyan)', fontWeight: 600 }}>
                      {entry.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ padding: '0.2rem' }}
                      onClick={() => handleOpenEditForm(entry)}
                      title="Edit Term"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ padding: '0.2rem', color: 'var(--accent-pink)' }}
                      onClick={() => onDeleteEntry(entry.id)}
                      title="Delete Term"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {entry.gender && entry.category === 'character' && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                    <User size={11} />
                    <span>{entry.gender === 'male' ? 'Male' : entry.gender === 'female' ? 'Female' : entry.gender}</span>
                  </div>
                )}

                {entry.notes && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '0.25rem 0', lineHeight: 1.4 }}>
                    {entry.notes}
                  </p>
                )}

                {entry.aliases && entry.aliases.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>Aliases: </span>
                    <span>{entry.aliases.join(', ')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Bookmark size={10} style={{ color: 'var(--primary-cyan)' }} />
                    <span>Novel Term</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Entry Modal */}
      {editingEntry && (
        <div className="modal-overlay" onClick={() => setEditingEntry(null)} style={{ zIndex: 120, background: 'rgba(5, 8, 16, 0.85)' }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {editingEntry.id ? 'Edit Novel Term' : 'Add Novel Term'}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingEntry(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveForm}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                    Term / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yang Ye or Imperial Academy"
                    value={editingEntry.translatedEn || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, translatedEn: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                      Category
                    </label>
                    <select
                      value={editingEntry.category || 'character'}
                      onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value as EntityCategory })}
                      style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    >
                      <option value="character">Character</option>
                      <option value="faction">Sect / Faction</option>
                      <option value="location">Location</option>
                      <option value="item">Item / Artifact</option>
                      <option value="idiom">Term / Lore</option>
                    </select>
                  </div>

                  {editingEntry.category === 'character' ? (
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                        Gender
                      </label>
                      <select
                        value={editingEntry.gender || 'male'}
                        onChange={(e) => setEditingEntry({ ...editingEntry, gender: e.target.value as Gender })}
                        style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-Binary</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                        Original Raw (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Optional raw name"
                        value={editingEntry.originalZh || ''}
                        onChange={(e) => setEditingEntry({ ...editingEntry, originalZh: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                    Description / Notes (Shown on hover in reader)
                  </label>
                  <textarea
                    rows={3}
                    value={editingEntry.notes || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                    placeholder="e.g. Protagonist, reincarnated scholar preparing for provincial examinations."
                    style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                    Aliases / Nicknames (Optional, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingEntry.aliasesInput || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, aliasesInput: e.target.value })}
                    placeholder="e.g. Master Yang, Brother Ye"
                    style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingEntry(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Term</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
