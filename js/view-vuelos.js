const ViewVuelos = (() => {
  const body = document.getElementById("vuelosBody");
  const badge = document.getElementById("badgeVuelos");

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function badgeForStatus(status) {
    const map = { SCHEDULED: "confirmed", DELAYED: "pending", CANCELLED: "cancelled", DEPARTED: "confirmed", LANDED: "confirmed" };
    return `<span class="badge badge--${map[status] || "pending"}">${status}</span>`;
  }

  function render(flights) {
    if (badge) badge.textContent = flights.length;

    if (flights.length === 0) {
      body.innerHTML = '<tr><td colspan="6" class="table__empty">No hay vuelos en el catálogo.</td></tr>';
      return;
    }
    body.innerHTML = flights.map((f) => `
      <tr>
        <td>${f.flight_number}</td>
        <td>${f.airline_name}</td>
        <td>${f.origin.iata_code} → ${f.destination.iata_code}</td>
        <td>${formatDateTime(f.departure_time)}</td>
        <td>€${f.base_price.toFixed(2)}</td>
        <td>${badgeForStatus(f.status)}</td>
      </tr>
    `).join("");
  }

  async function load() {
    try {
      const flights = await Api.getFlights({ limit: 200 });
      render(flights);
    } catch (err) {
      body.innerHTML = `<tr><td colspan="6" class="table__empty">Error cargando vuelos: ${err.message}</td></tr>`;
    }
  }

  function init() {
    // Reutiliza el catálogo ya cargado en Store para el primer pintado
    // (evita una petición duplicada al arrancar), y refresca después.
    render(Store.getFlights());
    document.addEventListener("view:changed", (e) => {
      if (e.detail.view === "vuelos") load();
    });
  }

  return { init, load };
})();
