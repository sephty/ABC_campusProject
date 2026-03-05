/**
 * ADMINS UI - Gestión de administrativos en el panel administrativo.
 * CRUD completo sin restricciones de eliminación.
 */

// Abre formulario modal para crear o editar un administrativo.
// El campo password solo aparece en creación, no en edición.
function abrirFormularioAdmin(adminActual = null) {
  const { form, cerrar } = abrirModal(adminActual ? 'Editar administrativo' : 'Nuevo administrativo');

  const inputIdentificacion = document.createElement('input');
  inputIdentificacion.value = adminActual?.identificacion || '';

  const inputNombres = document.createElement('input');
  inputNombres.value = adminActual?.nombres || '';
  inputNombres.required = true;

  const inputApellidos = document.createElement('input');
  inputApellidos.value = adminActual?.apellidos || '';
  inputApellidos.required = true;

  const inputEmail = document.createElement('input');
  inputEmail.type = 'email';
  inputEmail.value = adminActual?.email || '';
  inputEmail.required = true;

  const inputTelefono = document.createElement('input');
  inputTelefono.value = adminActual?.telefono || '';

  const inputCargo = document.createElement('input');
  inputCargo.value = adminActual?.cargo || '';

  const inputPassword = document.createElement('input');
  inputPassword.type = 'password';
  inputPassword.placeholder = 'Contraseña de acceso';

  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Identificación', inputIdentificacion),
    crearCampo('Nombres', inputNombres),
    crearCampo('Apellidos', inputApellidos),
    crearCampo('Email', inputEmail),
    crearCampo('Teléfono', inputTelefono),
    crearCampo('Cargo', inputCargo)
  );

  // Password solo en creación
  if (!adminActual) {
    acciones.before(crearCampo('Password', inputPassword));
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const base = {
      id: adminActual?.id || generarId('ADM'),
      identificacion: inputIdentificacion.value.trim(),
      nombres: inputNombres.value.trim(),
      apellidos: inputApellidos.value.trim(),
      email: inputEmail.value.trim(),
      password: adminActual?.password || inputPassword.value.trim(),
      telefono: inputTelefono.value.trim(),
      cargo: inputCargo.value.trim(),
      avatarUrl: adminActual?.avatarUrl || ''
    };

    const errores = validarCamposRequeridos(base, ['nombres', 'apellidos', 'email']);
    if (errores.length > 0) {
      mostrarToast(errores.join(' '), 'error');
      return;
    }

    if (!adminActual && !base.password) {
      mostrarToast('El password es obligatorio al crear un administrativo.', 'error');
      return;
    }

    const admins = Store.getAdmins();
    const actualizados = adminActual
      ? admins.map((a) => (a.id === adminActual.id ? base : a))
      : [base, ...admins];

    Store.saveAdmins(actualizados);
    cerrar();
    mostrarToast('Administrativo guardado correctamente.');
    renderSeccion('admins');
  });
}

// Renderiza la sección de administrativos con tabla CRUD completa.
function renderAdmins() {
  const main = document.getElementById('main-content');
  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  // Encabezado
  const headerDiv = document.createElement('div');
  headerDiv.className = 'section-header';
  const h3 = document.createElement('h3');
  h3.textContent = 'Gestión de administrativos';
  const btnNuevo = document.createElement('button');
  btnNuevo.className = 'solid';
  btnNuevo.type = 'button';
  btnNuevo.textContent = 'Nuevo administrativo';
  btnNuevo.addEventListener('click', () => abrirFormularioAdmin());
  headerDiv.append(h3, btnNuevo);
  seccion.appendChild(headerDiv);

  // Tabla
  const tablaWrap = document.createElement('div');
  tablaWrap.className = 'tabla-wrap';

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Identificación</th>
        <th>Nombres</th>
        <th>Apellidos</th>
        <th>Email</th>
        <th>Teléfono</th>
        <th>Cargo</th>
        <th>Acciones</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  Store.getAdmins().forEach((admin) => {
    const tr = document.createElement('tr');

    [
      admin.identificacion,
      admin.nombres,
      admin.apellidos,
      admin.email,
      admin.telefono,
      admin.cargo
    ].forEach((val) => {
      const td = document.createElement('td');
      td.textContent = escaparHTML(val || '');
      tr.appendChild(td);
    });

    const tdAcciones = document.createElement('td');
    const accDiv = document.createElement('div');
    accDiv.className = 'actions-btns';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-edit';
    btnEditar.type = 'button';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirFormularioAdmin(admin));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-delete';
    btnEliminar.type = 'button';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => {
      confirmarEliminacion(
        `¿Eliminar al administrativo ${admin.nombres} ${admin.apellidos}?`,
        () => {
          Store.saveAdmins(Store.getAdmins().filter((a) => a.id !== admin.id));
          mostrarToast('Administrativo eliminado.');
          renderSeccion('admins');
        }
      );
    });

    accDiv.append(btnEditar, btnEliminar);
    tdAcciones.appendChild(accDiv);
    tr.appendChild(tdAcciones);
    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
  tablaWrap.appendChild(tabla);
  seccion.appendChild(tablaWrap);
  main.appendChild(seccion);
}
