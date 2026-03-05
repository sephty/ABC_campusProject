/**
 * VALIDATION - Funciones de validación de formularios.
 */

// Valida que los campos requeridos no estén vacíos.
// Retorna array con mensajes de error por cada campo faltante.
function validarCamposRequeridos(datos, camposObligatorios) {
  const errores = [];
  camposObligatorios.forEach((campo) => {
    if (!datos[campo] || !datos[campo].toString().trim()) {
      errores.push(`El campo "${campo}" es obligatorio.`);
    }
  });
  return errores;
}
