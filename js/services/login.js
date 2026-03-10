/**
 * LOGIN - Autenticación de administrativos y docentes.
 */

// Aplica el tema guardado antes de renderizar la vista.
function aplicarTemaInicial() {
  document.documentElement.setAttribute('data-theme', Store.getTema());
}

// Busca un administrativo por email y password. Retorna el objeto o null.
function autenticarAdmin(email, password) {
  return Store.getAdmins().find((a) => a.email === email && a.password === password) || null;
}

// Busca un docente por email y password. Retorna el objeto o null.
function autenticarDocente(email, password) {
  return Store.getDocentes().find((d) => d.email === email && d.password === password) || null;
}

// Muestra un mensaje de error inline bajo el formulario.
function mostrarError(mensaje) {
  const error = document.getElementById('login-error');
  if (error) error.textContent = mensaje;
}

// Configura el evento submit del formulario de login.
// Se intercepta el submit para evitar el POST nativo, validar credenciales
// en el cliente y decidir el destino (admin o docente) antes de redirigir.
function configurarFormularioLogin() {
  const form = document.getElementById('login-form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      mostrarError('Debes completar correo y contraseña.');
      return;
    }

    // Intenta como administrativo primero
    const admin = autenticarAdmin(email, password);
    if (admin) {
      Store.saveSession({ ...admin, rol: 'admin' });
      window.location.href = 'admin.html';
      return;
    }

    // Intenta como docente
    const docente = autenticarDocente(email, password);
    if (docente) {
      Store.saveSession({ ...docente, rol: 'docente' });
      window.location.href = 'dashboard.html';
      return;
    }

    mostrarError('Correo o contraseña incorrectos.');
  });
}

// Inicializa la página de login: carga datos y verifica si ya hay sesión activa.
async function iniciarLogin() {
  aplicarTemaInicial();
  await Store.initFromJSON();

  // Si ya hay sesión, redirige al panel correspondiente sin mostrar el login
  const sesion = Store.getSession();
  if (sesion) {
    const esAdmin = sesion.rol === 'admin' || sesion.id?.startsWith('ADM-') || !!sesion.cargo;
    window.location.href = esAdmin ? 'admin.html' : 'dashboard.html';
    return;
  }

  configurarFormularioLogin();
}

document.addEventListener('DOMContentLoaded', iniciarLogin);
