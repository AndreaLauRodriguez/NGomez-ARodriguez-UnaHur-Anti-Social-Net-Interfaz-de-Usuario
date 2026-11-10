# UnaHur Anti-Social Net — Interfaz de Usuario (FrontEnd)

Aplicación FrontEnd desarrollada en **React + TypeScript + Bootstrap 5** para la red social **"UnaHur Anti-Social Net"**, correspondiente al Segundo Parcial de la materia **Construcción de Interfaces de Usuario** (UNAHUR).

---

## Descripción del Proyecto

La plataforma permite a las personas usuarias:
- **Registrarse** con un `nickName` único validado contra el BackEnd (`POST /users`).
- **Iniciar sesión (Login simulado)** validando la existencia del usuario mediante `GET /users` y comprobando localmente la contraseña fija `"123456"`. La sesión se gestiona de forma global con `useContext` (`AuthContext`) y persiste en `localStorage`.
- **Explorar la Home:** incluye un carrusel de bienvenida de 3 imágenes, filtro interactivo por etiquetas (*Bonus*), publicación destacada al azar (*Bonus*), sección institucional *"Sobre nosotros"* y el **feed de publicaciones recientes**.
- **Ver el Detalle de una Publicación (`/post/:id`):** muestra descripción completa, galería de imágenes, etiquetas, listado de comentarios visibles y un formulario controlado (`useState`) para publicar comentarios nuevos.
- **Acceder al Perfil de Usuario (`/profile` - Ruta Protegida):** muestra el `nickName` actual, estadísticas, botón para cerrar sesión (`logout`) y las publicaciones creadas por ese usuario.
- **Crear Nueva Publicación (`/create-post` - Ruta Protegida):** formulario controlado con descripción obligatoria, carga dinámica de una o más URLs de imágenes y selección de etiquetas obtenidas desde la API (`GET /tags`).

---

## Tecnologías Utilizadas

- **React 19 + TypeScript** (creado con Vite)
- **React Router DOM v7** (`BrowserRouter`, `Routes`, `Route`, `Navigate` y rutas protegidas)
- **Bootstrap 5.3 + Bootstrap Icons** (diseño responsive oscuro, carrusel, tarjetas y alertas visuales)
- **Fetch API** para el consumo de la API REST
- **Hooks:** `useState`, `useEffect`, `useContext`

---

## URL de la API Utilizada

Por defecto, la aplicación consume el BackEnd local en:

```text
http://localhost:3000/api
```

> Si se desea apuntar a otra URL (por ejemplo `http://localhost:3000` sin el prefijo `/api`), se puede crear un archivo `.env` en la carpeta `frontend/` con:
> ```env
> VITE_API_URL=http://localhost:3000
> ```

---

## Instrucciones para Correr en Local

1. Clonar el repositorio y entrar a la carpeta del proyecto FrontEnd:
   ```bash
   cd frontend
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador la dirección indicada en consola (por defecto `http://localhost:5173`).

---

## Integrantes del Grupo

- **Materia:** Construcción de Interfaces de Usuario — Comisión 1 (UNAHUR)
- **Grupo:** Data Forever
