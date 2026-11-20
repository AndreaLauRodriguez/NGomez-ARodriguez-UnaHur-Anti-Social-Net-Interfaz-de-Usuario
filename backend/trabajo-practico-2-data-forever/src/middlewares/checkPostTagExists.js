const mongoose = require("mongoose");
const { PostTag, Tag } = require("../models");

const checkPostTagExists = async (req, res, next) => {
  try {
    const { tagId } = req.params;

    if (!mongoose.isValidObjectId(tagId)) {
      return res.status(400).json({
        error: "El identificador de la etiqueta no es válido.",
      });
    }

    const relation = await PostTag.findOne({
      postId: req.post._id,
      tagId,
    });

    if (!relation) {
      return res.status(404).json({
        error: "La etiqueta no está asociada a esta publicación.",
      });
    }

    const tag = await Tag.findById(tagId);

    if (!tag) {
      return res.status(404).json({
        error: "La etiqueta no existe.",
      });
    }

    req.tag = tag;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkPostTagExists;
