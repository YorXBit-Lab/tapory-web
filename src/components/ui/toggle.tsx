'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, onPressedChange, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        data-state={pressed ? 'on' : 'off'}
        aria-pressed={pressed}
        onClick={(e) => {
          onPressedChange?.(!pressed);
          onClick?.(e);
        }}
        className={clsx(
          'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-slate-100 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          pressed && 'bg-slate-200 text-slate-900',
          !pressed && 'text-slate-600',
          className,
        )}
        {...props}
      />
    );
  },
);
Toggle.displayName = 'Toggle';
