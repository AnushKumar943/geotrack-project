'use client';

import dynamic from "next/dynamic";
import { GoogleMap, InfoWindow, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import type { LocationPoint } from "@/lib/api";
import { useMemo, useState } from "react";

const LeafletMap = dynamic(() => import("./OpenStreetMap"), { ssr: false });

const containerStyle = { width: "100%", height: "100%", minHeight: "380px", borderRadius: "16px" };

export default function MapPanel({ points }: { points: LocationPoint[] }) {
  const [selected, setSelected] = useState<LocationPoint | null>(null);
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const path = useMemo(() => points.map(p => ({ lat: Number(p.latitude), lng: Number(p.longitude) })), [points]);
  const center = path[path.length - 1] || { lat: 12.9716, lng: 77.5946 };

  if (!googleKey) return <LeafletMap points={points} />;

  return (
    <LoadScript googleMapsApiKey={googleKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={path.length ? 14 : 5} options={{ streetViewControl: false, mapTypeControl: false }}>
        {points.map(point => (
          <Marker key={point.id} position={{ lat: Number(point.latitude), lng: Number(point.longitude) }} onClick={() => setSelected(point)} />
        ))}
        {path.length > 1 && <Polyline path={path} options={{ strokeColor: "#2563eb", strokeOpacity: 0.9, strokeWeight: 4 }} />}
        {selected && <InfoWindow position={{ lat: Number(selected.latitude), lng: Number(selected.longitude) }} onCloseClick={() => setSelected(null)}>
          <div style={{ color: "#111827", maxWidth: 220 }}>
            <strong>{selected.user_identifier}</strong><br />
            {new Date(selected.timestamp).toLocaleString()}<br />
            {Number(selected.latitude).toFixed(6)}, {Number(selected.longitude).toFixed(6)}<br />
            Accuracy: {selected.accuracy ?? "—"} m
          </div>
        </InfoWindow>}
      </GoogleMap>
    </LoadScript>
  );
}
