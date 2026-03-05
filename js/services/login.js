// Aplica el tema guardado antes de renderizar la vista.
function aplicarTemaInicial() {
  document.documentElement.setAttribute('data-theme', Store.getTema());
}

// Valida credenciales contra la lista de administrativos.
function autenticarAdmin(email, password) {
  const admins = Store.getAdmins();
  return admins.find((admin) => admin.email === email && admin.password === password) || null;
}

// Muestra un mensaje de error en el formulario.
function mostrarError(mensaje) {
  const error = document.getElementById('login-error');
  error.textContent = mensaje;
}

// Configura el formulario de inicio de sesión.
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

    const admin = autenticarAdmin(email, password);

    if (!admin) {
      mostrarError('Credenciales inválidas para acceso administrativo.');
      return;
    }

    Store.saveSession(admin);
    window.location.href = 'admin.html';
  });
}

// Inicializa la pantalla de login con datos base.
async function iniciarLogin() {
  aplicarTemaInicial();
  await Store.initFromJSON();

  if (Store.getSession()) {
    window.location.href = 'admin.html';
    return;
  }

  configurarFormularioLogin();
}

document.addEventListener('DOMContentLoaded', iniciarLogin);
