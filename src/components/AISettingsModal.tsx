import React, { useState } from 'react';
import { getAISettings, saveAISettings, type AIProvider } from '../services/aiProvider';
import { StorageService } from '../services/storage';
import { Sparkles, Key, Cpu, Check, X, Zap, RefreshCw } from 'lucide-react';

interface AISettingsModalProps {
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ onClose }) => {
  const current = getAISettings();
  const [provider, setProvider] = useState<AIProvider>(current.provider || 'deepseek');
  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [tokenStats, setTokenStats] = useState(StorageService.getTokenUsage());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAISettings({ provider, apiKey: apiKey.trim() });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetTokens = () => {
    if (confirm('Are you sure you want to reset your DeepSeek token usage counter?')) {
      const reset = StorageService.resetTokenUsage();
      setTokenStats(reset);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={22} style={{ color: '#60a5fa' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>AI Engine & Provider Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure DeepSeek-V3, Gemini, Groq (Free), or Local Fallback Engine</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Provider Options Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
              {/* DeepSeek-V3 Option */}
              <div
                onClick={() => setProvider('deepseek')}
                className="glass-panel"
                style={{
                  padding: '0.85rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'deepseek' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                  background: provider === 'deepseek' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <Zap size={16} style={{ color: '#60a5fa' }} />
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>DeepSeek V3</strong>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  #1 for Chinese Xianxia & web novel prose. Fast & cheap.
                </p>
                <span className="badge" style={{ marginTop: '0.5rem', fontSize: '0.65rem', background: '#2563eb', color: '#fff' }}>
                  Recommended
                </span>
              </div>

              {/* Gemini API Option */}
              <div
                onClick={() => setProvider('gemini')}
                className="glass-panel"
                style={{
                  padding: '0.85rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'gemini' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                  background: provider === 'gemini' ? 'rgba(157, 78, 221, 0.12)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Gemini API</strong>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  Google Gemini 2.0 Flash engine with glossary prompt injection.
                </p>
                <span className="badge badge-scifi" style={{ marginTop: '0.5rem', fontSize: '0.65rem' }}>
                  Google API
                </span>
              </div>

              {/* Built-in Engine Option */}
              <div
                onClick={() => setProvider('built-in')}
                className="glass-panel"
                style={{
                  padding: '0.85rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'built-in' ? '2px solid var(--primary-cyan)' : '1px solid var(--border-color)',
                  background: provider === 'built-in' ? 'rgba(0, 242, 254, 0.12)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <Cpu size={16} style={{ color: 'var(--primary-cyan)' }} />
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Built-In Local</strong>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  Offline fallback translator. Uses local NER & Glossary Map.
                </p>
                <span className="badge badge-xianxia" style={{ marginTop: '0.5rem', fontSize: '0.65rem' }}>
                  Offline Mode
                </span>
              </div>

              {/* Groq (Llama 3) Option — FREE */}
              <div
                onClick={() => setProvider('groq')}
                className="glass-panel"
                style={{
                  padding: '0.85rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'groq' ? '2px solid #10b981' : '1px solid var(--border-color)',
                  background: provider === 'groq' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <Zap size={16} style={{ color: '#10b981' }} />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Groq</strong>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  Llama 3.3 70B on Groq Cloud. Lightning fast & free.
                </p>
                <span className="badge" style={{ marginTop: '0.5rem', fontSize: '0.65rem', background: '#059669', color: '#fff' }}>
                  🆓 FREE
                </span>
              </div>
            </div>

            {/* API Key Input */}
            {provider !== 'built-in' && (
              <div className="glass-panel" style={{ padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <Key size={14} style={{ color: 'var(--accent-amber)' }} />
                  {provider === 'deepseek' ? 'DeepSeek API Key' : provider === 'gemini' ? 'Gemini API Key' : 'Groq API Key'}
                </label>
                <input
                  type="password"
                  placeholder={provider === 'deepseek' ? 'sk-5e1262...' : provider === 'gemini' ? 'AIzaSy...' : 'gsk_4vbF...'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.35rem', margin: 0 }}>
                  Saved securely in your browser session. If left blank, defaults to local `.env.local` configuration.
                </p>
              </div>
            )}

            {/* DeepSeek Real-Time Token Usage Analytics Card */}
            <div className="glass-panel" style={{ padding: '0.85rem', background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={16} style={{ color: '#60a5fa' }} />
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>DeepSeek AI Token Usage Analytics</strong>
                </div>
                <button
                  type="button"
                  onClick={handleResetTokens}
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', gap: '0.25rem' }}
                  title="Reset counter"
                >
                  <RefreshCw size={12} />
                  <span>Reset</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📥 Input Tokens</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                    {tokenStats.promptTokens.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📤 Output Tokens</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                    {tokenStats.completionTokens.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⚡ Total Tokens</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.1rem' }}>
                    {tokenStats.totalTokens.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>💰 Total Cost</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginTop: '0.1rem' }}>
                    ${tokenStats.totalCostUsd.toFixed(5)}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', margin: 0 }}>
                Calculated at DeepSeek-V3 official rates: <strong>$0.14 / 1M prompt tokens</strong> and <strong>$0.28 / 1M completion tokens</strong>.
              </p>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>            
            <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
              {isSaved ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                'Save AI Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
