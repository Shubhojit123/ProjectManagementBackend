const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = async () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error("DB_URL is not defined in environment variables!");
    return;
  }

  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log(`DB error: ${error}`);
  }
};
