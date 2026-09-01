const Sidebar = (() => {
  const STORAGE_KEY = "fb_sidebar_collapsed";
  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("collapseBtn");
  const pageTitle = document.getElementById("pageTitle");

  const VIEW_TITLES = {
    reservas: "Reservas",
    clientes: "Clientes",
    vuelos: "Vuelos",
    usuarios: "Usuarios",
    about: "About",
  };

  function activateView(viewName) {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("nav-item--active", btn.dataset.view === viewName);
    });
    document.querySelectorAll(".view-panel").forEach((panel) => {
      panel.classList.toggle("view-panel--active", panel.id === `view-${viewName}`);
    });
    pageTitle.textContent = VIEW_TITLES[viewName] || viewName;
    document.dispatchEvent(new CustomEvent("view:changed", { detail: { view: viewName } }));
  }

  function toggleCollapse() {
    const collapsed = sidebar.classList.toggle("is-collapsed");
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }

  function init() {
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      sidebar.classList.add("is-collapsed");
    }
    collapseBtn.addEventListener("click", toggleCollapse);

    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => activateView(btn.dataset.view));
    });
  }

  return { init, activateView };
})();

document.addEventListener("DOMContentLoaded", Sidebar.init);
