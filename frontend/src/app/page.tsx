
'use client';

import { createLocation } from "@/lib/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapPanel from "@/components/MapPanel";
import { getHistory, getLatest, saveLocation, type LocationPoint } from "@/lib/api";

const defaultIdentifier = process.env.NEXT_PUBLIC_DEFAULT_USER_IDENTIFIER || "intern_01";

function describeGeoError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return "Location permission was denied. Allow location access in your browser settings and try again.";
  if (error.code === error.POSITION_UNAVAILABLE) return "Your device could not determine a location. Check location services and try again.";
  if (error.code === error.TIMEOUT) return "Location request timed out. Please try again.";
  return "Unable to retrieve your location.";
}

export default function HomePage() {
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [latestAll, setLatestAll] = useState<LocationPoint[]>([]);
  const [busy, setBusy] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [message, setMessage] = useState("Ready to check in. Allow location access when prompted.");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">("info");
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshData = useCallback(async (user = identifier) => {
    if (!user.trim()) return;
    try {
      const [history, latest] = await Promise.all([getHistory(user.trim()), getLatest()]);
      setPoints(history);
      setLatestAll(latest);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load saved locations.");
      setMessageType("error");
    }
  }, [identifier]);

  useEffect(() => { void refreshData(); }, [refreshData]);

  const checkIn = useCallback(() => {
    if (!identifier.trim()) {
      setMessage("Enter a user/device identifier first.");
      setMessageType("error");
      return;
    }
    if (!("geolocation" in navigator)) {
      setMessage("This browser does not support geolocation.");
      setMessageType("error");
      return;
    }
    setBusy(true);
    setMessage("Requesting your current GPS location…");
    setMessageType("info");
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const saved = await createLocation({
        user_identifier: identifier.trim(),
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
        accuracy: position.coords.accuracy,
        });
        setLastSynced(saved.timestamp);
        setMessage(`Location saved successfully for ${saved.user_identifier}.`);
        setMessageType("success");
        await refreshData(identifier.trim());
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not save location to the server.");
        setMessageType("error");
      } finally {
        setBusy(false);
      }
    }, error => {
      setMessage(describeGeoError(error));
      setMessageType("error");
      setBusy(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
  }, [identifier, refreshData]);

  useEffect(() => {
    if (autoSync) {
      checkIn();
      timerRef.current = setInterval(checkIn, 30000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoSync, checkIn]);

  const latestPoint = points[points.length - 1];
  const distanceLabel = useMemo(() => points.length === 1 ? "1 point" : `${points.length} points`, [points.length]);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Geospatial location portal
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">GeoTrack</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">Check in from your device, review saved locations, and visualize your travel trail.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">API status</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Local backend configured</p>
            <p className="mt-1 text-xs text-slate-500">127.0.0.1:8000</p>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Your recorded points" value={String(points.length)} note="Selected identifier" />
          <StatCard label="Tracked identifiers" value={String(latestAll.length)} note="Latest known devices" />
          <StatCard label="Latest latitude" value={latestPoint ? Number(latestPoint.latitude).toFixed(5) : "—"} note="Most recent check-in" />
          <StatCard label="Latest longitude" value={latestPoint ? Number(latestPoint.longitude).toFixed(5) : "—"} note={lastSynced ? `Synced ${new Date(lastSynced).toLocaleTimeString()}` : "Waiting for first sync"} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Location map</h2>
                <p className="text-sm text-slate-500">Markers show saved points; the line connects historical points.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{distanceLabel}</span>
            </div>
            <div className="h-[390px] overflow-hidden rounded-2xl border border-slate-100 md:h-[520px]">
              <MapPanel points={points} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 px-1 text-xs text-slate-500">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Saved location</span>
              <span>Map data: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Google Maps" : "OpenStreetMap fallback"}</span>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Location controls</h2>
              <p className="mt-1 text-sm text-slate-500">Record the current position from this browser.</p>
              <label htmlFor="identifier" className="mt-5 block text-sm font-semibold text-slate-700">User / device identifier</label>
              <input id="identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} maxLength={100}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="e.g. intern_01" />
              <button onClick={checkIn} disabled={busy} className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? "Syncing location…" : "Check in / Sync location"}
              </button>
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-3">
                <span><span className="block text-sm font-semibold text-slate-800">Auto-sync</span><span className="block text-xs text-slate-500">Every 30 seconds while enabled</span></span>
                <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} className="h-5 w-5 accent-blue-600" />
              </label>
              <div role="status" className={`mt-4 rounded-xl p-3 text-sm ${messageType === "success" ? "bg-emerald-50 text-emerald-800" : messageType === "error" ? "bg-rose-50 text-rose-800" : "bg-blue-50 text-blue-800"}`}>
                {message}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Your browser will ask for location permission. Auto-sync records location every 30 seconds and can be stopped at any time.</p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div><h2 className="text-lg font-bold text-slate-900">Location history</h2><p className="text-sm text-slate-500">Oldest to newest</p></div>
                <button onClick={() => void refreshData()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Refresh</button>
              </div>
              {points.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No points recorded for this identifier yet. Click Check in to begin.</p> : (
                <ol className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {[...points].reverse().map((point, index) => (
                    <li key={point.id} className="flex gap-3">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{points.length - index}</span>
                      <div className="min-w-0 flex-1 border-b border-slate-100 pb-3">
                        <p className="text-sm font-semibold text-slate-800">{Number(point.latitude).toFixed(6)}, {Number(point.longitude).toFixed(6)}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(point.timestamp).toLocaleString()}</p>
                        <p className="mt-1 text-xs text-slate-400">Accuracy: {point.accuracy == null ? "not available" : `${Math.round(point.accuracy)} m`}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </aside>
        </div>

        <footer className="mt-7 flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <span>GeoTrack · Django REST Framework + Next.js</span><span>Development build · Use HTTPS and authentication before production tracking</span>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{note}</p>
  </div>;
}
