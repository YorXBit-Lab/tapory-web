export function getFontFamily(fontStyle?: string): string {
  if (fontStyle === 'serif')  return 'var(--font-playfair), "Playfair Display", Georgia, serif';
  if (fontStyle === 'script') return 'var(--font-dancing), "Dancing Script", cursive';
  return 'var(--font-montserrat), Montserrat, sans-serif';
}

export function getImageFilter(imageFilter?: string): string {
  switch (imageFilter) {
    case 'warm':     return 'sepia(15%) saturate(130%) brightness(104%)';
    case 'cool':     return 'saturate(82%) hue-rotate(12deg) brightness(100%)';
    case 'sepia':    return 'sepia(55%) brightness(98%)';
    case 'bw':       return 'grayscale(100%)';
    case 'dramatic': return 'contrast(118%) brightness(93%) saturate(110%)';
    default:         return 'none';
  }
}

export function getTitleFontSize(titleSize?: string): string {
  if (titleSize === 'sm') return '17px';
  if (titleSize === 'lg') return '26px';
  return '21px';
}
