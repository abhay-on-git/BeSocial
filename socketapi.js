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
        console.log("Updated loginUser:", loginUser);
      }
    } catch (error) {
      console.error("Error updating loginUser:", error);
    }
  });

  socket.on("openChat", async (data) => {
    console.log(data, "LLLLLLLLLLLLLLLLL11111111111111111");
    const { sender, reciver } = data;

    const messages = await messageCollection.find({
      $or: [
        {
          sender: sender,
          receiver: reciver,
        },
        {
          sender: reciver,
          receiver: sender,
        },
      ],
    });

    socket.emit("openChat", messages);
  });

  socket.on("messageObject", async (data) => {
    console.log(data);
    const reciver = await userCollection.findOne({
      email: data.reciver,
    });

    console.log(reciver, "rrrrrrrrr");
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
