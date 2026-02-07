'use client';

import React, { useState } from 'react';

export default function LeanRobot() {
  const [isLeaning, setIsLeaning] = useState(false);

  const handleClick = () => {
    // Trigger animation
    setIsLeaning(true);
    setTimeout(() => setIsLeaning(false), 200);

    // Dispatch custom event to open chat
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-chat'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-transparent font-sans group">
      {/* Robot Container */}
      <div
        className={`relative w-[280px] cursor-pointer transition-transform duration-300 ease-in-out flex flex-col items-center ${
          isLeaning ? 'scale-95' : 'hover:-translate-y-1'
        }`}
        onClick={handleClick}
      >
        {/* SVG Robot */}
        <svg
          viewBox="0 0 200 120"
          className="w-full h-auto overflow-visible z-20 drop-shadow-xl filter"
          style={{ animation: 'leanFloat 4s ease-in-out infinite' }}
        >
          <defs>
            <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Body/Neck */}
          <rect x="75" y="80" width="50" height="30" rx="10" fill="#CBD5E1" />

          {/* Arms */}
          <path
            d="M50 70 Q30 70 35 110"
            stroke="url(#robotGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M150 70 Q170 70 165 110"
            stroke="url(#robotGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />

          {/* Head */}
          <g className="flo-head">
            <rect
              x="45"
              y="5"
              width="110"
              height="90"
              rx="45"
              fill="url(#robotGrad)"
            />
            <rect x="55" y="20" width="90" height="50" rx="22" fill="#0F172A" />

            {/* Eyes */}
            <g className="animate-blink">
              <circle cx="82" cy="45" r="9" fill="#00D1FF" />
              <circle cx="118" cy="45" r="9" fill="#00D1FF" />
              <circle cx="85" cy="42" r="3" fill="white" fillOpacity="0.8" />
              <circle cx="121" cy="42" r="3" fill="white" fillOpacity="0.8" />
            </g>

            <path
              d="M90 60 Q100 66 110 60"
              fill="none"
              stroke="#00D1FF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Antenna */}
            <line x1="100" y1="5" x2="100" y2="-8" stroke="#94A3B8" strokeWidth="4" />
            <circle
              cx="100"
              cy="-8"
              r="5"
              fill="#00D1FF"
              className="animate-pulse-light"
            />
          </g>

          {/* Hands */}
          <rect
            x="25"
            y="105"
            width="45"
            height="15"
            rx="7"
            fill="#94A3B8"
            filter="url(#shadow)"
          />
          <rect
            x="130"
            y="105"
            width="45"
            height="15"
            rx="7"
            fill="#94A3B8"
            filter="url(#shadow)"
          />
        </svg>

        {/* Blue Bar */}
        <div className="bg-gradient-to-r from-[#00D1FF] to-[#0070FF] text-white py-4 px-6 rounded-2xl font-extrabold text-[13px] tracking-wide shadow-[0_10px_25px_rgba(0,209,255,0.4)] mt-[-20px] relative z-10 text-center uppercase border-2 border-white/20 w-auto min-w-[200px]">
          ¿ALGUNA DUDA? PINCHA AQUÍ
        </div>
      </div>
      
      {/* Powered by Flownexion */}
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
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes blinkEyesOnly {
          0%,
          90%,
          100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }
        @keyframes pulseLight {
          0%,
          100% {
            fill: #00d1ff;
            filter: blur(0px);
          }
          50% {
            fill: #fff;
            filter: blur(2px);
          }
        }
        .animate-blink {
          animation: blinkEyesOnly 4s infinite;
          transform-origin: center 45px;
        }
        .animate-pulse-light {
          animation: pulseLight 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
