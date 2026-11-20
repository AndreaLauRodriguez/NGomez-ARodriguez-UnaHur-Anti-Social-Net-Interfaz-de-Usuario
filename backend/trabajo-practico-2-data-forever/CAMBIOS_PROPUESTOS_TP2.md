# Correcciones propuestas para revisión y pruebas

- PUT /api/users/:id: actualizar nickName; DELETE /api/users/:id: eliminar usuario y relaciones asociadas.
- PATCH /api/posts/:id/comments/:commentId: editar comentario.
- GET/POST /api/tags, PUT/DELETE /api/tags/:id: CRUD de etiquetas.
- Validación Joi de espacios en blanco en los nuevos endpoints.
- Duplicados MongoDB E11000: 409 Conflict.

**Pendiente:** ejecutar pruebas integradas con MongoDB real, revisar eliminación de imágenes ante errores de base de datos, verificar contratos de Swagger/README y compatibilidad con las indicaciones completas del profesor. No aplicar sobre la carpeta original sin respaldo.

## Revisión adicional (15/11/2026)
- Corregida ruta DELETE de comentarios: se eliminó el middleware `updateComment` que se ejecutaba después de `deleteComment`.
- Al fallar la inserción de una imagen en MongoDB se intenta borrar el archivo ya subido por Multer, para evitar un archivo huérfano.
- Mensaje de validación de tipo de imagen actualizado para incluir WEBP, que ya estaba permitido.
- Verificada sintaxis de los archivos JS modificados con `node --check` (no equivale a pruebas de integración).
