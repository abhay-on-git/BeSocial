const mongoose = require('mongoose');


const groupChatSchema =  mongoose.Schema({

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'group'
    },
    message: {
        type: String,
        required: true
    }

},{timestamps:true})

const groupChatModel = mongoose.model('groupChat', groupChatSchema)

module.exports = groupChatModel;