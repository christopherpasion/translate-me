import React from 'react';
import { BookOpen, ShieldCheck, Download, Database, Plus, Cpu, Sun, Moon } from 'lucide-react';
import type { Novel } from '../types';

interface NavbarProps {
  novels: Novel[];
  selectedNovelId: string;
  onSelectNovel: (id: string) => void;
  onOpenLibrary: () => void;
  onOpenGlobalGlossary: () => void;
  onOpenGovernance: () => void;
  onOpenExport: () => void;
  onOpenNewNovelModal: () => void;
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
  onOpenNewNovelModal,
  onOpenAISettings,
  pendingGovernanceCount,
  viewMode,
  onToggleViewMode,
  appTheme,
  onToggleAppTheme
}) => {

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={onOpenLibrary} style={{ flexShrink: 0, cursor: 'pointer' }}>
        <BookOpen size={24} style={{ color: 'var(--primary-cyan)', flexShrink: 0 }} />
        <span className="brand-title">TranslateMe.AI</span>
        {viewMode === 'admin' && <span className="brand-badge">SELF-HEALING 2.0</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
        {/* Novel Selector Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, width: '100%' }}>
          <select
            className="navbar-novel-select"
            value={selectedNovelId}
            onChange={(e) => onSelectNovel(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%'
            }}
          >
            {novels.map(novel => (
              <option key={novel.id} value={novel.id} style={{ background: '#111827', color: '#fff' }}>
                {novel.titleZh} ({novel.titleEn})
              </option>
            ))}
          </select>

          {viewMode === 'admin' && (
            <button className="btn btn-secondary btn-icon" title="New Novel Project" onClick={onOpenNewNovelModal} style={{ flexShrink: 0 }}>
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="navbar-actions" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
        {/* White / Dark Theme Switcher */}
        <button
          className="btn btn-secondary"
          onClick={onToggleAppTheme}
          title={appTheme === 'dark' ? 'Switch to Clean White Background Theme' : 'Switch to Dark Mode'}
          style={{ fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {appTheme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b', flexShrink: 0 }} /> : <Moon size={16} style={{ color: '#0284c7', flexShrink: 0 }} />}
          <span>{appTheme === 'dark' ? 'White' : 'Dark'}</span>
        </button>

        {/* Role Switcher (Admin Studio vs Public Reader View) */}
        <button
          className={`btn ${viewMode === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={onToggleViewMode}
          title={viewMode === 'admin' ? 'Switch to Reader Mode' : 'Switch to Admin Translation Studio'}
          style={{
            border: viewMode === 'admin' ? '1px solid var(--primary-cyan)' : '1px solid var(--accent-amber)',
            color: viewMode === 'admin' ? '#fff' : 'var(--accent-amber)',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          {viewMode === 'admin' ? '👑 Admin' : '👑 Admin'}
        </button>

        {/* Translation Studio Tools (Shown ONLY in Admin Mode) */}
        {viewMode === 'admin' && (
          <>
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
          </>
        )}
      </div>
    </header>
  );
};
