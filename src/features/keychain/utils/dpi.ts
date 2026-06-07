const CM_PER_INCH = 2.54;

/** Convert centimeters to pixels at a given DPI */
export function cmToPx(cm: number, dpi: number): number {
  return Math.round((cm / CM_PER_INCH) * dpi);
}

/** Convert millimeters to PDF points (1pt = 1/72 inch ) */
export function mmToPt(mm: number): number {
  return (mm / 25.4) * 72;
}

export const A4_W_PT = mmToPt(210); // 595.28
export const A4_H_PT = mmToPt(297); // 841.89
