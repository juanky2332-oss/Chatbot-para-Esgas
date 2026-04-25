import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK =
    'https://paneln8n.transformaconia.com/webhook/031ab1e6-d64e-41f0-b03e-f5c0681a6491';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const n8nRes = await fetch(N8N_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!n8nRes.ok) {
            return NextResponse.json(
                { error: `n8n error ${n8nRes.status}` },
                { status: 502 }
            );
        }

        const data = await n8nRes.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error('[chat/route]', err);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
