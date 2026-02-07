'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Chatbot() {
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // 1. PUENTE DE COMUNICACION
        const handleOpenChat = () => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage('OPEN_CHAT_EXTERNAL', '*');
            }
        };

        // 2. SISTEMA DE REDIMENSIONADO RESPONSIVE
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'FLOWNEXION_RESIZE') {
                const container = containerRef.current;
                const iframe = iframeRef.current;

                if (container && iframe) {
                    // Fade in logic
                    if (container.style.opacity === '0') {
                        container.style.transition = 'opacity 0.3s ease';
                        container.style.opacity = '1';
                        setIsReady(true);
                    }

                    const { isOpen: openState, showTooltip } = event.data;
                    setIsOpen(openState);

                    const isMobile = window.innerWidth < 768;

                    // ALTO
                    let height;
                    if (openState) {
                        height = isMobile ? '100dvh' : '750px';
                    } else {
                        // Aumentamos a 250/140px según tooltip
                        height = showTooltip ? '250px' : '140px';
                    }

                    // ANCHO
                    let width;
                    if (openState) {
                        width = isMobile ? '100%' : '450px';
                    } else {
                        width = showTooltip ? '350px' : '140px';
                    }

                    // Apply styles
                    container.style.width = width;
                    container.style.height = height;
                    container.style.bottom = '0px';
                    container.style.right = '0px';

                    if (openState) {
                        container.style.zIndex = '2147483647';
                        iframe.style.pointerEvents = 'all';
                        if (isMobile) {
                            container.style.maxHeight = '100%';
                            container.style.maxWidth = '100%';
                            container.style.borderRadius = '0';
                        }
                    } else {
                        container.style.zIndex = '999999';
                        iframe.style.pointerEvents = 'all';
                        // Reseteamos estilos de móvil
                        container.style.maxHeight = '';
                        container.style.maxWidth = '';
                        container.style.borderRadius = '';
                    }
                }
            }
        };

        window.addEventListener('open-chat', handleOpenChat);
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('open-chat', handleOpenChat);
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div
            id="flownexion-container"
            ref={containerRef}
            className="fixed bottom-0 right-0 z-[999999] flex flex-col items-end justify-end"
            style={{
                position: 'fixed',
                bottom: '0px',
                right: '0px',
                width: '350px',
                height: '140px',
                zIndex: 999999,
                background: 'transparent',
                pointerEvents: 'none',
                opacity: 0,
                transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
            }}
        >
            <iframe
                id="flownexion-chat"
                ref={iframeRef}
                src="https://flownexion-chatbot-ejemplo.vercel.app/?widget=true"
                title="Chatbot Flownexion"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    overflow: 'hidden',
                    background: 'transparent',
                    pointerEvents: 'all',
                    colorScheme: 'normal',
                }}
                allow="microphone; clipboard-write"
                allowTransparency={true}
            />

            {/* 
        POWERED BY FLOWNEXION 
        Rendered as simple text below the chatbot icon when minimized.
      */}
            {!isOpen && isReady && (
                <div className="absolute bottom-[2px] right-[20px] pointer-events-auto z-[1000000] opacity-80 hover:opacity-100 transition-opacity">
                    <div className="text-[10px] text-slate-400 font-medium tracking-wide drop-shadow-sm select-none">
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
                </div>
            )}
        </div>
    );
}
