const Projects = require("../../model/ProjectModel");
const Teams = require("../../model/TeamModel");
const Tasks = require("../../model/TaskModel");
const User = require("../../model/UserModel");
const otpGenerator = require('otp-generator');
const bcrypt = require("bcrypt");
const Otp = require("../../model/OtpModel");
const { date } = require("zod");
exports.getUsersInfo = async (req, res) => {
    try {
        const email = req.email;
        const userData = await User.findOne({ email }).populate("manager","username _id");
        const userTeamId = userData.userassignteam;
        const userId = userData._id;
        const userTeam = await Teams.findById(userTeamId).populate("projectDetails", "projectName");
        const pendingCount = await Tasks.countDocuments({ user: userId, status: "Pending" });
        const processCount = await Tasks.countDocuments({ user: userId, status: "Process" });
        const completeCount = await Tasks.countDocuments({ user: userId, status: "Complete" });
        const userPayload = {
            userTeam,
            userData,
            pending: pendingCount,
            process: processCount,
            complete: completeCount,
            
        };
        return res.status(200).json({ message: userPayload });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

exports.getAlllTasks = async (req, res) => {
    try {
        const email = req.email;
        const userData = await User.findOne({ email });
        const userId = userData._id;
        const tasks = await Tasks.find({ user: userId });
        req.app.get("io").emit("all-tasks", tasks);
        return res.status(200).json({ message: tasks });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}


exports.updateTasks = async (req, res) => {
    try {
        const { taskId, state } = req.body;
        const updated = await Tasks.findByIdAndUpdate(taskId, { status: state }, { new: true });
        return res.status(200).json({ message: updated });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

// implement msg broker for manager notification servics
exports.addComment = async (req, res) => {
    try {
        const { taskId, comment } = req.body;
        const update = await Tasks.findByIdAndUpdate(taskId, { $push: { comments: comment } }, { new: true });
        return res.status(200).json({ message: update });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

exports.getCommunity = async (req, res) => {
    try {
        const email = req.email;
        const userData = await User.findOne({ email });
        const userassignteam = userData.userassignteam;
        const team = await Teams.findById(userassignteam).populate("userAssign", "username _id");

        const payLoad = team.userAssign.map((user) => ({
            userId: user._id,
            username: user.username
        }))

        return res.status(200).json({ message: payLoad });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}


// here implement email system
// exports.changePassword = async (req, res) => {
//     try {
//         const email = req.email;
//         const userData = await User.findOne({ email });
//         const { password, reqOtp } = req.body;
//         if (!reqOtp) {
//             const generatedOtp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false , digits:true,lowerCaseAlphabets:false});
//             const expire = Date.now() + 2 * 60 * 1000;
//             const existOtp = await Otp.findOne({ email });
//             if (existOtp) {
//                 try {
//                     await Otp.findByIdAndUpdate(existOtp._id, { otp: generatedOtp, expire });
//                     return res.status(200).json({email, OTP: generatedOtp, Expire: "2 minutes" });
//                 } catch (error) {
//                     console.log(error);
//                     return res.status(500).json({ message: "Internal Server error" });
//                 }
//             }
//             else {
//                 const otp = new Otp({ email, otp: generatedOtp, expire });
//                 await otp.save();
//                 return res.status(200).json({ OTP: generatedOtp, Expire: "2 minutes" });
//             }

//         }
//         else {
//             if (!password || !reqOtp) {
//                 return res.status(400).json({ message: "Please Fil properly" });
//             }

//             const existOtp = await Otp.findOne({ email });
//             if(!existOtp)
//             {
//                 return res.status(400).json({ message: "Please Resend Otp" })
//             }
//             if (reqOtp === existOtp.otp && Date.now() <= existOtp.expire) {
//                 const hashPassword = await bcrypt.hash(password, 12);
//                 await User.findByIdAndUpdate(userData._id, { password: hashPassword }, { new: true });
//                 await Otp.deleteOne({ email });
//                 return res.status(200).json({ message: "Updated Successfully" })
//             }
//             else {

//                 if (existOtp.expire < Date.now()) {
//                     return res.status(400).json({ message: "Otp expired" });
//                 }
//                 if (reqOtp !== existOtp.otp) {
//                     return res.status(400).json({ message: "Incorrect Otp" });
//                 }
//             }
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server error" });
//     }
// };



// Request OTP
exports.requestOtp = async (req, res) => {
  try {
    const email = req.email;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const generatedOtp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expire = Date.now() + 2 * 60 * 1000; 

    const existOtp = await Otp.findOne({ email });
    if (existOtp) {
      await Otp.findByIdAndUpdate(existOtp._id, { otp: generatedOtp, expire });
    } else {
      const otp = new Otp({ email, otp: generatedOtp, expire });
      await otp.save();
    }

    return res.status(200).json({ message: "OTP sent successfully", email, expireIn: "2 minutes" , generatedOtp});
  } catch (error) {
    console.error("Request OTP error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const existOtp = await Otp.findOne({ email });
    if (!existOtp) return res.status(400).json({ message: "Please request OTP first" });

    if (Date.now() > existOtp.expire) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired, please request again" });
    }

    if (otp !== existOtp.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

