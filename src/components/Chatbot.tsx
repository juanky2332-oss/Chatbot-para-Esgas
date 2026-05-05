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
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.+)$/gm, '<strong style="font-size:14px;color:#00D1FF;display:block;margin-top:8px">$1</strong>')
        .replace(/^#### (.+)$/gm, '<strong style="font-size:13px;color:#94a3b8;display:block;margin-top:6px">$1</strong>')
        .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:6px 0"/>')
        .replace(/^[-•] (.+)$/gm, '<span style="display:flex;gap:6px;margin:2px 0"><span style="color:#00D1FF;flex-shrink:0">•</span><span>$1</span></span>')
        .replace(/^(\d+)\. (.+)$/gm, '<span style="display:flex;gap:6px;margin:2px 0"><span style="color:#00D1FF;flex-shrink:0;min-width:16px">$1.</span><span>$2</span></span>')
        .replace(/\n/g, '<br/>');
}

const WELCOME_MESSAGE: Message = {
    role: 'assistant',
    content: '¡Hola! ¿En qué puedo ayudarte?',
};

/* ── Headset avatar SVG — reutilizado en distintos tamaños ── */
function HeadsetAvatar({
    width,
    bgId,
    faceId,
    glowId,
    style,
}: {
    width: number;
    bgId: string;
    faceId: string;
    glowId: string;
    style?: React.CSSProperties;
}) {
    return (
        <svg viewBox="0 0 120 120" style={{ width, height: 'auto', overflow: 'visible', ...style }}>
            <defs>
                <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1B3A5C" />
                    <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id={faceId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F1F5F9" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background */}
            <circle cx="60" cy="60" r="58" fill={`url(#${bgId})`} />
            <circle cx="60" cy="60" r="55" fill="none" stroke="#00D1FF" strokeWidth="1" strokeOpacity="0.25" />

            {/* Face */}
            <circle cx="60" cy="63" r="25" fill={`url(#${faceId})`} />

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
                filter={`url(#${glowId})`}
            />

            {/* Left ear cup */}
            <ellipse cx="19" cy="66" rx="8.5" ry="12.5" fill="#00D1FF" />
            <ellipse cx="19" cy="66" rx="5" ry="7.5" fill="#0F172A" />

            {/* Right ear cup */}
            <ellipse cx="101" cy="66" rx="8.5" ry="12.5" fill="#00D1FF" />
            <ellipse cx="101" cy="66" rx="5" ry="7.5" fill="#0F172A" />

            {/* Microphone arm (only visible at larger sizes) */}
            {width >= 80 && (
                <>
                    <path d="M19 77 Q11 85 15 94" fill="none" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="15" cy="96" r="5" fill="#00D1FF" />
                    <circle cx="15" cy="96" r="2.5" fill="white" fillOpacity="0.4" />
                </>
            )}
        </svg>
    );
}

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
                body: JSON.stringify({ message: text, sessionId: sessionId.current }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const reply =
                data.response || data.output || data.message ||
                'No he podido procesar tu consulta, inténtalo de nuevo.';

            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Vaya, parece que hay un problema de conexión. Inténtalo de nuevo o llámanos al **+34 968 676 983**.',
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

    return (
        <>
            {/* ── FLOATING WIDGET (bottom-right) ── */}
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
                        transform: isLeaning ? 'scale(0.93)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                    }}
                    onClick={openChat}
                >
                    {/* Attention wrapper */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        animation: 'esgas-attention 14s ease-in-out 10s infinite',
                    }}>
                        {/* Online badge */}
                        <div style={{
                            width: 13,
                            height: 13,
                            borderRadius: '50%',
                            background: '#22C55E',
                            border: '2.5px solid white',
                            alignSelf: 'flex-end',
                            marginRight: 10,
                            marginBottom: -8,
                            position: 'relative',
                            zIndex: 2,
                            animation: 'esgas-onlinePulse 2.5s ease-in-out infinite',
                            boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                        }} />

                        {/* Headset avatar — float animation */}
                        <HeadsetAvatar
                            width={130}
                            bgId="ft-bg"
                            faceId="ft-face"
                            glowId="ft-glow"
                            style={{
                                filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.28)) drop-shadow(0 2px 8px rgba(0,209,255,0.18))',
                                animation: 'esgas-leanFloat 4s ease-in-out infinite',
                            }}
                        />

                        {/* Label */}
                        <div style={{
                            background: 'linear-gradient(to right, #00D1FF, #0070FF)',
                            color: '#fff',
                            padding: '10px 18px',
                            borderRadius: 14,
                            fontWeight: 800,
                            fontSize: 11,
                            letterSpacing: '0.06em',
                            animation: 'esgas-labelGlow 3s ease-in-out infinite',
                            marginTop: -10,
                            position: 'relative',
                            zIndex: 10,
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            border: '2px solid rgba(255,255,255,0.2)',
                            minWidth: 130,
                            whiteSpace: 'nowrap',
                        }}>
                            ¿ALGUNA DUDA?
                        </div>
                    </div>

                    {/* Powered by */}
                    <div style={{ marginTop: 6, fontSize: 10, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.04em', textAlign: 'center' }}>
                        powered by{' '}
                        <a href="https://flownexion.com/" target="_blank" rel="noopener noreferrer"
                            style={{ color: '#94a3b8', textDecoration: 'underline' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#00D1FF')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                            Flownexion
                        </a>
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
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderBottom: '1px solid rgba(0,209,255,0.15)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexShrink: 0,
                }}>
                    <HeadsetAvatar width={38} bgId="hdr-bg" faceId="hdr-face" glowId="hdr-glow" />

                    <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                            ESGAS
                        </div>
                        <div style={{ color: '#00D1FF', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%', background: '#22C55E',
                                display: 'inline-block', animation: 'esgas-onlinePulse 2s infinite',
                            }} />
                            En línea · Asistente técnico
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
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '16px 12px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,209,255,0.2) transparent',
                }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                            {msg.role === 'assistant' && (
                                <HeadsetAvatar width={28} bgId={`msg-bg-${i}`} faceId={`msg-face-${i}`} glowId={`msg-glow-${i}`} />
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
                            <HeadsetAvatar width={28} bgId="ld-bg" faceId="ld-face" glowId="ld-glow" />
                            <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 5, alignItems: 'center' }}>
                                {[0, 1, 2].map((n) => (
                                    <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D1FF', display: 'inline-block', animation: `esgas-bounce 1.2s ease-in-out ${n * 0.2}s infinite` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

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
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25%  { transform: translateY(-5px) rotate(-1.5deg); }
                    50%  { transform: translateY(-10px) rotate(0deg); }
                    75%  { transform: translateY(-5px) rotate(1.5deg); }
                }
                @keyframes esgas-bounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
                    40% { transform: translateY(-6px); opacity: 1; }
                }
                @keyframes esgas-attention {
                    0%, 90%, 100% { transform: scale(1) translateY(0); }
                    92% { transform: scale(1.05) translateY(-4px); }
                    94% { transform: scale(0.97) translateY(0); }
                    96% { transform: scale(1.03) translateY(-2px); }
                    98% { transform: scale(1) translateY(0); }
                }
                @keyframes esgas-labelGlow {
                    0%, 100% { box-shadow: 0 8px 20px rgba(0,209,255,0.4); }
                    50% { box-shadow: 0 8px 30px rgba(0,209,255,0.7), 0 0 18px rgba(0,112,255,0.25); }
                }
                @keyframes esgas-onlinePulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.45; }
                }
            `}</style>
        </>
    );
}
