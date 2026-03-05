// Aplica el tema guardado al cargar cada página.
function aplicarTemaInicial() {
  const temaGuardado = localStorage.getItem('tema') || 'light';
  document.documentElement.setAttribute('data-theme', temaGuardado);
}

// Cambia entre tema claro y oscuro y lo persiste.
function alternarTema() {
  const temaActual = document.documentElement.getAttribute('data-theme') || 'light';
  const nuevoTema = temaActual === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nuevoTema);
  localStorage.setItem('tema', nuevoTema);
}

// Muestra una notificación corta en pantalla.
function mostrarToast(mensaje, tipo = 'info') {
  const contenedor = document.getElementById('toast-container');
  if (!contenedor) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

window.AppCore = {
  aplicarTemaInicial,
  alternarTema,
  mostrarToast
};

aplicarTemaInicial();
