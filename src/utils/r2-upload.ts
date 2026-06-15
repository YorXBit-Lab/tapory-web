/** Upload ảnh cho memorial card. cardId dùng cho trường hợp admin (không cần khi dùng card_owner token). */
export async function uploadCardImage(
  file: File,
  idToken: string,
  cardId?: string,
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (cardId) formData.append('cardId', cardId);
  const res = await fetch('/api/card/upload-image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });
  const json = (await res.json()) as { url?: string; key?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Upload thất bại');
  return { url: json.url!, key: json.key! };
}

/** Best-effort xóa ảnh memorial khỏi R2 — không throw */
export async function deleteCardImage(key: string, idToken: string): Promise<void> {
  try {
    await fetch('/api/card/delete-image', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
  } catch (err) {
    console.warn('[deleteCardImage]', err);
  }
}

export async function uploadProductImage(
  file: File,
  idToken: string,
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  const json = (await res.json()) as { url?: string; key?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Upload thất bại');
  return { url: json.url!, key: json.key! };
}

/** Upload ảnh trong bài viết chi tiết sản phẩm — trả về URL công khai. */
export async function uploadArticleImage(file: File, idToken: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'articles');

  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  const json = (await res.json()) as { url?: string; key?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Upload thất bại');
  return json.url!;
}

/** Upload tài nguyên cấu hình website (logo, favicon, ảnh OG) — trả về URL công khai. */
export async function uploadSiteImage(file: File, idToken: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'site');

  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Upload thất bại');
  return json.url!;
}

export async function uploadPrintPhoto(
  file: File,
  orderId: string,
  itemIndex: number,
  slotIndex: number,
  side?: 'a' | 'b',
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('orderId', orderId);
  formData.append('itemIndex', String(itemIndex));
  formData.append('slotIndex', String(slotIndex));
  if (side) formData.append('side', side);

  const res = await fetch('/api/upload/print-photo', { method: 'POST', body: formData });
  const json = (await res.json()) as { url?: string; key?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Upload thất bại');
  return { url: json.url!, key: json.key! };
}

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');

/** Lấy R2 object key từ public URL. Trả về null nếu URL không phải R2. */
export function r2KeyFromUrl(url: string): string | null {
  if (!R2_BASE || !url.startsWith(R2_BASE)) return null;
  return url.slice(R2_BASE.length + 1);
}

/** Best-effort — không throw, chỉ log nếu lỗi */
export async function deleteProductImage(key: string, idToken: string): Promise<void> {
  try {
    await fetch('/api/admin/delete-image', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
  } catch (err) {
    console.warn('[deleteProductImage]', err);
  }
}
