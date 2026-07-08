export const experience = {
  recipientName: 'Em',
  mainGreeting: 'Chúc Mừng',
  bigWish: 'Happy Birthday',
  messages: [
    'Hôm nay là một ngày thật đặc biệt.',
    'Chúc em luôn xinh đẹp, vui vẻ',
    'và gặp thật nhiều may mắn.',
    'Mong mọi điều dịu dàng nhất',
    'sẽ đến với em.'
  ],
  finalMessage: 'Cảm ơn vì đã xuất hiện\ntrong cuộc đời anh',
  photoUrls: Array.from({ length: 8 }, (_, i) => `/photos/memory-${i + 1}.svg`),
  colors: {
    pink: '#ff4fa3', magenta: '#ff168f', purple: '#9b5cff',
    gold: '#ffdca8', white: '#fff7fc', black: '#030104'
  },
  copy: {
    title: 'Stardust Memory',
    subtitle: 'một bộ phim ký ức nhỏ, viết bằng ánh sáng',
    start: 'Chạm để bắt đầu',
    startHint: 'bật loa để trọn cảm xúc  ✦  một hành trình bằng ánh sáng',
    loading: 'đang thắp sáng những vì sao…',
    tapHint: 'chạm để tiếp tục  ·  kéo để xoay',
    greetingHint: 'một ngày chỉ dành riêng cho Em',
    sphere: 'Ký ức của chúng ta\nNhững khoảnh khắc vẫn luôn ở đây',
    tunnel: 'Xuyên qua thời gian\nMỗi bức ảnh là một vì sao',
    rain: 'Mưa ký ức\nChạm vào những dịu dàng đang rơi',
    gallery: 'Những điều dịu dàng\nGiữ lại một chút lấp lánh cho mai sau',
    signature: 'with all my heart  ✦',
    replay: 'Xem lại',
    copyLink: 'Sao chép liên kết',
    copied: 'Đã sao chép liên kết ✦',
    next: 'Chuyển cảnh tiếp theo',
    soundOn: 'Bật âm thanh',
    soundOff: 'Tắt âm thanh'
  },
  audio: { src: '', volume: 0.42 },
  // Optional short sound cues. Empty src = silent no-op, never an error.
  soundCues: {
    introHit: { src: '', volume: 0.5 },
    whoosh: { src: '', volume: 0.4 },
    gather: { src: '', volume: 0.35 },
    impact: { src: '', volume: 0.5 },
    rise: { src: '', volume: 0.45 }
  },
  controls: { tapToAdvance: true, dragToRotate: true },
  // mobileDpr 2: màn điện thoại DPR 2–3, cap 1 làm chữ hạt/bloom nhòe hẳn.
  // Máy yếu đã có auto-degrade (tier low giảm thêm 0.8×) nên vẫn an toàn.
  quality: { profile: 'auto' as QualityProfile, desktopDpr: 1.5, mobileDpr: 2, backgroundFps: 40 },
  timings: {
    greeting: 10500, letter: 16500, wish: 11000, explosion: 2800,
    sphere: 12000, tunnel: 11000, rain: 11000, gallery: 10500,
    transition: 900
  },
  // Per-chapter cinematic color grade. shadow/highlight tint the frame by luminance,
  // nebula/dust drive the environment palette. All hex, freely editable.
  grades: {
    // intro — đêm sâu, tím midnight, trắng lạnh
    intro:     { shadow: '#0b0618', highlight: '#dfe6ff', nebulaA: '#2a1b5e', nebulaB: '#4a2a86', dust: '#8fa3ff', amount: 0.55, exposure: 1.0,  vignette: 0.62, bloom: 0.5,  focus: 0.15 },
    // greeting — vàng ấm / hồng nhẹ / tím sâu
    greeting:  { shadow: '#170a1e', highlight: '#ffe9c9', nebulaA: '#5a2a6e', nebulaB: '#a0584c', dust: '#ffd9b8', amount: 0.5,  exposure: 1.05, vignette: 0.55, bloom: 0.55, focus: 0.2 },
    // letter — xanh đêm / trắng ngọc / ánh giấy mờ
    letter:    { shadow: '#0a1224', highlight: '#eaf4ff', nebulaA: '#1d3a5e', nebulaB: '#3a5a8a', dust: '#cfe4ff', amount: 0.5,  exposure: 1.02, vignette: 0.55, bloom: 0.5,  focus: 0.15 },
    // wish — vàng kim / cam / hồng pastel
    wish:      { shadow: '#1c0e08', highlight: '#ffe9c4', nebulaA: '#8a4a16', nebulaB: '#b8583a', dust: '#ffc9a0', amount: 0.52, exposure: 1.08, vignette: 0.5,  bloom: 0.65, focus: 0.2 },
    // explosion — trắng nóng / xanh tím / flare mạnh
    explosion: { shadow: '#0e0a2a', highlight: '#ffffff', nebulaA: '#3a2a9e', nebulaB: '#6a4ae0', dust: '#b8c4ff', amount: 0.5,  exposure: 1.15, vignette: 0.45, bloom: 0.8,  focus: 0.3 },
    // sphere — tím galaxy / cyan / gold
    sphere:    { shadow: '#140a26', highlight: '#e9f6ff', nebulaA: '#4a2a8e', nebulaB: '#1a6a8a', dust: '#9be0ff', amount: 0.44, exposure: 1.04, vignette: 0.55, bloom: 0.5,  focus: 0.55 },
    // tunnel — xanh điện / tím / streaks
    tunnel:    { shadow: '#081026', highlight: '#dceaff', nebulaA: '#1a3aae', nebulaB: '#5a2aae', dust: '#8fb8ff', amount: 0.45, exposure: 1.05, vignette: 0.6,  bloom: 0.55, focus: 0.5 },
    // rain — xanh đen / bạc / hạt mưa sáng
    rain:      { shadow: '#0a121a', highlight: '#e6eef4', nebulaA: '#22364a', nebulaB: '#3c5468', dust: '#c9d8e4', amount: 0.45, exposure: 1.0,  vignette: 0.58, bloom: 0.45, focus: 0.6 },
    // gallery — warm cinematic / soft amber / rose
    gallery:   { shadow: '#1a0f0c', highlight: '#ffe9d4', nebulaA: '#6e3a2a', nebulaB: '#8a4a5a', dust: '#ffd0b0', amount: 0.42, exposure: 1.02, vignette: 0.55, bloom: 0.45, focus: 0.65 },
    // final — gold dust / deep violet / soft white
    final:     { shadow: '#150a20', highlight: '#fff2e0', nebulaA: '#4a2a6e', nebulaB: '#8a6a3a', dust: '#ffe0b0', amount: 0.48, exposure: 1.04, vignette: 0.55, bloom: 0.55, focus: 0.35 }
  } as Record<SceneName, SceneGrade>,
  // Camera presets per chapter: fov + how far the rig rests from that chapter's focus point.
  camera: {
    baseFov: 46,
    presets: {
      intro:     { fov: 50, distance: 16 },
      greeting:  { fov: 44, distance: 16 },
      letter:    { fov: 46, distance: 16 },
      wish:      { fov: 42, distance: 16 },
      explosion: { fov: 52, distance: 16 },
      sphere:    { fov: 46, distance: 13.2 },
      tunnel:    { fov: 56, distance: 10 },
      rain:      { fov: 48, distance: 12 },
      gallery:   { fov: 44, distance: 14 },
      final:     { fov: 44, distance: 16 }
    } as Record<SceneName, { fov: number; distance: number }>
  },
  post: {
    bloomStrength: 0.55, bloomRadius: 0.65, bloomThreshold: 0.72,
    grain: 0.042, chromatic: 0.0016, vignette: 0.55, contrast: 1.06
  }
} as const;

/** Content that tapory-web (Góc Chạm) may override per card id. */
export type RemoteContent = Partial<{
  recipientName: string;
  mainGreeting: string;
  bigWish: string;
  messages: string[];
  finalMessage: string;
  photoUrls: string[];
  audioSrc: string;
  title: string;
  subtitle: string;
  signature: string;
  captions: Partial<{ sphere: string; tunnel: string; rain: string; gallery: string }>;
}>;

/**
 * Merge remote card content over the local defaults. Must run BEFORE the
 * Stage is created (see main.tsx) — the engine samples this config once.
 */
export function applyRemoteContent(remote: RemoteContent) {
  // the config is `as const` for editing ergonomics; this is the single
  // sanctioned mutation point, before anything reads it
  const e = experience as unknown as {
    recipientName: string; mainGreeting: string; bigWish: string;
    messages: string[]; finalMessage: string; photoUrls: string[];
    audio: { src: string; volume: number };
    copy: Record<string, string>;
  };
  if (remote.recipientName) e.recipientName = remote.recipientName;
  if (remote.mainGreeting) e.mainGreeting = remote.mainGreeting;
  if (remote.bigWish) e.bigWish = remote.bigWish;
  if (remote.messages?.length) e.messages = remote.messages;
  if (remote.finalMessage) e.finalMessage = remote.finalMessage;
  if (remote.photoUrls?.length) e.photoUrls = remote.photoUrls;
  if (remote.audioSrc) e.audio = { ...e.audio, src: remote.audioSrc };
  if (remote.title) e.copy.title = remote.title;
  if (remote.subtitle) e.copy.subtitle = remote.subtitle;
  if (remote.signature) e.copy.signature = remote.signature;
  if (remote.captions?.sphere) e.copy.sphere = remote.captions.sphere;
  if (remote.captions?.tunnel) e.copy.tunnel = remote.captions.tunnel;
  if (remote.captions?.rain) e.copy.rain = remote.captions.rain;
  if (remote.captions?.gallery) e.copy.gallery = remote.captions.gallery;
}

export type QualityProfile = 'low' | 'medium' | 'high' | 'auto';
export type SceneName = 'intro' | 'greeting' | 'letter' | 'wish' | 'explosion' | 'sphere' | 'tunnel' | 'rain' | 'gallery' | 'final';
export type TransitionName = 'vortex' | 'radial' | 'shockwave' | 'flash' | 'streak' | 'spiral' | 'blackout';
export type SceneGrade = {
  shadow: string; highlight: string; nebulaA: string; nebulaB: string; dust: string;
  amount: number; exposure: number; vignette: number; bloom: number; focus: number;
};
