import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/libs/firebase-admin';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  try {
    const snap = await getAdminDb().doc(`cards/${cardId}`).get();
    if (!snap.exists) return NextResponse.json({ exists: false });
    return NextResponse.json({ exists: true, templateId: snap.data()?.templateId ?? null });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
