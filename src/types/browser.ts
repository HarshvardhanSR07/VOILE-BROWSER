export type SearchEngineType = 'DuckDuckGo' | 'Google' | 'Brave' | 'Startpage' | 'Ecosia';

export interface SearchEngineOption {
  id: SearchEngineType;
  name: string;
  url: (query: string) => string;
  homeUrl: string;
  description: string;
  privacy: 'High' | 'Medium';
}

export type ActiveView = 
  | 'home' 
  | 'workspace' 
  | 'architecture'
  | 'private' 
  | 'bookmarks' 
  | 'history' 
  | 'downloads' 
  | 'privacy' 
  | 'settings' 
  | 'google-auth'
  | 'web';

export type TabLifecycleState = 'active' | 'warm' | 'idle' | 'discarded';

export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading?: boolean;
  isPrivate?: boolean;
  history: string[];
  historyIndex: number;
  lastActiveAt?: number;
  lifecycleState?: TabLifecycleState;
  scrollPosition?: { x: number; y: number };
  isPinned?: boolean;
}

export interface Shortcut {
  id: string;
  title: string;
  url: string;
  iconName?: string;
  iconBg?: string;
  category?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folderId?: string;
  favicon?: string;
  createdAt: number;
}

export interface BookmarkFolder {
  id: string;
  title: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: number;
  visitCount: number;
}

export interface DownloadItem {
  id: string;
  filename: string;
  size: string;
  progress: number;
  status: 'completed' | 'downloading' | 'paused';
  url: string;
  completedAt?: string;
}

export interface PrivacyStats {
  trackersBlocked: number;
  adsBlocked: number;
  fingerprintsBlocked: number;
  bandwidthSavedMb: number;
  httpsUpgrades: number;
}

export interface RecommendationCard {
  title: string;
  url: string;
  description?: string;
  domain?: string;
  favicon?: string;
  thumbnail?: string;
  category?: string;
  badge?: string;
  actionLabel?: string;
}

export interface AdaLMessage {
  id: string;
  sender: 'user' | 'adal';
  text: string;
  timestamp: string;
  isThinking?: boolean;
  memoryUsed?: string | null;
  webSearchUsed?: boolean;
  webSources?: { title: string; url: string }[];
  recommendations?: RecommendationCard[];
  modelUsed?: string;
  actionLinks?: { label: string; action: () => void }[];
}

export interface PermissionAlert {
  id: string;
  site: string;
  permission: string;
  status: 'pending' | 'blocked' | 'allowed';
}

export interface WorkspaceTool {
  id: string;
  name: string;
  category: 'Communication' | 'Productivity' | 'Storage' | 'Organization' | 'Utilities';
  description: string;
  url: string;
  iconName: string;
  badges: string[];
  isOpenSource: boolean;
  isFreePlan: boolean;
  isSelfHostable: boolean;
  isE2EE: boolean;
}

export interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
  verifiedEmail?: boolean;
  isAuthenticated: boolean;
  isDiagnostic?: boolean;
  provider?: 'google' | 'email' | 'guest';
}

