const URL = "https://script.google.com/macros/s/AKfycbwYaZh83cQvJ56gHmnYRmpJ1zKEcnXKYhPgnmTRGqqZtbD89pVG2BfcVJWV8TI-luxSEA/exec";

async function sincronizar() {

  if (!navigator.onLine) {
    mensaje("Sin internet");
    return;
  }

  estado("sync");

  const pendientes = await obtenerPendientes();

  if (pendientes.length === 0) {
    mensaje("No hay pendientes");
    estado("online");
    return;
  }

  const lote = pendientes.slice(0, 5);

  try {

    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify({
        tipo: "lote",
        datos: lote
      })
    });

    const txt = await res.text();

    if (!res.ok) throw new Error();

    for (let item of lote) {
      await eliminarPendiente(item.id);
    }
    
    mensaje("Lote enviado");
    
    document.getElementById("foto").value = "";
    document.getElementById("nombreFoto").textContent = "";
    
    cargarTabla();
    actualizarPendientes();
  
    if ((await obtenerPendientes()).length > 0) {
      sincronizar();
      return;
    }

  } catch (e) {
    mensaje("Error sincronizando");
  }

  estado("online");
}
