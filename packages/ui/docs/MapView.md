# MapView

Renders a map centred on a given latitude/longitude. No API key required in development.

## Platforms

| File | Platform |
|---|---|
| `MapView.native.tsx` | React Native — stub (swap with `react-native-maps`) |
| `MapView.web.tsx` | Next.js — OpenStreetMap `<iframe>` embed |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `latitude` | `number` | — | Centre latitude |
| `longitude` | `number` | — | Centre longitude |
| `label` | `string` | — | Optional location label shown above the map |
| `zoom` | `number` | `14` | Zoom level (higher = closer) |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |

## Examples

```tsx
<MapView
  latitude={0.3476}
  longitude={32.5825}
  label="Kampala, Uganda"
  zoom={14}
  className="h-64"
/>
```

## Upgrading to a full map library

**Web** — replace the `<iframe>` with `react-leaflet` or `@vis.gl/react-google-maps`:

```tsx
import { MapContainer, TileLayer, Marker } from "react-leaflet";

<MapContainer center={[latitude, longitude]} zoom={zoom}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[latitude, longitude]} />
</MapContainer>
```

**Native** — replace the stub with `react-native-maps`:

```tsx
import MapView, { Marker } from "react-native-maps";

<MapView region={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
  <Marker coordinate={{ latitude, longitude }} title={label} />
</MapView>
```

## Import

```ts
import { MapView } from "@jefflink/ui";
```
