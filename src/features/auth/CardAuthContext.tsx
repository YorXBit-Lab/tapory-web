'use client';

import { createContext, useContext } from 'react';

export interface CardAuthCtxType {
  isVerified: boolean;
  /** Calls onSuccess immediately if already verified, else shows phone modal first */
  requireAuth: (onSuccess: () => void) => void;
}

export const CardAuthCtx = createContext<CardAuthCtxType>({
  isVerified: true,
  requireAuth: (cb) => cb(),
});

export function useCardAuthCtx() {
  return useContext(CardAuthCtx);
}
