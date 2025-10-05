import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export interface MapLocationPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  language?: 'ar' | 'en';
  height?: number;
  disabled?: boolean;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
  language = 'en',
  height = 300,
  disabled = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const initialCenter: [number, number] = [longitude ?? 46.6753, latitude ?? 24.7136];
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: 11,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: 'metric' }));

    if (latitude !== undefined && longitude !== undefined) {
      markerRef.current = new mapboxgl.Marker({ draggable: !disabled })
        .setLngLat([longitude, latitude])
        .addTo(map);
    }

  const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (disabled) return;
      const { lng, lat } = e.lngLat;
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLngLat();
          onChange(pos.lat, pos.lng);
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
      onChange(lat, lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, disabled, onChange]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (latitude !== undefined && longitude !== undefined) {
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ draggable: !disabled })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      } else {
        markerRef.current.setLngLat([longitude, latitude]);
      }
    }
  }, [latitude, longitude, disabled]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation || disabled) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
        }
        if (!markerRef.current && mapRef.current) {
          markerRef.current = new mapboxgl.Marker({ draggable: !disabled })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);
        } else if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        }
        onChange(lat, lng);
      },
      () => {}
    );
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="p-4 border rounded-md bg-yellow-50 text-sm text-yellow-800">
        {language === 'ar'
          ? 'لم يتم العثور على مفتاح Mapbox. أضف VITE_MAPBOX_TOKEN إلى ملف البيئة.'
          : 'Mapbox token missing. Add VITE_MAPBOX_TOKEN to your environment.'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">
          {language === 'ar' ? 'حدد الموقع على الخريطة' : 'Select location on map'}
        </span>
        <button
          type="button"
          onClick={handleUseMyLocation}
            className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={disabled}
        >
          {language === 'ar' ? 'موقعي الحالي' : 'My Location'}
        </button>
      </div>
      <div
        ref={mapContainerRef}
        style={{ height, borderRadius: 8 }}
        className="w-full overflow-hidden border border-gray-200 shadow-inner"
      />
    </div>
  );
};

export default MapLocationPicker;
