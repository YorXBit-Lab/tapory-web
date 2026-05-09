'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardAPI } from '@/services/CardAPI';

export default function NfcRedirectPage({ params }: { params: { cardId: string } }) {
  const { cardId } = params;
  const router = useRouter();

  useEffect(() => {
    CardAPI.getOne(cardId).then((card) => {
      if (!card || !card.hasContent) {
        router.replace(`/edit/${cardId}`);
      } else if (card.status === 'locked' || card.status === 'expired') {
        router.replace(`/view/${cardId}`);
      } else {
        router.replace(`/view/${cardId}`);
      }
    }).catch(() => {
      // Card doc not found → treat as new card
      router.replace(`/edit/${cardId}`);
    });
  }, [cardId, router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-indigo-500" />
      <p className="text-sm text-gray-400">Đang tải…</p>
    </div>
  );
}
