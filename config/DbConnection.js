const mongoose = require("mongoose")
require("dotenv").config();

exports.dbConnect = async() =>{
    try {
        await mongoose.connect(process.env.DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
        .then(()=>{
            console.log("DB Connected Successfully")
        })
    } catch (error) {
        console.log(`DB error ${error}`)
    }
}