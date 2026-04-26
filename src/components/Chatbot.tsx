'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const WEBHOOK_URL = '/api/chat';

function generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function renderMarkdown(text: string): string {
    return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Headers h3
        .replace(/^### (.+)$/gm, '<strong style="font-size:14px;color:#00D1FF;display:block;margin-top:8px">$1</strong>')
        // Headers h4
        .replace(/^#### (.+)$/gm, '<strong style="font-size:13px;color:#94a3b8;display:block;margin-top:6px">$1</strong>')
        // Horizontal rules
        .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:6px 0"/>')
        // Bullet lists: lines starting with - or •
        .replace(/^[-•] (.+)$/gm, '<span style="display:flex;gap:6px;margin:2px 0"><span style="color:#00D1FF;flex-shrink:0">•</span><span>$1</span></span>')
        // Numbered lists
        .replace(/^(\d+)\. (.+)$/gm, '<span style="display:flex;gap:6px;margin:2px 0"><span style="color:#00D1FF;flex-shrink:0;min-width:16px">$1.</span><span>$2</span></span>')
        // Line breaks
        .replace(/\n/g, '<br/>');
}

const WELCOME_MESSAGE: Message = {
    role: 'assistant',
    content:
        '¡Buenas! Soy el asesor técnico de **ESGAS**, distribuidores oficiales NTN·SNR en Murcia.\n\n¿Tienes una referencia de SKF, FAG, NSK u otra marca? Te doy el **equivalente NTN/SNR** al momento. O cuéntame la aplicación y te recomiendo el rodamiento más adecuado.',
};

const QUICK_SUGGESTIONS = [
    'Equivalente NTN del SKF 6205-2RSH',
    '¿Qué rodamiento para tractor agrícola?',
    'Diferencia entre 6205 LLU y 6205 ZZ',
    'Rodamiento para motor a 150°C',
];

export default function Chatbot({ embedMode = false }: { embedMode?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLeaning, setIsLeaning] = useState(false);
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const sessionId = useRef(generateSessionId());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const openChat = useCallback(() => {
        setIsLeaning(true);
        setTimeout(() => setIsLeaning(false), 200);
        setIsOpen(true);
    }, []);

    useEffect(() => {
        const handleOpenChat = () => openChat();
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, [openChat]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                inputRef.current?.focus();
            }, 150);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (embedMode && window.parent !== window) {
            window.parent.postMessage({ type: 'esgas-chat-open', open: isOpen }, '*');
        }
    }, [isOpen, embedMode]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setIsLoading(true);

        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    sessionId: sessionId.current,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const reply =
                data.response ||
                data.output ||
                data.message ||
                'No he podido procesar tu consulta, inténtalo de nuevo.';

            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        'Vaya, parece que hay un problema de conexión. Inténtalo de nuevo o llámanos directamente al **+34 968 676 983**.',
                },
            ]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const userHasSentMessage = messages.some((m) => m.role === 'user');

    return (
        <>
            {/* ── FLOATING ROBOT BUTTON (bottom-right, always visible when chat closed) ── */}
            {!isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 12,
                        right: 16,
                        zIndex: 999998,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                    onClick={openChat}
                >
                    {/* Mini robot SVG — same as LeanRobot but scaled down */}
                    <svg
                        viewBox="0 0 200 120"
                        style={{
                            width: 110,
                            height: 'auto',
                            overflow: 'visible',
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))',
                            animation: 'esgas-leanFloat 4s ease-in-out infinite',
                            transition: 'transform 0.2s ease',
                            transform: isLeaning ? 'scale(0.93)' : 'scale(1)',
                        }}
                    >
                        <defs>
                            <linearGradient id="botGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="100%" stopColor="#CBD5E1" />
                            </linearGradient>
                            <filter id="botShadow" x="-20%" y="-20%" width="140%" height="140%">
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
                        <path d="M50 70 Q30 70 35 110" stroke="url(#botGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
                        <path d="M150 70 Q170 70 165 110" stroke="url(#botGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
                        {/* Head */}
                        <rect x="45" y="5" width="110" height="90" rx="45" fill="url(#botGrad)" />
                        <rect x="55" y="20" width="90" height="50" rx="22" fill="#0F172A" />
                        {/* Eyes */}
                        <g style={{ animation: 'esgas-blinkEyes 4s infinite', transformOrigin: 'center 45px' }}>
                            <circle cx="82" cy="45" r="9" fill="#00D1FF" />
                            <circle cx="118" cy="45" r="9" fill="#00D1FF" />
                            <circle cx="85" cy="42" r="3" fill="white" fillOpacity="0.8" />
                            <circle cx="121" cy="42" r="3" fill="white" fillOpacity="0.8" />
                        </g>
                        {/* Smile */}
                        <path d="M90 60 Q100 66 110 60" fill="none" stroke="#00D1FF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        {/* Antenna */}
                        <line x1="100" y1="5" x2="100" y2="-8" stroke="#94A3B8" strokeWidth="4" />
                        <circle cx="100" cy="-8" r="5" fill="#00D1FF" style={{ animation: 'esgas-pulseLight 1.5s infinite' }} />
                        {/* Hands */}
                        <rect x="25" y="105" width="45" height="15" rx="7" fill="#94A3B8" filter="url(#botShadow)" />
                        <rect x="130" y="105" width="45" height="15" rx="7" fill="#94A3B8" filter="url(#botShadow)" />
                    </svg>

                    {/* "¿ALGUNA DUDA?" bar — identical style to LeanRobot */}
                    <div
                        style={{
                            background: 'linear-gradient(to right, #00D1FF, #0070FF)',
                            color: '#fff',
                            padding: '10px 16px',
                            borderRadius: 14,
                            fontWeight: 800,
                            fontSize: 11,
                            letterSpacing: '0.06em',
                            boxShadow: '0 10px 25px rgba(0,209,255,0.4)',
                            marginTop: -10,
                            position: 'relative',
                            zIndex: 10,
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            border: '2px solid rgba(255,255,255,0.2)',
                            minWidth: 120,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        ¿ALGUNA DUDA?
                    </div>
                </div>
            )}

            {/* ── CHAT PANEL ── */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 999999,
                    width: isOpen ? 'min(420px, calc(100vw - 32px))' : 0,
                    height: isOpen ? 'min(580px, calc(100dvh - 32px))' : 0,
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'all' : 'none',
                    transition: 'width 0.3s ease, height 0.3s ease, opacity 0.25s ease',
                    borderRadius: 18,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 4px 16px rgba(0,209,255,0.12)',
                    overflow: 'hidden',
                    background: '#0f172a',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        borderBottom: '1px solid rgba(0,209,255,0.15)',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexShrink: 0,
                    }}
                >
                    {/* Mini robot head in header */}
                    <div style={{ width: 38, height: 38, flexShrink: 0, position: 'relative' }}>
                        <svg viewBox="45 5 110 90" style={{ width: 38, height: 38, overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="hdrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FFFFFF" />
                                    <stop offset="100%" stopColor="#CBD5E1" />
                                </linearGradient>
                            </defs>
                            <rect x="45" y="5" width="110" height="90" rx="45" fill="url(#hdrGrad)" />
                            <rect x="55" y="20" width="90" height="50" rx="22" fill="#0F172A" />
                            <circle cx="82" cy="45" r="9" fill="#00D1FF" />
                            <circle cx="118" cy="45" r="9" fill="#00D1FF" />
                            <circle cx="85" cy="42" r="3" fill="white" fillOpacity="0.8" />
                            <circle cx="121" cy="42" r="3" fill="white" fillOpacity="0.8" />
                            <path d="M90 60 Q100 66 110 60" fill="none" stroke="#00D1FF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                            <line x1="100" y1="5" x2="100" y2="-5" stroke="#94A3B8" strokeWidth="4" />
                            <circle cx="100" cy="-5" r="4" fill="#00D1FF" style={{ animation: 'esgas-pulseLight 1.5s infinite' }} />
                        </svg>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                            ESGAS
                        </div>
                        <div style={{ color: '#00D1FF', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%', background: '#00D1FF',
                                display: 'inline-block', animation: 'esgas-pulse 2s infinite',
                            }} />
                            Rodamientos &amp; Transmisión de potencia
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8,
                            color: '#94a3b8', cursor: 'pointer', padding: '6px 9px',
                            fontSize: 15, lineHeight: 1, transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
                        aria-label="Cerrar chat"
                    >
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div
                    style={{
                        flex: 1, overflowY: 'auto', padding: '16px 12px',
                        display: 'flex', flexDirection: 'column', gap: 12,
                        scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,209,255,0.2) transparent',
                    }}
                >
                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                            {msg.role === 'assistant' && (
                                <div style={{ width: 28, height: 28, flexShrink: 0 }}>
                                    <svg viewBox="45 5 110 90" style={{ width: 28, height: 28, overflow: 'visible' }}>
                                        <defs>
                                            <linearGradient id="msgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#FFFFFF" />
                                                <stop offset="100%" stopColor="#CBD5E1" />
                                            </linearGradient>
                                        </defs>
                                        <rect x="45" y="5" width="110" height="90" rx="45" fill="url(#msgGrad)" />
                                        <rect x="55" y="20" width="90" height="50" rx="22" fill="#0F172A" />
                                        <circle cx="82" cy="45" r="8" fill="#00D1FF" />
                                        <circle cx="118" cy="45" r="8" fill="#00D1FF" />
                                        <circle cx="85" cy="42" r="2.5" fill="white" fillOpacity="0.8" />
                                        <circle cx="121" cy="42" r="2.5" fill="white" fillOpacity="0.8" />
                                        <path d="M90 60 Q100 66 110 60" fill="none" stroke="#00D1FF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                                    </svg>
                                </div>
                            )}
                            <div
                                style={{
                                    maxWidth: '78%', padding: '10px 14px',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, #00D1FF, #0070FF)' : 'rgba(255,255,255,0.07)',
                                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                    color: '#fff', fontSize: 13.5, lineHeight: 1.6, wordBreak: 'break-word',
                                }}
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                            />
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <div style={{ width: 28, height: 28, flexShrink: 0 }}>
                                <svg viewBox="45 5 110 90" style={{ width: 28, height: 28, overflow: 'visible' }}>
                                    <defs>
                                        <linearGradient id="ldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#FFFFFF" />
                                            <stop offset="100%" stopColor="#CBD5E1" />
                                        </linearGradient>
                                    </defs>
                                    <rect x="45" y="5" width="110" height="90" rx="45" fill="url(#ldGrad)" />
                                    <rect x="55" y="20" width="90" height="50" rx="22" fill="#0F172A" />
                                    <circle cx="82" cy="45" r="8" fill="#00D1FF" />
                                    <circle cx="118" cy="45" r="8" fill="#00D1FF" />
                                    <circle cx="85" cy="42" r="2.5" fill="white" fillOpacity="0.8" />
                                    <circle cx="121" cy="42" r="2.5" fill="white" fillOpacity="0.8" />
                                </svg>
                            </div>
                            <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 5, alignItems: 'center' }}>
                                {[0, 1, 2].map((n) => (
                                    <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D1FF', display: 'inline-block', animation: `esgas-bounce 1.2s ease-in-out ${n * 0.2}s infinite` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick suggestions */}
                {!userHasSentMessage && !isLoading && (
                    <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {QUICK_SUGGESTIONS.map((s) => (
                            <button key={s}
                                onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                                style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.25)', borderRadius: 20, color: '#00D1FF', fontSize: 11.5, padding: '5px 11px', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,209,255,0.18)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,209,255,0.08)'; }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8, flexShrink: 0 }}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu consulta aquí..."
                        disabled={isLoading}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13.5, padding: '10px 14px', outline: 'none', transition: 'border-color 0.15s' }}
                        onFocus={(e) => (e.target.style.borderColor = 'rgba(0,209,255,0.45)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        style={{ width: 42, height: 42, borderRadius: 12, border: 'none', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', background: isLoading || !input.trim() ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00D1FF, #0070FF)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', opacity: isLoading || !input.trim() ? 0.45 : 1 }}
                        aria-label="Enviar"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '4px 12px 10px', fontSize: 10, color: 'rgba(255,255,255,0.22)', flexShrink: 0 }}>
                    ESGAS · C/ Estrella Polar 5, Molina de Segura, Murcia · +34 968 676 983
                </div>
            </div>

            <style>{`
                @keyframes esgas-leanFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes esgas-blinkEyes {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
                @keyframes esgas-pulseLight {
                    0%, 100% { fill: #00d1ff; }
                    50% { fill: #fff; }
                }
                @keyframes esgas-bounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
                    40% { transform: translateY(-6px); opacity: 1; }
                }
                @keyframes esgas-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.35; }
                }
            `}</style>
        </>
    );
}
