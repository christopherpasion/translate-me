import React, { useState } from 'react';
import type { AIRecommendation, ReaderSuggestion } from '../types';
import { ShieldCheck, Sparkles, Users, Check, X, ArrowRight } from 'lucide-react';

interface GovernanceModalProps {
  recommendations: AIRecommendation[];
  suggestions: ReaderSuggestion[];
  onApproveRecommendation: (rec: AIRecommendation) => void;
  onRejectRecommendation: (id: string) => void;
  onApproveSuggestion: (sug: ReaderSuggestion) => void;
  onRejectSuggestion: (id: string) => void;
  onClose: () => void;
}

export const GovernanceModal: React.FC<GovernanceModalProps> = ({
  recommendations,
  suggestions,
  onApproveRecommendation,
  onRejectRecommendation,
  onApproveSuggestion,
  onRejectSuggestion,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'community'>('ai');

  const pendingRecs = recommendations.filter(r => r.status === 'pending');
  const pendingSugs = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '800px', height: '80vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={24} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Owner Governance & Self-Healing Approval</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Review AI recommendations and reader correction suggestions for global cascade replacement</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${activeTab === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ai')}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} />
            <span>AI Recommendations ({pendingRecs.length})</span>
          </button>
          <button
            className={`btn ${activeTab === 'community' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('community')}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            <Users size={16} />
            <span>Reader Suggestions ({pendingSugs.length})</span>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeTab === 'ai' ? (
            pendingRecs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No pending AI recommendations right now.
              </p>
            ) : (
              pendingRecs.map(rec => (
                <div
                  key={rec.id}
                  className="glass-panel"
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderLeft: '3px solid var(--primary-cyan)' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-zh)' }}>
                        {rec.originalZh}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>
                        {rec.suggestedEn}
                      </span>
                      <span className="badge badge-xianxia" style={{ textTransform: 'capitalize' }}>
                        {rec.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>AI Reason:</strong> {rec.reason}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ color: 'var(--accent-pink)' }}
                      onClick={() => onRejectRecommendation(rec.id)}
                    >
                      <X size={16} />
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => onApproveRecommendation(rec)}
                    >
                      <Check size={16} />
                      <span>Approve & Cascade</span>
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            pendingSugs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No pending reader suggestions right now.
              </p>
            ) : (
              pendingSugs.map(sug => (
                <div
                  key={sug.id}
                  className="glass-panel"
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderLeft: '3px solid var(--accent-amber)' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-zh)' }}>
                        {sug.originalZh}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                        {sug.currentEn}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                        {sug.suggestedEn}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Submitted by <strong>{sug.submittedBy}</strong> in Ch. {sug.chapterNumber}: "{sug.reason}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ color: 'var(--accent-pink)' }}
                      onClick={() => onRejectSuggestion(sug.id)}
                    >
                      <X size={16} />
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => onApproveSuggestion(sug)}
                    >
                      <Check size={16} />
                      <span>Approve & Heal Book</span>
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
