// Estado global UI compartido entre los módulos del panel administrativo.
const estadoUI = {
  seccionActual: 'dashboard',
  cursoExpandidoId: null,
  docenteCargaId: null,
  filtrosCursos: { estado: '', categoria: '', fecha: '' }
};

function aplicarTemaInicial() {
  document.documentElement.setAttribute('data-theme', Store.getTema());
}

function generarId(prefijo) {
  return `${prefijo}-${Date.now().toString()}`;
}

function mostrarToast(mensaje, tipo = 'ok') {
  const root = document.getElementById('toast-root');
  const toast = document.createElement('div');
  toast.className = `toast-item ${tipo === 'error' ? 'toast-error' : 'toast-ok'}`;
  toast.textContent = mensaje;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function escaparHTML(texto) {
  if (!texto) return '';
  const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto).replace(/[&<>"']/g, (c) => mapa[c]);
}

function obtenerNombreDocente(docenteId) {
  const docente = Store.getDocentes().find((d) => d.id === docenteId);
  if (!docente) return 'Sin asignar';
  return `${docente.nombres} ${docente.apellidos}`;
}

function crearAvatarIniciales(persona) {
  const div = document.createElement('div');
  div.className = 'session-avatar avatar-iniciales';
  const i1 = (persona.nombres || '?').charAt(0).toUpperCase();
  const i2 = (persona.apellidos || '').charAt(0).toUpperCase();
  div.textContent = i1 + i2;
  return div;
}

function actualizarNavegacionActiva(nombreSeccion) {
  document.querySelectorAll('.sidebar-nav a[data-section]').forEach((enlace) => {
    enlace.classList.toggle('active', enlace.dataset.section === nombreSeccion);
  });
}

function cerrarSidebarMobile() {
  if (window.innerWidth < 768) document.body.classList.remove('sidebar-open');
}

function getAvatarUrl(sesion) {
  if (!sesion) return null;
  if (sesion.avatarUrl && sesion.avatarUrl.trim() !== '') return sesion.avatarUrl;
  if (sesion.fotoUrl  && sesion.fotoUrl.trim()  !== '') return sesion.fotoUrl;
  return null;
}

// Función genérica para abrir un modal con un formulario, retorna el form y una función para cerrarlo.
function renderPanelSesion() {
  const panel = document.getElementById('session-panel');
  const sesion = Store.getSession();
  if (!sesion) return;
  panel.innerHTML = '';

  const infoDiv = document.createElement('div');
  infoDiv.className = 'session-info';

  const wrapper = document.createElement('div');
  wrapper.className = 'session-avatar-wrapper';

  const avatarUrl = getAvatarUrl(sesion);
  if (avatarUrl) {
    const img = document.createElement('img');
    img.className = 'session-avatar-img';
    img.src = avatarUrl;
    img.alt = sesion.nombres;
    img.onerror = () => { wrapper.innerHTML = ''; wrapper.appendChild(crearAvatarIniciales(sesion)); };
    wrapper.appendChild(img);
  } else {
    wrapper.appendChild(crearAvatarIniciales(sesion));
  }
  infoDiv.appendChild(wrapper);

  const nombre = document.createElement('h4');
  nombre.textContent = `${escaparHTML(sesion.nombres)} ${escaparHTML(sesion.apellidos)}`;
  const email = document.createElement('p');
  email.textContent = escaparHTML(sesion.email);
  const rol = document.createElement('p');
  rol.textContent = escaparHTML(sesion.cargo || sesion.areaAcademica || '');
  infoDiv.append(nombre, email, rol);

  const btnSalir = document.createElement('button');
  btnSalir.className = 'solid';
  btnSalir.type = 'button';
  btnSalir.textContent = 'Cerrar sesión';
  btnSalir.style.cssText = 'width:100%;margin-top:12px;';
  btnSalir.addEventListener('click', () => { Store.clearSession(); window.location.href = 'index.html'; });

  panel.appendChild(infoDiv);
  panel.appendChild(btnSalir);
}

function crearCampo(label, input) {
  const wrap = document.createElement('div');
  wrap.className = 'campo-form';
  const lab = document.createElement('label');
  lab.textContent = label;
  wrap.appendChild(lab);
  wrap.appendChild(input);
  return wrap;
}

function filtrarCursos(cursos) {
  return cursos.filter((curso) => {
    const okEstado    = !estadoUI.filtrosCursos.estado    || curso.estado === estadoUI.filtrosCursos.estado;
    const okCategoria = !estadoUI.filtrosCursos.categoria || curso.categoria.toLowerCase().includes(estadoUI.filtrosCursos.categoria.toLowerCase());
    const okFecha     = !estadoUI.filtrosCursos.fecha     || curso.fechaCreacion === estadoUI.filtrosCursos.fecha;
    return okEstado && okCategoria && okFecha;
  });
}

// Función genérica para abrir un modal con un formulario, retorna el form y una función para cerrarlo.
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
  btnAceptar.addEventListener('click', () => { onAceptar(); backdrop.remove(); });
  acciones.append(btnCancelar, btnAceptar);
  modal.append(h3, p, acciones);
  backdrop.appendChild(modal);
  document.getElementById('modal-root').appendChild(backdrop);
}

function crearStatCard(label, valor, emoji) {
  const card = document.createElement('div');
  card.className = 'stat-card';
  const badge = document.createElement('div');
  badge.className = 'stat-emoji-badge';
  badge.textContent = emoji;
  const h3 = document.createElement('h3');
  h3.textContent = label;
  const num = document.createElement('p');
  num.className = 'stat-number';
  num.textContent = valor;
  card.append(badge, h3, num);
  return card;
}

// ── Dashboard principal
function renderDashboard() {
  const main = document.getElementById('main-content');
  const cursos   = Store.getCursos();
  const docentes = Store.getDocentes();
  const admins   = Store.getAdmins();

  const cursosActivos    = cursos.filter((c) => c.estado === 'activo').length;
  const totalEstudiantes = cursos.reduce((s, c) => s + (typeof c.estudiantes === 'number' ? c.estudiantes : 0), 0);
  const totalModulos     = cursos.reduce((s, c) => s + (c.modulos?.length || 0), 0);
  const totalLecciones   = cursos.reduce((s, c) => s + c.modulos.reduce((sm, m) => sm + (m.lecciones?.length || 0), 0), 0);

  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  const grid = document.createElement('div');
  grid.className = 'stats-grid stats-grid-3';

  [
    { label: 'Cursos activos',        valor: cursosActivos,    emoji: '📚' },
    { label: 'Total docentes',        valor: docentes.length,  emoji: '👨‍🏫' },
    { label: 'Total estudiantes',     valor: totalEstudiantes, emoji: '🎓' },
    { label: 'Módulos en sistema',    valor: totalModulos,     emoji: '📂' },
    { label: 'Lecciones en sistema',  valor: totalLecciones,   emoji: '📝' },
    { label: 'Administrativos',       valor: admins.length,    emoji: '🏫' },
  ].forEach(({ label, valor, emoji }) => grid.appendChild(crearStatCard(label, valor, emoji)));

  seccion.appendChild(grid);

  const quickWrap = document.createElement('div');
  quickWrap.className = 'quick-actions';
  const titulo = document.createElement('h4');
  titulo.textContent = 'Accesos rápidos';
  quickWrap.appendChild(titulo);

  [
    { texto: 'Gestionar cursos',          s: 'cursos'   },
    { texto: 'Gestionar docentes',         s: 'docentes' },
    { texto: 'Gestionar administrativos',  s: 'admins'   },
  ].forEach(({ texto, s }) => {
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