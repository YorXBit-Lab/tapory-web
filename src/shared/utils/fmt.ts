export function fmt(d?: string): string {
  return d ? new Date(d).toLocaleDateString('vi-VN') : '';
}
