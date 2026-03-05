/**
 * COURSES UI - Gestión de cursos en el panel administrativo.
 * CRUD completo: cursos, módulos y lecciones anidados.
 */

// Abre formulario modal para crear o editar un curso.
function abrirFormularioCurso(cursoActual = null) {
  const { form, cerrar } = abrirModal(cursoActual ? 'Editar curso' : 'Nuevo curso');
  const docentes = Store.getDocentes();

  const inputCodigo = document.createElement('input');
  inputCodigo.value = cursoActual?.codigo || '';
  inputCodigo.required = true;

  const inputNombre = document.createElement('input');
  inputNombre.value = cursoActual?.nombre || '';
  inputNombre.required = true;

  const inputDescripcion = document.createElement('textarea');
  inputDescripcion.value = cursoActual?.descripcion || '';

  const inputCategoria = document.createElement('input');
  inputCategoria.value = cursoActual?.categoria || '';
  inputCategoria.required = true;

  const inputEtiquetas = document.createElement('input');
  inputEtiquetas.placeholder = 'html, css, javascript';
  inputEtiquetas.value = (cursoActual?.etiquetas || []).join(', ');

  const inputDuracion = document.createElement('input');
  inputDuracion.placeholder = 'ej: 120h';
  inputDuracion.value = cursoActual?.duracion || '';

  const selectVisibilidad = document.createElement('select');
  ['publico', 'privado'].forEach((val) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = val.charAt(0).toUpperCase() + val.slice(1);
    selectVisibilidad.appendChild(opt);
  });
  selectVisibilidad.value = cursoActual?.visibilidad || 'publico';

  const selectEstado = document.createElement('select');
  [
    { val: 'activo',    label: 'Activo' },
    { val: 'inactivo',  label: 'Inactivo' },
    { val: 'pausado',   label: 'Pausado' },
    { val: 'archivado', label: 'Archivado' }
  ].forEach(({ val, label }) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    selectEstado.appendChild(opt);
  });
  selectEstado.value = cursoActual?.estado || 'activo';

  const selectDocente = document.createElement('select');
  const optVacio = document.createElement('option');
  optVacio.value = '';
  optVacio.textContent = 'Sin asignar';
  selectDocente.appendChild(optVacio);
  docentes.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = `${d.nombres} ${d.apellidos}`;
    selectDocente.appendChild(opt);
  });
  selectDocente.value = cursoActual?.docenteId || '';
  selectDocente.required = true;

  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Código', inputCodigo),
    crearCampo('Nombre', inputNombre),
    crearCampo('Descripción', inputDescripcion),
    crearCampo('Categoría', inputCategoria),
    crearCampo('Etiquetas (separadas por coma)', inputEtiquetas),
    crearCampo('Duración', inputDuracion),
    crearCampo('Visibilidad', selectVisibilidad),
    crearCampo('Estado', selectEstado),
    crearCampo('Docente asignado', selectDocente)
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const base = {
      id: cursoActual?.id || generarId('CRS'),
      codigo: inputCodigo.value.trim(),
      nombre: inputNombre.value.trim(),
      descripcion: inputDescripcion.value.trim(),
      categoria: inputCategoria.value.trim(),
      etiquetas: inputEtiquetas.value.split(',').map((e) => e.trim()).filter(Boolean),
      duracion: inputDuracion.value.trim(),
      visibilidad: selectVisibilidad.value,
      estado: selectEstado.value,
      fechaCreacion: cursoActual?.fechaCreacion || new Date().toISOString().slice(0, 10),
      docenteId: selectDocente.value,
      estudiantes: cursoActual?.estudiantes || [],
      modulos: cursoActual?.modulos || []
    };

    const errores = validarCamposRequeridos(base, ['codigo', 'nombre', 'categoria', 'docenteId']);
    if (errores.length > 0) {
      mostrarToast(errores.join(' '), 'error');
      return;
    }

    const cursos = Store.getCursos();
    const actualizados = cursoActual
      ? cursos.map((c) => (c.id === cursoActual.id ? base : c))
      : [base, ...cursos];

    Store.saveCursos(actualizados);
    cerrar();
    mostrarToast('Curso guardado correctamente.');
    renderSeccion('cursos');
  });
}

// Abre formulario para crear o editar un módulo dentro de un curso.
function abrirFormularioModulo(cursoId, moduloActual = null) {
  const { form, cerrar } = abrirModal(moduloActual ? 'Editar módulo' : 'Nuevo módulo');

  const inputCodigo = document.createElement('input');
  inputCodigo.value = moduloActual?.codigo || '';

  const inputNombre = document.createElement('input');
  inputNombre.value = moduloActual?.nombre || '';
  inputNombre.required = true;

  const inputDescripcion = document.createElement('textarea');
  inputDescripcion.value = moduloActual?.descripcion || '';

  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Código de módulo', inputCodigo),
    crearCampo('Nombre de módulo', inputNombre),
    crearCampo('Descripción', inputDescripcion)
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!inputNombre.value.trim()) {
      mostrarToast('El nombre del módulo es obligatorio.', 'error');
      return;
    }

    const cursos = Store.getCursos();
    const actualizados = cursos.map((curso) => {
      if (curso.id !== cursoId) return curso;

      const modulos = moduloActual
        ? curso.modulos.map((m) => m.id === moduloActual.id
            ? { ...m, codigo: inputCodigo.value.trim(), nombre: inputNombre.value.trim(), descripcion: inputDescripcion.value.trim() }
            : m)
        : [{ id: generarId('MOD'), codigo: inputCodigo.value.trim(), nombre: inputNombre.value.trim(), descripcion: inputDescripcion.value.trim(), lecciones: [] }, ...curso.modulos];

      return { ...curso, modulos };
    });

    Store.saveCursos(actualizados);
    cerrar();
    mostrarToast('Módulo guardado correctamente.');
    renderSeccion('cursos');
  });
}

// Abre formulario para crear o editar una lección dentro de un módulo.
function abrirFormularioLeccion(cursoId, moduloId, leccionActual = null) {
  const { form, cerrar } = abrirModal(leccionActual ? 'Editar lección' : 'Nueva lección');

  const inputTitulo = document.createElement('input');
  inputTitulo.value = leccionActual?.titulo || '';
  inputTitulo.required = true;

  const inputIntensidad = document.createElement('input');
  inputIntensidad.type = 'number';
  inputIntensidad.min = '0.5';
  inputIntensidad.step = '0.5';
  inputIntensidad.value = leccionActual?.intensidadHoraria || 1;

  const inputContenido = document.createElement('textarea');
  inputContenido.value = leccionActual?.contenido || '';

  // Bloque de multimedia dinámico
  const bloqueMultimedia = document.createElement('div');
  bloqueMultimedia.className = 'bloque-multimedia';

  const labelMultimedia = document.createElement('label');
  labelMultimedia.textContent = 'Recursos multimedia';
  bloqueMultimedia.appendChild(labelMultimedia);

  const listaMultimedia = document.createElement('div');
  listaMultimedia.className = 'lista-multimedia';

  // Carga multimedia existente o una fila vacía si es nueva
  const itemsIniciales = leccionActual?.multimedia?.length
    ? leccionActual.multimedia
    : [];
  itemsIniciales.forEach((item) => listaMultimedia.appendChild(crearLineaMultimedia(item)));
  bloqueMultimedia.appendChild(listaMultimedia);

  const btnAgregarRecurso = document.createElement('button');
  btnAgregarRecurso.className = 'ghost';
  btnAgregarRecurso.type = 'button';
  btnAgregarRecurso.textContent = 'Agregar recurso';
  btnAgregarRecurso.addEventListener('click', () => listaMultimedia.appendChild(crearLineaMultimedia()));
  bloqueMultimedia.appendChild(btnAgregarRecurso);

  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Título', inputTitulo),
    crearCampo('Intensidad horaria (horas)', inputIntensidad),
    crearCampo('Contenido', inputContenido),
    bloqueMultimedia
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!inputTitulo.value.trim()) {
      mostrarToast('El título de la lección es obligatorio.', 'error');
      return;
    }

    // Lee todos los recursos multimedia de la lista
    const multimedia = [...listaMultimedia.querySelectorAll('.linea-multimedia')].map((fila) => ({
      tipo: fila.querySelector('[name="tipo"]').value,
      url: fila.querySelector('[name="url"]').value.trim(),
      nombre: fila.querySelector('[name="nombre"]').value.trim()
    })).filter((m) => m.url); // descarta filas sin URL

    const cursos = Store.getCursos();
    const actualizados = cursos.map((curso) => {
      if (curso.id !== cursoId) return curso;
      const modulos = curso.modulos.map((modulo) => {
        if (modulo.id !== moduloId) return modulo;

        const lecciones = leccionActual
          ? modulo.lecciones.map((lec) => lec.id === leccionActual.id
              ? { ...lec, titulo: inputTitulo.value.trim(), intensidadHoraria: Number(inputIntensidad.value), contenido: inputContenido.value.trim(), multimedia }
              : lec)
          : [{ id: generarId('LEC'), titulo: inputTitulo.value.trim(), intensidadHoraria: Number(inputIntensidad.value), contenido: inputContenido.value.trim(), multimedia }, ...modulo.lecciones];

        return { ...modulo, lecciones };
      });
      return { ...curso, modulos };
    });

    Store.saveCursos(actualizados);
    cerrar();
    mostrarToast('Lección guardada correctamente.');
    renderSeccion('cursos');
  });
}

// Construye el badge de estado sin emojis.
function crearBadgeEstado(estado) {
  const span = document.createElement('span');
  const mapa = {
    activo:    'badge-activo',
    inactivo:  'badge-inactivo',
    pausado:   'badge-pausado',
    archivado: 'badge-archivado'
  };
  span.className = `badge ${mapa[estado] || 'badge-inactivo'}`;
  span.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
  return span;
}

// Renderiza la sección de cursos con tabla, filtros y CRUD anidado.
function renderCursos() {
  const main = document.getElementById('main-content');
  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  // Encabezado
  const headerDiv = document.createElement('div');
  headerDiv.className = 'section-header';
  const h3 = document.createElement('h3');
  h3.textContent = 'Gestión de cursos';
  const btnNuevo = document.createElement('button');
  btnNuevo.className = 'solid';
  btnNuevo.type = 'button';
  btnNuevo.textContent = 'Nuevo curso';
  btnNuevo.addEventListener('click', () => abrirFormularioCurso());
  headerDiv.append(h3, btnNuevo);
  seccion.appendChild(headerDiv);

  // Barra de filtros
  const filtrosBar = document.createElement('div');
  filtrosBar.className = 'filtros-bar';

  const selectEstado = document.createElement('select');
  selectEstado.id = 'filtro-estado';
  [
    { val: '', label: 'Todos los estados' },
    { val: 'activo',    label: 'Activo' },
    { val: 'inactivo',  label: 'Inactivo' },
    { val: 'pausado',   label: 'Pausado' },
    { val: 'archivado', label: 'Archivado' }
  ].forEach(({ val, label }) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    selectEstado.appendChild(opt);
  });
  selectEstado.value = estadoUI.filtrosCursos.estado;

  const inputCategoria = document.createElement('input');
  inputCategoria.id = 'filtro-categoria';
  inputCategoria.type = 'text';
  inputCategoria.placeholder = 'Filtrar por categoría';
  inputCategoria.value = estadoUI.filtrosCursos.categoria;

  const inputFecha = document.createElement('input');
  inputFecha.id = 'filtro-fecha';
  inputFecha.type = 'date';
  inputFecha.value = estadoUI.filtrosCursos.fecha;

  // Actualiza filtros y re-renderiza al cambiar cualquier control
  [selectEstado, inputCategoria, inputFecha].forEach((ctrl) => {
    ctrl.addEventListener('input', () => {
      estadoUI.filtrosCursos.estado = selectEstado.value;
      estadoUI.filtrosCursos.categoria = inputCategoria.value;
      estadoUI.filtrosCursos.fecha = inputFecha.value;
      renderSeccion('cursos');
    });
  });

  filtrosBar.append(selectEstado, inputCategoria, inputFecha);
  seccion.appendChild(filtrosBar);

  // Tabla de cursos
  const tablaWrap = document.createElement('div');
  tablaWrap.className = 'tabla-wrap';

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Código</th>
        <th>Nombre</th>
        <th>Categoría</th>
        <th>Docente</th>
        <th>Estado</th>
        <th>Fecha</th>
        <th>Visibilidad</th>
        <th>Acciones</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  const cursos = filtrarCursos(Store.getCursos());

  cursos.forEach((curso) => {
    // Fila principal del curso
    const tr = document.createElement('tr');

    const celdas = [
      curso.codigo,
      curso.nombre,
      curso.categoria,
      obtenerNombreDocente(curso.docenteId),
      null, // badge de estado — se inserta aparte
      curso.fechaCreacion,
      curso.visibilidad
    ];

    celdas.forEach((val, i) => {
      const td = document.createElement('td');
      if (i === 4) {
        td.appendChild(crearBadgeEstado(curso.estado));
      } else {
        td.textContent = escaparHTML(val || '');
      }
      tr.appendChild(td);
    });

    // Celda de acciones
    const tdAcciones = document.createElement('td');
    const accDiv = document.createElement('div');
    accDiv.className = 'actions-btns';

    const btnExpandir = document.createElement('button');
    btnExpandir.className = 'ghost';
    btnExpandir.type = 'button';
    btnExpandir.textContent = estadoUI.cursoExpandidoId === curso.id ? 'Ocultar' : 'Ver módulos';
    btnExpandir.addEventListener('click', () => {
      estadoUI.cursoExpandidoId = estadoUI.cursoExpandidoId === curso.id ? null : curso.id;
      renderSeccion('cursos');
    });

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-edit';
    btnEditar.type = 'button';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirFormularioCurso(curso));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-delete';
    btnEliminar.type = 'button';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => {
      confirmarEliminacion(`¿Eliminar el curso "${curso.nombre}"?`, () => {
        Store.saveCursos(Store.getCursos().filter((c) => c.id !== curso.id));
        mostrarToast('Curso eliminado.');
        renderSeccion('cursos');
      });
    });

    accDiv.append(btnExpandir, btnEditar, btnEliminar);
    tdAcciones.appendChild(accDiv);
    tr.appendChild(tdAcciones);
    tbody.appendChild(tr);

    // Fila de detalle expandido — módulos y lecciones
    if (estadoUI.cursoExpandidoId === curso.id) {
      const trDetalle = document.createElement('tr');
      trDetalle.className = 'fila-detalle';
      const tdDetalle = document.createElement('td');
      tdDetalle.colSpan = 8;

      const tarjeta = document.createElement('article');
      tarjeta.className = 'course-admin-card';

      // Cabecera de la tarjeta expandida
      const infoDiv = document.createElement('div');
      infoDiv.className = 'course-main-info';

      const textoDiv = document.createElement('div');
      textoDiv.className = 'course-text';

      const spanCodigo = document.createElement('span');
      spanCodigo.className = 'course-code';
      spanCodigo.textContent = curso.codigo;

      const h4 = document.createElement('h4');
      h4.textContent = escaparHTML(curso.nombre);

      const pDocente = document.createElement('p');
      pDocente.innerHTML = `Docente: <strong>${escaparHTML(obtenerNombreDocente(curso.docenteId))}</strong>`;

      const pDesc = document.createElement('p');
      pDesc.textContent = escaparHTML(curso.descripcion);

      textoDiv.append(spanCodigo, h4, pDocente, pDesc);

      // Etiquetas
      const etiquetasDiv = document.createElement('div');
      etiquetasDiv.className = 'course-actions';
      curso.etiquetas.forEach((et) => {
        const pill = document.createElement('span');
        pill.className = 'pill';
        pill.textContent = escaparHTML(et);
        etiquetasDiv.appendChild(pill);
      });

      infoDiv.append(textoDiv, etiquetasDiv);
      tarjeta.appendChild(infoDiv);

      // Sección de módulos con su CRUD
      const detalleDiv = document.createElement('div');
      detalleDiv.className = 'course-details-preview';

      const modulosHeader = document.createElement('div');
      modulosHeader.className = 'section-header';
      const h5 = document.createElement('h5');
      h5.textContent = 'Módulos y lecciones';
      const btnNuevoMod = document.createElement('button');
      btnNuevoMod.className = 'solid';
      btnNuevoMod.type = 'button';
      btnNuevoMod.textContent = 'Nuevo módulo';
      btnNuevoMod.addEventListener('click', () => abrirFormularioModulo(curso.id));
      modulosHeader.append(h5, btnNuevoMod);
      detalleDiv.appendChild(modulosHeader);

      const listaModulos = document.createElement('div');
      listaModulos.className = 'lista-modulos';

      curso.modulos.forEach((modulo) => {
        const moduloDiv = document.createElement('div');
        moduloDiv.className = 'module-item';

        const modHeader = document.createElement('div');
        modHeader.className = 'section-header';

        const h6 = document.createElement('h6');
        h6.textContent = `${escaparHTML(modulo.codigo)} - ${escaparHTML(modulo.nombre)}`;

        const modAcciones = document.createElement('div');
        modAcciones.className = 'course-actions';

        const btnEditarMod = document.createElement('button');
        btnEditarMod.className = 'btn-edit';
        btnEditarMod.type = 'button';
        btnEditarMod.textContent = 'Editar módulo';
        btnEditarMod.addEventListener('click', () => abrirFormularioModulo(curso.id, modulo));

        const btnEliminarMod = document.createElement('button');
        btnEliminarMod.className = 'btn-delete';
        btnEliminarMod.type = 'button';
        btnEliminarMod.textContent = 'Eliminar módulo';
        btnEliminarMod.addEventListener('click', () => {
          confirmarEliminacion(`¿Eliminar el módulo "${modulo.nombre}"?`, () => {
            const actualizados = Store.getCursos().map((c) =>
              c.id !== curso.id ? c : { ...c, modulos: c.modulos.filter((m) => m.id !== modulo.id) }
            );
            Store.saveCursos(actualizados);
            mostrarToast('Módulo eliminado.');
            renderSeccion('cursos');
          });
        });

        const btnNuevaLec = document.createElement('button');
        btnNuevaLec.className = 'solid';
        btnNuevaLec.type = 'button';
        btnNuevaLec.textContent = 'Nueva lección';
        btnNuevaLec.addEventListener('click', () => abrirFormularioLeccion(curso.id, modulo.id));

        modAcciones.append(btnEditarMod, btnEliminarMod, btnNuevaLec);
        modHeader.append(h6, modAcciones);

        const pDescMod = document.createElement('p');
        pDescMod.textContent = escaparHTML(modulo.descripcion);

        // Lista de lecciones del módulo
        const ulLecciones = document.createElement('ul');
        ulLecciones.className = 'lesson-list';

        modulo.lecciones.forEach((leccion) => {
          const li = document.createElement('li');

          const lecHeader = document.createElement('div');
          lecHeader.className = 'leccion-header';

          const strong = document.createElement('strong');
          strong.textContent = `${escaparHTML(leccion.titulo)} (${leccion.intensidadHoraria}h)`;

          const pContenido = document.createElement('p');
          pContenido.className = 'leccion-contenido';
          pContenido.textContent = escaparHTML(leccion.contenido);

          // Recursos multimedia de la lección
          const multimedia = leccion.multimedia || [];
          let smallMultimedia = null;
          if (multimedia.length > 0) {
            smallMultimedia = document.createElement('small');
            smallMultimedia.className = 'multimedia-lista';
            smallMultimedia.textContent = multimedia.map((m) => `${m.tipo}: ${m.nombre}`).join(' | ');
          }

          const lecAcciones = document.createElement('div');
          lecAcciones.className = 'course-actions';

          const btnEditarLec = document.createElement('button');
          btnEditarLec.className = 'btn-edit';
          btnEditarLec.type = 'button';
          btnEditarLec.textContent = 'Editar lección';
          btnEditarLec.addEventListener('click', () => abrirFormularioLeccion(curso.id, modulo.id, leccion));

          const btnEliminarLec = document.createElement('button');
          btnEliminarLec.className = 'btn-delete';
          btnEliminarLec.type = 'button';
          btnEliminarLec.textContent = 'Eliminar lección';
          btnEliminarLec.addEventListener('click', () => {
            confirmarEliminacion(`¿Eliminar la lección "${leccion.titulo}"?`, () => {
              const actualizados = Store.getCursos().map((c) => {
                if (c.id !== curso.id) return c;
                return {
                  ...c,
                  modulos: c.modulos.map((m) => {
                    if (m.id !== modulo.id) return m;
                    return { ...m, lecciones: m.lecciones.filter((l) => l.id !== leccion.id) };
                  })
                };
              });
              Store.saveCursos(actualizados);
              mostrarToast('Lección eliminada.');
              renderSeccion('cursos');
            });
          });

          lecAcciones.append(btnEditarLec, btnEliminarLec);
          lecHeader.append(strong, lecAcciones);
          li.appendChild(lecHeader);
          li.appendChild(pContenido);
          if (smallMultimedia) li.appendChild(smallMultimedia);
          ulLecciones.appendChild(li);
        });

        moduloDiv.append(modHeader, pDescMod, ulLecciones);
        listaModulos.appendChild(moduloDiv);
      });

      detalleDiv.appendChild(listaModulos);
      tarjeta.appendChild(detalleDiv);
      tdDetalle.appendChild(tarjeta);
      trDetalle.appendChild(tdDetalle);
      tbody.appendChild(trDetalle);
    }
  });

  tabla.appendChild(tbody);
  tablaWrap.appendChild(tabla);
  seccion.appendChild(tablaWrap);
  main.appendChild(seccion);
}
