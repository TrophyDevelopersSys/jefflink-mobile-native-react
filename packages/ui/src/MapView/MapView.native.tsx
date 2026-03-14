/**
 * MapView — Native stub.
 * Install `react-native-maps` and replace this with the real implementation.
 *
 * npm install react-native-maps
 * then:
 *   import MapView, { Marker } from 'react-native-maps'
 */
import React from "react";
import { View, Text } from "react-native";

export interface MapViewProps {
  latitude: number;
  longitude: number;
  label?: string;
  zoom?: number;
  className?: string;
}

export function MapView({ latitude, longitude, label, className = "" }: MapViewProps) {
  return (
    <View
      className={`bg-surface border border-border/40 rounded-card items-center justify-center gap-2 h-48 ${className}`}
    >
      <Text className="text-2xl">🗺️</Text>
      {label ? <Text className="text-xs text-text-muted">{label}</Text> : null}
      <Text className="text-xs text-text-muted">
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </Text>
      <Text className="text-xs text-border">Install react-native-maps to render the map</Text>
    </View>
  );
}
