import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../../lib/loadGoogleMapsApi';
import { Search } from 'lucide-react';

interface PlacesAutocompleteProps {
  apiKey?: string;
  language?: 'ar' | 'en';
  onPlaceSelected: (data: {
    placeId: string;
    name: string;
    lat?: number;
    lng?: number;
    formattedAddress?: string;
    intlPhone?: string;
    website?: string;
    rating?: number;
    url?: string;
    types?: string[];
  }) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface PredictionItem { description: string; place_id: string; types?: string[] }

// Minimal typed wrappers (avoid any while google types may not be loaded)
interface PlaceResultLike {
  place_id?: string;
  name?: string;
  geometry?: { location?: { lat(): number; lng(): number } };
  formatted_address?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  url?: string;
  types?: string[];
}

function debounce<F extends (...args: Parameters<F>) => void>(fn: F, ms = 300) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<F>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  apiKey,
  language = 'en',
  onPlaceSelected,
  placeholder,
  disabled,
}) => {
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  // use type assertions guarded at runtime since google may not yet be loaded
  const serviceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const detailsServiceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
    if (!apiKey) return; // will show hint outside
    loadGoogleMapsApi(apiKey, language).then((g) => {
      if (g?.maps?.places && containerRef.current) {
        try {
          // Access constructors dynamically to avoid type complaints
          const placesNs: any = g.maps.places; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (placesNs?.AutocompleteService) {
            serviceRef.current = new placesNs.AutocompleteService();
          }
          if (placesNs?.PlacesService) {
            detailsServiceRef.current = new placesNs.PlacesService(containerRef.current);
          }
          setReady(Boolean(serviceRef.current && detailsServiceRef.current));
        } catch {
          // silently ignore
        }
      }
    });
  }, [apiKey, language]);

  useEffect(() => {
    const handler = debounce((text: string) => {
      if (!serviceRef.current || !text) { setPredictions([]); return; }
      setLoading(true);
      serviceRef.current.getPlacePredictions({ input: text, language }, (results: PredictionItem[] | null) => {
        setPredictions(results?.map(r => ({ description: r.description, place_id: r.place_id, types: r.types || [] })) ?? []);
        setLoading(false);
      });
    }, 350);
    handler(query);
  }, [query, language]);

  const handleSelect = (p: PredictionItem) => {
    setQuery(p.description);
    setPredictions([]);
    if (!detailsServiceRef.current) return;
    detailsServiceRef.current.getDetails({ placeId: p.place_id, fields: ['place_id','name','geometry','formatted_address','international_phone_number','website','rating','url','types'] }, (place: PlaceResultLike | null, status: string) => {
      const successStatus = (window as any)?.google?.maps?.places?.PlacesServiceStatus?.OK; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!place || (successStatus && status !== successStatus)) return;
      onPlaceSelected({
        placeId: place.place_id!,
        name: place.name || p.description,
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
        formattedAddress: place.formatted_address,
        intlPhone: place.international_phone_number,
        website: place.website || place.url,
        rating: place.rating,
        url: place.url,
        types: place.types,
      });
    });
  };

  return (
    <div className="space-y-1" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          placeholder={placeholder || (language === 'ar' ? 'بحث جوجل عن الخدمة (اسم مستشفى، مدرسة...)' : 'Search Google (hospital, school...)')}
          value={query}
          disabled={!ready || disabled}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="h-4 w-4 absolute top-1/2 -translate-y-1/2 right-2 text-gray-400" />
      </div>
      {apiKey && ready && predictions.length > 0 && (
        <div className="border border-gray-200 rounded-md bg-white shadow-sm max-h-56 overflow-y-auto text-sm z-20 relative">
          {predictions.map(p => (
            <button
              type="button"
              key={p.place_id}
              onClick={() => handleSelect(p)}
              className="w-full text-right px-3 py-2 hover:bg-blue-50 border-b last:border-b-0"
            >
              {p.description}
            </button>
          ))}
          {loading && <div className="px-3 py-2 text-gray-400">{language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>}
        </div>
      )}
      {!apiKey && (
        <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
          {language === 'ar' ? 'أضف VITE_GOOGLE_PLACES_API_KEY في ملف البيئة لتفعيل البحث التلقائي' : 'Add VITE_GOOGLE_PLACES_API_KEY in env to enable Google Places search'}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
