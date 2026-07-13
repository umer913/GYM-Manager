import dbConnect from './mongodb';
import GymConfig from '../models/GymConfig';

// ── Geocoding helpers (OpenStreetMap Nominatim) ────────────────────────────────

export async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'FitcoreGymManagementSystem/1.0' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon),
        displayName: data[0].display_name,
      };
    }
  } catch (e) {
    console.error('Geocoding error:', e);
  }
  return null;
}

export async function reverseGeocodeCoords(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'FitcoreGymManagementSystem/1.0' } }
    );
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name;
    }
  } catch (e) {
    console.error('Reverse geocoding error:', e);
  }
  return `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`;
}

// ── Gym location helpers (persisted in MongoDB) ────────────────────────────────

/**
 * Fetch the current gym location from the database.
 * Auto-creates the default document if it doesn't exist yet.
 */
export async function getGymLocation() {
  await dbConnect();
  const config = await GymConfig.findOneAndUpdate(
    { key: 'main' },
    { $setOnInsert: { key: 'main' } },
    { upsert: true, new: true }
  );
  return {
    address: config.address,
    latitude: config.latitude,
    longitude: config.longitude,
  };
}

/**
 * Update gym location by address string (geocoded to lat/lng).
 */
export async function setGymAddress(address) {
  await dbConnect();
  const resolved = await geocodeAddress(address);

  const update = resolved
    ? { address: resolved.displayName, latitude: resolved.latitude, longitude: resolved.longitude, updatedAt: new Date() }
    : { address, updatedAt: new Date() };

  const config = await GymConfig.findOneAndUpdate(
    { key: 'main' },
    { $set: update },
    { upsert: true, new: true }
  );
  return { address: config.address, latitude: config.latitude, longitude: config.longitude };
}

/**
 * Update gym location by GPS coordinates (reverse-geocoded to address).
 */
export async function setGymCoordinates(lat, lng) {
  await dbConnect();
  const address = await reverseGeocodeCoords(lat, lng);

  const config = await GymConfig.findOneAndUpdate(
    { key: 'main' },
    { $set: { latitude: Number(lat), longitude: Number(lng), address, updatedAt: new Date() } },
    { upsert: true, new: true }
  );
  return { address: config.address, latitude: config.latitude, longitude: config.longitude };
}
