const mongoose = require("mongoose");
const { Tag } = require("../models");

const checkTagExists = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "El identificador de la etiqueta no es válido.",
      });
    }

    const tag = await Tag.findById(id);

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

module.exports = checkTagExists;
