"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { distanceKm, reverseGeocode } from "@/lib/geo";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center text-sm text-ink-soft">Loading map…</div>,
});

const DEFAULT_CENTER = [31.5204, 74.3587]; // Lahore -- only used when the shop hasn't set a location yet

export default function LocationPicker({ shopLat, shopLng, radiusKm, onChange }) {
  const hasShopLocation = shopLat != null && shopLng != null;
  const shopCenter = hasShopLocation ? [shopLat, shopLng] : null;

  const [marker, setMarker] = useState(shopCenter);
  const [address, setAddress] = useState("");
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const distance = marker && shopCenter ? distanceKm(marker[0], marker[1], shopCenter[0], shopCenter[1]) : null;
  const withinRadius = !hasShopLocation || distance === null || distance <= radiusKm;

  const handlePick = async (lat, lng) => {
    setMarker([lat, lng]);
    setResolving(true);
    const dist = shopCenter ? distanceKm(lat, lng, shopCenter[0], shopCenter[1]) : null;
    const withinRad = !hasShopLocation || dist === null || dist <= radiusKm;
    try {
      const resolvedAddress = await reverseGeocode(lat, lng);
      setAddress(resolvedAddress);
      onChange({ lat, lng, address: resolvedAddress, withinRadius: withinRad });
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(fallback);
      onChange({ lat, lng, address: fallback, withinRadius: withinRad });
    } finally {
      setResolving(false);
    }
  };

  const handleAddressEdit = (value) => {
    setAddress(value);
    if (!marker) return;
    onChange({ lat: marker[0], lng: marker[1], address: value, withinRadius });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Location isn't available in this browser.");
      return;
    }
    setError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        handlePick(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Tap the map to drop a pin instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="h-56 w-full overflow-hidden rounded-xl border border-stone">
        <LeafletMap
          center={marker || shopCenter || DEFAULT_CENTER}
          marker={marker}
          onPick={handlePick}
          shopCenter={shopCenter}
          radiusKm={radiusKm}
        />
      </div>
      <p className="text-[11px] text-ink-soft">Tap the map to drop a pin exactly where you'd like your order delivered.</p>

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locating}
        className="self-start text-xs font-bold text-brand transition hover:text-brand-dark disabled:opacity-60"
      >
        {locating ? "Finding you…" : "📍 Use My Current Location"}
      </button>
      {error && <p className="text-xs font-medium text-brand">{error}</p>}

      {marker && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">
            Delivery Address
          </label>
          {resolving ? (
            <p className="text-xs text-ink-soft">Looking up address…</p>
          ) : (
            <>
              <textarea
                value={address}
                onChange={(e) => handleAddressEdit(e.target.value)}
                rows={2}
                placeholder="House / street / area..."
                className="w-full resize-none rounded-xl border border-stone bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
              />
              <p className="text-[11px] text-ink-soft">
                We fill this in from the map pin — edit it if it's not quite right.
              </p>
            </>
          )}
        </div>
      )}

      {!withinRadius && (
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-xs font-semibold text-brand">
          That's {distance.toFixed(1)} km away — outside our {radiusKm} km delivery zone. Try Takeaway instead, or
          pick a closer spot.
        </p>
      )}
    </div>
  );
}
