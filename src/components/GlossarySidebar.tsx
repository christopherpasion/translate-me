import React, { useState } from 'react';
import type { GlossaryEntry, EntityCategory, TermScope } from '../types';
import { Search, Plus, Trash2, Globe, Bookmark, Edit2, X } from 'lucide-react';

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
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<Partial<GlossaryEntry> | null>(null);

  const filtered = glossary.filter(entry => {
    const matchesSearch = entry.originalZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.translatedEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesScope = selectedScope === 'all' || entry.scope === selectedScope;
    return matchesSearch && matchesCategory && matchesScope;
  });

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry?.originalZh || !editingEntry?.translatedEn) return;

    const newEntry: GlossaryEntry = {
      id: editingEntry.id || `g-${novelId}-${Date.now()}`,
      originalZh: editingEntry.originalZh,
      translatedEn: editingEntry.translatedEn,
      category: (editingEntry.category as EntityCategory) || 'character',
      scope: (editingEntry.scope as TermScope) || 'local',
      gender: editingEntry.gender,
      notes: editingEntry.notes || '',
      occurrences: editingEntry.occurrences || 1,
      updatedAt: new Date().toISOString()
    };

    onSaveEntry(newEntry);
    setEditingEntry(null);
  };

  return (
    <aside className="glossary-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>2-Tier Glossary Map</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            onClick={() => setEditingEntry({ category: 'character', scope: 'local', originalZh: '', translatedEn: '' })}
          >
            <Plus size={14} /> Add Term
          </button>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
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
            placeholder="Search terms (ZH / EN)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem 0.4rem 2rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {['all', 'character', 'faction', 'realm', 'location', 'item', 'idiom'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem', textTransform: 'capitalize', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 2-Tier Scope Filter */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setSelectedScope('all')}
            className={`btn ${selectedScope === 'all' ? 'btn-secondary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.2rem', fontSize: '0.72rem', opacity: selectedScope === 'all' ? 1 : 0.6 }}
          >
            All Scope
          </button>
          <button
            onClick={() => setSelectedScope('local')}
            className={`btn ${selectedScope === 'local' ? 'btn-secondary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.2rem', fontSize: '0.72rem', color: 'var(--primary-cyan)', opacity: selectedScope === 'local' ? 1 : 0.6 }}
          >
            <Bookmark size={10} /> Local
          </button>
          <button
            onClick={() => setSelectedScope('global')}
            className={`btn ${selectedScope === 'global' ? 'btn-secondary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.2rem', fontSize: '0.72rem', color: 'var(--accent-purple)', opacity: selectedScope === 'global' ? 1 : 0.6 }}
          >
            <Globe size={10} /> Global
          </button>
        </div>
      </div>

      {/* Glossary Item List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {filtered.map(entry => (
          <div
            key={entry.id}
            className="glass-panel"
            style={{
              padding: '0.75rem',
              borderLeft: entry.scope === 'global' ? '3px solid var(--accent-purple)' : '3px solid var(--primary-cyan)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-zh)' }}>
                  {entry.originalZh}
                </span>
                <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                  {entry.category}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ padding: '0.2rem' }}
                  onClick={() => setEditingEntry(entry)}
                >
                  <Edit2 size={12} />
                </button>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ padding: '0.2rem', color: 'var(--accent-pink)' }}
                  onClick={() => onDeleteEntry(entry.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-cyan)' }}>
              {entry.translatedEn}
            </div>

            {entry.notes && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                {entry.notes}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {entry.scope === 'global' ? <Globe size={10} style={{ color: 'var(--accent-purple)' }} /> : <Bookmark size={10} style={{ color: 'var(--primary-cyan)' }} />}
                {entry.scope === 'global' ? 'Global Master' : 'Local Novel'}
              </span>
              <span>{entry.occurrences} matches</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Entry Modal */}
      {editingEntry && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-card" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                {editingEntry.id ? 'Edit Glossary Term' : 'Add New Glossary Term'}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingEntry(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveForm}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Chinese Term (原文)</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.originalZh || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, originalZh: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontFamily: 'var(--font-zh)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>English Translation</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.translatedEn || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, translatedEn: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Category</label>
                    <select
                      value={editingEntry.category || 'character'}
                      onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value as EntityCategory })}
                      style={{ width: '100%', padding: '0.5rem', background: '#1f2937', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    >
                      <option value="character">Character (人名)</option>
                      <option value="faction">Sect / Faction (宗门)</option>
                      <option value="realm">Cultivation Realm (境界)</option>
                      <option value="location">Location (地名)</option>
                      <option value="item">Item / Skill (功法/法宝)</option>
                      <option value="idiom">Idiom / Term (成语/术语)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Scope</label>
                    <select
                      value={editingEntry.scope || 'local'}
                      onChange={(e) => setEditingEntry({ ...editingEntry, scope: e.target.value as TermScope })}
                      style={{ width: '100%', padding: '0.5rem', background: '#1f2937', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    >
                      <option value="local">Local (This Novel)</option>
                      <option value="global">Global (All Novels)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Notes / Context</label>
                  <input
                    type="text"
                    value={editingEntry.notes || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                    placeholder="e.g. Protagonist / Rival"
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
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
