const mongoose = require("mongoose");
const { Comment } = require("../models");

const checkCommentExists = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        error: "El identificador del comentario no es válido.",
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      postId: req.post._id,
    });

    if (!comment) {
      return res.status(404).json({
        error: "El comentario no existe en esta publicación.",
      });
    }

    req.comment = comment;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkCommentExists;
