
function abrirFormularioEstudiante(estudianteActual = null) {
  const { form, cerrar } = abrirModal(estudianteActual ? 'Editar estudiante' : 'Nuevo estudiante');

  const inputIdentificacion = document.createElement('input');
  inputIdentificacion.value = estudianteActual?.identificacion || '';
  inputIdentificacion.required = true;

  const inputNombres = document.createElement('input');
  inputNombres.value = estudianteActual?.nombres || '';
  inputNombres.required = true;

  const inputApellidos = document.createElement('input');
  inputApellidos.value = estudianteActual?.apellidos || '';
  inputApellidos.required = true;

  const inputGenero = document.createElement('input');
  inputGenero.type = 'text';
  inputGenero.value = estudianteActual?.genero || '';
  inputGenero.required = true;

  const inputFecha = document.createElement('input');
  inputFecha.type = 'text';
  inputFecha.placeholder = 'DD/MM/AAAA';
  inputFecha.value = estudianteActual?.fecha_nacimiento || '';

  const inputDireccion = document.createElement('input');
  inputDireccion.value = estudianteActual?.direccion || '';

  const inputTelefono = document.createElement('input');
  inputTelefono.value = estudianteActual?.telefono || '';

  // Selector de curso
  const selectCurso = document.createElement('select');
  selectCurso.required = true;

  const optionVacia = document.createElement('option');
  optionVacia.value = '';
  optionVacia.textContent = 'Selecciona un curso...';
  optionVacia.disabled = true;
  selectCurso.appendChild(optionVacia);

  const cursos = Store.getCursos();
  cursos.forEach((curso) => {
    const option = document.createElement('option');
    option.value = curso.id;
    option.textContent = `${curso.codigo} - ${curso.nombre}`;
    selectCurso.appendChild(option);
  });

  if (estudianteActual?.cursoId) {
    selectCurso.value = estudianteActual.cursoId;
  } else if (cursos.length > 0) {
    selectCurso.value = cursos[0].id;
  }

  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Identificación', inputIdentificacion),
    crearCampo('Nombres', inputNombres),
    crearCampo('Apellidos', inputApellidos),
    crearCampo('Género', inputGenero),
    crearCampo('Fecha de nacimiento', inputFecha),
    crearCampo('Dirección', inputDireccion),
    crearCampo('Teléfono', inputTelefono),
    crearCampo('Curso', selectCurso)
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const base = {
      id: estudianteActual?.id || generarId('EST'),
      identificacion: inputIdentificacion.value.trim(),
      nombres: inputNombres.value.trim(),
      apellidos: inputApellidos.value.trim(),
      genero: inputGenero.value.trim(),
      fecha_nacimiento: inputFecha.value.trim(),
      direccion: inputDireccion.value.trim(),
      telefono: inputTelefono.value.trim(),
      cursoId: selectCurso.value
    };

    const errores = validarCamposRequeridos(base, ['identificacion', 'nombres', 'apellidos', 'genero', 'fecha_nacimiento', 'cursoId']);
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
    mostrarToast('Estudiante guardado correctamente.');
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
          <th>ID</th>
          <th>Identificación</th>
          <th>Nombres</th>
          <th>Apellidos</th>
          <th>Género</th>
          <th>Fecha nacimiento</th>
          <th>Dirección</th>
          <th>Teléfono</th>
          <th>Curso</th>
          <th>Acciones</th>
        </tr>
      </thead>
    `;
  
    const tbody = document.createElement('tbody');
    const cursos = Store.getCursos();
  
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

      // Celda de curso
      const tdCurso = document.createElement('td');
      const cursoBuscado = cursos.find((c) => c.id === estudiante.cursoId);
      tdCurso.textContent = escaparHTML(cursoBuscado ? `${cursoBuscado.codigo} - ${cursoBuscado.nombre}` : 'N/A');
      tr.appendChild(tdCurso);
  
      const tdAcciones = document.createElement('td');
      const accDiv = document.createElement('div');
      accDiv.className = 'actions-btns';
  
      const btnEditar = document.createElement('button');
      btnEditar.className = 'btn-edit';
      btnEditar.type = 'button';
      btnEditar.textContent = 'Editar';
      btnEditar.addEventListener('click', () => abrirFormularioEstudiante(estudiante));
  
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
            renderSeccion('estudiantes');
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
  