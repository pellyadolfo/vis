import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { ProcessedPoint } from '../types/data';

interface MapComponentProps {
  points: ProcessedPoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function MapComponent({ points, center = { lat: 18.92, lng: -99.23 }, zoom = 11 }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[MapComponent] useEffect init, API Key:', !!GOOGLE_MAPS_API_KEY);
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in .env');
      setLoading(false);
      return;
    }

    if (mapInstanceRef.current) {
      console.log('[MapComponent] Map already exists, skipping init');
      setLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['marker'],
    });

    loader
      .load()
      .then(() => {
        console.log('[MapComponent] Google Maps API loaded');
        if (mapRef.current && !mapInstanceRef.current) {
          console.log('[MapComponent] Map ref:', mapRef.current);
          console.log('[MapComponent] Map ref size:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
          try {
            const newMap = new google.maps.Map(mapRef.current, {
              center,
              zoom,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              fullscreenControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              zoomControl: true,
            });
            mapInstanceRef.current = newMap;
            console.log('[MapComponent] Map created successfully');
          } catch (mapErr) {
            console.error('[MapComponent] Failed to create map:', mapErr);
            setError(`Failed to create map: ${mapErr instanceof Error ? mapErr.message : 'Unknown error'}`);
          }
        } else {
          console.warn('[MapComponent] Map ref not ready or map exists:', !!mapRef.current, !!mapInstanceRef.current);
        }
      })
      .catch((err) => {
        console.error('[MapComponent] Failed to load Google Maps:', err);
        setError(`Failed to load Google Maps: ${err instanceof Error ? err.message : 'Unknown error'}`);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      markersRef.current.forEach(marker => { marker.map = null; });
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) {
      console.log('[MapComponent] No map instance for markers');
      return;
    }

    console.log('[MapComponent] Updating markers:', points.length);

    markersRef.current.forEach(marker => { marker.map = null; });
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    points.forEach((point) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: point.parsedCoords,
        title: point.name,
        gmpClickable: true,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-gray-900">${point.name}</h3>
            <p class="text-sm text-gray-600 mt-1">Coordinates: ${point.coords}</p>
            <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div class="bg-blue-50 p-2 rounded">
                <p class="font-medium text-blue-900">Weekdays</p>
                <p class="text-blue-700">${point.parsedPeople.weekFrom} - ${point.parsedPeople.weekTo}</p>
                <p class="text-blue-600">Avg: ${Math.round(point.avgWeeklyVisitors)}</p>
              </div>
              <div class="bg-green-50 p-2 rounded">
                <p class="font-medium text-green-900">Weekends</p>
                <p class="text-green-700">${point.parsedPeople.weekendFrom} - ${point.parsedPeople.weekendTo}</p>
                <p class="text-green-600">Avg: ${Math.round(point.avgWeekendVisitors)}</p>
              </div>
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    if (points.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach(point => {
        bounds.extend(point.parsedCoords);
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }

    return () => {
      newMarkers.forEach(marker => { marker.map = null; });
    };
  }, [points]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 p-8">
        <div className="text-center text-red-600">
          <p className="font-medium mb-2">Map Error</p>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-400 mt-4">Add VITE_GOOGLE_MAPS_API_KEY to .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="map-container h-full w-full" />
  );
}