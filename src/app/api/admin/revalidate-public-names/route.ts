import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

function matchesSecret(value: string | null, expected: string | undefined) {
    if (!value || !expected) return false;
    const received = Buffer.from(value);
    const configured = Buffer.from(expected);
    return received.length === configured.length && timingSafeEqual(received, configured);
}

export async function POST(request: Request) {
    if (!matchesSecret(request.headers.get('x-revalidate-secret'), process.env.REVALIDATE_SECRET)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    revalidateTag('public-names', 'max');
    revalidateTag('public-stats', 'max');
    revalidateTag('public-live-stats', 'max');
    revalidatePath('/search');
    revalidatePath('/names', 'layout');

    return NextResponse.json({ success: true });
}
