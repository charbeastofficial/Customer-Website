"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Served from public/leaflet -- importing these PNGs straight from
// node_modules doesn't resolve reliably through Turbopack's asset pipeline.
const pin = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);
  return null;
}

export default function LeafletMap({ center, marker, onPick, shopCenter, radiusKm }) {
  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shopCenter && radiusKm && (
        <Circle
          center={shopCenter}
          radius={radiusKm * 1000}
          pathOptions={{ color: "#c2410c", fillColor: "#c2410c", fillOpacity: 0.08, weight: 1.5 }}
        />
      )}
      {marker && <Marker position={marker} icon={pin} />}
      <ClickHandler onPick={onPick} />
      <Recenter lat={marker?.[0]} lng={marker?.[1]} />
    </MapContainer>
  );
}
