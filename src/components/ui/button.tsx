'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-slate-900 text-white hover:bg-slate-800': variant === 'default',
            'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900': variant === 'outline',
            'hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
          },
          {
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-11 px-8 text-sm': size === 'lg',
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
