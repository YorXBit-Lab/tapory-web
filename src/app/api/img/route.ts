import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/libs/env';

/**
 * Image proxy for the Stardust memory-film site (different origin).
 * R2's public r2.dev domain serves no CORS headers, so WebGL canvases
 * can't consume those photos directly. This route streams the image with
 * `Access-Control-Allow-Origin: *` — restricted to our own R2 bucket so
 * it can't be abused as an open proxy.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing url', { status: 400 });

  const allowedBase = env.r2PublicUrl;
  if (!allowedBase || !url.startsWith(`${allowedBase}/`)) {
    return new NextResponse('URL not allowed', { status: 403 });
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return new NextResponse('Upstream error', { status: res.status });

    const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Not an image', { status: 415 });
    }

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Fetch failed', { status: 502 });
  }
}
