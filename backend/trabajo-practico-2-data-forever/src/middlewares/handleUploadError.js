const multer = require("multer");

const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "La imagen no debe superar los 5 MB.",
      });
    }

    return res.status(400).json({
      error: error.message,
    });
  }

  if (error.status === 400 || error.message === "Solo se permiten imágenes JPG, PNG, GIF o WEBP.") {
    return res.status(400).json({
      error: error.message,
    });
  }

  next(error);
};

module.exports = handleUploadError;
