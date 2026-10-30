import { NextRequest, NextResponse } from 'next/server';
import { fetchAllPublicNames } from '@/lib/publicNames';
import { selectNameSuggestions } from '@/lib/nameSuggestions';

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim();
  if (query.length > 100) return NextResponse.json({ success: false, data: [] }, { status: 400 });
  if (query.length < 2) return NextResponse.json({ success: true, data: [] });
  try {
    const records = await fetchAllPublicNames();
    return NextResponse.json({ success: true, data: selectNameSuggestions(records, query) }, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ success: false, data: [] }, { status: 503 });
  }
}
