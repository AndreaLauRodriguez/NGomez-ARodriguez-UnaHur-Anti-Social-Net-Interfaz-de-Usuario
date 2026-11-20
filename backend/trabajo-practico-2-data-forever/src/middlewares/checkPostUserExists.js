const { User } = require("../models");

const checkPostUserExists = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);

    if (!user) {
      return res.status(404).json({
        error: "El usuario indicado no existe.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkPostUserExists;
