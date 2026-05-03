import { useEffect, useRef, useState, useCallback } from 'react';

export function useIntersectionObserver(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function useCountUp(target: number, duration = 2000, startOnMount = true) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!startOnMount && !started) return;
    let startTime: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started, startOnMount]);

  const start = useCallback(() => setStarted(true), []);
  return { value, start };
}

export function animateValue(el: HTMLElement, from: number, to: number, duration = 600) {
  let start: number | null = null;
  const step = (ts: number) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = '₹' + Math.round(from + (to - from) * eased).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function formatRupee(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export function formatLakhs(n: number): string {
  const l = n / 100000;
  return '₹' + (l >= 1 ? l.toFixed(1) + 'L' : n.toLocaleString('en-IN'));
}
