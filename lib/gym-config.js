// OpenStreetMap Nominatim API calls for geocoding

export async function geocodeAddress(address) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
      headers: {
        'User-Agent': 'FitcoreGymManagementSystem/1.0'
      }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon),
        displayName: data[0].display_name
      };
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return null;
}

export async function reverseGeocodeCoords(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: {
        'User-Agent': 'FitcoreGymManagementSystem/1.0'
      }
    });
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name;
    }
  } catch (e) {
    console.error("Reverse geocoding error:", e);
  }
  return `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`;
}

if (!global.gymConfig) {
  global.gymConfig = {
    address: "CCA Block, Phase 5 DHA, Lahore, Pakistan",
    latitude: 31.4697,
    longitude: 74.2728
  };
}

export function getGymLocation() {
  return global.gymConfig;
}

export async function setGymAddress(address) {
  const resolved = await geocodeAddress(address);
  if (resolved) {
    global.gymConfig = {
      address: resolved.displayName,
      latitude: resolved.latitude,
      longitude: resolved.longitude
    };
  } else {
    // If geocoding lookup fails (offline, limit, etc.), preserve text representation
    global.gymConfig.address = address;
  }
  return global.gymConfig;
}

export async function setGymCoordinates(lat, lng) {
  global.gymConfig.latitude = Number(lat);
  global.gymConfig.longitude = Number(lng);
  const addr = await reverseGeocodeCoords(lat, lng);
  global.gymConfig.address = addr;
  return global.gymConfig;
}
