import React, { useState } from 'react';
import { useBrowser } from '../context/BrowserContext';
import { WorkspaceTool } from '../types/browser';
import { 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Mail, 
  Video, 
  FileText, 
  Table, 
  Presentation, 
  Calendar, 
  HardDrive, 
  CheckSquare, 
  Key, 
  Lock, 
  Cloud, 
  Globe,
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';

const workspaceDirectory: WorkspaceTool[] = [
  // Communication
  {
    id: 'proton-mail',
    name: 'Proton Mail',
    category: 'Communication',
    description: 'Encrypted email based in Switzerland. Protects messages with zero-access encryption.',
    url: 'https://mail.proton.me',
    iconName: 'Mail',
    badges: ['Free plan', 'Open source', 'Zero Access'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: false,
    isE2EE: true
  },
  {
    id: 'jitsi-meet',
    name: 'Jitsi Meet',
    category: 'Communication',
    description: 'Fully encrypted, 100% open-source video conferencing tool with no account required.',
    url: 'https://meet.jit.si',
    iconName: 'Video',
    badges: ['100% Free', 'Open source', 'Self-hostable'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  },
  {
    id: 'signal-web',
    name: 'Signal Messenger',
    category: 'Communication',
    description: 'Industry benchmark in private instant messaging and end-to-end encrypted calls.',
    url: 'https://signal.org',
    iconName: 'MessageSquare',
    badges: ['Non-profit', 'Open source', 'E2EE'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: false,
    isE2EE: true
  },
  {
    id: 'simplelogin',
    name: 'SimpleLogin',
    category: 'Communication',
    description: 'Email alias masking to prevent spammers and data brokers from tracking your address.',
    url: 'https://simplelogin.io',
    iconName: 'Shield',
    badges: ['Free plan', 'Open source'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: false
  },

  // Productivity
  {
    id: 'cryptpad-docs',
    name: 'CryptPad Docs',
    category: 'Productivity',
    description: 'Collaborative real-time rich text editor where the server cannot read your content.',
    url: 'https://cryptpad.fr',
    iconName: 'FileText',
    badges: ['Free plan', 'Open source', 'Zero Knowledge'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  },
  {
    id: 'cryptpad-sheets',
    name: 'CryptPad Sheets',
    category: 'Productivity',
    description: 'Private alternative to Google Sheets with calculations, formulas, and client-side keys.',
    url: 'https://cryptpad.fr',
    iconName: 'Table',
    badges: ['Free plan', 'Open source', 'Zero Knowledge'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  },
  {
    id: 'cryptpad-slides',
    name: 'CryptPad Slides',
    category: 'Productivity',
    description: 'Markdown-powered presentations with real-time peer encryption.',
    url: 'https://cryptpad.fr',
    iconName: 'Presentation',
    badges: ['Free plan', 'Open source'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  },
  {
    id: 'standard-notes',
    name: 'Standard Notes',
    category: 'Productivity',
    description: 'End-to-end encrypted notes app with version history, offline access, and Markdown.',
    url: 'https://standardnotes.com',
    iconName: 'FileText',
    badges: ['Free plan', 'Open source', 'Audited'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  },

  // Storage
  {
    id: 'proton-drive',
    name: 'Proton Drive',
    category: 'Storage',
    description: 'Swiss encrypted cloud storage with automatic file versioning and client encryption.',
    url: 'https://drive.proton.me',
    iconName: 'HardDrive',
    badges: ['Free plan', 'Open source', 'E2EE'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: false,
    isE2EE: true
  },
  {
    id: 'nextcloud',
    name: 'Nextcloud Hub',
    category: 'Storage',
    description: 'Self-hosted productivity platform giving you 100% data sovereignty on your own server.',
    url: 'https://nextcloud.com',
    iconName: 'Cloud',
    badges: ['Open source', 'Self-hostable', 'Enterprise'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  },

  // Organization
  {
    id: 'proton-calendar',
    name: 'Proton Calendar',
    category: 'Organization',
    description: 'Keep your schedule and event locations encrypted from advertisers and big tech.',
    url: 'https://calendar.proton.me',
    iconName: 'Calendar',
    badges: ['Free plan', 'Zero Access'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: false,
    isE2EE: true
  },
  {
    id: 'joplin',
    name: 'Joplin Notes',
    category: 'Organization',
    description: 'Note-taking and to-do application with synchronisation capabilities and full E2EE.',
    url: 'https://joplinapp.org',
    iconName: 'CheckSquare',
    badges: ['100% Free', 'Open source', 'E2EE'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    category: 'Organization',
    description: 'Trusted open-source password manager with end-to-end zero-knowledge encryption.',
    url: 'https://bitwarden.com',
    iconName: 'Key',
    badges: ['Free plan', 'Open source', 'Audited'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  },

  // Utilities
  {
    id: 'startpage',
    name: 'Startpage Search',
    category: 'Utilities',
    description: 'Google search results with zero tracking, no IP logging, and anonymous view proxy.',
    url: 'https://startpage.com',
    iconName: 'Globe',
    badges: ['Free to use', 'Anonymous proxy'],
    isOpenSource: false,
    isFreePlan: true,
    isSelfHostable: false,
    isE2EE: false
  },
  {
    id: 'searxng',
    name: 'SearXNG',
    category: 'Utilities',
    description: 'Metasearch engine aggregating results across dozens of engines without user profiles.',
    url: 'https://searx.space',
    iconName: 'Search',
    badges: ['100% Free', 'Open source', 'Self-hostable'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: false
  },
  {
    id: 'voile-secret-guard',
    name: 'Voile Secret Guard',
    category: 'Utilities',
    description: 'Pre-flight push protection scanner blocking accidental paste of API keys, cloud tokens, and private keys.',
    url: 'voile://privacy',
    iconName: 'Key',
    badges: ['Zero Knowledge', 'Entropy Filter', 'Active'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: false
  },
  {
    id: 'secure-transfer-drop',
    name: 'Voile Secure Drop',
    category: 'Storage',
    description: 'State-of-the-art cryptographic transfer engine with X25519 forward secrecy, AES-256-GCM, and tamper-evident audit.',
    url: 'https://github.com/secure-transfer',
    iconName: 'HardDrive',
    badges: ['AES-256-GCM', 'Ed25519', 'Argon2id', 'Audit Chain'],
    isOpenSource: true,
    isFreePlan: true,
    isSelfHostable: true,
    isE2EE: true
  }
];

export const WorkspacePage: React.FC = () => {
  const { navigateTab, openNewTab } = useBrowser();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Free' | 'OpenSource' | 'SelfHostable' | 'E2EE'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filterChips = [
    { id: 'All', label: 'All Tools' },
    { id: 'Free', label: 'Free to use' },
    { id: 'OpenSource', label: 'Open Source' },
    { id: 'SelfHostable', label: 'Self-hostable' },
    { id: 'E2EE', label: 'End-to-End Encrypted' },
  ] as const;

  const categories = ['All', 'Communication', 'Productivity', 'Storage', 'Organization', 'Utilities'];

  const filteredTools = workspaceDirectory.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;

    let matchesFilter = true;
    if (selectedFilter === 'Free') matchesFilter = tool.isFreePlan;
    if (selectedFilter === 'OpenSource') matchesFilter = tool.isOpenSource;
    if (selectedFilter === 'SelfHostable') matchesFilter = tool.isSelfHostable;
    if (selectedFilter === 'E2EE') matchesFilter = tool.isE2EE;

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return <Mail className="w-5 h-5 text-indigo-400" />;
      case 'Video': return <Video className="w-5 h-5 text-emerald-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'Table': return <Table className="w-5 h-5 text-teal-400" />;
      case 'Presentation': return <Presentation className="w-5 h-5 text-amber-400" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-purple-400" />;
      case 'Cloud': return <Cloud className="w-5 h-5 text-sky-400" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-rose-400" />;
      case 'CheckSquare': return <CheckSquare className="w-5 h-5 text-emerald-400" />;
      case 'Key': return <Key className="w-5 h-5 text-amber-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-voile-accent" />;
      default: return <Lock className="w-5 h-5 text-voile-accent" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white p-6 no-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header / Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Voile</span>
              <span>/</span>
              <span className="text-voile-accent font-medium">Workspace</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Your workspace, on your terms.</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              A curated launcher of freely available, privacy-focused alternatives to mainstream productivity silos.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a private alternative..."
              className="w-full pl-10 pr-4 py-2 bg-[#131B2E] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-voile-accent/60 focus:ring-2 focus:ring-voile-accent/20 transition-all"
            />
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedFilter === chip.id
                  ? 'bg-voile-accent text-slate-950 font-semibold shadow-sm'
                  : 'bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              className="p-4 rounded-2xl bg-[#0E1524] border border-white/[0.08] hover:border-voile-accent/30 hover:bg-[#131B2E] transition-all flex flex-col justify-between group shadow-voile-card"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getToolIcon(tool.iconName)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-voile-accent transition-colors">
                        {tool.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  {/* Open in Voile Browser button */}
                  <button
                    onClick={() => navigateTab(tool.url, tool.name)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-voile-accent hover:text-slate-950 text-slate-400 transition-colors"
                    title={`Launch ${tool.name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {tool.description}
                </p>
              </div>

              {/* Badges footer */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tool.badges.map((b, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-md text-[9.5px] font-medium bg-white/[0.04] border border-white/[0.06] text-slate-300"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => openNewTab(tool.url, tool.name)}
                  className="text-[11px] font-medium text-voile-accent hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Note at Bottom */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-voile-accent shrink-0" />
            <span>
              <strong>Independent Services:</strong> Voile provides seamless launcher access to external privacy tools. Review each provider's independent terms and privacy architecture.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            La vie privée avant tout
          </span>
        </div>
      </div>
    </div>
  );
};
