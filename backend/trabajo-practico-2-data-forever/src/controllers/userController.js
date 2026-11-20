const { User, Post, PostImage, PostTag, Comment } = require("../models");
const postCache = require("../postCache");
const fs = require("fs/promises");
const path = require("path");

const createUser = async (req, res, next) => {
  try {
    const { nickName } = req.body;
    const existing = await User.exists({ nickName });
    if (existing) {
      return res.status(409).json({
        error: "Ya existe un usuario con ese nickName.",
      });
    }
    const user = await User.create({ nickName });
    postCache.flushAll();
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("nickName").sort({ _id: 1 });

    res.status(200).json(
      users.map((user) => ({
        id: String(user._id),
        nickName: user.nickName,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    res.status(200).json({
      id: String(req.user._id),
      nickName: req.user.nickName,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { nickName } = req.body;
    const duplicate = await User.exists({
      nickName,
      _id: { $ne: req.user._id },
    });
    if (duplicate) {
      return res.status(409).json({
        error: "Ya existe un usuario con ese nickName.",
      });
    }

    req.user.nickName = nickName;
    await req.user.save();
    postCache.flushAll();

    res.status(200).json({
      message: "Usuario actualizado correctamente",
      id: String(req.user._id),
      nickName: req.user.nickName,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const authoredPosts = await Post.find({ userId }).select("_id");
    const postIds = authoredPosts.map((post) => post._id);
    const images = await PostImage.find({ postId: { $in: postIds } });

    await Promise.all([
      Comment.deleteMany({ $or: [{ userId }, { postId: { $in: postIds } }] }),
      PostTag.deleteMany({ postId: { $in: postIds } }),
      PostImage.deleteMany({ postId: { $in: postIds } }),
      Post.deleteMany({ userId }),
      User.updateMany({}, { $pull: { followers: userId, following: userId } }),
    ]);

    await req.user.deleteOne();

    for (const img of images) {
      if (img.url && img.url.startsWith("/uploads/")) {
        const filePath = path.join(
          __dirname,
          "../public/uploads",
          path.basename(img.url)
        );
        try {
          await fs.unlink(filePath);
        } catch (error) {
          if (error.code !== "ENOENT") {
            console.error(
              "No se pudo eliminar el archivo local de imagen:",
              error.message
            );
          }
        }
      }
    }

    postCache.flushAll();
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const { userToFollow, follower } = req;

    await User.findByIdAndUpdate(userToFollow._id, {
      $addToSet: { followers: follower._id },
    });

    await User.findByIdAndUpdate(follower._id, {
      $addToSet: { following: userToFollow._id },
    });

    res.status(200).json({
      message: `El usuario ${follower.id} ahora sigue a ${userToFollow.id}`,
    });
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const { userToFollow, follower } = req;

    await User.findByIdAndUpdate(userToFollow._id, {
      $pull: { followers: follower._id },
    });

    await User.findByIdAndUpdate(follower._id, {
      $pull: { following: userToFollow._id },
    });

    res.status(200).json({
      message: `El usuario ${follower.id} dejó de seguir a ${userToFollow.id}`,
    });
  } catch (error) {
    next(error);
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const user = await req.user.populate("followers", "nickName");

    const followers = user.followers.map((follower) => ({
      id: String(follower._id),
      nickName: follower.nickName,
    }));

    res.status(200).json(followers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
};
