const { type, status } = require("express/lib/response");
const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
    projectName:{
        type:String,
        required:true
    },
    manager:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    teamsDetails:
    [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Teams"
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:["Not Started","Progress","Completed"],
        default:"Not Started"
    }

});

module.exports = mongoose.model("Projects",projectSchema);