const connectDB = require("../config/database");
const User = require("./user");
const Post = require("./post");
const PostImage = require("./post_images");
const PostTag = require("./postTag");
const Comment = require("./comments");
const Tag = require("./tag");

module.exports = {
  connectDB,
  User,
  Post,
  PostImage,
  PostTag,
  Comment,
  Tag,
};
