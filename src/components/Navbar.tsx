import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Download, Database, Cpu, Sun, Moon, Menu, X, Layers } from 'lucide-react';
import type { Novel } from '../types';

interface NavbarProps {
  novels: Novel[];
  selectedNovelId: string;
  onSelectNovel: (id: string) => void;
  onOpenLibrary: () => void;
  onOpenGlobalGlossary: () => void;
  onOpenGovernance: () => void;
  onOpenExport: () => void;
  onOpenNewNovelModal?: () => void;
  onOpenAISettings: () => void;
  pendingGovernanceCount: number;
  viewMode: 'admin' | 'reader';
  onToggleViewMode: () => void;
  appTheme: 'dark' | 'light';
  onToggleAppTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  novels,
  selectedNovelId,
  onSelectNovel,
  onOpenLibrary,
  onOpenGlobalGlossary,
  onOpenGovernance,
  onOpenExport,
  onOpenAISettings,
  pendingGovernanceCount,
  viewMode,
  onToggleViewMode,
  appTheme,
  onToggleAppTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div className="navbar-brand" onClick={onOpenLibrary} style={{ flexShrink: 0, cursor: 'pointer' }}>
          <BookOpen size={24} style={{ color: 'var(--primary-cyan)', flexShrink: 0 }} />
          <span className="brand-title">TranslateMe.AI</span>
          {viewMode === 'admin' && <span className="brand-badge">SELF-HEALING 2.0</span>}
        </div>

        {/* Desktop Quick Novel Selector & Library Shortcut */}
        <div className="desktop-novel-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <select
            value={selectedNovelId}
            onChange={(e) => onSelectNovel(e.target.value)}
            title="Change active novel"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '220px',
              textOverflow: 'ellipsis'
            }}
          >
            {novels.map(novel => (
              <option key={novel.id} value={novel.id} style={{ background: '#111827', color: '#fff' }}>
                📚 {novel.titleEn || novel.titleZh}
              </option>
            ))}
          </select>

          <button
            className="btn btn-secondary"
            onClick={onOpenLibrary}
            title="Browse all novel projects & library"
            style={{ padding: '0.35rem 0.55rem', fontSize: '0.78rem', whiteSpace: 'nowrap', gap: '0.3rem' }}
          >
            <Layers size={13} style={{ color: 'var(--primary-cyan)' }} />
            <span>Library</span>
          </button>
        </div>
      </div>

      <div className="navbar-actions">
        {/* White / Dark Theme Switcher */}
        <button
          className="btn btn-secondary"
          onClick={onToggleAppTheme}
          title={appTheme === 'dark' ? 'Switch to Clean White Background Theme' : 'Switch to Dark Mode'}
          style={{ fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {appTheme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b', flexShrink: 0 }} /> : <Moon size={16} style={{ color: '#0284c7', flexShrink: 0 }} />}
          <span className="desktop-theme-text">{appTheme === 'dark' ? 'White' : 'Dark'}</span>
        </button>

        {/* Role Switcher (Translator Mode vs Public Reader View) */}
        <button
          className={`btn ${viewMode === 'admin' ? 'btn-primary' : 'btn-secondary'} desktop-role-btn`}
          onClick={onToggleViewMode}
          title={viewMode === 'admin' ? 'Switch to Reader Mode' : 'Switch to Translator Mode'}
          style={{
            border: viewMode === 'admin' ? '1px solid var(--primary-cyan)' : '1px solid var(--accent-amber)',
            color: viewMode === 'admin' ? '#fff' : 'var(--accent-amber)',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          {viewMode === 'admin' ? '👑 Translator' : '📖 Reader'}
        </button>

        {/* Mobile Hamburger Toggle Button (< 768px) */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Translation Tools (Shown ONLY in Translator Mode Desktop) */}
        {viewMode === 'admin' && (
          <div className="desktop-admin-tools" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onOpenAISettings} title="AI Model & API Provider Settings">
              <Cpu size={16} style={{ color: 'var(--primary-cyan)' }} />
              <span>AI Engine</span>
            </button>

            <button className="btn btn-secondary" onClick={onOpenGlobalGlossary} title="Shared Master Dictionary across all novels">
              <Database size={16} style={{ color: 'var(--primary-cyan)' }} />
              <span>Global Glossary</span>
            </button>

            <button className="btn btn-secondary" onClick={onOpenGovernance} style={{ position: 'relative' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-amber)' }} />
              <span>Governance</span>
              {pendingGovernanceCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent-pink)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {pendingGovernanceCount}
                </span>
              )}
            </button>

            <button className="btn btn-primary" onClick={onOpenExport}>
              <Download size={16} />
              <span>Export Novel</span>
            </button>
          </div>
        )}
      </div>

      {/* Slide-over Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--primary-cyan)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>TranslateMe.AI</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={22} />
              </button>
            </div>

            <div className="mobile-drawer-content">
              {/* Novel Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  ACTIVE NOVEL PROJECT
                </label>
                <select
                  value={selectedNovelId}
                  onChange={(e) => {
                    onSelectNovel(e.target.value);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.68rem 0.8rem',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {novels.map(novel => (
                    <option key={novel.id} value={novel.id}>
                      {novel.titleZh} ({novel.titleEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher */}
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  className={`btn ${viewMode === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.68rem', fontWeight: 700 }}
                  onClick={() => {
                    onToggleViewMode();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {viewMode === 'admin' ? '👑 Translator Mode Active' : '📖 Reader View Active'}
                </button>
              </div>

              {/* Admin Tools */}
              {viewMode === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }} onClick={() => { onOpenAISettings(); setIsMobileMenuOpen(false); }}>
                    <Cpu size={16} style={{ color: 'var(--primary-cyan)' }} />
                    <span>AI Engine</span>
                  </button>

                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }} onClick={() => { onOpenGlobalGlossary(); setIsMobileMenuOpen(false); }}>
                    <Database size={16} style={{ color: 'var(--primary-cyan)' }} />
                    <span>Global Glossary</span>
                  </button>

                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }} onClick={() => { onOpenGovernance(); setIsMobileMenuOpen(false); }}>
                    <ShieldCheck size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span>Governance ({pendingGovernanceCount})</span>
                  </button>

                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.68rem' }} onClick={() => { onOpenExport(); setIsMobileMenuOpen(false); }}>
                    <Download size={16} />
                    <span>Export Novel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
