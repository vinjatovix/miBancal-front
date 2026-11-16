import L from 'leaflet';
import { useEffect, useRef } from 'react';

import 'leaflet/dist/leaflet.css';
import './locationMapPicker.css';

interface Props {
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly onChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: readonly [number, number] = [40.4168, -3.7038];
const DEFAULT_ZOOM = 6;
const FOCUSED_ZOOM = 13;

const PIN_SVG =
  '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

const markerIcon = L.divIcon({
  className: 'location-map-marker',
  html: PIN_SVG,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

export default function LocationMapPicker({
  latitude,
  longitude,
  onChange
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const initialCoordsRef = useRef({ latitude, longitude });

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const { latitude: initLat, longitude: initLng } = initialCoordsRef.current;
    const initialCenter: [number, number] =
      initLat !== null && initLng !== null
        ? [initLat, initLng]
        : [DEFAULT_CENTER[0], DEFAULT_CENTER[1]];
    const initialZoom =
      initLat !== null && initLng !== null ? FOCUSED_ZOOM : DEFAULT_ZOOM;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
    }).addTo(map);

    if (initLat !== null && initLng !== null) {
      const marker = L.marker([initLat, initLng], {
        icon: markerIcon,
        draggable: true
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChangeRef.current(
          Number(pos.lat.toFixed(4)),
          Number(pos.lng.toFixed(4))
        );
      });

      markerRef.current = marker;
    }

    map.on('click', (event: L.LeafletMouseEvent) => {
      const clickedLat = Number(event.latlng.lat.toFixed(4));
      const clickedLng = Number(event.latlng.lng.toFixed(4));
      onChangeRef.current(clickedLat, clickedLng);
    });

    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (latitude === null || longitude === null) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const currentMarker = markerRef.current;
    if (currentMarker) {
      currentMarker.setLatLng([latitude, longitude]);
    } else {
      const newMarker = L.marker([latitude, longitude], {
        icon: markerIcon,
        draggable: true
      }).addTo(map);

      newMarker.on('dragend', () => {
        const pos = newMarker.getLatLng();
        onChangeRef.current(
          Number(pos.lat.toFixed(4)),
          Number(pos.lng.toFixed(4))
        );
      });

      markerRef.current = newMarker;
    }

    map.setView(
      [latitude, longitude],
      map.getZoom() < 10 ? FOCUSED_ZOOM : map.getZoom()
    );
  }, [latitude, longitude]);

  return (
    <div className="location-map-picker">
      <div ref={containerRef} className="location-map-picker__container" />
    </div>
  );
}
