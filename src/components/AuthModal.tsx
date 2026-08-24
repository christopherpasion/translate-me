import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { User, Lock, KeyRound, Shield, LogOut, Check, X, Sparkles, BookOpen } from 'lucide-react';

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

  // Creator Form State
  const [creatorPin, setCreatorPin] = useState('');
  const [creatorError, setCreatorError] = useState('');
  const [creatorSuccess, setCreatorSuccess] = useState('');

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
        setReaderSuccess('Account created! Welcome to Translate-Me.');
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
    setCreatorError('');
    setCreatorSuccess('');

    if (!creatorPin.trim()) {
      setCreatorError('Please enter the Creator Access Passcode.');
      return;
    }

    const isAuthorized = AuthService.verifyCreatorPasscode(creatorPin);
    if (isAuthorized) {
      setCreatorSuccess('Creator access granted! Opening Studio...');
      const user = AuthService.getCurrentUser();
      setTimeout(() => {
        if (user) onAuthSuccess(user);
        onClose();
      }, 700);
    } else {
      setCreatorError('Incorrect passcode. (Default: creator888 or admin)');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              {currentUser ? <User size={20} /> : tab === 'creator' ? <Shield size={20} /> : <BookOpen size={20} />}
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
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
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
                    background: currentUser.role === 'creator' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(157, 78, 221, 0.15)',
                    color: currentUser.role === 'creator' ? 'var(--accent-cyan)' : 'var(--accent-purple)',
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
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#ff4d4f' }}
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
                background: 'rgba(0,0,0,0.06)',
                padding: '4px',
                borderRadius: '8px',
                marginBottom: '1.25rem'
              }}>
                <button
                  type="button"
                  onClick={() => setTab('reader')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: tab === 'reader' ? 'var(--card-bg)' : 'transparent',
                    color: tab === 'reader' ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: tab === 'reader' ? 600 : 400,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: tab === 'reader' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <BookOpen size={14} /> Reader Login
                </button>
                <button
                  type="button"
                  onClick={() => setTab('creator')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: tab === 'creator' ? 'var(--card-bg)' : 'transparent',
                    color: tab === 'creator' ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: tab === 'creator' ? 600 : 400,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: tab === 'creator' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <KeyRound size={14} /> Creator Portal
                </button>
              </div>

              {tab === 'reader' ? (
                /* Reader Sign In / Sign Up Form */
                <form onSubmit={handleReaderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {isSignUp && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Password (Optional for local guest)
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
                    <div style={{ color: '#ff4d4f', fontSize: '0.8rem', padding: '0.4rem', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '6px' }}>
                      {readerError}
                    </div>
                  )}

                  {readerSuccess && (
                    <div style={{ color: '#52c41a', fontSize: '0.8rem', padding: '0.4rem', background: 'rgba(82, 196, 26, 0.1)', borderRadius: '6px' }}>
                      <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {readerSuccess}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    {isSignUp ? 'Create Reader Account' : 'Sign In'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Creator Passcode Form */
                <form onSubmit={handleCreatorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="glass-panel" style={{ padding: '0.9rem', borderRadius: '8px', border: '1px dashed var(--accent-cyan)' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      🔒 <strong>Creator / Uploader Passcode:</strong> Enter your studio passcode to access the chapter uploader and novel manager.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Passcode
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter passcode (e.g. creator888)"
                        value={creatorPin}
                        onChange={(e) => setCreatorPin(e.target.value)}
                        autoFocus
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Default passcode: <code>creator888</code> or <code>admin</code>
                    </span>
                  </div>

                  {creatorError && (
                    <div style={{ color: '#ff4d4f', fontSize: '0.8rem', padding: '0.4rem', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '6px' }}>
                      {creatorError}
                    </div>
                  )}

                  {creatorSuccess && (
                    <div style={{ color: '#52c41a', fontSize: '0.8rem', padding: '0.4rem', background: 'rgba(82, 196, 26, 0.1)', borderRadius: '6px' }}>
                      <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {creatorSuccess}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    <Shield size={16} style={{ marginRight: '6px' }} /> Enter Creator Studio
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
