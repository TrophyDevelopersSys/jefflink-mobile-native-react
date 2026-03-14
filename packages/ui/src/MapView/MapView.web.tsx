/**
 * MapView — Web stub.
 * Swap the inner div for a Leaflet / Google Maps / Mapbox embed as needed.
 *
 * Example with react-leaflet:
 *   import { MapContainer, TileLayer, Marker } from 'react-leaflet'
 */
import React from "react";

export interface MapViewProps {
  latitude: number;
  longitude: number;
  label?: string;
  zoom?: number;
  className?: string;
}

export function MapView({ latitude, longitude, label, zoom = 14, className = "" }: MapViewProps) {
  // OpenStreetMap static tile URL — no API key required, safe for dev
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className={`overflow-hidden rounded-card border border-border/40 bg-surface ${className}`}>
      {label ? (
        <div className="px-3 py-2 text-xs text-text-muted border-b border-border/40">
          📍 {label}
        </div>
      ) : null}
      <iframe
        title={label ?? "Map"}
        src={src}
        width="100%"
        height="240"
        className="border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
