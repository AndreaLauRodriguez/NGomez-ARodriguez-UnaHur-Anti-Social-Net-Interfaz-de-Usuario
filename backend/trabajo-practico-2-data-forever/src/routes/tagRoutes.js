const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const checkTagExists = require("../middlewares/checkTagExists");
const tagSchema = require("../schemas/tagSchema");
const {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");

router.get("/", getTags);
router.get("/:id", checkTagExists, getTagById);
router.post("/", validate(tagSchema), createTag);
router.put("/:id", validate(tagSchema), checkTagExists, updateTag);
router.patch("/:id", validate(tagSchema), checkTagExists, updateTag);
router.delete("/:id", checkTagExists, deleteTag);

module.exports = router;
