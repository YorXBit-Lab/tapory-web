export function getFontFamily(fontStyle?: string): string {
  switch (fontStyle) {
    case 'serif':      return 'var(--font-playfair), "Playfair Display", Georgia, serif';
    case 'script':     return 'var(--font-dancing), "Dancing Script", cursive';
    case 'be-vietnam': return 'var(--font-be-vietnam), "Be Vietnam Pro", sans-serif';
    case 'lora':       return 'var(--font-lora), Lora, Georgia, serif';
    case 'cormorant':  return 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif';
    case 'raleway':    return 'var(--font-raleway), Raleway, sans-serif';
    case 'nunito':     return 'var(--font-nunito), Nunito, sans-serif';
    case 'josefin':    return 'var(--font-josefin), "Josefin Sans", sans-serif';
    default:           return 'var(--font-montserrat), Montserrat, sans-serif';
  }
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
