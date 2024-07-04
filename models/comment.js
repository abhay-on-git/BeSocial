const {model,Schema} = require('mongoose')

const commentSchema = new Schema({
    content:{
        type:String,
        required:true,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    postId:{
        type:Schema.Types.ObjectId,
        ref:'post',
    }
},{timestamps:true})

const Comment = model('comment',commentSchema)

module.exports = Comment;