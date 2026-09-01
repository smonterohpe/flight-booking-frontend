const App = (() => {
  const apiStatusDot = document.getElementById("apiStatusDot");
  const apiStatusText = document.getElementById("apiStatusText");
  let lastHealthOk = null;

  function renderHealthText() {
    if (lastHealthOk === null) return;
    apiStatusText.textContent = I18n.t(lastHealthOk ? "common.apiConnected" : "common.apiIssue");
  }

  async function checkHealth() {
    try {
      const health = await Api.getHealth();
      lastHealthOk = health.status === "ok";
      apiStatusDot.className = `dot ${lastHealthOk ? "dot--ok" : "dot--error"}`;
      renderHealthText();
    } catch (_) {
      lastHealthOk = false;
      apiStatusDot.className = "dot dot--error";
      apiStatusText.textContent = I18n.t("common.apiUnavailable");
    }
  }

  async function init() {
    Auth.requireAuth();

    document.getElementById("logoutBtn").addEventListener("click", Auth.logout);
    document.addEventListener("i18n:changed", renderHealthText);

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
