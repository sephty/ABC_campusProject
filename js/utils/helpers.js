// Estado global UI compartido entre los módulos del panel administrativo.
const estadoUI = {
  seccionActual: 'dashboard',
  cursoExpandidoId: null,
  docenteCargaId: null,
  filtrosCursos: {
    estado: '',
    categoria: '',
    fecha: ''
  }
};

// Aplica el tema guardado en localStorage al iniciar la página.
function aplicarTemaInicial() {
  document.documentElement.setAttribute('data-theme', Store.getTema());
}

// Genera un id único con prefijo para entidades nuevas.
function generarId(prefijo) {
  return `${prefijo}-${Date.now().toString()}`;
}

// Muestra un toast de notificación breve. Se elimina automáticamente en 2.6s.
function mostrarToast(mensaje, tipo = 'ok') {
  const root = document.getElementById('toast-root');
  const toast = document.createElement('div');
  toast.className = `toast-item ${tipo === 'error' ? 'toast-error' : 'toast-ok'}`;
  toast.textContent = mensaje;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

// Escapa caracteres especiales HTML para prevenir XSS en textos renderizados.
function escaparHTML(texto) {
  if (!texto) return '';
  const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto).replace(/[&<>"']/g, (c) => mapa[c]);
}

// Retorna el nombre completo de un docente por su id. Si no existe, retorna 'Sin asignar'.
function obtenerNombreDocente(docenteId) {
  const docente = Store.getDocentes().find((d) => d.id === docenteId);
  if (!docente) return 'Sin asignar';
  return `${docente.nombres} ${docente.apellidos}`;
}

// Crea un div con las iniciales del nombre y apellido para usar como avatar de fallback.
function crearAvatarIniciales(persona) {
  const div = document.createElement('div');
  div.className = 'session-avatar avatar-iniciales';
  const inicial1 = (persona.nombres || '?').charAt(0).toUpperCase();
  const inicial2 = (persona.apellidos || '').charAt(0).toUpperCase();
  div.textContent = inicial1 + inicial2;
  return div;
}

// Marca como activo el enlace del sidebar que corresponde a la sección actual.
function actualizarNavegacionActiva(nombreSeccion) {
  document.querySelectorAll('.sidebar-nav a[data-section]').forEach((enlace) => {
    enlace.classList.toggle('active', enlace.dataset.section === nombreSeccion);
  });
}

// Cierra el sidebar en dispositivos móviles al seleccionar una sección.
function cerrarSidebarMobile() {
  if (window.innerWidth < 768) {
    document.body.classList.remove('sidebar-open');
  }
}

// Construye y renderiza el panel de sesión con datos del usuario activo.
function renderPanelSesion() {
  const panel = document.getElementById('session-panel');
  const sesion = Store.getSession();
  if (!sesion) return;

  panel.innerHTML = '';

  const infoDiv = document.createElement('div');
  infoDiv.className = 'session-info';

  // Avatar: foto si existe, iniciales si no
  if (sesion.avatarUrl || sesion.fotoUrl) {
    const img = document.createElement('img');
    img.className = 'session-avatar-img';
    img.src = sesion.avatarUrl || sesion.fotoUrl;
    img.alt = sesion.nombres;
    img.onerror = () => img.replaceWith(crearAvatarIniciales(sesion));
    infoDiv.appendChild(img);
  } else {
    infoDiv.appendChild(crearAvatarIniciales(sesion));
  }

  const nombre = document.createElement('h4');
  nombre.textContent = `${escaparHTML(sesion.nombres)} ${escaparHTML(sesion.apellidos)}`;

  const email = document.createElement('p');
  email.textContent = escaparHTML(sesion.email);

  const rol = document.createElement('p');
  rol.textContent = escaparHTML(sesion.cargo || sesion.areaAcademica || '');

  infoDiv.appendChild(nombre);
  infoDiv.appendChild(email);
  infoDiv.appendChild(rol);

  const btnSalir = document.createElement('button');
  btnSalir.className = 'solid';
  btnSalir.type = 'button';
  btnSalir.textContent = 'Cerrar sesión';
  btnSalir.style.cssText = 'width:100%;margin-top:12px;';
  btnSalir.addEventListener('click', () => {
    Store.clearSession();
    window.location.href = 'index.html';
  });

  panel.appendChild(infoDiv);
  panel.appendChild(btnSalir);
}

// Crea un campo de formulario envolviendo una etiqueta y un input.
function crearCampo(label, input) {
  const wrap = document.createElement('div');
  wrap.className = 'campo-form';
  const lab = document.createElement('label');
  lab.textContent = label;
  wrap.appendChild(lab);
  wrap.appendChild(input);
  return wrap;
}

// Filtra la lista de cursos según los filtros activos en estadoUI.
function filtrarCursos(cursos) {
  return cursos.filter((curso) => {
    const okEstado = !estadoUI.filtrosCursos.estado || curso.estado === estadoUI.filtrosCursos.estado;
    const okCategoria = !estadoUI.filtrosCursos.categoria ||
      curso.categoria.toLowerCase().includes(estadoUI.filtrosCursos.categoria.toLowerCase());
    const okFecha = !estadoUI.filtrosCursos.fecha || curso.fechaCreacion === estadoUI.filtrosCursos.fecha;
    return okEstado && okCategoria && okFecha;
  });
}

// Muestra un modal de confirmación antes de ejecutar una acción destructiva.
function confirmarEliminacion(mensaje, onAceptar) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const h3 = document.createElement('h3');
  h3.textContent = 'Confirmar eliminación';

  const p = document.createElement('p');
  p.textContent = mensaje;

  const acciones = document.createElement('div');
  acciones.className = 'modal-actions';

  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'ghost';
  btnCancelar.type = 'button';
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.addEventListener('click', () => backdrop.remove());

  const btnAceptar = document.createElement('button');
  btnAceptar.className = 'solid';
  btnAceptar.type = 'button';
  btnAceptar.textContent = 'Eliminar';
  btnAceptar.addEventListener('click', () => {
    onAceptar();
    backdrop.remove();
  });

  acciones.append(btnCancelar, btnAceptar);
  modal.append(h3, p, acciones);
  backdrop.appendChild(modal);
  document.getElementById('modal-root').appendChild(backdrop);
}

// Renderiza el dashboard principal con estadísticas en tiempo real y accesos rápidos.
function renderDashboard() {
  const main = document.getElementById('main-content');
  const cursos = Store.getCursos();
  const cursosActivos = cursos.filter((c) => c.estado === 'activo').length;
  const totalDocentes = Store.getDocentes().length;
  const totalAdmins = Store.getAdmins().length;
  const totalModulos = cursos.reduce((s, c) => s + (c.modulos?.length || 0), 0);
  const totalLecciones = cursos.reduce((s, c) =>
    s + c.modulos.reduce((sm, m) => sm + (m.lecciones?.length || 0), 0), 0);

  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  // Encabezado
  const header = document.createElement('div');
  header.className = 'section-header';
  const h3 = document.createElement('h3');
  h3.textContent = 'Panel de Control';
  header.appendChild(h3);
  seccion.appendChild(header);

  // Grid de estadísticas
  const grid = document.createElement('div');
  grid.className = 'stats-grid';
  const stats = [
    { label: 'Cursos activos',       valor: cursosActivos },
    { label: 'Total docentes',        valor: totalDocentes },
    { label: 'Administrativos',       valor: totalAdmins },
    { label: 'Módulos en sistema',    valor: totalModulos },
    { label: 'Lecciones en sistema',  valor: totalLecciones }
  ];
  stats.forEach(({ label, valor }) => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `<h3>${label}</h3><p class="stat-number">${valor}</p>`;
    grid.appendChild(card);
  });
  seccion.appendChild(grid);

  // Accesos rápidos
  const quickWrap = document.createElement('div');
  quickWrap.className = 'quick-actions';
  const titulo = document.createElement('h4');
  titulo.textContent = 'Accesos rápidos';
  quickWrap.appendChild(titulo);

  const acciones = [
    { texto: 'Gestionar cursos',          seccion: 'cursos' },
    { texto: 'Gestionar docentes',         seccion: 'docentes' },
    { texto: 'Gestionar administrativos',  seccion: 'admins' }
  ];
  acciones.forEach(({ texto, seccion: s }) => {
    const btn = document.createElement('button');
    btn.className = 'solid';
    btn.type = 'button';
    btn.textContent = texto;
    btn.addEventListener('click', () => renderSeccion(s));
    quickWrap.appendChild(btn);
  });
  seccion.appendChild(quickWrap);

  main.appendChild(seccion);
}
