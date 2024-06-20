const mongoose = require("mongoose");

exports.connect = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
    } catch (error) {
        console.log(error.message);
    }
}