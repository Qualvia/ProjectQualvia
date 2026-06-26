const TIPOS_PERMITIDOS = [
  "application/pdf","image/jpeg","image/png","image/webp","image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain","text/csv",
];
const TAMANO_MAX_MB = 20;

export function validateUpload(file) {
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return { ok: false, error: `Tipo no permitido: "${file.name}". Solo PDF, imágenes, Word, Excel y texto.` };
  }
  if (file.size > TAMANO_MAX_MB * 1024 * 1024) {
    return { ok: false, error: `"${file.name}" supera el límite de ${TAMANO_MAX_MB} MB.` };
  }
  return { ok: true };
}