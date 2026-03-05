/**
 * MODAL - Componentes reutilizables de modales y formularios.
 */

// Crea y abre un modal reutilizable con formulario vacío.
// Retorna { form, cerrar } para que el llamador agregue campos y maneje el submit.
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

// Crea una fila de controles para un recurso multimedia de lección.
// Cada fila tiene selector de tipo, campo URL, campo nombre y botón eliminar.
function crearLineaMultimedia(item = { tipo: 'video', url: '', nombre: '' }) {
  const fila = document.createElement('div');
  fila.className = 'linea-multimedia';

  const selectTipo = document.createElement('select');
  selectTipo.name = 'tipo';
  ['video', 'pdf', 'imagen', 'enlace'].forEach((val) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = val;
    selectTipo.appendChild(opt);
  });
  selectTipo.value = item.tipo || 'video';

  const inputUrl = document.createElement('input');
  inputUrl.name = 'url';
  inputUrl.type = 'text';
  inputUrl.placeholder = 'URL del recurso';
  inputUrl.value = item.url || '';

  const inputNombre = document.createElement('input');
  inputNombre.name = 'nombre';
  inputNombre.type = 'text';
  inputNombre.placeholder = 'Nombre del recurso';
  inputNombre.value = item.nombre || '';

  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'btn-delete';
  btnEliminar.type = 'button';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.addEventListener('click', () => fila.remove());

  fila.append(selectTipo, inputUrl, inputNombre, btnEliminar);
  return fila;
}
