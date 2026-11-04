import { useEffect, useState } from 'react';

// Hash routes are plain names (e.g. #stage-3, #learn-attention) so links survive anywhere.
export function useRoute(): string {
  const [r, setR] = useState(() => (location.hash || '#home').slice(1));
  useEffect(() => {
    const on = () => {
      setR((location.hash || '#home').slice(1));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r || 'home';
}

export function go(route: string) {
  if (location.hash.slice(1) === route) return;
  location.hash = route;
}
