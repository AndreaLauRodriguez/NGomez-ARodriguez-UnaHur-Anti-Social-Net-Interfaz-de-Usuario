**# UnaHur - Red Anti-Social - 2026 - C2 - TP2 (MongoDB)**



Se solicita el modelado y desarrollo del backend de una red social llamada **\*\*“UnaHur Anti-Social Net”\*\***, inspirada en plataformas populares donde los usuarios publican contenido y reciben comentarios sobre él.



![Imagen]\(./assets/ANTI-SOCIALNET.jpeg)



**## Continuidad con el TP1**



Este trabajo es la **\*\*segunda etapa\*\*** del mismo producto. En el TP1 construyeron la API sobre una base de datos relacional con Sequelize. Ahora los sponsors decidieron **\*\*migrar la persistencia a MongoDB\*\***, una base de datos **\*\*documental\*\***.



\- El **\*\*dominio es el mismo\*\***: mismas entidades, mismas reglas de negocio y mismos requerimientos funcionales.

\- Pueden (y se recomienda) **\*\*partir del código de su TP1\*\***. Lo que cambia es la capa de persistencia y todo lo que dependa de ella.

\- La API debería **\*\*mantener el mismo contrato\*\*** que en el TP1 (rutas, cuerpos de request y formato de respuestas), de modo que quien la consume no note el cambio. Si algo tiene que cambiar (por ejemplo, el formato de los identificadores), documéntenlo en el README y en el Swagger.



**## Contexto del Proyecto**



Los requerimientos del **\*\*MVP (Producto Mínimo Viable)\*\*** siguen siendo los mismos. Lo que sigue es lo que pidieron los sponsors: **\*\*cómo resolverlo es decisión del equipo\*\***.



\- Un usuario registrado puede hacer publicaciones. Toda publicación tiene **\*\*obligatoriamente una descripción\*\*** y, opcionalmente, **\*\*una o más imágenes\*\***. Las imágenes se pueden agregar o quitar después de publicado el post.

\- Las publicaciones pueden recibir **\*\*comentarios\*\*** de otros usuarios.

\- Las publicaciones pueden tener **\*\*etiquetas (tags)\*\***, y una misma etiqueta puede aparecer en muchas publicaciones.

\- Los **\*\*comentarios con más de X meses de antigüedad no deben mostrarse\*\*** al consultar un post. X tiene que ser configurable sin tocar el código. Si un comentario está visible o no **\*\*no se guarda en la base\*\***: se calcula a partir de su fecha (por ejemplo, con un **\*\*virtual\*\*** de Mongoose o filtrando en la consulta).



**## Entidades**



Los sponsors usan estos nombres para hablar del dominio. Respétenlos en el modelo:



\- **\*\*User\*\***: usuario registrado. Se identifica por su \`nickName\`, que no se puede repetir.

\- **\*\*Post\*\***: publicación que hace un usuario en una fecha determinada.

\- **\*\*Post_Images\*\***: imágenes asociadas a un post. Para el MVP alcanza con guardar la **\*\*URL\*\*** de la imagen.

\- **\*\*Comment\*\***: comentario de un usuario sobre un post, hecho en una fecha determinada.

\- **\*\*Tag\*\***: etiqueta que se le puede asignar a un post.



Los atributos, las relaciones y las restricciones las definen ustedes a partir de los requerimientos. Tienen que poder justificar cada decisión.



**## Modelado documental**



Este es el cambio central respecto del TP1. En una base documental no hay tablas intermedias ni claves foráneas: cada relación se resuelve **\*\*embebiendo\*\*** documentos o **\*\*referenciándolos\*\*** por su \`\_id\`. Queda a su criterio qué estrategia usar en cada caso, pero tienen que **\*\*justificarla\*\*** en el README (cómo se consulta, cómo crece, qué pasa al modificar o borrar).



**### Ejemplo de relación referenciada**



![referenciadas]\(./assets/Referenciada.png)



**---**



**# Implementación del Grupo 31 — TP2 (MongoDB y Mongoose)**



**## Diagrama del Modelo Documental**



El siguiente diagrama representa las colecciones de MongoDB, sus campos, atributos virtuales y referencias por \`ObjectId\`:



![Diagrama del Modelo Documental]\(docs/Modelo_Documental_MongoDB.png)



**---**



**## Justificación de las decisiones de modelado (Embebido vs. Referenciado)**



Para mantener el contrato y la arquitectura modular del TP1 aprovechando las capacidades de MongoDB y Mongoose, se tomaron las siguientes decisiones de diseño:



**### 1. ¿Las imágenes de un post (\`Post_Images\`) conviene embeberlas o guardarlas en su propia colección?**

Se modelaron en su propia colección **\*\*\`Post_Images\`\*\*** referenciando al post mediante \`postId: ObjectId\`:

\- **\*\*Cómo se consulta\*\***: al consultar publicaciones (\`GET /api/posts\` o \`GET /api/posts/:id\`), se obtienen las imágenes asociadas por \`postId\` devolviendo su \`id\` y \`url\`.

\- **\*\*Cómo crece y cómo se modifica/borra\*\***: las imágenes se pueden agregar (\`POST /api/posts/:id/images\`) o quitar individualmente (\`DELETE /api/posts/:id/images/:imageId\`) después de publicado el post, además de gestionar la eliminación del archivo físico en el servidor. Mantener \`Post_Images\` como colección independiente permite verificar la existencia de una imagen puntual mediante el middleware \`checkImageExists\` y eliminarla directamente sin reescribir el documento \`Post\` completo.



**### 2. ¿Y los comentarios (\`Comment\`)?**

Se modelaron en su propia colección **\*\*\`Comment\`\*\*** con referencias \`postId: ObjectId\` y \`userId: ObjectId\`:

\- **\*\*Cómo crece\*\***: una publicación puede acumular una cantidad no acotada de comentarios (relación **\*\*1 a muchos no acotada\*\***). Embeberlos dentro de \`Post\` haría crecer el documento indefinidamente, degradando el rendimiento de escritura y corriendo riesgo de alcanzar el límite de 16 MB por documento en MongoDB.

\- **\*\*Cómo se consulta y filtra por fecha\*\***: el esquema \`Comment\` define el atributo **\*\*virtual \`visible\`\*\*** de Mongoose, que no se persiste en la base de datos sino que se calcula dinámicamente comparando la fecha del comentario con \`MAX_COMMENT_AGE_MONTHS\`. Al consultar un post (\`GET /api/posts/:id\`), se incluyen únicamente los comentarios con \`comment.visible === true\`, mientras que los comentarios antiguos continúan almacenados en la colección \`Comment\` (pudiendo verificarse en \`GET /api/posts/:id/comments\`).

\- **\*\*Qué pasa al modificar o borrar\*\***: al tener identidad propia (\`\_id\`), un comentario se agrega con \`Comment.create()\`, se edita con \`PATCH /api/posts/:id/comments/:commentId\` y se elimina individualmente en \`DELETE /api/posts/:id/comments/:commentId\` sin reescribir el documento \`Post\`.



**### 3. ¿Cómo se representa la relación muchos a muchos entre \`Post\` y \`Tag\`?**

La relación muchos a muchos entre \`Post\` y \`Tag\` se resolvió mediante:

\- Una colección **\*\*\`Tag\`\*\*** (catálogo general de etiquetas) con documentos \`{ \_id, name }\` donde \`name\` tiene índice único (\`unique: true\`, normalizado en minúsculas).

\- Una colección de asociación **\*\*\`PostTag\`\*\*** (\`{ postId, tagId }\` con índice único compuesto \`{ postId: 1, tagId: 1 }\`).

\- **\*\*Distinción entre desasociar y eliminar del catálogo\*\***:

  - \`DELETE /api/posts/:id/tags/:tagId\` elimina únicamente el vínculo en \`PostTag\` entre esa publicación y la etiqueta, conservando la etiqueta en el catálogo \`Tag\`.

  - \`DELETE /api/tags/:id\` elimina la etiqueta del catálogo \`Tag\` y borra todas sus asociaciones en \`PostTag\`, manteniendo intactas las publicaciones.



**### 4. Al borrar un post, un usuario o una etiqueta, ¿qué pasa con los registros relacionados?**

Dado que MongoDB no aplica borrado en cascada (\`ON DELETE CASCADE\`) de forma automática, la integridad referencial es controlada explícitamente por la aplicación:

\- **\*\*Al eliminar un \`Post\` (\`DELETE /api/posts/:id\`)\*\***: se eliminan sus comentarios (\`Comment.deleteMany({ postId })\`), sus asociaciones de etiquetas (\`PostTag.deleteMany({ postId })\`), sus registros de imágenes (\`PostImage.deleteMany({ postId })\`), sus archivos físicos en \`src/public/uploads/\` y finalmente el documento \`Post\`. Las etiquetas en el catálogo \`Tag\` se conservan.

\- **\*\*Al eliminar un \`User\` (\`DELETE /api/users/:id\`)\*\***: se eliminan los comentarios realizados por el usuario y los comentarios de sus publicaciones, las asociaciones \`PostTag\` e imágenes \`PostImage\` de las publicaciones de su autoría (incluyendo sus archivos físicos en \`src/public/uploads/\`), sus publicaciones en \`Post\`, se remueve su \`ObjectId\` de los arreglos \`followers\` y \`following\` de los demás usuarios y finalmente se elimina el documento \`User\`.

\- **\*\*Al eliminar una \`Tag\` del catálogo (\`DELETE /api/tags/:id\`)\*\***: se eliminan todas las relaciones en \`PostTag\` que apunten a ese \`tagId\` y se elimina el documento \`Tag\`.

\- **\*\*Manejo de archivos físicos en disco\*\***:

  - Si falla la creación en MongoDB luego de que Multer guardó el archivo en \`POST /api/posts/:id/images\`, un bloque de compensación elimina inmediatamente el archivo recién subido para no dejar archivos huérfanos.

  - Cuando se elimina primero en MongoDB (\`deleteImage\`, \`deletePost\`, \`deleteUser\`) y luego se borra el archivo en disco con \`removeLocalFile\`, si el archivo ya no existe (\`ENOENT\`) se ignora y cualquier otro error de disco se registra en el log del servidor (\`console.error\`) sin devolver un falso error \`500\` al cliente cuando los datos ya fueron eliminados de la base.



**---**



**## Bonus implementados**



**### Bonus 1: Subida de imágenes al servidor con Multer y validación de tipo real**

\- Endpoint \`POST /api/posts/:id/images\` mediante \`multipart/form-data\` (campo \`image\`).

\- Implementado con los middlewares \`uploadImage.js\`, \`handleUploadError.js\` y \`validateImageFile.js\`.

\- Valida tanto el MIME declarado como la **\*\*firma binaria real del archivo (magic bytes)\*\*** en \`validateImageFile.js\` para admitir únicamente imágenes reales **\*\*JPG, PNG, GIF o WEBP\*\*** de hasta **\*\*5 MB\*\*** (si el contenido real no coincide, elimina el archivo temporal y responde \`400\`).



**### Bonus 2: Seguidores entre usuarios (\`followers\` / \`following\`) y comparación con el modelo relacional**

\- En el modelo documental (\`User\`), cada usuario almacena dos arreglos de referencias \`ObjectId\` a otros \`User\`: \`followers\` y \`following\`.

\- Los endpoints \`POST /api/users/:id/follow\` y \`POST /api/users/:id/unfollow\` validan mediante \`validate(followUserSchema)\` y \`validateFollow\` que los IDs sean válidos (\`400\`), que ningún usuario pueda seguirse a sí mismo (\`400\`) y que ambos usuarios existan (\`404\`). El endpoint \`GET /api/users/:id/followers\` valida la existencia del usuario mediante \`validateUserExists\`.

\- **\*\*Comparación con el modelo relacional (TP1)\*\***: en el modelo relacional se requiere una tabla intermedia \`User_Followers\` con claves foráneas compuestas y consultas \`JOIN\`, mientras que en MongoDB se resuelve con arreglos de \`ObjectId\` actualizados atómicamente con \`$addToSet\` y \`$pull\`.



**### Bonus 3: Caché de publicaciones (\`node-cache\`)**

\- Implementada en \`src/postCache.js\` con TTL de 30 segundos para \`GET /api/posts\` y \`GET /api/posts/:id\`.

\- Cualquier operación de escritura sobre usuarios, publicaciones, comentarios, imágenes o etiquetas invalida inmediatamente la caché (\`postCache.flushAll()\`).



**---**



**## Instrucciones para levantar el proyecto desde cero**



**### Requisitos previos**

\- **\*\*Node.js\*\*** y **\*\*npm\*\*** instalados.

\- Una instancia de **\*\*MongoDB\*\*** en ejecución (local, en contenedor Docker o en MongoDB Atlas).



**### 1. Levantar MongoDB (con Docker, instancia local o Atlas)**

Si se utiliza Docker, ejecutar:



\`\`\`bash

docker run -d --name mongodb-tp2 -p 27017:27017 mongo:latest

\`\`\`



**### 2. Instalar dependencias**

Desde la raíz del proyecto:



\`\`\`bash

npm install

\`\`\`



**### 3. Configurar las variables de entorno (\`.env\`)**

Crear o verificar el archivo \`.env\` en la raíz del proyecto:



\`\`\`env

PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/antisocial_net

MAX_COMMENT_AGE_MONTHS=3

\`\`\`



**\*\*Ejemplos de \`MONGO_URI\` para apuntar a otra instancia sin modificar el código:\*\***

\- **\*\*MongoDB local / Docker\*\***: \`MONGO_URI=mongodb://127.0.0.1:27017/antisocial_net\`

\- **\*\*Otro host o contenedor en red\*\***: \`MONGO_URI=mongodb://usuario:password\@192.168.1.50:27017/antisocial_net?authSource=admin\`

\- **\*\*MongoDB Atlas (nube)\*\***: \`MONGO_URI=mongodb+srv://usuario:password\@cluster0.ejemplo.mongodb.net/antisocial_net?retryWrites=true&w=majority\`



**### 4. Iniciar el servidor**



\`\`\`bash

npm start

\`\`\`



(o \`npm run dev\` en modo desarrollo). El servidor quedará disponible en \`http\://localhost:3000\` y la documentación interactiva Swagger en \`http\://localhost:3000/api-docs\`.



**---**



**## Pruebas con Postman y Newman**

La colección definitiva para ejecutar las pruebas del TP2 es:

- `TP2 - MongoDB - Pruebas finales.postman_collection.json` (en la raíz del proyecto).

### Características de la colección

1. **Variable `baseUrl`**: configurada como `http://localhost:3000`.
2. **Preparación de datos**: la colección incluye peticiones que crean los registros necesarios y guardan sus identificadores (`ObjectId`) en variables para las pruebas posteriores. La ejecución verificada se realizó sobre una base de datos existente; no se verificó por separado el resultado sobre una base completamente vacía.
3. **Archivos de prueba incluidos en `postman/files/`**:
   - `postman/files/imagen-valida.jpg`: imagen JPEG válida (menor a 5 MB).
   - `postman/files/archivo-invalido.txt`: archivo de texto para comprobar el rechazo de formatos no permitidos (`400`).
   - `postman/files/imagen-falsa.jpg`: archivo con extensión JPG cuyo contenido no es una imagen real (`400`).
   - `postman/files/imagen-mayor-5mb.jpg`: archivo superior a 5 MB para comprobar el límite de tamaño (`400`).

### Ejecución automatizada con Newman

Con MongoDB y el servidor de la API en ejecución, abrir una terminal en la **raíz del repositorio** y ejecutar:

```bash
npx newman run "TP2 - MongoDB - Pruebas finales.postman_collection.json" --working-dir "."
```

La opción `--working-dir "."` hace que Newman resuelva los archivos locales desde la raíz del proyecto. Si Newman no está instalado, `npx` puede solicitar autorización para descargarlo.

**Resultado de la ejecución verificada el 15/11/2026:** 58 peticiones, 100 aserciones aprobadas y 0 fallidas. Se incluyeron pruebas de carga de imágenes, formatos inválidos, archivos con extensión engañosa y límite de 5 MB.

**Nota sobre Postman Runner:** algunas versiones o extensiones de Postman no resuelven correctamente las rutas relativas de los archivos locales. Esto puede producir errores en las peticiones de carga de archivos aunque la API funcione. Para reproducir la ejecución completa se recomienda el comando de Newman indicado arriba. En Postman Desktop también puede configurarse el directorio de trabajo o seleccionarse manualmente cada archivo.

---


**## Contrato completo de Endpoints**



\| Método | Endpoint | Descripción |

\| :--- | :--- | :--- |

\| \`GET\` | \`/\` | Verificar que la API esté activa. |

\| \`GET\` | \`/api/users\` | Consultar todos los usuarios registrados. |

\| \`GET\` | \`/api/users/:id\` | Consultar un usuario por su ID. |

\| \`POST\` | \`/api/users\` | Crear un usuario con \`nickName\` único (\`201\` / \`409\` si ya existe). |

\| \`PUT\` / \`PATCH\` | \`/api/users/:id\` | Actualizar el \`nickName\` de un usuario. |

\| \`DELETE\` | \`/api/users/:id\` | Eliminar un usuario y limpiar sus recursos asociados. |

\| \`GET\` | \`/api/users/:id/followers\` | Consultar los seguidores de un usuario. |

\| \`POST\` | \`/api/users/:id/follow\` | Seguir a un usuario. |

\| \`POST\` | \`/api/users/:id/unfollow\` | Dejar de seguir a un usuario. |

\| \`GET\` | \`/api/posts\` | Consultar todas las publicaciones (con autor, imágenes, tags y comentarios visibles). |

\| \`POST\` | \`/api/posts\` | Crear una publicación (descripción obligatoria, imágenes y tags opcionales). |

\| \`GET\` | \`/api/posts/:id\` | Consultar una publicación por ID (filtra comentarios con antigüedad mayor a \`MAX_COMMENT_AGE_MONTHS\`). |

\| \`PATCH\` / \`PUT\` | \`/api/posts/:id\` | Actualizar la descripción de una publicación. |

\| \`DELETE\` | \`/api/posts/:id\` | Eliminar una publicación y sus comentarios, imágenes y asociaciones de tags. |

\| \`POST\` | \`/api/posts/:id/tags\` | Agregar etiquetas a una publicación. |

\| \`DELETE\` | \`/api/posts/:id/tags/:tagId\` | Quitar una etiqueta de una publicación (sin borrarla del catálogo). |

\| \`GET\` | \`/api/posts/:id/comments\` | Consultar todos los comentarios almacenados de una publicación. |

\| \`GET\` | \`/api/posts/:id/comments/:commentId\` | Consultar un comentario específico por ID. |

\| \`POST\` | \`/api/posts/:id/comments\` | Agregar un comentario a una publicación. |

\| \`PATCH\` / \`PUT\` | \`/api/posts/:id/comments/:commentId\` | Editar el contenido de un comentario. |

\| \`DELETE\` | \`/api/posts/:id/comments/:commentId\` | Eliminar un comentario de una publicación. |

\| \`POST\` | \`/api/posts/:id/images\` | Subir una imagen al servidor y asociarla a la publicación. |

\| \`DELETE\` | \`/api/posts/:id/images/:imageId\` | Eliminar una imagen de una publicación y su archivo local. |

\| \`GET\` | \`/api/tags\` | Listar el catálogo general de etiquetas. |

\| \`GET\` | \`/api/tags/:id\` | Consultar una etiqueta del catálogo por ID. |

\| \`POST\` | \`/api/tags\` | Crear una etiqueta en el catálogo (\`201\` / \`409\` si ya existe). |

\| \`PUT\` / \`PATCH\` | \`/api/tags/:id\` | Renombrar una etiqueta en el catálogo. |

\| \`DELETE\` | \`/api/tags/:id\` | Eliminar una etiqueta del catálogo y sus asociaciones en \`PostTag\`. |