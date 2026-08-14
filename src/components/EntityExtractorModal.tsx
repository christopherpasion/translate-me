import React, { useState } from 'react';
import type { ExtractedEntity } from '../services/nerExtractor';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface EntityExtractorModalProps {
  entities: ExtractedEntity[];
  onConfirmAndTranslate: (approvedEntities: ExtractedEntity[]) => void;
  onClose: () => void;
}

export const EntityExtractorModal: React.FC<EntityExtractorModalProps> = ({
  entities,
  onConfirmAndTranslate,
  onClose
}) => {
  const [selectedEntities, setSelectedEntities] = useState<ExtractedEntity[]>(entities);

  const toggleEntity = (entity: ExtractedEntity) => {
    if (selectedEntities.some(e => e.originalZh === entity.originalZh)) {
      setSelectedEntities(selectedEntities.filter(e => e.originalZh !== entity.originalZh));
    } else {
      setSelectedEntities([...selectedEntities, entity]);
    }
  };

  const handleUpdateTranslation = (index: number, newEn: string) => {
    const updated = [...selectedEntities];
    const itemIdx = updated.findIndex(e => e.originalZh === entities[index].originalZh);
    if (itemIdx >= 0) {
      updated[itemIdx].suggestedEn = newEn;
      setSelectedEntities(updated);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(5, 8, 16, 0.85)' }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '85vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={22} style={{ color: 'var(--primary-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Pre-Translation Entity Scanner</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                Found {entities.length} character names & proper nouns in Chinese text — converted to English
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'rgba(0, 242, 254, 0.08)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
            <strong>💡 Self-Learning Glossary Setup:</strong> These character names and terms will be saved to your novel's Glossary Map to guarantee 100% consistent English names across all chapters. You can edit the English translations below before approving.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            {entities.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No new proper nouns detected. Ready to translate directly into English!
              </div>
            ) : (
              entities.map((item, idx) => {
                const isSelected = selectedEntities.some(e => e.originalZh === item.originalZh);

                return (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      opacity: isSelected ? 1 : 0.45,
                      borderLeft: isSelected ? '3px solid var(--primary-cyan)' : '3px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleEntity(item)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-zh)' }}>
                            {item.originalZh}
                          </span>
                          <span className={`badge badge-${item.category === 'character' ? 'xianxia' : 'scifi'}`}>
                            {item.category}
                          </span>
                          {item.gender && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.gender})</span>
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>{item.count}x in chapter</span>
                        </div>
                        {item.sampleSentence && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                            "{item.sampleSentence}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={item.suggestedEn}
                        onChange={(e) => handleUpdateTranslation(idx, e.target.value)}
                        placeholder="English Translation Name"
                        style={{
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.85rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--primary-cyan)',
                          fontWeight: 600,
                          width: '200px'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => onConfirmAndTranslate([])}>
            Skip & Translate Directly
          </button>
          <button className="btn btn-primary" onClick={() => onConfirmAndTranslate(selectedEntities)}>
            <Sparkles size={16} />
            <span>Approve Glossary & Translate Chapter ({selectedEntities.length} Terms)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
