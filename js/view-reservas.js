const ViewReservas = (() => {
  const flightSelect = document.getElementById("flightSelect");
  const seatClassSelect = document.getElementById("seatClassSelect");
  const bookingForm = document.getElementById("bookingForm");
  const bookingFormMessage = document.getElementById("bookingFormMessage");
  const recentBookingsBody = document.getElementById("recentBookingsBody");
  const badgeReservas = document.getElementById("badgeReservas");

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
    return `<span class="badge badge--${map[status] || "pending"}">${status}</span>`;
  }

  function renderCatalogSelects() {
    const flights = Store.getFlights();
    flightSelect.innerHTML = '<option value="">Selecciona un vuelo…</option>' +
      flights.map((f) => `
        <option value="${f.id}">
          ${f.flight_number} · ${formatRoute(f)} · ${formatDateTime(f.departure_time)} · €${f.base_price}
        </option>
      `).join("");

    const seatClasses = Store.getSeatClasses();
    seatClassSelect.innerHTML = '<option value="">Selecciona una clase…</option>' +
      seatClasses.map((c) => `<option value="${c.code}">${c.name} (x${c.price_multiplier})</option>`).join("");
  }

  async function loadRecentBookings() {
    try {
      const bookings = await Api.getBookings({ limit: 20 });
      if (badgeReservas) badgeReservas.textContent = bookings.length >= 20 ? "20+" : bookings.length;

      if (bookings.length === 0) {
        recentBookingsBody.innerHTML = '<tr><td colspan="6" class="table__empty">Todavía no hay reservas.</td></tr>';
        return;
      }
      recentBookingsBody.innerHTML = bookings.map((b) => `
        <tr>
          <td>${b.booking_reference}</td>
          <td>${b.customer.full_name}</td>
          <td>${b.flight.flight_number}</td>
          <td>${b.seat_class.name}</td>
          <td>€${b.price.toFixed(2)}</td>
          <td>${badgeForStatus(b.status)}</td>
        </tr>
      `).join("");
    } catch (err) {
      recentBookingsBody.innerHTML = `<tr><td colspan="6" class="table__empty">Error cargando reservas: ${err.message}</td></tr>`;
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

  function init() {
    bookingForm.addEventListener("submit", handleBookingSubmit);
    renderCatalogSelects();
    loadRecentBookings();
    setInterval(loadRecentBookings, 5000);
  }

  return { init, renderCatalogSelects, loadRecentBookings };
})();
