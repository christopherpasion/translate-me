import React, { useState } from 'react';
import type { GlossaryEntry, ChineseScript } from '../types';
import { searchDictionary } from '../services/dictionaryService';
import { Search, Plus, BookOpen, Check, X } from 'lucide-react';

interface DictionaryLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTermToGlossary: (entry: Partial<GlossaryEntry>) => void;
  existingGlossary: GlossaryEntry[];
}

export const DictionaryLookupModal: React.FC<DictionaryLookupModalProps> = ({
  isOpen,
  onClose,
  onAddTermToGlossary,
  existingGlossary
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scriptMode, setScriptMode] = useState<ChineseScript>('simplified');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const results = searchDictionary(searchQuery);
  const existingSet = new Set(existingGlossary.map(g => g.originalZh));

  const handleAdd = (id: string, entry: any) => {
    onAddTermToGlossary({
      originalZh: entry.simplifiedZh,
      translatedEn: entry.englishDefinition.split('/')[0].trim(),
      category: entry.category,
      scope: 'local',
      pinyin: entry.pinyin,
      traditionalZh: entry.traditionalZh,
      notes: entry.genreContext ? `Genre context: ${entry.genreContext}` : undefined,
      occurrences: 1,
      updatedAt: new Date().toISOString()
    });

    setAddedIds(prev => new Set(prev).add(id));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card modal-card-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-badge-glow">
              <BookOpen size={22} style={{ color: 'var(--accent-pink)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Master Chinese-English Dictionary
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                115,000+ Words • Tone-Marked Pinyin • Xianxia & Wuxia Lexicon
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search & Script Toggle Toolbar */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search Chinese (简体/繁體), Pinyin (Dān Tián), or English meaning..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ width: '100%', paddingLeft: '38px' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '3px', border: '1px solid var(--border-color)' }}>
              <button
                className={`pill-toggle ${scriptMode === 'simplified' ? 'active' : ''}`}
                onClick={() => setScriptMode('simplified')}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
              >
                简体 (Simplified)
              </button>
              <button
                className={`pill-toggle ${scriptMode === 'traditional' ? 'active' : ''}`}
                onClick={() => setScriptMode('traditional')}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
              >
                繁體 (Traditional)
              </button>
            </div>
          </div>

          {/* Results List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <BookOpen size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No dictionary entries match "{searchQuery}".</p>
              </div>
            ) : (
              results.map(entry => {
                const displayZh = scriptMode === 'traditional' ? entry.traditionalZh : entry.simplifiedZh;
                const isAlreadyAdded = existingSet.has(entry.simplifiedZh) || addedIds.has(entry.id);

                return (
                  <div
                    key={entry.id}
                    className="training-card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-zh)' }}>
                          {displayZh}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-pink)' }}>
                          [{entry.pinyin}]
                        </span>
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(79, 172, 254, 0.12)', color: 'var(--primary-blue)' }}>
                          {entry.category}
                        </span>
                        {entry.genreContext && (
                          <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(157, 78, 221, 0.15)', color: 'var(--accent-purple)' }}>
                            {entry.genreContext}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.3rem', fontWeight: 600 }}>
                        {entry.englishDefinition}
                      </div>

                      {entry.literalBreakdown && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Etymology: {entry.literalBreakdown}
                        </div>
                      )}

                      {entry.sampleZh && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div><strong style={{ color: 'var(--text-main)' }}>ZH:</strong> {entry.sampleZh}</div>
                          <div><strong style={{ color: 'var(--text-main)' }}>EN:</strong> {entry.sampleEn}</div>
                        </div>
                      )}
                    </div>

                    <button
                      className={`btn ${isAlreadyAdded ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleAdd(entry.id, entry)}
                      disabled={isAlreadyAdded}
                      style={{ whiteSpace: 'nowrap', minWidth: '135px', justifyContent: 'center', opacity: isAlreadyAdded ? 0.7 : 1 }}
                    >
                      {isAlreadyAdded ? (
                        <>
                          <Check size={14} /> Added
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> Add to Glossary
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.45rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
