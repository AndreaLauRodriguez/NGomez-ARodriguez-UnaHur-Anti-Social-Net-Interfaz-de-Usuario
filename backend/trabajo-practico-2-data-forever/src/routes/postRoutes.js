const express = require("express");
const router = express.Router();

const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addTags,
  removeTag,
  getPostComments,
  getCommentById,
  addComment,
  updateComment,
  deleteComment,
  addImage,
  deleteImage,
} = require("../controllers/postController");

const validate = require("../middlewares/validate");
const checkPostExists = require("../middlewares/checkPostExists");
const checkPostTagExists = require("../middlewares/checkPostTagExists");
const checkImageExists = require("../middlewares/checkImageExists");
const checkPostUserExists = require("../middlewares/checkPostUserExists");
const checkCommentUserExists = require("../middlewares/checkCommentUserExists");
const validateImageId = require("../middlewares/validateImageId");
const validateImageFile = require("../middlewares/validateImageFile");
const uploadImage = require("../middlewares/uploadImage");
const handleUploadError = require("../middlewares/handleUploadError");
const checkCommentExists = require("../middlewares/checkCommentExists");

const {
  createPostSchema,
  createCommentSchema,
  updateCommentSchema,
} = require("../schemas/postSchema");

const updatePostSchema = require("../schemas/updatePostSchema");
const addTagsSchema = require("../schemas/addTagsSchema");

router.get("/", getPosts);
router.get("/:id", checkPostExists, getPostById);
router.post("/", validate(createPostSchema), checkPostUserExists, createPost);
router.patch("/:id", validate(updatePostSchema), checkPostExists, updatePost);
router.put("/:id", validate(updatePostSchema), checkPostExists, updatePost);
router.delete("/:id", checkPostExists, deletePost);

router.post("/:id/tags", validate(addTagsSchema), checkPostExists, addTags);
router.delete("/:id/tags/:tagId", checkPostExists, checkPostTagExists, removeTag);

router.get("/:id/comments", checkPostExists, getPostComments);
router.get("/:id/comments/:commentId", checkPostExists, checkCommentExists, getCommentById);
router.post(
  "/:id/comments",
  validate(createCommentSchema),
  checkPostExists,
  checkCommentUserExists,
  addComment
);
router.patch(
  "/:id/comments/:commentId",
  validate(updateCommentSchema),
  checkPostExists,
  checkCommentExists,
  updateComment
);
router.put(
  "/:id/comments/:commentId",
  validate(updateCommentSchema),
  checkPostExists,
  checkCommentExists,
  updateComment
);
router.delete(
  "/:id/comments/:commentId",
  checkPostExists,
  checkCommentExists,
  deleteComment
);

router.post(
  "/:id/images",
  checkPostExists,
  uploadImage.single("image"),
  handleUploadError,
  validateImageFile,
  addImage
);
router.delete(
  "/:id/images/:imageId",
  checkPostExists,
  validateImageId,
  checkImageExists,
  deleteImage
);

module.exports = router;
