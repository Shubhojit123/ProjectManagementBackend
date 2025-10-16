const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = async () => {
  const dbUrl =  "mongodb+srv://shubhojit778:Shubhojit%40123@cluster0.iz6rv.mongodb.net/projectmanagement?retryWrites=true&w=majority"
  if (!dbUrl) {
    console.error("DB_URL is not defined in environment variables!");
    return;
  }

  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000
    });
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log(`DB error: ${error}`);
  }
};
