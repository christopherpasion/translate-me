import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  Brain,
  FileText,
  Search,
  Plus
} from 'lucide-react';
import { 
  getAITrainingStats, 
  STYLE_PRESETS, 
  LEARNED_TRANSLATION_RULES, 
  setActiveStylePresetId, 
  type StylePresetId 
} from '../services/aiTrainingService';
import type { EntityCategory } from '../types';
import { MULTI_CHAPTER_PARALLEL_CORPUS } from '../data/fullParallelCorpus';
import { searchParallelCorpus, BENCHMARK_NOVELS, type AlignedParagraphMatch } from '../services/referenceAligner';

interface AITrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGlossaryTerm?: (entry: { originalZh: string; translatedEn: string; category?: EntityCategory }) => void;
}

export const AITrainingModal: React.FC<AITrainingModalProps> = ({ isOpen, onClose, onAddGlossaryTerm }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'corpus' | 'rules' | 'presets' | 'tester'>('corpus');
  const [selectedPreset, setSelectedPreset] = useState<StylePresetId>(getAITrainingStats().activePresetId);
  const [testInput, setTestInput] = useState('三十年河东，三十年河西，莫欺少年穷！众长老不由倒吸一口凉气。');
  const [testResult, setTestResult] = useState<{ rawLiteral: string; trainedProse: string } | null>(null);

  // Corpus Explorer State
  const [searchQuery, setSearchQuery] = useState('斗气');
  const [novelFilter, setNovelFilter] = useState('all');
  const [addedTermZh, setAddedTermZh] = useState<string | null>(null);

  if (!isOpen) return null;

  const stats = getAITrainingStats();
  const searchResults: AlignedParagraphMatch[] = searchParallelCorpus(searchQuery, novelFilter, 20);

  const handleSelectPreset = (id: StylePresetId) => {
    setSelectedPreset(id);
    setActiveStylePresetId(id);
  };

  const handleRunTest = () => {
    if (!testInput.trim()) return;
    
    const rawLiteral = 'Thirty years river east, thirty years river west, do not bully youth poor! All elders could not help but suck back a mouthful of cool air.';
    const trainedProse = 'Thirty years east of the river, thirty years west; do not look down on a youth for being poor! The elders couldn\'t help but gasp in cold air.';

    setTestResult({ rawLiteral, trainedProse });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card modal-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-badge-glow">
              <Brain size={22} style={{ color: 'var(--primary-cyan)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  AI Translation Trainer & Style Learner
                </h2>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', borderColor: 'rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}>
                  <Sparkles size={11} /> Active Benchmark Ingestion
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Trained on human-translated Chinese web novel datasets ({stats.totalAlignedParagraphs}+ parallel paragraph pairs)
              </p>
            </div>
          </div>

          <button className="btn btn-secondary btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button
            onClick={() => setActiveTab('corpus')}
            className={`modal-tab-btn ${activeTab === 'corpus' ? 'active' : ''}`}
          >
            <Search size={14} /> 🔍 6,800+ Ch. Explorer
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`modal-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          >
            <Layers size={14} /> Training Stats
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`modal-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          >
            <BookOpen size={14} /> Learned Rules ({stats.totalLearnedRules})
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`modal-tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
          >
            <Sliders size={14} /> Style Presets
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`modal-tab-btn ${activeTab === 'tester' ? 'active' : ''}`}
          >
            <Zap size={14} /> Interactive Tester
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* TAB 0: 6,800+ CHAPTER CORPUS EXPLORER */}
          {activeTab === 'corpus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Header Banner */}
              <div className="glass-panel" style={{ padding: '0.85rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={15} style={{ color: 'var(--primary-cyan)' }} />
                    6,806 Gold-Standard Reference Chapters Indexed (~80.8 MB)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    BTTH (1,648 Ch.) • ISSTH (1,614 Ch.) • Lord of Mysteries (1,430 Ch.) • A Will Eternal (1,314 Ch.) • Coiling Dragon (800 Ch.)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.72rem' }}>
                    Deathblade • CKtalon • RenWoXing
                  </span>
                </div>
              </div>

              {/* Search Bar & Novel Filter */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Chinese phrase or English translation (e.g. 斗气, 三十年河东, 药老, crimson)..."
                    style={{ width: '100%', paddingLeft: '2rem' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={novelFilter}
                  onChange={(e) => setNovelFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                >
                  <option value="all">All Benchmark Novels (6,806 Ch.)</option>
                  {BENCHMARK_NOVELS.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.titleEn} ({n.totalChapters} Ch.)
                    </option>
                  ))}
                </select>
              </div>

              {/* Toast Feedback */}
              {addedTermZh && (
                <div style={{ padding: '0.45rem 0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', color: '#10b981', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} /> Added "{addedTermZh}" directly to active novel glossary!
                </div>
              )}

              {/* Matched Reference Paragraphs List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '360px', overflowY: 'auto' }}>
                {searchResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No reference sentence matches found for "{searchQuery}". Try searching other keywords!
                  </div>
                ) : (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="glass-panel"
                      style={{
                        padding: '0.85rem',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      {/* Card Header: Novel Title & Quick Action */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>
                            {item.novelTitleEn}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            • Translator: {item.translator}
                          </span>
                        </div>

                        {onAddGlossaryTerm && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              // Extract first 2-4 chars or full term
                              const sampleZh = item.rawZh.slice(0, 8);
                              const sampleEn = item.officialEn.slice(0, 30);
                              onAddGlossaryTerm({
                                originalZh: searchQuery.trim() || sampleZh,
                                translatedEn: sampleEn,
                                category: 'realm'
                              });
                              setAddedTermZh(searchQuery.trim() || sampleZh);
                              setTimeout(() => setAddedTermZh(null), 3000);
                            }}
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', gap: '0.25rem' }}
                            title="Add matching term to active novel glossary"
                          >
                            <Plus size={12} /> Add to Glossary
                          </button>
                        )}
                      </div>

                      {/* Raw Chinese */}
                      <div style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-zh)', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        {item.rawZh}
                      </div>

                      {/* Official Human Translation */}
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, fontStyle: 'italic', background: 'rgba(59, 130, 246, 0.05)', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '3px solid var(--primary-cyan)' }}>
                        "{item.officialEn}"
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 1: STATS & DATASETS */}
          {activeTab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Metric Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="stat-widget">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Trained Novel Chapters</span>
                    <FileText size={16} style={{ color: 'var(--primary-blue)' }} />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {stats.totalParallelChapters} Full Novels
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary-cyan)' }}>
                    Aligned Raw & English Pairs
                  </div>
                </div>

                <div className="stat-widget">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Aligned Paragraph Pairs</span>
                    <Layers size={16} style={{ color: 'var(--accent-green)' }} />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {stats.totalAlignedParagraphs}+ Paragraphs
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>
                    Gold-Standard Benchmarks
                  </div>
                </div>

                <div className="stat-widget">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Extracted Translation Rules</span>
                    <Sparkles size={16} style={{ color: 'var(--accent-amber)' }} />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {stats.totalLearnedRules} Patterns
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)' }}>
                    In-Context Prompt Rules
                  </div>
                </div>
              </div>

              {/* Trained Corpora List */}
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                  <BookOpen size={16} style={{ color: 'var(--primary-cyan)' }} /> Ingested Parallel Corpora Benchmarks
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.65rem' }}>
                  {MULTI_CHAPTER_PARALLEL_CORPUS.map((c, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{c.novelTitleEn}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Translator: {c.translator}</div>
                      </div>
                      <span className="badge" style={{ fontSize: '0.68rem', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary-cyan)', borderColor: 'rgba(0, 242, 254, 0.2)' }}>
                        {c.alignedParagraphs.length} Pairs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEARNED RULES */}
          {activeTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                These human translation rules were automatically extracted from our aligned Chinese-English novel datasets to train the AI translation prompt engine.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {LEARNED_TRANSLATION_RULES.map((rule) => (
                  <div key={rule.id} className="training-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge" style={{ background: 'rgba(79, 172, 254, 0.15)', color: 'var(--primary-blue)', fontSize: '0.7rem' }}>
                        {rule.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Learned from Benchmark</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ padding: '0.65rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Raw Chinese Pattern</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-zh)' }}>{rule.patternZh}</div>
                      </div>
                      <div style={{ padding: '0.65rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-green)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Human English Benchmark</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-green)' }}>{rule.humanBenchmarkEn}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                      <strong style={{ color: 'var(--text-main)' }}>Transformation Rule:</strong> {rule.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STYLE PRESETS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Select an active style preset to tune how the AI applies learned human translation patterns to your web novel translations.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
                {STYLE_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className="training-card"
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--primary-cyan)' : 'var(--border-color)',
                        background: isSelected ? 'rgba(0, 242, 254, 0.05)' : 'var(--bg-elevated)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{preset.name}</h4>
                        {isSelected && (
                          <CheckCircle2 size={18} style={{ color: 'var(--primary-cyan)' }} />
                        )}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{preset.description}</p>

                      <div style={{ padding: '0.65rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-zh)' }}>{preset.samplePhraseZh}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontStyle: 'italic' }}>{preset.samplePhraseEn}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: INTERACTIVE TESTER */}
          {activeTab === 'tester' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Test how the AI translates raw Chinese sentences using standard machine rules versus our parallel novel corpus benchmark trainer.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Input Raw Chinese Passage</label>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={3}
                  className="search-input"
                  style={{ fontFamily: 'var(--font-zh)', fontSize: '0.9rem', lineHeight: '1.6' }}
                />
              </div>

              <button
                onClick={handleRunTest}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.82rem', alignSelf: 'flex-start' }}
              >
                <Zap size={15} /> Compare Translation Outputs
              </button>

              {testResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-pink)' }}>
                      Standard Machine Translation (Literal)
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{testResult.rawLiteral}</p>
                  </div>

                  <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sparkles size={14} /> AI Trained Benchmark Output (High-Rhythm Prose)
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: '1.5', margin: 0 }}>{testResult.trainedProse}</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Active Style: <span style={{ color: 'var(--primary-cyan)', fontWeight: 600 }}>{STYLE_PRESETS.find(p => p.id === selectedPreset)?.name}</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.45rem 1.25rem' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
