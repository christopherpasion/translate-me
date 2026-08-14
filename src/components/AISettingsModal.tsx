import React, { useState, useEffect } from 'react';
import { getAISettings, saveAISettings, fetchOllamaModels, DEFAULT_OLLAMA_ENDPOINT, DEFAULT_OLLAMA_MODEL, type AIProvider } from '../services/aiProvider';
import { StorageService } from '../services/storage';
import { customNeuralTranslator, type ModelDownloadProgress } from '../services/customNeuralTranslator';
import { Key, Cpu, Check, X, Zap, RefreshCw, Server, AlertCircle, CheckCircle2, Brain, DownloadCloud } from 'lucide-react';

interface AISettingsModalProps {
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ onClose }) => {
  const current = getAISettings();
  const [provider, setProvider] = useState<AIProvider>(current.provider || 'custom-neural');
  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [ollamaEndpoint, setOllamaEndpoint] = useState(current.ollamaEndpoint || DEFAULT_OLLAMA_ENDPOINT);
  const [ollamaModel, setOllamaModel] = useState(current.ollamaModel || DEFAULT_OLLAMA_MODEL);
  const [tokenStats, setTokenStats] = useState(StorageService.getTokenUsage());
  const [isSaved, setIsSaved] = useState(false);

  // Neural in-house model state
  const [neuralProgress, setNeuralProgress] = useState<ModelDownloadProgress>(customNeuralTranslator.getStatus());
  const [isPreloadingNeural, setIsPreloadingNeural] = useState(false);

  // Ollama connection testing state
  const [ollamaModelsList, setOllamaModelsList] = useState<string[]>([]);
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{ ok: boolean; message: string } | null>(null);

  // Live per-provider usage counters
  const ollamaDaily = StorageService.getApiCallsToday('ollama');
  const deepseekDaily = StorageService.getApiCallsToday('deepseek');
  const groqDaily = StorageService.getApiCallsToday('groq');

  useEffect(() => {
    const unsub = customNeuralTranslator.subscribe((p) => {
      setNeuralProgress(p);
    });
    return unsub;
  }, []);

  const handlePreloadNeuralCore = async () => {
    setIsPreloadingNeural(true);
    try {
      await customNeuralTranslator.preloadModel();
    } catch (err) {
      console.error('Failed to preload neural core:', err);
    } finally {
      setIsPreloadingNeural(false);
    }
  };

  const testOllamaConnection = async () => {
    setIsTestingOllama(true);
    setOllamaStatus(null);
    try {
      const models = await fetchOllamaModels(ollamaEndpoint);
      if (models.length > 0) {
        setOllamaModelsList(models);
        setOllamaStatus({
          ok: true,
          message: `Connected! Found ${models.length} installed model(s): ${models.slice(0, 3).join(', ')}${models.length > 3 ? '...' : ''}`
        });
        if (!models.includes(ollamaModel)) {
          setOllamaModel(models[0]);
        }
      } else {
        setOllamaStatus({
          ok: false,
          message: 'Ollama is reachable, but no models found. Run `ollama pull qwen2.5:7b` in terminal.'
        });
      }
    } catch {
      setOllamaStatus({
        ok: false,
        message: 'Could not connect. Ensure Ollama is running and set OLLAMA_ORIGINS="*" if on Windows/Mac.'
      });
    } finally {
      setIsTestingOllama(false);
    }
  };

  useEffect(() => {
    if (provider === 'ollama') {
      fetchOllamaModels(ollamaEndpoint).then(models => {
        if (models.length > 0) {
          setOllamaModelsList(models);
        }
      });
    }
  }, [provider, ollamaEndpoint]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAISettings({
      provider,
      apiKey: apiKey.trim(),
      ollamaEndpoint: ollamaEndpoint.trim() || DEFAULT_OLLAMA_ENDPOINT,
      ollamaModel: ollamaModel.trim() || DEFAULT_OLLAMA_MODEL
    });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetTokens = () => {
    if (confirm('Are you sure you want to reset your AI token usage counter?')) {
      const reset = StorageService.resetTokenUsage();
      setTokenStats(reset);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(5, 8, 16, 0.85)' }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={22} style={{ color: '#60a5fa' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>AI Engine & Provider Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose your free offline LLM (Ollama), cloud APIs, or built-in dictionary engine</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Provider Options Grid (5 Columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              
              {/* Translate-Me In-House Neural AI Option — OUR PROPRIETARY ENGINE */}
              <div
                onClick={() => setProvider('custom-neural')}
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'custom-neural' ? '2px solid #00f2fe' : '1px solid var(--border-color)',
                  background: provider === 'custom-neural' ? 'rgba(0, 242, 254, 0.16)' : 'var(--bg-elevated)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Brain size={15} style={{ color: 'var(--primary-cyan)' }} />
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>Our AI Core</strong>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>
                    In-House Neural Transformer.
                  </p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--primary-cyan)', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                    🧠 Seq2Seq AI
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>
                    {neuralProgress.status === 'ready' ? '⚡ Ready to translate' : '📦 35MB Cached'}
                  </p>
                  <span className="badge" style={{ marginTop: '0.35rem', fontSize: '0.62rem', background: 'linear-gradient(135deg, #00f2fe, #4facfe)', color: '#090d16', width: '100%', textAlign: 'center', display: 'block', fontWeight: 700 }}>
                    ★ In-House AI
                  </span>
                </div>
              </div>

              {/* Built-in Offline Dictionary Engine */}
              <div
                onClick={() => setProvider('built-in')}
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'built-in' ? '2px solid #0284c7' : '1px solid var(--border-color)',
                  background: provider === 'built-in' ? 'rgba(2, 132, 199, 0.14)' : 'var(--bg-elevated)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Cpu size={15} style={{ color: '#0284c7' }} />
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>Built-In</strong>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>
                    CC-CEDICT lexicon & grammar.
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#0284c7', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                    ∞ 0MB Instant
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>
                    0 setup needed
                  </p>
                  <span className="badge badge-xianxia" style={{ marginTop: '0.35rem', fontSize: '0.62rem', width: '100%', textAlign: 'center', display: 'block' }}>
                    Dictionary
                  </span>
                </div>
              </div>

              {/* Groq (Llama 3) Option — FREE */}
              <div
                onClick={() => setProvider('groq')}
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'groq' ? '2px solid #059669' : '1px solid var(--border-color)',
                  background: provider === 'groq' ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-elevated)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Zap size={15} style={{ color: '#059669' }} />
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>Groq</strong>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>
                    Llama 3.3 70B ultra fast.
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#059669', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                    🆓 30 req/min
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>
                    📊 {groqDaily}/14.4k
                  </p>
                  <span className="badge" style={{ marginTop: '0.35rem', fontSize: '0.62rem', background: '#059669', color: '#fff', width: '100%', textAlign: 'center', display: 'block' }}>
                    Free Cloud
                  </span>
                </div>
              </div>

              {/* DeepSeek-V3 Option */}
              <div
                onClick={() => setProvider('deepseek')}
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'deepseek' ? '2px solid #2563eb' : '1px solid var(--border-color)',
                  background: provider === 'deepseek' ? 'rgba(59, 130, 246, 0.14)' : 'var(--bg-elevated)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Zap size={15} style={{ color: '#2563eb' }} />
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>DeepSeek</strong>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>
                    #1 Xianxia & Xuanhuan prose.
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#2563eb', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                    💰 $0.14/1M
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>
                    📊 {deepseekDaily} today
                  </p>
                  <span className="badge" style={{ marginTop: '0.35rem', fontSize: '0.62rem', background: '#2563eb', color: '#fff', width: '100%', textAlign: 'center', display: 'block' }}>
                    Paid / Pro
                  </span>
                </div>
              </div>

              {/* Ollama Local Option */}
              <div
                onClick={() => setProvider('ollama')}
                className="glass-panel"
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: provider === 'ollama' ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                  background: provider === 'ollama' ? 'rgba(56, 189, 248, 0.14)' : 'var(--bg-elevated)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Server size={15} style={{ color: '#38bdf8' }} />
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>Ollama</strong>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>
                    Qwen 2.5 on local PC.
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#38bdf8', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                    ∞ Local PC
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>
                    📊 {ollamaDaily} today
                  </p>
                  <span className="badge" style={{ marginTop: '0.35rem', fontSize: '0.62rem', background: '#0284c7', color: '#fff', width: '100%', textAlign: 'center', display: 'block' }}>
                    Local LLM
                  </span>
                </div>
              </div>
            </div>

            {/* Translate-Me In-House Neural AI Configuration Panel */}
            {provider === 'custom-neural' && (
              <div className="glass-panel" style={{ padding: '1rem', background: 'var(--bg-elevated)', border: '1px solid rgba(0, 242, 254, 0.35)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Brain size={20} style={{ color: 'var(--primary-cyan)' }} />
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>Translate-Me Neural Core (In-House AI)</strong>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Seq2Seq Neural Machine Translation running 100% inside your browser via WebAssembly & WebGPU.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePreloadNeuralCore}
                    disabled={isPreloadingNeural || neuralProgress.status === 'ready'}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem' }}
                  >
                    <DownloadCloud size={14} className={isPreloadingNeural ? 'spin' : ''} />
                    <span>{neuralProgress.status === 'ready' ? '✓ AI Core Loaded' : isPreloadingNeural ? 'Loading...' : 'Preload Neural Model (~35MB)'}</span>
                  </button>
                </div>

                {/* Progress bar if downloading/loading */}
                {(isPreloadingNeural || neuralProgress.status === 'downloading' || neuralProgress.status === 'loading') && (
                  <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <span>{neuralProgress.message || 'Downloading Neural Network Weights...'}</span>
                      <span>{neuralProgress.progress ? `${neuralProgress.progress}%` : ''}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${neuralProgress.progress || 20}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary-cyan), var(--primary-blue))',
                          transition: 'width 0.2s ease'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>🤖 Model Architecture</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.1rem' }}>Opus-MT Seq2Seq Transformer</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⚡ Hardware Acceleration</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-cyan)', marginTop: '0.1rem' }}>WebGPU / WebAssembly (WASM)</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>🔒 Privacy & Cost</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669', marginTop: '0.1rem' }}>100% Private · $0 Cost · No Keys</div>
                  </div>
                </div>
              </div>
            )}

            {/* Ollama Local LLM Configuration */}
            {provider === 'ollama' && (
              <div className="glass-panel" style={{ padding: '1rem', background: 'var(--bg-elevated)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Server size={18} style={{ color: '#0284c7' }} />
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>Ollama Local Connection</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={testOllamaConnection}
                    disabled={isTestingOllama}
                    style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                  >
                    <RefreshCw size={12} className={isTestingOllama ? 'spin' : ''} />
                    <span>{isTestingOllama ? 'Connecting...' : 'Test Connection & List Models'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Ollama Endpoint URL
                    </label>
                    <input
                      type="text"
                      placeholder="http://localhost:11434"
                      value={ollamaEndpoint}
                      onChange={(e) => setOllamaEndpoint(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.65rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Model Name (e.g. qwen2.5:7b, llama3.1)
                    </label>
                    {ollamaModelsList.length > 0 ? (
                      <select
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem'
                        }}
                      >
                        {ollamaModelsList.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="qwen2.5:7b"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                    )}
                  </div>
                </div>

                {ollamaStatus && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                      background: ollamaStatus.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: ollamaStatus.ok ? '#059669' : '#dc2626',
                      border: `1px solid ${ollamaStatus.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}
                  >
                    {ollamaStatus.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{ollamaStatus.message}</span>
                  </div>
                )}

                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <strong>💡 How to run Ollama locally:</strong>
                  <br />
                  1. Download from <a href="https://ollama.com" target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>ollama.com</a> and launch Ollama.
                  <br />
                  2. In terminal, run: <code style={{ background: 'var(--bg-elevated)', padding: '0.1rem 0.3rem', borderRadius: '3px', color: 'var(--text-main)' }}>ollama run qwen2.5:7b</code>
                  <br />
                  3. If running from browser, launch Ollama with CORS allowed: <code style={{ background: 'var(--bg-elevated)', padding: '0.1rem 0.3rem', borderRadius: '3px', color: 'var(--text-main)' }}>set OLLAMA_ORIGINS=* & ollama serve</code>
                </div>
              </div>
            )}

            {/* Cloud Provider API Key Input */}
            {provider !== 'built-in' && provider !== 'ollama' && (
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
                    background: 'var(--bg-card)',
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

            {/* Built-in Engine Details Card */}
            {provider === 'built-in' && (
              <div className="glass-panel" style={{ padding: '0.85rem', background: 'var(--bg-elevated)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
                  ⚡ Enhanced In-Browser Dictionary & Grammar Engine
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  The built-in offline engine translates paragraphs directly inside your browser using the CC-CEDICT Chinese-English dictionary, Xianxia lexicon, and grammar particle resolution. Zero network requests, 100% private, and infinite speed.
                </p>
              </div>
            )}

            {/* Token Usage Analytics Card */}
            <div className="glass-panel" style={{ padding: '0.85rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={16} style={{ color: '#0284c7' }} />
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>AI Translation Token Usage</strong>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📥 Input Tokens</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                    {tokenStats.promptTokens.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📤 Output Tokens</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                    {tokenStats.completionTokens.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⚡ Total Tokens</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', marginTop: '0.1rem' }}>
                    {tokenStats.totalTokens.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>💰 Estimated Cost</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669', marginTop: '0.1rem' }}>
                    ${tokenStats.totalCostUsd.toFixed(5)}
                  </div>
                </div>
              </div>
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
