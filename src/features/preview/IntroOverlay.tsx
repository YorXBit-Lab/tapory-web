'use client';

import { CSS, type BaseProps } from './intro/shared';
import { LetterIntro } from './intro/LetterIntro';
import { CurtainIntro } from './intro/CurtainIntro';
import { PolaroidIntro } from './intro/PolaroidIntro';
import { CountdownIntro } from './intro/CountdownIntro';
import { TypewriterIntro } from './intro/TypewriterIntro';
import { RoseIntro } from './intro/RoseIntro';
import { LockIntro } from './intro/LockIntro';
import { GateIntro } from './intro/GateIntro';
import { FlipIntro } from './intro/FlipIntro';
import { ScratchIntro } from './intro/ScratchIntro';
import { DustIntro } from './intro/DustIntro';
import { VoiceIntro } from './intro/VoiceIntro';
import { UniverseIntro } from './intro/UniverseIntro';
import { ReelIntro } from './intro/ReelIntro';
import { BookIntro } from './intro/BookIntro';

export interface IntroOverlayProps {
  introId: string;
  onComplete: () => void;
  primaryColor?: string;
  accentColor?: string;
  title?: string;
  imageUrl?: string;
}

export function IntroOverlay({
  introId,
  onComplete,
  primaryColor = '#c45c8a',
  accentColor  = '#f8b4cc',
  title        = '',
  imageUrl,
}: IntroOverlayProps) {
  const props: BaseProps = { onComplete, primaryColor, accentColor, title, imageUrl };

  if (!introId || introId === 'none') { onComplete(); return null; }

  const map: Record<string, React.ComponentType<BaseProps>> = {
    letter:     LetterIntro,
    curtain:    CurtainIntro,
    polaroid:   PolaroidIntro,
    countdown:  CountdownIntro,
    typewriter: TypewriterIntro,
    rose:       RoseIntro,
    lock:       LockIntro,
    gate:       GateIntro,
    flip:       FlipIntro,
    scratch:    ScratchIntro,
    dust:       DustIntro,
    voice:      VoiceIntro,
    universe:   UniverseIntro,
    reel:       ReelIntro,
    book:       BookIntro,
  };

  const Component = map[introId];
  if (!Component) { onComplete(); return null; }

  return (
    <>
      <style>{CSS}</style>
      <Component {...props} />
    </>
  );
}
