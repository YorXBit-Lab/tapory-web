import type { IEditDraft } from '@/configs/types';

/**
 * Trả về danh sách ảnh để hiển thị. Khi chưa có ảnh nào, sinh `min` ô trống
 * (chuỗi rỗng) để layout vẽ placeholder — giữ bố cục không bị vỡ ở bản xem thử.
 */
export function getPhotos(data: IEditDraft, min = 6): { photos: string[]; isPlaceholder: boolean } {
  const real = (data.galleryUrls ?? []).filter(Boolean);
  if (real.length === 0) {
    return { photos: Array.from({ length: min }, () => ''), isPlaceholder: true };
  }
  return { photos: real, isPlaceholder: false };
}
