import React, { useState, useEffect, useRef } from 'react';
import type { Novel, Chapter, GlossaryEntry, SelfHealingRecord, AIRecommendation, ReaderSuggestion, Bookmark, UserProfile } from './types';
import { StorageService } from './services/storage';
import { AuthService } from './services/authService';
import { cascadeTermReplacement } from './services/translationEngine';
import { SupabaseService } from './services/supabaseService';

import { Navbar } from './components/Navbar';
import { NovelLibrary } from './components/NovelLibrary';
import { StudioHeader } from './components/StudioHeader';
import { DualPaneStudio } from './components/DualPaneStudio';
import { GlossarySidebar } from './components/GlossarySidebar';
import { CharacterGraphModal } from './components/CharacterGraphModal';
import { GovernanceModal } from './components/GovernanceModal';
import { ExportModal } from './components/ExportModal';
import { PublicReaderView, type ReaderTheme } from './components/PublicReaderView';
import { BookmarksModal } from './components/BookmarksModal';
import { AuthModal } from './components/AuthModal';
import { ChapterUploaderModal } from './components/ChapterUploaderModal';
import { NovelHomepage } from './components/NovelHomepage';
import { getStarterGlossaryForGenre } from './services/genrePresets';
import { parseCurrentRoute, buildChapterUrl, buildStudioUrl, findNovelBySlug, slugify } from './services/routeHelper';

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

  // User & Bookmarks States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(AuthService.getCurrentUser());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // View Mode ('home' | 'reader' | 'admin') - URL path & query driven
  const [viewMode, setViewMode] = useState<'home' | 'reader' | 'admin'>(() => {
    try {
      localStorage.removeItem('trans_me_view_mode');
      if (typeof window !== 'undefined') {
        const route = parseCurrentRoute(window.location.pathname, window.location.search);
        return route.viewMode;
      }
    } catch {
      // Ignore
    }
    return 'home';
  });

  // App Theme State ('dark' | 'light') - Persisted in LocalStorage, default to saved or system preference
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('trans_me_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('trans_me_theme', appTheme);
    } catch {
      // Ignore
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (appTheme === 'light') {
      document.body.classList.add('light-mode');
      document.documentElement.classList.add('light-mode');
      document.documentElement.setAttribute('data-theme', 'light');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
    } else {
      document.body.classList.remove('light-mode');
      document.documentElement.classList.remove('light-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
      if (metaTheme) metaTheme.setAttribute('content', '#090d16');
    }
  }, [appTheme]);

  // Reader Theme State ('light' | 'sepia' | 'dark' | 'oled') - Persisted in LocalStorage
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>(() => {
    try {
      const saved = localStorage.getItem('trans_me_reader_theme');
      if (saved === 'light' || saved === 'sepia' || saved === 'dark' || saved === 'oled') {
        return saved as ReaderTheme;
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  const handleReaderThemeChange = (newTheme: ReaderTheme) => {
    setReaderTheme(newTheme);
    try {
      localStorage.setItem('trans_me_reader_theme', newTheme);
    } catch {
      // Ignore
    }
    if (newTheme === 'dark' || newTheme === 'oled') {
      setAppTheme('dark');
    } else {
      setAppTheme('light');
    }
  };

  // Prevent iPadOS virtual keyboard dismissal offset & white gap artifact
  useEffect(() => {
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        }, 60);
      }
    };
    window.addEventListener('focusout', handleFocusOut);
    return () => window.removeEventListener('focusout', handleFocusOut);
  }, []);

  // Modals State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCharacterGraphOpen, setIsCharacterGraphOpen] = useState(false);
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'reader' | 'creator'>('reader');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  // Refs to track active novel and chapter IDs for realtime callbacks & initial sync
  const selectedNovelIdRef = useRef(selectedNovelId);
  const selectedChapterIdRef = useRef(selectedChapterId);
  useEffect(() => {
    selectedNovelIdRef.current = selectedNovelId;
    selectedChapterIdRef.current = selectedChapterId;
  }, [selectedNovelId, selectedChapterId]);

  // Initial Data Load
  useEffect(() => {
    // 1. Load local offline cache
    const loadedNovels = StorageService.getNovels();
    setNovels(loadedNovels);
    setBookmarks(StorageService.getBookmarks());
    setCurrentUser(AuthService.getCurrentUser());

    if (loadedNovels.length > 0) {
      const savedNovelId = localStorage.getItem('trans_me_last_novel');
      const initialNovel = loadedNovels.find(n => n.id === savedNovelId) || loadedNovels[0];
      const initialNovelId = initialNovel.id;
      setSelectedNovelId(initialNovelId);

      const chaps = StorageService.getChapters(initialNovelId);
      setChapters(chaps);
      if (chaps.length > 0) {
        const savedChapId = localStorage.getItem(`trans_me_active_chapter_${initialNovelId}`);
        const matched = chaps.find(c => c.id === savedChapId);
        setSelectedChapterId(matched ? matched.id : chaps[0].id);
      }

      setGlossary(StorageService.getGlossary(initialNovelId));
      setHealingRecords(StorageService.getHealingRecords());
      setRecommendations(StorageService.getAIRecommendations(initialNovelId));
      setSuggestions(StorageService.getReaderSuggestions(initialNovelId));
    }

    // 2. Auth state change listener
    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile | null>;
      setCurrentUser(customEvent.detail);
    };
    window.addEventListener('auth-changed', handleAuthChange);

    // 3. Supabase Cloud Sync: Fetch novels and all cloud chapters
    SupabaseService.fetchNovels().then((cloudNovels) => {
      if (cloudNovels && Array.isArray(cloudNovels) && cloudNovels.length > 0) {
        setNovels(cloudNovels);
        const currentId = selectedNovelIdRef.current || cloudNovels[0].id;
        const targetId = cloudNovels.some(n => n.id === currentId) ? currentId : cloudNovels[0].id;
        setSelectedNovelId(targetId);

        // Fetch all chapters across all novels in one quick batch to populate local cache
        SupabaseService.fetchAllChapters().then((allCloudChaps) => {
          const novelChaps = allCloudChaps.filter(c => c.novelId === targetId);
          if (novelChaps.length > 0) {
            setChapters(novelChaps);
            const savedChapId = localStorage.getItem(`trans_me_active_chapter_${targetId}`);
            const currentOrSavedId = selectedChapterIdRef.current || savedChapId;
            const matched = novelChaps.find(c => c.id === currentOrSavedId);
            setSelectedChapterId(matched ? matched.id : novelChaps[0].id);
          } else {
            SupabaseService.fetchChapters(targetId).then((cloudChaps) => {
              if (cloudChaps && cloudChaps.length > 0) {
                setChapters(cloudChaps);
                const savedChapId = localStorage.getItem(`trans_me_active_chapter_${targetId}`);
                const currentOrSavedId = selectedChapterIdRef.current || savedChapId;
                const matched = cloudChaps.find(c => c.id === currentOrSavedId);
                setSelectedChapterId(matched ? matched.id : cloudChaps[0].id);
              }
            });
          }
        });
      }
    });

    const unsubscribe = SupabaseService.subscribeToChanges(() => {
      SupabaseService.fetchNovels().then((refreshedNovels) => {
        if (refreshedNovels && refreshedNovels.length > 0) setNovels(refreshedNovels);
      });
      const activeId = selectedNovelIdRef.current;
      if (activeId) {
        SupabaseService.fetchChapters(activeId).then((refreshedChaps) => {
          if (refreshedChaps) setChapters(refreshedChaps);
        });
      }
    });

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      unsubscribe();
    };
  }, []);

  // Save active novel & chapter reading progress
  useEffect(() => {
    if (selectedNovelId && selectedChapterId) {
      try {
        localStorage.setItem(`trans_me_active_chapter_${selectedNovelId}`, selectedChapterId);
        localStorage.setItem('trans_me_last_novel', selectedNovelId);
      } catch {
        // Ignore
      }
    }
  }, [selectedNovelId, selectedChapterId]);

  // Sync state when novel changes
  const handleSelectNovel = (novelId: string) => {
    setSelectedNovelId(novelId);
    try {
      localStorage.setItem('trans_me_last_novel', novelId);
    } catch {
      // Ignore
    }
    const localChaps = StorageService.getChapters(novelId);
    setChapters(localChaps);
    if (localChaps.length > 0) {
      const savedChapId = localStorage.getItem(`trans_me_active_chapter_${novelId}`);
      const matched = localChaps.find(c => c.id === savedChapId);
      setSelectedChapterId(matched ? matched.id : localChaps[0].id);
    } else {
      setSelectedChapterId('');
    }

    // Always fetch fresh chapters for the selected novel from Supabase Cloud
    SupabaseService.fetchChapters(novelId).then((cloudChaps) => {
      if (cloudChaps && cloudChaps.length > 0) {
        setChapters(cloudChaps);
        const savedChapId = localStorage.getItem(`trans_me_active_chapter_${novelId}`);
        const currentOrSavedId = selectedChapterIdRef.current || savedChapId;
        const matched = cloudChaps.find(c => c.id === currentOrSavedId);
        setSelectedChapterId(matched ? matched.id : cloudChaps[0].id);
      }
    });

    setGlossary(StorageService.getGlossary(novelId));
    setRecommendations(StorageService.getAIRecommendations(novelId));
    setSuggestions(StorageService.getReaderSuggestions(novelId));
  };

  const currentNovel = novels.find(n => n.id === selectedNovelId) || null;
  const currentChapter = chapters.find(c => c.id === selectedChapterId) || null;

  // Sync URL and Document Title dynamically based on current novel & chapter
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (viewMode === 'reader' && currentNovel && currentChapter) {
      // 1. Chapter Title: e.g. "Chapter 1 - Daily Life of Imperial Examinations | TranslateMe"
      const chapTitle = currentChapter.titleEn || `Chapter ${currentChapter.chapterNumber}`;
      const novelTitle = currentNovel.titleEn || currentNovel.titleZh;
      document.title = `${chapTitle} - ${novelTitle} | TranslateMe`;

      // 2. URL Path: /novel/daily-life-of-imperial-examinations/chapter-1
      const targetUrl = buildChapterUrl(currentNovel, currentChapter.chapterNumber);
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState({}, '', targetUrl);
      }
    } else if (viewMode === 'reader' && currentNovel) {
      const novelTitle = currentNovel.titleEn || currentNovel.titleZh;
      document.title = `${novelTitle} | TranslateMe`;
      const targetUrl = `/novel/${slugify(novelTitle)}`;
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState({}, '', targetUrl);
      }
    } else if (viewMode === 'admin' && currentNovel) {
      const novelTitle = currentNovel.titleEn || currentNovel.titleZh;
      document.title = `Creator Studio - ${novelTitle} | TranslateMe`;
      const targetUrl = buildStudioUrl(currentNovel);
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState({}, '', targetUrl);
      }
    } else if (viewMode === 'admin') {
      document.title = 'Creator Studio | TranslateMe';
      if (window.location.pathname !== '/studio') {
        window.history.replaceState({}, '', '/studio');
      }
    } else {
      // Homepage
      document.title = 'TranslateMe - Chinese Web Novel Translation & Reader';
      if (window.location.pathname !== '/' || window.location.search) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, [viewMode, currentNovel, currentChapter]);

  // Deep-link initial route resolution & browser popstate (back/forward) listener
  useEffect(() => {
    if (typeof window === 'undefined' || novels.length === 0) return;

    const resolveRoute = () => {
      const route = parseCurrentRoute(window.location.pathname, window.location.search);
      if (route.viewMode) {
        setViewMode(route.viewMode);
      }
      if (route.novelSlug) {
        const matchedNovel = findNovelBySlug(novels, route.novelSlug);
        if (matchedNovel) {
          setSelectedNovelId(matchedNovel.id);
          const chaps = StorageService.getChapters(matchedNovel.id);
          if (chaps.length > 0) {
            setChapters(chaps);
            if (route.chapterNumber) {
              const matchedCh = chaps.find(c => c.chapterNumber === route.chapterNumber);
              if (matchedCh) setSelectedChapterId(matchedCh.id);
            }
          } else {
            SupabaseService.fetchChapters(matchedNovel.id).then((cloudChaps) => {
              if (cloudChaps && cloudChaps.length > 0) {
                setChapters(cloudChaps);
                if (route.chapterNumber) {
                  const matchedCh = cloudChaps.find(c => c.chapterNumber === route.chapterNumber);
                  if (matchedCh) setSelectedChapterId(matchedCh.id);
                }
              }
            });
          }
        }
      }
    };

    resolveRoute();
    window.addEventListener('popstate', resolveRoute);
    return () => window.removeEventListener('popstate', resolveRoute);
  }, [novels]);

  // Active pending suggestions count
  const pendingGovCount = recommendations.filter(r => r.status === 'pending').length +
                          suggestions.filter(s => s.status === 'pending').length;

  // Check if current novel/chapter is bookmarked
  const isCurrentBookmarked = Boolean(
    currentNovel && bookmarks.some(b => b.novelId === currentNovel.id && b.chapterId === selectedChapterId)
  );

  // Toggle Bookmark Handler
  const handleToggleBookmark = () => {
    if (!currentNovel || !currentChapter) return;

    const existing = bookmarks.find(b => b.novelId === currentNovel.id);
    if (existing && existing.chapterId === currentChapter.id) {
      const updated = StorageService.removeBookmark(currentNovel.id);
      setBookmarks(updated);
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        novelId: currentNovel.id,
        novelTitle: currentNovel.titleEn || currentNovel.titleZh,
        novelCoverGradient: currentNovel.coverGradient,
        chapterId: currentChapter.id,
        chapterNumber: currentChapter.chapterNumber || 1,
        chapterTitle: currentChapter.titleEn || `Chapter ${currentChapter.chapterNumber || 1}`,
        updatedAt: new Date().toISOString()
      };
      const updated = StorageService.saveBookmark(newBm);
      setBookmarks(updated);
    }
  };

  // Jump from Bookmark to Chapter
  const handleSelectBookmark = (novelId: string, chapterId: string) => {
    handleSelectNovel(novelId);
    setSelectedChapterId(chapterId);
    setViewMode('reader');
  };

  // Remove Bookmark
  const handleRemoveBookmark = (novelId: string) => {
    const updated = StorageService.removeBookmark(novelId);
    setBookmarks(updated);
  };


  // Open Uploader guarded by Admin authentication
  const handleOpenUploader = () => {
    if (currentUser?.role !== 'creator') {
      setAuthDefaultTab('creator');
      setIsAuthOpen(true);
      return;
    }
    setIsUploaderOpen(true);
  };

  // Upload Single Chapter
  const handleUploadSingleChapter = (novelId: string, chapterData: Omit<Chapter, 'id' | 'updatedAt' | 'extractedTermsCount' | 'selfHealedCount'>) => {
    if (currentUser?.role !== 'creator') {
      setAuthDefaultTab('creator');
      setIsAuthOpen(true);
      return;
    }
    const newChapter: Chapter = {
      ...chapterData,
      id: `chap-${novelId}-${Date.now()}`,
      extractedTermsCount: 0,
      selfHealedCount: 0,
      updatedAt: new Date().toISOString()
    };

    StorageService.saveChapter(newChapter);
    const updatedChapters = StorageService.getChapters(novelId);
    setChapters(updatedChapters);
    setSelectedChapterId(newChapter.id);
    setNovels(StorageService.getNovels());
  };

  // Upload Bulk Chapters
  const handleUploadBulkChapters = (novelId: string, bulkList: Omit<Chapter, 'id' | 'updatedAt' | 'extractedTermsCount' | 'selfHealedCount'>[]) => {
    if (currentUser?.role !== 'creator') {
      setAuthDefaultTab('creator');
      setIsAuthOpen(true);
      return;
    }
    for (let i = 0; i < bulkList.length; i++) {
      const item = bulkList[i];
      const newChapter: Chapter = {
        ...item,
        id: `chap-${novelId}-${Date.now()}-${i}`,
        extractedTermsCount: 0,
        selfHealedCount: 0,
        updatedAt: new Date().toISOString()
      };
      StorageService.saveChapter(newChapter);
    }

    const updatedChapters = StorageService.getChapters(novelId);
    setChapters(updatedChapters);
    if (updatedChapters.length > 0) {
      setSelectedChapterId(updatedChapters[updatedChapters.length - 1].id);
    }
    setNovels(StorageService.getNovels());
  };

  // Save / update Glossary Entry
  const handleSaveGlossaryEntry = (entry: Partial<GlossaryEntry>) => {
    const termEn = entry.translatedEn?.trim() || '';
    const rawZh = entry.originalZh?.trim() || termEn;
    if (!termEn) return;
    const fullEntry: GlossaryEntry = {
      id: entry.id || `g-${selectedNovelId}-${Date.now()}`,
      originalZh: rawZh,
      translatedEn: termEn,
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

    // Trigger cascade replacement
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

    cascadeTermReplacement(selectedNovelId, originalZh, oldEn, newEn);
    setChapters(StorageService.getChapters(selectedNovelId));
    setHealingRecords(StorageService.getHealingRecords());
  };



  // Save manual edits from DualPaneStudio
  const handleSaveChapterContent = (contentZh: string, contentEn: string) => {
    if (currentUser?.role !== 'creator') {
      setAuthDefaultTab('creator');
      setIsAuthOpen(true);
      return;
    }
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

  // Delete chapter permanently
  const handleDeleteChapter = (chapterId: string) => {
    if (currentUser?.role !== 'creator') {
      setAuthDefaultTab('creator');
      setIsAuthOpen(true);
      return;
    }
    StorageService.deleteChapter(chapterId);
    const updatedChaps = StorageService.getChapters(selectedNovelId);
    setChapters(updatedChaps);
    setNovels(StorageService.getNovels());
    if (selectedChapterId === chapterId) {
      setSelectedChapterId(updatedChaps[0]?.id || '');
    }
  };

  // Delete novel permanently
  const handleDeleteNovel = (novelId: string) => {
    if (currentUser?.role !== 'creator') {
      setAuthDefaultTab('creator');
      setIsAuthOpen(true);
      return;
    }
    const updated = StorageService.deleteNovel(novelId);
    setNovels(updated);
    if (selectedNovelId === novelId) {
      if (updated.length > 0) {
        handleSelectNovel(updated[0].id);
      } else {
        setSelectedNovelId('');
        setChapters([]);
        setSelectedChapterId('');
      }
    }
  };

  // Sync with Supabase Cloud
  const handleSyncSupabaseCloud = async () => {
    if (!selectedNovelId) return;
    const result = await SupabaseService.syncAllLocalToCloud(selectedNovelId);
    alert(result.message);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        novels={novels}
        selectedNovelId={selectedNovelId}
        onSelectNovel={handleSelectNovel}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarks.length}
        onOpenGlobalGlossary={() => setIsSidebarOpen(true)}
        onOpenGovernance={() => setIsGovernanceOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenUploader={handleOpenUploader}
        onOpenAuth={(tab = 'reader') => {
          setAuthDefaultTab(tab);
          setIsAuthOpen(true);
        }}
        currentUser={currentUser}
        pendingGovernanceCount={pendingGovCount}
        viewMode={viewMode}
        onChangeViewMode={(mode) => {
          if (mode === 'admin' && currentUser?.role !== 'creator') {
            setAuthDefaultTab('creator');
            setIsAuthOpen(true);
            return;
          }
          setViewMode(mode);
        }}
        appTheme={appTheme}
        activeReaderTheme={viewMode === 'reader' ? readerTheme : undefined}
        onToggleAppTheme={() => {
          if (viewMode === 'reader') {
            if (readerTheme === 'dark' || readerTheme === 'oled') {
              handleReaderThemeChange('light');
            } else {
              handleReaderThemeChange('dark');
            }
          } else {
            setAppTheme(appTheme === 'dark' ? 'light' : 'dark');
          }
        }}
      />

      {/* Main View Router */}
      {viewMode === 'home' || !currentNovel ? (
        /* Dedicated Novel Catalog & Homepage */
        <NovelHomepage
          novels={novels}
          currentUser={currentUser}
          onSelectNovel={handleSelectNovel}
          onStartReading={(novelId, chapterId) => {
            handleSelectNovel(novelId);
            if (chapterId) {
              setSelectedChapterId(chapterId);
            }
            setViewMode('reader');
          }}
          onOpenStudio={(novelId) => {
            handleSelectNovel(novelId);
            if (currentUser?.role !== 'creator') {
              setAuthDefaultTab('creator');
              setIsAuthOpen(true);
            } else {
              setViewMode('admin');
            }
          }}
          onOpenUploader={handleOpenUploader}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          bookmarks={bookmarks}
        />
      ) : viewMode === 'reader' ? (
        /* Public Reader Experience */
        <PublicReaderView
          currentNovel={currentNovel}
          chapters={chapters}
          currentChapter={currentChapter}
          glossary={glossary}
          onSelectChapter={setSelectedChapterId}
          onOpenAdminMode={() => {
            if (currentUser?.role !== 'creator') {
              setAuthDefaultTab('creator');
              setIsAuthOpen(true);
            } else {
              setViewMode('admin');
            }
          }}
          onNavigateHome={() => setViewMode('home')}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={isCurrentBookmarked}
          readerTheme={readerTheme}
          onThemeChange={handleReaderThemeChange}
        />
      ) : (
        /* Creator / Uploader Studio */
        <>
          <StudioHeader
            currentNovel={currentNovel}
            chapters={chapters}
            currentChapter={currentChapter}
            onSelectChapter={setSelectedChapterId}
            onOpenUploader={handleOpenUploader}
            onDeleteChapter={handleDeleteChapter}
            onOpenCharacterGraph={() => setIsCharacterGraphOpen(true)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onSyncSupabaseCloud={handleSyncSupabaseCloud}
            isSidebarOpen={isSidebarOpen}
            glossaryCount={glossary.length}
          />

          <main className="main-view">
            <DualPaneStudio
              chapter={currentChapter}
              glossary={glossary}
              healingRecords={healingRecords}
              onSaveContent={handleSaveChapterContent}
              onQuickUpdateGlossary={handleQuickUpdateGlossary}
            />

            {/* Glossary Sidebar */}
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

      {/* Novel Library Modal */}
      {isLibraryOpen && (
        <NovelLibrary
          novels={novels}
          currentUser={currentUser}
          onSelectNovel={(id) => {
            handleSelectNovel(id);
            setIsLibraryOpen(false);
          }}
          onCreateNovel={(newNovel, seedStarterGlossary) => {
            if (currentUser?.role !== 'creator') {
              setAuthDefaultTab('creator');
              setIsAuthOpen(true);
              return;
            }
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

            if (seedStarterGlossary) {
              const starterTerms = getStarterGlossaryForGenre(novel.genre);
              for (const term of starterTerms) {
                StorageService.saveGlossaryEntry({
                  id: `g-${novel.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  originalZh: term.originalZh,
                  translatedEn: term.translatedEn,
                  category: term.category,
                  scope: 'local',
                  notes: term.notes || `Starter preset for ${novel.genre}`,
                  occurrences: 1,
                  updatedAt: new Date().toISOString()
                });
              }
            }

            handleSelectNovel(novel.id);
            setIsLibraryOpen(false);
          }}
          onUpdateNovel={(updatedNovel) => {
            if (currentUser?.role !== 'creator') {
              setAuthDefaultTab('creator');
              setIsAuthOpen(true);
              return;
            }
            const updated = StorageService.saveNovel(updatedNovel);
            setNovels(updated);
          }}
          onDeleteNovel={handleDeleteNovel}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}

      {/* Chapter Uploader Modal */}
      {isUploaderOpen && currentUser?.role === 'creator' && (
        <ChapterUploaderModal
          novels={novels}
          selectedNovelId={selectedNovelId}
          existingChapters={chapters}
          onUploadSingleChapter={handleUploadSingleChapter}
          onUploadBulkChapters={handleUploadBulkChapters}
          onClose={() => setIsUploaderOpen(false)}
        />
      )}

      {/* Bookmarks Modal */}
      {isBookmarksOpen && (
        <BookmarksModal
          bookmarks={bookmarks}
          onSelectBookmark={handleSelectBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onClose={() => setIsBookmarksOpen(false)}
          onOpenLibrary={() => {
            setIsBookmarksOpen(false);
            setIsLibraryOpen(true);
          }}
        />
      )}

      {/* Auth / Creator Access Modal */}
      {isAuthOpen && (
        <AuthModal
          currentUser={currentUser}
          defaultTab={authDefaultTab}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'creator') {
              setViewMode('admin');
            }
          }}
          onSignOut={() => {
            AuthService.signOut();
            setCurrentUser(null);
            setViewMode('reader');
          }}
        />
      )}



      {/* Character Graph Modal */}
      {isCharacterGraphOpen && (
        <CharacterGraphModal
          glossary={glossary}
          novelTitle={currentNovel?.titleEn || 'Novel'}
          onClose={() => setIsCharacterGraphOpen(false)}
        />
      )}

      {/* Governance Modal */}
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

      {/* Export Modal */}
      {isExportOpen && currentNovel && (
        <ExportModal
          novel={currentNovel}
          chapters={chapters}
          glossary={glossary}
          onClose={() => setIsExportOpen(false)}
        />
      )}

    </div>
  );
};

export default App;
