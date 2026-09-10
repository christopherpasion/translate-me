import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, Download, Database, Sun, Moon, Menu, X, Layers, Bookmark as BookmarkIcon, Upload, User } from 'lucide-react';
import type { Novel, UserProfile } from '../types';
import { SupabaseService } from '../services/supabaseService';

interface NavbarProps {
  novels: Novel[];
  selectedNovelId: string;
  onSelectNovel: (id: string) => void;
  onOpenLibrary: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  onOpenGlobalGlossary: () => void;
  onOpenGovernance: () => void;
  onOpenExport: () => void;
  onOpenUploader: () => void;
  onOpenAuth: (defaultTab?: 'reader' | 'creator') => void;
  currentUser: UserProfile | null;
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
  onOpenBookmarks,
  bookmarksCount,
  onOpenGlobalGlossary,
  onOpenGovernance,
  onOpenExport,
  onOpenUploader,
  onOpenAuth,
  currentUser,
  pendingGovernanceCount,
  viewMode,
  onToggleViewMode,
  appTheme,
  onToggleAppTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{ isOnline: boolean; checking: boolean }>({
    isOnline: SupabaseService.isOnline,
    checking: false
  });

  useEffect(() => {
    const handleStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOnline: boolean }>;
      setCloudStatus({ isOnline: customEvent.detail.isOnline, checking: false });
    };
    window.addEventListener('supabase-status-change', handleStatus);
    return () => window.removeEventListener('supabase-status-change', handleStatus);
  }, []);

  const handleCheckConnection = async () => {
    setCloudStatus(prev => ({ ...prev, checking: true }));
    const result = await SupabaseService.testConnection();
    setCloudStatus({ isOnline: result.ok, checking: false });
    alert(result.message);
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div className="navbar-brand" onClick={onOpenLibrary} style={{ flexShrink: 0, cursor: 'pointer' }}>
          <BookOpen size={24} style={{ color: 'var(--accent-cyan, #00f2fe)', flexShrink: 0 }} />
          <span className="brand-title">TranslateMe</span>
          {viewMode === 'admin' && <span className="brand-badge">STUDIO</span>}
        </div>

        {/* Desktop Quick Novel Selector */}
        <div className="desktop-novel-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <select
            value={selectedNovelId}
            onChange={(e) => onSelectNovel(e.target.value)}
            title="Change active novel"
            style={{
              background: 'var(--bg-elevated, #f1f5f9)',
              color: 'var(--text-main, #1e293b)',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '220px',
              textOverflow: 'ellipsis'
            }}
          >
            {novels.length === 0 ? (
              <option value="">(No Novels Created)</option>
            ) : (
              novels.map(novel => (
                <option key={novel.id} value={novel.id}>
                  📖 {novel.titleEn || novel.titleZh}
                </option>
              ))
            )}
          </select>

          <button
            className="btn btn-secondary"
            onClick={onOpenLibrary}
            title="Browse all novel projects & library"
            style={{ padding: '0.35rem 0.55rem', fontSize: '0.78rem', whiteSpace: 'nowrap', gap: '0.3rem' }}
          >
            <Layers size={13} style={{ color: 'var(--accent-cyan, #00f2fe)' }} />
            <span>Library</span>
          </button>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Cloud Status Indicator */}
        <button
          className="btn btn-secondary"
          onClick={handleCheckConnection}
          title={cloudStatus.isOnline ? "Supabase Cloud Database: Online & Synced" : "Supabase Cloud Database: Offline / Paused. Click to test connection."}
          style={{
            padding: '0.3rem 0.6rem',
            fontSize: '0.75rem',
            gap: '0.35rem',
            borderColor: cloudStatus.isOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
            background: cloudStatus.isOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            color: cloudStatus.isOnline ? '#10b981' : '#f59e0b'
          }}
        >
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: cloudStatus.isOnline ? '#10b981' : '#f59e0b',
            boxShadow: cloudStatus.isOnline ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
          }} />
          <span>{cloudStatus.checking ? 'Checking...' : cloudStatus.isOnline ? 'Cloud Synced' : 'Cloud Offline'}</span>
        </button>

        {/* Bookmarks Button (Always accessible) */}
        <button
          className="btn btn-secondary"
          onClick={onOpenBookmarks}
          title="View my saved bookmarks"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', gap: '0.35rem', position: 'relative' }}
        >
          <BookmarkIcon size={14} style={{ color: '#f5576c' }} />
          <span>Bookmarks</span>
          {bookmarksCount > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #f5576c, #f093fb)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '8px',
              marginLeft: '2px'
            }}>
              {bookmarksCount}
            </span>
          )}
        </button>

        {/* Uploader / Upload Chapter Shortcut for Creator */}
        {viewMode === 'admin' && (
          <button
            className="btn btn-primary desktop-uploader-btn"
            onClick={onOpenUploader}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <Upload size={14} />
            <span>Upload Chapter</span>
          </button>
        )}

        {/* Creator / Studio Tools (Shown in Admin Mode) */}
        {viewMode === 'admin' && (
          <div className="desktop-admin-tools" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button className="btn btn-secondary" onClick={onOpenGlobalGlossary} title="Master Terms & Character Names">
              <Database size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span>Terms</span>
            </button>

            <button className="btn btn-secondary" onClick={onOpenGovernance} style={{ position: 'relative' }}>
              <ShieldCheck size={15} style={{ color: 'var(--accent-amber)' }} />
              <span>Fixes</span>
              {pendingGovernanceCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent-pink)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {pendingGovernanceCount}
                </span>
              )}
            </button>

            <button className="btn btn-secondary" onClick={onOpenExport} title="Export Novel to EPUB or Markdown">
              <Download size={15} />
              <span>Export</span>
            </button>
          </div>
        )}

        {/* Creator Portal / Studio Mode Switcher */}
        <button
          className={`btn ${viewMode === 'admin' ? 'btn-primary' : 'btn-secondary'} desktop-role-btn`}
          onClick={onToggleViewMode}
          title={viewMode === 'admin' ? 'Switch to Public Reader Mode' : 'Open Creator Studio'}
          style={{
            border: viewMode === 'admin' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            color: viewMode === 'admin' ? '#fff' : 'var(--text-main)',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            fontSize: '0.8rem',
            padding: '0.35rem 0.65rem'
          }}
        >
          {viewMode === 'admin' ? '⚡ Creator Studio' : '📖 Reader View'}
        </button>

        {/* User Account / Sign In */}
        <button
          className="btn btn-secondary"
          onClick={() => onOpenAuth()}
          title={currentUser ? `Profile: ${currentUser.displayName}` : 'Sign In / Register'}
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', gap: '0.35rem' }}
        >
          {currentUser ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="desktop-theme-text" style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.displayName}
              </span>
            </>
          ) : (
            <>
              <User size={14} />
              <span className="desktop-theme-text">Sign In</span>
            </>
          )}
        </button>

        {/* Theme Switcher */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={onToggleAppTheme}
          title={appTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ padding: '0.4rem' }}
          aria-label="Toggle App Theme"
        >
          {appTheme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} style={{ color: '#0284c7' }} />}
        </button>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Toggle Menu"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Slide-over Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>TranslateMe</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                aria-label="Close Mobile Menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mobile-drawer-content">
              {/* Novel Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  ACTIVE NOVEL
                </label>
                <select
                  value={selectedNovelId}
                  onChange={(e) => {
                    if (e.target.value) {
                      onSelectNovel(e.target.value);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.68rem 0.8rem',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}
                >
                  {novels.map(novel => (
                    <option key={novel.id} value={novel.id}>
                      📖 {novel.titleEn || novel.titleZh}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', padding: '0.55rem', fontSize: '0.82rem', gap: '0.35rem' }}
                    onClick={() => {
                      onOpenLibrary();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Layers size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Library</span>
                  </button>

                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', padding: '0.55rem', fontSize: '0.82rem', gap: '0.35rem' }}
                    onClick={() => {
                      onOpenBookmarks();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <BookmarkIcon size={14} style={{ color: '#f5576c' }} />
                    <span>Bookmarks ({bookmarksCount})</span>
                  </button>
                </div>
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
                  {viewMode === 'admin' ? '⚡ Creator Studio Active' : '📖 Reader View Active'}
                </button>
              </div>

              {/* Account button in mobile */}
              <div style={{ marginBottom: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User size={15} />
                  <span>{currentUser ? `Profile: ${currentUser.displayName}` : 'Sign In / Register'}</span>
                </button>
              </div>

              {/* Creator Tools in mobile */}
              {viewMode === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }} onClick={() => { onOpenUploader(); setIsMobileMenuOpen(false); }}>
                    <Upload size={16} />
                    <span>Upload Chapter</span>
                  </button>

                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }} onClick={() => { onOpenGlobalGlossary(); setIsMobileMenuOpen(false); }}>
                    <Database size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Terminology Glossary</span>
                  </button>

                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }} onClick={() => { onOpenGovernance(); setIsMobileMenuOpen(false); }}>
                    <ShieldCheck size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span>Reader Fixes ({pendingGovernanceCount})</span>
                  </button>

                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }} onClick={() => { onOpenExport(); setIsMobileMenuOpen(false); }}>
                    <Download size={16} />
                    <span>Export EPUB / Markdown</span>
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
