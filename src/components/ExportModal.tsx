import React, { useState } from 'react';
import type { Novel, Chapter, GlossaryEntry } from '../types';
import { Download, FileText, Book, Check, X, Layers } from 'lucide-react';
import { exportNovelToEpubHtml } from '../services/epubExporter';

interface ExportModalProps {
  novel: Novel;
  chapters: Chapter[];
  glossary: GlossaryEntry[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  novel,
  chapters,
  glossary,
  onClose
}) => {
  const [exportFormat, setExportFormat] = useState<'markdown' | 'epub' | 'pdf'>('markdown');
  const [includeGlossaryAppendix, setIncludeGlossaryAppendix] = useState(true);
  const [includeSelfHealingReport, setIncludeSelfHealingReport] = useState(true);
  const [isExported, setIsExported] = useState(false);

  const handleDownload = () => {
    if (exportFormat === 'epub' || exportFormat === 'pdf') {
      exportNovelToEpubHtml(novel, chapters);
      setIsExported(true);
      return;
    }

    let output = `# ${novel.titleEn} (${novel.titleZh})\n`;
    output += `Author: ${novel.author}\n`;
    output += `Genre: ${novel.genre.toUpperCase()}\n\n`;
    output += `Synopsis: ${novel.description}\n\n`;
    output += `---\n\n`;

    for (const ch of chapters) {
      output += `## ${ch.titleEn}\n\n`;
      output += `${ch.contentEn}\n\n`;
      output += `---\n\n`;
    }

    if (includeGlossaryAppendix) {
      output += `# Appendix: Official Glossary & Terminology Map\n\n`;
      output += `| Chinese | English Translation | Category | Scope |\n`;
      output += `|---|---|---|---|\n`;
      for (const g of glossary) {
        output += `| ${g.originalZh} | ${g.translatedEn} | ${g.category} | ${g.scope} |\n`;
      }
    }

    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${novel.titleEn.replaceAll(' ', '_')}_Translation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExported(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Download size={22} style={{ color: 'var(--primary-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Export Novel Translation</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate formatted eBook with Glossary Appendix</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Select Format</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {[
                { id: 'markdown', label: 'Markdown (.md)', icon: FileText },
                { id: 'epub', label: 'eBook (.epub)', icon: Book },
                { id: 'pdf', label: 'PDF Book (.pdf)', icon: Layers }
              ].map(item => {
                const IconComp = item.icon;
                const isSel = exportFormat === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setExportFormat(item.id as any)}
                    className="glass-panel"
                    style={{
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      border: isSel ? '1px solid var(--primary-cyan)' : '1px solid var(--border-color)',
                      background: isSel ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255,255,255,0.03)'
                    }}
                  >
                    <IconComp size={20} style={{ color: isSel ? 'var(--primary-cyan)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isSel ? '#fff' : 'var(--text-muted)' }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeGlossaryAppendix}
                onChange={(e) => setIncludeGlossaryAppendix(e.target.checked)}
              />
              <span>Include Official Glossary & Character Guide Appendix ({glossary.length} terms)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeSelfHealingReport}
                onChange={(e) => setIncludeSelfHealingReport(e.target.checked)}
              />
              <span>Include Self-Healing Alignment Audit Log</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleDownload}>
            {isExported ? <Check size={16} /> : <Download size={16} />}
            <span>{isExported ? 'Exported Successfully!' : 'Generate & Download'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
