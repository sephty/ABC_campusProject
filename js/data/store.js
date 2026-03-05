// Gestiona toda la persistencia local del proyecto.
const Store = {
  getSession: () => {
    return JSON.parse(localStorage.getItem('session')) || null;
  },

  saveSession: (usuario) => {
    localStorage.setItem('session', JSON.stringify(usuario));
  },

  clearSession: () => {
    localStorage.removeItem('session');
  },

  getTema: () => {
    return localStorage.getItem('tema') || 'light';
  },

  saveTema: (tema) => {
    localStorage.setItem('tema', tema);
  },

  getDocentes: () => {
    return JSON.parse(localStorage.getItem('docentes')) || [];
  },

  saveDocentes: (docentes) => {
    localStorage.setItem('docentes', JSON.stringify(docentes));
  },

  getAdmins: () => {
    return JSON.parse(localStorage.getItem('admins')) || [];
  },

  saveAdmins: (admins) => {
    localStorage.setItem('admins', JSON.stringify(admins));
  },

  getCursos: () => {
    return JSON.parse(localStorage.getItem('cursos')) || [];
  },

  saveCursos: (cursos) => {
    localStorage.setItem('cursos', JSON.stringify(cursos));
  },

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
