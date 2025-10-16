const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    otp:{
        type:String
    },
    expire:{
        type:Date
    }
});

module.exports = mongoose.model("Otp",otpSchema)