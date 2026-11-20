const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nickName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.followers;
        delete ret.following;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model("User", userSchema);
