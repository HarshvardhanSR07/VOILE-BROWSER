// Voile AI Mascot Service — Cognee Personalized Memory Layer, Tavily Live Web Search & Groq LLM Engine

const COGNEE_BASE_URL = (import.meta as any).env?.VITE_COGNEE_BASE_URL || 'https://tenant-b4471389-2067-4bed-9646-8ff9314a86f1.aws.cognee.ai';
const COGNEE_API_KEY = (import.meta as any).env?.VITE_COGNEE_API_KEY || '';

const TAVILY_API_URL = (import.meta as any).env?.VITE_TAVILY_API_URL || 'https://api.tavily.com/search';
const TAVILY_API_KEY = (import.meta as any).env?.VITE_TAVILY_API_KEY || '';

const GROQ_API_URL = (import.meta as any).env?.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = (import.meta as any).env?.VITE_GROQ_MODEL || 'qwen/qwen3.8-27b';

import { RecommendationCard } from '../types/browser';

export interface MascotMessageHistory {
  sender: 'user' | 'adal';
  text: string;
}

export interface WebSource {
  title: string;
  url: string;
}

export interface TavilyRawItem {
  title: string;
  url: string;
  content: string;
}

export interface TavilySearchResult {
  answer?: string;
  searchContext: string;
  sources: WebSource[];
  images: string[];
  rawResults: TavilyRawItem[];
}

export interface MascotResponseResult {
  text: string;
  memoryUsed: string | null;
  webSearchUsed: boolean;
  webSources?: WebSource[];
  recommendations?: RecommendationCard[];
  model: string;
  isMemoryGrounded: boolean;
}

/**
 * Searches the web in real-time via Tavily Search API
 */
export async function searchTavilyWeb(query: string): Promise<TavilySearchResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TAVILY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        include_answer: true,
        include_images: true,
        include_image_descriptions: true,
        max_results: 4
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Tavily Search] API returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const results = data.results || [];
    const answer = data.answer || '';

    const sources: WebSource[] = results.map((r: any) => ({
      title: r.title || 'Source',
      url: r.url || '#'
    }));

    const images: string[] = Array.isArray(data.images)
      ? data.images
          .map((img: any) => (typeof img === 'string' ? img : (img?.url || '')))
          .filter((url: string) => typeof url === 'string' && url.startsWith('http'))
      : [];

    const rawResults: TavilyRawItem[] = results.map((r: any) => ({
      title: r.title || 'Source',
      url: r.url || '#',
      content: r.content || ''
    }));

    const formattedResults = results
      .map((r: any, i: number) => `[Source ${i + 1}]: ${r.title}\nURL: ${r.url}\nExcerpt: ${(r.content || '').slice(0, 320)}...`)
      .join('\n\n');

    const searchContext = `${answer ? `Direct Web Answer: ${answer}\n\n` : ''}${formattedResults}`;

    return { answer, searchContext, sources, images, rawResults };
  } catch (err: any) {
    console.warn('[Tavily Search] Web search request failed or timed out:', err.message);
    return null;
  }
}

/**
 * Extracts rich recommendation cards from Tavily search findings and AI text
 */
export function extractRecommendationCards(
  tavilyData?: TavilySearchResult | null,
  text?: string
): RecommendationCard[] {
  const cards: RecommendationCard[] = [];
  const seenUrls = new Set<string>();

  // 1. Generate from Tavily Search Results
  if (tavilyData?.rawResults && tavilyData.rawResults.length > 0) {
    tavilyData.rawResults.forEach((item, index) => {
      if (!item.url || item.url === '#' || seenUrls.has(item.url)) return;
      seenUrls.add(item.url);

      let domain = '';
      try {
        domain = new URL(item.url).hostname.replace(/^www\./, '');
      } catch (e) {
        domain = 'web';
      }

      // Generate a clean title
      let cleanTitle = item.title.split(' - ')[0].split(' | ')[0].split(' : ')[0].trim();
      const domainParts = domain.split('.');
      const cleanBrand = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
      
      if (!cleanTitle || cleanTitle.length > 35) {
        cleanTitle = cleanBrand;
      }

      // Dynamic quality / category badge
      let badge = 'Verified · Web';
      const lowerUrl = item.url.toLowerCase();
      const lowerContent = (item.content || '').toLowerCase();
      if (lowerUrl.includes('pixabay')) {
        badge = 'Free · HD';
      } else if (lowerUrl.includes('pexels')) {
        badge = 'Free · High Quality';
      } else if (lowerUrl.includes('unsplash')) {
        badge = 'Free · High Res';
      } else if (lowerUrl.includes('github') || lowerContent.includes('open source')) {
        badge = 'Open Source';
      } else if (lowerUrl.includes('wikipedia')) {
        badge = 'Encyclopedia';
      } else if (lowerContent.includes('free') && lowerContent.includes('hd')) {
        badge = 'Free · HD';
      } else if (lowerContent.includes('free')) {
        badge = 'Free';
      } else if (lowerContent.includes('official')) {
        badge = 'Official';
      }

      // Concise snippet
      let description = (item.content || '').trim().replace(/\s+/g, ' ');
      if (description.length > 120) {
        description = description.slice(0, 117) + '...';
      }
      if (!description) {
        description = `Explore resources and content on ${domain}.`;
      }

      // Thumbnail image from Tavily search
      const thumbnail = tavilyData.images && tavilyData.images[index] ? tavilyData.images[index] : undefined;

      cards.push({
        title: cleanTitle,
        url: item.url,
        description,
        domain,
        badge,
        thumbnail,
        actionLabel: `Explore ${cleanBrand} ↗`
      });
    });
  }

  // 2. If no Tavily results, extract Markdown links from text
  if (cards.length === 0 && text) {
    const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
    let match;
    while ((match = mdLinkRegex.exec(text)) !== null && cards.length < 3) {
      const title = match[1];
      const url = match[2];
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      let domain = '';
      try {
        domain = new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        domain = 'web';
      }

      const domainName = domain.split('.')[0];
      const capitalizedDomain = domainName.charAt(0).toUpperCase() + domainName.slice(1);

      cards.push({
        title,
        url,
        domain,
        description: `Explore ${title} directly on ${domain}.`,
        badge: 'Recommended',
        actionLabel: `Explore ${capitalizedDomain} ↗`
      });
    }
  }

  return cards.slice(0, 3);
}

/**
 * Recalls entities, facts, and knowledge graph relations from Cognee memory layer
 */
export async function recallCogneeMemory(query: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${COGNEE_BASE_URL}/api/v1/recall`, {
      method: 'POST',
      headers: {
        'X-Api-Key': COGNEE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Cognee Memory] Recall returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const items = data
        .map((item: any) => item.text || item.completion || '')
        .filter((text: string) => text.trim().length > 0 && !text.includes('does not contain any information'));
      
      if (items.length > 0) {
        return items.join('\n\n');
      }
    }
    return null;
  } catch (err: any) {
    console.warn('[Cognee Memory] Recall request skipped or timed out:', err.message);
    return null;
  }
}

/**
 * Determines whether a query benefits from real-time live web search
 */
function shouldSearchWeb(query: string): boolean {
  const q = query.trim().toLowerCase();
  // Skip bare greetings or single-word conversational filler
  if (/^(hi|hello|hey|yo|sup|thanks|thank you|ok|okay|bye|good morning|good night)$/i.test(q)) {
    return false;
  }
  return true;
}

/**
 * Generates an intelligent, memory-augmented and web-grounded response using Groq LLM + Tavily Search + Cognee Memory
 */
export async function generateMascotResponse(
  prompt: string,
  history: MascotMessageHistory[] = [],
  context?: { activeTabTitle?: string; activeTabUrl?: string; trackersBlocked?: number; adsBlocked?: number }
): Promise<MascotResponseResult> {
  // 1. Parallel Dual Retrieval: Query Cognee Memory Graph & Tavily Real-Time Web Search
  const [memoryContext, tavilyData] = await Promise.all([
    recallCogneeMemory(prompt),
    shouldSearchWeb(prompt) ? searchTavilyWeb(prompt) : Promise.resolve(null)
  ]);

  // 2. Build Multi-Source System Prompt for Groq LLM
  const systemPrompt = `You are AdaL (Scout), the intelligent AI companion and mascot built directly into Voile Browser.
You are fast, helpful, witty, and deeply privacy-conscious.
You have real-time live web search capabilities powered by Tavily and a knowledge graph memory layer powered by Cognee.

${context?.activeTabTitle ? `[Active Page Context]: "${context.activeTabTitle}" (${context.activeTabUrl || 'about:blank'})\nPrivacy Shields Active: ${context.trackersBlocked || 0} trackers, ${context.adsBlocked || 0} ads blocked.` : ''}

${tavilyData?.searchContext ? `[Live Web Search Findings via Tavily]:\n${tavilyData.searchContext}\n(Note: Use these real-time web search findings to answer accurately. Where relevant, cite key sources using markdown links [Source Title](URL).)` : ''}

${memoryContext ? `[Cognee Knowledge Graph Memory Context]:\n${memoryContext}\n(Note: Use this recalled memory to answer accurately if related to the user's question.)` : ''}

Formatting rules:
- Be clear, structured, and direct. Use bullet points or numbered lists where appropriate.
- Include source links from the live web search results when answering questions about current events, documentation, news, or external topics.`;

  const recentHistory = history.slice(-6).map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: prompt }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply && reply.trim()) {
        const replyText = reply.trim();
        const recommendations = extractRecommendationCards(tavilyData, replyText);
        return {
          text: replyText,
          memoryUsed: memoryContext,
          webSearchUsed: !!tavilyData,
          webSources: tavilyData?.sources,
          recommendations,
          model: `Groq (${GROQ_MODEL})${tavilyData ? ' + Tavily Search' : ''}`,
          isMemoryGrounded: !!memoryContext
        };
      }
    } else {
      const errorText = await res.text();
      console.warn(`[Groq LLM] Returned status ${res.status}:`, errorText);
    }
  } catch (err: any) {
    console.warn('[Groq LLM] Request failed, using local web/privacy fallback:', err.message);
  }

  // 3. Fallback: If Groq times out or is unreachable, use Tavily direct answer if available
  let fallbackReply = '';
  const lower = prompt.toLowerCase();

  if (tavilyData?.answer) {
    fallbackReply = `${tavilyData.answer}\n\n**Web Sources:**\n${tavilyData.sources.map(s => `• [${s.title}](${s.url})`).join('\n')}`;
  } else if (lower.includes('summarize')) {
    fallbackReply = `**Page Summary for "${context?.activeTabTitle || 'Current Tab'}"**:\n\n• **Protected Environment**: You are browsing under Voile's hardened Chameleon Shield.\n• **Privacy Metrics**: ${context?.trackersBlocked || 0} trackers and ${context?.adsBlocked || 0} ads blocked.\n• **Zero Leakage**: Local storage and site cookies are sandboxed with zero telemetry broadcast.`;
  } else if (lower.includes('compare') || lower.includes('alternative')) {
    fallbackReply = `**Voile Recommended Privacy Alternatives**:\n\n1. **Email**: Proton Mail (Zero-access encryption)\n2. **Cloud Storage**: CryptPad & Proton Drive (Client-side encrypted)\n3. **Search**: DuckDuckGo & Startpage (Zero tracking)\n4. **Meetings**: Jitsi Meet (Open source WebRTC)`;
  } else if (memoryContext) {
    fallbackReply = `Here is what I recalled from your personalized memory graph:\n\n${memoryContext}`;
  } else {
    fallbackReply = `I'm AdaL, your AI companion. How can I assist your browsing experience today?`;
  }

  const recommendations = extractRecommendationCards(tavilyData, fallbackReply);

  return {
    text: fallbackReply,
    memoryUsed: memoryContext,
    webSearchUsed: !!tavilyData,
    webSources: tavilyData?.sources,
    recommendations,
    model: tavilyData ? 'Tavily Direct Fallback' : 'Voile Local Fallback',
    isMemoryGrounded: !!memoryContext
  };
}
