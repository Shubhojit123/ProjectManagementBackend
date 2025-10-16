const monggose = require("mongoose");
const chatSchema = new monggose.Schema({
    senderId:{
        type:monggose.Schema.Types.ObjectId,
        ref:"User"
    },
    receiverId:{
        type:monggose.Schema.Types.ObjectId,
        ref:"User"
    },
    message:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
});

module.exports = monggose.model("Chats",chatSchema);