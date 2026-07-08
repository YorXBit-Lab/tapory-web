'use client';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Do not wrap children in redux-persist's <PersistGate>. PersistGate
  // withholds its children until the store rehydrates from localStorage, which
  // only happens on the client — so during SSR it renders nothing and the whole
  // app ships as an empty shell (no content, no JSON-LD in the HTML), which is
  // bad for SEO. The persistor still rehydrates automatically; we just don't
  // block server rendering on it. Persisted state is applied right after
  // hydration via a normal store update (no hydration mismatch).
  return <Provider store={store}>{children}</Provider>;
}
