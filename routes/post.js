const Post = require("../models/post");
const fs = require('fs')
const path = require('path')
const uploadPost = require("../utils/uploadPost");
const Comment = require("../models/comment");
const { isLoggedIn } = require("../middlewares/auth");
const { Router } = require("express");
const router = Router();

// Post CRUD Code Starts from here
router.post(
  "/create-post",
  isLoggedIn,
  uploadPost.single("postImage"),
  async (req, res, next) => {
    try {
      const postData = req.body;
      // console.log(req.file.path);
      if (req.file) {
        postData.postImage = req.file.path;
      } else {
        postData.postImage = null;
      }
      postData.createdBy = req.user._id;

      const post = await Post.create(postData);

      post.createdBy = req.user._id;
      req.user.posts.push(post._id);

      await req.user.save();
      await post.save();

      res.redirect(`/feed`);
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

router.post("/like/:id", isLoggedIn, async (req, res, next) => {
  // console.log(req,'userrrrrrIIIDDD')
  try {
    const pid = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(pid);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const isLiked = post.likes.includes(userId);
    const isDisliked = post.dislikes.includes(userId);
    if (isLiked) {
      post.likes.pull(userId);
    }
    if (isDisliked) {
      post.dislikes.pull(userId);
    }
    post.likes.push(userId);

    await post.save();
    res.redirect("/feed");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
});

router.post("/dislike/:id", isLoggedIn, async (req, res, next) => {
  // console.log(req,'userrrrrrIIIDDD')
  try {
    const pid = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(pid);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const isLiked = post.likes.includes(userId);
    const isDisliked = post.dislikes.includes(userId);
    if (isLiked) {
      post.likes.pull(userId);
    }
    if (isDisliked) {
      post.dislikes.pull(userId);
    }
    post.dislikes.push(userId);

    await post.save();
    res.redirect("/feed");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
});

// comment Logic starts here

router.post("/comment/:id", isLoggedIn, async (req, res, next) => {
  const pid = req.params.id;
  const comment = await Comment.create({
    content: req.body.content,
    createdBy: req.user._id,
    postId: pid,
  });
  const post = await Post.findById(pid);
  await post.save();
  if (comment) {
    const post = await Post.findById(pid);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    post.comments.push(comment);
    await post.save();
  }
  res.redirect("/feed");
});

router.post("/deletePost/:id", async (req, res, next) => {
  const pid = req.params.id;

  try {
    console.log(pid)
    await Comment.deleteMany({ postId: pid });

    const post = await Post.findByIdAndDelete(pid);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.redirect("/feed");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/editPost/:id",
  uploadPost.single("postImage"),
  async (req, res, next) => {
    const pid = req.params.id;
    try {
      const post = await Post.findById(pid);
      const postData = req.body;
      if (req.file) {
        postData.postImage = req.file.path;
        if(post.postImage !== null){
          fs.unlinkSync(path.join(__dirname, "..", `${post.postImage}`));
        }
      } else {
        postData.postImage = post.postImage;
      }
      const updatedPost = await Post.findByIdAndUpdate(pid, postData, {
        new: true,
      });
      if (!updatedPost) {
        return res.status(404).send("Post not found");
      }
      res.redirect("/feed");
    } catch (error) {
      console.log(error);
      throw error.message;
    }
  }
);
module.exports = router;
