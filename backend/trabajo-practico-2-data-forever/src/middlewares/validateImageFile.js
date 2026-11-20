const fs = require("fs/promises");

const isRealImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  const isJpeg =
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  // GIF: "GIF87a" o "GIF89a"
  const isGif =
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61;

  // WEBP: "RIFF" .... "WEBP"
  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isJpeg || isPng || isGif || isWebp;
};

const validateImageFile = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: "Debe adjuntar una imagen.",
    });
  }

  try {
    const fileHandle = await fs.open(req.file.path, "r");
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await fileHandle.read(buffer, 0, 12, 0);
    await fileHandle.close();

    if (!isRealImageBuffer(buffer.subarray(0, bytesRead))) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        error: "Solo se permiten imágenes JPG, PNG, GIF o WEBP.",
      });
    }

    next();
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

module.exports = validateImageFile;
