import React, { useState } from 'react';
import { getAISettings, saveAISettings, type AIProvider } from '../services/aiProvider';
import { Sparkles, Key, Cpu, Check, X } from 'lucide-react';

interface AISettingsModalProps {
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ onClose }) => {
  const current = getAISettings();
  const [provider, setProvider] = useState<AIProvider>(current.provider);
  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAISettings({ provider, apiKey: apiKey.trim() });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Cpu size={22} style={{ color: 'var(--primary-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>AI Engine & Provider Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose between Free Built-In Local Engine or Gemini API</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Provider Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Built-in Engine Option */}
              <div
                onClick={() => setProvider('built-in')}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  border: provider === 'built-in' ? '2px solid var(--primary-cyan)' : '1px solid var(--border-color)',
                  background: provider === 'built-in' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Cpu size={18} style={{ color: 'var(--primary-cyan)' }} />
                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Free Built-In Engine</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Zero API key required. Uses local NER extractor & Glossary Map self-healing rules.
                </p>
                <span className="badge badge-xianxia" style={{ marginTop: '0.6rem', fontSize: '0.7rem' }}>
                  Ready to Use
                </span>
              </div>

              {/* Gemini API Option */}
              <div
                onClick={() => setProvider('gemini')}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  border: provider === 'gemini' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                  background: provider === 'gemini' ? 'rgba(157, 78, 221, 0.1)' : 'rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Google Gemini API</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Live LLM translation using Gemini 2.0 Flash with Glossary Prompt Injection.
                </p>
                <span className="badge badge-scifi" style={{ marginTop: '0.6rem', fontSize: '0.7rem' }}>
                  Live API
                </span>
              </div>
            </div>

            {/* API Key Input if Gemini Selected */}
            {provider === 'gemini' && (
              <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Key size={14} style={{ color: 'var(--accent-amber)' }} />
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="Paste AIzaSy... API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                  Your API key is saved locally in your browser. If left blank, it will automatically fallback to the built-in local engine.
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isSaved ? <Check size={16} /> : <Sparkles size={16} />}
              <span>{isSaved ? 'Saved Settings!' : 'Save Engine Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
