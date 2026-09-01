# flight-booking-frontend

Simulador de reservas de vuelos (UI de negocio) con **Generador
Aleatorio de Reservas (RBG)** integrado. App de una sola página con
menú lateral, servida como HTML/CSS/JS plano vía NGINX (sin frameworks
ni build step).

Forma parte de la demo de continuidad de negocio junto con:
- `flight-booking-database` — esquema PostgreSQL
- `flight-booking-backend` — API REST (FastAPI)
- `observability-console` — dashboard de KPIs y monitorización

## Qué incluye

- **Menú lateral colapsable** con 5 vistas: Reservas, Clientes, Vuelos, Usuarios, About
  (estilo inspirado en el "Order Simulator" de referencia)
- **Reservas**: formulario de reserva manual + tabla de últimas reservas en vivo
- **Clientes**: listado de todos los clientes dados de alta (vía `GET /api/customers`)
- **Vuelos**: catálogo completo de vuelos con estado
- **Usuarios**: vista simple con el único usuario admin de la demo (no hay gestión de usuarios real)
- **About**: descripción de la app, stack tecnológico y arquitectura
- **RBG (Random Booking Generator)**: ahora integrado como panel compacto en la propia
  barra lateral — genera reservas aleatorias de forma continua a un ritmo configurable
  (reservas/minuto), simulando actividad de negocio constante
- **Login** con paleta inspirada en Iberia (rojo/blanco) y huecos para los logos de
  HPE y Zerto junto al logo de la app — ver `assets/logos/README.md` para añadir los
  ficheros reales (son marca registrada, no se incluyen en este repo)
- **Indicador de estado de la API** en la barra lateral

## Arquitectura de red

```
Navegador --HTTP--> NGINX (:80) --/api/*--> Backend FastAPI (:8000)
                       |
                  archivos estáticos
                  (HTML/CSS/JS)
```

NGINX sirve los ficheros estáticos y actúa de proxy inverso hacia el
backend para las llamadas `/api/*`. Esto evita problemas de CORS y
oculta la IP real del backend al navegador.

## Despliegue en la VM de frontend

```bash
# 1. Instalar NGINX
sudo apt update && sudo apt install -y nginx

# 2. Copiar los ficheros estáticos
sudo mkdir -p /var/www/flight-booking-frontend
sudo cp -r index.html login.html css js assets /var/www/flight-booking-frontend/
sudo chown -R www-data:www-data /var/www/flight-booking-frontend

# 3. Configurar el virtual host
sudo cp nginx/flight-booking-frontend.conf /etc/nginx/sites-available/flight-booking-frontend
sudo ln -s /etc/nginx/sites-available/flight-booking-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 4. IMPORTANTE: editar el fichero y sustituir BACKEND_HOST
#    por la IP real de la VM del backend
sudo nano /etc/nginx/sites-available/flight-booking-frontend

# 5. Verificar y recargar NGINX
sudo nginx -t
sudo systemctl reload nginx
```

La aplicación quedará accesible en `http://IP_DE_ESTA_VM/`.

## Notas para la demo de continuidad de negocio

- El RBG es el generador de actividad continua sobre el que se
  apoyará toda la demo: al arrancarlo antes de provocar una
  interrupción, la Observability Console podrá mostrar la caída y
  posterior recuperación del flujo de reservas en tiempo real (igual
  que el tramo rojo del dashboard de referencia).
- Si detienes o pierdes conectividad con el backend, el indicador de
  estado en la cabecera y los contadores de "Errores" del RBG lo
  reflejarán inmediatamente — útil para narrar la demo.

## Acceso

Se ha añadido una pantalla de login simple (`login.html`) con usuario
y contraseña fijos para la demo:

- **Usuario:** `admin`
- **Contraseña:** `admin`

La sesión se guarda en `sessionStorage` del navegador — es solo para
la demo, no un sistema de autenticación real. `index.html` redirige
automáticamente a `login.html` si no hay sesión activa.

## Servicio de monitorización (sys-probe)

Igual que en la VM de base de datos, esta VM de frontend incluye un
`sys-probe` (carpeta `sys-probe/`) que expone CPU/RAM/Disco/Uptime en
el puerto `5001`, consultado por la Observability Console.

```bash
sudo useradd -r -s /bin/false probe || true
sudo mkdir -p /opt/sys-probe
sudo cp -r sys-probe/* /opt/sys-probe/
cd /opt/sys-probe
sudo python3 -m venv venv
sudo ./venv/bin/pip install -r requirements.txt
sudo cp sys-probe.service /etc/systemd/system/
sudo chown -R probe:probe /opt/sys-probe
sudo systemctl daemon-reload
sudo systemctl enable --now sys-probe
```

Abre el puerto 5001 en el firewall **solo** hacia la VM de la
Observability Console.

## Próximos pasos

1. `observability-console`: dashboard que consumirá `/api/kpis/*` y `/api/health` de este mismo backend, además de la API de Zerto
