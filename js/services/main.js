/**
 * ADMIN MAIN - Punto de entrada del panel administrativo.
 * Coordina navegación, eventos globales e inicialización.
 */

// Renderiza la sección seleccionada con animación de fade.
function renderSeccion(nombre) {
  const main = document.getElementById('main-content');

  // Fade out
  main.style.opacity = '0';
  main.style.transform = 'translateY(-5px)';

  setTimeout(() => {
    main.innerHTML = '';
    estadoUI.seccionActual = nombre;
    actualizarNavegacionActiva(nombre);

    const titulo = document.getElementById('top-title');
    const titulos = {
      dashboard: 'Panel de Control',
      cursos:    'Gestión de Cursos',
      docentes:  'Gestión de Docentes',
      admins:    'Gestión de Administrativos',
      estudiantes: 'Gestion de estudiantes'
    };
    titulo.textContent = titulos[nombre] || 'Panel de Control';

    switch (nombre) {
      case 'dashboard':  renderDashboard();  break;
      case 'cursos':     renderCursos();     break;
      case 'docentes':   renderDocentes();   break;
      case 'admins':     renderAdmins();     break;
      case 'estudiantes': renderGestionestudiantes(); break;
      default:           renderDashboard();
    }

    // Fade in
    main.style.transition = 'all 0.3s ease';
    main.style.opacity = '1';
    main.style.transform = 'translateY(0)';
  }, 100);
}

// Configura todos los eventos globales del panel administrativo.
function configurarEventosGlobales() {
  // Navegación del sidebar
  document.querySelectorAll('.sidebar-nav a[data-section]').forEach((enlace) => {
    enlace.addEventListener('click', (event) => {
      event.preventDefault();
      renderSeccion(enlace.dataset.section);
      cerrarSidebarMobile();
    });
  });

  // Toggle del panel de sesión
  document.getElementById('btn-session').addEventListener('click', () => {
    document.getElementById('session-panel').classList.toggle('oculto');
  });

  // Toggle de tema claro/oscuro
  document.getElementById('btn-theme').addEventListener('click', () => {
    const nuevo = Store.getTema() === 'light' ? 'dark' : 'light';
    Store.saveTema(nuevo);
    document.documentElement.setAttribute('data-theme', nuevo);
    actualizarIconoTema();
  });

  // Toggle del menú mobile
  document.getElementById('btn-menu').addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
}

// Actualiza el icono y texto del botón de tema según el estado actual
function actualizarIconoTema() {
  const tema = Store.getTema();
  const icono = document.getElementById('theme-icon');
  const texto = document.getElementById('theme-text');
  
  if (tema === 'dark') {
    icono.textContent = '🌙';
    icono.style.transform = 'rotate(180deg)';
  } else {
    icono.textContent = '☀️';
    icono.style.transform = 'rotate(0deg)';
  }
}

// Inicializa el panel admin: valida sesión, carga datos y renderiza.
async function iniciarAdmin() {
  aplicarTemaInicial();
  await Store.initFromJSON();

  const sesion = Store.getSession();
  // Verifica que la sesión sea de un administrativo
  const esAdmin = !!sesion && (sesion.rol === 'admin' || sesion.id?.startsWith('ADM-') || !!sesion.cargo);
  if (!esAdmin) {
    window.location.href = 'index.html';
    return;
  }

  renderPanelSesion();
  configurarEventosGlobales();
  renderSeccion('dashboard');
}

document.addEventListener('DOMContentLoaded', iniciarAdmin);
