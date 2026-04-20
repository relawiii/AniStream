import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./navbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

export function AppLayout({ children }: AppLayoutProps) {
  // ── Easter egg 1: Konami code ─────────────────────────────────────────────
  const [konamiActive, setKonamiActive] = useState(false);
  const konamiBuffer = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      konamiBuffer.current = [...konamiBuffer.current, e.key].slice(-KONAMI.length);
      if (konamiBuffer.current.join(",") === KONAMI.join(",")) {
        setKonamiActive(true);
        konamiBuffer.current = [];
        setTimeout(() => setKonamiActive(false), 3500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Easter egg 2: Footer "AniTime" text — click 5×  ──────────────────────
  const [footerClicks, setFooterClicks] = useState(0);
  const [footerSecret, setFooterSecret] = useState(false);
  const footerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFooterClick = () => {
    if (footerTimer.current) clearTimeout(footerTimer.current);
    const next = footerClicks + 1;
    setFooterClicks(next);
    if (next >= 5) {
      setFooterSecret(true);
      setFooterClicks(0);
      setTimeout(() => setFooterSecret(false), 4000);
    } else {
      footerTimer.current = setTimeout(() => setFooterClicks(0), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary selection:text-white">
      <Navbar />

      <main className="pb-24">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center text-white/40 text-sm border-t border-white/10 space-y-3">
        <p>
          ©{" "}
          <span
            onClick={handleFooterClick}
            className="cursor-pointer select-none hover:text-white/60 transition-colors"
            title="..."
          >
            {new Date().getFullYear()} AniTime
          </span>
          . Not a streaming service.
        </p>
        <p>Data provided by AniList.</p>

        {/* Contact Us */}
        <p>
          <a
            href="mailto:awijp.airi@gmail.com"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-primary transition-colors text-xs font-medium border border-white/10 hover:border-primary/30 px-3 py-1.5 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Contact Us
          </a>
        </p>

        {/* Footer easter egg reveal */}
        {footerSecret && (
          <p className="text-primary text-xs font-bold animate-pulse">
            🌸 arigatou for using AniTime! made with ❤️ for anime fans 🌸
          </p>
        )}
      </footer>

      {/* ── Konami code overlay ───────────────────────────────────────────── */}
      {konamiActive && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div className="text-center space-y-3 animate-bounce">
            <p className="text-7xl">🎌</p>
            <p className="text-4xl font-black text-white tracking-tight">NANI?!</p>
            <p className="text-primary text-lg font-bold">Ultra Weeb Mode Activated</p>
            <p className="text-white/40 text-sm">↑↑↓↓←→←→BA — nice one 👏</p>
          </div>
        </div>
      )}
    </div>
  );
}
