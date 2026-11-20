import type {
  User,
  Post,
  Tag,
  Comment,
  PostImage,
  CreatePostPayload,
  CreateCommentPayload,
} from '../types';

// URL base de la API del BackEnd (http://localhost:3000/api para el TP de Persistencia con MongoDB + Docker)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const SERVER_BASE_URL = API_URL.replace(/\/api\/?$/, '');

// Helper que consulta al BackEnd en /api/... y si recibe 404 prueba sin /api
async function fetchApi(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  try {
    const response = await fetch(`${API_URL}${cleanEndpoint}`, options);

    if (response.status === 404 && API_URL.endsWith('/api')) {
      return await fetch(`${SERVER_BASE_URL}${cleanEndpoint}`, options);
    }

    return response;
  } catch {
    throw new Error(
      'El BackEnd (http://localhost:3000) no está corriendo. Asegurate de abrir Docker Desktop (contenedor mongodb-tp2) y levantar el BackEnd con npm run dev.'
    );
  }
}

// Helper para extraer un mensaje de error claro de la respuesta HTTP
async function getErrorMessage(response: Response, fallbackMsg: string): Promise<string> {
  try {
    const data = await response.json();
    return data?.error || data?.message || fallbackMsg;
  } catch {
    return fallbackMsg;
  }
}

// Normaliza la URL de una imagen devuelta por el BackEnd (/uploads/... -> http://localhost:3000/uploads/...)
export function resolveImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('/uploads/')) {
    return `${SERVER_BASE_URL}${trimmed}`;
  }
  return trimmed;
}

// Normaliza un documento Post proveniente de MongoDB (_id o id)
function normalizePost(raw: Record<string, unknown>, index = 0): Post {
  const id = String(raw.id ?? raw._id ?? index);
  const rawUser = (raw.user ?? raw.User) as Record<string, unknown> | undefined;
  const userId = String(raw.userId ?? rawUser?.id ?? rawUser?._id ?? '');

  const rawImages = (raw.images ?? raw.Post_Images ?? raw.PostImages ?? []) as Array<
    Record<string, unknown> | string
  >;
  const images: PostImage[] = Array.isArray(rawImages)
    ? rawImages.map((img, idx) => {
        if (typeof img === 'string') {
          return { id: `${id}-img-${idx}`, url: resolveImageUrl(img), postId: id };
        }
        return {
          id: String(img.id ?? img._id ?? `${id}-img-${idx}`),
          url: resolveImageUrl(String(img.url ?? '')),
          postId: String(img.postId ?? id),
        };
      })
    : [];

  const rawTags = (raw.tags ?? raw.Tags ?? []) as Array<Record<string, unknown> | string>;
  const tags: Tag[] = Array.isArray(rawTags)
    ? rawTags.map((tag, idx) => {
        if (typeof tag === 'string') {
          return { id: `tag-${idx}`, name: tag };
        }
        return {
          id: String(tag.id ?? tag._id ?? `tag-${idx}`),
          name: String(tag.name ?? ''),
        };
      })
    : [];

  const rawComments = (raw.comments ?? raw.Comments ?? []) as Array<Record<string, unknown>>;
  const comments: Comment[] = Array.isArray(rawComments)
    ? rawComments.map((c, idx) => {
        const cUser = (c.user ?? c.User) as Record<string, unknown> | undefined;
        return {
          id: String(c.id ?? c._id ?? `${id}-c-${idx}`),
          content: String(c.content ?? c.text ?? ''),
          date: String(c.date ?? c.createdAt ?? new Date().toISOString()),
          userId: String(c.userId ?? cUser?.id ?? cUser?._id ?? ''),
          postId: String(c.postId ?? id),
          visible: c.visible !== undefined ? Boolean(c.visible) : true,
          user: cUser
            ? {
                id: String(cUser.id ?? cUser._id ?? ''),
                nickName: String(cUser.nickName ?? 'usuario'),
              }
            : undefined,
        };
      })
    : [];

  return {
    id,
    description: String(raw.description ?? ''),
    date: String(raw.date ?? raw.createdAt ?? new Date().toISOString()),
    userId,
    user: rawUser
      ? {
          id: String(rawUser.id ?? rawUser._id ?? userId),
          nickName: String(rawUser.nickName ?? 'usuario'),
        }
      : undefined,
    images,
    tags,
    comments,
  };
}

// ==================== USUARIOS ====================

export async function getUsers(): Promise<User[]> {
  const response = await fetchApi('/users');
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Error al obtener los usuarios'));
  }
  const data = await response.json();
  return Array.isArray(data)
    ? data.map((u: Record<string, unknown>) => ({
        id: String(u.id ?? u._id ?? ''),
        nickName: String(u.nickName ?? ''),
      }))
    : [];
}

export async function createUser(nickName: string): Promise<User> {
  const response = await fetchApi('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickName: nickName.trim() }),
  });
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, 'No se pudo registrar el usuario (¿nickName ya en uso?)')
    );
  }
  const u = await response.json();
  return {
    id: String(u.id ?? u._id ?? ''),
    nickName: String(u.nickName ?? nickName.trim()),
  };
}

export const registerUser = createUser;

export async function getUserFollowers(userId: string): Promise<User[]> {
  const response = await fetchApi(`/users/${userId}/followers`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data)
    ? data.map((u: Record<string, unknown>) => ({
        id: String(u.id ?? u._id ?? ''),
        nickName: String(u.nickName ?? ''),
      }))
    : [];
}

export async function followUser(targetUserId: string, followerId: string): Promise<void> {
  const response = await fetchApi(`/users/${targetUserId}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerId }),
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'No se pudo seguir al usuario'));
  }
}

export async function unfollowUser(targetUserId: string, followerId: string): Promise<void> {
  const response = await fetchApi(`/users/${targetUserId}/unfollow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerId }),
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'No se pudo dejar de seguir al usuario'));
  }
}

// ==================== PUBLICACIONES (POSTS) ====================

export async function getPosts(userId?: string): Promise<Post[]> {
  const query = userId !== undefined ? `?userId=${encodeURIComponent(userId)}` : '';
  const response = await fetchApi(`/posts${query}`);
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Error al obtener las publicaciones'));
  }
  const data = await response.json();
  const posts = Array.isArray(data)
    ? data.map((item, idx) => normalizePost(item as Record<string, unknown>, idx))
    : [];
  if (userId !== undefined) {
    return posts.filter((p) => String(p.userId) === String(userId));
  }
  return posts;
}

export async function getPostById(postId: string): Promise<Post> {
  const response = await fetchApi(`/posts/${postId}`);
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'No se encontró la publicación solicitada'));
  }
  const data = await response.json();
  return normalizePost(data as Record<string, unknown>);
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const cleanImages = (payload.images ?? []).map((u) => u.trim()).filter(Boolean);
  const cleanTags = (payload.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean);

  const response = await fetchApi('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: payload.description.trim(),
      userId: String(payload.userId),
      images: cleanImages.length > 0 ? cleanImages : undefined,
      tags: cleanTags.length > 0 ? cleanTags : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Error al crear la publicación'));
  }

  const created = await response.json();
  const createdId = String(created.postId ?? created.id ?? created._id ?? '');

  if (createdId) {
    if (payload.imageFiles && payload.imageFiles.length > 0) {
      for (const file of payload.imageFiles) {
        await uploadPostImageFile(createdId, file);
      }
    }

    try {
      return await getPostById(createdId);
    } catch {
      return {
        id: createdId,
        description: payload.description.trim(),
        date: new Date().toISOString(),
        userId: String(payload.userId),
        images: cleanImages.map((url, idx) => ({
          id: `temp-${idx}`,
          url: resolveImageUrl(url),
        })),
        tags: cleanTags.map((name, idx) => ({ id: `tag-${idx}`, name })),
        comments: [],
      };
    }
  }

  return normalizePost(created as Record<string, unknown>);
}

export async function deletePost(postId: string): Promise<void> {
  const response = await fetchApi(`/posts/${postId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'No se pudo eliminar la publicación'));
  }
}

// ==================== IMÁGENES EN PUBLICACIONES ====================

export async function uploadPostImageFile(postId: string, file: File): Promise<PostImage> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetchApi(`/posts/${postId}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'No se pudo subir el archivo de imagen'));
  }

  const data = await response.json();
  return {
    id: String(data.id ?? data._id ?? Date.now()),
    url: resolveImageUrl(String(data.url ?? '')),
    postId: String(data.postId ?? postId),
  };
}

export async function deletePostImage(postId: string, imageId: string): Promise<void> {
  const response = await fetchApi(`/posts/${postId}/images/${imageId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'No se pudo eliminar la imagen'));
  }
}

// ==================== COMENTARIOS ====================

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  try {
    const post = await getPostById(postId);
    if (Array.isArray(post.comments)) {
      return post.comments.filter((c) => c.visible !== false);
    }
  } catch {
    // Fallback si el endpoint de comments está separado
  }

  const response = await fetchApi(`/posts/${postId}/comments`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data)
    ? data
        .map((c: Record<string, unknown>, idx: number) => ({
          id: String(c.id ?? c._id ?? idx),
          content: String(c.content ?? c.text ?? ''),
          date: String(c.date ?? c.createdAt ?? new Date().toISOString()),
          userId: String(c.userId ?? ''),
          postId: String(c.postId ?? postId),
          visible: c.visible !== undefined ? Boolean(c.visible) : true,
        }))
        .filter((c) => c.visible !== false)
    : [];
}

export async function createComment(payload: CreateCommentPayload): Promise<Comment> {
  const response = await fetchApi(`/posts/${payload.postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: String(payload.userId),
      content: payload.content.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Error al publicar el comentario'));
  }

  const c = await response.json();
  return {
    id: String(c.id ?? c._id ?? Date.now()),
    content: String(c.content ?? payload.content.trim()),
    date: String(c.date ?? new Date().toISOString()),
    userId: String(c.userId ?? payload.userId),
    postId: String(c.postId ?? payload.postId),
    visible: true,
  };
}

// ==================== ETIQUETAS (TAGS) ====================

export async function getTags(): Promise<Tag[]> {
  const response = await fetchApi('/tags');
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data)
    ? data.map((t: Record<string, unknown>, idx: number) => ({
        id: String(t.id ?? t._id ?? idx),
        name: String(t.name ?? ''),
      }))
    : [];
}
