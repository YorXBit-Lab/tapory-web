'use client';

import { createContext, useContext } from 'react';

export interface CardAuthCtxType {
  isReady: boolean;
  isVerified: boolean;
  /** Calls onSuccess immediately if already verified, else shows phone modal first */
  requireAuth: (onSuccess: () => void) => void;
}

export const CardAuthCtx = createContext<CardAuthCtxType>({
  isReady: false,
  isVerified: false,
  requireAuth: () => {},
});

export function useCardAuthCtx() {
  return useContext(CardAuthCtx);
}
