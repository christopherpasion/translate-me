import React, { useState } from 'react';
import type { GlossaryEntry } from '../types';
import { GitFork, X, Award } from 'lucide-react';

interface CharacterGraphModalProps {
  glossary: GlossaryEntry[];
  novelTitle: string;
  onClose: () => void;
}

export const CharacterGraphModal: React.FC<CharacterGraphModalProps> = ({
  glossary,
  novelTitle,
  onClose
}) => {
  const characters = glossary.filter(g => g.category === 'character');
  const realms = glossary.filter(g => g.category === 'realm');

  const [selectedNode, setSelectedNode] = useState<GlossaryEntry | null>(characters[0] || null);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '900px', height: '85vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GitFork size={24} style={{ color: 'var(--accent-purple)' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Character & Sect Relationship Graph</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visual knowledge map auto-generated for {novelTitle}</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', padding: '1rem' }}>
          {/* Interactive Graph Canvas */}
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.9) 0%, rgba(9, 13, 22, 1) 100%)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 500 400" style={{ position: 'absolute', inset: 0 }}>
              {/* Connecting Lines */}
              <line x1="250" y1="100" x2="130" y2="240" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="250" y1="100" x2="370" y2="240" stroke="rgba(157, 78, 221, 0.4)" strokeWidth="2" />
              <line x1="250" y1="100" x2="250" y2="310" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" />
              <line x1="130" y1="240" x2="370" y2="240" stroke="rgba(245, 87, 108, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Central Protagonist Node */}
              <g transform="translate(250, 100)" style={{ cursor: 'pointer' }} onClick={() => setSelectedNode(characters[0])}>
                <circle r="36" fill="rgba(0, 242, 254, 0.2)" stroke="#00f2fe" strokeWidth="3" />
                <text y="-5" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="var(--font-zh)">
                  {characters[0]?.originalZh || '主角'}
                </text>
                <text y="14" textAnchor="middle" fill="#00f2fe" fontSize="10">
                  {characters[0]?.translatedEn || 'Protagonist'}
                </text>
              </g>

              {/* Nodes */}
              {characters.slice(1, 4).map((char, i) => {
                const posX = i === 0 ? 130 : i === 1 ? 370 : 250;
                const posY = i === 0 ? 240 : i === 1 ? 240 : 310;
                const isSelected = selectedNode?.id === char.id;

                return (
                  <g key={char.id} transform={`translate(${posX}, ${posY})`} style={{ cursor: 'pointer' }} onClick={() => setSelectedNode(char)}>
                    <circle r="28" fill={isSelected ? 'rgba(157, 78, 221, 0.4)' : 'rgba(255,255,255,0.06)'} stroke={isSelected ? '#9d4edd' : 'rgba(255,255,255,0.3)'} strokeWidth="2" />
                    <text y="-3" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600" fontFamily="var(--font-zh)">
                      {char.originalZh}
                    </text>
                    <text y="12" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                      {char.translatedEn}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              ✦ Click any node to inspect relationships & rank details
            </div>
          </div>

          {/* Node Detail Inspector Sidebar */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Entity Inspector
            </h4>

            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-zh)' }}>
                    {selectedNode.originalZh}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-cyan)' }}>
                    {selectedNode.translatedEn}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>Category:</strong> <span style={{ color: '#fff', textTransform: 'capitalize' }}>{selectedNode.category}</span>
                </div>

                {selectedNode.gender && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>Gender:</strong> <span style={{ color: '#fff', textTransform: 'capitalize' }}>{selectedNode.gender}</span>
                  </div>
                )}

                {selectedNode.notes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>Role / Notes:</strong>
                    <p style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>{selectedNode.notes}</p>
                  </div>
                )}

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>Occurrences:</strong> <span style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>{selectedNode.occurrences} mentions</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select a node in the graph</p>
            )}

            {/* Cultivation Rank Hierarchy Breakdown */}
            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Award size={14} style={{ color: 'var(--accent-amber)' }} /> Realm Pyramid
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {realms.map((r, i) => (
                  <div key={r.id} style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Level {i + 1}: {r.originalZh}</span>
                    <span>{r.translatedEn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
