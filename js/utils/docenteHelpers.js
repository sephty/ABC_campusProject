/**
 * DOCENTE HELPERS - Utilidades y estado global para el dashboard de docentes.
 */

// Estado global UI para el panel de docentes.
const estadoDocenteUI = {
  seccionActual: 'dashboard',
  cursosExpandidosIds: [],
  filtros: {
    estado: '',
    categoria: ''
  }
};

// Aplica el tema guardado en localStorage al iniciar la página.
function aplicarTemaInicial() {
  document.documentElement.setAttribute('data-theme', Store.getTema());
}

// Muestra un toast de notificación breve. Se elimina en 2.6s.
function mostrarToast(mensaje, tipo = 'ok') {
  const root = document.getElementById('toast-root');
  const toast = document.createElement('div');
  toast.className = `toast-item ${tipo === 'error' ? 'toast-error' : 'toast-ok'}`;
  toast.textContent = mensaje;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

// Escapa caracteres especiales HTML para prevenir XSS.
function escaparHTML(texto) {
  if (!texto) return '';
  const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto).replace(/[&<>"']/g, (c) => mapa[c]);
}

// Crea un div con iniciales del docente para usar como avatar de fallback.
function crearAvatarIniciales(persona) {
  const div = document.createElement('div');
  div.className = 'session-avatar avatar-iniciales';
  const i1 = (persona.nombres || '?').charAt(0).toUpperCase();
  const i2 = (persona.apellidos || '').charAt(0).toUpperCase();
  div.textContent = i1 + i2;
  return div;
}

// Construye y renderiza el panel de sesión con datos del docente activo.
function renderPanelSesion() {
  const panel = document.getElementById('session-panel');
  const sesion = Store.getSession();
  if (!sesion) return;

  panel.innerHTML = '';

  const infoDiv = document.createElement('div');
  infoDiv.className = 'session-info';

  // Avatar: foto si existe, iniciales si no
  if (sesion.fotoUrl) {
    const img = document.createElement('img');
    img.className = 'session-avatar-img';
    img.src = sesion.fotoUrl;
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

  const area = document.createElement('p');
  area.textContent = escaparHTML(sesion.areaAcademica || 'Sin área');

  infoDiv.append(nombre, email, area);

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

// Marca como activo el enlace del sidebar que corresponde a la sección actual.
function actualizarNavegacionActiva(seccion) {
  document.querySelectorAll('.sidebar-nav a').forEach((link) => {
    link.classList.toggle('active', link.dataset.section === seccion);
  });
}

// Cierra el sidebar en móviles después de seleccionar una sección.
function cerrarSidebarMobile() {
  if (window.innerWidth < 768) {
    document.body.classList.remove('sidebar-open');
  }
}

// Crea un campo de formulario envolviendo etiqueta e input.
function crearCampo(label, input) {
  const wrap = document.createElement('div');
  wrap.className = 'campo-form';
  const lab = document.createElement('label');
  lab.textContent = label;
  wrap.appendChild(lab);
  wrap.appendChild(input);
  return wrap;
}

// Valida que los campos requeridos tengan contenido. Retorna array de mensajes de error.
function validarCamposRequeridos(datos, camposObligatorios) {
  const errores = [];
  camposObligatorios.forEach((campo) => {
    if (!datos[campo] || !datos[campo].toString().trim()) {
      errores.push(`El campo "${campo}" es obligatorio.`);
    }
  });
  return errores;
}

// Abre un modal reutilizable. Retorna { form, cerrar } para que el llamador lo llene.
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

// Renderiza el dashboard del docente con estadísticas de sus cursos y accesos rápidos.
function renderDashboardDocente() {
  const sesion = Store.getSession();
  const cursos = Store.getCursos();
  const misCursos = cursos.filter((c) => c.docenteId === sesion.id);

  // Calcula estadísticas reales desde los datos
  const totalModulos = misCursos.reduce((s, c) => s + (c.modulos?.length || 0), 0);
  const totalLecciones = misCursos.reduce((s, c) =>
    s + c.modulos.reduce((sm, m) => sm + (m.lecciones?.length || 0), 0), 0);

  const main = document.getElementById('main-content');
  const seccion = document.createElement('section');
  seccion.className = 'content-section seccion-fade';

  // Grid de estadísticas
  const grid = document.createElement('div');
  grid.className = 'stats-grid';
  const stats = [
    { label: 'Mis cursos',            valor: misCursos.length },
    { label: 'Mis módulos',           valor: totalModulos },
    { label: 'Mis lecciones',         valor: totalLecciones },
    { label: 'Docentes en sistema',   valor: Store.getDocentes().length },
    { label: 'Cursos en sistema',     valor: cursos.length }
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
  const h4 = document.createElement('h4');
  h4.textContent = 'Accesos rápidos';
  quickWrap.appendChild(h4);

  const acciones = [
    { texto: 'Mis cursos',          s: 'misCursos' },
    { texto: 'Editar mi perfil',    s: 'miPerfil' },
    { texto: 'Ver todos los cursos', s: 'todosLosCursos' },
    { texto: 'Ver docentes',        s: 'docentes' }
  ];
  acciones.forEach(({ texto, s }) => {
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
