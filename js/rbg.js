// Random Booking Generator (RBG)
// Genera reservas aleatorias de forma continua contra vuelos reales del
// catálogo, simulando actividad de negocio (equivalente al ROG del
// proyecto de referencia).

const RBG = (() => {
  const startBtn = document.getElementById("rbgStartBtn");
  const stopBtn = document.getElementById("rbgStopBtn");
  const rateInput = document.getElementById("rbgRate");
  const rateValueLabel = document.getElementById("rbgRateValue");
  const statusValue = document.getElementById("rbgStatusValue");
  const generatedCountValue = document.getElementById("rbgGeneratedCount");
  const errorCountValue = document.getElementById("rbgErrorCount");

  const FIRST_NAMES = ["Laura", "Carlos", "María", "Javier", "Lucía", "Pablo", "Elena", "Diego", "Marta", "Álvaro", "Sofía", "Hugo"];
  const LAST_NAMES = ["García", "Rodríguez", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Díaz", "Ruiz"];
  const SEAT_CLASS_WEIGHTS = [
    { code: "TOURIST", weight: 0.85 },
    { code: "BUSINESS", weight: 0.15 },
  ];

  let timerId = null;
  let generatedCount = 0;
  let errorCount = 0;

  function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function pickWeighted(items) {
    const r = Math.random();
    let cumulative = 0;
    for (const item of items) {
      cumulative += item.weight;
      if (r <= cumulative) return item.code;
    }
    return items[items.length - 1].code;
  }

  function randomDocumentId() {
    const digits = Math.floor(10000000 + Math.random() * 89999999);
    const letter = "TRWAGMYFPDXBNJZSQVHLCKE"[digits % 23];
    return `${digits}${letter}`;
  }

  function buildFakeCustomer() {
    const firstName = pickRandom(FIRST_NAMES);
    const lastName = pickRandom(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const emailTag = Math.floor(Math.random() * 100000);
    return {
      full_name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailTag}@rbg-demo.test`,
      document_id: randomDocumentId(),
      phone: null,
    };
  }

  async function generateOneBooking() {
    const flights = App.getFlightsCache();
    if (!flights || flights.length === 0) return;

    const flight = pickRandom(flights);
    const seatClassCode = pickWeighted(SEAT_CLASS_WEIGHTS);

    const payload = {
      flight_id: flight.id,
      seat_class_code: seatClassCode,
      customer: buildFakeCustomer(),
    };

    try {
      await Api.createBooking(payload);
      generatedCount += 1;
      generatedCountValue.textContent = generatedCount;
    } catch (err) {
      errorCount += 1;
      errorCountValue.textContent = errorCount;
      console.error("RBG: error creando reserva", err);
    }
  }

  function scheduleNextTick() {
    const perMinute = Number(rateInput.value);
    const intervalMs = Math.max(60000 / perMinute, 200);
    timerId = setTimeout(async () => {
      await generateOneBooking();
      if (timerId !== null) scheduleNextTick();
    }, intervalMs);
  }

  function start() {
    if (timerId !== null) return;
    statusValue.textContent = "Generando…";
    startBtn.disabled = true;
    stopBtn.disabled = false;
    scheduleNextTick();
  }

  function stop() {
    if (timerId !== null) clearTimeout(timerId);
    timerId = null;
    statusValue.textContent = "Detenido";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  function init() {
    rateInput.addEventListener("input", () => {
      rateValueLabel.textContent = rateInput.value;
    });
    startBtn.addEventListener("click", start);
    stopBtn.addEventListener("click", stop);
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", RBG.init);
