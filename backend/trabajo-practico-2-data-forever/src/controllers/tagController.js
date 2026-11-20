const { Tag, PostTag } = require("../models");
const postCache = require("../postCache");

const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.status(200).json(
      tags.map((tag) => ({
        id: String(tag._id),
        name: tag.name,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const getTagById = async (req, res, next) => {
  try {
    res.status(200).json({
      id: String(req.tag._id),
      name: req.tag.name,
    });
  } catch (error) {
    next(error);
  }
};

const createTag = async (req, res, next) => {
  try {
    const name = req.body.name.toLowerCase();
    const exists = await Tag.exists({ name });
    if (exists) {
      return res.status(409).json({
        error: "La etiqueta ya existe.",
      });
    }

    const tag = await Tag.create({ name });
    postCache.flushAll();

    res.status(201).json({
      id: String(tag._id),
      name: tag.name,
    });
  } catch (error) {
    next(error);
  }
};

const updateTag = async (req, res, next) => {
  try {
    const name = req.body.name.toLowerCase();
    const duplicate = await Tag.exists({
      name,
      _id: { $ne: req.tag._id },
    });
    if (duplicate) {
      return res.status(409).json({
        error: "La etiqueta ya existe.",
      });
    }

    req.tag.name = name;
    await req.tag.save();
    postCache.flushAll();

    res.status(200).json({
      message: "Etiqueta actualizada correctamente",
      id: String(req.tag._id),
      name: req.tag.name,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTag = async (req, res, next) => {
  try {
    await PostTag.deleteMany({ tagId: req.tag._id });
    await req.tag.deleteOne();
    postCache.flushAll();

    res.status(200).json({
      message: "Etiqueta eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};
