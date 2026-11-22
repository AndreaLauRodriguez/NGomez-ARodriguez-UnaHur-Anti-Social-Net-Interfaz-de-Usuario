const mongoose = require("mongoose");
const { Post, PostImage, PostTag, Comment, Tag, User } = require("../models");
const postCache = require("../postCache");
const fs = require("fs/promises");
const path = require("path");

const clearPostCache = () => {
  postCache.flushAll();
};

const formatDocument = (document) => {
  const result = document.toObject
    ? document.toObject({ virtuals: true })
    : document;

  return {
    ...result,
    id: String(result._id || result.id),
    _id: undefined,
  };
};

const formatPost = async (post) => {
  const [user, images, relations, comments] = await Promise.all([
    User.findById(post.userId).select("nickName").lean(),
    PostImage.find({ postId: post._id }).lean(),
    PostTag.find({ postId: post._id }).populate("tagId"),
    Comment.find({ postId: post._id }).populate("userId", "nickName"),
  ]);

  return {
    ...formatDocument(post),
    user: user ? { id: String(user._id), nickName: user.nickName } : null,
    images: images.map((image) => ({
      id: String(image._id),
      url: image.url,
    })),
    tags: relations
      .filter((relation) => relation.tagId)
      .map((relation) => ({
        id: String(relation.tagId._id),
        name: relation.tagId.name,
      })),
    comments: comments
      .filter((comment) => comment.visible)
      .map((comment) => ({
        id: String(comment._id),
        content: comment.content,
        date: comment.date,
        userId: String(comment.userId?._id || comment.userId),
        postId: String(comment.postId),
        visible: comment.visible,
        user: comment.userId?.nickName
          ? {
              id: String(comment.userId._id),
              nickName: comment.userId.nickName,
            }
          : null,
      })),
  };
};

const getPosts = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(200).json([]);
      }

      const cacheKey = `posts:user:${userId}`;
      const cachedUserPosts = postCache.get(cacheKey);

      if (cachedUserPosts !== undefined) {
        return res.status(200).json(cachedUserPosts);
      }

      const posts = await Post.find({ userId }).sort({ date: -1 });
      const formattedPosts = await Promise.all(posts.map(formatPost));

      postCache.set(cacheKey, formattedPosts);

      return res.status(200).json(formattedPosts);
    }

    const cachedPosts = postCache.get("posts:all");

    if (cachedPosts !== undefined) {
      return res.status(200).json(cachedPosts);
    }

    const posts = await Post.find().sort({ date: -1 });
    const formattedPosts = await Promise.all(posts.map(formatPost));

    postCache.set("posts:all", formattedPosts);

    res.status(200).json(formattedPosts);
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const cacheKey = `posts:${req.post._id}`;
    const cachedPost = postCache.get(cacheKey);

    if (cachedPost !== undefined) {
      return res.status(200).json(cachedPost);
    }

    const result = await formatPost(req.post);

    postCache.set(cacheKey, result);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { description, userId, images = [], tags = [] } = req.body;

    const post = await Post.create({ description, userId });

    if (images.length) {
      await PostImage.insertMany(
        images.map((url) => ({ url, postId: post._id }))
      );
    }

    const tagNames = [...new Set(tags.map((name) => name.toLowerCase()))];

    for (const name of tagNames) {
      const tag = await Tag.findOneAndUpdate(
        { name },
        { $setOnInsert: { name } },
        { upsert: true, returnDocument: "after" }
      );

      await PostTag.updateOne(
        { postId: post._id, tagId: tag._id },
        { $setOnInsert: { postId: post._id, tagId: tag._id } },
        { upsert: true }
      );
    }

    clearPostCache();

    res.status(201).json({
      message: "Publicación creada exitosamente",
      postId: String(post._id),
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    req.post.description = req.body.description;
    await req.post.save();

    clearPostCache();

    res.status(200).json({
      message: "Publicación actualizada correctamente",
      post: formatDocument(req.post),
    });
  } catch (error) {
    next(error);
  }
};

const removeLocalFile = async (url) => {
  if (!url || !url.startsWith("/uploads/")) return;

  const filePath = path.join(
    __dirname,
    "../public/uploads",
    path.basename(url)
  );

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "No se pudo eliminar el archivo local en disco:",
        error.message
      );
    }
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.post._id;
    const images = await PostImage.find({ postId });

    await Promise.all([
      Comment.deleteMany({ postId }),
      PostTag.deleteMany({ postId }),
      PostImage.deleteMany({ postId }),
    ]);

    await req.post.deleteOne();

    for (const image of images) {
      await removeLocalFile(image.url);
    }

    clearPostCache();

    res.status(200).json({
      message: "Publicación eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
};

const addTags = async (req, res, next) => {
  try {
    const names = [...new Set(req.body.tags.map((name) => name.toLowerCase()))];

    const tags = [];

    for (const name of names) {
      const tag = await Tag.findOneAndUpdate(
        { name },
        { $setOnInsert: { name } },
        { upsert: true, returnDocument: "after" }
      );

      await PostTag.updateOne(
        { postId: req.post._id, tagId: tag._id },
        {
          $setOnInsert: {
            postId: req.post._id,
            tagId: tag._id,
          },
        },
        { upsert: true }
      );

      tags.push(formatDocument(tag));
    }

    clearPostCache();

    res.status(200).json({
      message: "Etiquetas agregadas correctamente",
      tags,
    });
  } catch (error) {
    next(error);
  }
};

const removeTag = async (req, res, next) => {
  try {
    await PostTag.deleteOne({
      postId: req.post._id,
      tagId: req.tag._id,
    });

    clearPostCache();

    res.status(200).json({
      message: "Etiqueta quitada de la publicación correctamente",
    });
  } catch (error) {
    next(error);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.post._id }).sort({
      date: -1,
    });

    res.status(200).json(comments.map((comment) => formatDocument(comment)));
  } catch (error) {
    next(error);
  }
};

const getCommentById = async (req, res, next) => {
  try {
    res.status(200).json(formatDocument(req.comment));
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const commentData = {
      content: req.body.content,
      userId: req.body.userId,
      postId: req.post._id,
    };

    if (req.body.date) {
      commentData.date = req.body.date;
    }

    const comment = await Comment.create(commentData);

    clearPostCache();

    res.status(201).json(formatDocument(comment));
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    req.comment.content = req.body.content;
    await req.comment.save();

    clearPostCache();

    res.status(200).json({
      message: "Comentario actualizado correctamente",
      id: String(req.comment._id),
      content: req.comment.content,
      comment: formatDocument(req.comment),
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    await req.comment.deleteOne();

    clearPostCache();

    res.status(200).json({
      message: "Comentario eliminado correctamente",
    });
  } catch (error) {
    next(error);
  }
};

const addImage = async (req, res, next) => {
  try {
    const image = await PostImage.create({
      url: `/uploads/${req.file.filename}`,
      postId: req.post._id,
    });

    clearPostCache();

    res.status(201).json(formatDocument(image));
  } catch (error) {
    if (req.file && req.file.filename) {
      await removeLocalFile(`/uploads/${req.file.filename}`);
    }
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const url = req.image.url;

    await req.image.deleteOne();
    await removeLocalFile(url);

    clearPostCache();

    res.status(200).json({
      message: "Imagen eliminada correctamente.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addTags,
  removeTag,
  getPostComments,
  getCommentById,
  addComment,
  updateComment,
  deleteComment,
  addImage,
  deleteImage,
};
