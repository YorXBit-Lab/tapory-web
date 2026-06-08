import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const NO_INDEX_PREFIXES = ['/dashboard', '/edit', '/upload', '/keychain', '/c', '/view'];

function shouldNoIndex(pathname: string) {
  return NO_INDEX_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function withRobotsHeader(response: NextResponse, pathname: string) {
  if (shouldNoIndex(pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/view\/([^/]+)$/);
  if (!match) return withRobotsHeader(NextResponse.next(), pathname);

  const orderId   = match[1];
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return withRobotsHeader(NextResponse.next(), pathname);

  try {
    const firestoreUrl =
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/memorials/${orderId}`;
    const res = await fetch(firestoreUrl);
    if (!res.ok) return withRobotsHeader(NextResponse.next(), pathname);

    const doc = await res.json();
    const fields = doc.fields as Record<string, { stringValue?: string }> | undefined;

    if (fields?.templateId?.stringValue === 'redirect') {
      const target = fields?.website?.stringValue;
      if (target) {
        // Validate URL để tránh open redirect với protocol lạ
        const parsed = new URL(target);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return withRobotsHeader(NextResponse.redirect(target, { status: 302 }), pathname);
        }
      }
    }
  } catch {
    // Firestore không trả về hoặc parse lỗi → render page bình thường
  }

  return withRobotsHeader(NextResponse.next(), pathname);
}

export const config = {
  matcher: [
    '/view/:orderId*',
    '/dashboard/:path*',
    '/edit/:path*',
    '/upload/:path*',
    '/keychain',
    '/c/:path*',
  ],
};
