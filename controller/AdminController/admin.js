const User = require("../../model/UserModel");
const Task = require("../../model/TaskModel");
const Project = require("../../model/ProjectModel");
const Team = require("../../model/TeamModel")
const { z } = require("zod");
const bcrypt = require("bcrypt");
const { path } = require("pdfkit");


exports.createEmployee = async (req, res) => {
    const signUpVaildation = z.object({
        email: z.string().email({ message: "Enter valid email" }),
        username: z.string().min(2, { message: "Enter Username" }),
        password: z.string().min(5, { message: "Enter 5 digit" })
    });

    try {
        const validResult = signUpVaildation.safeParse(req.body);
        if (!validResult.success) {
            return res.status(500).json({ error: validResult.error.issues[0].message });
        }
        const { email, username, password, role } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exist" })
        }

        const hashPassword = await bcrypt.hash(password, 12);
        const avatarLink = `https://api.dicebear.com/6.x/initials/svg?seed=${username}`;
        const user = new User({ email, username, password: hashPassword, role, profileImage: avatarLink });

        const response = await user.save();
        const userData = await User.find({}).select("-password");

        req.app.get("io").emit("all-users", userData);

        return res.status(200).json({ message: "success", response })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server error" });
    }
}


exports.allManagers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        const managers = users.filter((item) => {
            return item.role === "Manager"
        });

        req.app.get("io").emit("all-users", managers);
        return res.status(200).json({ message: managers });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.allAdmins = async (req, res) => {
    try {
        const users = await User.find({});
        const admin = users.filter((item) => {
            return item.role === "Admin"
        });
        req.app.get("io").emit("all-users", admin);

        return res.status(200).json({ message: admin });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.allUsers = async (req, res) => {
    try {
        const users = await User.find({});
        const userList = users.filter((item) => {
            return item.role === "User"
        });
        req.app.get("io").emit("all-users", userList);
        return res.status(200).json({ message: userList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.notAssignUser = async (req, res) => {
    try {
        const users = await User.find({});
        const notAssignUser = users.filter((item) => {
            return (item.role === "User" && item.assignUser === false)
        });
        return res.status(200).json({ message: notAssignUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


exports.assignUser = async (req, res) => {
    try {
        const users = await User.find({});
        const assignUser = users.filter((item) => {
            return (item.role === "User" && item.assignUser === true)
        });
        return res.status(200).json({ message: assignUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.assignUserToManager = async (req, res) => {
    try {
        const { managerId, userIds } = req.body;
        console.log("Data", managerId, userIds);
        if (!managerId || !userIds || !userIds.length) {
            return res.status(400).json({ message: "Manager or users not provided" });
        }

        const alreadyAssigned = await User.find({ _id: { $in: userIds }, assignUser: true });
        if (alreadyAssigned.length > 0) {
            return res.status(400).json({
                message: "Some users are already assigned",
                users: alreadyAssigned.map(u => u.username)
            });
        }

        await User.updateMany(
            { _id: { $in: userIds } },
            { $set: { assignUser: true, manager: managerId } }
        );

        await User.findByIdAndUpdate(
            managerId,
            { $push: { assignUserList: { $each: userIds } } },
            { new: true }
        );

        return res.status(200).json({ message: "Users assigned successfully ✅" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.userActivationDetails = async (req, res) => {
    try {
        const users = await User.find({});
        const activeUsers = users.filter((user) => {
            return user.userStatus === true;
        });

        const notActiveUsers = users.filter((user) => {
            return user.userStatus === false;
        });
        return res.status(200).json({ Active: activeUsers, NotActive: notActiveUsers });
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal erver error");
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.query.userId;
        const response = await User.deleteOne({ _id: userId });
        return res.status(200).json({ message: "User Deleted Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal erver error");
    }
}

exports.allDetails = async (req, res) => {
    try {
        const userData = await User.find({});
        const tasks = await Task.find({});

        const totalAdmin = userData.filter(user => user.role === "Admin").length;
        const totalManager = userData.filter(user => user.role === "Manager").length;
        const totalUser = userData.filter(user => user.role === "User").length;

        const totalPending = tasks.filter(task => task.status === "Pending").length;
        const totalProcess = tasks.filter(task => task.status === "Process").length;
        const totalDiscuss = tasks.filter(task => task.status === "Discuss").length;
        const totalComplete = tasks.filter(task => task.status === "Complete").length;

        const activeUser = userData.filter(user => user.userStatus === true).length;
        const notActiveUser = userData.filter(user => user.userStatus === false).length;

        const totalProject = (await Project.find({})).length;
        const totalTeam = (await Team.find({})).length;

        return res.status(200).json({
            totalAdmin,
            totalManager,
            totalUser,
            totalPending,
            totalProcess,
            totalDiscuss,
            totalComplete,
            activeUser,
            notActiveUser,
            totalProject,
            totalTeam
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal server error");
    }
};

exports.getAllProjectsByAdmin = async (req, res) => {
    try {
        const projects = await Project.find({}).populate({ path: "manager", select: "username" });
        const reversedProjects = projects.reverse();
        return res.status(200).json({ projects: reversedProjects });
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal server error");
    }
}

exports.AdmincreateProject = async (req, res) => {
    try {
        const email = req.email;
        const userData = await User.findOne({ email });
        const { projectName, endDate, startDate, manager } = req.body;
        const managerId = await User.findById({ _id: manager });
        const exist = await Project.findOne({ projectName });
        if (exist) {
            return res.status(400).json({ message: "Project already created" });
        }
        const projects = new Project({ projectName, manager, startDate, endDate });
        const saveProject = await projects.save();
        const saved = await User.findByIdAndUpdate(managerId._id, { $push: { projectDetails: saveProject._id } }, { new: true });
        const projectList = await Project.find({});
        const allProject = projectList.reverse();
        const onlineUsers = req.app.get("onlineUsers");
        console.log(onlineUsers);
        const io = req.app.get("io");

        const socketId = onlineUsers[managerId.email];
        io.to(socketId).emit("new-Project", allProject);

        const notification = `${projectName} Project assigned by ${userData.username}`;
        if (socketId) {
            req.app.get("io").to(socketId).emit("project-notification", notification);
            io.emit("project-admin",notification);
        }
        return res.status(200).json({ message: `${projectName} Created Successfully`, saved });

    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal server error");
    }
}

exports.updateProjectStatus = async (req, res) => {
    try {
        const { projectId, status } = req.body;
        const validStatus = ["Not Started", "Progress", "Completed"];
        if (!validStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const project = await Project.findByIdAndUpdate(projectId, { status }, { new: true });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        const projectList = await Project.find({});
        req.app.get("io").emit("all-users", { projectList: projectList });
        return res.status(200).json({ message: "Project status updated successfully", project });
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal server error");
    }
}


exports.teamsDetails = async (req, res) => {
    try {
        const teams = await Team.find({})
            .populate('manager', 'username email _id profileImage')
            .populate('projectDetails', 'projectName _id status')
            .populate('userAssign', 'username email _id profileImage');
        req.app.get("io").emit("all-users", teams);
        return res.status(200).json({ teams });
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal server error");
    }
}