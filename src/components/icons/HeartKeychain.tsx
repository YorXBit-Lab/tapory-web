'use client';

import { useId } from 'react';
import type { IconProps } from './types';

/**
 * Decorative brand keychain illustration (heart pendant + ring).
 *
 * Uses `useId()` to scope its gradient ids so multiple instances on the same
 * page never collide. Purely decorative → marked `aria-hidden`.
 */
export function HeartKeychain({ size = 160, ...props }: IconProps) {
  const uid = useId();
  const heartGradient = `${uid}-heart`;
  const ringGradient = `${uid}-ring`;

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <radialGradient id={heartGradient} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#F6F0E8" />
          <stop offset="60%" stopColor="#D8C3AE" />
          <stop offset="100%" stopColor="#8B6B52" />
        </radialGradient>
        <radialGradient id={ringGradient} cx="40%" cy="40%">
          <stop offset="0%" stopColor="#f5e6c5" />
          <stop offset="100%" stopColor="#9b7240" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="32" r="20" fill="none" stroke={`url(#${ringGradient})`} strokeWidth="4" />
      <path d="M100 52 Q95 70 100 90" stroke="#b48b5a" strokeWidth="2" fill="none" />
      <path
        d="M100 180 C60 140,30 110,50 80 C60 65,85 65,100 90 C115 65,140 65,150 80 C170 110,140 140,100 180 Z"
        fill={`url(#${heartGradient})`}
        stroke="#5E4634"
        strokeWidth="1.5"
      />
      <g transform="translate(100,130)">
        <path d="M-10 0 Q0-8 10 0" stroke="white" strokeWidth="2" fill="none" opacity=".9" />
        <path d="M-16 5 Q0-12 16 5" stroke="white" strokeWidth="2" fill="none" opacity=".7" />
        <path d="M-22 10 Q0-16 22 10" stroke="white" strokeWidth="2" fill="none" opacity=".5" />
      </g>
    </svg>
  );
}
