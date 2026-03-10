

// Versión de los datos semilla. Incrementar este número cada vez que
// se modifique courses.json o users.json para forzar recarga automática.
const DATA_VERSION = '3';

const Store = {
  // Sesión activa del usuario (per-tab)
  getSession:   () => JSON.parse(sessionStorage.getItem('session')) || null,
  saveSession:  (u) => sessionStorage.setItem('session', JSON.stringify(u)),
  clearSession: ()  => sessionStorage.removeItem('session'),

  // Docentes
  getDocentes:  () => JSON.parse(localStorage.getItem('docentes')) || [],
  saveDocentes: (d) => localStorage.setItem('docentes', JSON.stringify(d)),

  // Administrativos
  getAdmins:    () => JSON.parse(localStorage.getItem('admins')) || [],
  saveAdmins:   (d) => localStorage.setItem('admins', JSON.stringify(d)),

  // Cursos (incluye módulos y lecciones anidados)
  getCursos:    () => JSON.parse(localStorage.getItem('cursos')) || [],
  saveCursos:   (d) => localStorage.setItem('cursos', JSON.stringify(d)),

  // Preferencia de tema visual
  getTema:      () => localStorage.getItem('tema') || 'light',
  saveTema:     (t) => localStorage.setItem('tema', t),

  // Limpia solo los datos semilla sin tocar sesión ni tema.
  // Usar desde consola del navegador: Store.resetDatos()
  resetDatos: () => {
    localStorage.removeItem('cursos');
    localStorage.removeItem('docentes');
    localStorage.removeItem('admins');
    localStorage.removeItem('data_version');
    console.log('Datos semilla limpiados. Recarga la página para reinicializar.');
  },

  // Carga datos desde JSON. Si la versión guardada no coincide con DATA_VERSION,
  // borra el caché y recarga todo desde los archivos JSON.
  initFromJSON: async () => {
    try {
      const versionGuardada = localStorage.getItem('data_version');

      // Si la versión no coincide, limpiar datos anteriores y recargar
      if (versionGuardada !== DATA_VERSION) {
        console.log(`Versión desactualizada (${versionGuardada} → ${DATA_VERSION}). Recargando JSON...`);
        localStorage.removeItem('cursos');
        localStorage.removeItem('docentes');
        localStorage.removeItem('admins');
      }

      // Carga cursos si no existen en localStorage
      if (!localStorage.getItem('cursos')) {
        const r = await fetch('json/courses.json');
        if (!r.ok) throw new Error(`Error cargando cursos: ${r.status}`);
        const data = await r.json();
        Store.saveCursos(data.cursos || []);
        console.log(`Cursos cargados: ${(data.cursos || []).length}`);
      }

      // Carga docentes y admins si no existen en localStorage
      if (!localStorage.getItem('docentes') || !localStorage.getItem('admins')) {
        const r = await fetch('json/users.json');
        if (!r.ok) throw new Error(`Error cargando usuarios: ${r.status}`);
        const data = await r.json();
        Store.saveDocentes(data.docentes || []);
        Store.saveAdmins(data.administrativos || []);
        console.log(`Docentes cargados: ${(data.docentes || []).length}`);
        console.log(`Admins cargados: ${(data.administrativos || []).length}`);
      }

      // Guarda la versión actual para futuras comparaciones
      localStorage.setItem('data_version', DATA_VERSION);

      // Migración: garantiza que todos los docentes tengan campo password
      const docentes = Store.getDocentes();
      const migrados = docentes.map((d) => ({ ...d, password: d.password || 'docente123' }));
      Store.saveDocentes(migrados);

    } catch (error) {
      console.error('Error al inicializar datos desde JSON:', error);
    }
  }
};
