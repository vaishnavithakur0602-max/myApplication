import { useEffect, useRef, useState } from 'react';
import { useCountUp, useIntersectionObserver } from '../hooks/useAnimations';

function BeforeAfterTimer() {
  const [traditionalSec, setTraditionalSec] = useState(0);
  const [curifySec, setCurifySec] = useState(0);
  const [curifyDone, setCurifyDone] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;

      // Traditional: counts up slowly, 1 second = ~1 hour (reaches 4hr at 4s, 6hr at 6s)
      setTraditionalSec(Math.min(elapsed * 1, 6));

      // CURIFY: completes in 8 seconds
      if (elapsed <= 8) {
        setCurifySec(elapsed);
      } else if (!curifyDone) {
        setCurifyDone(true);
      }

      if (elapsed < 8 || !curifyDone) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const formatTraditional = (hrs: number) => {
    const h = Math.floor(hrs);
    const m = Math.floor((hrs - h) * 60);
    return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
  };

  return (
    <div className="flex items-center justify-center gap-8 md:gap-16 mt-8"
      style={{ animation: 'fade-in-up 400ms ease-out 440ms both' }}>
      {/* Traditional */}
      <div className="flex flex-col items-center">
        <p className="font-dm text-[11px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Traditional Underwriting
        </p>
        <div className="relative w-20 h-20">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#991B1B" strokeWidth="4"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - Math.min(traditionalSec / 6, 1))}
              strokeLinecap="round" transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[14px] font-semibold" style={{ color: '#991B1B' }}>
              {formatTraditional(traditionalSec)}
            </span>
          </div>
        </div>
        <p className="font-dm text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>4–6 hours</p>
      </div>

      {/* VS divider */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-dm text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>vs</span>
      </div>

      {/* CURIFY */}
      <div className="flex flex-col items-center">
        <p className="font-dm text-[11px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          CURIFY AI
        </p>
        <div className="relative w-20 h-20">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#2D6A4F" strokeWidth="4"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - Math.min(curifySec / 8, 1))}
              strokeLinecap="round" transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[14px] font-semibold" style={{ color: '#2D6A4F' }}>
              {curifyDone ? '8m' : `${Math.floor(curifySec)}s`}
            </span>
          </div>
        </div>
        <p className="font-dm text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>8 minutes</p>
      </div>
    </div>
  );
}

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(168,213,186,${0.04 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168,213,186,0.07)';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ willChange: 'transform' }} />;
}

function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const { value: count } = useCountUp(value, 2000);
  return (
    <div className="flex flex-col items-center px-7 py-5 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        animation: `fade-in-up 400ms ease-out ${delay}ms both`,
      }}>
      <span className="font-mono text-[32px] text-white font-semibold">
        {suffix === 'L Cr+' ? `₹${(count / 10).toFixed(1)}L Cr+` :
         suffix === 'Cr+' ? `${(count / 10).toFixed(0)} Cr+` :
         suffix === '%' ? `${(count / 10).toFixed(1)}%` :
         count.toLocaleString('en-IN') + suffix}
      </span>
      <span className="font-dm text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    </div>
  );
}

function TrustBar() {
  const items = [
    "Powered by NHA HBP 2024", "CGHS Rate List 2024", "PM-JAY Package Rates",
    "NPPA Price Caps 2024", "Ayushman Bharat", "IRDAI Guidelines", "ESIC Schedule",
    "RBI Healthcare Lending Norms", "ICD-10 Clinical Coding", "NABH Accreditation Standards",
  ];
  const text = items.map(t => t).join('  \u00B7  ') + '  \u00B7  ';
  const doubled = text + text;

  return (
    <div className="overflow-hidden py-3.5" style={{ background: '#0D2438' }}>
      <div className="flex whitespace-nowrap hover:[animation-play-state:paused]"
        style={{ animation: 'marquee 40s linear infinite' }}>
        <span className="font-mono text-[12px] inline-block" style={{ color: 'rgba(168,213,186,0.6)' }}>
          {doubled}
        </span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const { ref, visible } = useIntersectionObserver();
  const cards = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="18" r="10" stroke="#2D6A4F" strokeWidth="2.5" fill="none"/>
          <path d="M12 42c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#2D6A4F" strokeWidth="2.5" fill="none"/>
        </svg>
      ),
      title: "Patient Describes Need",
      body: "Types or speaks their procedure in plain language. CURIFY maps it to ICD-10 codes and NHA benchmarks instantly.",
      chip: "Voice Input Supported",
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ animation: 'spin 8s linear infinite' }}>
          <path d="M24 4l4 8-4 8-4-8 4-8zM24 44l-4-8 4-8 4 8-4 8zM4 24l8-4 8 4-8 4-8-4zM44 24l-8 4-8-4 8-4 8 4z" stroke="#2D6A4F" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="24" r="6" stroke="#2D6A4F" strokeWidth="2" fill="none"/>
        </svg>
      ),
      title: "AI Anchors to Govt Data",
      body: "Cross-references NHA, CGHS, PM-JAY, NPPA in real-time. Geo-adjusts for Metro / Tier-2 / Tier-3 pricing automatically.",
      chip: "8-second processing",
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="6" width="32" height="36" rx="3" stroke="#2D6A4F" strokeWidth="2.5" fill="none"/>
          <path d="M16 16h16M16 22h16M16 28h10" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round"/>
          <path d="M30 34l4 4 6-8" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Lender Gets Audit-Ready Report",
      body: "Underwriting confidence score, cost breakdown, scheme deductions, and loan range — RBI compliant and exportable.",
      chip: "Export to PDF",
    },
  ];

  return (
    <section ref={ref} className="py-20 px-10" style={{ background: '#F7F9F8' }}>
      <h2 className="font-playfair text-[40px] text-center mb-12" style={{ color: '#0B1F3A' }}>
        From Query to Sanction in 8 Minutes
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={i}
            className={`bg-white rounded-2xl p-8 border card-hover ${visible ? 'animate-entrance visible' : 'animate-entrance'}`}
            style={{ borderColor: '#E2E4DF', transitionDelay: `${i * 120}ms` }}>
            <div className="mb-4">{c.icon}</div>
            <h3 className="font-playfair text-lg font-semibold mb-2" style={{ color: '#0B1F3A' }}>{c.title}</h3>
            <p className="font-dm text-[14px] leading-relaxed mb-4" style={{ color: '#6B7280' }}>{c.body}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full font-dm text-[11px]"
              style={{ background: '#DCFCE7', color: '#2D6A4F' }}>{c.chip}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RealDataStats() {
  const { ref, visible } = useIntersectionObserver();
  const stats = [
    { value: "₹54,720", label: "NPPA cap on standard knee implant (Mar 2024)", source: "NPPA 2024", url: "https://www.nppaindia.nic.in/" },
    { value: "₹80,000", label: "PM-JAY all-inclusive knee replacement package", source: "PM-JAY 2024", url: "https://pmjay.gov.in/" },
    { value: "4.8 Cr+", label: "Ayushman Bharat beneficiary families covered", source: "NHA 2024", url: "https://nhp.gov.in/" },
    { value: "18–30%", label: "Avg cost uplift range for comorbid patients", source: "CGHS 2024", url: "https://cghs.gov.in/" },
  ];

  return (
    <section ref={ref} className="py-20 px-10" style={{ background: '#0B1F3A' }}>
      <h2 className="font-playfair text-[40px] text-white text-center mb-12">Real Numbers. Real Sources.</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((s, i) => (
          <div key={i}
            className={`rounded-xl p-7 card-hover ${visible ? 'animate-entrance visible' : 'animate-entrance'}`}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              transitionDelay: `${i * 80}ms`,
            }}>
            <div className="font-mono text-[44px] font-semibold" style={{ color: '#A8D5BA' }}>{s.value}</div>
            <p className="font-dm text-[14px] mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.label}</p>
            <a href={s.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded font-mono text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: '#EFF6FF', color: '#1E3A5F', border: '1px solid #BFDBFE' }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 2H10L14 6V14H4V2Z" stroke="#1E3A5F" strokeWidth="1.5" fill="none"/><path d="M10 2V6H14" stroke="#1E3A5F" strokeWidth="1.5" fill="none"/></svg>
              {s.source}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: '#0B1F3A' }}>
        <NetworkCanvas />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Main heading */}
          <h1 className="font-playfair text-[36px] md:text-[64px] text-white leading-[1.15] mb-6"
            style={{ animation: `fade-in-up 400ms ease-out 120ms both` }}>
            India's First{' '}
            <span className="relative inline-block">
              AI Underwriter
              <span className="absolute bottom-[-4px] left-0 h-[3px] rounded-sm"
                style={{
                  background: '#2D6A4F',
                  animation: mounted ? 'draw-underline 800ms ease-out 600ms both' : 'none',
                }}/>
            </span>
            <br />for Healthcare Loans
          </h1>

          {/* Sub-heading */}
          <p className="font-dm text-[16px] mb-10"
            style={{ color: 'rgba(255,255,255,0.5)', animation: `fade-in-up 400ms ease-out 240ms both` }}>
            Anchored to{' '}
            {['NHA', 'CGHS', 'PM-JAY', 'NPPA', 'Ayushman Bharat'].map((s, i) => (
              <span key={i} className="transition-colors duration-200 hover:text-[#A8D5BA] cursor-default">
                {i > 0 ? ' \u00B7 ' : ''}{s}
              </span>
            ))}
          </p>

          {/* Live counters */}
          <div className="flex flex-wrap justify-center gap-4 mb-6"
            style={{ animation: `fade-in-up 400ms ease-out 360ms both` }}>
            <StatCard value={23} suffix="L Cr+" label="Healthcare loans disbursed FY24" delay={0} />
            <StatCard value={55} suffix="Cr+" label="PM-JAY beneficiaries enrolled" delay={80} />
            <StatCard value={967} suffix="%" label="Time saved vs manual underwriting" delay={160} />
          </div>

          {/* Before/After Timer */}
          <BeforeAfterTimer />

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3"
            style={{ animation: `fade-in-up 400ms ease-out 480ms both` }}>
            <button onClick={() => onNavigate('patient')}
              className="btn-hover font-dm text-[16px] text-white rounded-lg px-8 py-3.5"
              style={{ background: '#2D6A4F' }}>
              Explore as Patient →
            </button>
            <button onClick={() => onNavigate('lender')}
              className="btn-hover font-dm text-[16px] rounded-lg px-8 py-3.5"
              style={{ border: '1.5px solid #2D6A4F', color: '#A8D5BA', background: 'transparent' }}>
              View Lender Dashboard →
            </button>
          </div>
          <p className="font-dm text-[12px] mt-3"
            style={{ color: 'rgba(255,255,255,0.25)', animation: `fade-in-up 400ms ease-out 600ms both` }}>
            No login required · Live demo
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ color: 'rgba(255,255,255,0.25)', animation: 'bounce-down 2s ease-in-out infinite' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </div>

      <TrustBar />
      <HowItWorks />
      <RealDataStats />

      {/* Final CTA */}
      <section className="py-24 px-10 text-center"
        style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #1a3a2a 100%)' }}>
        <button onClick={() => onNavigate('patient')}
          className="btn-hover font-playfair text-[28px] text-white rounded-xl px-12 py-5"
          style={{ background: '#2D6A4F' }}>
          Launch CURIFY Navigator →
        </button>
        <p className="font-dm text-[13px] mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Built by Vaishnavi Thakur
        </p>
      </section>
    </div>
  );
}
