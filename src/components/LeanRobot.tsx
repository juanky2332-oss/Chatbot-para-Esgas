'use client';

import React, { useState } from 'react';

export default function LeanRobot() {
  const [isLeaning, setIsLeaning] = useState(false);

  const handleClick = () => {
    setIsLeaning(true);
    setTimeout(() => setIsLeaning(false), 200);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-chat'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-transparent font-sans">
      <div
        className={`relative cursor-pointer flex flex-col items-center transition-transform duration-200 ${
          isLeaning ? 'scale-95' : ''
        }`}
        onClick={handleClick}
      >
        {/* Headset avatar */}
        <svg
          viewBox="0 0 120 120"
          className="w-[240px] h-auto overflow-visible z-20"
          style={{
            animation: 'leanFloat 4s ease-in-out infinite',
            filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.35)) drop-shadow(0 4px 12px rgba(0,209,255,0.2))',
          }}
        >
          <defs>
            <linearGradient id="lr-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B3A5C" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="lr-face" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <filter id="lr-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <circle cx="60" cy="60" r="58" fill="url(#lr-bg)" />
          {/* Accent ring */}
          <circle cx="60" cy="60" r="55" fill="none" stroke="#00D1FF" strokeWidth="1" strokeOpacity="0.3" />

          {/* Online indicator */}
          <circle cx="92" cy="24" r="7" fill="#0F172A" />
          <circle cx="92" cy="24" r="5" fill="#22C55E" style={{ animation: 'lr-onlinePulse 2.5s ease-in-out infinite' }} />

          {/* Face */}
          <circle cx="60" cy="63" r="25" fill="url(#lr-face)" />

          {/* Eyes */}
          <circle cx="51" cy="60" r="4.5" fill="#00D1FF" />
          <circle cx="69" cy="60" r="4.5" fill="#00D1FF" />
          <circle cx="52.5" cy="58.5" r="1.8" fill="white" fillOpacity="0.9" />
          <circle cx="70.5" cy="58.5" r="1.8" fill="white" fillOpacity="0.9" />

          {/* Smile */}
          <path d="M51 70 Q60 77 69 70" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

          {/* Headset band */}
          <path
            d="M19 62 Q19 29 60 29 Q101 29 101 62"
            fill="none"
            stroke="#00D1FF"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#lr-glow)"
          />

          {/* Left ear cup */}
          <ellipse cx="19" cy="66" rx="8.5" ry="12.5" fill="#00D1FF" />
          <ellipse cx="19" cy="66" rx="5" ry="7.5" fill="#0F172A" />

          {/* Right ear cup */}
          <ellipse cx="101" cy="66" rx="8.5" ry="12.5" fill="#00D1FF" />
          <ellipse cx="101" cy="66" rx="5" ry="7.5" fill="#0F172A" />

          {/* Microphone arm */}
          <path d="M19 77 Q11 85 15 94" fill="none" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
          {/* Microphone */}
          <circle cx="15" cy="96" r="5" fill="#00D1FF" />
          <circle cx="15" cy="96" r="2.5" fill="white" fillOpacity="0.4" />
        </svg>

        {/* CTA label */}
        <div className="bg-gradient-to-r from-[#00D1FF] to-[#0070FF] text-white py-4 px-6 rounded-2xl font-extrabold text-[13px] tracking-wide shadow-[0_10px_25px_rgba(0,209,255,0.4)] mt-3 relative z-10 text-center uppercase border-2 border-white/20 min-w-[200px]"
          style={{ animation: 'lr-labelGlow 3s ease-in-out infinite' }}
        >
          ¿ALGUNA DUDA? PINCHA AQUÍ
        </div>
      </div>

      <div className="mt-4 text-[10px] text-slate-400 font-medium tracking-wide">
        powered by{' '}
        <a
          href="https://flownexion.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#00D1FF] transition-colors"
        >
          Flownexion
        </a>
      </div>

      <style jsx>{`
        @keyframes leanFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25%  { transform: translateY(-4px) rotate(-1deg); }
          50%  { transform: translateY(-8px) rotate(0deg); }
          75%  { transform: translateY(-4px) rotate(1deg); }
        }
        @keyframes lr-onlinePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes lr-labelGlow {
          0%, 100% { box-shadow: 0 10px 25px rgba(0,209,255,0.4); }
          50% { box-shadow: 0 10px 32px rgba(0,209,255,0.7), 0 0 18px rgba(0,112,255,0.25); }
        }
      `}</style>
    </div>
  );
}
