import React, { useState, useEffect } from 'react';
import type { Novel, Chapter, GlossaryEntry, SelfHealingRecord, AIRecommendation, ReaderSuggestion } from './types';
import { StorageService } from './services/storage';
import { extractEntitiesFromChinese, type ExtractedEntity } from './services/nerExtractor';
import { cascadeTermReplacement } from './services/translationEngine';
import { translateChapterWithAI } from './services/aiProvider';
import { smartCleanWebNovelText } from './services/textCleaner';

import { Navbar } from './components/Navbar';
import { NovelLibrary } from './components/NovelLibrary';
import { StudioHeader } from './components/StudioHeader';
import { DualPaneStudio } from './components/DualPaneStudio';
import { GlossarySidebar } from './components/GlossarySidebar';
import { EntityExtractorModal } from './components/EntityExtractorModal';
import { CharacterGraphModal } from './components/CharacterGraphModal';
import { GovernanceModal } from './components/GovernanceModal';
import { ExportModal } from './components/ExportModal';
import { AISettingsModal } from './components/AISettingsModal';
import { PublicReaderView } from './components/PublicReaderView';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Main Data States
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string>('novel-1');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('chap-1-1');
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);
  const [healingRecords, setHealingRecords] = useState<SelfHealingRecord[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [suggestions, setSuggestions] = useState<ReaderSuggestion[]>([]);

  // Role View Mode ('admin' | 'reader')
  const [viewMode, setViewMode] = useState<'admin' | 'reader'>('reader');

  // Modals & Panels State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEntityScanOpen, setIsEntityScanOpen] = useState(false);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>([]);
  const [isCharacterGraphOpen, setIsCharacterGraphOpen] = useState(false);
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isNewChapterOpen, setIsNewChapterOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  // New Chapter Form State
  const [newChapTitleZh, setNewChapTitleZh] = useState('');
  const [newChapContentZh, setNewChapContentZh] = useState('');

  // Initial Load
  useEffect(() => {
    const loadedNovels = StorageService.getNovels();
    setNovels(loadedNovels);

    if (loadedNovels.length > 0) {
      const activeId = loadedNovels[0].id;
      setSelectedNovelId(activeId);
      loadNovelData(activeId);
    }
  }, []);

  // Load Data for Active Novel
  const loadNovelData = (novelId: string) => {
    const loadedChapters = StorageService.getChapters(novelId);
    setChapters(loadedChapters);
    if (loadedChapters.length > 0) {
      setSelectedChapterId(loadedChapters[0].id);
    }

    const loadedGlossary = StorageService.getGlossary(novelId);
    setGlossary(loadedGlossary);

    setHealingRecords(StorageService.getHealingRecords());
    setRecommendations(StorageService.getAIRecommendations(novelId));
    setSuggestions(StorageService.getReaderSuggestions(novelId));
  };

  const currentNovel = novels.find(n => n.id === selectedNovelId) || novels[0];
  const currentChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0] || null;

  // Handle Novel Switch
  const handleSelectNovel = (id: string) => {
    setSelectedNovelId(id);
    loadNovelData(id);
  };

  // Handle Create Novel
  const handleCreateNovel = (newNovelData: Omit<Novel, 'id' | 'chaptersCount' | 'translatedCount' | 'createdAt' | 'updatedAt'>) => {
    const created: Novel = {
      ...newNovelData,
      id: `novel-${Date.now()}`,
      chaptersCount: 0,
      translatedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = StorageService.saveNovel(created);
    setNovels(updated);
    handleSelectNovel(created.id);
  };

  // Handle Save Chapter Raw/Translation with Smart Cleaner & AI Auto-Translate
  const handleSaveChapterContent = async (rawContentZh: string, rawContentEn: string) => {
    if (!currentChapter) return;

    // 1. Smart clean the raw Chinese input to strip website headers/footers/numbers
    const cleaned = smartCleanWebNovelText(rawContentZh);
    const cleanContentZh = cleaned.contentZh || rawContentZh;

    // 2. Automatically translate clean Chinese text into fluent English prose
    let finalContentEn = rawContentEn;
    if (cleanContentZh) {
      const result = await translateChapterWithAI(currentChapter.id, cleanContentZh, glossary);
      finalContentEn = result.translatedEn;
    }

    // 3. Translate title if needed
    const finalTitleZh = (cleaned.chapterTitle && cleaned.chapterTitle !== 'New Chapter') ? cleaned.chapterTitle : currentChapter.titleZh;
    const finalTitleEn = translateTitleToEn(finalTitleZh, currentChapter.chapterNumber);

    const updated: Chapter = {
      ...currentChapter,
      titleZh: finalTitleZh,
      titleEn: finalTitleEn,
      contentZh: cleanContentZh,
      contentEn: finalContentEn,
      status: 'translated',
      updatedAt: new Date().toISOString()
    };

    StorageService.saveChapter(updated);
    setChapters(chapters.map(c => c.id === updated.id ? updated : c));
    setHealingRecords(StorageService.getHealingRecords());
  };

  // Handle Quick Term Edit & Global Self-Healing Cascade Replacement
  const handleQuickUpdateGlossary = (originalZh: string, newEn: string) => {
    const existing = glossary.find(g => g.originalZh === originalZh);
    const oldEn = existing ? existing.translatedEn : originalZh;

    const entryToSave: GlossaryEntry = {
      id: existing ? existing.id : `g-${selectedNovelId}-${Date.now()}`,
      originalZh,
      translatedEn: newEn,
      category: existing ? existing.category : 'character',
      scope: existing ? existing.scope : 'local',
      occurrences: (existing?.occurrences || 0) + 1,
      updatedAt: new Date().toISOString()
    };

    const updatedGlossary = StorageService.saveGlossaryEntry(entryToSave);
    setGlossary(updatedGlossary);

    // Run 1-Click Cascade Replacement across all chapters in the book!
    cascadeTermReplacement(selectedNovelId, originalZh, oldEn, newEn);

    // Refresh chapters & healing records
    setChapters(StorageService.getChapters(selectedNovelId));
    setHealingRecords(StorageService.getHealingRecords());
  };

  // Handle Entity Scan Trigger
  const handleRunEntityScan = () => {
    if (!currentChapter?.contentZh) return;
    const entities = extractEntitiesFromChinese(currentChapter.contentZh, glossary);
    setExtractedEntities(entities);
    setIsEntityScanOpen(true);
  };

  // Handle Entity Approve & Chapter Translation
  const handleConfirmEntitiesAndTranslate = async (approvedEntities: ExtractedEntity[]) => {
    setIsEntityScanOpen(false);

    // 1. Save approved entities to Glossary Map
    for (const entity of approvedEntities) {
      StorageService.saveGlossaryEntry({
        id: `g-${selectedNovelId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        originalZh: entity.originalZh,
        translatedEn: entity.suggestedEn,
        category: entity.category,
        scope: 'local',
        gender: entity.gender,
        occurrences: entity.count,
        updatedAt: new Date().toISOString()
      });
    }

    const updatedGlossary = StorageService.getGlossary(selectedNovelId);
    setGlossary(updatedGlossary);

    // 2. Execute Multi-pass Translation with Glossary Injection & Self-Healing (Built-in or Gemini API)
    if (currentChapter) {
      const result = await translateChapterWithAI(currentChapter.id, currentChapter.contentZh, updatedGlossary);
      
      const updatedCh: Chapter = {
        ...currentChapter,
        contentEn: result.translatedEn,
        status: 'translated',
        extractedTermsCount: approvedEntities.length,
        selfHealedCount: result.selfHealedRecords.length,
        updatedAt: new Date().toISOString()
      };
      StorageService.saveChapter(updatedCh);

      setChapters(chapters.map(c => c.id === updatedCh.id ? updatedCh : c));
      setHealingRecords(StorageService.getHealingRecords());
    }
  };

  // Handle Self-Healing Pass Trigger
  const handleRunSelfHealingPass = async () => {
    if (!currentChapter) return;
    const result = await translateChapterWithAI(currentChapter.id, currentChapter.contentZh, glossary);

    const updatedCh: Chapter = {
      ...currentChapter,
      contentEn: result.translatedEn,
      selfHealedCount: (currentChapter.selfHealedCount || 0) + result.selfHealedRecords.length,
      updatedAt: new Date().toISOString()
    };
    StorageService.saveChapter(updatedCh);

    setChapters(chapters.map(c => c.id === updatedCh.id ? updatedCh : c));
    setHealingRecords(StorageService.getHealingRecords());
  };

  // Helper to translate chapter title to clean English
  const translateTitleToEn = (zh: string, num: number): string => {
    let cleanZh = zh.replace(/^第\d+章\s*/, '').trim();
    const titleMap: Record<string, string> = {
      '狂暴龙（1）': 'Indominus Dragon (1)',
      '狂暴龙(1)': 'Indominus Dragon (1)',
      '狂暴龙': 'Indominus Dragon',
      '陨落的天才': 'The Fallen Genius',
      '斗气三段': 'Dou Qi 3rd Stage',
      '纳兰退婚': 'Nalan Marriage Contract Cancellation'
    };

    if (titleMap[cleanZh]) return `Chapter ${num}: ${titleMap[cleanZh]}`;
    if (titleMap[zh]) return `Chapter ${num}: ${titleMap[zh]}`;

    // Simple Pinyin fallback if not in dictionary
    if (cleanZh.includes('狂暴龙')) return `Chapter ${num}: Indominus Dragon ${cleanZh.replace('狂暴龙', '').trim()}`;

    return `Chapter ${num}: ${cleanZh || 'New Chapter'}`;
  };

  // Handle Create New Chapter
  const handleCreateNewChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapContentZh) return;

    // Run Smart Cleaner on pasted raw text
    const cleaned = smartCleanWebNovelText(newChapContentZh);

    const chapNum = chapters.length + 1;
    const finalTitleZh = newChapTitleZh.trim() || cleaned.chapterTitle || `第${chapNum}章 狂暴龙（1）`;
    const finalContentZh = cleaned.contentZh || newChapContentZh;
    const finalTitleEn = translateTitleToEn(finalTitleZh, chapNum);

    const newChap: Chapter = {
      id: `chap-${selectedNovelId}-${Date.now()}`,
      novelId: selectedNovelId,
      chapterNumber: chapNum,
      titleZh: finalTitleZh,
      titleEn: finalTitleEn,
      contentZh: finalContentZh,
      contentEn: '',
      status: 'raw',
      extractedTermsCount: 0,
      selfHealedCount: 0,
      updatedAt: new Date().toISOString()
    };

    StorageService.saveChapter(newChap);
    const updatedChaps = StorageService.getChapters(selectedNovelId);
    setChapters(updatedChaps);
    setSelectedChapterId(newChap.id);

    setIsNewChapterOpen(false);
    setNewChapTitleZh('');
    setNewChapContentZh('');

    // Trigger pre-pass scanner immediately for the new chapter
    const entities = extractEntitiesFromChinese(newChap.contentZh, glossary);
    setExtractedEntities(entities);
    setIsEntityScanOpen(true);
  };

  // Governance Handlers
  const handleApproveRecommendation = (rec: AIRecommendation) => {
    StorageService.updateRecommendationStatus(rec.id, 'accepted');
    handleQuickUpdateGlossary(rec.originalZh, rec.suggestedEn);
    setRecommendations(StorageService.getAIRecommendations(selectedNovelId));
  };

  const handleRejectRecommendation = (id: string) => {
    StorageService.updateRecommendationStatus(id, 'rejected');
    setRecommendations(StorageService.getAIRecommendations(selectedNovelId));
  };

  const handleApproveSuggestion = (sug: ReaderSuggestion) => {
    StorageService.updateSuggestionStatus(sug.id, 'approved');
    handleQuickUpdateGlossary(sug.originalZh, sug.suggestedEn);
    setSuggestions(StorageService.getReaderSuggestions(selectedNovelId));
  };

  const handleRejectSuggestion = (id: string) => {
    StorageService.updateSuggestionStatus(id, 'rejected');
    setSuggestions(StorageService.getReaderSuggestions(selectedNovelId));
  };

  const pendingGovCount = recommendations.filter(r => r.status === 'pending').length + suggestions.filter(s => s.status === 'pending').length;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        novels={novels}
        selectedNovelId={selectedNovelId}
        onSelectNovel={handleSelectNovel}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenGlobalGlossary={() => setIsSidebarOpen(true)}
        onOpenGovernance={() => setIsGovernanceOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenNewNovelModal={() => setIsLibraryOpen(true)}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
        pendingGovernanceCount={pendingGovCount}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'admin' ? 'reader' : 'admin')}
      />

      {/* Main View Router: Public Reader View vs Admin Translation Studio */}
      {viewMode === 'reader' && currentNovel ? (
        <PublicReaderView
          currentNovel={currentNovel}
          chapters={chapters}
          currentChapter={currentChapter}
          glossary={glossary}
          onSelectChapter={setSelectedChapterId}
          onOpenAdminMode={() => setViewMode('admin')}
        />
      ) : (
        <>
          {/* Studio Header Toolbar */}
          {currentNovel && (
            <StudioHeader
              currentNovel={currentNovel}
              chapters={chapters}
              currentChapter={currentChapter}
              onSelectChapter={setSelectedChapterId}
              onOpenNewChapterModal={() => setIsNewChapterOpen(true)}
              onRunEntityScan={handleRunEntityScan}
              onRunSelfHealing={handleRunSelfHealingPass}
              onOpenCharacterGraph={() => setIsCharacterGraphOpen(true)}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
              glossaryCount={glossary.length}
            />
          )}

          {/* Main Studio View */}
          <main className="main-view">
            <DualPaneStudio
              chapter={currentChapter}
              glossary={glossary}
              healingRecords={healingRecords}
              onSaveContent={handleSaveChapterContent}
              onQuickUpdateGlossary={handleQuickUpdateGlossary}
              onReTranslateChapter={handleRunSelfHealingPass}
            />

            {/* 2-Tier Glossary Sidebar */}
            {isSidebarOpen && (
              <GlossarySidebar
                glossary={glossary}
                novelId={selectedNovelId}
                onSaveEntry={(entry) => {
                  const updated = StorageService.saveGlossaryEntry(entry);
                  setGlossary(updated);
                }}
                onDeleteEntry={(id) => {
                  const updated = StorageService.deleteGlossaryEntry(id);
                  setGlossary(updated);
                }}
                onClose={() => setIsSidebarOpen(false)}
              />
            )}
          </main>
        </>
      )}

      {/* Multi-Novel Library Modal */}
      {isLibraryOpen && (
        <NovelLibrary
          novels={novels}
          onSelectNovel={handleSelectNovel}
          onCreateNovel={handleCreateNovel}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}

      {/* Pre-Pass Entity Extractor Modal */}
      {isEntityScanOpen && (
        <EntityExtractorModal
          entities={extractedEntities}
          onConfirmAndTranslate={handleConfirmEntitiesAndTranslate}
          onClose={() => setIsEntityScanOpen(false)}
        />
      )}

      {/* Visual Character Graph Modal */}
      {isCharacterGraphOpen && currentNovel && (
        <CharacterGraphModal
          glossary={glossary}
          novelTitle={currentNovel.titleEn}
          onClose={() => setIsCharacterGraphOpen(false)}
        />
      )}

      {/* Governance Modal */}
      {isGovernanceOpen && (
        <GovernanceModal
          recommendations={recommendations}
          suggestions={suggestions}
          onApproveRecommendation={handleApproveRecommendation}
          onRejectRecommendation={handleRejectRecommendation}
          onApproveSuggestion={handleApproveSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          onClose={() => setIsGovernanceOpen(false)}
        />
      )}

      {/* Export Modal */}
      {isExportOpen && currentNovel && (
        <ExportModal
          novel={currentNovel}
          chapters={chapters}
          glossary={glossary}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* AI Settings Modal */}
      {isAISettingsOpen && (
        <AISettingsModal onClose={() => setIsAISettingsOpen(false)} />
      )}

      {/* Create New Chapter Modal (1-Box Smart Paste) */}
      {isNewChapterOpen && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={22} style={{ color: 'var(--primary-cyan)' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Smart Chapter Importer</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paste raw web copy here — title will be extracted & noise cleaned automatically</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsNewChapterOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateNewChapter}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Paste Web Text / Chapter Content (Ctrl + V)
                  </label>
                  <textarea
                    rows={10}
                    required
                    autoFocus
                    placeholder="Just paste raw Chinese text or full JJWXC webpage copy here! Chapter title, novel info, clean story paragraphs, and entity extraction will all happen automatically..."
                    value={newChapContentZh}
                    onChange={(e) => setNewChapContentZh(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontFamily: 'var(--font-zh)',
                      fontSize: '0.95rem',
                      lineHeight: '1.7'
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  ✦ Automatically extracts title, strips website headers/footers, removes JJWXC comment numbers (`284`, `62`), and launches AI translation!
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewChapterOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                  <Sparkles size={16} />
                  <span>Import, Clean & Translate Chapter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
