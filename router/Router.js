const express = require("express");
const router  = express.Router();

const {signUp,login,logout,roleCheck,userProfile,profileView,isLogin} = require("../controller/LoginSignup");
const {auth,isAdmin,isManager,isUser,allowRoles,isLogut} = require("../middlewire/MiddleWire");
const {createEmployee,assignUserToManager,allDetails,allManagers,allUsers,notAssignUser,allAdmins,
        assignUser,userActivationDetails,deleteUser,getAllProjectsByAdmin,AdmincreateProject,updateProjectStatus,
        teamsDetails
} = require("../controller/AdminController/admin");


const {createProjects,createTeams,assignUserToTeam,
        getAllAssignUsers,getAllProjects,getAllTeams,
        getUsersByTeam,assignTasks,getAllComments,getAllTasks,getNotAssignUser,getTaskById,getAllUsers
        } = require("../controller/ManagerController/managerController");

const {getUsersInfo,getAlllTasks,updateTasks,addComment,
        getCommunity,changePassword,requestOtp,resetPassword} = require("../controller/UserController/userController");

const {chats} = require("../controller/AiController/DeepSeekController");        

const {sendMsg,getMsg} = require("./../controller/ChatController/chatController")

//Login signUp
router.post("/signup",signUp);
router.post("/login",login);
router.get("/profile-view",auth,profileView);
router.get("/loggedin",auth,isLogin)
//Admin
router.post("/admin/create-employee",auth,isAdmin,createEmployee);
router.put("/admin/user-assign",auth,isAdmin,assignUserToManager);
router.get("/admin/all-mangers",auth,isAdmin,allManagers);
router.get("/admin/alluser",auth,isAdmin,allUsers);
router.get("/admin/not-assignuser",auth,isAdmin,notAssignUser);
router.get("/admin/assign-users",auth,isAdmin,assignUser);
router.get("/admin/activation-user-details",auth,isAdmin,userActivationDetails);
router.delete("/admin/delete-user",auth,isAdmin,deleteUser);
router.get("/admin/all-details",auth,isAdmin,allDetails);
router.get("/admin/all-admin",auth,isAdmin,allAdmins);
router.get("/admin/all-members",auth,getAllUsers);
router.get("/admin/all-projects",auth,isAdmin,getAllProjectsByAdmin);
router.post("/admin/create-project",auth,isAdmin,AdmincreateProject);
router.put("/admin/update-project-status",auth,isAdmin,updateProjectStatus);
router.get("/admin/team-details",auth,isAdmin,teamsDetails);
router.post("/chat",auth,chats);

//Manager
router.post("/manager/create-project",auth,isManager,createProjects);
router.post("/manager/create-team",auth,isManager,createTeams);
router.put("/manager/set-user",auth,isManager,assignUserToTeam);
router.get("/manager/user-list",auth,isManager,getAllAssignUsers);
router.get("/manager/project-list",auth,isManager,getAllProjects);
router.get("/manager/teams-list",auth,isManager,getAllTeams);
router.get("/manager/user-team",auth,isManager,getUsersByTeam);
router.post("/manager/assign-task",auth,isManager,assignTasks);
router.get("/manager/all-comments",auth,isManager,getAllComments);
router.get("/manager/all-tasks",auth,isManager,getAllTasks);
router.get("/manager/notassign",auth,isManager,getNotAssignUser);
router.get("/manager/task-by-id",auth,isManager,getTaskById);

//User

router.get("/user/user-info",auth,isUser,getUsersInfo);
router.get("/user/tasks",auth,isUser,getAlllTasks);
router.put("/user/update-task",auth,isUser,updateTasks);
router.put("/user/comment",auth,isUser,addComment);
router.get("/user/get-community",auth,isUser,getCommunity);



// use for only loggedin person
router.get("/request-otp",auth,allowRoles,requestOtp);
router.post("/reset-password",auth,allowRoles,resetPassword);
router.get("/logout",auth,allowRoles,logout);
router.get("/role",roleCheck);
router.get("/profile",auth,userProfile);
//tan stack quary api calling 


//chat 

router.post("/send-message",auth,sendMsg);
router.get("/get-message/:id",auth,getMsg);


router.get("/helth",(req,res)=>{
        res.send("Server Running")
})

module.exports = router;