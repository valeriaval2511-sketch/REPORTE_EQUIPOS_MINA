function mensaje(t) {
  document.getElementById("mensaje").textContent = t;
}

let dataTabla = [];

let catalogos = {
  dni: [],
  equipos: [],
  labores: []
};

async function cargarCatalogos() {

  try {

    const res = await fetch(URL + "?listas=1", {
      method: "GET",
      mode: "cors"
    });
    console.log("catalogos respuesta", res);

    const data = await res.json();

    catalogos = data;

    localStorage.setItem(
      "catalogosEquiposMina",
      JSON.stringify(data)
    );

    llenarListas();

    mensaje("Catálogos actualizados");

  } catch (e) {

    const local = localStorage.getItem(
      "catalogosEquiposMina"
    );

    if (local) {
      catalogos = JSON.parse(local);
      llenarListas();
      mensaje("Catálogos locales");
    }
  }
}

function llenarListas() {

  const dni = document.getElementById("listaDNI");
  const eq = document.getElementById("listaEquipos");
  const lab = document.getElementById("listaLabores");

  dni.innerHTML = "";
  eq.innerHTML = "";
  lab.innerHTML = "";

  catalogos.dni.forEach(x => {
    dni.innerHTML += `<option value="${x.dni}">`;
  });

  catalogos.equipos.forEach(x => {
    eq.innerHTML += `<option value="${x}">`;
  });

  catalogos.labores.forEach(x => {
    lab.innerHTML += `<option value="${x}">`;
  });
}

async function cargarTabla() {

  try {

    const res = await fetch(URL);
    const data = await res.json();

    dataTabla = data;

    renderTabla(dataTabla);

  } catch (e) {
    mensaje("No cargó tabla");
  }
}

function renderTabla(data) {

  if (!Array.isArray(data) || data.length < 2) return;

  let html = `
    <table>
      <tr>
        <th>Equipo</th>
        <th>Labor</th>
        <th>Estado</th>
        <th>Obs</th>
      </tr>
  `;

  const filas = data
    .slice(1)
    .filter(r => r[7])
    .slice(-10)
    .reverse();

  filas.forEach(r => {

    const equipo = r[7] || "";
    const labor = r[8] || "";
    const estado = r[9] || "";
    const obs = r[11] || "";

    let color = "#eee";

    if (estado === "Operativo") color = "#d1fae5";
    if (estado === "Inoperativo") color = "#fee2e2";
    if (estado.includes("Mtto")) color = "#fef3c7";
    if (estado === "Stand By") color = "#dbeafe";

    html += `
      <tr>
        <td>${equipo}</td>
        <td>${labor}</td>
        <td>
          ${badgeEstado(estado)}
        </td>
        <td>
        <button onclick="verObs('${String(obs).replace(/'/g,"")}')">
        👁
        </button>
        </td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("tabla").innerHTML = html;
}

function aplicarFiltros() {

  let filas = dataTabla.slice(1);

  const fecha = document.getElementById("filtroFecha").value;
  const guardia = document.getElementById("filtroGuardia").value;
  const equipo = document.getElementById("filtroEquipo").value.trim().toLowerCase();
  const estado = document.getElementById("filtroEstado").value;

  if (fecha) {
    filas = filas.filter(r => {

      const f = (r[1] || "").split("/");

      if (f.length !== 3) return false;

      const iso = `${f[2]}-${f[1]}-${f[0]}`;

      return iso === fecha;
    });
  }

  if (guardia) {
    filas = filas.filter(r => r[10] === guardia);
  }

  if (equipo) {
    filas = filas.filter(r =>
      String(r[7] || "").toLowerCase().includes(equipo)
    );
  }

  if (estado) {
    filas = filas.filter(r => r[9] === estado);
  }

  renderTabla([[], ...filas]);
}

function estado(tipo) {
  const el = document.getElementById("estadoConexion");

  el.className = "estado";

  if (tipo === "online") {
    el.textContent = "Con conexión";
    el.classList.add("online");
  }

  if (tipo === "offline") {
    el.textContent = "Sin conexión";
    el.classList.add("offline");
  }

  if (tipo === "sync") {
    el.textContent = "Sincronizando";
    el.classList.add("sync");
  }
}

function verObs(texto) {
  document.getElementById("textoObs").textContent =
    texto || "Sin observación";

  document.getElementById("modalObs").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modalObs").style.display = "none";
}

function badgeEstado(valor){

const v = String(valor || "").toUpperCase();

if(v.includes("OPERATIVO"))
return '<span class="badge ok">Operativo</span>';

if(v.includes("INOPERATIVO"))
return '<span class="badge bad">Inoperativo</span>';

if(v.includes("PREVENT"))
return '<span class="badge warn">Mtto Preventivo</span>';

if(v.includes("CORRECT"))
return '<span class="badge alert">Mtto Correctivo</span>';

if(v.includes("STAND"))
return '<span class="badge wait">Stand By</span>';

return '<span class="badge">'+valor+'</span>';
}

function obtenerFotoBase64() {

  return new Promise(resolve => {

    const file = document.getElementById("foto").files[0];

    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

      const img = new Image();

      img.onload = function() {

        const canvas = document.createElement("canvas");

        const max = 900;

        let w = img.width;
        let h = img.height;

        if (w > h && w > max) {
          h = h * max / w;
          w = max;
        }

        if (h > w && h > max) {
          w = w * max / h;
          h = max;
        }

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const base64 = canvas.toDataURL("image/jpeg", 0.7);

        resolve(base64);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}


function obtenerFechaHora() {

  const ahora = new Date();

  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const dd = String(ahora.getDate()).padStart(2, "0");

  const hh = String(ahora.getHours()).padStart(2, "0");
  const mi = String(ahora.getMinutes()).padStart(2, "0");
  const ss = String(ahora.getSeconds()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
}

function obtenerGuardia() {

  const ahora = new Date();
  const hora = ahora.getHours();

  const esDia = hora >= 7 && hora < 19;

  const fecha = new Date(ahora);

  if (hora < 7) {
    fecha.setDate(fecha.getDate() - 1);
  }

  const base = new Date(2026, 3, 21, 7, 0, 0);

  const diffDias = Math.floor(
    (fecha - base) / (1000 * 60 * 60 * 24)
  );

  const ciclo = ((diffDias % 21) + 21) % 21;

  if (ciclo < 7) {
    return esDia ? "A" : "B";
  }

  if (ciclo < 14) {
    return esDia ? "B" : "C";
  }

  return esDia ? "C" : "A";
}

async function actualizarPendientes() {
  const arr = await obtenerPendientes();
  document.getElementById("numPendientes").textContent = arr.length;
}

async function guardar() {

  const foto = await obtenerFotoBase64();

  const data = {
    id: Date.now().toString(),

      fecha: obtenerFechaHora(),

    tipo: document.getElementById("tipo").value,
    guardia: document.getElementById("guardia").value,
    dni: document.getElementById("dni").value,
    nombre: document.getElementById("nombre").textContent,
    equipo: document.getElementById("equipo").value,
    labor: document.getElementById("labor").value,
    estado: document.getElementById("estado").value,
    obs: document.getElementById("obs").value,
    foto: foto,
  };

  let errores = [];

  if (!data.dni || !data.equipo || !data.labor || !data.obs) {
    errores.push("Completa todos los campos");
  }

  const existeDNI = catalogos.dni.some(x => x.dni === data.dni);
  const existeEquipo = catalogos.equipos.includes(data.equipo);
  const existeLabor = catalogos.labores.includes(data.labor);

  if (data.dni && !existeDNI) {
    errores.push("DNI no válido");
  }

  if (data.equipo && !existeEquipo) {
    errores.push("Equipo no válido");
  }

  if (data.labor && !existeLabor) {
    errores.push("Labor no válida");
  }

  if (errores.length > 0) {
    mensaje(errores.join(" | "));
    return;
  }

  guardarPendiente(data);

  mensaje("Guardado local");
  actualizarPendientes();

  document.getElementById("obs").value = "";
  document.getElementById("foto").value = "";

  if (navigator.onLine) {
    sincronizar();
  }
}

function toggleTabla() {

  const sec = document.getElementById("seccionTabla");
  const btn = document.getElementById("btnTabla");

  if (sec.style.display === "none") {
    sec.style.display = "block";
    btn.textContent = "Ocultar tabla";
    cargarTabla();
  } else {
    sec.style.display = "none";
    btn.textContent = "Mostrar tabla";
  }
}

window.addEventListener("online", () => {
  estado("online");
  sincronizar();
});

window.addEventListener("offline", () => {
  estado("offline");
});

window.addEventListener("load", async () => {

  await iniciarDB();

  cargarCatalogos();
  cargarTabla();

  document.getElementById("guardia").value = obtenerGuardia();

  document.getElementById("btnGuardar").onclick = guardar;
  document.getElementById("btnSync").onclick = sincronizar;
  document.getElementById("btnFiltrar").onclick = aplicarFiltros;
  document.getElementById("btnTabla").onclick = toggleTabla;
  document.getElementById("foto").addEventListener("change", e => {

    const file = e.target.files[0];

    document.getElementById("nombreFoto").textContent =
      file ? "📎 " + file.name : "";
  });


  actualizarPendientes();

  if (navigator.onLine) {
    estado("online");
    sincronizar();
  } else {
    estado("offline");
  }

  document.getElementById("dni").addEventListener("input", () => {

    const valor = document.getElementById("dni").value.trim();

    const persona = catalogos.dni.find(x => x.dni === valor);

  document.getElementById("nombre").textContent =
      persona ? persona.nombre.replace("|"," · ") : ""
  });

});