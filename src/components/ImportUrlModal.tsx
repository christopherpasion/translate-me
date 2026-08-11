import React, { useState } from 'react';
import { Globe, Link, X, Sparkles, FileText } from 'lucide-react';

interface ImportUrlModalProps {
  onImportChapter: (titleZh: string, contentZh: string) => void;
  onClose: () => void;
}

export const ImportUrlModal: React.FC<ImportUrlModalProps> = ({
  onImportChapter,
  onClose
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'clean_paste'>('url');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'url') {
      if (!urlInput.trim()) return;
      setIsLoading(true);

      try {
        // Use allorigins or corsproxy to bypass CORS and fetch JJWXC / Web Novel HTML
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlInput.trim())}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Failed to fetch URL content');

        const data = await res.json();
        const html = data.contents || '';

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract Title
        const titleEl = doc.querySelector('h2, .title, font[color="red"], h1, head title');
        const chapterTitle = titleEl ? titleEl.textContent?.trim() || 'Imported Chapter' : 'Imported Chapter';

        // Extract Novel Paragraphs & Strip JJWXC Overlay Comment Numbers (e.g. 284, 62, 16)
        let paragraphs: string[] = [];
        const pElements = doc.querySelectorAll('.noveltext p, #noveltext p, #content p, .read-content p');

        if (pElements.length > 0) {
          pElements.forEach(p => {
            const text = p.textContent?.replace(/\d+$/, '').trim();
            if (text) paragraphs.push(text);
          });
        } else {
          const novelContainer = doc.querySelector('.noveltext, #noveltext, #content');
          if (novelContainer) {
            const text = novelContainer.textContent || '';
            paragraphs = text.split('\n').map(l => l.replace(/\d+$/, '').trim()).filter(l => l.length > 0);
          }
        }

        if (paragraphs.length === 0) {
          throw new Error('Could not find chapter text on page. Please use Clean Paste tab.');
        }

        const cleanContent = paragraphs.join('\n\n');
        onImportChapter(chapterTitle, cleanContent);
        setIsLoading(false);
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err.message || 'Web fetch blocked by site. Please use the Clean Paste tab.');
      }
    } else {
      // Clean Paste mode: Automatically strips JJWXC trailing comment numbers
      if (!rawTextInput.trim()) return;
      const cleanContent = rawTextInput
        .split('\n')
        .map(line => line.replace(/\d+$/, '').trim())
        .filter(Boolean)
        .join('\n\n');

      onImportChapter('Imported Web Chapter', cleanContent);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe size={24} style={{ color: 'var(--primary-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Import Chapter from Web / JJWXC</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-fetches novel chapter and strips anti-copy comment numbers</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${activeTab === 'url' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('url')}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            <Link size={16} />
            <span>Import via URL</span>
          </button>
          <button
            className={`btn ${activeTab === 'clean_paste' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('clean_paste')}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            <FileText size={16} />
            <span>Clean Paste (Auto-Strip Numbers)</span>
          </button>
        </div>

        <form onSubmit={handleFetchUrl}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeTab === 'url' ? (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Paste JJWXC / Web Novel Link
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.jjwxc.net/onebook.php?novelid=8585022&chapterid=1"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                  Supports JJWXC (`jjwxc.net`), Qidian, 69shuba, and general Chinese novel sites.
                </p>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Paste Raw Text (Auto-Strips JJWXC Numbers like 284, 62, 16)
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste copied text here. Trailing paragraph numbers will be stripped automatically!"
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontFamily: 'var(--font-zh)'
                  }}
                />
              </div>
            )}

            {errorMessage && (
              <div style={{ background: 'rgba(245, 87, 108, 0.15)', color: 'var(--accent-pink)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', border: '1px solid rgba(245, 87, 108, 0.3)' }}>
                {errorMessage}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <Sparkles size={16} />
              <span>{isLoading ? 'Fetching & Cleaning Chapter...' : 'Import & Scan Entities'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
