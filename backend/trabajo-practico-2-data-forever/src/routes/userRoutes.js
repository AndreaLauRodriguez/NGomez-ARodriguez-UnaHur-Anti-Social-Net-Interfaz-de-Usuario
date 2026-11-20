const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
} = require("../controllers/userController");

const validate = require("../middlewares/validate");
const {
  validateFollow,
  validateUserExists,
} = require("../middlewares/validateFollow");

const {
  createUserSchema,
  updateUserSchema,
  followUserSchema,
} = require("../schemas/userSchema");

router.get("/", getUsers);
router.get("/:id", validateUserExists, getUserById);
router.post("/", validate(createUserSchema), createUser);
router.put("/:id", validate(updateUserSchema), validateUserExists, updateUser);
router.patch("/:id", validate(updateUserSchema), validateUserExists, updateUser);
router.delete("/:id", validateUserExists, deleteUser);

router.get("/:id/followers", validateUserExists, getFollowers);
router.post("/:id/follow", validate(followUserSchema), validateFollow, followUser);
router.post("/:id/unfollow", validate(followUserSchema), validateFollow, unfollowUser);

module.exports = router;
