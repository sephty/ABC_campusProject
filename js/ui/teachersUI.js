/**
 * TEACHERS UI - Gestión de docentes en el panel administrativo.
 * CRUD completo con foto, carga académica y restricción de eliminación.
 */


// Abre formulario modal para crear o editar un docente.

// Construye el panel de carga académica de un docente con sus cursos, módulos y lecciones.
function crearPanelCargaAcademica(docenteId) {
  const box = document.createElement('div');
  box.className = 'carga-box content-section seccion-fade';

  const cursosDocente = Store.getCursos().filter((c) => c.docenteId === docenteId);

  if (!cursosDocente.length) {
    const p = document.createElement('p');
    p.textContent = 'Este docente no tiene cursos asignados.';
    box.appendChild(p);
    return box;
  }

  cursosDocente.forEach((curso) => {
    const item = document.createElement('article');
    item.className = 'course-admin-card';

    const info = document.createElement('div');
    info.className = 'course-main-info';

    const texto = document.createElement('div');
    texto.className = 'course-text';

    const codigo = document.createElement('span');
    codigo.className = 'course-code';
    codigo.textContent = curso.codigo;

    const nombre = document.createElement('h4');
    nombre.textContent = escaparHTML(curso.nombre);

    const desc = document.createElement('p');
    desc.textContent = escaparHTML(curso.descripcion);

    texto.append(codigo, nombre, desc);
    info.appendChild(texto);
    item.appendChild(info);

    // Lista módulos y cantidad de lecciones por módulo
    const detalle = document.createElement('div');
    detalle.className = 'course-details-preview';

    const h5 = document.createElement('h5');
    h5.textContent = 'Módulos';
    detalle.appendChild(h5);

    curso.modulos.forEach((mod) => {
      const modDiv = document.createElement('div');
      modDiv.className = 'module-item';
      modDiv.innerHTML = `
        <h6>${escaparHTML(mod.codigo)} - ${escaparHTML(mod.nombre)}</h6>
        <p>${escaparHTML(mod.descripcion)}</p>
        <small>${mod.lecciones.length} lección(es)</small>
      `;
      detalle.appendChild(modDiv);
    });

    item.appendChild(detalle);
    box.appendChild(item);
  });

  return box;
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
      // Alterna el panel: si ya está abierto para este docente, lo cierra
      estadoUI.docenteCargaId = estadoUI.docenteCargaId === docente.id ? null : docente.id;
      renderSeccion('docentes');
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

  // Panel de carga académica — se muestra debajo de la tabla si hay uno seleccionado
  if (estadoUI.docenteCargaId) {
    const docente = Store.getDocentes().find((d) => d.id === estadoUI.docenteCargaId);
    if (docente) {
      const panelHeader = document.createElement('div');
      panelHeader.className = 'section-header';
      panelHeader.innerHTML = `<h4>Carga académica: ${escaparHTML(docente.nombres)} ${escaparHTML(docente.apellidos)}</h4>`;
      seccion.appendChild(panelHeader);
      seccion.appendChild(crearPanelCargaAcademica(estadoUI.docenteCargaId));
    }
  }

  main.appendChild(seccion);
}
