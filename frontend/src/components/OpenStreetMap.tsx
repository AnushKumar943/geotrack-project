'use client';

import { MapContainer, Marker, Polyline, TileLayer, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LocationPoint } from "@/lib/api";
import { useEffect } from "react";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(position, Math.max(map.getZoom(), 13)); }, [map, position]);
  return null;
}

export default function OpenStreetMap({ points }: { points: LocationPoint[] }) {
  const latest = points[points.length - 1];
  const center: [number, number] = latest
    ? [Number(latest.latitude), Number(latest.longitude)]
    : [12.9716, 77.5946];
  const positions = points.map(p => [Number(p.latitude), Number(p.longitude)] as [number, number]);

  return (
    <MapContainer center={center} zoom={latest ? 13 : 5} scrollWheelZoom style={{ width: "100%", height: "100%", minHeight: 380, borderRadius: 16 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter position={center} />
      {points.map(point => (
        <Marker key={point.id} position={[Number(point.latitude), Number(point.longitude)]} icon={icon}>
          <Popup>
            <strong>{point.user_identifier}</strong><br />
            {new Date(point.timestamp).toLocaleString()}<br />
            {Number(point.latitude).toFixed(6)}, {Number(point.longitude).toFixed(6)}<br />
            Accuracy: {point.accuracy ?? "—"} m
          </Popup>
        </Marker>
      ))}
      {positions.length > 1 && <Polyline positions={positions} pathOptions={{ color: "#2563eb", weight: 4 }} />}
    </MapContainer>
  );
}
