const io = require("socket.io")();
const userCollection = require("./models/userCollection");
const messageCollection = require("./models/messageCollection");
const socketapi = {
  io: io,
};
const he = require("he");

// Add your socket.io logic here!
io.on("connection", function (socket) {
  console.log("A user connected");
  socket.on("join", async (loginUser) => {
    
    console.log(loginUser);
    if (!loginUser) {
      console.error("Invalid loginUser data");
      return;
    }


    try {
       const user = await userCollection.findByIdAndUpdate(
         loginUser._id,
         { socketId: socket.id },
       
       );

      if (!loginUser) {
        console.error("loginUser not found or could not be updated");
      } else {
        // console.log("Updated loginUser:", loginUser);
      }
    } catch (error) {
      console.error("Error updating loginUser:", error);
    }
  });

  socket.on("openChat", async (data) => {
    const { sender, reciver } = data;
    console.log(sender, reciver);
    
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
      console.log(messages, "LLLLLLLLLLLLLLLLL11111111111111111");
      socket.emit("openChat", messages);
    } catch (error) {
      console.log(error)
      throw(error.message)
    }
  });

  socket.on("messageObject", async (messageObject) => {
    console.log(messageObject);
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
});

// end of socket.io logic

module.exports = socketapi;
