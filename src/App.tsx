import React, { useState, useEffect } from 'react';
import type { Novel, Chapter, GlossaryEntry, SelfHealingRecord, AIRecommendation, ReaderSuggestion } from './types';
import { StorageService } from './services/storage';
import { extractEntitiesFromChinese, type ExtractedEntity } from './services/nerExtractor';
import { cascadeTermReplacement, cleanAndTranslateChapterTitle, type TranslationStyle } from './services/translationEngine';
import { translateChapterWithAI, getAISettings } from './services/aiProvider';
import { smartCleanWebNovelText, getCustomNoiseRules, addCustomNoiseRule, removeCustomNoiseRule } from './services/textCleaner';
import { SupabaseService } from './services/supabaseService';

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
import { DictionaryLookupModal } from './components/DictionaryLookupModal';
import { AITrainingModal } from './components/AITrainingModal';
import { BatchTranslateModal } from './components/BatchTranslateModal';
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

  // App Theme State ('dark' | 'light') - Default to White Theme as requested
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('light');

  // Translation Prose Style ('xianxia' | 'fluent' | 'faithful')
  const [translationStyle, setTranslationStyle] = useState<TranslationStyle>('xianxia');

  useEffect(() => {
    if (appTheme === 'light') {
      document.body.classList.add('light-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [appTheme]);

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
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isAITrainingOpen, setIsAITrainingOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [translationError, setTranslationError] = useState<{ provider: string; message: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationStep, setTranslationStep] = useState('Initializing AI Translation...');
  const [activeEngineLabel, setActiveEngineLabel] = useState('DeepSeek-V3 AI');

  const executeTranslationWithProgress = async (
    chapterId: string,
    rawZh: string,
    glossaryEntries: GlossaryEntry[]
  ) => {
    const settings = getAISettings();
    const providerName = settings.provider === 'custom-neural'
      ? 'Translate-Me Neural Core (In-House AI) 🧠'
      : settings.provider === 'ollama'
        ? `Ollama Local (${settings.ollamaModel || 'Qwen 2.5'}) 🆓`
        : settings.provider === 'deepseek'
          ? 'DeepSeek-V3 AI'
          : settings.provider === 'gemini'
            ? 'Google Gemini API'
            : settings.provider === 'groq'
              ? 'Groq (Llama 3) 🆓'
              : 'Built-In Local Engine';

    const providerShort = settings.provider === 'custom-neural'
      ? 'In-House Neural AI'
      : settings.provider === 'ollama'
        ? 'Ollama LLM'
        : settings.provider === 'deepseek'
          ? 'DeepSeek-V3'
          : settings.provider === 'gemini'
            ? 'Gemini AI'
            : settings.provider === 'groq'
              ? 'Groq Llama 3'
              : 'Local Engine';
    setActiveEngineLabel(providerName);
    setIsTranslating(true);
    setTranslationProgress(10);
    setTranslationStep('🔍 Scanning & Injecting Glossary Terms...');

    let progressValue = 10;
    const interval = setInterval(() => {
      progressValue += Math.floor(Math.random() * 8) + 4;
      if (progressValue > 92) {
        progressValue = 92;
        setTranslationStep('🛡️ Finalizing Xianxia & Sci-Fi Prose Alignment...');
      } else if (progressValue > 60) {
        setTranslationStep(`✍️ Translating Prose with ${providerShort}...`);
      } else if (progressValue > 30) {
        setTranslationStep(`⚡ Calling ${providerShort}...`);
      }
      setTranslationProgress(progressValue);
    }, 180);

    try {
      const result = await translateChapterWithAI(chapterId, rawZh, glossaryEntries);
      clearInterval(interval);
      setTranslationProgress(100);
      setTranslationStep('✨ Translation Complete!');
      await new Promise(r => setTimeout(r, 200));
      return result;
    } catch (err) {
      clearInterval(interval);
      throw err;
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
    }
  };

  // Custom noise rules state
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [newRuleInput, setNewRuleInput] = useState('');

  // New Chapter Form state
  const [newChapContentZh, setNewChapContentZh] = useState('');

  // Initial Data Load
  useEffect(() => {
    // StorageService lazily initializes seed data when reading novels
    const loadedNovels = StorageService.getNovels();
    setNovels(loadedNovels);

    if (loadedNovels.length > 0) {
      const initialNovelId = loadedNovels[0].id;
      setSelectedNovelId(initialNovelId);

      const chaps = StorageService.getChapters(initialNovelId);
      setChapters(chaps);
      if (chaps.length > 0) {
        setSelectedChapterId(chaps[0].id);
      }

      setGlossary(StorageService.getGlossary(initialNovelId));
      setHealingRecords(StorageService.getHealingRecords());
      setRecommendations(StorageService.getAIRecommendations(initialNovelId));
      setSuggestions(StorageService.getReaderSuggestions(initialNovelId));
    }

    setCustomRules(getCustomNoiseRules());
  }, []);

  // Listen for translation-error custom events
  useEffect(() => {
    const handleErrorEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ provider: string; message: string }>;
      if (customEvent.detail) {
        setTranslationError(customEvent.detail);
      }
    };
    window.addEventListener('translation-error', handleErrorEvent);
    return () => window.removeEventListener('translation-error', handleErrorEvent);
  }, []);

  // Sync state when novel changes
  const handleSelectNovel = (novelId: string) => {
    setSelectedNovelId(novelId);
    const chaps = StorageService.getChapters(novelId);
    setChapters(chaps);
    if (chaps.length > 0) {
      setSelectedChapterId(chaps[0].id);
    } else {
      setSelectedChapterId('');
    }
    setGlossary(StorageService.getGlossary(novelId));
    setRecommendations(StorageService.getAIRecommendations(novelId));
    setSuggestions(StorageService.getReaderSuggestions(novelId));
  };

  const currentNovel = novels.find(n => n.id === selectedNovelId) || null;
  const currentChapter = chapters.find(c => c.id === selectedChapterId) || null;

  // Active recommendations & pending suggestions count
  const pendingGovCount = recommendations.filter(r => r.status === 'pending').length +
                          suggestions.filter(s => s.status === 'pending').length;

  // Save / update Glossary Entry
  const handleSaveGlossaryEntry = (entry: Partial<GlossaryEntry>) => {
    if (!entry.originalZh || !entry.translatedEn) return;
    const fullEntry: GlossaryEntry = {
      id: entry.id || `g-${selectedNovelId}-${Date.now()}`,
      originalZh: entry.originalZh,
      translatedEn: entry.translatedEn,
      category: entry.category || 'character',
      scope: entry.scope || 'local',
      gender: entry.gender,
      pinyin: entry.pinyin,
      traditionalZh: entry.traditionalZh,
      notes: entry.notes || '',
      occurrences: entry.occurrences || 1,
      updatedAt: new Date().toISOString()
    };
    const updatedGlossary = StorageService.saveGlossaryEntry(fullEntry);
    setGlossary(updatedGlossary);

    // Trigger cascade term replacement across all chapters
    cascadeTermReplacement(selectedNovelId, fullEntry.originalZh, '', fullEntry.translatedEn);
    setChapters(StorageService.getChapters(selectedNovelId));
    setHealingRecords(StorageService.getHealingRecords());
  };

  // Quick edit term inline from studio popover
  const handleQuickUpdateGlossary = (originalZh: string, newEn: string) => {
    const existing = glossary.find(g => g.originalZh === originalZh);
    const oldEn = existing ? existing.translatedEn : '';

    const entryToSave: GlossaryEntry = {
      id: existing ? existing.id : `g-${selectedNovelId}-${Date.now()}`,
      originalZh,
      translatedEn: newEn,
      category: existing ? existing.category : 'character',
      scope: existing ? existing.scope : 'local',
      notes: existing ? existing.notes : 'Quick inline edit from studio',
      occurrences: existing ? existing.occurrences + 1 : 1,
      updatedAt: new Date().toISOString()
    };

    const updatedGlossary = StorageService.saveGlossaryEntry(entryToSave);
    setGlossary(updatedGlossary);

    // Global cascade replacement
    const updatedCount = cascadeTermReplacement(selectedNovelId, originalZh, oldEn, newEn);
    setChapters(StorageService.getChapters(selectedNovelId));
    setHealingRecords(StorageService.getHealingRecords());

    if (updatedCount > 0) {
      console.log(`[Cascade Alignment] Updated ${updatedCount} chapters for term "${originalZh}" -> "${newEn}"`);
    }
  };

  // Re-translate current chapter with active self-healing agent
  const handleRunSelfHealingPass = async () => {
    if (!currentChapter) return;
    try {
      const result = await executeTranslationWithProgress(
        currentChapter.id,
        currentChapter.contentZh,
        glossary
      );
      const updated: Chapter = {
        ...currentChapter,
        contentEn: result.translatedEn,
        status: 'translated',
        selfHealedCount: result.selfHealedRecords.length,
        updatedAt: new Date().toISOString()
      };
      StorageService.saveChapter(updated);
      setChapters(StorageService.getChapters(selectedNovelId));
      setHealingRecords(StorageService.getHealingRecords());
    } catch (err) {
      console.error('Self-healing pass error:', err);
    }
  };

  // Entity Scan Modal Trigger
  const handleRunEntityScan = () => {
    if (!currentChapter || !currentChapter.contentZh) return;
    const extracted = extractEntitiesFromChinese(currentChapter.contentZh, glossary);
    setExtractedEntities(extracted);
    setIsEntityScanOpen(true);
  };

  // Batch Add Extracted Entities to Glossary
  const handleAcceptExtractedEntities = (acceptedEntities: ExtractedEntity[]) => {
    for (const ent of acceptedEntities) {
      const entry: GlossaryEntry = {
        id: `g-${selectedNovelId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        originalZh: ent.originalZh,
        translatedEn: ent.suggestedEn,
        category: ent.category,
        scope: 'local',
        gender: ent.gender,
        notes: `Auto-extracted from NER Scan (Confidence ${Math.round(ent.confidence * 100)}%)`,
        occurrences: ent.count,
        updatedAt: new Date().toISOString()
      };
      StorageService.saveGlossaryEntry(entry);
    }
    setGlossary(StorageService.getGlossary(selectedNovelId));
    setIsEntityScanOpen(false);

    // Auto trigger re-translation with newly injected entities
    handleRunSelfHealingPass();
  };

  // Save manual Chinese/English edits from DualPaneStudio
  const handleSaveChapterContent = (contentZh: string, contentEn: string) => {
    if (!currentChapter) return;
    const updated: Chapter = {
      ...currentChapter,
      contentZh,
      contentEn,
      status: contentEn.trim() ? 'edited' : 'raw',
      updatedAt: new Date().toISOString()
    };
    StorageService.saveChapter(updated);
    setChapters(StorageService.getChapters(selectedNovelId));
  };

  // Create New Chapter from pasted raw web text (Smart Clean + Entity Auto Scan + AI Translation)
  const handleCreateNewChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapContentZh.trim()) return;

    // 1. Smart Clean web novel text (strips ads, comments, copyright noise)
    const cleaned = smartCleanWebNovelText(newChapContentZh);

    // Rule #3: Automatically translate chapter title so no Chinese characters remain in English badges
    const rawTitleZh = cleaned.chapterTitle || `第${chapters.length + 1}章`;
    const cleanTitleEn = cleanAndTranslateChapterTitle(rawTitleZh, chapters.length + 1);

    const nextNumber = chapters.length + 1;
    const newChapId = `chap-${selectedNovelId}-${Date.now()}`;

    // 2. Pre-save raw chapter draft
    const draftChapter: Chapter = {
      id: newChapId,
      novelId: selectedNovelId,
      chapterNumber: nextNumber,
      titleZh: rawTitleZh,
      titleEn: cleanTitleEn,
      contentZh: cleaned.contentZh,
      contentEn: '',
      status: 'extracting',
      extractedTermsCount: 0,
      selfHealedCount: 0,
      updatedAt: new Date().toISOString()
    };

    StorageService.saveChapter(draftChapter);
    const updatedChaps = StorageService.getChapters(selectedNovelId);
    setChapters(updatedChaps);
    setSelectedChapterId(newChapId);

    // 3. Auto Extract Named Entities (NER) & inject into local glossary
    const extracted = extractEntitiesFromChinese(cleaned.contentZh, glossary);
    for (const ent of extracted) {
      if (ent.confidence > 0.6) {
        StorageService.saveGlossaryEntry({
          id: `g-${selectedNovelId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          originalZh: ent.originalZh,
          translatedEn: ent.suggestedEn,
          category: ent.category,
          scope: 'local',
          gender: ent.gender,
          notes: `Auto-injected during chapter import`,
          occurrences: ent.count,
          updatedAt: new Date().toISOString()
        });
      }
    }

    const currentGlossary = StorageService.getGlossary(selectedNovelId);
    setGlossary(currentGlossary);
    setIsNewChapterOpen(false);
    setNewChapContentZh('');

    // 4. Multi-pass Context-Aware AI Translation
    try {
      const translationRes = await executeTranslationWithProgress(
        newChapId,
        cleaned.contentZh,
        currentGlossary
      );

      const finalChapter: Chapter = {
        ...draftChapter,
        contentEn: translationRes.translatedEn,
        status: 'translated',
        extractedTermsCount: extracted.length,
        selfHealedCount: translationRes.selfHealedRecords.length,
        updatedAt: new Date().toISOString()
      };

      StorageService.saveChapter(finalChapter);
      setChapters(StorageService.getChapters(selectedNovelId));
      setHealingRecords(StorageService.getHealingRecords());
    } catch (err) {
      console.error('Import translation error:', err);
    }
  };

  // Polish Prose Action
  const handlePolishProse = async () => {
    if (!currentChapter || !currentChapter.contentEn) return;
    try {
      const result = await executeTranslationWithProgress(
        currentChapter.id,
        currentChapter.contentZh,
        glossary
      );
      if (result.translatedEn) {
        const updated: Chapter = {
          ...currentChapter,
          contentEn: result.translatedEn,
          status: 'translated',
          updatedAt: new Date().toISOString()
        };
        StorageService.saveChapter(updated);
        setChapters(StorageService.getChapters(selectedNovelId));
      }
    } catch (err) {
      console.error('Polish prose error:', err);
    }
  };

  const handleSyncSupabaseCloud = async () => {
    setIsTranslating(true);
    setTranslationProgress(35);
    setTranslationStep('☁️ Syncing local chapters & terms to Supabase Cloud...');
    try {
      const res = await SupabaseService.syncAllLocalToCloud(selectedNovelId);
      setTranslationProgress(100);
      setTranslationStep(res.message);
      await new Promise(r => setTimeout(r, 600));
      const event = new CustomEvent('translation-error', {
        detail: { message: res.message, provider: 'Supabase Cloud' }
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error('[Supabase] Sync error:', err);
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    const updated = StorageService.deleteChapter(chapterId);
    setChapters(updated);
    if (updated.length > 0) {
      setSelectedChapterId(updated[0].id);
    } else {
      setSelectedChapterId('');
    }
  };

  return (
    <div className="app-container">
      {/* Translation Loading Overlay with Real-Time Progress Bar */}
      {isTranslating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(4, 7, 14, 0.75)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: '#0f1729', border: '1px solid rgba(0, 242, 254, 0.2)',
            borderRadius: '1.25rem', padding: '2rem 2.5rem', width: '420px', maxWidth: '90vw',
            textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(0,242,254,0.06)',
            display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative'
          }}>
            <button
              onClick={() => setIsTranslating(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold'
              }}
              title="Cancel Translation Overlay"
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <div className="spinner" style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#00f2fe', borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,0.8)', letterSpacing: '0.01em' }}>Translating Chapter...</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', fontWeight: 600, minHeight: '1.4em' }}>
              {translationStep}
            </div>

            {/* Live Progress Bar */}
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{
                height: '100%', width: `${translationProgress}%`,
                background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #ec4899 100%)',
                borderRadius: '9999px', transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Engine: {activeEngineLabel}</span>
              <span style={{ color: '#60a5fa', fontWeight: 800, fontSize: '0.95rem' }}>{translationProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Translation Notification Toast */}
      {translationError && (
        <div style={{
          position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 99998,
          background: translationError.message.includes('Auto-switched') || translationError.message.includes('Synced') ? 'rgba(15, 23, 42, 0.95)' : '#dc2626',
          border: translationError.message.includes('Auto-switched') || translationError.message.includes('Synced') ? '1px solid var(--primary-cyan)' : '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          borderRadius: '0.75rem', padding: '0.9rem 1.25rem',
          boxShadow: '0 12px 35px rgba(0,0,0,0.55)',
          maxWidth: '440px', width: 'calc(100vw - 2.5rem)', fontSize: '0.85rem', fontWeight: 600,
          display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '0.1rem' }}>
            {translationError.message.includes('Auto-switched') || translationError.message.includes('Synced') ? '⚡' : '⚠️'}
          </span>
          <div style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            <div style={{
              fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem',
              color: translationError.message.includes('Auto-switched') || translationError.message.includes('Synced') ? 'var(--primary-cyan)' : '#fff'
            }}>
              {translationError.provider.endsWith('Notice') || translationError.provider.endsWith('Error') || translationError.provider.endsWith('Guard') ? translationError.provider : `${translationError.provider} Notice`}
            </div>
            <div style={{ fontWeight: 400, opacity: 0.95, fontSize: '0.8rem', lineHeight: '1.45', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {translationError.message}
            </div>
          </div>
          <button onClick={() => setTranslationError(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '0.25rem', flexShrink: 0, opacity: 0.85 }}>✕</button>
        </div>
      )}

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
        appTheme={appTheme}
        onToggleAppTheme={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
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
              onDeleteChapter={handleDeleteChapter}
              onRunEntityScan={handleRunEntityScan}
              onRunSelfHealing={handleRunSelfHealingPass}
              onOpenCharacterGraph={() => setIsCharacterGraphOpen(true)}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onOpenAISettings={() => setIsAISettingsOpen(true)}
              onSyncSupabaseCloud={handleSyncSupabaseCloud}
              onOpenDictionaryModal={() => setIsDictionaryOpen(true)}
              onOpenAITrainingModal={() => setIsAITrainingOpen(true)}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
              translationStyle={translationStyle}
              onSelectTranslationStyle={setTranslationStyle}
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
              onPolishProse={handlePolishProse}
              onOpenDictionaryModal={() => setIsDictionaryOpen(true)}
              translationStyle={translationStyle}
            />

            {/* 2-Tier Glossary Sidebar */}
            {isSidebarOpen && (
              <GlossarySidebar
                glossary={glossary}
                novelId={selectedNovelId}
                onSaveEntry={(entry) => {
                  const updated = StorageService.saveGlossaryEntry(entry);
                  setGlossary(updated);
                  cascadeTermReplacement(selectedNovelId, entry.originalZh, '', entry.translatedEn);
                  setChapters(StorageService.getChapters(selectedNovelId));
                  setHealingRecords(StorageService.getHealingRecords());
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

      {/* Modals */}
      {isLibraryOpen && (
        <NovelLibrary
          novels={novels}
          onSelectNovel={(id) => {
            handleSelectNovel(id);
            setIsLibraryOpen(false);
          }}
          onCreateNovel={(newNovel) => {
            const novel: Novel = {
              ...newNovel,
              id: `novel-${Date.now()}`,
              chaptersCount: 0,
              translatedCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            const updated = StorageService.saveNovel(novel);
            setNovels(updated);
            setSelectedNovelId(novel.id);
            setIsLibraryOpen(false);
          }}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}

      {isEntityScanOpen && (
        <EntityExtractorModal
          entities={extractedEntities}
          onConfirmAndTranslate={handleAcceptExtractedEntities}
          onClose={() => setIsEntityScanOpen(false)}
        />
      )}

      {isCharacterGraphOpen && (
        <CharacterGraphModal
          glossary={glossary}
          novelTitle={currentNovel?.titleEn || 'Novel'}
          onClose={() => setIsCharacterGraphOpen(false)}
        />
      )}

      {isGovernanceOpen && (
        <GovernanceModal
          recommendations={recommendations}
          suggestions={suggestions}
          onApproveRecommendation={(rec) => {
            StorageService.updateRecommendationStatus(rec.id, 'accepted');
            handleSaveGlossaryEntry({
              originalZh: rec.originalZh,
              translatedEn: rec.suggestedEn,
              category: rec.category,
              notes: rec.reason
            });
            setRecommendations(StorageService.getAIRecommendations(selectedNovelId));
          }}
          onRejectRecommendation={(id) => {
            StorageService.updateRecommendationStatus(id, 'rejected');
            setRecommendations(StorageService.getAIRecommendations(selectedNovelId));
          }}
          onApproveSuggestion={(sug) => {
            StorageService.updateSuggestionStatus(sug.id, 'approved');
            handleSaveGlossaryEntry({
              originalZh: sug.originalZh,
              translatedEn: sug.suggestedEn,
              notes: `Reader suggestion approved: ${sug.reason}`
            });
            setSuggestions(StorageService.getReaderSuggestions(selectedNovelId));
          }}
          onRejectSuggestion={(id) => {
            StorageService.updateSuggestionStatus(id, 'rejected');
            setSuggestions(StorageService.getReaderSuggestions(selectedNovelId));
          }}
          onClose={() => setIsGovernanceOpen(false)}
        />
      )}

      {isExportOpen && currentNovel && (
        <ExportModal
          novel={currentNovel}
          chapters={chapters}
          glossary={glossary}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {isAISettingsOpen && (
        <AISettingsModal
          onClose={() => setIsAISettingsOpen(false)}
        />
      )}

      {isBatchModalOpen && currentNovel && (
        <BatchTranslateModal
          novel={currentNovel}
          chapters={chapters}
          glossary={glossary}
          onClose={() => setIsBatchModalOpen(false)}
          onBatchComplete={() => {
            setChapters(StorageService.getChapters(selectedNovelId));
          }}
        />
      )}

      {/* Master Chinese-English Dictionary & Pinyin Lookup Modal */}
      <DictionaryLookupModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        onAddTermToGlossary={handleSaveGlossaryEntry}
        existingGlossary={glossary}
      />

      {/* AI Parallel Corpus Trainer & Style Learner Modal */}
      <AITrainingModal
        isOpen={isAITrainingOpen}
        onClose={() => setIsAITrainingOpen(false)}
        onAddGlossaryTerm={handleSaveGlossaryEntry}
      />

      {/* New Chapter Import & Paste Modal */}
      {isNewChapterOpen && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} className="accent-text" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  Paste & Import Raw Chinese Chapter
                </h3>
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

                {newChapContentZh.trim() && (() => {
                  const cleanedStats = smartCleanWebNovelText(newChapContentZh);
                  const pCount = cleanedStats.contentZh.split('\n').filter(Boolean).length;
                  return (
                    <div style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--primary-cyan)', fontWeight: 600 }}>
                        ✨ Smart Cleaned: {cleanedStats.strippedLinesCount} Noise Lines Stripped | Title: {cleanedStats.chapterTitle}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                        {pCount} Story Paragraphs Preserved
                      </span>
                    </div>
                  );
                })()}

                <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                      ⚙️ Custom Site Noise Rules
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 500 }}>
                      {customRules.length} Custom Rules Active
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Type keyword/domain to strip (e.g. www.mysite.com)..."
                      value={newRuleInput}
                      onChange={(e) => setNewRuleInput(e.target.value)}
                      style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => {
                        if (newRuleInput.trim()) {
                          const updated = addCustomNoiseRule(newRuleInput.trim());
                          setCustomRules(updated);
                          setNewRuleInput('');
                        }
                      }}
                    >
                      + Add Rule
                    </button>
                  </div>
                  {customRules.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {customRules.map((rule, rIdx) => (
                        <span key={rIdx} className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', color: '#fff', gap: '0.3rem', padding: '0.15rem 0.45rem' }}>
                          {rule}
                          <span style={{ cursor: 'pointer', color: 'var(--accent-red)', fontWeight: 'bold', marginLeft: '0.2rem' }} onClick={() => {
                            const updated = removeCustomNoiseRule(rule);
                            setCustomRules(updated);
                          }}>✕</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  ✦ Automatically extracts title, strips website headers/footers, removes JJWXC comment numbers, and launches AI translation!
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

export default App;
