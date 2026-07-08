import type { IEditDraft } from '@/configs/types';
import { env } from '@/libs/env';
import { experience } from './experience';

/**
 * Áp nội dung thẻ (IEditDraft) vào config `experience` của engine.
 * PHẢI gọi trước Stage.get() — engine chỉ đọc config một lần khi khởi tạo.
 * Field trống sẽ quay về giá trị mặc định (không giữ nội dung lần mở trước).
 */

// snapshot mặc định — lấy một lần trước mọi mutation
const DEFAULTS = {
  recipientName: experience.recipientName,
  mainGreeting: experience.mainGreeting,
  bigWish: experience.bigWish,
  messages: [...experience.messages],
  finalMessage: experience.finalMessage,
  photoUrls: [...experience.photoUrls],
};

/** Ảnh R2 public không có CORS header — WebGL texture phải đi qua proxy same-origin. */
function proxify(url: string): string {
  if (env.r2PublicUrl && url.startsWith(`${env.r2PublicUrl}/`)) {
    return `/api/img?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function applyDraftContent(data: IEditDraft) {
  const e = experience as unknown as {
    recipientName: string; mainGreeting: string; bigWish: string;
    messages: string[]; finalMessage: string; photoUrls: string[];
  };
  const lines = (data.description ?? '').split('\n').map(l => l.trim()).filter(Boolean);
  const photos = (data.photoUrls ?? []).filter(Boolean);

  e.recipientName = data.title?.trim() || DEFAULTS.recipientName;
  e.mainGreeting = data.mainGreeting?.trim() || DEFAULTS.mainGreeting;
  e.bigWish = data.bigWish?.trim() || DEFAULTS.bigWish;
  e.messages = lines.length ? lines : DEFAULTS.messages;
  e.finalMessage = data.finalMessage?.trim() || DEFAULTS.finalMessage;
  e.photoUrls = photos.length ? photos.map(proxify) : DEFAULTS.photoUrls;
}
