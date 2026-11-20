const mongoose = require("mongoose");
const { User } = require("../models");

const validateFollow = async (req, res, next) => {
  try {
    const followedId = req.params.id;
    const followerId = req.body.followerId;

    if (
      !mongoose.isValidObjectId(followedId) ||
      !mongoose.isValidObjectId(followerId)
    ) {
      return res.status(400).json({ error: "El ID del usuario no es válido." });
    }

    if (followedId.toString() === followerId.toString()) {
      return res
        .status(400)
        .json({ error: "Un usuario no puede seguirse a sí mismo." });
    }

    const userToFollow = await User.findById(followedId);
    const follower = await User.findById(followerId);

    if (!userToFollow || !follower) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    req.userToFollow = userToFollow;
    req.follower = follower;

    next();
  } catch (error) {
    next(error);
  }
};

const validateUserExists = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "El ID del usuario no es válido." });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validateFollow, validateUserExists };
