/**
 * DOCENTE UI - Interfaz del panel de docentes.
 * Vista de sus cursos, edición de perfil, módulos y lecciones.
 */

// Abre modal para editar el perfil del docente activo en sesión.
/**
 * DOCENTE UI - Interfaz del panel de docentes.
 * Vista de sus cursos, edición de perfil, módulos y lecciones.
 */

// ── Imagen de curso con fallback ─────────────────────────────────────────────
function emojiCategoriaDocente(categoria = '') {
  const cat = categoria.toLowerCase();
  if (cat.includes('inform') || cat.includes('progr') || cat.includes('tecn')) return '💻';
  if (cat.includes('idiom') || cat.includes('ingl') || cat.includes('leng')) return '🗣️';
  if (cat.includes('matem') || cat.includes('cienc')) return '🔬';
  if (cat.includes('negoc') || cat.includes('admin')) return '📊';
  return '📚';
}

function crearImagenCursoDocente(curso) {
  const wrap = document.createElement('div');
  wrap.className = 'course-img-wrap';

  if (curso.iconUrl) {
    const img = document.createElement('img');
    img.className = 'course-img';
    img.src = curso.iconUrl;
    img.alt = curso.nombre;
    img.onerror = () => {
      const ph = document.createElement('div');
      ph.className = 'course-img-placeholder';
      ph.textContent = emojiCategoriaDocente(curso.categoria);
      img.replaceWith(ph);
    };
    wrap.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'course-img-placeholder';
    ph.textContent = emojiCategoriaDocente(curso.categoria);
    wrap.appendChild(ph);
  }
  return wrap;
}

// ── Perfil ───────────────────────────────────────────────────────────────────
function abrirFormularioPerfil() {
  const sesion = Store.getSession();
  const { form, cerrar } = abrirModal('Editar mi perfil');

  const inputNombres = document.createElement('input');
  inputNombres.type = 'text';
  inputNombres.value = sesion.nombres || '';
  inputNombres.required = true;

  const inputApellidos = document.createElement('input');
  inputApellidos.type = 'text';
  inputApellidos.value = sesion.apellidos || '';
  inputApellidos.required = true;

  const inputEmail = document.createElement('input');
  inputEmail.type = 'email';
  inputEmail.value = sesion.email || '';
  inputEmail.required = true;

  const inputArea = document.createElement('input');
  inputArea.type = 'text';
  inputArea.value = sesion.areaAcademica || '';

  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Nombres', inputNombres),
    crearCampo('Apellidos', inputApellidos),
    crearCampo('Email', inputEmail),
    crearCampo('Área académica', inputArea)
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const errores = validarCamposRequeridos(
      { nombres: inputNombres.value, apellidos: inputApellidos.value, email: inputEmail.value },
      ['nombres', 'apellidos', 'email']
    );
    if (errores.length > 0) { mostrarToast(errores[0], 'error'); return; }

    const actualizados = Store.getDocentes().map((d) => {
      if (d.id !== sesion.id) return d;
      return { ...d, nombres: inputNombres.value, apellidos: inputApellidos.value, email: inputEmail.value, areaAcademica: inputArea.value };
    });
    Store.saveDocentes(actualizados);
    Store.saveSession({ ...sesion, nombres: inputNombres.value, apellidos: inputApellidos.value, email: inputEmail.value, areaAcademica: inputArea.value });
    mostrarToast('Perfil actualizado correctamente.');
    cerrar();
    renderPanelSesion();
  });
}

// ── Módulo del docente ───────────────────────────────────────────────────────
function abrirFormularioModuloDocente(cursoId, moduloActual = null) {
  const { form, cerrar } = abrirModal(moduloActual ? 'Editar módulo' : 'Nuevo módulo');

  const inputNombre = document.createElement('input');
  inputNombre.type = 'text';
  inputNombre.value = moduloActual?.nombre || '';
  inputNombre.required = true;

  const inputDescripcion = document.createElement('textarea');
  inputDescripcion.value = moduloActual?.descripcion || '';

  const acciones = form.querySelector('.modal-actions');
  acciones.before(crearCampo('Nombre', inputNombre), crearCampo('Descripción', inputDescripcion));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!inputNombre.value.trim()) { mostrarToast('El nombre del módulo es obligatorio.', 'error'); return; }

    const cursos = Store.getCursos();
    const actualizados = cursos.map((curso) => {
      if (curso.id !== cursoId) return curso;
      const modulos = moduloActual
        ? curso.modulos.map((m) => m.id === moduloActual.id
            ? { ...m, nombre: inputNombre.value.trim(), descripcion: inputDescripcion.value.trim() }
            : m)
        : [...curso.modulos, { id: `MOD-${Date.now()}`, nombre: inputNombre.value.trim(), descripcion: inputDescripcion.value.trim(), lecciones: [] }];
      return { ...curso, modulos };
    });

    Store.saveCursos(actualizados);
    mostrarToast(moduloActual ? 'Módulo actualizado.' : 'Módulo creado.');
    cerrar();
    renderMisCursos();
  });
}

// ── Lección del docente ──────────────────────────────────────────────────────
function abrirFormularioLeccionDocente(cursoId, moduloId, leccionActual = null) {
  const { form, cerrar } = abrirModal(leccionActual ? 'Editar lección' : 'Nueva lección');

  const inputTitulo = document.createElement('input');
  inputTitulo.type = 'text';
  inputTitulo.value = leccionActual?.titulo || '';
  inputTitulo.required = true;

  const inputIntensidad = document.createElement('input');
  inputIntensidad.type = 'number';
  inputIntensidad.min = '0.5';
  inputIntensidad.step = '0.5';
  inputIntensidad.value = leccionActual?.intensidadHoraria || '';

  const textareaContenido = document.createElement('textarea');
  textareaContenido.value = leccionActual?.contenido || '';

  const acciones = form.querySelector('.modal-actions');
  acciones.before(
    crearCampo('Título', inputTitulo),
    crearCampo('Intensidad horaria (horas)', inputIntensidad),
    crearCampo('Contenido', textareaContenido)
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!inputTitulo.value.trim()) { mostrarToast('El título es obligatorio.', 'error'); return; }

    const cursos = Store.getCursos();
    const actualizados = cursos.map((curso) => {
      if (curso.id !== cursoId) return curso;
      const modulos = curso.modulos.map((modulo) => {
        if (modulo.id !== moduloId) return modulo;
        const lecciones = leccionActual
          ? modulo.lecciones.map((l) => l.id === leccionActual.id
              ? { ...l, titulo: inputTitulo.value.trim(), intensidadHoraria: parseFloat(inputIntensidad.value), contenido: textareaContenido.value.trim() }
              : l)
          : [...modulo.lecciones, { id: `LEC-${Date.now()}`, titulo: inputTitulo.value.trim(), intensidadHoraria: parseFloat(inputIntensidad.value), contenido: textareaContenido.value.trim(), multimedia: [] }];
        return { ...modulo, lecciones };
      });
      return { ...curso, modulos };
    });

    Store.saveCursos(actualizados);
    mostrarToast(leccionActual ? 'Lección actualizada.' : 'Lección creada.');
    cerrar();
    renderMisCursos();
  });
}

// ── Mis Cursos ───────────────────────────────────────────────────────────────
function renderMisCursos() {
  const sesion    = Store.getSession();
  const misCursos = Store.getCursos().filter((c) => c.docenteId === sesion.id);
  const main      = document.getElementById('main-content');
  main.innerHTML  = '';

  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'section-header';
  const h3 = document.createElement('h3');
  h3.textContent = `Mis cursos (${misCursos.length})`;
  headerDiv.appendChild(h3);
  seccion.appendChild(headerDiv);

  if (misCursos.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No tienes cursos asignados.';
    seccion.appendChild(p);
    main.appendChild(seccion);
    return;
  }

  misCursos.forEach((curso) => {
    const totalLecciones = curso.modulos.reduce((s, m) => s + m.lecciones.length, 0);
    const expandido = estadoDocenteUI.cursosExpandidosIds.includes(curso.id);

    const card = document.createElement('article');
    card.className = 'course-admin-card';

    // ── Cabecera con imagen ──
    const infoDiv = document.createElement('div');
    infoDiv.className = 'course-main-info';

    infoDiv.appendChild(crearImagenCursoDocente(curso));

    const textoDiv = document.createElement('div');
    textoDiv.className = 'course-text';

    const spanCodigo = document.createElement('span');
    spanCodigo.className = 'course-code';
    spanCodigo.textContent = curso.codigo;

    const h4 = document.createElement('h4');
    h4.textContent = escaparHTML(curso.nombre);

    const pDesc = document.createElement('p');
    pDesc.textContent = escaparHTML(curso.descripcion);

    const pStats = document.createElement('p');
    pStats.className = 'curso-stats';
    pStats.innerHTML = `📂 ${curso.modulos.length} módulos &nbsp;·&nbsp; 📝 ${totalLecciones} lecciones &nbsp;·&nbsp; 🎓 ${typeof curso.estudiantes === 'number' ? curso.estudiantes : 0} estudiantes &nbsp;·&nbsp; ⏱ ${escaparHTML(curso.duracion || '')}`;

    textoDiv.append(spanCodigo, h4, pDesc, pStats);

    const btnExpandir = document.createElement('button');
    btnExpandir.className = 'btn-edit';
    btnExpandir.type = 'button';
    btnExpandir.textContent = expandido ? 'Ocultar contenido' : 'Ver contenido';
    btnExpandir.addEventListener('click', () => {
      const idx = estadoDocenteUI.cursosExpandidosIds.indexOf(curso.id);
      if (idx > -1) estadoDocenteUI.cursosExpandidosIds.splice(idx, 1);
      else estadoDocenteUI.cursosExpandidosIds.push(curso.id);
      renderMisCursos();
    });

    const accionesDiv = document.createElement('div');
    accionesDiv.className = 'course-actions';
    accionesDiv.appendChild(btnExpandir);

    infoDiv.append(textoDiv, accionesDiv);
    card.appendChild(infoDiv);

    // ── Detalle expandido ──
    if (expandido) {
      const detalle = document.createElement('div');
      detalle.className = 'course-details-preview';

      const modulosHeader = document.createElement('div');
      modulosHeader.className = 'section-header';
      const h5 = document.createElement('h5');
      h5.textContent = 'Módulos y lecciones';
      const btnNuevoMod = document.createElement('button');
      btnNuevoMod.className = 'solid';
      btnNuevoMod.type = 'button';
      btnNuevoMod.textContent = 'Nuevo módulo';
      btnNuevoMod.addEventListener('click', () => abrirFormularioModuloDocente(curso.id));
      modulosHeader.append(h5, btnNuevoMod);
      detalle.appendChild(modulosHeader);

      curso.modulos.forEach((modulo) => {
        const moduloDiv = document.createElement('div');
        moduloDiv.className = 'module-item';

        const modHeader = document.createElement('div');
        modHeader.className = 'section-header';

        const h6 = document.createElement('h6');
        h6.textContent = escaparHTML(modulo.nombre);

        const btnEditarMod = document.createElement('button');
        btnEditarMod.className = 'btn-edit';
        btnEditarMod.type = 'button';
        btnEditarMod.textContent = 'Editar módulo';
        btnEditarMod.addEventListener('click', () => abrirFormularioModuloDocente(curso.id, modulo));

        modHeader.append(h6, btnEditarMod);

        const pDescMod = document.createElement('p');
        pDescMod.textContent = escaparHTML(modulo.descripcion);

        const ul = document.createElement('ul');
        ul.className = 'lesson-list';

        modulo.lecciones.forEach((leccion) => {
          const li = document.createElement('li');
          const lecHeader = document.createElement('div');
          lecHeader.className = 'leccion-header';
          const spanTitulo = document.createElement('span');
          spanTitulo.textContent = `${escaparHTML(leccion.titulo)} (${leccion.intensidadHoraria}h)`;
          const pContenido = document.createElement('p');
          pContenido.className = 'leccion-contenido';
          pContenido.textContent = escaparHTML(leccion.contenido);
          const btnEditarLec = document.createElement('button');
          btnEditarLec.className = 'btn-edit';
          btnEditarLec.type = 'button';
          btnEditarLec.textContent = 'Editar';
          btnEditarLec.addEventListener('click', () => abrirFormularioLeccionDocente(curso.id, modulo.id, leccion));
          lecHeader.append(spanTitulo, btnEditarLec);
          li.append(lecHeader, pContenido);
          ul.appendChild(li);
        });

        const btnNuevaLec = document.createElement('button');
        btnNuevaLec.className = 'solid';
        btnNuevaLec.type = 'button';
        btnNuevaLec.textContent = 'Nueva lección';
        btnNuevaLec.addEventListener('click', () => abrirFormularioLeccionDocente(curso.id, modulo.id));

        moduloDiv.append(modHeader, pDescMod, ul, btnNuevaLec);
        detalle.appendChild(moduloDiv);
      });

      card.appendChild(detalle);
    }

    seccion.appendChild(card);
  });

  main.appendChild(seccion);
}

// ── Todos los cursos (solo lectura) ──────────────────────────────────────────
function renderTodosLosCursos() {
  const cursos = Store.getCursos();
  const main   = document.getElementById('main-content');
  main.innerHTML = '';

  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'section-header';
  const h3 = document.createElement('h3');
  h3.textContent = `Todos los cursos (${cursos.length})`;
  headerDiv.appendChild(h3);
  seccion.appendChild(headerDiv);

  const tablaWrap = document.createElement('div');
  tablaWrap.className = 'tabla-wrap';

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Imagen</th>
        <th>Código</th>
        <th>Nombre</th>
        <th>Categoría</th>
        <th>Docente</th>
        <th>Estado</th>
        <th>Módulos</th>
        <th>Lecciones</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  cursos.forEach((curso) => {
    const docente = Store.getDocentes().find((d) => d.id === curso.docenteId);
    const nombreDocente = docente ? `${docente.nombres} ${docente.apellidos}` : 'Sin asignar';
    const totalLecciones = curso.modulos.reduce((s, m) => s + m.lecciones.length, 0);

    const tr = document.createElement('tr');

    // Imagen
    const tdImg = document.createElement('td');
    tdImg.appendChild(crearImagenCursoDocente(curso));
    tr.appendChild(tdImg);

    [curso.codigo, curso.nombre, curso.categoria, nombreDocente, curso.estado,
     String(curso.modulos.length), String(totalLecciones)].forEach((val) => {
      const td = document.createElement('td');
      td.textContent = escaparHTML(val);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
  tablaWrap.appendChild(tabla);
  seccion.appendChild(tablaWrap);
  main.appendChild(seccion);
}

// ── Docentes (solo lectura) ──────────────────────────────────────────────────
function renderDocentesDocente() {
  const docentes = Store.getDocentes();
  const sesion   = Store.getSession();
  const main     = document.getElementById('main-content');
  main.innerHTML = '';

  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'section-header';
  const h3 = document.createElement('h3');
  h3.textContent = `Docentes (${docentes.length})`;
  headerDiv.appendChild(h3);
  seccion.appendChild(headerDiv);

  const tablaWrap = document.createElement('div');
  tablaWrap.className = 'tabla-wrap';

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Nombres</th><th>Apellidos</th><th>Email</th><th>Área Académica</th><th>Cursos asignados</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  docentes.forEach((docente) => {
    const cursosAsignados = Store.getCursos().filter((c) => c.docenteId === docente.id).length;
    const esTu = sesion.id === docente.id ? ' (Tú)' : '';
    const tr = document.createElement('tr');
    [docente.nombres + esTu, docente.apellidos, docente.email, docente.areaAcademica || '-', String(cursosAsignados)].forEach((val) => {
      const td = document.createElement('td');
      td.textContent = escaparHTML(val);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
  tablaWrap.appendChild(tabla);
  seccion.appendChild(tablaWrap);
  main.appendChild(seccion);
}