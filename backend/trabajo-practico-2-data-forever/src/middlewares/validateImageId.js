const mongoose = require("mongoose");

const validateImageId = (req, res, next) => {
  const { imageId } = req.params;

  if (!mongoose.isValidObjectId(imageId)) {
    return res.status(400).json({
      error: "El identificador de la imagen no es válido.",
    });
  }

  next();
};

module.exports = validateImageId;
