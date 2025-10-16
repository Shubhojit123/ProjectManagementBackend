const User = require("../../model/UserModel");
const Teams = require("../../model/TeamModel");
const Project = require("../../model/ProjectModel");
const Tasks = require("../../model/TaskModel");
const { DeepchatModal } = require("./DeepSeekModal");
const {ollamaChatModal} = require("../../model/OllamModal");
const { populate } = require("dotenv");
const {chating} = require("./RAG")

exports.chats = async (req, res) => {
  try {
    const email = req.email;
    const { prompt } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user.role);
    userDetails = {
      name: user.name,
      id:user._id,
    }
    const role = user.role;
    let response;
    if(role == "User")
    {
      console.log("user");
        response = await chating(prompt,role,userDetails);
    }
    if(role == "Manager")
    {
        response = await chating(prompt,role,userDetails);
    }
    if(role == "Admin")
    {
       response = await chating(prompt,role,userDetails);
    }
    return res.status(200).json({ message: "Success", data:response });
  }
  catch (error) {
    console.error("Error in /rag/api/chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}