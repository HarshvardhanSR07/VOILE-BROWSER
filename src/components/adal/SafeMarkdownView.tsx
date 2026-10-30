import React from 'react';

interface SafeMarkdownViewProps {
  content: string;
  onOpenLink: (url: string, title?: string) => void;
}

export const SafeMarkdownView: React.FC<SafeMarkdownViewProps> = ({ content, onOpenLink }) => {
  // Safe URL validator
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  // Helper to parse inline markdown: bold, italic, code, and links
  const renderInlineFormatted = (text: string) => {
    // Regex matching [label](url), **bold**, *italic*, `code`
    const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        // [label](url)
        const label = match[2];
        const url = match[3];
        if (isValidUrl(url)) {
          elements.push(
            <button
              key={match.index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenLink(url, label);
              }}
              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 underline font-medium hover:opacity-90 transition-all cursor-pointer"
              title={`Open ${url} in a new tab`}
            >
              <span>{label}</span>
              <span className="text-[10px] no-underline">↗</span>
            </button>
          );
        } else {
          elements.push(label);
        }
      } else if (match[4]) {
        // **bold**
        elements.push(<strong key={match.index} className="font-semibold text-white">{match[4]}</strong>);
      } else if (match[5]) {
        // *italic*
        elements.push(<em key={match.index} className="italic text-slate-300">{match[5]}</em>);
      } else if (match[6]) {
        // `code`
        elements.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/20 text-sky-300 font-mono text-[11px]">
            {match[6]}
          </code>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  // Break content into blocks (paragraphs, headers, lists)
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        blocks.push(
          <ul key={`list-${blocks.length}`} className="space-y-1.5 my-2.5 pl-4 list-disc marker:text-sky-400 text-slate-200">
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol key={`list-${blocks.length}`} className="space-y-1.5 my-2.5 pl-4 list-decimal marker:text-sky-400 text-slate-200">
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-relaxed">{item}</li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h4 key={index} className="text-sm font-bold text-white mt-3 mb-1.5 tracking-wide flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          <span>{trimmed.replace(/^###\s+/, '')}</span>
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList();
      blocks.push(
        <h3 key={index} className="text-base font-bold text-white mt-4 mb-2 tracking-wide border-b border-white/5 pb-1">
          {trimmed.replace(/^#+\s+/, '')}
        </h3>
      );
      return;
    }

    // Bullet lists: *, -, •
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(renderInlineFormatted(bulletMatch[1]));
      return;
    }

    // Numbered lists: 1., 2.
    const numMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(renderInlineFormatted(numMatch[1]));
      return;
    }

    // Regular paragraph
    flushList();
    blocks.push(
      <p key={index} className="leading-relaxed text-slate-200 text-sm mb-2.5 last:mb-0">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-slate-200 select-text">{blocks}</div>;
};
