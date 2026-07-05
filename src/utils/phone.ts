/**
 * Chuẩn hoá & hash số điện thoại — NGUỒN SỰ THẬT DUY NHẤT.
 * Dùng chung cho toàn bộ luồng xác thực thẻ (server routes, tạo đơn, editor).
 * Đổi thuật toán ở đây → mọi nơi ăn theo, tránh lệch hash khiến khách không đăng nhập được.
 *
 * Dùng Web Crypto (crypto.subtle) để chạy được cả Node server runtime lẫn trình duyệt.
 */

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length >= 11) return '0' + digits.slice(2);
  return digits;
}

export async function hashPhone(phone: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalisePhone(phone)),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
