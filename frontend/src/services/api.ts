import type {
  User,
  Post,
  Tag,
  Comment,
  PostImage,
  CreatePostPayload,
  CreateCommentPayload,
} from '../types';

// URL base de la API (soporta tanto http://localhost:3000 como http://localhost:3000/api del TP de Persistencia)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const SERVER_BASE_URL = API_URL.replace(/\/api\/?$/, '');

// Helper que intenta primero la ruta directa (ej: /users) y, si da 404, prueba con prefijo /api (ej: /api/users)
async function fetchApi(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const primaryUrl = `${API_URL}${cleanEndpoint}`;
  const response = await fetch(primaryUrl, options);

  if (response.status === 404 && !API_URL.endsWith('/api')) {
    return fetch(`${SERVER_BASE_URL}/api${cleanEndpoint}`, options);
  }

  return response;
}

// ==================== DATOS DE RESPALDO (PARA PROBAR SI EL BACKEND ESTÁ APAGADO) ====================

const MOCK_USERS_KEY = 'unahur_mock_users';
const MOCK_POSTS_KEY = 'unahur_mock_posts';
const MOCK_TAGS_KEY = 'unahur_mock_tags';

const INITIAL_MOCK_USERS: User[] = [
  { id: '665000000000000000000001', nickName: 'andre_unahur' },
  { id: '665000000000000000000002', nickName: 'data_forever' },
  { id: '665000000000000000000003', nickName: 'cyber_coder' },
];

const INITIAL_MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'unahur' },
  { id: 't2', name: 'react' },
  { id: 't3', name: 'typescript' },
  { id: 't4', name: 'mongodb' },
  { id: 't5', name: 'debates' },
];

const INITIAL_MOCK_POSTS: Post[] = [
  {
    id: '665000000000000000000101',
    description:
      '¡Bienvenidos a UnaHur Anti-Social Net! Acá compartimos avances de Construcción de Interfaces de Usuario con React, TypeScript y Bootstrap 5.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    userId: '665000000000000000000001',
    user: { id: '665000000000000000000001', nickName: 'andre_unahur' },
    images: [
      { id: 'img1', url: '/img/banner-antisocial.png' },
      { id: 'img2', url: '/img/Gemini_Generated_Image_cox0ecox0ecox0ec.jpg' },
    ],
    tags: [
      { id: 't1', name: 'unahur' },
      { id: 't2', name: 'react' },
      { id: 't3', name: 'typescript' },
    ],
    comments: [
      {
        id: 'c1',
        content: '¡Quedó espectacular el diseño oscuro con Bootstrap!',
        date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        userId: '665000000000000000000002',
        postId: '665000000000000000000101',
        visible: true,
        user: { id: '665000000000000000000002', nickName: 'data_forever' },
      },
      {
        id: 'c2',
        content: 'Probando los comentarios visibles filtrados por la API.',
        date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        userId: '665000000000000000000003',
        postId: '665000000000000000000101',
        visible: true,
        user: { id: '665000000000000000000003', nickName: 'cyber_coder' },
      },
    ],
  },
  {
    id: '665000000000000000000102',
    description:
      'Terminando la migración a MongoDB con Mongoose en Estrategia de Persistencia. ¿Prefieren embeber documentos o usar referencias ObjectId?',
    date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    userId: '665000000000000000000002',
    user: { id: '665000000000000000000002', nickName: 'data_forever' },
    images: [{ id: 'img3', url: '/img/Gemini_Generated_Image_qus8kqus8kqus8kq.jpg' }],
    tags: [
      { id: 't4', name: 'mongodb' },
      { id: 't5', name: 'debates' },
    ],
    comments: [
      {
        id: 'c3',
        content: 'Referencias ObjectId para comentarios e imágenes así el post no crece sin límite.',
        date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        userId: '665000000000000000000001',
        postId: '665000000000000000000102',
        visible: true,
        user: { id: '665000000000000000000001', nickName: 'andre_unahur' },
      },
    ],
  },
  {
    id: '665000000000000000000103',
    description:
      'En una red anti-social no importan los algoritmos de recomendación: solo código limpio, buenas prácticas y café.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    userId: '665000000000000000000003',
    user: { id: '665000000000000000000003', nickName: 'cyber_coder' },
    images: [{ id: 'img4', url: '/img/Gemini_Generated_Image_2yqdcx2yqdcx2yqd.jpg' }],
    tags: [
      { id: 't1', name: 'unahur' },
      { id: 't5', name: 'debates' },
    ],
    comments: [],
  },
];

const getMockStorage = <T>(key: string, initial: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  } catch {
    return initial;
  }
};

const setMockStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignorar errores de almacenamiento
  }
};

// ==================== NORMALIZADORES DE DATOS ====================

export const resolveImageUrl = (url: string): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:image/') ||
    url.startsWith('/img/')
  ) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${SERVER_BASE_URL}${url}`;
  }
  return url;
};

const normalizeUser = (u: Partial<User> & { _id?: string }): User => ({
  id: String(u.id || u._id || ''),
  nickName: u.nickName || 'Usuario',
});

const normalizeTag = (t: (Partial<Tag> & { _id?: string }) | string): Tag => {
  if (typeof t === 'string') {
    return { id: t, name: t };
  }
  return {
    id: String(t.id || t._id || t.name || ''),
    name: t.name || '',
  };
};

const normalizeImage = (img: (Partial<PostImage> & { _id?: string }) | string): PostImage => {
  if (typeof img === 'string') {
    return { url: resolveImageUrl(img) };
  }
  return {
    id: String(img.id || img._id || ''),
    url: resolveImageUrl(img.url || ''),
    postId: img.postId ? String(img.postId) : undefined,
  };
};

const normalizeComment = (c: Partial<Comment> & { _id?: string; text?: string }): Comment => ({
  id: String(c.id || c._id || ''),
  content: c.content || c.text || '',
  date: c.date || c.createdAt,
  userId: String(c.userId || ''),
  postId: String(c.postId || ''),
  visible: c.visible ?? true,
  user: c.user
    ? {
        id: String(c.user.id || (c.user as { _id?: string })._id || ''),
        nickName: c.user.nickName,
      }
    : null,
});

const normalizePost = (
  p: Partial<Post> & {
    _id?: string;
    Post_Images?: PostImage[];
    PostImages?: PostImage[];
    Tags?: Tag[];
    Comments?: Comment[];
    User?: User;
  }
): Post => ({
  id: String(p.id || p._id || ''),
  description: p.description || '',
  date: p.date || p.createdAt,
  userId: String(p.userId || p.user?.id || ''),
  user: p.user || p.User ? normalizeUser((p.user || p.User) as User) : null,
  images: (p.images || p.Post_Images || p.PostImages || []).map(normalizeImage),
  tags: (p.tags || p.Tags || []).map(normalizeTag),
  comments: (p.comments || p.Comments || []).map(normalizeComment),
});

async function handleResponse<T>(response: Response, defaultErrorMsg: string): Promise<T> {
  if (!response.ok) {
    let errorMsg = defaultErrorMsg;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || defaultErrorMsg;
    } catch {
      // Si no es JSON, usamos el mensaje por defecto
    }
    throw new Error(errorMsg);
  }
  return response.json() as Promise<T>;
}

// ==================== ENDPOINTS DE USUARIOS ====================

// GET /users -> Lista completa de usuarios
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetchApi('/users');
    const data = await handleResponse<User[]>(response, 'Error al obtener la lista de usuarios');
    return data.map(normalizeUser);
  } catch {
    return getMockStorage<User[]>(MOCK_USERS_KEY, INITIAL_MOCK_USERS);
  }
};

// GET /users/:id -> Obtener usuario por ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await fetchApi(`/users/${id}`);
  const data = await handleResponse<User>(response, 'Error al obtener el usuario');
  return normalizeUser(data);
};

// POST /users -> Crear nuevo usuario
export const registerUser = async (nickName: string): Promise<User> => {
  const cleanNick = nickName.trim();
  let response: Response;

  try {
    response = await fetchApi('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickName: cleanNick }),
    });
  } catch {
    // Si el BackEnd está apagado, validamos y guardamos en almacenamiento local
    const users = getMockStorage<User[]>(MOCK_USERS_KEY, INITIAL_MOCK_USERS);
    const exists = users.some(
      (u) => u.nickName.toLowerCase() === cleanNick.toLowerCase()
    );
    if (exists) {
      throw new Error('No se pudo crear el usuario: el nickName ya existe.');
    }
    const newUser: User = {
      id: `mock_user_${Date.now()}`,
      nickName: cleanNick,
    };
    setMockStorage(MOCK_USERS_KEY, [...users, newUser]);
    return newUser;
  }

  const data = await handleResponse<User>(response, 'No se pudo crear el usuario');
  return normalizeUser(data);
};

// ==================== ENDPOINTS DE PUBLICACIONES ====================

// GET /posts y GET /posts?userId=xxx -> Lista de publicaciones (general o filtrada por usuario)
export const getPosts = async (userId?: string): Promise<Post[]> => {
  try {
    const endpoint = userId
      ? `/posts?userId=${encodeURIComponent(userId)}`
      : '/posts';

    const response = await fetchApi(endpoint);
    const data = await handleResponse<Post[]>(response, 'Error al cargar las publicaciones');
    const normalized = data.map(normalizePost);

    if (userId) {
      return normalized.filter(
        (post) => post.userId === userId || post.user?.id === userId
      );
    }

    return normalized;
  } catch {
    const posts = getMockStorage<Post[]>(MOCK_POSTS_KEY, INITIAL_MOCK_POSTS);
    if (userId) {
      return posts.filter(
        (post) => post.userId === userId || post.user?.id === userId
      );
    }
    return posts;
  }
};

// GET /posts/:id -> Detalle de una publicación
export const getPostById = async (id: string): Promise<Post> => {
  try {
    const response = await fetchApi(`/posts/${id}`);
    const data = await handleResponse<Post>(response, 'No se pudo encontrar la publicación');
    const post = normalizePost(data);

    // Si la API no incluye los comentarios visibles dentro de GET /posts/:id, consultamos GET /comments/post/:postId
    if (!data.comments && !(data as { Comments?: Comment[] }).Comments) {
      try {
        post.comments = await getCommentsByPostId(id);
      } catch {
        // Ignorar si ya estaban embebidos
      }
    }

    // Si la API no incluye las imágenes dentro de GET /posts/:id, consultamos GET /postimages/post/:postId
    if (
      !data.images &&
      !(data as { Post_Images?: PostImage[]; PostImages?: PostImage[] }).Post_Images &&
      !(data as { PostImages?: PostImage[] }).PostImages
    ) {
      try {
        post.images = await getImagesByPostId(id);
      } catch {
        // Ignorar si ya estaban embebidas
      }
    }

    return post;
  } catch {
    const posts = getMockStorage<Post[]>(MOCK_POSTS_KEY, INITIAL_MOCK_POSTS);
    const found = posts.find((p) => p.id === id);
    if (!found) {
      throw new Error('No se pudo encontrar la publicación solicitada.');
    }
    return found;
  }
};

// POST /posts (+ POST /postimages por cada URL de imagen según consigna)
export const createPost = async (payload: CreatePostPayload): Promise<{ postId: string }> => {
  try {
    // 1. Se hace un POST /posts con description, userId y tags (e images si es el backend TP2)
    const response = await fetchApi('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: payload.description.trim(),
        userId: payload.userId,
        tags: payload.tags,
        images: payload.images,
      }),
    });

    const data = await handleResponse<{ postId?: string; id?: string; _id?: string }>(
      response,
      'No se pudo crear la publicación'
    );

    const createdPostId = String(data.postId || data.id || data._id || '');

    // 2. Si se ingresaron URLs de imágenes y el backend usa el endpoint separado POST /postimages:
    if (payload.images.length > 0 && createdPostId && !data.postId) {
      for (const imageUrl of payload.images) {
        try {
          await createPostImage(createdPostId, imageUrl);
        } catch {
          // Si el backend TP2 ya guardó las imágenes en POST /posts, continuamos normalmente
        }
      }
    }

    return { postId: createdPostId };
  } catch {
    const posts = getMockStorage<Post[]>(MOCK_POSTS_KEY, INITIAL_MOCK_POSTS);
    const users = getMockStorage<User[]>(MOCK_USERS_KEY, INITIAL_MOCK_USERS);
    const tags = getMockStorage<Tag[]>(MOCK_TAGS_KEY, INITIAL_MOCK_TAGS);

    const author = users.find((u) => u.id === payload.userId) || {
      id: payload.userId,
      nickName: 'usuario',
    };

    const newPostId = `mock_post_${Date.now()}`;
    const newPost: Post = {
      id: newPostId,
      description: payload.description.trim(),
      date: new Date().toISOString(),
      userId: payload.userId,
      user: author,
      images: payload.images.map((url, idx) => ({
        id: `mock_img_${Date.now()}_${idx}`,
        url,
        postId: newPostId,
      })),
      tags: payload.tags.map((tName) => ({
        id: tName.toLowerCase(),
        name: tName.toLowerCase(),
      })),
      comments: [],
    };

    const updatedTags = [...tags];
    payload.tags.forEach((tName) => {
      const clean = tName.toLowerCase();
      if (!updatedTags.some((t) => t.name.toLowerCase() === clean)) {
        updatedTags.push({ id: clean, name: clean });
      }
    });
    setMockStorage(MOCK_TAGS_KEY, updatedTags);
    setMockStorage(MOCK_POSTS_KEY, [newPost, ...posts]);

    return { postId: newPostId };
  }
};

// DELETE /posts/:id -> Eliminar una publicación
export const deletePost = async (id: string): Promise<void> => {
  try {
    const response = await fetchApi(`/posts/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<{ message?: string }>(
      response,
      'No se pudo eliminar la publicación'
    );
  } catch {
    const posts = getMockStorage<Post[]>(MOCK_POSTS_KEY, INITIAL_MOCK_POSTS);
    const filtered = posts.filter((p) => p.id !== id);
    setMockStorage(MOCK_POSTS_KEY, filtered);
  }
};

// ==================== ENDPOINTS DE IMÁGENES DE POST ====================

// GET /postimages/post/:postId -> Traer imágenes asociadas a un post
export const getImagesByPostId = async (postId: string): Promise<PostImage[]> => {
  const response = await fetchApi(`/postimages/post/${postId}`);
  const data = await handleResponse<PostImage[]>(response, 'Error al obtener imágenes del post');
  return data.map(normalizeImage);
};

// POST /postimages -> Asociar una imagen a un post
export const createPostImage = async (postId: string, url: string): Promise<void> => {
  await fetchApi('/postimages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, url }),
  });
};

// ==================== ENDPOINTS DE COMENTARIOS ====================

// GET /comments/post/:postId -> Comentarios visibles del post
export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  const response = await fetchApi(`/comments/post/${postId}`);
  const data = await handleResponse<Comment[]>(response, 'Error al obtener comentarios');
  return data.map(normalizeComment);
};

// POST /comments (o POST /posts/:id/comments en el backend TP2) -> Crear comentario nuevo
export const createComment = async ({
  postId,
  userId,
  content,
}: CreateCommentPayload): Promise<Comment> => {
  try {
    // Probamos POST /comments (según tabla de endpoints de la consigna)
    const response = await fetchApi('/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, userId, content: content.trim() }),
    });

    if (response.status !== 404) {
      const data = await handleResponse<Comment>(response, 'No se pudo agregar el comentario');
      return normalizeComment(data);
    }

    // Si devuelve 404, usamos la ruta del backend TP2: POST /posts/:id/comments
    const tp2Response = await fetchApi(`/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), userId }),
    });

    const data = await handleResponse<Comment>(tp2Response, 'No se pudo agregar el comentario');
    return normalizeComment(data);
  } catch {
    const posts = getMockStorage<Post[]>(MOCK_POSTS_KEY, INITIAL_MOCK_POSTS);
    const users = getMockStorage<User[]>(MOCK_USERS_KEY, INITIAL_MOCK_USERS);
    const author = users.find((u) => u.id === userId) || {
      id: userId,
      nickName: 'usuario',
    };

    const newComment: Comment = {
      id: `mock_comment_${Date.now()}`,
      content: content.trim(),
      date: new Date().toISOString(),
      userId,
      postId,
      visible: true,
      user: author,
    };

    const updatedPosts = posts.map((p) =>
      p.id === postId
        ? { ...p, comments: [...(p.comments || []), newComment] }
        : p
    );
    setMockStorage(MOCK_POSTS_KEY, updatedPosts);
    return newComment;
  }
};

// ==================== ENDPOINTS DE ETIQUETAS (TAGS) ====================

// GET /tags -> Listado de etiquetas
export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await fetchApi('/tags');
    const data = await handleResponse<Tag[]>(response, 'Error al obtener las etiquetas');
    return data.map(normalizeTag);
  } catch {
    return getMockStorage<Tag[]>(MOCK_TAGS_KEY, INITIAL_MOCK_TAGS);
  }
};
