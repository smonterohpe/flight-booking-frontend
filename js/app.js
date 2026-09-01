const App = (() => {
  const apiStatusDot = document.getElementById("apiStatusDot");
  const apiStatusText = document.getElementById("apiStatusText");

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

  async function init() {
    Auth.requireAuth();

    document.getElementById("logoutBtn").addEventListener("click", Auth.logout);

    await checkHealth();
    setInterval(checkHealth, 15000);

    // Carga el catálogo compartido (vuelos + clases) ANTES de inicializar
    // las vistas que dependen de él (formulario de Reservas y RBG).
    await Store.loadCatalog();

    ViewReservas.init();
    ViewClientes.init();
    ViewVuelos.init();

    document.getElementById("badgeVuelos").textContent = Store.getFlights().length;
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);
