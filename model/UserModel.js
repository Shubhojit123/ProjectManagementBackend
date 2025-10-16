const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const userSechema = mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    teamDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Teams"
    },
    projectDetails:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Projects"
    }],
    manager:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    assignUserList:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:"null"
        }
    ],
    assignUser:{
        type:Boolean,
        default:false
    },
    taskDetails:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Tasks"
        }
    ],
    taskAssign:{
        type:Boolean,
        default:false
    },
    userassignteam:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Temas",
        default:null
    },

    userStatus:{
        type:Boolean,
        default:true
    },
    profileImage :{
        type:String
    },
    role:{
        type:String,
        enum:["User","Manager","Admin"],
        default:"User"
    },


});

module.exports = mongoose.model("User",userSechema);