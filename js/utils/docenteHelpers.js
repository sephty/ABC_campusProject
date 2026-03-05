/**
 * DOCENTE HELPERS - Utilidades y estado global para el dashboard de docentes.
 */

const estadoDocenteUI = {
  seccionActual: 'dashboard',
  cursosExpandidosIds: [],
  filtros: { estado: '', categoria: '' }
};

function aplicarTemaInicial() {
  document.documentElement.setAttribute('data-theme', Store.getTema());
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

function crearAvatarIniciales(persona) {
  const div = document.createElement('div');
  div.className = 'session-avatar avatar-iniciales';
  const i1 = (persona.nombres || '?').charAt(0).toUpperCase();
  const i2 = (persona.apellidos || '').charAt(0).toUpperCase();
  div.textContent = i1 + i2;
  return div;
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

  if (sesion.fotoUrl && sesion.fotoUrl.trim() !== '') {
    const img = document.createElement('img');
    img.className = 'session-avatar-img';
    img.src = sesion.fotoUrl;
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
  const area = document.createElement('p');
  area.textContent = escaparHTML(sesion.areaAcademica || 'Sin área');
  infoDiv.append(nombre, email, area);

  const btnSalir = document.createElement('button');
  btnSalir.className = 'solid';
  btnSalir.type = 'button';
  btnSalir.textContent = 'Cerrar sesión';
  btnSalir.style.cssText = 'width:100%;margin-top:12px;';
  btnSalir.addEventListener('click', () => { Store.clearSession(); window.location.href = 'index.html'; });

  panel.appendChild(infoDiv);
  panel.appendChild(btnSalir);
}

function actualizarNavegacionActiva(seccion) {
  document.querySelectorAll('.sidebar-nav a').forEach((link) => {
    link.classList.toggle('active', link.dataset.section === seccion);
  });
}

function cerrarSidebarMobile() {
  if (window.innerWidth < 768) document.body.classList.remove('sidebar-open');
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

function validarCamposRequeridos(datos, camposObligatorios) {
  const errores = [];
  camposObligatorios.forEach((campo) => {
    if (!datos[campo] || !datos[campo].toString().trim())
      errores.push(`El campo "${campo}" es obligatorio.`);
  });
  return errores;
}
 // Función genérica para abrir un modal con un formulario, retorna el form y una función para cerrarlo.
function abrirModal(titulo) {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = '';
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal';
  const h3 = document.createElement('h3');
  h3.textContent = titulo;
  modal.appendChild(h3);
  const form = document.createElement('form');
  form.noValidate = true;
  const acciones = document.createElement('div');
  acciones.className = 'modal-actions';
  const btnGuardar = document.createElement('button');
  btnGuardar.className = 'solid';
  btnGuardar.type = 'submit';
  btnGuardar.textContent = 'Guardar';
  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'ghost';
  btnCancelar.type = 'button';
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.addEventListener('click', () => { modalRoot.innerHTML = ''; });
  acciones.append(btnGuardar, btnCancelar);
  form.appendChild(acciones);
  modal.appendChild(form);
  backdrop.appendChild(modal);
  modalRoot.appendChild(backdrop);
  return { form, cerrar: () => { modalRoot.innerHTML = ''; } };
}

// Dashboard helper específico para docentes, con estadísticas y accesos rápidos.
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

// ── Dashboard docente 
function renderDashboardDocente() {
  const sesion    = Store.getSession();
  const cursos    = Store.getCursos();
  const misCursos = cursos.filter((c) => c.docenteId === sesion.id);

  const totalModulos     = misCursos.reduce((s, c) => s + (c.modulos?.length || 0), 0);
  const totalLecciones   = misCursos.reduce((s, c) => s + c.modulos.reduce((sm, m) => sm + (m.lecciones?.length || 0), 0), 0);
  const totalEstudiantes = misCursos.reduce((s, c) => s + (typeof c.estudiantes === 'number' ? c.estudiantes : 0), 0);

  const main = document.getElementById('main-content');
  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  const grid = document.createElement('div');
  grid.className = 'stats-grid stats-grid-3';

  [
    { label: 'Mis cursos',          valor: misCursos.length,           emoji: '📚' },
    { label: 'Mis estudiantes',     valor: totalEstudiantes,           emoji: '🎓' },
    { label: 'Mis módulos',         valor: totalModulos,               emoji: '📂' },
    { label: 'Mis lecciones',       valor: totalLecciones,             emoji: '📝' },
    { label: 'Docentes en sistema', valor: Store.getDocentes().length,  emoji: '👨‍🏫' },
    { label: 'Cursos en sistema',   valor: cursos.length,              emoji: '🏫' },
  ].forEach(({ label, valor, emoji }) => grid.appendChild(crearStatCard(label, valor, emoji)));

  seccion.appendChild(grid);

  const quickWrap = document.createElement('div');
  quickWrap.className = 'quick-actions';
  const h4 = document.createElement('h4');
  h4.textContent = 'Accesos rápidos';
  quickWrap.appendChild(h4);

  [
    { texto: 'Mis cursos',           s: 'misCursos'      },
    { texto: 'Editar mi perfil',     s: 'miPerfil'       },
    { texto: 'Ver todos los cursos', s: 'todosLosCursos' },
    { texto: 'Ver docentes',         s: 'docentes'       },
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