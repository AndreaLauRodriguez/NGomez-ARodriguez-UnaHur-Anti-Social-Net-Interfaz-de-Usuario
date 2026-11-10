export interface User {
  id: string;
  _id?: string;
  nickName: string;
}

export interface Tag {
  id: string;
  _id?: string;
  name: string;
}

export interface PostImage {
  id?: string;
  _id?: string;
  url: string;
  postId?: string;
}

export interface Comment {
  id: string;
  _id?: string;
  content: string;
  date?: string;
  createdAt?: string;
  userId: string;
  postId: string;
  visible?: boolean;
  user?: {
    id: string;
    nickName: string;
  } | null;
}

export interface Post {
  id: string;
  _id?: string;
  description: string;
  date?: string;
  createdAt?: string;
  userId: string;
  user?: {
    id: string;
    nickName: string;
  } | null;
  images?: PostImage[];
  tags?: Tag[];
  comments?: Comment[];
}

export interface CreatePostPayload {
  description: string;
  userId: string;
  tags: string[];
  images: string[];
}

export interface CreateCommentPayload {
  postId: string;
  userId: string;
  content: string;
}

