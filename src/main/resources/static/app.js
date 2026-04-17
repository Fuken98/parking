function resolveApiBase() {
  // Esta función intenta decidir sola la URL base del backend.
  const isHttp = window.location.protocol === "http:" || window.location.protocol === "https:";
  const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isBackendPort = window.location.port === "8080";

  // Si ya estamos en localhost:8080 usamos ruta relativa.
  if (isHttp && isLocalHost && isBackendPort) {
    return "";
  }
  // En otros casos apuntamos al backend local por defecto.
  return "http://localhost:8080";
}

// URLs de API que usa el frontend.
const apiBase = resolveApiBase();
const api = {
  authLogin: `${apiBase}/api/auth/login`,
  authLogout: `${apiBase}/api/auth/logout`,
  vehiculos: `${apiBase}/api/vehiculos`,
  espacios: `${apiBase}/api/espacios`,
  ingresos: `${apiBase}/api/ingresos`
};

// Clave donde guardamos la sesión en localStorage.
const sessionKey = "parking.auth";
// Estado en memoria para tablas y paginación.
const state = {
  vehiculos: [],
  espacios: [],
  ingresos: [],
  view: {
    vehiculos: { page: 1, pageSize: 8 },
    espacios: { page: 1, pageSize: 8 },
    ingresos: { page: 1, pageSize: 8 }
  }
};

const toastEl = document.getElementById("toast");
const loginScreenEl = document.getElementById("login-screen");
const appShellEl = document.getElementById("app-shell");
const sessionUserEl = document.getElementById("session-user");
const loginFormEl = document.getElementById("login-form");
const loginAlertEl = document.getElementById("login-alert");
const loginSubmitEl = document.getElementById("login-submit");
const logoutButtonEl = document.getElementById("logout-button");
const vehiculosBodyEl = document.getElementById("vehiculos-body");
const espaciosBodyEl = document.getElementById("espacios-body");
const ingresosBodyEl = document.getElementById("ingresos-body");
const vehiculosSearchEl = document.getElementById("vehiculos-search");
const vehiculosSortEl = document.getElementById("vehiculos-sort");
const espaciosEstadoFilterEl = document.getElementById("espacios-estado-filter");
const espaciosSortEl = document.getElementById("espacios-sort");
const ingresosSearchEl = document.getElementById("ingresos-search");
const ingresosSortEl = document.getElementById("ingresos-sort");
const placasListEl = document.getElementById("vehiculo-placas-list");
const placaMovimientoEl = document.getElementById("placa-movimiento");
const metricLibresEl = document.getElementById("metric-libres");
const metricOcupadosEl = document.getElementById("metric-ocupados");
const metricActivosEl = document.getElementById("metric-activos");
const metricUltimoEl = document.getElementById("metric-ultimo");
const vehiculosPrevEl = document.getElementById("vehiculos-prev");
const vehiculosNextEl = document.getElementById("vehiculos-next");
const vehiculosPageEl = document.getElementById("vehiculos-page");
const espaciosPrevEl = document.getElementById("espacios-prev");
const espaciosNextEl = document.getElementById("espacios-next");
const espaciosPageEl = document.getElementById("espacios-page");
const ingresosPrevEl = document.getElementById("ingresos-prev");
const ingresosNextEl = document.getElementById("ingresos-next");
const ingresosPageEl = document.getElementById("ingresos-page");

function showToast(message, isError = false) {
  // Muestra mensajes cortos abajo a la derecha.
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove("hidden", "error");
  if (isError) toastEl.classList.add("error");
  setTimeout(() => toastEl.classList.add("hidden"), 2600);
}

function getSession() {
  // Intenta leer sesión guardada.
  try {
    return JSON.parse(localStorage.getItem(sessionKey) || "null");
  } catch (_) {
    return null;
  }
}

function saveSession(session) {
  // Guarda la sesión para no loguear en cada recarga.
  localStorage.setItem(sessionKey, JSON.stringify(session));
}

function clearSession() {
  // Elimina sesión actual del navegador.
  localStorage.removeItem(sessionKey);
}

function setLoginLoading(isLoading) {
  // Cambia estado del botón mientras valida credenciales.
  if (!loginSubmitEl) return;
  loginSubmitEl.disabled = isLoading;
  loginSubmitEl.textContent = isLoading ? "Validando..." : "Entrar al panel";
}

function showLoginAlert(message) {
  if (!loginAlertEl) return;
  loginAlertEl.textContent = message;
  loginAlertEl.classList.remove("hidden");
}

function hideLoginAlert() {
  if (!loginAlertEl) return;
  loginAlertEl.textContent = "";
  loginAlertEl.classList.add("hidden");
}

function renderAuth() {
  // Muestra login o panel según exista token.
  const session = getSession();
  const isLoggedIn = Boolean(session?.token);
  if (loginScreenEl) loginScreenEl.classList.toggle("hidden", isLoggedIn);
  if (appShellEl) appShellEl.classList.toggle("hidden", !isLoggedIn);
  if (sessionUserEl) {
    sessionUserEl.textContent = isLoggedIn ? `Sesion: ${session.username}` : "";
  }
  if (isLoggedIn) hideLoginAlert();
}

function readErrorMessage(body, status) {
  if (body && typeof body.error === "string" && body.error.trim() !== "") {
    return body.error;
  }
  return `Error HTTP ${status}`;
}

async function http(url, options = {}) {
  // Helper general para todas las llamadas HTTP.
  const session = getSession();
  const headers = { ...(options.headers || {}) };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (session?.token && !headers.Authorization) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch (_) {
      body = null;
    }

    let msg = readErrorMessage(body, res.status);
    const isLoginRequest = url === api.authLogin;
    // Si venció sesión, limpiamos estado y pedimos login otra vez.
    if (res.status === 401 && !isLoginRequest) {
      clearSession();
      renderAuth();
      msg = "Tu sesion expiro. Inicia sesion nuevamente.";
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

function formatDate(v) {
  // Formatea fecha para mostrar en tablas.
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString("es-CO");
}

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeText(v) {
  // Normaliza texto para búsquedas (minúscula + trim).
  return String(v || "").trim().toLowerCase();
}

function normalizePlate(v) {
  // Placas siempre en mayúsculas.
  return String(v || "").trim().toUpperCase();
}

function compareText(a, b) {
  // Comparador para ordenar textos.
  return String(a || "").localeCompare(String(b || ""), "es", { sensitivity: "base" });
}

function compareNumber(a, b) {
  // Comparador para números.
  return Number(a || 0) - Number(b || 0);
}

function compareDate(a, b) {
  return (parseDate(a)?.getTime() || 0) - (parseDate(b)?.getTime() || 0);
}

function emptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" class="empty">${message}</td></tr>`;
}

function vehicleRow(v) {
  // Convierte un vehículo a fila HTML.
  return `<tr>
    <td class="mono">${v.placa ?? "-"}</td>
    <td>${v.color ?? "-"}</td>
    <td>${v.tipo ?? "-"}</td>
  </tr>`;
}

function spaceRow(s) {
  // Convierte un espacio a fila HTML.
  const cls = (s.estado || "").toLowerCase();
  return `<tr>
    <td class="mono">${s.numero ?? "-"}</td>
    <td>${s.tipo ?? "-"}</td>
    <td><span class="pill ${cls}">${s.estado ?? "-"}</span></td>
  </tr>`;
}

function ingresoRow(i) {
  // Convierte un ingreso/salida a fila HTML.
  const valor = i.valorPagado != null ? `$${Number(i.valorPagado).toLocaleString("es-CO")}` : "-";
  return `<tr>
    <td class="mono">${i.vehiculo?.placa ?? "-"}</td>
    <td>${i.espacio?.numero ?? "-"}</td>
    <td>${formatDate(i.fechaEntrada)}</td>
    <td>${formatDate(i.fechaSalida)}</td>
    <td class="mono">${valor}</td>
  </tr>`;
}

function getFilteredVehiculos() {
  // Aplica búsqueda y luego orden en vehículos.
  const q = normalizeText(vehiculosSearchEl?.value);
  const filtered = !q ? [...state.vehiculos] : state.vehiculos.filter((v) => {
    const plate = normalizeText(v.placa);
    const color = normalizeText(v.color);
    const tipo = normalizeText(v.tipo);
    return plate.includes(q) || color.includes(q) || tipo.includes(q);
  });

  const [field, direction] = (vehiculosSortEl?.value || "placa:asc").split(":");
  filtered.sort((a, b) => {
    const sign = direction === "desc" ? -1 : 1;
    if (field === "tipo") return sign * compareText(a.tipo, b.tipo);
    return sign * compareText(a.placa, b.placa);
  });

  return filtered;
}

function getFilteredEspacios() {
  // Aplica filtro de estado y orden en espacios.
  const estado = normalizeText(espaciosEstadoFilterEl?.value);
  const filtered = state.espacios.filter((s) => {
    const matchesStatus = !estado || normalizeText(s.estado) === estado;
    return matchesStatus;
  });

  const [field, direction] = (espaciosSortEl?.value || "numero:asc").split(":");
  filtered.sort((a, b) => {
    const sign = direction === "desc" ? -1 : 1;
    if (field === "tipo") return sign * compareText(a.tipo, b.tipo);
    if (field === "estado") return sign * compareText(a.estado, b.estado);
    return sign * compareNumber(a.numero, b.numero);
  });

  return filtered;
}

function getFilteredIngresos() {
  // Aplica búsqueda y orden en movimientos.
  const q = normalizeText(ingresosSearchEl?.value);
  const filtered = !q ? [...state.ingresos] : state.ingresos.filter((i) => {
    const plate = normalizeText(i.vehiculo?.placa);
    const espacio = normalizeText(i.espacio?.numero);
    return plate.includes(q) || espacio.includes(q);
  });

  const [field, direction] = (ingresosSortEl?.value || "fechaEntrada:desc").split(":");
  filtered.sort((a, b) => {
    const sign = direction === "desc" ? -1 : 1;
    if (field === "valorPagado") return sign * compareNumber(a.valorPagado, b.valorPagado);
    if (field === "espacio") return sign * compareNumber(a.espacio?.numero, b.espacio?.numero);
    return sign * compareDate(a.fechaEntrada, b.fechaEntrada);
  });

  return filtered;
}

function paginateRows(rows, tableKey) {
  // Corta los datos según página actual.
  const view = state.view[tableKey];
  const totalPages = Math.max(1, Math.ceil(rows.length / view.pageSize));
  if (view.page > totalPages) view.page = totalPages;
  const start = (view.page - 1) * view.pageSize;
  const end = start + view.pageSize;
  return {
    pagedRows: rows.slice(start, end),
    totalPages,
    page: view.page
  };
}

function updatePagerUI(tableKey, page, totalPages) {
  // Actualiza botones/etiqueta de paginación.
  if (tableKey === "vehiculos") {
    if (vehiculosPageEl) vehiculosPageEl.textContent = `Página ${page} de ${totalPages}`;
    if (vehiculosPrevEl) vehiculosPrevEl.disabled = page <= 1;
    if (vehiculosNextEl) vehiculosNextEl.disabled = page >= totalPages;
    return;
  }
  if (tableKey === "espacios") {
    if (espaciosPageEl) espaciosPageEl.textContent = `Página ${page} de ${totalPages}`;
    if (espaciosPrevEl) espaciosPrevEl.disabled = page <= 1;
    if (espaciosNextEl) espaciosNextEl.disabled = page >= totalPages;
    return;
  }
  if (ingresosPageEl) ingresosPageEl.textContent = `Página ${page} de ${totalPages}`;
  if (ingresosPrevEl) ingresosPrevEl.disabled = page <= 1;
  if (ingresosNextEl) ingresosNextEl.disabled = page >= totalPages;
}

function resetPage(tableKey) {
  state.view[tableKey].page = 1;
}

function movePage(tableKey, delta) {
  state.view[tableKey].page = Math.max(1, state.view[tableKey].page + delta);
  if (tableKey === "vehiculos") renderVehiculosTable();
  if (tableKey === "espacios") renderEspaciosTable();
  if (tableKey === "ingresos") renderIngresosTable();
}

function renderVehiculosTable() {
  // Render tabla de vehículos ya filtrada y paginada.
  if (!vehiculosBodyEl) return;
  const data = getFilteredVehiculos();
  const { pagedRows, page, totalPages } = paginateRows(data, "vehiculos");
  vehiculosBodyEl.innerHTML = pagedRows.length
    ? pagedRows.map(vehicleRow).join("")
    : emptyRow(3, "No hay vehículos que coincidan con el filtro.");
  updatePagerUI("vehiculos", page, totalPages);
}

function renderEspaciosTable() {
  // Render tabla de espacios.
  if (!espaciosBodyEl) return;
  const data = getFilteredEspacios();
  const { pagedRows, page, totalPages } = paginateRows(data, "espacios");
  espaciosBodyEl.innerHTML = pagedRows.length
    ? pagedRows.map(spaceRow).join("")
    : emptyRow(3, "No hay espacios que coincidan con el filtro.");
  updatePagerUI("espacios", page, totalPages);
}

function renderIngresosTable() {
  // Render tabla de ingresos/salidas.
  if (!ingresosBodyEl) return;
  const data = getFilteredIngresos();
  const { pagedRows, page, totalPages } = paginateRows(data, "ingresos");
  ingresosBodyEl.innerHTML = pagedRows.length
    ? pagedRows.map(ingresoRow).join("")
    : emptyRow(5, "No hay movimientos que coincidan con el filtro.");
  updatePagerUI("ingresos", page, totalPages);
}

function refreshPlacasDataList() {
  // Llena sugerencias de placas para el formulario de movimiento.
  if (!placasListEl) return;
  const uniquePlates = [...new Set(state.vehiculos.map((v) => normalizePlate(v.placa)).filter(Boolean))];
  placasListEl.innerHTML = uniquePlates.map((plate) => `<option value="${plate}"></option>`).join("");
}

function getLastMovementLabel() {
  // Busca el último movimiento entre entradas y salidas.
  let latest = null;

  state.ingresos.forEach((i) => {
    const entrada = parseDate(i.fechaEntrada);
    if (entrada && (!latest || entrada > latest.when)) {
      latest = { when: entrada, type: "Entrada", plate: i.vehiculo?.placa ?? "-" };
    }

    const salida = parseDate(i.fechaSalida);
    if (salida && (!latest || salida > latest.when)) {
      latest = { when: salida, type: "Salida", plate: i.vehiculo?.placa ?? "-" };
    }
  });

  if (!latest) return "Sin datos";
  return `${latest.type} ${latest.plate} - ${latest.when.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
}

function renderDashboard() {
  // Calcula métricas rápidas del panel.
  if (!metricLibresEl || !metricOcupadosEl || !metricActivosEl || !metricUltimoEl) return;
  const libres = state.espacios.filter((s) => s.estado === "LIBRE").length;
  const ocupados = state.espacios.filter((s) => s.estado === "OCUPADO").length;
  const activos = state.ingresos.filter((i) => !i.fechaSalida).length;

  metricLibresEl.textContent = String(libres);
  metricOcupadosEl.textContent = String(ocupados);
  metricActivosEl.textContent = String(activos);
  metricUltimoEl.textContent = getLastMovementLabel();
}

async function loadVehiculos() {
  // Carga vehículos desde backend.
  state.vehiculos = await http(api.vehiculos);
  refreshPlacasDataList();
  renderVehiculosTable();
}

async function loadEspacios() {
  // Carga espacios desde backend.
  state.espacios = await http(api.espacios);
  renderEspaciosTable();
  renderDashboard();
}

async function loadIngresos() {
  // Carga movimientos desde backend.
  state.ingresos = await http(api.ingresos);
  renderIngresosTable();
  renderDashboard();
}

function formToJson(form) {
  // Convierte form a JSON con algunas normalizaciones.
  const values = Object.fromEntries(new FormData(form).entries());
  if (values.numero) values.numero = Number(values.numero);
  if (values.placa) values.placa = normalizePlate(values.placa);
  if (values.username) values.username = values.username.trim();
  return values;
}

function wireAuth() {
  // Conecta eventos del login/logout.
  if (!loginFormEl) return;

  loginFormEl.addEventListener("input", hideLoginAlert);

  loginFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideLoginAlert();
    setLoginLoading(true);

    try {
      // Se intenta login y luego se cargan datos iniciales.
      const session = await http(api.authLogin, {
        method: "POST",
        body: JSON.stringify(formToJson(loginFormEl))
      });
      saveSession(session);
      renderAuth();
      loginFormEl.reset();
      await Promise.all([loadVehiculos(), loadEspacios(), loadIngresos()]);
      showToast(`Bienvenido, ${session.username}`);
    } catch (err) {
      showLoginAlert(err.message);
      showToast(err.message, true);
    } finally {
      setLoginLoading(false);
    }
  });

  if (!logoutButtonEl) return;
  logoutButtonEl.addEventListener("click", async () => {
    try {
      await http(api.authLogout, { method: "POST" });
    } catch (_) {
    } finally {
      // Aunque falle logout, limpiamos sesión local.
      clearSession();
      renderAuth();
      showToast("Sesion cerrada");
    }
  });
}

function wireForms() {
  // Conecta formularios de vehículo, espacio y movimiento.
  const vehiculoForm = document.getElementById("vehiculo-form");
  const espacioForm = document.getElementById("espacio-form");
  const movimientoForm = document.getElementById("movimiento-form");

  if (vehiculoForm) {
    vehiculoForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        // Crear vehículo y refrescar solo su tabla.
        await http(api.vehiculos, {
          method: "POST",
          body: JSON.stringify(formToJson(vehiculoForm))
        });
        vehiculoForm.reset();
        await loadVehiculos();
        showToast("Vehiculo registrado");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  if (espacioForm) {
    espacioForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        // Crear espacio y refrescar tabla de espacios.
        await http(api.espacios, {
          method: "POST",
          body: JSON.stringify(formToJson(espacioForm))
        });
        espacioForm.reset();
        await loadEspacios();
        showToast("Espacio registrado");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  if (movimientoForm) {
    if (placaMovimientoEl) {
      placaMovimientoEl.addEventListener("input", () => {
        placaMovimientoEl.value = normalizePlate(placaMovimientoEl.value);
      });
    }

    movimientoForm.addEventListener("click", async (event) => {
      const btn = event.target.closest("button[data-action]");
      if (!btn) return;

      const placa = normalizePlate(placaMovimientoEl?.value);
      if (!placa) {
        showToast("Ingresa una placa", true);
        return;
      }

      try {
        // Según botón, ejecuta entrada o salida.
        const path = btn.dataset.action === "entrada" ? "entrada" : "salida";
        await http(`${api.ingresos}/${path}/${encodeURIComponent(placa)}`, { method: "POST" });
        await Promise.all([loadEspacios(), loadIngresos()]);
        if (placaMovimientoEl) {
          placaMovimientoEl.value = placa;
        }
        showToast(path === "entrada" ? "Entrada registrada" : "Salida registrada");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }
}

function wireRefreshButtons() {
  // Botones manuales de actualizar tablas.
  const refreshVehiculos = document.getElementById("refresh-vehiculos");
  const refreshEspacios = document.getElementById("refresh-espacios");
  const refreshIngresos = document.getElementById("refresh-ingresos");

  if (refreshVehiculos) {
    refreshVehiculos.addEventListener("click", () => {
      loadVehiculos().catch((err) => showToast(err.message, true));
    });
  }

  if (refreshEspacios) {
    refreshEspacios.addEventListener("click", () => {
      loadEspacios().catch((err) => showToast(err.message, true));
    });
  }

  if (refreshIngresos) {
    refreshIngresos.addEventListener("click", () => {
      loadIngresos().catch((err) => showToast(err.message, true));
    });
  }
}

function wireTableFilters() {
  // Cada cambio de filtro reinicia página a 1.
  if (vehiculosSearchEl) vehiculosSearchEl.addEventListener("input", () => {
    resetPage("vehiculos");
    renderVehiculosTable();
  });
  if (vehiculosSortEl) vehiculosSortEl.addEventListener("change", () => {
    resetPage("vehiculos");
    renderVehiculosTable();
  });

  if (espaciosEstadoFilterEl) espaciosEstadoFilterEl.addEventListener("change", () => {
    resetPage("espacios");
    renderEspaciosTable();
  });
  if (espaciosSortEl) espaciosSortEl.addEventListener("change", () => {
    resetPage("espacios");
    renderEspaciosTable();
  });

  if (ingresosSearchEl) ingresosSearchEl.addEventListener("input", () => {
    resetPage("ingresos");
    renderIngresosTable();
  });
  if (ingresosSortEl) ingresosSortEl.addEventListener("change", () => {
    resetPage("ingresos");
    renderIngresosTable();
  });
}

function wirePagination() {
  // Navegación de páginas por tabla.
  if (vehiculosPrevEl) vehiculosPrevEl.addEventListener("click", () => movePage("vehiculos", -1));
  if (vehiculosNextEl) vehiculosNextEl.addEventListener("click", () => movePage("vehiculos", 1));
  if (espaciosPrevEl) espaciosPrevEl.addEventListener("click", () => movePage("espacios", -1));
  if (espaciosNextEl) espaciosNextEl.addEventListener("click", () => movePage("espacios", 1));
  if (ingresosPrevEl) ingresosPrevEl.addEventListener("click", () => movePage("ingresos", -1));
  if (ingresosNextEl) ingresosNextEl.addEventListener("click", () => movePage("ingresos", 1));
}

async function bootstrap() {
  // Punto de arranque de toda la app frontend.
  renderAuth();
  wireAuth();
  wireForms();
  wireRefreshButtons();
  wireTableFilters();
  wirePagination();
  renderDashboard();

  if (!getSession()?.token) return;

  try {
    // Carga inicial en paralelo para mayor velocidad.
    await Promise.all([loadVehiculos(), loadEspacios(), loadIngresos()]);
  } catch (err) {
    showToast(err.message, true);
  }
}

bootstrap();
