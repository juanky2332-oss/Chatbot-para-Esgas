'use client';

import React, { useState } from 'react';

/* ─── SVG logo: burbuja-chat + robot, flecha dinámica exterior ─── */
export function BotIcon({
  width,
  instanceId,
  animStyle,
}: {
  width: number;
  instanceId: string;
  animStyle?: React.CSSProperties;
}) {
  const showDetails = width >= 55;   // antenas + flecha solo en tamaños medianos/grandes
  const arrowMarkerId = `arr-${instanceId}`;

  return (
    <svg
      viewBox="0 0 200 220"
      style={{ width, height: 'auto', overflow: 'visible', display: 'block', ...animStyle }}
    >
      <defs>
        {showDetails && (
          <marker
            id={arrowMarkerId}
            markerWidth="9"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 9 3.5, 0 7" fill="#2980B9" />
          </marker>
        )}
      </defs>

      {/* ── Cola de burbuja (dibujada ANTES que el rect para que el rect la tape en el interior) ── */}
      <path
        d="M 60,147 Q 44,166 18,178 Q 40,154 52,140 Z"
        fill="#FFFFFF"
        stroke="#1A4F8A"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* ── Cuerpo principal (burbuja + cabeza robot) ── */}
      <rect
        x="30" y="20"
        width="140" height="130"
        rx="52"
        fill="#FFFFFF"
        stroke="#1A4F8A"
        strokeWidth="5"
      />

      {/* ── Oreja izquierda ── */}
      <rect x="16" y="64" width="13" height="22" rx="4" fill="#1A4F8A" />

      {/* ── Oreja derecha ── */}
      <rect x="171" y="64" width="13" height="22" rx="4" fill="#1A4F8A" />

      {/* ── Antenas (solo > 55px) ── */}
      {showDetails && (
        <>
          <line x1="77" y1="21" x2="77" y2="4" stroke="#1A4F8A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="77" cy="2" r="5" fill="#1A4F8A" />
          <line x1="123" y1="21" x2="123" y2="4" stroke="#1A4F8A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="123" cy="2" r="5" fill="#1A4F8A" />
        </>
      )}

      {/* ── Ojos arqueados hacia arriba (feliz) ── */}
      <path d="M 65,82 Q 75,69 85,82" fill="none" stroke="#1A4F8A" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 115,82 Q 125,69 135,82" fill="none" stroke="#1A4F8A" strokeWidth="4.5" strokeLinecap="round" />

      {/* ── Sonrisa ── */}
      <path d="M 72,104 Q 100,120 128,104" fill="none" stroke="#1A4F8A" strokeWidth="4" strokeLinecap="round" />

      {/* ── Flecha curva exterior derecha (solo > 55px) ── */}
      {showDetails && (
        <path
          d="M 165 26 A 90 90 0 0 1 156 162"
          fill="none"
          stroke="#2980B9"
          strokeWidth="5.5"
          strokeLinecap="round"
          markerEnd={`url(#${arrowMarkerId})`}
        />
      )}
    </svg>
  );
}

/* ─── Componente de página ─── */
export default function LeanRobot() {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 200);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-chat'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-transparent font-sans">
      <div
        className={`relative cursor-pointer flex flex-col items-center transition-transform duration-200 ${pressed ? 'scale-95' : ''}`}
        onClick={handleClick}
      >
        <BotIcon
          width={210}
          instanceId="lr"
          animStyle={{
            filter: 'drop-shadow(0 14px 32px rgba(0,0,0,0.22)) drop-shadow(0 4px 12px rgba(41,128,185,0.18))',
            animation: 'lr-float 4s ease-in-out infinite',
          }}
        />

        {/* CTA */}
        <div
          className="bg-gradient-to-r from-[#1A4F8A] to-[#2980B9] text-white py-4 px-6 rounded-2xl font-extrabold text-[13px] tracking-wide shadow-[0_10px_25px_rgba(26,79,138,0.4)] mt-3 relative z-10 text-center uppercase border-2 border-white/20 min-w-[200px]"
          style={{ animation: 'lr-labelGlow 3s ease-in-out infinite' }}
        >
          ¿ALGUNA DUDA? PINCHA AQUÍ
        </div>
      </div>

      <div className="mt-4 text-[10px] text-slate-400 font-medium tracking-wide">
        powered by{' '}
        <a href="https://flownexion.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2980B9] transition-colors">
          Flownexion
        </a>
      </div>

      <style jsx>{`
        @keyframes lr-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25%  { transform: translateY(-5px) rotate(-1deg); }
          50%  { transform: translateY(-10px) rotate(0deg); }
          75%  { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes lr-labelGlow {
          0%, 100% { box-shadow: 0 10px 25px rgba(26,79,138,0.4); }
          50%       { box-shadow: 0 10px 32px rgba(41,128,185,0.7), 0 0 20px rgba(41,128,185,0.25); }
        }
      `}</style>
    </div>
  );
}
