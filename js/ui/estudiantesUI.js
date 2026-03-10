
function abrirFormularioEstudiante(estudianteActual = null) {
  const { form, cerrar } = abrirModal(estudianteActual ? 'Editar estudiante' : 'Nuevo estudiante');

  const inputIdentificacion = document.createElement('input');
  inputIdentificacion.value = estudianteActual?.identificacion || '';

  const inputNombres = document.createElement('input');
  inputNombres.value = estudianteActual?.nombres || '';
  inputNombres.required = true;

  const inputApellidos = document.createElement('input');
  inputApellidos.value = estudianteActual?.apellidos || '';
  inputApellidos.required = true;

  const inputGenero = document.createElement('input');
  inputGenero.type = 'genero';
  inputGenero.value = estudianteActual?.genero || '';
  inputGenero.required = true;

  const inputFecha = document.createElement('input');
  inputFecha.value = estudianteActual?.fecha_nacimiento || '';

  const inputDireccion = document.createElement('input');
  inputDireccion.value = estudianteActual?.direccion || '';

  const inputTelefono = document.createElement('input');
  inputTelefono.value = estudianteActual?.telefono || '';


  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Identificación', inputIdentificacion),
    crearCampo('Nombres', inputNombres),
    crearCampo('Apellidos', inputApellidos),
    crearCampo('Email', inputGenero),
    crearCampo('fecha', inputFecha),
    crearCampo('direccion', inputDireccion),
    crearCampo('Teléfono', inputTelefono)
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const base = {
      id: estudianteActual?.id || generarId('ADM'),
      identificacion: inputIdentificacion.value.trim(),
      nombres: inputNombres.value.trim(),
      apellidos: inputApellidos.value.trim(),
      genero: inputGenero.value.trim(),
      fecha: inputFecha.value.trim(),
      direccion: inputDireccion.value.trim(),
      telefono: inputTelefono.value.trim()
    };

    const errores = validarCamposRequeridos(base, ['nombres', 'apellidos', 'fecha', 'genero']);
    if (errores.length > 0) {
      mostrarToast(errores.join(' '), 'error');
      return;
    }

    const estudiantes = Store.getEstudiantes();
    const actualizados = estudianteActual
      ? estudiantes.map((a) => (a.id === estudianteActual.id ? base : a))
      : [base, ...estudiantes];

    Store.saveEstudiantes(actualizados);
    cerrar();
    mostrarToast('estudiante guardado correctamente.');
    renderSeccion('estudiantes');
  });
}

function renderGestionestudiantes() {
    const main = document.getElementById('main-content');
    const seccion = document.createElement('section');
    seccion.className = 'content-section seccion-fade';
  
    // Encabezado
    const headerDiv = document.createElement('div');
    headerDiv.className = 'section-header';
    const h3 = document.createElement('h3');
    h3.textContent = 'Gestión de estudiantes';
    const btnNuevo = document.createElement('button');
    btnNuevo.className = 'solid';
    btnNuevo.type = 'button';
    btnNuevo.textContent = 'Nuevo Estudiante';
    btnNuevo.addEventListener('click', () => abrirFormularioEstudiante());
    headerDiv.append(h3, btnNuevo);
    seccion.appendChild(headerDiv);
  
    // Tabla
    const tablaWrap = document.createElement('div');
    tablaWrap.className = 'tabla-wrap';
  
    const tabla = document.createElement('table');
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>id</th>
          <th>Identificación</th>
          <th>Nombres</th>
          <th>Apellidos</th>
          <th>Genero</th>
          <th>fecha Nacimiento</th>
          <th>direccion</th>
          <th>telefono</th>
        </tr>
      </thead>
    `;
  
    const tbody = document.createElement('tbody');
  
    Store.getEstudiantes().forEach((estudiante) => {
      const tr = document.createElement('tr');
  
      [ 
        estudiante.id,
        estudiante.identificacion,
        estudiante.nombres,
        estudiante.apellidos,
        estudiante.genero,
        estudiante.fecha_nacimiento,
        estudiante.direccion,
        estudiante.telefono
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
      btnEditar.addEventListener('click', () => abrirFormularioEstudiante(estudiantes));
  
      const btnEliminar = document.createElement('button');
      btnEliminar.className = 'btn-delete';
      btnEliminar.type = 'button';
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.addEventListener('click', () => {
        confirmarEliminacion(
          `¿Eliminar al Estudiante ${estudiante.nombres} ${estudiante.apellidos}?`,
          () => {
            Store.saveEstudiantes(Store.getEstudiantes().filter((a) => a.id !== estudiante.id));
            mostrarToast('Estudiante eliminado.');
            renderSeccion('Estudiantes');
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
  