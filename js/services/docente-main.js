/**
 * DOCENTE MAIN - Punto de entrada del dashboard para docentes.
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
    estadoDocenteUI.seccionActual = nombre;
    actualizarNavegacionActiva(nombre);

    const titulo = document.getElementById('top-title');

    switch (nombre) {
      case 'dashboard':
        titulo.textContent = 'Panel de Control';
        renderDashboardDocente();
        break;
      case 'misCursos':
        titulo.textContent = 'Mis Cursos';
        renderMisCursos();
        break;
      case 'todosLosCursos':
        titulo.textContent = 'Todos los Cursos';
        renderTodosLosCursos();
        break;
        case 'estudiantes':
          titulo.textContent = 'Estudiantes';
          renderGestionestudiantes();
          break;
      case 'docentes':
        titulo.textContent = 'Docentes';
        // Usa la función de docenteUI que no choca con teachersUI
        renderDocentesDocente();
        break;
      case 'miPerfil':
        titulo.textContent = 'Mi Perfil';
        // Abre el modal de perfil y muestra el dashboard de fondo
        renderDashboardDocente();
        abrirFormularioPerfil();
        break;
      default:
        titulo.textContent = 'Panel de Control';
        renderDashboardDocente();
    }

    // Fade in
    main.style.transition = 'all 0.3s ease';
    main.style.opacity = '1';
    main.style.transform = 'translateY(0)';
  }, 100);
}

// Configura todos los eventos globales del dashboard de docente.
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

// Inicializa el dashboard de docente: valida sesión, carga datos y renderiza.
async function iniciarDashboard() {
  aplicarTemaInicial();
  await Store.initFromJSON();

  const sesion = Store.getSession();
  // Verifica que la sesión sea de un docente
  const esDocente = !!sesion && (sesion.rol === 'docente' || sesion.id?.startsWith('DOC-') || !!sesion.areaAcademica);
  if (!esDocente) {
    window.location.href = 'index.html';
    return;
  }

  renderPanelSesion();
  configurarEventosGlobales();
  actualizarIconoTema(); // Inicializa el icono según el tema actual
  renderSeccion('dashboard');
}

document.addEventListener('DOMContentLoaded', iniciarDashboard);
