const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    manager:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:["Pending","Process","Complete","Discuss"],
        default:"Pending"
    },
    comments:[{
        type:String
    }],
    crateedAt:{
        type:Date,
        default:Date.now
    },
    endDate:{
        type:Date,
        required:true
    }
});

module.exports = mongoose.model("Tasks",taskSchema);