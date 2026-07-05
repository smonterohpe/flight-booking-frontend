// Pequeño wrapper sobre fetch para hablar con la API del backend.
// Todas las rutas de negocio cuelgan de /api (ver backend: app/main.py).
const Api = (() => {
  const BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || "";

  async function request(path, options = {}) {
    const response = await fetch(`${BASE}/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = await response.json();
        detail = body.detail || detail;
      } catch (_) { /* respuesta sin cuerpo JSON */ }
      throw new Error(detail);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  return {
    getHealth: () => request("/health"),
    getFlights: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/flights${query ? `?${query}` : ""}`);
    },
    getSeatClasses: () => request("/seat-classes"),
    getBookings: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/bookings${query ? `?${query}` : ""}`);
    },
    createBooking: (payload) =>
      request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  };
})();
