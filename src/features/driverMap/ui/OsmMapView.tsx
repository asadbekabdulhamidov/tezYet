import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";

function ViewUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center[0], center[1], zoom, map]);
  return null;
}

const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

type Props = {
  lat: number;
  lon: number;
  zoom: number;
  showMarker?: boolean;
  className?: string;
};

export function OsmMapView({
  lat,
  lon,
  zoom,
  showMarker = true,
  className = "",
}: Props) {
  const center: [number, number] = [lat, lon];
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`z-0 h-full w-full min-h-[200px] ${className}`}
      scrollWheelZoom
      attributionControl
    >
      <TileLayer attribution={OSM_ATTR} url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ViewUpdater center={center} zoom={zoom} />
      {showMarker ? (
        <CircleMarker
          center={center}
          radius={11}
          pathOptions={{
            color: "#0F3460",
            fillColor: "#1A6BAC",
            fillOpacity: 0.95,
            weight: 3,
          }}
        />
      ) : null}
    </MapContainer>
  );
}
