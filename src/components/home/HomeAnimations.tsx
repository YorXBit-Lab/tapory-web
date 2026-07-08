/**
 * Keyframes + global niceties for the home page (marquee scroll, NFC demo
 * phone/wave). Honours `prefers-reduced-motion` and adds anchor scroll padding
 * so the sticky nav doesn't cover section headings.
 */
export function HomeAnimations() {
  return (
    <style>{`
      @keyframes wavePulse {
        0%   { transform: scale(.3); opacity: 0; }
        20%  { opacity: .65; }
        100% { transform: scale(1); opacity: 0; }
      }
      @keyframes phoneTap {
        0%,100% { transform: translateY(-50%) rotate(-6deg) translateX(0); }
        50%     { transform: translateY(-50%) rotate(-6deg) translateX(44px); }
      }
      @keyframes scrollX {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      html { scroll-behavior: smooth; }
      section[id] { scroll-margin-top: 72px; }
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        [style*="animation"] { animation: none !important; }
      }
    `}</style>
  );
}
