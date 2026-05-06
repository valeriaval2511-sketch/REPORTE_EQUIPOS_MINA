let db;

function iniciarDB() {
  return new Promise((resolve, reject) => {

    const req = indexedDB.open("equiposMinaDB", 1);

    req.onupgradeneeded = e => {
      db = e.target.result;

      if (!db.objectStoreNames.contains("pendientes")) {
        db.createObjectStore("pendientes", {
          keyPath: "id"
        });
      }
    };

    req.onsuccess = e => {
      db = e.target.result;
      resolve();
    };

    req.onerror = () => reject();
  });
}

function guardarPendiente(data) {
  const tx = db.transaction("pendientes", "readwrite");
  tx.objectStore("pendientes").put(data);
}

function obtenerPendientes() {
  return new Promise(resolve => {

    const tx = db.transaction("pendientes", "readonly");
    const req = tx.objectStore("pendientes").getAll();

    req.onsuccess = () => resolve(req.result || []);
  });
}

function eliminarPendiente(id) {
  return new Promise((resolve, reject) => {

    const tx = db.transaction("pendientes", "readwrite");
    const req = tx.objectStore("pendientes").delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject();
  });
}
