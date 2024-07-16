const io = require("socket.io")();
const userCollection = require("./models/userCollection");
const messageCollection = require("./models/messageCollection");
const socketapi = {
  io: io,
};
const groupChatModel = require("./models/groupChat");

// Add your socket.io logic here!
io.on("connection", function (socket) {
  console.log("A user connected");
  socket.on("join", async (loginUser) => {
    if (!loginUser) {
      console.error("Invalid loginUser data");
      return;
    }

    try {
      const user = await userCollection.findByIdAndUpdate(loginUser._id, {
        socketId: socket.id,
      });
    } catch (error) {
      console.error("Error updating loginUser:", error);
    }
  });

  socket.on("openChat", async (data) => {
    const { sender, reciver } = data;

    try {
      const messages = await messageCollection.find({
        $or: [
          {
            sender: sender,
            reciver: reciver,
          },
          {
            sender: reciver,
            reciver: sender,
          },
        ],
      });
      socket.emit("openChat", messages);
    } catch (error) {
      console.log(error);
      throw error.message;
    }
  });

  socket.on("messageObject", async (messageObject) => {
    const reciver = await userCollection.findOne({
      email: messageObject.reciver,
    });

    // console.log(reciver, "rrrrrrrrr");
    const socketId = reciver.socketId;
    await messageCollection.create({
      sender: messageObject.sender,
      reciver: messageObject.reciver,
      text: messageObject.message,
    });

    socket.to(socketId).emit("max", messageObject);
  });

  // -------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>

  let usp = io.of("/user-namespace");
  usp.on("connection", async (socket) => {
    const userId = socket.handshake.auth.token;
    const user = await userCollection.findByIdAndUpdate(userId, {
      $set: { isOnline: 1 },
    });
    // update onlineUser Status
    socket.broadcast.emit("getOnlineUser", { userId });

    socket.on("disconnect", async () => {
      // console.log("user disconnected");
      const userId = socket.handshake.auth.token;
      const lastSeen = new Date();
      const user = await userCollection.findByIdAndUpdate(userId, {
        $set: { isOnline: 0, lastSeen: lastSeen },
      });
      // update offlineUser Status
      socket.broadcast.emit("getOfflineUser", { userId,lastSeen });
    });
  });

  // groupChat logic
  socket.on('groupMessage', async (groupMessage) => {
    const groupId = groupMessage.reciver;
  
    try {
      const newMessage = await groupChatModel.create({
        createdBy: groupMessage.sender,
        groupId: groupMessage.reciver,
        message: groupMessage.message,
      });
      // console.log(newMessage);
      
      await newMessage.populate('createdBy')
      socket.emit("groupChatMessage",newMessage)
    } catch (error) {
      console.error('Error creating group message:', error);
      // Handle error appropriately
    }
  });
  

  socket.on("openGroupChat", async (groupId) => {
    try {
      const messages = await groupChatModel.find({ groupId: groupId }).populate("createdBy");
      // console.log(groupId,'gggggggggggggg')
      // console.log(messages,'sssssssssssssssssss')
      socket.emit("openGroupChat", messages);
    } catch (error) {
      console.log(error);
      throw error.message;
    }
  });
  

});

// end of socket.io logic

module.exports = socketapi;
