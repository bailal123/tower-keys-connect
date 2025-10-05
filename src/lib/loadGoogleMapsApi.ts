// Utility to dynamically load Google Maps JavaScript API (Places library)
// Minimal google namespace shim (helps during SSR/build before script loads)
declare global { // allow referencing google symbols in typing
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace google {
    // minimal structure we rely on (we don't fully type the API)
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace maps {
      // eslint-disable-next-line @typescript-eslint/no-namespace
      namespace places {
        // markers for status enum safe-check
        const PlacesServiceStatus: Record<string, string>;
      }
    }
  }
}

let googleMapsApiLoading: Promise<typeof window.google | null> | null = null;

export const loadGoogleMapsApi = (apiKey?: string, language: 'ar' | 'en' = 'en'): Promise<typeof window.google | null> => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const g = (window as unknown as { google?: typeof window.google }).google;
  if (g?.maps?.places) return Promise.resolve(g);
  if (googleMapsApiLoading) return googleMapsApiLoading;
  if (!apiKey) return Promise.resolve(null);

  googleMapsApiLoading = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps-loader="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as typeof window & { google?: typeof window.google }).google ?? null));
      existing.addEventListener('error', () => resolve(null));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${language}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = 'true';
    script.onload = () => resolve((window as typeof window & { google?: typeof window.google }).google ?? null);
    script.onerror = () => { resolve(null); };
    document.head.appendChild(script);
  });
  return googleMapsApiLoading;
};

export default loadGoogleMapsApi;
