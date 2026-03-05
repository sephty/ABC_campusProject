// Maneja toda la persistencia del proyecto en localStorage.
const Store = {
  getSession: () => JSON.parse(localStorage.getItem('session')) || null,
  saveSession: (usuario) => localStorage.setItem('session', JSON.stringify(usuario)),
  clearSession: () => localStorage.removeItem('session'),

  getDocentes: () => JSON.parse(localStorage.getItem('docentes')) || [],
  saveDocentes: (docentes) => localStorage.setItem('docentes', JSON.stringify(docentes)),

  getAdmins: () => JSON.parse(localStorage.getItem('admins')) || [],
  saveAdmins: (admins) => localStorage.setItem('admins', JSON.stringify(admins)),

  getCursos: () => JSON.parse(localStorage.getItem('cursos')) || [],
  saveCursos: (cursos) => localStorage.setItem('cursos', JSON.stringify(cursos)),

  getTema: () => localStorage.getItem('tema') || 'light',
  saveTema: (tema) => localStorage.setItem('tema', tema),

  // Inicializa datos semilla si no existen en el navegador.
  initFromJSON: async () => {
    if (!localStorage.getItem('cursos')) {
      const respuestaCursos = await fetch('json/courses.json');
      const dataCursos = await respuestaCursos.json();
      Store.saveCursos(dataCursos.cursos || []);
    }

    if (!localStorage.getItem('docentes') || !localStorage.getItem('admins')) {
      const respuestaUsuarios = await fetch('json/users.json');
      const dataUsuarios = await respuestaUsuarios.json();
      Store.saveDocentes(dataUsuarios.docentes || []);
      Store.saveAdmins(dataUsuarios.administrativos || []);
    }
  }
};
