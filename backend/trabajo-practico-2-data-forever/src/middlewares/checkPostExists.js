const mongoose = require("mongoose");
const { Post } = require("../models");

const checkPostExists = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "El identificador de la publicación no es válido.",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        error: "La publicación no existe.",
      });
    }

    req.post = post;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkPostExists;
