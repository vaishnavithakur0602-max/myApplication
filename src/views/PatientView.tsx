import { useState, useEffect, useRef, useCallback } from 'react';
import { NABHBadge, SourceBadge, GeoTierBadge, ConfidenceRing, Toast } from '../components/Badges';
import { procedureData, matchProcedure, getGeoTier, chatResponses } from '../data/hospitals';
import { formatRupee } from '../hooks/useAnimations';

interface PatientViewProps {
  onNavigate: (view: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

const commonSearches = [
  "Knee Replacement", "Hip Fracture Surgery", "Cataract Surgery",
  "Coronary Artery Bypass", "Appendectomy", "Spinal Fusion",
  "Chemotherapy Cycle", "Dialysis Session", "MRI Scan", "ICU Stay",
];

const commonIssues = [
  "Chest Pain While Walking", "Extreme Headache", "Feeling Dizzy", "Knee Hurts",
];

function MicButton({ onResult }: { onResult: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const recognitionRef = useRef<any>(null);

  const handleClick = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setToastMsg('Voice not supported on this browser.');
      return;
    }
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
      setRecording(false);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);

    setTimeout(() => {
      if (recognitionRef.current) {
        recognition.stop();
        setRecording(false);
      }
    }, 8000);
  }, [recording, onResult]);

  return (
    <>
      <button onClick={handleClick}
        className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center btn-hover"
        style={{
          background: recording ? '#C8E6D4' : 'white',
          border: '1px solid #C8E6D4',
          animation: recording ? 'none' : 'mic-idle-pulse 2.5s ease-out infinite',
        }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        {recording && (
          <>
            <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid #A8D5BA', animation: 'ring-expand 1.2s ease-out infinite', animationDelay: '0s' }}/>
            <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid #A8D5BA', animation: 'ring-expand 1.2s ease-out infinite', animationDelay: '0.4s' }}/>
            <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid #A8D5BA', animation: 'ring-expand 1.2s ease-out infinite', animationDelay: '0.8s' }}/>
          </>
        )}
      </button>
      <Toast message={toastMsg} visible={!!toastMsg} onClose={() => setToastMsg('')} />
    </>
  );
}

function EmptyState({ onChipClick: _onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div className="text-center py-20 px-10">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-6">
        <rect x="45" y="20" width="30" height="40" rx="4" stroke="#A8D5BA" strokeWidth="2.5" fill="none"/>
        <path d="M55 30h10M55 36h10M55 42h6" stroke="#A8D5BA" strokeWidth="2" strokeLinecap="round"/>
        <line x1="60" y1="60" x2="60" y2="80" stroke="#A8D5BA" strokeWidth="2.5"/>
        <circle cx="60" cy="85" r="8" stroke="#A8D5BA" strokeWidth="2.5" fill="none"/>
        <path d="M56 85l3 3 5-6" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="60" y="110" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="14" fill="#A8D5BA">₹</text>
      </svg>
      <h2 className="font-playfair text-2xl mb-2" style={{ color: '#0B1F3A' }}>
        Ask CURIFY anything about your healthcare costs
      </h2>
      <p className="font-dm text-[14px]" style={{ color: '#6B7280' }}>
        Try: "knee replacement in Mumbai" or "cataract surgery cost Delhi"
      </p>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-4 px-4 md:px-8 py-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl h-28"
          style={{
            background: 'linear-gradient(90deg, #E2E4DF 25%, #F3F4F1 50%, #E2E4DF 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease infinite',
          }}/>
      ))}
    </div>
  );
}

function ResultCards({ procedure, geoTier }: { procedure: string; geoTier: "Metro" | "Tier-2" | "Tier-3" }) {
  const data = procedureData[procedure];
  if (!data) return null;

  const geoMultiplier = geoTier === 'Metro' ? 1.15 : geoTier === 'Tier-2' ? 1.05 : 1;
  const totalMin = data.components.reduce((s, c) => s + c.min, 0) * geoMultiplier;
  const totalMax = data.components.reduce((s, c) => s + c.max, 0) * geoMultiplier;

  return (
    <div className="px-4 md:px-8 py-6 space-y-4" style={{ animation: 'fade-in-up 400ms ease-out' }}>
      <div className="flex items-center gap-3 mb-4">
        <ConfidenceRing score={data.confidence} size={44} />
        <div>
          <h3 className="font-playfair text-xl font-semibold" style={{ color: '#0B1F3A' }}>{data.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <NABHBadge />
            <GeoTierBadge tier={geoTier} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border card-hover" style={{ borderColor: '#E2E4DF' }}>
        <div className="flex justify-between items-start mb-3">
          <span className="font-dm text-[13px] font-semibold" style={{ color: '#0B1F3A' }}>Estimated Cost Range</span>
          <SourceBadge source="NHA HBP 2024" />
        </div>
        <div className="font-mono text-[28px] font-semibold" style={{ color: '#0B1F3A' }}>
          {formatRupee(Math.round(totalMin))} – {formatRupee(Math.round(totalMax))}
        </div>
        <p className="font-dm text-[12px] mt-1" style={{ color: '#6B7280' }}>
          Geo-adjusted for {geoTier} pricing
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border card-hover" style={{ borderColor: '#E2E4DF' }}>
        <span className="font-dm text-[13px] font-semibold" style={{ color: '#0B1F3A' }}>PM-JAY Coverage</span>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-mono text-[20px] font-semibold" style={{ color: '#2D6A4F' }}>
            {formatRupee(data.pmjayCoverage)}
          </span>
          <SourceBadge source="PM-JAY 2024" />
        </div>
        <p className="font-dm text-[12px] mt-1" style={{ color: '#6B7280' }}>
          Estimated out-of-pocket after PM-JAY: {formatRupee(Math.round(totalMin - data.pmjayCoverage))}
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border card-hover" style={{ borderColor: '#E2E4DF' }}>
        <span className="font-dm text-[13px] font-semibold" style={{ color: '#0B1F3A' }}>ICD-10 Codes Detected</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.icdCodes.map((c, i) => (
            <span key={i} className="font-mono text-[10px] px-2 py-1 rounded"
              style={{ background: '#EFF6FF', color: '#1E3A5F', border: '1px solid #BFDBFE' }}>
              {c.code} · {c.desc}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border card-hover" style={{ borderColor: '#E2E4DF' }}>
        <span className="font-dm text-[13px] font-semibold" style={{ color: '#0B1F3A' }}>Top Cost Components</span>
        <div className="space-y-2 mt-3">
          {data.components.slice(0, 5).map((c, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="font-dm text-[13px]" style={{ color: '#6B7280' }}>{c.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px]" style={{ color: '#0B1F3A' }}>
                  {formatRupee(c.min)} – {formatRupee(c.max)}
                </span>
                <SourceBadge source={c.source} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => {}} className="w-full btn-hover font-dm text-[14px] font-semibold rounded-lg py-3"
        style={{ background: '#2D6A4F', color: 'white' }}>
        View Full Underwriting Report →
      </button>
    </div>
  );
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');

  const suggestions = [
    "What does my bill include?",
    "Is this procedure covered?",
    "How do I appeal a claim?",
    "What's a fair price for this surgery?",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    const key = text.toLowerCase().replace(/[?]/g, '').trim();
    const response = chatResponses[key] ||
      "I can help you understand healthcare costs, insurance coverage, and government scheme eligibility. Try asking about specific procedures, billing items, or claim appeals.";
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    }, 600);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center btn-hover"
        style={{ background: '#0B1F3A', animation: open ? 'none' : 'chat-glow 3s ease-out infinite' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12"/>
          ) : (
            <>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <circle cx="8" cy="10" r="1" fill="white"/><circle cx="12" cy="10" r="1" fill="white"/><circle cx="16" cy="10" r="1" fill="white"/>
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[320px] h-[480px] rounded-2xl overflow-hidden flex flex-col md:right-6 max-md:inset-x-4 max-md:bottom-20 max-md:w-auto max-md:h-[60vh]"
          style={{
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #E2E4DF',
            boxShadow: '0 24px 64px rgba(11,31,58,0.18)',
            animation: 'fade-in-up 400ms cubic-bezier(0.34,1.56,0.64,1)',
          }}>
          <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: '#E2E4DF' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#2D6A4F', animation: 'dot-pulse 2s ease-in-out infinite' }}/>
              <span className="font-dm text-[15px] font-semibold" style={{ color: '#0B1F3A' }}>CURIFY Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="font-dm text-[13px] text-center py-4" style={{ color: '#6B7280' }}>
                  How can I help you with your healthcare costs?
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSend(s)}
                      className="chip-hover font-dm text-[12px] px-3 py-1.5 rounded-full"
                      style={{ background: 'white', border: '1px solid #C8E6D4', color: '#2D6A4F', boxShadow: 'inset 3px 0 0 #2D6A4F' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] font-dm text-[14px] px-3.5 py-2.5"
                  style={{
                    background: m.role === 'user' ? '#0B1F3A' : 'white',
                    color: m.role === 'user' ? 'white' : '#111827',
                    borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    border: m.role === 'assistant' ? '1px solid #E2E4DF' : 'none',
                    borderLeft: m.role === 'assistant' ? '3px solid #2D6A4F' : 'none',
                  }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t" style={{ borderColor: '#E2E4DF' }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask about costs, coverage..."
                className="flex-1 font-dm text-[13px] px-3 py-2 rounded-lg border outline-none focus:border-[#2D6A4F] transition-colors"
                style={{ borderColor: '#E2E4DF' }}
              />
              <button onClick={() => handleSend(input)}
                className="px-3 py-2 rounded-lg btn-hover"
                style={{ background: '#2D6A4F' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PatientView({ searchQuery }: PatientViewProps) {
  const [query, setQuery] = useState(searchQuery);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [geoTier, setGeoTier] = useState<"Metro" | "Tier-2" | "Tier-3">("Metro");
  const [location, setLocation] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (searchQuery && searchQuery !== query) {
      setQuery(searchQuery);
      doSearch(searchQuery);
    }
  }, [searchQuery]);

  const doSearch = (q: string) => {
    const matched = matchProcedure(q);
    if (!matched) {
      setResult(null);
      return;
    }
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(matched);
      setLoading(false);
    }, 1500);
  };

  const handleChipClick = (text: string) => {
    setQuery(text);
    doSearch(text);
  };

  const handleMicResult = (text: string) => {
    setQuery(text);
    doSearch(text);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setToastMsg('Location access denied. Please enter city manually.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.state || 'Unknown';
          const tier = getGeoTier(city);
          setLocation(city);
          setGeoTier(tier);
          setToastMsg(`Location detected: ${city} · ${tier} pricing applied`);
        } catch {
          setToastMsg('Location access denied. Please enter city manually.');
        }
      },
      () => setToastMsg('Location access denied. Please enter city manually.')
    );
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F9F8' }}>
      {/* Search area */}
      <div className="sticky top-0 z-30 pt-6 pb-4 px-4 md:px-8" style={{ background: '#F7F9F8' }}>
        <div className="max-w-2xl mx-auto relative">
          <div className="relative z-10 flex items-center gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => e.key === 'Enter' && doSearch(query)}
                placeholder="Search procedure, condition, or billing issue..."
                className="w-full font-dm text-[15px] pl-12 pr-4 py-3.5 rounded-full border-2 outline-none transition-all"
                style={{ borderColor: focused ? '#2D6A4F' : '#C8E6D4', background: 'white' }}
              />
            </div>
            <MicButton onResult={handleMicResult} />
          </div>

          <button onClick={detectLocation}
            className="mt-2 font-dm text-[13px] px-4 py-1.5 rounded-lg btn-hover"
            style={{ background: 'white', border: '1px solid #C8E6D4', color: '#2D6A4F' }}>
            Use My Location
          </button>
          {location && (
            <span className="ml-2 font-dm text-[12px]" style={{ color: '#6B7280' }}>
              {location} · <GeoTierBadge tier={geoTier} />
            </span>
          )}
        </div>

        {/* Chip rows */}
        <div className="max-w-2xl mx-auto mt-3">
          <p className="font-dm text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#9CA3AF' }}>Common Searches</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {commonSearches.map((c, i) => (
              <button key={i} onClick={() => handleChipClick(c)}
                className="chip-hover flex-shrink-0 font-dm text-[13px] px-3.5 py-1.5 rounded-full"
                style={{ background: 'white', border: '1px solid #C8E6D4', color: '#2D6A4F', boxShadow: 'inset 3px 0 0 #2D6A4F' }}>
                {c}
              </button>
            ))}
          </div>
          <p className="font-dm text-[10px] uppercase tracking-widest mb-1.5 mt-2" style={{ color: '#9CA3AF' }}>Common Issues</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {commonIssues.map((c, i) => (
              <button key={i} onClick={() => handleChipClick(c)}
                className="chip-hover flex-shrink-0 font-dm text-[13px] px-3.5 py-1.5 rounded-full"
                style={{ background: 'white', border: '1px solid #C8E6D4', color: '#2D6A4F', boxShadow: 'inset 3px 0 0 #2D6A4F' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {loading && <SkeletonLoader />}
        {!loading && result && <ResultCards procedure={result} geoTier={geoTier} />}
        {!loading && !result && <EmptyState onChipClick={handleChipClick} />}
      </div>

      {/* Disclaimer */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 mt-8 mb-6">
        <div className="rounded-lg p-4" style={{ background: '#F7F9F8', borderLeft: '4px solid #C9A84C' }}>
          <p className="font-dm text-[14px] font-semibold" style={{ color: '#0B1F3A' }}>Important Notice</p>
          <p className="font-dm text-[13px] italic mt-1" style={{ color: '#6B7280' }}>
            The estimates, comparisons, and insights provided by CURIFY are for informational purposes only and do not constitute final medical billing decisions, insurance rulings, or legal advice. Actual costs may vary based on your insurance plan, provider, and individual medical circumstances. Always verify final amounts with your healthcare provider or insurance company.
          </p>
          <p className="font-dm text-[11px] mt-2" style={{ color: '#9CA3AF' }}>Last updated: May 2026</p>
        </div>
      </div>

      <ChatBot />
      <Toast message={toastMsg} visible={!!toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}
