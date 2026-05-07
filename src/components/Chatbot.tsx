'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BotIcon } from './LeanRobot';

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
        .replace(/^### (.+)$/gm, '<strong style="font-size:14px;color:#2980B9;display:block;margin-top:8px">$1</strong>')
        .replace(/^#### (.+)$/gm, '<strong style="font-size:13px;color:#94a3b8;display:block;margin-top:6px">$1</strong>')
        .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:6px 0"/>')
        .replace(/^[-•] (.+)$/gm, '<span style="display:flex;gap:6px;margin:2px 0"><span style="color:#2980B9;flex-shrink:0">•</span><span>$1</span></span>')
        .replace(/^(\d+)\. (.+)$/gm, '<span style="display:flex;gap:6px;margin:2px 0"><span style="color:#2980B9;flex-shrink:0;min-width:16px">$1.</span><span>$2</span></span>')
        .replace(/\n/g, '<br/>');
}

const WELCOME_MESSAGE: Message = {
    role: 'assistant',
    content: '¡Hola! ¿En qué puedo ayudarte?',
};

export default function Chatbot({ embedMode = false }: { embedMode?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const sessionId = useRef(generateSessionId());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const openChat = useCallback(() => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
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
            const reply = data.response || data.output || data.message || 'No he podido procesar tu consulta, inténtalo de nuevo.';
            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Vaya, hay un problema de conexión. Inténtalo de nuevo o llámanos al **+34 968 676 983**.' },
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
            {/* ── FLOATING WIDGET ── */}
            {!isOpen && (
                <div
                    style={{
                        position: 'fixed', bottom: 12, right: 16, zIndex: 999998,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        cursor: 'pointer',
                        transform: isPressed ? 'scale(0.93)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                    }}
                    onClick={openChat}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'esgas-attention 14s ease-in-out 10s infinite' }}>
                        {/* Online dot */}
                        <div style={{
                            width: 12, height: 12, borderRadius: '50%', background: '#22C55E',
                            border: '2px solid white', alignSelf: 'flex-end', marginRight: 8,
                            marginBottom: -8, position: 'relative', zIndex: 2,
                            animation: 'esgas-onlinePulse 2.5s ease-in-out infinite',
                            boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                        }} />

                        <BotIcon
                            width={120}
                            instanceId="ft"
                            animStyle={{
                                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.25)) drop-shadow(0 2px 8px rgba(41,128,185,0.2))',
                                animation: 'esgas-float 4s ease-in-out infinite',
                            }}
                        />

                        <div style={{
                            background: 'linear-gradient(to right, #1A4F8A, #2980B9)',
                            color: '#fff', padding: '10px 18px', borderRadius: 14,
                            fontWeight: 800, fontSize: 11, letterSpacing: '0.06em',
                            animation: 'esgas-labelGlow 3s ease-in-out infinite',
                            marginTop: -8, position: 'relative', zIndex: 10,
                            textAlign: 'center', textTransform: 'uppercase',
                            border: '2px solid rgba(255,255,255,0.2)', minWidth: 130, whiteSpace: 'nowrap',
                        }}>
                            ¿ALGUNA DUDA?
                        </div>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 10, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.04em', textAlign: 'center' }}>
                        powered by{' '}
                        <a href="https://flownexion.com/" target="_blank" rel="noopener noreferrer"
                            style={{ color: '#94a3b8', textDecoration: 'underline' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#2980B9')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                            Flownexion
                        </a>
                    </div>
                </div>
            )}

            {/* ── CHAT PANEL ── */}
            <div style={{
                position: 'fixed', bottom: 16, right: 16, zIndex: 999999,
                width: isOpen ? 'min(420px, calc(100vw - 32px))' : 0,
                height: isOpen ? 'min(580px, calc(100dvh - 32px))' : 0,
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'all' : 'none',
                transition: 'width 0.3s ease, height 0.3s ease, opacity 0.25s ease',
                borderRadius: 18,
                boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 4px 16px rgba(41,128,185,0.15)',
                overflow: 'hidden', background: '#0f172a',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderBottom: '1px solid rgba(41,128,185,0.2)',
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
                }}>
                    <BotIcon width={42} instanceId="hdr" />

                    <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>ESGAS</div>
                        <div style={{ color: '#2980B9', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'esgas-onlinePulse 2s infinite' }} />
                            En línea · Asistente técnico
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', padding: '6px 9px', fontSize: 15, lineHeight: 1, transition: 'background 0.15s, color 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
                        aria-label="Cerrar chat"
                    >✕</button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12, scrollbarWidth: 'thin', scrollbarColor: 'rgba(41,128,185,0.2) transparent' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                            {msg.role === 'assistant' && (
                                <BotIcon width={30} instanceId={`msg${i}`} />
                            )}
                            <div
                                style={{
                                    maxWidth: '78%', padding: '10px 14px',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, #1A4F8A, #2980B9)' : 'rgba(255,255,255,0.07)',
                                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                    color: '#fff', fontSize: 13.5, lineHeight: 1.6, wordBreak: 'break-word',
                                }}
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                            />
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <BotIcon width={30} instanceId="ld" />
                            <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 5, alignItems: 'center' }}>
                                {[0, 1, 2].map((n) => (
                                    <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: '#2980B9', display: 'inline-block', animation: `esgas-bounce 1.2s ease-in-out ${n * 0.2}s infinite` }} />
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
                        onFocus={(e) => (e.target.style.borderColor = 'rgba(41,128,185,0.5)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        style={{ width: 42, height: 42, borderRadius: 12, border: 'none', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', background: isLoading || !input.trim() ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #1A4F8A, #2980B9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', opacity: isLoading || !input.trim() ? 0.45 : 1 }}
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
                @keyframes esgas-float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25%  { transform: translateY(-5px) rotate(-1deg); }
                    50%  { transform: translateY(-10px) rotate(0deg); }
                    75%  { transform: translateY(-5px) rotate(1deg); }
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
                    0%, 100% { box-shadow: 0 8px 20px rgba(26,79,138,0.45); }
                    50% { box-shadow: 0 8px 30px rgba(41,128,185,0.7), 0 0 18px rgba(41,128,185,0.25); }
                }
                @keyframes esgas-onlinePulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </>
    );
}
