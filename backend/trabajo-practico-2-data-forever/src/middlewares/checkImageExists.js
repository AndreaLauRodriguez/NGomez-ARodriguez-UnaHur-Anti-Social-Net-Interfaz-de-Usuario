const mongoose = require("mongoose");
const { PostImage } = require("../models");

const checkImageExists = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    if (!mongoose.isValidObjectId(imageId)) {
      return res.status(400).json({
        error: "El identificador de la imagen no es válido.",
      });
    }

    const image = await PostImage.findOne({
      _id: imageId,
      postId: req.post._id,
    });

    if (!image) {
      return res.status(404).json({
        error: "La imagen no existe en esta publicación.",
      });
    }

    req.image = image;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkImageExists;
