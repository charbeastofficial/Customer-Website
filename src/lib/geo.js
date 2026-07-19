// Great-circle distance between two lat/lng points, in kilometers.
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// OpenStreetMap's free Nominatim reverse-geocoding endpoint -- no API key.
// Its address data is patchy outside major western cities, so this is a
// best-effort starting point for the address field -- the customer can (and
// should be able to) edit it, since the map pin itself is what's actually
// used for the delivery-radius check.
export async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  const a = data.address || {};

  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const parts = [
    street,
    a.neighbourhood || a.suburb || a.residential,
    a.city || a.town || a.village || a.county,
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(", ");
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
