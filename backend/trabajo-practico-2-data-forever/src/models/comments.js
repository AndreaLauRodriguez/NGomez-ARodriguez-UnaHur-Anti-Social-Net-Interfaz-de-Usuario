const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        ret.userId = String(ret.userId);
        ret.postId = String(ret.postId);
        delete ret._id;

        if (!doc.populated("user")) {
          delete ret.user;
        } else if (ret.user) {
          ret.user = {
            id: String(ret.user.id || ret.user._id),
            nickName: ret.user.nickName,
          };
        }

        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        ret.userId = String(ret.userId);
        ret.postId = String(ret.postId);
        delete ret._id;
        return ret;
      },
    },
  },
);

commentSchema.virtual("visible").get(function () {
  const maxMonths = parseInt(process.env.MAX_COMMENT_AGE_MONTHS || 3, 10);
  const limitDate = new Date();
  limitDate.setMonth(limitDate.getMonth() - maxMonths);

  const commentDate = new Date(this.date);
  return commentDate >= limitDate;
});

commentSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Comment", commentSchema);
