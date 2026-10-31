import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { ProcessedPoint } from '../types/data';

interface MapComponentProps {
  points: ProcessedPoint[];
  categoryColors?: Map<string, string>;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const DEFAULT_ICON_PATH = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

export function MapComponent({ points, categoryColors = new Map(), center = { lat: 18.92, lng: -99.23 }, zoom = 11 }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
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
            // Trigger resize to ensure map renders correctly
            google.maps.event.trigger(newMap, 'resize');

            // Create shared InfoWindow
            infoWindowRef.current = new google.maps.InfoWindow();

            // Close InfoWindow when clicking on map
            newMap.addListener('click', () => {
              infoWindowRef.current?.close();
            });
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
      markersRef.current.forEach(marker => { marker.setMap(null); });
      markersRef.current = [];
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) {
      console.log('[MapComponent] No map instance for markers');
      return;
    }

    console.log('[MapComponent] Updating markers:', points.length);

    markersRef.current.forEach(marker => { marker.setMap(null); });
    const newMarkers: google.maps.Marker[] = [];

    points.forEach((point, index) => {
      try {
        console.log(`[MapComponent] Creating marker ${index}:`, point.name, point.parsedCoords, 'category:', point.category);
        const categoryColor = categoryColors.get(point.category) || '#3b82f6';
        console.log(`[MapComponent] Color for ${point.category}:`, categoryColor);
        const icon = {
          path: DEFAULT_ICON_PATH,
          fillColor: categoryColor,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 1,
          anchor: new google.maps.Point(12, 24),
        };
        const marker = new google.maps.Marker({
          map,
          position: point.parsedCoords,
          title: point.name,
          icon,
        });

        const content = `
            <div class="p-2 min-w-[200px]">
              <h3 class="font-bold text-gray-900">${point.name}</h3>
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
          `;

        marker.addListener('click', () => {
          infoWindowRef.current?.setContent(content);
          infoWindowRef.current?.open(map, marker);
        });

        newMarkers.push(marker);
      } catch (markerErr) {
        console.error(`[MapComponent] Failed to create marker for ${point.name}:`, markerErr);
      }
    });

    markersRef.current = newMarkers;

    return () => {
      newMarkers.forEach(marker => { 
        try { marker.setMap(null); } catch {}
      });
    };
  }, [points]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="map-container h-full w-full" />
      {loading && (
        <div ref={overlayRef} className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 pointer-events-none">
          <div className="text-center pointer-events-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      )}
      {error && (
        <div ref={overlayRef} className="absolute inset-0 flex items-center justify-center bg-gray-100 p-8 z-10 pointer-events-none">
          <div className="text-center text-red-600 pointer-events-auto">
            <p className="font-medium mb-2">Map Error</p>
            <p className="text-sm text-gray-600">{error}</p>
            <p className="text-xs text-gray-400 mt-4">Add VITE_GOOGLE_MAPS_API_KEY to .env file</p>
          </div>
        </div>
      )}
    </div>
  );
}