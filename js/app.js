// Lógica principal de la interfaz: carga catálogos, gestiona el
// formulario de reserva manual y refresca la tabla de últimas reservas.

const App = (() => {
  const flightSelect = document.getElementById("flightSelect");
  const seatClassSelect = document.getElementById("seatClassSelect");
  const bookingForm = document.getElementById("bookingForm");
  const bookingFormMessage = document.getElementById("bookingFormMessage");
  const recentBookingsBody = document.getElementById("recentBookingsBody");
  const apiStatusDot = document.getElementById("apiStatusDot");
  const apiStatusText = document.getElementById("apiStatusText");

  let flightsCache = [];

  function formatRoute(flight) {
    return `${flight.origin.iata_code} → ${flight.destination.iata_code}`;
  }

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  }

  function badgeForStatus(status) {
    const map = { CONFIRMED: "confirmed", PENDING: "pending", CANCELLED: "cancelled" };
    const cls = map[status] || "pending";
    return `<span class="badge badge--${cls}">${status}</span>`;
  }

  async function loadFlights() {
    flightsCache = await Api.getFlights({ limit: 50 });
    flightSelect.innerHTML = '<option value="">Selecciona un vuelo…</option>' +
      flightsCache.map((f) => `
        <option value="${f.id}">
          ${f.flight_number} · ${formatRoute(f)} · ${formatDateTime(f.departure_time)} · €${f.base_price}
        </option>
      `).join("");
  }

  async function loadSeatClasses() {
    const seatClasses = await Api.getSeatClasses();
    seatClassSelect.innerHTML = '<option value="">Selecciona una clase…</option>' +
      seatClasses.map((c) => `<option value="${c.code}">${c.name} (x${c.price_multiplier})</option>`).join("");
  }

  async function loadRecentBookings() {
    try {
      const bookings = await Api.getBookings({ limit: 20 });
      if (bookings.length === 0) {
        recentBookingsBody.innerHTML = '<tr><td colspan="8" class="table__empty">Todavía no hay reservas.</td></tr>';
        return;
      }
      recentBookingsBody.innerHTML = bookings.map((b) => `
        <tr>
          <td>${b.booking_reference}</td>
          <td>${b.customer.full_name}</td>
          <td>${b.flight.flight_number}</td>
          <td>${formatRoute(b.flight)}</td>
          <td>${b.seat_class.name}</td>
          <td>€${b.price.toFixed(2)}</td>
          <td>${badgeForStatus(b.status)}</td>
          <td>${formatDateTime(b.created_at)}</td>
        </tr>
      `).join("");
    } catch (err) {
      recentBookingsBody.innerHTML = `<tr><td colspan="8" class="table__empty">Error cargando reservas: ${err.message}</td></tr>`;
    }
  }

  async function checkHealth() {
    try {
      const health = await Api.getHealth();
      const ok = health.status === "ok";
      apiStatusDot.className = `dot ${ok ? "dot--ok" : "dot--error"}`;
      apiStatusText.textContent = ok ? "API conectada" : "API con problemas";
    } catch (_) {
      apiStatusDot.className = "dot dot--error";
      apiStatusText.textContent = "API no disponible";
    }
  }

  function showFormMessage(text, type) {
    bookingFormMessage.textContent = text;
    bookingFormMessage.className = `form-message form-message--${type}`;
  }

  async function handleBookingSubmit(event) {
    event.preventDefault();

    const payload = {
      flight_id: Number(flightSelect.value),
      seat_class_code: seatClassSelect.value,
      customer: {
        full_name: document.getElementById("customerName").value,
        email: document.getElementById("customerEmail").value,
        document_id: document.getElementById("customerDocument").value,
        phone: document.getElementById("customerPhone").value || null,
      },
    };

    try {
      const booking = await Api.createBooking(payload);
      showFormMessage(`Reserva creada: ${booking.booking_reference}`, "success");
      bookingForm.reset();
      loadRecentBookings();
    } catch (err) {
      showFormMessage(`Error: ${err.message}`, "error");
    }
  }

  async function init() {
    bookingForm.addEventListener("submit", handleBookingSubmit);

    await checkHealth();
    await Promise.all([loadFlights(), loadSeatClasses(), loadRecentBookings()]);

    setInterval(checkHealth, 15000);
    setInterval(loadRecentBookings, 5000);
  }

  return { init, getFlightsCache: () => flightsCache };
})();

document.addEventListener("DOMContentLoaded", App.init);
