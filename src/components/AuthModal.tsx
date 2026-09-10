import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { User, Lock, KeyRound, Shield, LogOut, Check, X, BookOpen, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  onSignOut: () => void;
  defaultTab?: 'reader' | 'creator';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onAuthSuccess,
  onSignOut,
  defaultTab = 'reader'
}) => {
  const [tab, setTab] = useState<'reader' | 'creator'>(defaultTab);
  const [isSignUp, setIsSignUp] = useState(false);

  // Reader Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [readerError, setReaderError] = useState('');
  const [readerSuccess, setReaderSuccess] = useState('');

  // Admin / Creator Form State
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const handleReaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReaderError('');
    setReaderSuccess('');

    if (!email.trim()) {
      setReaderError('Please enter your email.');
      return;
    }

    if (isSignUp) {
      const res = await AuthService.signUp(email, password, displayName);
      if (res.success && res.user) {
        setReaderSuccess('Account created! Welcome to TranslateMe.');
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setReaderError(res.error || 'Failed to sign up.');
      }
    } else {
      const res = await AuthService.signIn(email, password);
      if (res.success && res.user) {
        setReaderSuccess('Logged in successfully!');
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setReaderError(res.error || 'Failed to sign in.');
      }
    }
  };

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAdminError('Please enter both Admin Username and Password.');
      return;
    }

    const isAuthorized = AuthService.verifyAdminCredentials(adminUsername, adminPassword);
    if (isAuthorized) {
      setAdminSuccess('Admin credentials verified! Unlocking upload & studio tools...');
      const user = AuthService.getCurrentUser();
      setTimeout(() => {
        if (user) onAuthSuccess(user);
        onClose();
      }, 700);
    } else {
      setAdminError('Access Denied. Only the authorized administrator can upload chapters or access studio tools.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
            }}>
              {currentUser ? <User size={20} color="#ffffff" /> : tab === 'creator' ? <Shield size={20} color="#ffffff" /> : <BookOpen size={20} color="#ffffff" />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {currentUser ? 'User Profile' : tab === 'creator' ? 'Creator / Uploader Portal' : 'Reader Account'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentUser ? `Signed in as ${currentUser.role.toUpperCase()}` : tab === 'creator' ? 'Hidden portal for novel uploaders' : 'Sync your bookmarks and reading history'}
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {currentUser ? (
            /* Logged In View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  margin: '0 auto 0.75rem auto',
                  fontSize: '1.4rem',
                  fontWeight: 700
                }}>
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  {currentUser.displayName}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {currentUser.email}
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="badge" style={{
                    background: currentUser.role === 'creator' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                    color: currentUser.role === 'creator' ? '#0284c7' : '#7c3aed',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {currentUser.role === 'creator' ? '⚡ Creator / Uploader' : '📖 Reader'}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.3)' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            /* Logged Out View with Tabs */
            <>
              {/* Tab Selector */}
              <div style={{
                display: 'flex',
                background: 'var(--bg-elevated, #f1f5f9)',
                padding: '4px',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-color, #e2e8f0)'
              }}>
                <button
                  type="button"
                  onClick={() => setTab('reader')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: tab === 'reader' ? 'var(--bg-card, #ffffff)' : 'transparent',
                    color: tab === 'reader' ? 'var(--primary-cyan, #0284c7)' : 'var(--text-muted)',
                    fontWeight: tab === 'reader' ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: tab === 'reader' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <BookOpen size={14} /> Reader Login
                </button>
                <button
                  type="button"
                  onClick={() => setTab('creator')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: tab === 'creator' ? 'var(--bg-card, #ffffff)' : 'transparent',
                    color: tab === 'creator' ? 'var(--primary-cyan, #0284c7)' : 'var(--text-muted)',
                    fontWeight: tab === 'creator' ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: tab === 'creator' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <KeyRound size={14} /> Admin / Uploader
                </button>
              </div>

              {tab === 'reader' ? (
                /* Reader Sign In / Sign Up Form */
                <form onSubmit={handleReaderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {isSignUp && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. CultivatorReader"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="reader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Password (Optional for guest)
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {readerError && (
                    <div style={{ color: '#ff4d4f', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={14} />
                      <span>{readerError}</span>
                    </div>
                  )}

                  {readerSuccess && (
                    <div style={{ color: '#059669', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Check size={14} />
                      <span>{readerSuccess}</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}>
                    {isSignUp ? 'Create Reader Account' : 'Sign In'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-cyan, #0284c7)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Admin Username & Password Form */
                <form onSubmit={handleCreatorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(2, 132, 199, 0.08)',
                    border: '1px dashed var(--primary-cyan, #0284c7)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1rem' }}>🛡️</span>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
                      <strong>Admin & Uploader Authorization:</strong> Sign in with the administrator credentials to manage novels and upload chapters.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Admin Username
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="admin"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        required
                        autoFocus
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-cyan, #0284c7)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Admin Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-cyan, #0284c7)' }} />
                    </div>
                  </div>

                  {adminError && (
                    <div style={{ color: '#ff4d4f', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={14} />
                      <span>{adminError}</span>
                    </div>
                  )}

                  {adminSuccess && (
                    <div style={{ color: '#059669', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Check size={14} />
                      <span>{adminSuccess}</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <Shield size={16} />
                    <span>Authorize Admin Access</span>
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
