const mongoose = require("mongoose");

const teamsSchema = mongoose.Schema({
    teamName:{
        type:String,
        required:true
    },

   manager:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    projectDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Projects"
    },

    userAssign:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]

});

module.exports = mongoose.model("Teams",teamsSchema);