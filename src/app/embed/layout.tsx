import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ESGAS Widget",
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <style>{`
                    *, *::before, *::after { box-sizing: border-box; }
                    html, body {
                        margin: 0;
                        padding: 0;
                        background: transparent !important;
                        overflow: hidden;
                        width: 100%;
                        height: 100%;
                    }
                `}</style>
            </head>
            <body className={jakarta.className} style={{ background: 'transparent' }}>
                {children}
            </body>
        </html>
    );
}
