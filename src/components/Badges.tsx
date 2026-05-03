import React from 'react';
import { sourceUrls } from '../data/hospitals';

export function NABHBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-dm border"
      style={{ background: '#DCFCE7', color: '#2D6A4F', borderColor: '#A8D5BA' }}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M6.5 12L3 8.5L4.17 7.33L6.5 9.67L11.83 4.33L13 5.5L6.5 12Z" fill="#2D6A4F"/>
      </svg>
      NABH Accredited
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  const key = Object.keys(sourceUrls).find(k => source.includes(k));
  const url = key ? sourceUrls[key] : undefined;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
      style={{ background: '#EFF6FF', color: '#1E3A5F', border: '1px solid #BFDBFE' }}
      onClick={() => url && window.open(url, '_blank')}
      title={url ? `View ${key} source` : source}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path d="M4 2H10L14 6V14H4V2Z" stroke="#1E3A5F" strokeWidth="1.5" fill="none"/>
        <path d="M10 2V6H14" stroke="#1E3A5F" strokeWidth="1.5" fill="none"/>
      </svg>
      {source}
    </span>
  );
}

export function GeoTierBadge({ tier }: { tier: "Metro" | "Tier-2" | "Tier-3" }) {
  const styles: Record<string, { bg: string; text: string }> = {
    Metro: { bg: '#F3E8FF', text: '#6B21A8' },
    'Tier-2': { bg: '#EFF6FF', text: '#1E3A5F' },
    'Tier-3': { bg: '#FEF3C7', text: '#92400E' },
  };
  const s = styles[tier];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-dm text-[11px]"
      style={{ background: s.bg, color: s.text }}>
      {tier}
    </span>
  );
}

export function SchemeDeductionBadge({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px]"
      style={{ background: '#DCFCE7', color: '#2D6A4F', borderLeft: '3px solid #2D6A4F' }}>
      –₹{amount.toLocaleString('en-IN')}
    </span>
  );
}

export function ConfidenceRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score);
  const color = score >= 0.85 ? '#2D6A4F' : score >= 0.65 ? '#92400E' : '#991B1B';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E4DF" strokeWidth="3"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.3s ease' }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fontFamily="IBM Plex Mono" fontSize={size < 50 ? 9 : 12} fontWeight="600" fill={color}>
        {Math.round(score * 100)}%
      </text>
    </svg>
  );
}

export function Toast({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) {
  React.useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] font-dm text-[13px] text-white rounded-lg px-4 py-2.5"
      style={{ background: '#0B1F3A', borderLeft: '3px solid #2D6A4F', animation: 'fade-in-up 300ms ease-out' }}>
      {message}
    </div>
  );
}
