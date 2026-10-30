// src/services/agent/gtmService.ts
// Multimodal GTM Campaign Pack & Creative Asset Generator (Workflow B)

export interface GtmCampaignPack {
  productName: string;
  status: 'DRAFT';
  generatedAt: number;
  audienceAnalysis: {
    primaryPersona: string;
    demographics: string;
    corePainPoints: string[];
    purchasingTriggers: string[];
    jobsToBeDone: string;
  };
  competitorMatrix: Array<{
    competitor: string;
    positioning: string;
    pricingTier: string;
    differentiatorVsVoile: string;
  }>;
  creativeConcept: {
    campaignTheme: string;
    primaryHook: string;
    tagline: string;
    coreNarrative: string;
  };
  creativeAssets: {
    imagePrompt1: string;
    imagePrompt2: string;
    videoScript30Sec: Array<{
      timestamp: string;
      visual: string;
      audioVoiceover: string;
    }>;
  };
  launchPlan: {
    preLaunch: string[];
    launchDay: string[];
    growthLoop: string[];
  };
}

export function generateGtmCampaignPack(
  productName = 'Voile Browser',
  competitors = ['Google Chrome', 'Brave Browser', 'Arc Browser']
): GtmCampaignPack {
  return {
    productName,
    status: 'DRAFT',
    generatedAt: Date.now(),
    audienceAnalysis: {
      primaryPersona: 'The Privacy-Conscious Tech Professional & AI Power User',
      demographics: 'Ages 22–45, Software Engineers, Privacy Researchers, Founders & Knowledge Workers',
      corePainPoints: [
        'Massive commercial tracking and invasive canvas/hardware fingerprinting across standard browsers.',
        'Disconnected, slow AI extensions that leak proprietary context and browsing history to third-party ad networks.',
        'Frustration with having to manually copy-paste research into separate spreadsheets and documents.'
      ],
      purchasingTriggers: [
        'Built-in verifiable zero-telemetry chameleon shield that blocks trackers at the network kernel.',
        'An autonomous companion (AdaL) that does real work inside tabs without leaving the browser.',
        'Zero cloud reliance for local session memory and credential management.'
      ],
      jobsToBeDone: 'Empower users to browse the modern web without being fingerprinted, while automating multi-step research and document workflows autonomously.'
    },
    competitorMatrix: [
      {
        competitor: 'Google Chrome',
        positioning: 'Dominant ecosystem browser',
        pricingTier: 'Free (Ad-monetized data harvesting)',
        differentiatorVsVoile: 'Chrome tracks user telemetry across Google Services; Voile isolates sessions with zero telemetry and Chameleon anti-fingerprinting.'
      },
      {
        competitor: 'Brave Browser',
        positioning: 'Crypto-rewards & ad-blocking browser',
        pricingTier: 'Free / $9.99 mo for Premium VPN',
        differentiatorVsVoile: 'Brave lacks an integrated multi-step autonomous tab execution companion and verifiable read-back spreadsheet workflow.'
      },
      {
        competitor: 'The Browser Company (Arc / Dia)',
        positioning: 'Aesthetic modern workspace browser',
        pricingTier: 'Free / Enterprise tier',
        differentiatorVsVoile: 'Arc requires cloud accounts and central sync; Voile provides verifiable local-first execution, RFC 8252 PKCE auth, and genuine task verification.'
      }
    ],
    creativeConcept: {
      campaignTheme: 'The Invisible Browser That Does the Heavy Lifting',
      primaryHook: 'Browsers used to watch you. Voile works for you.',
      tagline: 'Browse Without Footprints. Execute Without Limits.',
      coreNarrative: 'The web should be private by default, and your browser should be more than an empty viewport. Voile shields your identity with Chameleon Anti-Fingerprinting while AdaL automates complex research, sheet creation, and multimodal workflows.'
    },
    creativeAssets: {
      imagePrompt1: 'Cinematic wide shot of a sleek obsidian cyber-minimalist browser interface floating in deep space, holographic glowing blue shields refracting surveillance lasers into pure data streams, 8k resolution, Unreal Engine 5 render style.',
      imagePrompt2: 'A sharp, friendly robotic assistant mascot named AdaL standing proudly next to an interactive verified spreadsheet tablet with glowing emerald checkmarks, dark glassmorphism lighting, high craft digital art.',
      videoScript30Sec: [
        {
          timestamp: '00:00 - 00:06',
          visual: 'Fast montage of tracker inspection alerts, cookie consent walls, and cluttered browser tabs.',
          audioVoiceover: 'Every day, you visit dozens of sites. And every day, hundreds of trackers build a fingerprint of your identity.'
        },
        {
          timestamp: '00:06 - 00:15',
          visual: 'Voile Browser opens instantly. A soft cyan chameleon shield pulses, neutralizing tracking requests in real time.',
          audioVoiceover: 'Meet Voile. The world’s first privacy-first browser with built-in Chameleon Shielding that makes you truly invisible.'
        },
        {
          timestamp: '00:15 - 00:24',
          visual: 'AdaL side-panel opens. User types "Research 10 AI startups into a spreadsheet." AdaL opens tabs, extracts pricing, and verifies cells.',
          audioVoiceover: 'And meet AdaL. Your autonomous multimodal companion that doesn’t just chat—it operates real tabs, verifies data, and builds real documents.'
        },
        {
          timestamp: '00:24 - 00:30',
          visual: 'Voile logo glows with tagline: "Browse Without Footprints. Execute Without Limits." Download CTA button appears.',
          audioVoiceover: 'Switch to Voile today. Download free for Windows and macOS at voile.browser.'
        }
      ]
    },
    launchPlan: {
      preLaunch: [
        'Deploy landing page with interactive Chameleon Shield simulator and pre-order waitlist.',
        'Share developer video teaser showing AdaL writing and verifying an AI startup spreadsheet in 60 seconds.',
        'Distribute private alpha build to 100 privacy engineers on X and Reddit r/privacy.'
      ],
      launchDay: [
        'Post Product Hunt launch campaign featuring Workflow A demo video and open-source benchmark.',
        'Publish technical whitepaper: "Defeating Hardware Fingerprinting in Native Chromium WebViews."',
        'Host live interactive launch stream: Building GTM assets live inside Voile.'
      ],
      growthLoop: [
        'Incentivize user workflow sharing with privacy-safe exportable recipes.',
        'Weekly release of verified autonomous agent templates (e.g. Competitor Price Tracker, Paper Summarizer).',
        'Partner with open-source privacy champions (Proton, Bitwarden, DuckDuckGo ecosystem).'
      ]
    }
  };
}
