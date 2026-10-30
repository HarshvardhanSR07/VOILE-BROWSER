import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { applyChameleonShield } from '../services/chameleonShield';
import { scanForSecrets, SecretFinding } from '../services/secretScanner';
import { generateMascotResponse } from '../services/aiMascotService';
import { 
  Tab, 
  Shortcut, 
  Bookmark, 
  BookmarkFolder, 
  HistoryItem, 
  DownloadItem, 
  PrivacyStats, 
  AdaLMessage, 
  ActiveView,
  SearchEngineType,
  SearchEngineOption,
  GoogleUser
} from '../types/browser';

export interface AdBlockStats {
  isEnabled: boolean;
  blockedCount: number;
  rulesCount: number;
  lastUpdated: string | null;
  exceptions: string[];
  isUpdating: boolean;
}

export const SEARCH_ENGINES: Record<SearchEngineType, SearchEngineOption> = {
  DuckDuckGo: {
    id: 'DuckDuckGo',
    name: 'DuckDuckGo',
    url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    homeUrl: 'https://duckduckgo.com',
    description: 'Private search, instant answers, zero tracking',
    privacy: 'High'
  },
  Google: {
    id: 'Google',
    name: 'Google',
    url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    homeUrl: 'https://www.google.com',
    description: 'World-leading comprehensive search index',
    privacy: 'Medium'
  },
  Brave: {
    id: 'Brave',
    name: 'Brave Search',
    url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
    homeUrl: 'https://search.brave.com',
    description: 'Independent privacy-focused web index',
    privacy: 'High'
  },
  Startpage: {
    id: 'Startpage',
    name: 'Startpage',
    url: (q) => `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
    homeUrl: 'https://www.startpage.com',
    description: 'Google results delivered without tracking',
    privacy: 'High'
  },
  Ecosia: {
    id: 'Ecosia',
    name: 'Ecosia',
    url: (q) => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}`,
    homeUrl: 'https://www.ecosia.org',
    description: 'Eco-friendly search engine that plants trees',
    privacy: 'High'
  }
};

interface BrowserContextType {
  // Tabs
  tabs: Tab[];
  activeTabId: string;
  activeTab: Tab;
  closedTabs: Tab[];
  openNewTab: (url?: string, title?: string, isPrivate?: boolean, isPinned?: boolean) => void;
  closeTab: (id: string) => void;
  reopenLastClosedTab: () => void;
  selectTab: (id: string) => void;
  selectNextTab: () => void;
  selectPreviousTab: () => void;
  selectTabByIndex: (index: number) => void;
  selectLastTab: () => void;
  reorderTabs: (sourceId: string, targetId: string) => void;
  navigateTab: (url: string, title?: string) => void;
  duplicateTab: (id: string) => void;
  togglePinTab: (id: string) => void;
  discardTab: (id: string) => void;
  restoreTab: (id: string) => void;
  updateTabState: (id: string, updates: Partial<Tab>) => void;
  goBack: () => void;
  goForward: () => void;
  reloadTab: () => void;

  // Zoom State & Actions
  zoomFactor: number;
  zoomHUDText: string | null;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Find In Page
  isFindInPageOpen: boolean;
  setIsFindInPageOpen: (open: boolean) => void;

  // Active view
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Bookmarks
  bookmarks: Bookmark[];
  bookmarkFolders: BookmarkFolder[];
  bookmarksBarVisible: boolean;
  toggleBookmarksBar: () => void;
  addBookmark: (title: string, url: string, folderId?: string) => Bookmark;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (url: string) => boolean;
  addBookmarkFolder: (title: string) => BookmarkFolder;
  renameBookmarkFolder: (id: string, newTitle: string) => void;
  deleteBookmarkFolder: (id: string) => void;
  reorderBookmarks: (sourceId: string, targetId: string, targetFolderId?: string) => void;
  isBookmarkPopoverOpen: boolean;
  setIsBookmarkPopoverOpen: (open: boolean) => void;

  // Shortcuts
  shortcuts: Shortcut[];
  addShortcut: (title: string, url: string, iconBg?: string) => void;
  removeShortcut: (id: string) => void;

  // History & Downloads
  history: HistoryItem[];
  clearHistory: () => void;
  downloads: DownloadItem[];

  // Shields & Privacy
  shieldsEnabled: boolean;
  setShieldsEnabled: (enabled: boolean) => void;
  toggleShields: () => void;
  privacyStats: PrivacyStats;
  shieldsPopoverOpen: boolean;
  setShieldsPopoverOpen: (open: boolean) => void;

  // Centralized AdBlock Engine Stats & Controls
  adBlockStats: AdBlockStats;
  addAdBlockException: (domain: string) => Promise<void>;
  removeAdBlockException: (domain: string) => Promise<void>;
  updateAdBlockFilters: () => Promise<boolean>;

  // Omni Chameleon & Secure Transfer Integrations
  chameleonEnabled: boolean;
  toggleChameleon: () => void;
  secretScannerEnabled: boolean;
  toggleSecretScanner: () => void;
  secretsInterceptedCount: number;
  incrementSecretsIntercepted: () => void;

  // AdaL AI
  isAdaLOpen: boolean;
  isAdaLExpanded: boolean;
  toggleAdaL: () => void;
  toggleAdaLExpand: () => void;
  adaLMessages: AdaLMessage[];
  sendAdaLMessage: (prompt: string) => void;
  runAdaLAction: (actionTitle: string) => void;
  isAdaLTyping: boolean;

  // Modals
  isAddShortcutModalOpen: boolean;
  setIsAddShortcutModalOpen: (open: boolean) => void;
  isAddBookmarkModalOpen: boolean;
  setIsAddBookmarkModalOpen: (open: boolean) => void;
  isClearHistoryModalOpen: boolean;
  setIsClearHistoryModalOpen: (open: boolean) => void;

  // Search Engine
  searchEngine: SearchEngineType;
  setSearchEngine: (engine: SearchEngineType) => void;

  // Sidebar Position & Visibility
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  sidebarPosition: 'left' | 'right';
  setSidebarPosition: (pos: 'left' | 'right') => void;

  // Voile Identity Bridge Authentication (RFC 8252 + PKCE)
  googleUser: GoogleUser | null;
  googleAuthStatus: 'idle' | 'pending' | 'success' | 'cancelled' | 'error' | 'network_error' | 'config_error';
  googleAuthError: string | null;
  startGoogleAuth: (options?: { isMock?: boolean; clientId?: string; useSystemBrowser?: boolean }) => Promise<void>;
  startEmailAuth: (email: string, name?: string) => Promise<void>;
  continueAsGuest: () => void;
  cancelGoogleAuth: () => void;
  logoutGoogle: () => void;
}

const defaultShortcuts: Shortcut[] = [
  { id: '1', title: 'YouTube', url: 'https://youtube.com', iconName: 'Youtube', iconBg: 'bg-red-500/20 text-red-400' },
  { id: '2', title: 'GitHub', url: 'https://github.com', iconName: 'Github', iconBg: 'bg-slate-700/40 text-slate-200' },
  { id: '3', title: 'Notion', url: 'https://notion.so', iconName: 'FileText', iconBg: 'bg-amber-500/20 text-amber-300' },
  { id: '4', title: 'Reddit', url: 'https://reddit.com', iconName: 'MessageSquare', iconBg: 'bg-orange-500/20 text-orange-400' },
  { id: '5', title: 'Wikipedia', url: 'https://wikipedia.org', iconName: 'Globe', iconBg: 'bg-blue-500/20 text-blue-400' },
];

const defaultFolders: BookmarkFolder[] = [
  { id: 'f1', title: 'Privacy Tools' },
  { id: 'f2', title: 'Research' },
];

const defaultBookmarks: Bookmark[] = [
  { id: 'b1', title: 'Proton Mail', url: 'https://mail.proton.me', folderId: 'f1', createdAt: Date.now() - 500000 },
  { id: 'b2', title: 'CryptPad', url: 'https://cryptpad.fr', folderId: 'f1', createdAt: Date.now() - 400000 },
  { id: 'b3', title: 'DuckDuckGo', url: 'https://duckduckgo.com', folderId: 'f1', createdAt: Date.now() - 300000 },
  { id: 'b4', title: 'DuckDuckGo Search', url: 'https://duckduckgo.com', createdAt: Date.now() - 250000 },
  { id: 'b5', title: 'GitHub: Chromium Source', url: 'https://github.com/chromium/chromium', folderId: 'f2', createdAt: Date.now() - 200000 },
  { id: 'b6', title: 'Brave Browser Core', url: 'https://github.com/brave/brave-browser', folderId: 'f2', createdAt: Date.now() - 100000 },
];

const defaultHistory: HistoryItem[] = [
  { id: 'h1', title: 'Voile: Privacy-First AI Architecture', url: 'voile://workspace', visitedAt: Date.now() - 120000, visitCount: 5 },
  { id: 'h2', title: 'Proton Mail: Encrypted Communication', url: 'https://mail.proton.me', visitedAt: Date.now() - 360000, visitCount: 2 },
  { id: 'h3', title: 'CryptPad: Zero Knowledge Collaborative Suite', url: 'https://cryptpad.fr', visitedAt: Date.now() - 900000, visitCount: 3 },
  { id: 'h4', title: 'Electronic Frontier Foundation (EFF)', url: 'https://eff.org', visitedAt: Date.now() - 1800000, visitCount: 1 },
];

const defaultDownloads: DownloadItem[] = [
  { id: 'd1', filename: 'voile_security_audit_report.pdf', size: '2.4 MB', progress: 100, status: 'completed', url: 'https://voile.browser/audit.pdf', completedAt: 'Today, 14:22' },
  { id: 'd2', filename: 'firefox-source-patch-v1.diff', size: '184 KB', progress: 100, status: 'completed', url: 'https://voile.browser/patches/v1.diff', completedAt: 'Yesterday' },
];

const initialAdaLMessages: AdaLMessage[] = [
  {
    id: 'msg-1',
    sender: 'adal',
    text: "Hi! I'm AdaL, your built-in privacy companion. How can I assist your browsing session today?",
    timestamp: 'Just now'
  }
];

const BrowserContext = createContext<BrowserContextType | undefined>(undefined);

export const BrowserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: 'voile://newtab',
      isLoading: false,
      isPrivate: false,
      history: ['voile://newtab'],
      historyIndex: 0,
      lastActiveAt: Date.now(),
      lifecycleState: 'active'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [closedTabs, setClosedTabs] = useState<Tab[]>([]);

  // Zoom and Find in Page states
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);
  const [zoomHUDText, setZoomHUDText] = useState<string | null>(null);
  const zoomTimeoutRef = useRef<any>(null);
  const [isFindInPageOpen, setIsFindInPageOpen] = useState<boolean>(false);
  const [isBookmarkPopoverOpen, setIsBookmarkPopoverOpen] = useState<boolean>(false);

  const showZoomHUD = (text: string) => {
    setZoomHUDText(text);
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      setZoomHUDText(null);
    }, 1200);
  };

  const applyZoom = (factor: number) => {
    window.dispatchEvent(new CustomEvent('voile:set-zoom', { detail: { zoomFactor: factor } }));
  };

  const zoomIn = () => {
    setZoomFactor(prev => {
      const next = Math.min(3.0, parseFloat((prev + 0.1).toFixed(2)));
      showZoomHUD(`${Math.round(next * 100)}%`);
      applyZoom(next);
      return next;
    });
  };

  const zoomOut = () => {
    setZoomFactor(prev => {
      const next = Math.max(0.3, parseFloat((prev - 0.1).toFixed(2)));
      showZoomHUD(`${Math.round(next * 100)}%`);
      applyZoom(next);
      return next;
    });
  };

  const resetZoom = () => {
    setZoomFactor(1.0);
    showZoomHUD('100%');
    applyZoom(1.0);
  };

  // Persistent Bookmarks and Folders
  const [bookmarks, setBookmarksState] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('voile_bookmarks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultBookmarks;
  });

  const [bookmarkFolders, setBookmarkFoldersState] = useState<BookmarkFolder[]>(() => {
    try {
      const saved = localStorage.getItem('voile_bookmark_folders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultFolders;
  });

  const setBookmarks = (updater: Bookmark[] | ((prev: Bookmark[]) => Bookmark[])) => {
    setBookmarksState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('voile_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const setBookmarkFolders = (updater: BookmarkFolder[] | ((prev: BookmarkFolder[]) => BookmarkFolder[])) => {
    setBookmarkFoldersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('voile_bookmark_folders', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Bookmark bar is always visible by default according to confirmed requirements!
  const [bookmarksBarVisible, setBookmarksBarVisible] = useState<boolean>(true);

  const [shortcuts, setShortcuts] = useState<Shortcut[]>(defaultShortcuts);
  const [history, setHistory] = useState<HistoryItem[]>(defaultHistory);
  const [downloads] = useState<DownloadItem[]>(defaultDownloads);

  // Persistent Voile Shields State Synchronized with Electron Backend
  const [shieldsEnabled, setShieldsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('voile_shields_enabled');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const setShieldsEnabled = (enabled: boolean) => {
    setShieldsEnabledState(enabled);
    setAdBlockStats(prev => ({ ...prev, isEnabled: enabled }));
    try {
      localStorage.setItem('voile_shields_enabled', String(enabled));
    } catch {}
    (window as any).voileDesktop?.setShieldsEnabled?.(enabled);
  };

  const toggleShields = () => {
    setShieldsEnabled(!shieldsEnabled);
  };

  const [adBlockStats, setAdBlockStats] = useState<AdBlockStats>({
    isEnabled: shieldsEnabled,
    blockedCount: 0,
    rulesCount: 125000,
    lastUpdated: new Date().toLocaleDateString(),
    exceptions: [],
    isUpdating: false
  });

  // Fetch initial AdBlock stats from main process
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await (window as any).voileDesktop?.getAdBlockStats?.();
        if (stats) {
          setAdBlockStats(prev => ({
            ...prev,
            ...stats
          }));
        }
      } catch (e) {}
    };
    fetchStats();

    // Listen to real-time blocked events
    const unsub = (window as any).voileDesktop?.onShieldBlocked?.((data: any) => {
      setAdBlockStats(prev => ({
        ...prev,
        blockedCount: (data && data.totalBlocked) ? data.totalBlocked : prev.blockedCount + 1
      }));
      setPrivacyStats(prev => ({
        ...prev,
        adsBlocked: prev.adsBlocked + 1,
        trackersBlocked: prev.trackersBlocked + 1,
        bandwidthSavedMb: parseFloat((prev.bandwidthSavedMb + 0.2).toFixed(1))
      }));
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const addAdBlockException = async (domain: string) => {
    try {
      const list = await (window as any).voileDesktop?.addAdBlockException?.(domain);
      if (Array.isArray(list)) {
        setAdBlockStats(prev => ({ ...prev, exceptions: list }));
      }
    } catch (e) {}
  };

  const removeAdBlockException = async (domain: string) => {
    try {
      const list = await (window as any).voileDesktop?.removeAdBlockException?.(domain);
      if (Array.isArray(list)) {
        setAdBlockStats(prev => ({ ...prev, exceptions: list }));
      }
    } catch (e) {}
  };

  const updateAdBlockFilters = async (): Promise<boolean> => {
    setAdBlockStats(prev => ({ ...prev, isUpdating: true }));
    try {
      const res = await (window as any).voileDesktop?.updateAdBlockFilters?.();
      setAdBlockStats(prev => ({
        ...prev,
        isUpdating: false,
        lastUpdated: res?.lastUpdated ? new Date(res.lastUpdated).toLocaleDateString() : prev.lastUpdated
      }));
      return !!res?.success;
    } catch (e) {
      setAdBlockStats(prev => ({ ...prev, isUpdating: false }));
      return false;
    }
  };

  // Synchronize initial Shield state with main process on boot
  useEffect(() => {
    (window as any).voileDesktop?.setShieldsEnabled?.(shieldsEnabled);
  }, []);

  const [shieldsPopoverOpen, setShieldsPopoverOpen] = useState<boolean>(false);
  const [privacyStats, setPrivacyStats] = useState<PrivacyStats>({
    trackersBlocked: 34,
    adsBlocked: 19,
    fingerprintsBlocked: 8,
    bandwidthSavedMb: 4.8,
    httpsUpgrades: 12
  });

  // AdaL starts closed by default so no unwanted popup appears on launch
  const [isAdaLOpen, setIsAdaLOpen] = useState<boolean>(false);
  const [isAdaLExpanded, setIsAdaLExpanded] = useState<boolean>(false);
  const [adaLMessages, setAdaLMessages] = useState<AdaLMessage[]>(initialAdaLMessages);
  const [isAdaLTyping, setIsAdaLTyping] = useState<boolean>(false);

  // Sidebar starts closed by default for ultra-clean home view matching design
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [sidebarPosition, setSidebarPositionState] = useState<'left' | 'right'>(() => {
    try {
      const saved = localStorage.getItem('voile_sidebar_position') as 'left' | 'right';
      if (saved === 'left' || saved === 'right') return saved;
    } catch {}
    return 'right';
  });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const setSidebarPosition = (pos: 'left' | 'right') => {
    setSidebarPositionState(pos);
    try {
      localStorage.setItem('voile_sidebar_position', pos);
    } catch {}
  };

  const [isAddShortcutModalOpen, setIsAddShortcutModalOpen] = useState<boolean>(false);
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState<boolean>(false);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState<boolean>(false);

  // Omni Chameleon & Secure Transfer States
  const [chameleonEnabled, setChameleonEnabled] = useState<boolean>(true);
  const [secretScannerEnabled, setSecretScannerEnabled] = useState<boolean>(true);
  const [secretsInterceptedCount, setSecretsInterceptedCount] = useState<number>(4);

  // Google Authentication (RFC 8252 + PKCE)
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleAuthStatus, setGoogleAuthStatus] = useState<'idle' | 'pending' | 'success' | 'cancelled' | 'error' | 'network_error' | 'config_error'>('idle');
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch stored user profile from OS encrypted storage
    const fetchUser = async () => {
      try {
        const user = await (window as any).voileDesktop?.googleAuthGetUser?.();
        if (user && user.isAuthenticated) {
          setGoogleUser(user);
          setGoogleAuthStatus('success');
        }
      } catch (e) {}
    };
    fetchUser();

    // Listen to Google Auth Status changes
    const cleanup = (window as any).voileDesktop?.onGoogleAuthStatusChanged?.((data: any) => {
      if (data.status === 'pending') {
        setGoogleAuthStatus('pending');
        setGoogleAuthError(null);
      } else if (data.status === 'success') {
        setGoogleUser(data.user);
        setGoogleAuthStatus('success');
        setGoogleAuthError(null);
      } else if (data.status === 'cancelled') {
        setGoogleAuthStatus('cancelled');
        setGoogleAuthError(data.error || 'Sign-in was cancelled. You can try again.');
      } else if (data.status === 'config_error') {
        setGoogleAuthStatus('config_error');
        setGoogleAuthError(data.error || 'Google OAuth configuration requires attention.');
      } else if (data.status === 'network_error') {
        setGoogleAuthStatus('network_error');
        setGoogleAuthError(data.error || 'Network error during sign-in. Please check your connection and try again.');
      } else if (data.status === 'error') {
        setGoogleAuthStatus('error');
        setGoogleAuthError(data.error || 'Google sign-in could not be completed. Please try again.');
      } else if (data.status === 'logged_out') {
        setGoogleUser(null);
        setGoogleAuthStatus('idle');
        setGoogleAuthError(null);
      }
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  const startGoogleAuth = async (options?: { isMock?: boolean; clientId?: string; useSystemBrowser?: boolean }) => {
    setGoogleAuthStatus('pending');
    setGoogleAuthError(null);
    try {
      await (window as any).voileDesktop?.googleAuthStart?.(options);
    } catch (err: any) {
      setGoogleAuthStatus('error');
      setGoogleAuthError(err?.message || 'Google sign-in could not be completed. Please try again.');
    }
  };

  const startEmailAuth = async (email: string, name?: string) => {
    setGoogleAuthStatus('pending');
    setGoogleAuthError(null);
    try {
      await (window as any).voileDesktop?.googleAuthEmail?.({ email, name });
    } catch (err: any) {
      setGoogleAuthStatus('error');
      setGoogleAuthError(err?.message || 'Failed to sign in with email.');
    }
  };

  const continueAsGuest = () => {
    (window as any).voileDesktop?.googleAuthGuest?.();
    setGoogleAuthStatus('idle');
    setGoogleAuthError(null);
  };

  const cancelGoogleAuth = () => {
    (window as any).voileDesktop?.googleAuthCancel?.();
    setGoogleAuthStatus('cancelled');
    setGoogleAuthError('Sign-in was cancelled. You can try again.');
  };

  const logoutGoogle = () => {
    (window as any).voileDesktop?.googleAuthLogout?.();
    setGoogleUser(null);
    setGoogleAuthStatus('idle');
    setGoogleAuthError(null);
  };

  // Search Engine State
  const [searchEngine, setSearchEngineState] = useState<SearchEngineType>(() => {
    try {
      const saved = localStorage.getItem('voile_search_engine') as SearchEngineType;
      if (saved && SEARCH_ENGINES[saved]) return saved;
    } catch {}
    return 'DuckDuckGo';
  });

  const setSearchEngine = (engine: SearchEngineType) => {
    setSearchEngineState(engine);
    try {
      localStorage.setItem('voile_search_engine', engine);
    } catch {}
  };

  useEffect(() => {
    if (chameleonEnabled) {
      applyChameleonShield();
    }
  }, [chameleonEnabled]);

  // Real-time Voile Shield Network Interception Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const desktop = (window as any).voileDesktop;
    if (desktop?.onShieldBlocked) {
      const cleanup = desktop.onShieldBlocked((event: { type?: string; url?: string }) => {
        setPrivacyStats(prev => ({
          ...prev,
          adsBlocked: prev.adsBlocked + 1,
          trackersBlocked: prev.trackersBlocked + 1,
          bandwidthSavedMb: parseFloat((prev.bandwidthSavedMb + 0.15).toFixed(1))
        }));
      });
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, []);

  const toggleChameleon = () => setChameleonEnabled(prev => !prev);
  const toggleSecretScanner = () => setSecretScannerEnabled(prev => !prev);
  const incrementSecretsIntercepted = () => setSecretsInterceptedCount(prev => prev + 1);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Derive active view from current tab url
  const getViewFromUrl = (url: string): ActiveView => {
    if (url === 'voile://newtab' || url === 'voile://home') return 'home';
    if (url === 'voile://workspace') return 'workspace';
    if (url === 'voile://architecture') return 'architecture';
    if (url === 'voile://private') return 'private';
    if (url === 'voile://bookmarks') return 'bookmarks';
    if (url === 'voile://history') return 'history';
    if (url === 'voile://downloads') return 'downloads';
    if (url === 'voile://privacy') return 'privacy';
    if (url === 'voile://settings') return 'settings';
    if (url === 'voile://google-auth') return 'google-auth';
    return 'web';
  };

  const activeView = getViewFromUrl(activeTab?.url || 'voile://newtab');

  const setActiveView = (view: ActiveView) => {
    const urlMap: Record<ActiveView, string> = {
      home: 'voile://newtab',
      workspace: 'voile://workspace',
      architecture: 'voile://architecture',
      private: 'voile://private',
      bookmarks: 'voile://bookmarks',
      history: 'voile://history',
      downloads: 'voile://downloads',
      privacy: 'voile://privacy',
      settings: 'voile://settings',
      'google-auth': 'voile://google-auth',
      web: activeTab.url.startsWith('voile://') ? 'https://en.wikipedia.org' : activeTab.url
    };
    const titleMap: Record<ActiveView, string> = {
      home: 'New Tab',
      workspace: 'Voile — Workspace Privacy Hub',
      architecture: 'Voile — Architecture (Built Layer by Layer)',
      private: 'Voile — Private Shielded Session',
      bookmarks: 'Voile — Bookmarks Manager',
      history: 'Voile — History & Data',
      downloads: 'Voile — Downloads',
      privacy: 'Voile — Privacy & Shields',
      settings: 'Voile — Settings',
      'google-auth': 'Voile — Google Authentication',
      web: activeTab.title
    };

    navigateTab(urlMap[view], titleMap[view]);
  };

  const openNewTab = (url = 'voile://newtab', title = 'New Tab', isPrivate = false, isPinned = false) => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      title,
      url,
      isPrivate,
      isPinned,
      history: [url],
      historyIndex: 0,
      lastActiveAt: Date.now(),
      lifecycleState: 'active'
    };
    setTabs(prev => {
      // Demote current active tab to warm
      const updated = prev.map(t => t.id === activeTabId ? { ...t, lifecycleState: 'warm' as const } : t);
      return [...updated, newTab];
    });
    setActiveTabId(newId);
  };

  // Listen for open-external-tab events from Electron main process
  useEffect(() => {
    const cleanup = (window as any).voileDesktop?.onOpenExternalTab?.((url: string) => {
      if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('voile://') || url.startsWith('file://'))) {
        openNewTab(url);
      }
    });
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  const closeTab = (id: string) => {
    const targetTab = tabs.find(t => t.id === id);
    if (targetTab && targetTab.url !== 'voile://newtab') {
      setClosedTabs(prev => [targetTab, ...prev.slice(0, 19)]);
    }

    if (tabs.length === 1) {
      // Don't close last tab, just reset it to home
      setTabs([{
        id: 'tab-1',
        title: 'New Tab',
        url: 'voile://newtab',
        history: ['voile://newtab'],
        historyIndex: 0,
        lastActiveAt: Date.now(),
        lifecycleState: 'active'
      }]);
      setActiveTabId('tab-1');
      return;
    }

    const index = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);

    if (activeTabId === id) {
      const nextIndex = Math.max(0, index - 1);
      const nextTab = newTabs[nextIndex];
      if (nextTab) {
        selectTab(nextTab.id);
      }
    }
  };

  const reopenLastClosedTab = () => {
    if (closedTabs.length === 0) return;
    const [lastClosed, ...remaining] = closedTabs;
    setClosedTabs(remaining);
    const newId = `tab-${Date.now()}`;
    const restoredTab: Tab = {
      ...lastClosed,
      id: newId,
      lastActiveAt: Date.now(),
      lifecycleState: 'active'
    };
    setTabs(prev => {
      const updated = prev.map(t => t.id === activeTabId ? { ...t, lifecycleState: 'warm' as const } : t);
      return [...updated, restoredTab];
    });
    setActiveTabId(newId);
  };

  const selectNextTab = () => {
    if (tabs.length <= 1) return;
    const currentIndex = tabs.findIndex(t => t.id === activeTabId);
    const nextIndex = (currentIndex + 1) % tabs.length;
    selectTab(tabs[nextIndex].id);
  };

  const selectPreviousTab = () => {
    if (tabs.length <= 1) return;
    const currentIndex = tabs.findIndex(t => t.id === activeTabId);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    selectTab(tabs[prevIndex].id);
  };

  const selectTabByIndex = (indexOneBased: number) => {
    const targetIdx = indexOneBased - 1;
    if (targetIdx >= 0 && targetIdx < tabs.length) {
      selectTab(tabs[targetIdx].id);
    }
  };

  const selectLastTab = () => {
    if (tabs.length > 0) {
      selectTab(tabs[tabs.length - 1].id);
    }
  };

  const reorderTabs = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setTabs(prev => {
      const sourceIndex = prev.findIndex(t => t.id === sourceId);
      const targetIndex = prev.findIndex(t => t.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  const selectTab = (id: string) => {
    const t0 = performance.now();
    setActiveTabId(id);

    setTabs(prev => {
      const now = Date.now();
      return prev.map(tab => {
        if (tab.id === id) {
          return {
            ...tab,
            lastActiveAt: now,
            lifecycleState: 'active' as const
          };
        } else if (tab.lifecycleState === 'active') {
          return {
            ...tab,
            lifecycleState: 'warm' as const
          };
        }
        return tab;
      });
    });

    const elapsed = (performance.now() - t0).toFixed(2);
    console.log(`[Voile Performance] Tab ${id} activated in ${elapsed}ms (Context Reused: Zero Reload)`);
  };

  const duplicateTab = (id: string) => {
    const target = tabs.find(t => t.id === id);
    if (!target) return;
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      ...target,
      id: newId,
      lastActiveAt: Date.now(),
      lifecycleState: 'active'
    };
    const index = tabs.findIndex(t => t.id === id);
    const newTabs = [...tabs];
    newTabs.splice(index + 1, 0, newTab);
    setTabs(newTabs);
    setActiveTabId(newId);
  };

  const togglePinTab = (id: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
  };

  const discardTab = (id: string) => {
    if (id === activeTabId) return;
    setTabs(prev => prev.map(t => (t.id === id && !t.isPinned) ? { ...t, lifecycleState: 'discarded' } : t));
  };

  const restoreTab = (id: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, lifecycleState: 'active', lastActiveAt: Date.now() } : t));
    setActiveTabId(id);
  };

  const updateTabState = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const navigateTab = (newUrl: string, newTitle?: string) => {
    let resolvedUrl = newUrl.trim();
    if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://') && !resolvedUrl.startsWith('voile://') && !resolvedUrl.startsWith('file://')) {
      if (/^localhost(:\d+)?(\/.*)?$/i.test(resolvedUrl) || /^127\.0\.0\.1(:\d+)?(\/.*)?$/i.test(resolvedUrl)) {
        resolvedUrl = `http://${resolvedUrl}`;
      } else if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(resolvedUrl) && !resolvedUrl.includes(' ')) {
        resolvedUrl = `https://${resolvedUrl}`;
      } else {
        // Query search with selected engine
        const engine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.DuckDuckGo;
        resolvedUrl = engine.url(resolvedUrl);
      }
    }

    let resolvedTitle = newTitle;
    if (!resolvedTitle) {
      if (resolvedUrl === 'voile://newtab') resolvedTitle = 'New Tab';
      else if (resolvedUrl === 'voile://workspace') resolvedTitle = 'Voile — Workspace';
      else if (resolvedUrl === 'voile://private') resolvedTitle = 'Voile — Private Window';
      else if (resolvedUrl === 'voile://google-auth') resolvedTitle = 'Voile — Google Authentication';
      else if (resolvedUrl.startsWith('http')) {
        try {
          const parsed = new URL(resolvedUrl);
          const q = parsed.searchParams.get('q') || parsed.searchParams.get('query');
          if (q && (parsed.pathname === '/search' || parsed.pathname === '/' || parsed.pathname.startsWith('/sp/search'))) {
            resolvedTitle = `${q} — Voile Search`;
          } else {
            resolvedTitle = parsed.hostname.replace('www.', '');
          }
        } catch {
          resolvedTitle = resolvedUrl;
        }
      } else {
        resolvedTitle = resolvedUrl;
      }
    }

    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(resolvedUrl);
        return {
          ...tab,
          url: resolvedUrl,
          title: resolvedTitle || tab.title,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return tab;
    }));

    // Record history if not private and not newtab
    if (!activeTab.isPrivate && resolvedUrl !== 'voile://newtab') {
      setHistory(prev => [
        {
          id: `h-${Date.now()}`,
          title: resolvedTitle || resolvedUrl,
          url: resolvedUrl,
          visitedAt: Date.now(),
          visitCount: 1
        },
        ...prev
      ]);

      // Increment shields stats slightly for simulated blocking
      if (shieldsEnabled) {
        setPrivacyStats(prev => ({
          ...prev,
          trackersBlocked: prev.trackersBlocked + Math.floor(Math.random() * 4) + 1,
          adsBlocked: prev.adsBlocked + Math.floor(Math.random() * 2),
          fingerprintsBlocked: prev.fingerprintsBlocked + 1,
          bandwidthSavedMb: +(prev.bandwidthSavedMb + 0.3).toFixed(1),
        }));
      }
    }
  };

  const goBack = () => {
    window.dispatchEvent(new CustomEvent('voile:go-back', { detail: { tabId: activeTabId } }));
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId && tab.historyIndex > 0) {
        const nextIndex = tab.historyIndex - 1;
        const prevUrl = tab.history[nextIndex];
        return {
          ...tab,
          url: prevUrl,
          historyIndex: nextIndex,
          title: prevUrl.startsWith('voile://') ? (prevUrl.replace('voile://', 'Voile — ') || 'Home') : prevUrl
        };
      }
      return tab;
    }));
  };

  const goForward = () => {
    window.dispatchEvent(new CustomEvent('voile:go-forward', { detail: { tabId: activeTabId } }));
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId && tab.historyIndex < tab.history.length - 1) {
        const nextIndex = tab.historyIndex + 1;
        const nextUrl = tab.history[nextIndex];
        return {
          ...tab,
          url: nextUrl,
          historyIndex: nextIndex,
          title: nextUrl.startsWith('voile://') ? (nextUrl.replace('voile://', 'Voile — ') || 'Home') : nextUrl
        };
      }
      return tab;
    }));
  };

  const reloadTab = () => {
    window.dispatchEvent(new CustomEvent('voile:reload-active-tab', { detail: { tabId: activeTabId } }));
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, isLoading: true };
      }
      return tab;
    }));
    setTimeout(() => {
      setTabs(prev => prev.map(tab => {
        if (tab.id === activeTabId) {
          return { ...tab, isLoading: false };
        }
        return tab;
      }));
    }, 400);
  };

  const toggleBookmarksBar = () => {
    setBookmarksBarVisible(v => !v);
  };

  const addBookmark = (title: string, url: string, folderId?: string): Bookmark => {
    const newBookmark: Bookmark = {
      id: `b-${Date.now()}`,
      title: title.trim() || url,
      url,
      folderId: folderId || undefined,
      createdAt: Date.now()
    };
    setBookmarks(prev => [newBookmark, ...prev]);
    return newBookmark;
  };

  const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isBookmarked = (url: string) => {
    return bookmarks.some(b => b.url === url);
  };

  const addBookmarkFolder = (title: string): BookmarkFolder => {
    const newFolder: BookmarkFolder = {
      id: `f-${Date.now()}`,
      title: title.trim() || 'New Folder'
    };
    setBookmarkFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const renameBookmarkFolder = (id: string, newTitle: string) => {
    setBookmarkFolders(prev => prev.map(f => f.id === id ? { ...f, title: newTitle.trim() } : f));
  };

  const deleteBookmarkFolder = (id: string) => {
    setBookmarks(prev => prev.map(b => b.folderId === id ? { ...b, folderId: undefined } : b));
    setBookmarkFolders(prev => prev.filter(f => f.id !== id));
  };

  const reorderBookmarks = (sourceId: string, targetId: string, targetFolderId?: string) => {
    setBookmarks(prev => {
      const sourceIndex = prev.findIndex(b => b.id === sourceId);
      const targetIndex = prev.findIndex(b => b.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      const modified = targetFolderId !== undefined ? { ...moved, folderId: targetFolderId || undefined } : moved;
      updated.splice(targetIndex, 0, modified);
      return updated;
    });
  };

  const addShortcut = (title: string, url: string, iconBg = 'bg-blue-500/20 text-blue-400') => {
    const newShortcut: Shortcut = {
      id: `s-${Date.now()}`,
      title,
      url,
      iconName: 'Globe',
      iconBg
    };
    setShortcuts(prev => [...prev, newShortcut]);
  };

  const removeShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const toggleAdaL = () => {
    setIsAdaLOpen(prev => !prev);
  };

  const toggleAdaLExpand = () => {
    setIsAdaLExpanded(prev => !prev);
  };

  const sendAdaLMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMsg: AdaLMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdaLMessages(prev => [...prev, userMsg]);
    setIsAdaLTyping(true);

    try {
      const historySnapshot = [...adaLMessages, userMsg].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const result = await generateMascotResponse(
        prompt,
        historySnapshot,
        {
          activeTabTitle: activeTab?.title,
          activeTabUrl: activeTab?.url,
          trackersBlocked: privacyStats.trackersBlocked,
          adsBlocked: privacyStats.adsBlocked
        }
      );

      const assistantMsg: AdaLMessage = {
        id: `adal-${Date.now()}`,
        sender: 'adal',
        text: result.text,
        memoryUsed: result.memoryUsed,
        webSearchUsed: result.webSearchUsed,
        webSources: result.webSources,
        recommendations: result.recommendations,
        modelUsed: result.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAdaLMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to generate mascot response:', err);
      const fallbackMsg: AdaLMessage = {
        id: `adal-${Date.now()}`,
        sender: 'adal',
        text: `I'm here with you. How can I assist your privacy-first session?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdaLMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAdaLTyping(false);
    }
  };

  const runAdaLAction = (actionTitle: string) => {
    sendAdaLMessage(`Action: ${actionTitle}`);
  };

  return (
    <BrowserContext.Provider
      value={{
        tabs,
        activeTabId,
        activeTab,
        closedTabs,
        openNewTab,
        closeTab,
        reopenLastClosedTab,
        selectTab,
        selectNextTab,
        selectPreviousTab,
        selectTabByIndex,
        selectLastTab,
        reorderTabs,
        navigateTab,
        duplicateTab,
        togglePinTab,
        discardTab,
        restoreTab,
        updateTabState,
        goBack,
        goForward,
        reloadTab,
        zoomFactor,
        zoomHUDText,
        zoomIn,
        zoomOut,
        resetZoom,
        isFindInPageOpen,
        setIsFindInPageOpen,
        activeView,
        setActiveView,
        bookmarks,
        bookmarkFolders,
        bookmarksBarVisible,
        toggleBookmarksBar,
        addBookmark,
        updateBookmark,
        removeBookmark,
        isBookmarked,
        addBookmarkFolder,
        renameBookmarkFolder,
        deleteBookmarkFolder,
        reorderBookmarks,
        isBookmarkPopoverOpen,
        setIsBookmarkPopoverOpen,
        shortcuts,
        addShortcut,
        removeShortcut,
        history,
        clearHistory,
        downloads,
        shieldsEnabled,
        setShieldsEnabled,
        toggleShields,
        privacyStats,
        shieldsPopoverOpen,
        setShieldsPopoverOpen,
        adBlockStats,
        addAdBlockException,
        removeAdBlockException,
        updateAdBlockFilters,
        isAdaLOpen,
        isAdaLExpanded,
        toggleAdaL,
        toggleAdaLExpand,
        adaLMessages,
        sendAdaLMessage,
        runAdaLAction,
        isAdaLTyping,
        isAddShortcutModalOpen,
        setIsAddShortcutModalOpen,
        isAddBookmarkModalOpen,
        setIsAddBookmarkModalOpen,
        isClearHistoryModalOpen,
        setIsClearHistoryModalOpen,
        chameleonEnabled,
        toggleChameleon,
        secretScannerEnabled,
        toggleSecretScanner,
        secretsInterceptedCount,
        incrementSecretsIntercepted,
        searchEngine,
        setSearchEngine,
        isSidebarOpen,
        toggleSidebar,
        sidebarPosition,
        setSidebarPosition,
        googleUser,
        googleAuthStatus,
        googleAuthError,
        startGoogleAuth,
        startEmailAuth,
        continueAsGuest,
        cancelGoogleAuth,
        logoutGoogle,
      }}
    >
      {children}
    </BrowserContext.Provider>
  );
};

export const useBrowser = () => {
  const context = useContext(BrowserContext);
  if (!context) {
    throw new Error('useBrowser must be used within a BrowserProvider');
  }
  return context;
};
