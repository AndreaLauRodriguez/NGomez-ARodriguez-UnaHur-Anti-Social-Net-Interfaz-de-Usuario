const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/antisocial_net";

  await mongoose.connect(mongoUri);
};

module.exports = connectDB;
