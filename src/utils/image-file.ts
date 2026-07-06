/**
 * Ràng buộc ảnh phía client — GIỮ KHỚP với API `/api/card/upload-image`
 * (ALLOWED_TYPES + MAX_BYTES) để chặn sớm, tránh upload rồi mới bị server từ chối.
 */
export const MAX_IMAGE_MB = 5;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Trả về thông báo lỗi (tiếng Việt) nếu ảnh không hợp lệ, hoặc `null` nếu đạt yêu cầu. */
export function validateImageFile(file: File): string | null {
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}": chỉ chấp nhận JPEG, PNG, WebP, GIF.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}" nặng ${formatBytes(file.size)}, vượt giới hạn ${MAX_IMAGE_MB} MB.`;
  }
  return null;
}

/**
 * Lọc danh sách file thành hợp lệ / lỗi (kèm lý do) — dùng cho upload nhiều ảnh.
 */
export function partitionImageFiles(files: File[]): { valid: File[]; errors: string[] } {
  const valid: File[] = [];
  const errors: string[] = [];
  for (const f of files) {
    const err = validateImageFile(f);
    if (err) errors.push(err);
    else valid.push(f);
  }
  return { valid, errors };
}
