// Caché compartida: vuelos y clases de asiento se cargan una vez y los
// usan tanto la vista de Reservas (formulario manual) como el RBG.
const Store = (() => {
  let flights = [];
  let seatClasses = [];

  async function loadCatalog() {
    [flights, seatClasses] = await Promise.all([
      Api.getFlights({ limit: 50 }),
      Api.getSeatClasses(),
    ]);
    return { flights, seatClasses };
  }

  return {
    loadCatalog,
    getFlights: () => flights,
    getSeatClasses: () => seatClasses,
  };
})();
