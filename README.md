# ABC Campus — Learning Management System

Sistema de gestión de aprendizaje (LMS) desarrollado con HTML, CSS y JavaScript vanilla para la Institución Educativa ABC. Permite la administración de cursos, módulos, lecciones, docentes y administrativos desde un panel protegido por autenticación.

---

link del proyecto: https://sephty.github.io/ABC_campusProject/


## Estructura del proyecto

```
ABC_CAMPUSPROJECT/
├── imgs/
│   ├── background.png          # Fondo exclusivo del login
│   ├── image.png               # Logo del sidebar
│   ├── icons/                  # SVG de iconos de la interfaz
│   └── docentes/               # Fotos de perfil de docentes
│
├── js/
│   ├── data/
│   │   └── store.js            # Capa única de acceso a localStorage
│   ├── services/
│   │   ├── login.js            # Autenticación y redirección por rol
│   │   ├── main.js             # Coordinador del panel administrativo
│   │   └── docente-main.js     # Coordinador del panel de docentes
│   ├── ui/
│   │   ├── adminsUI.js         # CRUD de administrativos
│   │   ├── coursesUI.js        # CRUD de cursos, módulos y lecciones
│   │   ├── teachersUI.js       # CRUD de docentes (panel admin)
│   │   └── docenteUI.js        # Vistas del panel de docentes
│   └── utils/
│       ├── helpers.js          # Utilidades compartidas del panel admin
│       ├── docenteHelpers.js   # Utilidades del panel de docentes
│       ├── modal.js            # Componente de modal reutilizable
│       └── validation.js       # Validación de formularios
│
├── json/
│   ├── courses.json            # Datos semilla de cursos, módulos y lecciones
│   └── users.json              # Datos semilla de docentes y administrativos
│
├── styles/
│   ├── base.css                # Variables CSS, componentes compartidos, temas
│   ├── index.css               # Estilos del login
│   ├── admin.css               # Estilos del panel administrativo
│   ├── dashboard.css           # Estilos del panel de docentes
│   └── login.css               # Estilos adicionales del login
│
├── index.html                  # Login — entrada pública
├── admin.html                  # Panel administrativo — protegido
└── dashboard.html              # Panel de docentes — protegido
```

---

## Páginas y acceso

| Página | Ruta | Acceso |
|---|---|---|
| Login | `index.html` | Público |
| Panel administrativo | `admin.html` | Solo administrativos |
| Panel de docentes | `dashboard.html` | Solo docentes |

El login verifica las credenciales contra `localStorage` (cargado desde `users.json` la primera vez) y redirige según el rol detectado. Si no hay sesión activa al intentar acceder a `admin.html` o `dashboard.html`, el sistema redirige automáticamente al login.

---

## Credenciales de prueba

### Administrativos

| Nombre | Email | Password |
|---|---|---|
| Carlos Ramirez | carlos.ramirez@abc.edu.co | admin123 |
| Laura Castro | laura.castro@abc.edu.co | admin456 |

### Docentes

| Nombre | Email | Password |
|---|---|---|
| Maria Perez | maria.perez@abc.edu.co | docente123 |
| Jorge Mendoza | jorge.mendoza@abc.edu.co | docente123 |
| Juan Garcia | juan.garcia@abc.edu.co | docente123 |
| Patricia Rodriguez | patricia.rodriguez@abc.edu.co | docente123 |
| Roberto Lopez | roberto.lopez@abc.edu.co | docente123 |

---

## Funcionalidades

### Panel administrativo (`admin.html`)

**Dashboard**
- Estadísticas en tiempo real: cursos activos, total de docentes, administrativos, módulos y lecciones en el sistema.
- Accesos rápidos a cada módulo de gestión.

**Gestión de cursos**
- Tabla con filtros por estado, categoría y fecha de creación.
- Crear y editar cursos con: código, nombre, descripción, categoría, etiquetas, duración, visibilidad, estado y docente asignado.
- Vista expandible por curso para gestionar sus módulos anidados.
- CRUD de módulos dentro de cada curso.
- CRUD de lecciones dentro de cada módulo, con soporte de recursos multimedia (URL de video, PDF, imagen o enlace).
- Eliminación con modal de confirmación.

**Gestión de docentes**
- Tabla con foto de perfil (fallback a iniciales si la imagen no carga).
- Crear y editar docentes con: código, identificación, nombres, apellidos, email, área académica y URL de foto.
- Restricción de eliminación: no se puede eliminar un docente que tenga cursos asignados. El sistema muestra cuáles son.
- Panel de carga académica por docente: muestra sus cursos, módulos y cantidad de lecciones.

**Gestión de administrativos**
- CRUD completo sin restricciones de eliminación.
- El campo password solo se solicita en la creación, no en la edición.

### Panel de docentes (`dashboard.html`)

**Dashboard**
- Estadísticas propias: mis cursos, mis módulos, mis lecciones, docentes y cursos en el sistema.
- Accesos rápidos a las secciones del panel.

**Mis cursos**
- Lista de cursos asignados al docente en sesión.
- Vista expandible con módulos y lecciones completos.
- Crear y editar módulos dentro de sus cursos.
- Crear y editar lecciones dentro de sus módulos.

**Todos los cursos**
- Tabla de solo lectura con todos los cursos del sistema.

**Docentes**
- Tabla de solo lectura con todos los docentes registrados.

**Mi perfil**
- Editar nombres, apellidos, email y área académica del docente en sesión.

---

## Arquitectura de datos

### `store.js` — capa de persistencia

Único punto de acceso a `localStorage`. Ningún otro archivo lo usa directamente.

```js
Store.getSession()       // Sesión activa del usuario
Store.saveSession(user)  // Guarda sesión al iniciar
Store.clearSession()     // Limpia sesión al cerrar
Store.getDocentes()      // Lista de docentes
Store.saveDocentes(data)
Store.getAdmins()        // Lista de administrativos
Store.saveAdmins(data)
Store.getCursos()        // Lista de cursos con módulos y lecciones anidados
Store.saveCursos(data)
Store.getTema()          // Preferencia de tema (light / dark)
Store.saveTema(tema)
Store.initFromJSON()     // Carga datos semilla desde /json/ si localStorage está vacío
```

### Estructura de entidades

**Curso**
```json
{
  "id": "CRS-001",
  "codigo": "COD-101",
  "nombre": "Desarrollo Web Fullstack",
  "descripcion": "...",
  "categoria": "Informatica",
  "etiquetas": ["html", "css", "javascript"],
  "duracion": "120h",
  "visibilidad": "publico",
  "estado": "activo",
  "fechaCreacion": "2025-01-15",
  "docenteId": "DOC-001",
  "estudiantes": [],
  "modulos": [ ... ]
}
```

**Módulo**
```json
{
  "id": "MOD-001",
  "codigo": "M001",
  "nombre": "Fundamentos de HTML y CSS",
  "descripcion": "...",
  "lecciones": [ ... ]
}
```

**Lección**
```json
{
  "id": "LEC-001",
  "titulo": "Estructura Semántica",
  "intensidadHoraria": 2,
  "contenido": "Texto del material de estudio...",
  "multimedia": [
    { "tipo": "video", "url": "https://...", "nombre": "Intro a HTML" },
    { "tipo": "enlace", "url": "https://...", "nombre": "MDN Web Docs" }
  ]
}
```

Tipos de multimedia válidos: `video`, `pdf`, `imagen`, `enlace`.

**Docente**
```json
{
  "id": "DOC-001",
  "codigo": "D001",
  "identificacion": "2020202020",
  "nombres": "Maria",
  "apellidos": "Perez",
  "email": "maria.perez@abc.edu.co",
  "password": "docente123",
  "areaAcademica": "Informatica",
  "fotoUrl": "imgs/docentes/maria.png"
}
```

**Administrativo**
```json
{
  "id": "ADM-001",
  "identificacion": "1010101010",
  "nombres": "Carlos",
  "apellidos": "Ramirez",
  "email": "carlos.ramirez@abc.edu.co",
  "password": "admin123",
  "telefono": "3001234567",
  "cargo": "Coordinador Académico",
  "avatarUrl": ""
}
```

---

## Navegación — patrón SPA

El panel no recarga la página al cambiar de sección. El sidebar contiene enlaces con `data-section="nombre"`. Al hacer clic, `renderSeccion()` limpia `#main-content` e inserta la sección correspondiente con una animación de fade.

```
data-section="dashboard"   →  renderDashboard()
data-section="cursos"      →  renderCursos()
data-section="docentes"    →  renderDocentes()
data-section="admins"      →  renderAdmins()
```

---

## Orden de carga de scripts

### `admin.html`
```html
<script src="js/data/store.js"></script>
<script src="js/utils/helpers.js"></script>
<script src="js/utils/modal.js"></script>
<script src="js/utils/validation.js"></script>
<script src="js/ui/adminsUI.js"></script>
<script src="js/ui/coursesUI.js"></script>
<script src="js/ui/teachersUI.js"></script>
<script src="js/services/main.js"></script>
```

### `dashboard.html`
```html
<script src="js/data/store.js"></script>
<script src="js/utils/docenteHelpers.js"></script>
<script src="js/utils/modal.js"></script>
<script src="js/utils/validation.js"></script>
<script src="js/ui/docenteUI.js"></script>
<script src="js/services/docente-main.js"></script>
```

### `index.html`
```html
<script src="js/data/store.js"></script>
<script src="js/services/login.js"></script>
```

No mezclar `teachersUI.js` en `dashboard.html` ni `docenteUI.js` en `admin.html` — ambos definen funciones con nombres que chocarían.

---

## Temas — light / dark mode

Las variables CSS están definidas en `base.css` bajo `:root` (claro) y `[data-theme="dark"]` (oscuro). El toggle en el top-bar cambia el atributo `data-theme` en `<html>` y guarda la preferencia en `localStorage` con la clave `"tema"`. Al cargar cualquier página se aplica el tema guardado antes de renderizar.

---

## Fotos de docentes

Las fotos van en `imgs/docentes/` con el nombre en minúsculas que corresponde al campo `fotoUrl` de cada docente en `users.json`. Si la imagen no existe o no carga, el sistema muestra automáticamente un avatar con las iniciales del docente.

```
imgs/docentes/maria.png
imgs/docentes/jorge.png
imgs/docentes/juan.png
imgs/docentes/patricia.png
imgs/docentes/roberto.png
```

---

## Tecnologías

- HTML5
- CSS3 con variables personalizadas (sin preprocesadores)
- JavaScript ES6+ vanilla (sin frameworks ni librerías externas)
- localStorage para persistencia de datos
- Fetch API para carga inicial desde archivos JSON

---

## Limitaciones del MVP

- No hay subida real de archivos. Los recursos multimedia de lecciones se guardan como URLs de texto.
- No hay módulo de estudiantes en esta versión.
- La autenticación es local (localStorage), sin backend ni tokens seguros.
- Sin paginación en tablas.

---

## Ejecución

No requiere servidor ni dependencias. Abrir directamente en el navegador:

```
index.html       →  login
admin.html       →  panel administrativo (requiere sesión)
dashboard.html   →  panel de docentes (requiere sesión)
```

Para cargar los datos semilla correctamente desde los archivos JSON, se recomienda servir el proyecto con un servidor local básico en lugar de abrir los archivos directamente con `file://`, ya que los navegadores bloquean `fetch()` en ese protocolo.

```bash
# Con Python
python -m http.server 5500

# Con Node.js (npx)
npx serve .

# Con la extensión Live Server de VSCode
# Clic derecho en index.html → Open with Live Server
```
