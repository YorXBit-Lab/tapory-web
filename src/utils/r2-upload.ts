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
