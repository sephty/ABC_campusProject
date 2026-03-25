/**
 * TEACHERS UI - Gestión de docentes en el panel administrativo.
 * CRUD completo con foto, carga académica y restricción de eliminación.
 */

// Crea la celda de foto del docente. Usa fotoUrl si existe, iniciales si no.
function crearCeldaFotoDocente(docente) {
  const td = document.createElement('td');
  if (docente.fotoUrl) {
    const img = document.createElement('img');
    img.className = 'docente-foto';
    img.src = docente.fotoUrl;
    img.alt = `${docente.nombres} ${docente.apellidos}`;
    // Si la imagen no carga (archivo no existe aún), muestra iniciales
    img.onerror = () => img.replaceWith(crearAvatarIniciales(docente));
    td.appendChild(img);
  } else {
    td.appendChild(crearAvatarIniciales(docente));
  }
  return td;
}

// Abre formulario modal para crear o editar un docente.
function abrirFormularioDocente(docenteActual = null) {
  const { form, cerrar } = abrirModal(docenteActual ? 'Editar docente' : 'Nuevo docente');

  const inputCodigo = document.createElement('input');
  inputCodigo.value = docenteActual?.codigo || '';

  const inputIdentificacion = document.createElement('input');
  inputIdentificacion.value = docenteActual?.identificacion || '';

  const inputNombres = document.createElement('input');
  inputNombres.value = docenteActual?.nombres || '';
  inputNombres.required = true;

  const inputApellidos = document.createElement('input');
  inputApellidos.value = docenteActual?.apellidos || '';
  inputApellidos.required = true;

  const inputEmail = document.createElement('input');
  inputEmail.type = 'email';
  inputEmail.value = docenteActual?.email || '';
  inputEmail.required = true;

  const inputArea = document.createElement('input');
  inputArea.value = docenteActual?.areaAcademica || '';

  // Campo fotoUrl: el desarrollador ingresa la ruta manualmente (ej: imgs/docentes/nombre.png)
  const inputFoto = document.createElement('input');
  inputFoto.type = 'text';
  inputFoto.placeholder = 'imgs/docentes/nombre.png';
  inputFoto.value = docenteActual?.fotoUrl || '';

  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Código', inputCodigo),
    crearCampo('Identificación', inputIdentificacion),
    crearCampo('Nombres', inputNombres),
    crearCampo('Apellidos', inputApellidos),
    crearCampo('Email', inputEmail),
    crearCampo('Área académica', inputArea),
    crearCampo('URL de foto (imgs/docentes/nombre.png)', inputFoto)
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const base = {
      id: docenteActual?.id || generarId('DOC'),
      codigo: inputCodigo.value.trim(),
      identificacion: inputIdentificacion.value.trim(),
      nombres: inputNombres.value.trim(),
      apellidos: inputApellidos.value.trim(),
      email: inputEmail.value.trim(),
      password: docenteActual?.password || 'docente123',
      areaAcademica: inputArea.value.trim(),
      fotoUrl: inputFoto.value.trim()
    };

    const errores = validarCamposRequeridos(base, ['nombres', 'apellidos', 'email']);
    if (errores.length > 0) {
      mostrarToast(errores.join(' '), 'error');
      return;
    }

    const docentes = Store.getDocentes();
    const actualizados = docenteActual
      ? docentes.map((d) => (d.id === docenteActual.id ? base : d))
      : [base, ...docentes];

    Store.saveDocentes(actualizados);
    cerrar();
    mostrarToast('Docente guardado correctamente.');
    renderSeccion('docentes');
  });
}

// Abre un modal para gestionar la carga académica (cursos asignados) de un docente.
function abrirModalCargaAcademica(docente) {
  const { form, cerrar } = abrirModal(`Carga académica: ${escaparHTML(docente.nombres)} ${escaparHTML(docente.apellidos)}`);

  const todoCursos = Store.getCursos();
  const cursosAsignados = todoCursos.filter((c) => c.docenteId === docente.id);
  const cursosDisponibles = todoCursos.filter((c) => c.docenteId !== docente.id);

  // **CURSOS ASIGNADOS**
  const h4Asignados = document.createElement('h4');
  h4Asignados.textContent = 'Cursos asignados';
  form.appendChild(h4Asignados);

  const containerAsignados = document.createElement('div');
  containerAsignados.className = 'carga-courses-list';

  if (cursosAsignados.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No hay cursos asignados.';
    p.style.fontStyle = 'italic';
    p.style.color = '#999';
    containerAsignados.appendChild(p);
  } else {
    cursosAsignados.forEach((curso) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'carga-course-item';
      itemDiv.style.display = 'flex';
      itemDiv.style.justifyContent = 'space-between';
      itemDiv.style.alignItems = 'center';
      itemDiv.style.padding = '10px';
      itemDiv.style.borderBottom = '1px solid #eee';

      const info = document.createElement('div');
      info.innerHTML = `
        <strong>${escaparHTML(curso.codigo)}</strong><br>
        ${escaparHTML(curso.nombre)}
      `;
      info.style.flex = '1';

      const btnQuitar = document.createElement('button');
      btnQuitar.className = 'btn-delete';
      btnQuitar.type = 'button';
      btnQuitar.textContent = 'Quitar';
      btnQuitar.addEventListener('click', () => {
        itemDiv.remove();
        // Agregar el curso de vuelta a disponibles
        const itemDispDiv = document.createElement('div');
        itemDispDiv.className = 'carga-course-item-available';
        itemDispDiv.style.display = 'flex';
        itemDispDiv.style.justifyContent = 'space-between';
        itemDispDiv.style.alignItems = 'center';
        itemDispDiv.style.padding = '10px';
        itemDispDiv.style.borderBottom = '1px solid #eee';

        const infoDisp = document.createElement('div');
        infoDisp.innerHTML = `
          <strong>${escaparHTML(curso.codigo)}</strong><br>
          ${escaparHTML(curso.nombre)}
        `;
        infoDisp.style.flex = '1';

        const btnAgregar = document.createElement('button');
        btnAgregar.className = 'solid';
        btnAgregar.type = 'button';
        btnAgregar.textContent = 'Asignar';
        btnAgregar.addEventListener('click', () => {
          itemDispDiv.remove();
          itemDiv.style.display = 'flex';
          containerAsignados.appendChild(itemDiv);
        });

        itemDispDiv.append(infoDisp, btnAgregar);
        containerDisponibles.appendChild(itemDispDiv);
      });

      itemDiv.append(info, btnQuitar);
      containerAsignados.appendChild(itemDiv);
    });
  }

  form.appendChild(containerAsignados);

  // **CURSOS DISPONIBLES**
  const h4Disponibles = document.createElement('h4');
  h4Disponibles.textContent = 'Cursos disponibles para asignar';
  h4Disponibles.style.marginTop = '20px';
  form.appendChild(h4Disponibles);

  const containerDisponibles = document.createElement('div');
  containerDisponibles.className = 'carga-courses-list-available';

  if (cursosDisponibles.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No hay cursos disponibles.';
    p.style.fontStyle = 'italic';
    p.style.color = '#999';
    containerDisponibles.appendChild(p);
  } else {
    cursosDisponibles.forEach((curso) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'carga-course-item-available';
      itemDiv.style.display = 'flex';
      itemDiv.style.justifyContent = 'space-between';
      itemDiv.style.alignItems = 'center';
      itemDiv.style.padding = '10px';
      itemDiv.style.borderBottom = '1px solid #eee';

      const info = document.createElement('div');
      info.innerHTML = `
        <strong>${escaparHTML(curso.codigo)}</strong><br>
        ${escaparHTML(curso.nombre)}
      `;
      info.style.flex = '1';

      const btnAgregar = document.createElement('button');
      btnAgregar.className = 'solid';
      btnAgregar.type = 'button';
      btnAgregar.textContent = 'Asignar';
      btnAgregar.addEventListener('click', () => {
        itemDiv.remove();
        // Agregar el curso de vuelta a asignados
        const itemAsigDiv = document.createElement('div');
        itemAsigDiv.className = 'carga-course-item';
        itemAsigDiv.style.display = 'flex';
        itemAsigDiv.style.justifyContent = 'space-between';
        itemAsigDiv.style.alignItems = 'center';
        itemAsigDiv.style.padding = '10px';
        itemAsigDiv.style.borderBottom = '1px solid #eee';

        const infoAsig = document.createElement('div');
        infoAsig.innerHTML = `
          <strong>${escaparHTML(curso.codigo)}</strong><br>
          ${escaparHTML(curso.nombre)}
        `;
        infoAsig.style.flex = '1';

        const btnQuitar = document.createElement('button');
        btnQuitar.className = 'btn-delete';
        btnQuitar.type = 'button';
        btnQuitar.textContent = 'Quitar';
        btnQuitar.addEventListener('click', () => {
          itemAsigDiv.remove();
          itemDiv.style.display = 'flex';
          containerDisponibles.appendChild(itemDiv);
        });

        itemAsigDiv.append(infoAsig, btnQuitar);
        containerAsignados.appendChild(itemAsigDiv);
      });

      itemDiv.append(info, btnAgregar);
      containerDisponibles.appendChild(itemDiv);
    });
  }

  form.appendChild(containerDisponibles);

  // **GUARDAR CAMBIOS**
  const acciones = form.querySelector('.modal-actions');
  acciones.insertAdjacentElement('beforebegin', containerDisponibles);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Obtener IDs de cursos asignados desde las filas del DOM
    const elementosAsignados = document.querySelectorAll('.carga-course-item');
    const cursosFinales = Array.from(elementosAsignados).map((el) => {
      const texto = el.textContent;
      // Buscar el curso por su código (primera línea)
      const codigo = texto.split('\n')[0].trim();
      return todoCursos.find((c) => c.codigo === codigo);
    }).filter(Boolean);

    // Actualizar los docenteId de los cursos
    const todoCursosFinal = todoCursos.map((curso) => {
      if (cursosFinales.find((c) => c.id === curso.id)) {
        // Este curso debe asignarse al docente
        return { ...curso, docenteId: docente.id };
      } else if (curso.docenteId === docente.id) {
        // Este curso estaba asignado al docente pero ahora se quita
        return { ...curso, docenteId: null };
      }
      return curso;
    });

    Store.saveCursos(todoCursosFinal);
    cerrar();
    mostrarToast('Carga académica actualizada correctamente.');
    renderSeccion('docentes');
  });
}

// Renderiza la sección de docentes con tabla CRUD y panel de carga académica.
function renderDocentes() {
  const main = document.getElementById('main-content');
  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  // Encabezado con botón de nuevo docente
  const headerDiv = document.createElement('div');
  headerDiv.className = 'section-header';
  const h3 = document.createElement('h3');
  h3.textContent = 'Gestión de docentes';
  const btnNuevo = document.createElement('button');
  btnNuevo.id = 'btn-nuevo-docente';
  btnNuevo.className = 'solid';
  btnNuevo.type = 'button';
  btnNuevo.textContent = 'Nuevo docente';
  btnNuevo.addEventListener('click', () => abrirFormularioDocente());
  headerDiv.append(h3, btnNuevo);
  seccion.appendChild(headerDiv);

  // Tabla de docentes
  const tablaWrap = document.createElement('div');
  tablaWrap.className = 'tabla-wrap';

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Foto</th>
        <th>Código</th>
        <th>Identificación</th>
        <th>Nombres</th>
        <th>Apellidos</th>
        <th>Email</th>
        <th>Área Académica</th>
        <th>Acciones</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  tbody.id = 'tbody-docentes';

  Store.getDocentes().forEach((docente) => {
    const tr = document.createElement('tr');

    // Celda de foto con fallback a iniciales
    tr.appendChild(crearCeldaFotoDocente(docente));

    // Celdas de datos
    [
      docente.codigo,
      docente.identificacion,
      docente.nombres,
      docente.apellidos,
      docente.email,
      docente.areaAcademica
    ].forEach((val) => {
      const td = document.createElement('td');
      td.textContent = escaparHTML(val || '');
      tr.appendChild(td);
    });

    // Celda de acciones
    const tdAcciones = document.createElement('td');
    const accDiv = document.createElement('div');
    accDiv.className = 'actions-btns';

    const btnCarga = document.createElement('button');
    btnCarga.className = 'ghost';
    btnCarga.type = 'button';
    btnCarga.textContent = 'Carga académica';
    btnCarga.addEventListener('click', () => {
      abrirModalCargaAcademica(docente);
    });

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-edit';
    btnEditar.type = 'button';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirFormularioDocente(docente));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-delete';
    btnEliminar.type = 'button';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => {
      // Verifica si tiene cursos antes de permitir eliminación
      const cursosAsignados = Store.getCursos().filter((c) => c.docenteId === docente.id);
      if (cursosAsignados.length > 0) {
        const nombres = cursosAsignados.map((c) => c.nombre).join(', ');
        mostrarToast(`No se puede eliminar. Tiene cursos asignados: ${nombres}`, 'error');
        return;
      }
      confirmarEliminacion(
        `¿Eliminar al docente ${docente.nombres} ${docente.apellidos}?`,
        () => {
          Store.saveDocentes(Store.getDocentes().filter((d) => d.id !== docente.id));
          mostrarToast('Docente eliminado.');
          renderSeccion('docentes');
        }
      );
    });

    accDiv.append(btnCarga, btnEditar, btnEliminar);
    tdAcciones.appendChild(accDiv);
    tr.appendChild(tdAcciones);
    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
  tablaWrap.appendChild(tabla);
  seccion.appendChild(tablaWrap);

  main.appendChild(seccion);
}