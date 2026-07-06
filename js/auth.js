// Autenticación muy simple para la demo: usuario/contraseña fijos
// (admin/admin), guardados solo en sessionStorage del navegador.
// NOTA: esto es una demo de continuidad de negocio, no un sistema de
// autenticación real — no usar este esquema en producción.

const Auth = (() => {
  const SESSION_KEY = "fb_authenticated";
  const VALID_USER = "admin";
  const VALID_PASSWORD = "admin";

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  }

  function login(username, password) {
    const ok = username === VALID_USER && password === VALID_PASSWORD;
    if (ok) sessionStorage.setItem(SESSION_KEY, "true");
    return ok;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
  }

  // En cualquier página protegida (index.html), si no hay sesión,
  // redirige inmediatamente al login.
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = "login.html";
    }
  }

  function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return; // no estamos en login.html

    // Si ya hay sesión activa, saltar directo a la app
    if (isAuthenticated()) {
      window.location.href = "index.html";
      return;
    }

    const message = document.getElementById("loginMessage");
    const toggleBtn = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    toggleBtn.addEventListener("click", () => {
      passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = passwordInput.value;

      if (login(username, password)) {
        window.location.href = "index.html";
      } else {
        message.textContent = "Usuario o contraseña incorrectos";
        message.className = "form-message form-message--error";
      }
    });
  }

  return { isAuthenticated, login, logout, requireAuth, initLoginForm };
})();

document.addEventListener("DOMContentLoaded", Auth.initLoginForm);
