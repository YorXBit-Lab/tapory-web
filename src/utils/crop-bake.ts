/**
 * Bake một vùng crop (kéo/zoom trong editor) thành PNG ở độ phân giải in.
 * Vẽ ảnh theo transform trong khung display rồi upscale lên kích thước output,
 * clip theo hình (tròn → góc trong suốt). Dùng cho luồng upload ảnh in.
 *
 * Cùng kỹ thuật với keychain canvasExport — render từ blob cục bộ (không dính
 * CORS taint) nên toDataURL/toBlob luôn chạy được.
 */

export interface BakeCropParams {
  /** Kích thước khung editor (px) — cùng hệ toạ độ với transform. */
  displayW: number;
  displayH: number;
  /** Kích thước ảnh output (px) — thường là cmToPx(cm, 300). */
  outputW: number;
  outputH: number;
  isCircle: boolean;
  transform: { x: number; y: number; scale: number; scaleY?: number };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function bakeCropToBlob(source: Blob | string, p: BakeCropParams): Promise<Blob> {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  try {
    const img = await loadImage(url);
    const upscale = p.outputW / p.displayW;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(p.outputW);
    canvas.height = Math.round(p.outputH);
    const ctx = canvas.getContext('2d')!;

    ctx.save();
    ctx.beginPath();
    if (p.isCircle) {
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(0, 0, canvas.width, canvas.height);
    }
    ctx.clip();

    const scaleY = p.transform.scaleY ?? p.transform.scale;
    ctx.drawImage(
      img,
      p.transform.x * upscale,
      p.transform.y * upscale,
      img.naturalWidth * p.transform.scale * upscale,
      img.naturalHeight * scaleY * upscale,
    );
    ctx.restore();

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Không tạo được ảnh'))), 'image/png'),
    );
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(url);
  }
}
