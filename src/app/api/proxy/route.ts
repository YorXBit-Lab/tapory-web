import { NextRequest, NextResponse } from 'next/server';

/* Mobile UA — website trả về layout di động */
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing url', { status: 400 });

  let parsed: URL;
  try { parsed = new URL(url); } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new NextResponse('Protocol not allowed', { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': MOBILE_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12_000),
    });

    const contentType = res.headers.get('content-type') || 'text/html';

    if (!contentType.includes('html')) {
      return new NextResponse(res.body, {
        status: res.status,
        headers: { 'Content-Type': contentType },
      });
    }

    let html = await res.text();

    /* Inject vào <head>:
       1. <base href> → relative URL resolve đúng
       2. viewport meta → render đúng mobile width
       3. Xóa X-Frame-Options meta nếu có  */
    const inject = [
      `<base href="${parsed.origin}">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">`,
    ].join('');

    if (/<head[\s>]/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1${inject}`);
    } else {
      html = inject + html;
    }

    /* Xóa meta http-equiv X-Frame-Options nếu trang tự set */
    html = html.replace(/<meta[^>]+http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');

    return new NextResponse(html, {
      status: res.status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new NextResponse('Failed to fetch', { status: 502 });
  }
}
