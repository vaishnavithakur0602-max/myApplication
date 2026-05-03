import { useState, useEffect } from 'react';
import { SourceBadge, GeoTierBadge } from '../components/Badges';
import { procedureData, matchProcedure } from '../data/hospitals';
import { formatRupee, formatLakhs } from '../hooks/useAnimations';

interface LenderViewProps {
  onNavigate: (view: string) => void;
  searchQuery: string;
  geoTier: "Metro" | "Tier-2" | "Tier-3";
  location: string;
}

function CostTableSkeleton() {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #E2E4DF 25%, #F3F4F1 50%, #E2E4DF 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease infinite',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="rounded h-4 w-48" style={shimmerStyle} />
      </div>
      <div className="rounded h-3 w-64 mb-3" style={shimmerStyle} />
      <div className="responsive-table">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: '#F7F9F8' }}>
              {['Component', 'Min (₹)', 'Max (₹)', 'Benchmark (₹)', 'Source', 'Coverage'].map(h => (
                <th key={h} className="font-dm text-[10px] uppercase tracking-wider text-left px-3 py-2"
                  style={{ color: '#9CA3AF', borderBottom: '2px solid #E2E4DF' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <tr key={i}>
                <td className="px-3 py-2.5"><div className="rounded h-3.5" style={{ ...shimmerStyle, width: `${60 + i * 8}px` }} /></td>
                <td className="px-3 py-2.5"><div className="rounded h-3.5 w-16" style={shimmerStyle} /></td>
                <td className="px-3 py-2.5"><div className="rounded h-3.5 w-16" style={shimmerStyle} /></td>
                <td className="px-3 py-2.5"><div className="rounded h-3.5 w-16" style={shimmerStyle} /></td>
                <td className="px-3 py-2.5"><div className="rounded h-4 w-14" style={shimmerStyle} /></td>
                <td className="px-3 py-2.5"><div className="rounded h-3.5 w-20" style={shimmerStyle} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 border-t-2 border-dashed" style={{ borderColor: '#E2E4DF' }}>
        <div className="flex justify-between py-2.5 px-3">
          <div className="rounded h-4 w-16" style={shimmerStyle} />
          <div className="rounded h-4 w-24" style={shimmerStyle} />
        </div>
        <div className="flex justify-between py-4 px-3">
          <div className="rounded h-5 w-32" style={shimmerStyle} />
          <div className="rounded h-6 w-28" style={shimmerStyle} />
        </div>
      </div>
    </div>
  );
}

function LoadingSteps() {
  const [steps, setSteps] = useState([
    { text: "Parsing procedure query...", sub: "Natural language processing", done: false },
    { text: "Mapping to ICD-10 & NHA codes...", sub: "Code classification", done: false },
    { text: "Fetching CGHS/PM-JAY benchmark rates...", sub: "Government data lookup", done: false },
    { text: "Calculating geo-adjusted cost ranges...", sub: "Regional pricing model", done: false },
  ]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setSteps(s => s.map((st, i) => i === 0 ? { ...st, done: true } : st)), 500),
      setTimeout(() => setSteps(s => s.map((st, i) => i === 1 ? { ...st, done: true } : st)), 1300),
      setTimeout(() => setSteps(s => s.map((st, i) => i === 2 ? { ...st, done: true } : st)), 1900),
      setTimeout(() => setSteps(s => s.map((st, i) => i === 3 ? { ...st, done: true } : st)), 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="p-6 space-y-4">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-3" style={{ animation: `fade-in-up 300ms ease-out ${i * 100}ms both` }}>
          {s.done ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6.5 12L3 8.5L4.17 7.33L6.5 9.67L11.83 4.33L13 5.5L6.5 12Z" fill="#2D6A4F"/>
            </svg>
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-t-[#2D6A4F] border-[#E2E4DF]"
              style={{ animation: 'spin 0.8s linear infinite' }}/>
          )}
          <div>
            <p className="font-dm text-[14px]" style={{ color: '#111827' }}>{s.text}</p>
            <p className="font-dm text-[11px]" style={{ color: '#9CA3AF' }}>{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfidenceGauge({ score }: { score: number }) {
  const size = 160;
  const r = 60;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score);
  const color = score >= 0.85 ? '#2D6A4F' : score >= 0.65 ? '#92400E' : '#991B1B';
  const label = score >= 0.85 ? 'Fast-Track Eligible' : score >= 0.65 ? 'Manual Review Required' : 'Escalate to Senior Underwriter';
  const labelBg = score >= 0.85 ? '#DCFCE7' : score >= 0.65 ? '#FEF3C7' : '#FEE2E2';
  const labelText = score >= 0.85 ? '#2D6A4F' : score >= 0.65 ? '#92400E' : '#991B1B';

  return (
    <div className="flex flex-col items-center mb-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E4DF" strokeWidth="10"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.3s ease' }}/>
        <text x={size/2} y={size/2 - 4} textAnchor="middle" dominantBaseline="central"
          fontFamily="IBM Plex Mono" fontSize="32" fontWeight="600" fill={color}>
          {(score * 100).toFixed(0)}
        </text>
        <text x={size/2} y={size/2 + 22} textAnchor="middle"
          fontFamily="DM Sans" fontSize="11" fill="#6B7280">/ 100</text>
      </svg>
      <span className="font-dm text-[11px] px-3 py-1 rounded-full mt-1"
        style={{ background: labelBg, color: labelText }}>{label}</span>
    </div>
  );
}

function Toggle({ label, subLabel, on, onToggle }: { label: string; subLabel: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#E2E4DF' }}>
      <div>
        <p className="font-dm text-[14px]" style={{ color: '#111827' }}>{label}</p>
        <p className="font-dm text-[11px]" style={{ color: '#9CA3AF' }}>{subLabel}</p>
      </div>
      <button onClick={onToggle}
        className="relative w-11 h-6 rounded-full transition-colors duration-200"
        style={{ background: on ? '#2D6A4F' : '#E2E4DF' }}>
        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
          style={{ left: on ? '22px' : '2px' }}/>
      </button>
    </div>
  );
}

function AgeSlider({ age, onAgeChange }: { age: number; onAgeChange: (a: number) => void }) {
  return (
    <div className="py-3 border-b" style={{ borderColor: '#E2E4DF' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="font-dm text-[14px]" style={{ color: '#111827' }}>Patient Age</p>
        <span className="font-mono text-[14px] font-semibold" style={{ color: '#2D6A4F' }}>{age}</span>
      </div>
      <input type="range" min="25" max="85" value={age} onChange={e => onAgeChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #2D6A4F ${((age - 25) / 60) * 100}%, #E2E4DF ${((age - 25) / 60) * 100}%)`,
        }}/>
      <p className="font-dm text-[11px] mt-1" style={{ color: '#9CA3AF' }}>
        {age >= 70 ? '+15% total, ICU risk flag applied' : age >= 60 ? '+8% total applied' : 'Standard pricing'}
      </p>
    </div>
  );
}

interface SchemeInfo {
  name: string;
  detail: string;
  eligibility: string;
  accent: string;
  questions: { q: string }[];
  coverageAmount: number;
}

const schemeDefinitions: SchemeInfo[] = [
  {
    name: "Ayushman Bharat PM-JAY",
    detail: `Up to ₹5,00,000/year · HBP Code H1701`,
    eligibility: "BPL / SECC-listed households",
    accent: "#F97316",
    questions: [{ q: "Is your family BPL or SECC listed? (Yes/No)" }, { q: "Annual income below ₹2.5L? (Yes/No)" }],
    coverageAmount: 500000,
  },
  {
    name: "Central Govt Health Scheme",
    detail: "For central govt employees & pensioners",
    eligibility: "NABH accreditation mandatory",
    accent: "#2563EB",
    questions: [{ q: "Are you a central government employee or pensioner? (Yes/No)" }],
    coverageAmount: 150000,
  },
  {
    name: "Employees State Insurance",
    detail: "Full coverage at ESIC network hospitals",
    eligibility: "Salary ≤ ₹21,000/month with ESI contribution",
    accent: "#2D6A4F",
    questions: [{ q: "Is your monthly salary below ₹21,000? (Yes/No)" }],
    coverageAmount: 100000,
  },
  {
    name: "MJPJAY Maharashtra",
    detail: `Covers up to ₹1,50,000 for this procedure`,
    eligibility: "Empanelled hospitals in Maharashtra only",
    accent: "#7C3AED",
    questions: [{ q: "Are you a Maharashtra resident? (Yes/No)" }],
    coverageAmount: 150000,
  },
];

function EligibilityModal({ scheme, onClose, onApply }: {
  scheme: SchemeInfo;
  onClose: () => void;
  onApply: (schemeName: string, amount: number) => void;
}) {
  const [answers, setAnswers] = useState<boolean[]>(scheme.questions.map(() => false));
  const [answered, setAnswered] = useState<boolean[]>(scheme.questions.map(() => false));
  const [submitted, setSubmitted] = useState(false);

  const allYes = answers.every(a => a);
  const allAnswered = answered.every(a => a);

  const handleAnswer = (idx: number, val: boolean) => {
    const newAnswers = [...answers];
    const newAnswered = [...answered];
    newAnswers[idx] = val;
    newAnswered[idx] = true;
    setAnswers(newAnswers);
    setAnswered(newAnswered);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(11,31,58,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 24px 64px rgba(11,31,58,0.25)', animation: 'fade-in-up 300ms ease-out' }}
        onClick={e => e.stopPropagation()}>

        <div className="px-5 py-4 border-b" style={{ borderColor: '#E2E4DF' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-dm text-[14px] font-semibold" style={{ color: '#0B1F3A' }}>{scheme.name}</p>
              <p className="font-dm text-[11px] mt-0.5" style={{ color: '#6B7280' }}>Quick Eligibility Check</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {!submitted ? (
          <div className="px-5 py-5 space-y-4">
            {scheme.questions.map((item, i) => (
              <div key={i}>
                <p className="font-dm text-[13px] mb-2" style={{ color: '#111827' }}>{item.q}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleAnswer(i, true)}
                    className="flex-1 py-2 rounded-lg font-dm text-[13px] font-semibold transition-colors"
                    style={{
                      background: answered[i] && answers[i] ? '#2D6A4F' : 'white',
                      color: answered[i] && answers[i] ? 'white' : '#2D6A4F',
                      border: `1.5px solid ${answered[i] && answers[i] ? '#2D6A4F' : '#C8E6D4'}`,
                    }}>
                    Yes
                  </button>
                  <button onClick={() => handleAnswer(i, false)}
                    className="flex-1 py-2 rounded-lg font-dm text-[13px] font-semibold transition-colors"
                    style={{
                      background: answered[i] && !answers[i] ? '#92400E' : 'white',
                      color: answered[i] && !answers[i] ? 'white' : '#92400E',
                      border: `1.5px solid ${answered[i] && !answers[i] ? '#92400E' : '#E2E4DF'}`,
                    }}>
                    No
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={!allAnswered}
              className="w-full py-2.5 rounded-lg font-dm text-[14px] font-semibold transition-opacity"
              style={{
                background: allAnswered ? '#2D6A4F' : '#E2E4DF',
                color: allAnswered ? 'white' : '#9CA3AF',
                cursor: allAnswered ? 'pointer' : 'not-allowed',
              }}>
              Check Eligibility
            </button>
          </div>
        ) : allYes ? (
          <div className="px-5 py-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: '#DCFCE7' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <p className="font-dm text-[15px] font-semibold" style={{ color: '#2D6A4F' }}>You are likely eligible</p>
            <p className="font-mono text-[18px] font-bold mt-2" style={{ color: '#0B1F3A' }}>
              Coverage: {formatRupee(scheme.coverageAmount)}
            </p>
            <p className="font-dm text-[11px] mt-1" style={{ color: '#6B7280' }}>Under {scheme.name}</p>
            <button onClick={() => onApply(scheme.name, scheme.coverageAmount)}
              className="w-full mt-4 py-2.5 rounded-lg font-dm text-[14px] font-semibold btn-hover"
              style={{ background: '#2D6A4F', color: 'white' }}>
              Apply This Scheme
            </button>
          </div>
        ) : (
          <div className="px-5 py-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: '#FEF3C7' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="font-dm text-[15px] font-semibold" style={{ color: '#92400E' }}>You may not be eligible</p>
            <p className="font-dm text-[12px] mt-2" style={{ color: '#6B7280' }}>
              Consult your nearest empanelled hospital for further assistance.
            </p>
            <button onClick={onClose}
              className="w-full mt-4 py-2.5 rounded-lg font-dm text-[14px] font-semibold btn-hover"
              style={{ border: '1.5px solid #E2E4DF', color: '#6B7280', background: 'white' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CostTable({ procedure, diabetes, cardiac, elderly, age, geoTier, confidence }: {
  procedure: string; diabetes: boolean; cardiac: boolean; elderly: boolean; age: number; geoTier: "Metro" | "Tier-2" | "Tier-3"; confidence: number;
}) {
  const data = procedureData[procedure];
  if (!data) return null;

  const [appliedSchemes, setAppliedSchemes] = useState<{ name: string; amount: number }[]>([]);
  const [modalScheme, setModalScheme] = useState<SchemeInfo | null>(null);

  const geoMultiplier = geoTier === 'Metro' ? 1.15 : geoTier === 'Tier-2' ? 1.05 : 1;
  const ageMultiplier = age >= 70 ? 1.15 : age >= 60 ? 1.08 : 1;

  const visibleComponents = data.components.filter(c => {
    if (c.hidden === 'cardiac' && !cardiac) return false;
    if (c.hidden === 'elderly' && !elderly) return false;
    return true;
  });

  const subtotal = visibleComponents.reduce((s, c) => s + c.benchmark, 0);
  const diabetesAdj = diabetes ? subtotal * 0.18 : 0;
  const cardiacAdj = cardiac ? subtotal * 0.30 : 0;
  const elderlyAdj = elderly ? subtotal * 0.10 : 0;
  const ageAdj = age >= 70 ? subtotal * 0.15 : age >= 60 ? subtotal * 0.08 : 0;
  const geoAdj = (geoMultiplier - 1) * subtotal;
  const baseSchemeDeduction = data.pmjayCoverage;
  const extraSchemeDeduction = appliedSchemes.reduce((s, sc) => s + sc.amount, 0);
  const schemeDeduction = baseSchemeDeduction + extraSchemeDeduction;
  const grossTotal = (subtotal + diabetesAdj + cardiacAdj + elderlyAdj + ageAdj + geoAdj) * ageMultiplier;
  const netLiability = Math.max(0, grossTotal - schemeDeduction);

  const handleApplyScheme = (name: string, amount: number) => {
    setAppliedSchemes(prev => {
      if (prev.some(s => s.name === name)) return prev;
      return [...prev, { name, amount }];
    });
    setModalScheme(null);
  };

  const scoreLabel = confidence >= 0.85 ? 'Fast-Track Eligible' : confidence >= 0.65 ? 'Manual Review Required' : 'Escalate to Senior Underwriter';

  const generatePDF = () => {
    const jsPDF = (window as any).jspdf?.jsPDF;
    if (!jsPDF) return;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(11, 31, 58);
    doc.text('CURIFY', margin, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('AI Underwriting Report', margin + 38, y);
    y += 6;
    doc.setDrawColor(226, 228, 223);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // Procedure & Score
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 31, 58);
    doc.text(data.name, margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Underwriting Score: ${(confidence * 100).toFixed(0)} / 100`, margin, y);
    y += 5;
    doc.setTextColor(confidence >= 0.85 ? 45 : confidence >= 0.65 ? 146 : 153,
                      confidence >= 0.85 ? 106 : confidence >= 0.65 ? 64 : 27,
                      confidence >= 0.85 ? 79 : confidence >= 0.65 ? 14 : 27);
    doc.text(scoreLabel, margin, y);
    y += 8;
    doc.setDrawColor(226, 228, 223);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // Cost Breakdown Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 31, 58);
    doc.text('Component Cost Breakdown', margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text('Anchored to NHA HBP / CGHS / PM-JAY / NPPA — 2024', margin, y);
    y += 6;

    const cols = [margin, margin + 48, margin + 74, margin + 100, margin + 130, margin + 156];
    const headers = ['Component', 'Min', 'Max', 'Benchmark', 'Source', 'Coverage'];

    doc.setFillColor(247, 249, 248);
    doc.rect(margin, y - 3, pageW - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    headers.forEach((h, i) => doc.text(h, cols[i], y));
    y += 5;
    doc.setDrawColor(226, 228, 223);
    doc.line(margin, y, pageW - margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    visibleComponents.forEach(c => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setTextColor(17, 24, 39);
      doc.text(c.name, cols[0], y);
      doc.text(formatRupee(c.min), cols[1], y);
      doc.text(formatRupee(c.max), cols[2], y);
      doc.setTextColor(45, 106, 79);
      doc.text(formatRupee(c.benchmark), cols[3], y);
      doc.setTextColor(107, 114, 128);
      doc.text(c.source, cols[4], y);
      doc.text(c.coverage, cols[5], y);
      y += 5;
    });

    y += 2;
    doc.setDrawColor(226, 228, 223);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, y, pageW - margin, y);
    doc.setLineDashPattern([], 0);
    y += 6;

    // Subtotal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 31, 58);
    doc.text('Subtotal', margin, y);
    doc.text(formatRupee(Math.round(subtotal)), cols[3], y);
    y += 5;

    // Adjustments
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const adjustments: [string, number, boolean][] = [
      ['+18% Diabetes Adjustment', diabetesAdj, diabetes],
      ['+30% Cardiac Adjustment', cardiacAdj, cardiac],
      ['+10% Elderly Adjustment', elderlyAdj, elderly],
      [`+${age >= 70 ? '15' : '8'}% Age Adjustment (${age}y)`, ageAdj, age >= 60],
    ];
    adjustments.forEach(([label, val, active]) => {
      if (!active) return;
      doc.setTextColor(146, 64, 14);
      doc.text(label, margin, y);
      doc.text(`+${formatRupee(Math.round(val))}`, cols[3], y);
      y += 5;
    });

    doc.setTextColor(30, 58, 95);
    doc.text(`${geoTier} Premium Applied: +${Math.round((geoMultiplier - 1) * 100)}%`, margin, y);
    doc.text(`+${formatRupee(Math.round(geoAdj))}`, cols[3], y);
    y += 5;

    doc.setTextColor(45, 106, 79);
    doc.text('PM-JAY Coverage', margin, y);
    doc.text(`-${formatRupee(baseSchemeDeduction)}`, cols[3], y);
    y += 5;

    appliedSchemes.forEach(s => {
      doc.text(s.name, margin, y);
      doc.text(`-${formatRupee(s.amount)}`, cols[3], y);
      y += 5;
    });
    y += 2;

    // Net Patient Liability
    doc.setDrawColor(226, 228, 223);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(11, 31, 58);
    doc.text('Net Patient Liability', margin, y);
    doc.setFontSize(11);
    doc.text(formatRupee(Math.round(netLiability)), cols[3], y);
    y += 4;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text(`Gross: ${formatRupee(Math.round(grossTotal))}  |  Scheme Deduction: -${formatRupee(schemeDeduction)}`, margin, y);
    y += 10;

    // Recommended Loan Range
    doc.setDrawColor(226, 228, 223);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 31, 58);
    doc.text('Recommended Loan Range', margin, y);
    y += 7;
    doc.setFontSize(14);
    doc.text(`${formatLakhs(Math.round(netLiability * 1.05))} – ${formatLakhs(Math.round(grossTotal * 1.15))}`, margin, y);
    y += 6;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text('Anchored to NHA/CGHS Schedule 2024 + PM-JAY Package Rates', margin, y);
    y += 4;
    doc.text('Compliant with RBI Healthcare Lending Guidelines 2024', margin, y);

    // Footer date
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, pageH - 10);
    doc.text('CURIFY AI Underwriter — For informational purposes only', margin, pageH - 5);

    doc.save(`CURIFY_Report_${data.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: string } | null>(null);

  const tooltipContent: Record<string, string> = {
    "NHA HBP 2024": "Source: NHA Health Benefit Package Schedule, 2024\nProcedure Code: HBP2234\nLast revised: January 2024",
    "CGHS 2024": "Source: CGHS Approved Rate List, 2024\nCategory: General Surgery\nLast revised: April 2024",
    "NPPA 2024": "Source: NPPA Price Ceiling Notification, 2024\nDevice Class: Implant\nLast revised: March 2024",
    "CGHS Ward 2024": "Source: CGHS Ward Rate Schedule, 2024\nCategory: General Ward\nLast revised: January 2024",
    "CGHS ICU 2024": "Source: CGHS ICU Rate Schedule, 2024\nCategory: ICU/ICCU\nLast revised: February 2024",
    "NPPA EML 2024": "Source: NPPA Essential Medicines List, 2024\nCategory: Essential Drugs\nLast revised: March 2024",
    "CGHS Diagnostic 2024": "Source: CGHS Diagnostic Rate Schedule, 2024\nCategory: Pathology/Radiology\nLast revised: April 2024",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-dm text-[13px] font-semibold" style={{ color: '#0B1F3A' }}>Component Cost Breakdown</h3>
      </div>
      <p className="font-dm text-[11px] mb-3" style={{ color: '#9CA3AF' }}>
        Anchored to NHA HBP · CGHS · PM-JAY · NPPA — 2024
      </p>

      <div className="responsive-table">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: '#F7F9F8' }}>
              {['Component', 'Min (₹)', 'Max (₹)', 'Govt Benchmark (₹)', 'Source', 'Scheme Coverage'].map(h => (
                <th key={h} className="font-dm text-[10px] uppercase tracking-wider text-left px-3 py-2"
                  style={{ color: '#9CA3AF', borderBottom: '2px solid #E2E4DF' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleComponents.map((c, i) => (
              <tr key={i} className="hover:bg-[#F7F9F8] transition-colors"
                style={{ animation: `fade-in-up 300ms ease-out ${i * 40}ms both` }}>
                <td className="font-dm text-[13px] px-3 py-2.5" style={{ color: '#111827' }}>
                  {c.name}
                  {c.warning && (
                    <span className="block mt-0.5 font-dm text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: '#FEE2E2', color: '#991B1B' }}>
                      ⚠ {c.warning}
                    </span>
                  )}
                </td>
                <td className="font-mono text-[13px] px-3 py-2.5 relative" style={{ color: '#111827' }}
                  onMouseEnter={() => setHoveredCell({ row: i, col: 'min' })}
                  onMouseLeave={() => setHoveredCell(null)}>
                  {formatRupee(c.min)}
                  {hoveredCell?.row === i && hoveredCell?.col === 'min' && (
                    <div className="curify-tooltip" style={{ top: -40, left: 0 }}>
                      {tooltipContent[c.source] || `Source: ${c.source}`}
                    </div>
                  )}
                </td>
                <td className="font-mono text-[13px] px-3 py-2.5 relative" style={{ color: '#111827' }}
                  onMouseEnter={() => setHoveredCell({ row: i, col: 'max' })}
                  onMouseLeave={() => setHoveredCell(null)}>
                  {formatRupee(c.max)}
                  {hoveredCell?.row === i && hoveredCell?.col === 'max' && (
                    <div className="curify-tooltip" style={{ top: -40, left: 0 }}>
                      {tooltipContent[c.source] || `Source: ${c.source}`}
                    </div>
                  )}
                </td>
                <td className="font-mono text-[13px] px-3 py-2.5 relative font-semibold" style={{ color: '#2D6A4F' }}
                  onMouseEnter={() => setHoveredCell({ row: i, col: 'benchmark' })}
                  onMouseLeave={() => setHoveredCell(null)}>
                  {formatRupee(c.benchmark)}
                  {hoveredCell?.row === i && hoveredCell?.col === 'benchmark' && (
                    <div className="curify-tooltip" style={{ top: -40, left: 0 }}>
                      {tooltipContent[c.source] || `Source: ${c.source}`}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5"><SourceBadge source={c.source} /></td>
                <td className="font-dm text-[12px] px-3 py-2.5" style={{ color: '#6B7280' }}>{c.coverage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer calculations */}
      <div className="mt-4 border-t-2 border-dashed" style={{ borderColor: '#E2E4DF' }}>
        <div className="flex justify-between py-2.5 px-3">
          <span className="font-dm text-[13px] font-semibold" style={{ color: '#0B1F3A' }}>Subtotal</span>
          <span className="font-mono text-[13px] font-bold" style={{ color: '#0B1F3A' }}>{formatRupee(Math.round(subtotal))}</span>
        </div>

        {diabetes && (
          <div className="flex justify-between py-2 px-3 rounded" style={{ background: '#FEF3C7' }}>
            <span className="font-dm text-[12px]" style={{ color: '#92400E' }}>+18% Diabetes Adjustment</span>
            <span className="font-mono text-[12px]" style={{ color: '#92400E' }}>+{formatRupee(Math.round(diabetesAdj))}</span>
          </div>
        )}
        {cardiac && (
          <div className="flex justify-between py-2 px-3 rounded" style={{ background: '#FEF3C7' }}>
            <span className="font-dm text-[12px]" style={{ color: '#92400E' }}>+30% Cardiac Adjustment</span>
            <span className="font-mono text-[12px]" style={{ color: '#92400E' }}>+{formatRupee(Math.round(cardiacAdj))}</span>
          </div>
        )}
        {elderly && (
          <div className="flex justify-between py-2 px-3 rounded" style={{ background: '#FEF3C7' }}>
            <span className="font-dm text-[12px]" style={{ color: '#92400E' }}>+10% Elderly Adjustment</span>
            <span className="font-mono text-[12px]" style={{ color: '#92400E' }}>+{formatRupee(Math.round(elderlyAdj))}</span>
          </div>
        )}
        {age >= 60 && (
          <div className="flex justify-between py-2 px-3 rounded" style={{ background: '#FEF3C7' }}>
            <span className="font-dm text-[12px]" style={{ color: '#92400E' }}>
              +{age >= 70 ? '15' : '8'}% Age Adjustment ({age}y)
            </span>
            <span className="font-mono text-[12px]" style={{ color: '#92400E' }}>+{formatRupee(Math.round(ageAdj))}</span>
          </div>
        )}

        <div className="flex justify-between py-2 px-3 rounded" style={{ background: '#EFF6FF' }}>
          <span className="font-dm text-[12px]" style={{ color: '#1E3A5F' }}>
            {geoTier} Premium Applied: +{Math.round((geoMultiplier - 1) * 100)}%
          </span>
          <span className="font-mono text-[12px]" style={{ color: '#1E3A5F' }}>+{formatRupee(Math.round(geoAdj))}</span>
        </div>

        <div className="flex justify-between py-2 px-3 rounded" style={{ background: '#DCFCE7' }}>
          <span className="font-dm text-[12px]" style={{ color: '#2D6A4F' }}>PM-JAY Coverage</span>
          <span className="font-mono text-[12px]" style={{ color: '#2D6A4F' }}>–{formatRupee(baseSchemeDeduction)}</span>
        </div>

        {appliedSchemes.map((s, i) => (
          <div key={i} className="flex justify-between py-2 px-3 rounded" style={{ background: '#DCFCE7' }}>
            <span className="font-dm text-[12px]" style={{ color: '#2D6A4F' }}>{s.name}</span>
            <span className="font-mono text-[12px]" style={{ color: '#2D6A4F' }}>–{formatRupee(s.amount)}</span>
          </div>
        ))}

        <div className="flex justify-between items-center py-4 px-3">
          <div>
            <p className="font-dm text-[15px] font-semibold" style={{ color: '#0B1F3A' }}>Net Patient Liability</p>
            <p className="font-dm text-[11px]" style={{ color: '#9CA3AF' }}>
              Gross: {formatRupee(Math.round(grossTotal))} | Scheme Deduction: –{formatRupee(schemeDeduction)}
            </p>
          </div>
          <span className="font-mono text-[20px] font-bold" style={{ color: '#0B1F3A' }}>
            {formatRupee(Math.round(netLiability))}
          </span>
        </div>
      </div>

      {/* Government Scheme Eligibility */}
      <div className="mt-6">
        <h3 className="font-dm text-[13px] font-semibold mb-3" style={{ color: '#0B1F3A' }}>Applicable Government Schemes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {schemeDefinitions.map((s, i) => {
            const isApplied = appliedSchemes.some(a => a.name === s.name);
            return (
              <div key={i} className="bg-white rounded-[10px] p-3.5 border card-hover"
                style={{ borderLeft: `4px solid ${s.accent}`, borderColor: `${s.accent}33` }}>
                <p className="font-dm text-[13px] font-bold" style={{ color: '#0B1F3A' }}>{s.name}</p>
                <p className="font-dm text-[12px] mt-1" style={{ color: '#6B7280' }}>{s.detail}</p>
                <p className="font-dm text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>Eligibility: {s.eligibility}</p>
                {isApplied ? (
                  <span className="inline-flex items-center gap-1 mt-2 font-dm text-[11px] px-3 py-1 rounded-full"
                    style={{ background: '#DCFCE7', color: '#2D6A4F' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Applied – {formatRupee(s.coverageAmount)}
                  </span>
                ) : (
                  <button onClick={() => setModalScheme(s)}
                    className="mt-2 font-dm text-[11px] px-3 py-1 rounded border btn-hover"
                    style={{ borderColor: s.accent, color: s.accent }}>
                    Check Eligibility
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Applied Schemes Deductions */}
      {appliedSchemes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-dm text-[13px] font-semibold" style={{ color: '#0B1F3A' }}>Applied Scheme Deductions</h3>
          {appliedSchemes.map((s, i) => (
            <div key={i} className="flex justify-between py-2 px-3 rounded" style={{ background: '#DCFCE7' }}>
              <span className="font-dm text-[12px]" style={{ color: '#2D6A4F' }}>{s.name}</span>
              <span className="font-mono text-[12px]" style={{ color: '#2D6A4F' }}>-{formatRupee(s.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {modalScheme && (
        <EligibilityModal
          scheme={modalScheme}
          onClose={() => setModalScheme(null)}
          onApply={handleApplyScheme}
        />
      )}

      {/* Loan Sanction Recommendation */}
      <div className="mt-6 rounded-xl p-6 border-2" style={{ borderColor: '#2D6A4F' }}>
        <h3 className="font-dm text-[15px] font-semibold mb-2" style={{ color: '#0B1F3A' }}>Recommended Loan Range</h3>
        <p className="font-mono text-[28px] font-bold" style={{ color: '#0B1F3A' }}>
          {formatLakhs(Math.round(netLiability * 1.05))} – {formatLakhs(Math.round(grossTotal * 1.15))}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="font-dm text-[11px] px-2.5 py-1 rounded-full"
            style={{ background: '#F3E8FF', color: '#6B21A8' }}>Premium Hospital</span>
          <GeoTierBadge tier={geoTier} />
          <span className="font-dm text-[11px] px-2.5 py-1 rounded-full"
            style={{
              background: netLiability / grossTotal < 0.5 ? '#DCFCE7' : netLiability / grossTotal < 0.7 ? '#FEF3C7' : '#FEE2E2',
              color: netLiability / grossTotal < 0.5 ? '#2D6A4F' : netLiability / grossTotal < 0.7 ? '#92400E' : '#991B1B',
            }}>
            {netLiability / grossTotal < 0.5 ? 'Low NPA Risk' : netLiability / grossTotal < 0.7 ? 'Medium NPA Risk' : 'High NPA Risk'}
          </span>
        </div>
        <p className="font-dm text-[11px] mt-3" style={{ color: '#9CA3AF' }}>
          Anchored to NHA/CGHS Schedule 2024 + PM-JAY Package Rates
        </p>
        <p className="font-dm text-[11px]" style={{ color: '#9CA3AF' }}>
          Compliant with RBI Healthcare Lending Guidelines 2024
        </p>
      </div>

      {/* Download Report */}
      <button onClick={generatePDF}
        className="w-full mt-4 py-3 rounded-lg font-dm text-[14px] font-semibold btn-hover"
        style={{ background: '#2D6A4F', color: 'white' }}>
        <span className="flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Report
        </span>
      </button>

      {/* Audit Export */}
      <button className="w-full mt-4 py-3 rounded-lg font-dm text-[14px] font-semibold btn-hover opacity-60 cursor-not-allowed"
        style={{ border: '1.5px solid #2D6A4F', color: '#2D6A4F', background: 'transparent' }}
        disabled
        title="Full audit trail export available in production version. Includes: Source citations, ICD codes, scheme eligibility proof, underwriter sign-off chain, RBI-format report.">
        <span className="flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Export Audit Report
        </span>
      </button>
    </div>
  );
}

export default function LenderView({ searchQuery, geoTier, location }: LenderViewProps) {
  const [procedure, setProcedure] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [diabetes, setDiabetes] = useState(false);
  const [cardiac, setCardiac] = useState(false);
  const [elderly, setElderly] = useState(false);
  const [age, setAge] = useState(45);

  useEffect(() => {
    const matched = matchProcedure(searchQuery);
    if (matched) {
      setLoading(true);
      setTableLoading(true);
      const timer = setTimeout(() => {
        setProcedure(matched);
        setLoading(false);
      }, 2500);
      const tableTimer = setTimeout(() => setTableLoading(false), 3200);
      return () => { clearTimeout(timer); clearTimeout(tableTimer); };
    } else {
      setProcedure('knee replacement');
      setLoading(true);
      setTableLoading(true);
      const timer = setTimeout(() => setLoading(false), 2500);
      const tableTimer = setTimeout(() => setTableLoading(false), 3200);
      return () => { clearTimeout(timer); clearTimeout(tableTimer); };
    }
  }, [searchQuery]);

  const data = procedure ? procedureData[procedure] : null;
  const baseConfidence = data?.confidence ?? 0.87;
  const confidence = Math.max(0.1,
    baseConfidence
    - (diabetes ? 0.08 : 0)
    - (cardiac ? 0.12 : 0)
    - (elderly ? 0.05 : 0)
    - (age >= 70 ? 0.07 : age >= 60 ? 0.03 : 0)
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#F3F4F1' }}>
      {/* Left Panel */}
      <div className="w-full md:w-1/2 overflow-y-auto p-6 md:p-8" style={{ background: '#F3F4F1', maxHeight: '100vh' }}>
        <h2 className="font-playfair text-xl font-semibold mb-6" style={{ color: '#0B1F3A' }}>Patient Request</h2>

        {/* Extracted Patient Data */}
        <div className="mb-6">
          <p className="font-dm text-[12px] uppercase tracking-widest mb-4" style={{ color: '#9CA3AF' }}>Extracted Patient Data</p>
          {[
            { label: "Age Group", value: age >= 65 ? "Senior (65+)" : age >= 40 ? "Middle-aged (40-64)" : "Young (25-39)" },
            { label: "Gender", value: "Not specified" },
            { label: "Location", value: location || "Not specified" },
            { label: "Geo-Tier", value: <GeoTierBadge tier={geoTier} /> },
            { label: "Detected Comorbidities", value: [diabetes && "Diabetes", cardiac && "Cardiac History"].filter(Boolean).join(", ") || "None detected" },
            { label: "Budget Ceiling", value: <span className="font-mono">Not specified</span> },
          ].map((f, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#E2E4DF' }}>
              <span className="font-dm text-[12px]" style={{ color: '#9CA3AF' }}>{f.label}</span>
              <span className="font-dm text-[14px]" style={{ color: '#111827' }}>{f.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2">
            <span className="font-dm text-[12px]" style={{ color: '#9CA3AF' }}>Procedure Confidence</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px]" style={{ color: '#2D6A4F' }}>{(confidence * 100).toFixed(0)}%</span>
              <div className="w-20 h-2 rounded-full" style={{ background: '#E2E4DF' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${confidence * 100}%`, background: '#2D6A4F' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* ICD-10 Codes */}
        {data && (
          <div className="mb-6">
            <p className="font-dm text-[12px] uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>ICD-10 Classification</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {data.icdCodes.map((c, i) => (
                <span key={i} className="flex-shrink-0 font-mono text-[10px] px-2 py-1 rounded"
                  style={{ background: '#EFF6FF', color: '#1E3A5F', border: '1px solid #BFDBFE' }}>
                  {c.code} · {c.desc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comorbidity Risk Flags */}
        {(diabetes || cardiac) && (
          <div className="mb-6 space-y-2">
            <p className="font-dm text-[12px] uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Risk Flags</p>
            {diabetes && (
              <div className="rounded-lg p-3" style={{ background: '#FEF3C7', borderLeft: '4px solid #92400E' }}>
                <p className="font-dm text-[13px] font-bold" style={{ color: '#92400E' }}>Diabetes Complication Risk</p>
                <p className="font-dm text-[12px]" style={{ color: '#6B7280' }}>Elevated infection risk, slower wound healing</p>
                <p className="font-mono text-[12px] mt-1" style={{ color: '#92400E' }}>+18% cost uplift applied</p>
              </div>
            )}
            {cardiac && (
              <div className="rounded-lg p-3" style={{ background: '#FEE2E2', borderLeft: '4px solid #991B1B' }}>
                <p className="font-dm text-[13px] font-bold" style={{ color: '#991B1B' }}>Cardiac Clearance Required</p>
                <p className="font-dm text-[12px]" style={{ color: '#6B7280' }}>High-risk procedure. Senior underwriter sign-off required.</p>
                <p className="font-mono text-[12px] mt-1" style={{ color: '#991B1B' }}>+30% contingency applied</p>
              </div>
            )}
          </div>
        )}

        {/* Risk Adjustment Controls */}
        <div className="mb-6">
          <p className="font-dm text-[12px] uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Risk Adjustment Controls</p>
          <Toggle label="Diabetes" subLabel="+18% to medicines, surgeon fee, post-op" on={diabetes} onToggle={() => setDiabetes(!diabetes)} />
          <Toggle label="Prior Cardiac History" subLabel="+30% total, adds ICU row, cardiac flag" on={cardiac} onToggle={() => setCardiac(!cardiac)} />
          <Toggle label="Elderly Patient 65+" subLabel="+10% total, adds physiotherapy row" on={elderly} onToggle={() => setElderly(!elderly)} />
          <AgeSlider age={age} onAgeChange={setAge} />
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px" style={{ background: '#E2E4DF' }}/>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 overflow-y-auto p-6 md:p-8 bg-white" style={{ maxHeight: '100vh' }}>
        <h2 className="font-playfair text-xl font-semibold mb-6" style={{ color: '#0B1F3A' }}>Underwriting Output</h2>

        {loading ? (
          <LoadingSteps />
        ) : (
          <>
            <ConfidenceGauge score={confidence} />

            {/* Time Saving Counter */}
            <div className="rounded-lg p-3 mb-4" style={{ background: '#F3F4F1' }}>
              <p className="font-mono text-[13px]">
                <span style={{ color: '#991B1B' }}>Manual Underwriting: 4–6 hrs</span>
                {'  |  '}
                <span className="font-semibold" style={{ color: '#2D6A4F' }}>CURIFY: 8 min</span>
                {'  |  '}
                <span className="font-semibold" style={{ color: '#2D6A4F' }}>Time Saved: 96.7%</span>
              </p>
            </div>

            {tableLoading ? (
              <CostTableSkeleton />
            ) : procedure && (
              <CostTable
                procedure={procedure}
                diabetes={diabetes}
                cardiac={cardiac}
                elderly={elderly}
                age={age}
                geoTier={geoTier}
                confidence={confidence}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
