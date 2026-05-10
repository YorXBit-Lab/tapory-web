import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/libs/tiktok';

// Redirect admin đến trang xác thực TikTok Shop
export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: 'Thiếu TIKTOK_APP_KEY hoặc TIKTOK_REDIRECT_URI' }, { status: 500 });
  }
}
