const mongoose = require('mongoose');


const messageSchema =  mongoose.Schema({

    sender: {
        type: String,
        required: true
    },
    reciver: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }

},{timestamps:true})

const Message = mongoose.model('message', messageSchema)

module.exports = Message;