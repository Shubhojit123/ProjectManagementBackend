const Projects = require("../../model/ProjectModel");
const Teams = require("../../model/TeamModel");
const Tasks = require("../../model/TaskModel");
const User = require("../../model/UserModel");
const { populate } = require("dotenv");
const { model } = require("mongoose");

exports.createProjects = async (req, res) => {
    try {
        const email = req.email;
        const userData = await User.findOne({ email });
        const { projectName, endDate } = req.body;
        const exist = await Projects.findOne({ projectName });
        if (exist) {
            return res.status(400).json({ message: "Project already created" });
        }
        const projects = new Projects({ projectName, manager: userData._id, endDate });
        const saveProject = await projects.save();
        const saved = await User.findByIdAndUpdate(userData._id, { $push: { projectDetails: saveProject._id } }, { new: true });
        return res.status(200).json({ message: `${projectName} Created Successfully`, saved });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server error" });
    }
}

exports.createTeams = async (req, res) => {
    try {
        const { projectId, teamName } = req.body;
        const existTeam = await Teams.find({ projectDetails: projectId, teamName });
        console.log(existTeam)
        if (existTeam.length > 0) {
            return res.status(400).json({ message: "Team name already exists for this project" });
        }

        const email = req.email;
        const userData = await User.findOne({ email });

        const teams = new Teams({ teamName, manager: userData._id, projectDetails: projectId });
        const saveTeams = await teams.save();
        const projectUpdate = await Projects.findByIdAndUpdate(saveTeams.projectDetails, { $push: { teamsDetails: saveTeams._id } }, { new: true });
        return res.status(200).json({ message: `${teamName} Created Successfully`, projectUpdate: projectUpdate });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server error" });
    }
}


exports.assignUserToTeam = async (req, res) => {
    try {
        const email = req.email;
        const { assignUser, teamId } = req.body;
        const manager = await User.findOne({ email });

        if (!Array.isArray(assignUser)) {
            return res.status(400).json({ message: "assignUser must be an array" });
        }

        const teams = await Teams.findById(teamId);
        if (!teams) {
            return res.status(404).json({ message: "Team not found" });
        }

        // check manager valid kina
        if (teams.manager.toString() !== manager._id.toString()) {
            return res.status(400).json({ message: "This is not your team" });
        }

        // check already assigned user
        const alreadyAssigned = assignUser.filter((userId) =>
            teams.userAssign.includes(userId) // team e already thakle
        );

        if (alreadyAssigned.length > 0) {
            return res.status(400).json({
                message: `Some users are already assigned: ${alreadyAssigned.join(", ")}`
            });
        }

        // baki new user ke update kora
        for (const userId of assignUser) {
            const userData = await User.findById(userId);
            if (userData) {
                await User.findByIdAndUpdate(userId, { userassignteam: teams._id });
            }
        }

        // team e new users push kore dao (duplicate na)
        const updated = await Teams.findByIdAndUpdate(
            teamId,
            { $addToSet: { userAssign: { $each: assignUser } } }, // addToSet duplicate allow kore na
            { new: true }
        );

        return res.status(200).json({ message: "User(s) assigned successfully", updated });
    } catch (error) {
        console.error("Assign error:", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
};


exports.getAllAssignUsers = async (req, res) => {
    try {
        const email = req.email;
        const users = await User.findOne({ email })
            .populate({
                path: "assignUserList",
                populate: {
                    path: "taskDetails",
                }
            });

        return res.status(200).json(users.assignUserList);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
    }
};


exports.getAllProjects = async (req, res) => {
    try {
        const email = req.email;
        const users = await User.findOne({ email })
            .populate({
                path: "projectDetails",
                populate: {
                    path: "teamsDetails",
                }
            });
        return res.status(200).json(users.projectDetails);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server error" });
    }
}


exports.getAllTeams = async (req, res) => {
    try {
        const { projectid } = req.query;
        const teams = await Projects.findOne({ _id: projectid })
            .populate("teamsDetails",);
        return res.status(200).json(teams.teamsDetails);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server error" });
    }
}

exports.getUsersByTeam = async (req, res) => {
    try {
        const { teamsid } = req.query;
        const team = await Teams.findOne({ _id: teamsid })
            .populate({
                path: "userAssign",
                populate: {
                    path: "taskDetails",
                    model: "Tasks"
                }
            });
        return res.status(200).json(team.userAssign);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server error" });
    }
};


exports.assignTasks = async (req, res) => {
    try {
        const email = req.email;
        const { userId, title, description, endDate } = req.body;
        const user = await User.findById(userId);
        const manager = await User.findOne({ email });

        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if (manager._id.toString() !== user.manager.toString()) {
            return res.status(400).json({ message: "It's not your user" });
        }
        console
        const teamId = user.userassignteam;

        const teams = await Teams.findById({ _id: teamId }).populate("projectDetails");

        const projectStartDate = new Date(teams.projectDetails.startDate);
        const projectEndDate = new Date(teams.projectDetails.endDate);
        const taskEndDate = new Date(endDate);

        if (taskEndDate > projectStartDate && taskEndDate < projectEndDate) {
            return res.status(400).json({
                message: "Task end date must be between project start and end date"
            });
        }

        if (teams.projectDetails.endDate < endDate) {
            return res.status(400).json({ message: "Select Less project Date" });
        }

        const task = new Tasks({
            title,
            description,
            manager: manager._id,
            user: userId,
            endDate
        });

        const savedTask = await task.save();

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { taskAssign: true, $push: { taskDetails: savedTask._id } },
            { new: true }
        ).populate("taskDetails");

        const tasks = await Tasks.find({ user: user._id });
        req.app.get("io").emit("all-tasks", tasks);
        const msg = `Your Task Assign By Manager ${manager.username}`;
        const adminMsg = `${user.username} Task Assign By Manager ${manager.username}`;
        req.app.get("io").emit("user-notification", msg)
        req.app.get("io").emit("admin-notification", adminMsg)
        return res.status(200).json({
            message: "Task assigned successfully",
            user: updatedUser,
            teams
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllComments = async (req, res) => {
    try {
        const email = req.email;

        const manager = await User.findOne({ email })
            .populate({
                path: "assignUserList",
                populate: {
                    path: "taskDetails",
                    model: "Tasks"
                }
            });

        let allComments = [];

        manager.assignUserList.forEach(user => {
            user.taskDetails.forEach(task => {
                task.comments.forEach(comment => {
                    allComments.push({
                        userId: user._id,
                        username: user.username,
                        comment: comment
                    });
                });
            });
        });


        return res.status(200).json({
            message: "success",
            data: allComments
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getAllTasks = async (req, res) => {
    try {
        const email = req.email;

        const manager = await User.findOne({ email })
            .populate({
                path: "assignUserList",
                populate: {
                    path: "taskDetails",
                    model: "Tasks"
                }
            });

        return res.status(200).json({
            message: "success",
            data: manager
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


exports.getNotAssignUser = async (req, res) => {
    try {
        const email = req.email;
        const user = await User.findOne({ email }).populate("assignUserList");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("assignUserList:", user.assignUserList);

        const notAssign = user.assignUserList.filter(u => !u.userassignteam);

        return res.status(200).json({ notAssign });
    } catch (error) {
        console.error("Error in getNotAssignUser:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getTaskById = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await User.findById({ _id: userId }).populate("taskDetails");
        return res.status(200).json({ task: user.taskDetails })
    } catch (error) {
        console.error("Error in getNotAssignUser:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const email = req.email;
        const admin = await User.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const response = await User.find({ _id: { $ne: admin._id } }).select("-password");

        const userData = response.filter(user => user._id.toString() !== admin._id.toString());

        const io = req.app.get("io");
        io.emit("all-users", userData);

        return res.status(200).json({ userData });
    } catch (error) {
        console.error("Error in AllUsers:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
