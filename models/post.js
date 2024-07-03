const { model, Schema } = require("mongoose");

const postSchema = Schema(
  {
    postContent: {
      type: String,
      required: true,
    },
    postImage: {
      type: String,
    },
    createdBy:{
        type:Schema.Types.ObjectId, 
        ref:'user'
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],  
    comments : {
      type:Schema.Types.ObjectId,
      ref:'comment'
    }
  },
  { timestamps: true }
);

const Post = model("post", postSchema);

module.exports = Post;
