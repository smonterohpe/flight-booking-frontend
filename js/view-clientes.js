const ViewClientes = (() => {
  const body = document.getElementById("clientesBody");
  const badge = document.getElementById("badgeClientes");

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  async function load() {
    try {
      const customers = await Api.getCustomers({ limit: 200 });
      if (badge) badge.textContent = customers.length >= 200 ? "200+" : customers.length;

      if (customers.length === 0) {
        body.innerHTML = '<tr><td colspan="5" class="table__empty">Todavía no hay clientes.</td></tr>';
        return;
      }
      body.innerHTML = customers.map((c) => `
        <tr>
          <td>${c.full_name}</td>
          <td>${c.email}</td>
          <td>${c.document_id}</td>
          <td>${c.phone || "—"}</td>
          <td>${formatDate(c.created_at)}</td>
        </tr>
      `).join("");
    } catch (err) {
      body.innerHTML = `<tr><td colspan="5" class="table__empty">Error cargando clientes: ${err.message}</td></tr>`;
    }
  }

  function init() {
    load();
    document.addEventListener("view:changed", (e) => {
      if (e.detail.view === "clientes") load();
    });
    setInterval(() => {
      if (document.getElementById("view-clientes").classList.contains("view-panel--active")) load();
    }, 8000);
  }

  return { init, load };
})();
