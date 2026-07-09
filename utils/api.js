// Generic API helper function for making HTTP requests
// Automatically adds JSON headers + JWT token (if available)

export async function apiCall(url, options = {}) {

  // Get token from browser storage (only runs in client-side)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Build request headers
  const headers = {
    "Content-Type": "application/json", // we are sending JSON data
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach JWT token if exists
    ...options.headers, // allow custom headers to override/add
  };

  try {
    // Make API request using fetch
    const res = await fetch(url, { ...options, headers });

    // Convert response into JSON
    const data = await res.json();

    // Return structured response
    return {
      data,        // actual response body
      ok: res.ok,  // true if status is 200–299
      status: res.status, // HTTP status code (200, 400, 500 etc.)
    };

  } catch (err) {
    // Handles network errors (no internet, server down, etc.)
    return {
      data: { message: "Network error. Please try again." },
      ok: false,
      status: 0,
    };
  }
}