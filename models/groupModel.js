const mongoose = require('mongoose');


const groupSchema =  mongoose.Schema({

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    groupName: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true
    }

},{timestamps:true})

const groupModel = mongoose.model('group', groupSchema)

module.exports = groupModel;