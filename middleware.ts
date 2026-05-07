import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/view\/([^/]+)$/);
  if (!match) return NextResponse.next();

  const orderId   = match[1];
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return NextResponse.next();

  try {
    const firestoreUrl =
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/memorials/${orderId}`;
    const res = await fetch(firestoreUrl, { next: { revalidate: 30 } });
    if (!res.ok) return NextResponse.next();

    const doc = await res.json();
    const fields = doc.fields as Record<string, { stringValue?: string }> | undefined;

    if (fields?.templateId?.stringValue === 'redirect') {
      const target = fields?.website?.stringValue;
      if (target) {
        // Validate URL để tránh open redirect với protocol lạ
        const parsed = new URL(target);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return NextResponse.redirect(target, { status: 302 });
        }
      }
    }
  } catch {
    // Firestore không trả về hoặc parse lỗi → render page bình thường
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/view/:orderId*',
};
