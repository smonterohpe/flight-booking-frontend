// Configuración del frontend.
// En despliegue real, NGINX hace de proxy inverso: las peticiones a
// "/api/*" en este mismo dominio se redirigen a la VM del backend
// (ver nginx/flight-booking-frontend.conf). Por eso, en producción,
// dejamos API_BASE_URL vacío ("" = mismo origen).
//
// Para desarrollo local contra un backend en otra máquina/puerto,
// cambia este valor por algo como "http://localhost:8000".
window.APP_CONFIG = {
  API_BASE_URL: "",
};
