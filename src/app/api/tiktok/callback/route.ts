import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/libs/tiktok';

// TikTok redirect về đây sau khi seller xác thực: /api/tiktok/callback?code=xxx&shop_id=xxx
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard/settings?tiktok=error&msg=missing_code`);
  }

  try {
    await exchangeCode(code);
    return NextResponse.redirect(`${origin}/dashboard/settings?tiktok=connected`);
  } catch (err) {
    const msg = encodeURIComponent(err instanceof Error ? err.message : 'unknown');
    return NextResponse.redirect(`${origin}/dashboard/settings?tiktok=error&msg=${msg}`);
  }
}
