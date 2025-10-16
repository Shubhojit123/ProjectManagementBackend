const { type } = require("express/lib/response");
const mongoose  = require("mongoose");

const logOutSchema = mongoose.Schema({
    email:{
        type:String
    },
    blockCooikes :{
        type:String
    }
});

module.exports = mongoose.model("Logout",logOutSchema);