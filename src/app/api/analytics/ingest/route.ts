import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabaseServer';

export const dynamic = 'force-dynamic';

// Allowlist of valid event_name values
const VALID_EVENTS = new Set(['click', 'view', 'submit']);

// Max metadata JSON size (2 KB)
const MAX_METADATA_SIZE = 2048;
const MAX_BATCH_SIZE = 25;

type AnalyticsEventInput = {
    event_name?: unknown;
    button_key?: unknown;
    page_path?: unknown;
    user_id?: unknown;
    session_id?: unknown;
    referrer?: unknown;
    metadata?: unknown;
};

type AnalyticsInsert = {
    event_name: string;
    button_key: string;
    page_path: string;
    user_id: string | null;
    session_id: string;
    referrer: string;
    metadata: unknown;
};

function normalizeEvent(input: AnalyticsEventInput): { event?: AnalyticsInsert; error?: string } {
    const {
        event_name,
        button_key,
        page_path,
        user_id,
        session_id,
        referrer,
        metadata,
    } = input;

    // --- Validation ---
    if (!event_name || typeof event_name !== 'string' || !VALID_EVENTS.has(event_name)) {
        return { error: 'Invalid event_name' };
    }

    if (!button_key || typeof button_key !== 'string' || button_key.length > 200) {
        return { error: 'Invalid button_key' };
    }

    if (!page_path || typeof page_path !== 'string' || page_path.length > 500) {
        return { error: 'Invalid page_path' };
    }

    if (!session_id || typeof session_id !== 'string' || session_id.length > 100) {
        return { error: 'Invalid session_id' };
    }

    // Validate metadata size
    const metaStr = metadata ? JSON.stringify(metadata) : '{}';
    if (metaStr.length > MAX_METADATA_SIZE) {
        return { error: 'metadata too large' };
    }

    return {
        event: {
            event_name,
            button_key: button_key.slice(0, 200),
            page_path: page_path.slice(0, 500),
            user_id: typeof user_id === 'string' && user_id ? user_id : null,
            session_id: session_id.slice(0, 100),
            referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : '',
            metadata: metadata ?? {},
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const rawEvents = Array.isArray(body)
            ? body
            : Array.isArray(body?.events)
                ? body.events
                : [body];

        if (rawEvents.length === 0 || rawEvents.length > MAX_BATCH_SIZE) {
            return NextResponse.json(
                { success: false, error: 'Invalid batch size' },
                { status: 400 },
            );
        }

        const events: AnalyticsInsert[] = [];
        for (const rawEvent of rawEvents) {
            const { event, error } = normalizeEvent(rawEvent ?? {});
            if (error || !event) {
                return NextResponse.json(
                    { success: false, error },
                    { status: 400 },
                );
            }

            events.push(event);
        }

        // --- Insert ---
        const supabase = await createClient();

        const { error } = await supabase.from('user_action_events').insert(events);

        if (error) {
            console.error('[analytics/ingest] insert error:', error.message);
            return NextResponse.json(
                { success: false, error: 'Failed to record event' },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true, inserted: events.length });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Bad request' },
            { status: 400 },
        );
    }
}
