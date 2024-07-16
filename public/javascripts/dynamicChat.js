function getCookie(name) {
  let matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

const loginUserData = JSON.parse(getCookie("user"));

const socket = io();
const loginUser = loginUserData;
//   const loginUser = JSON.parse('<%- JSON.stringify(loginUser).replace(/\\/g, '\\\\') %>');
// const user =  JSON.parse('<%- JSON.stringify(user).replace(/\\/g, '\\\\') %>') ;  ;

let avatar;
let username;
let email;
document.querySelectorAll(".userTile").forEach((user) => {
  user.addEventListener("click", () => {
    avatar = user.getAttribute("userAvatar");
    username = user.getAttribute("userName");
    email = user.getAttribute("userEmail");
    openChat(avatar, username, email);
  });
});

privateChatById = document.getElementById("privateChatById").value.toString();
if (privateChatById !== "null") {
  const userData = document.getElementById("userData");
  avatar = userData.getAttribute("userAvatar");
  username = userData.getAttribute("userName");
  email = userData.getAttribute("userEmail");
  openChat(avatar, username, email);
}
let usp = io("/user-namespace", {
  auth: {
    token: loginUser._id,
  },
});

const chatArea = document.getElementById("chatArea");
socket.emit("join", loginUser);

function openChat(userAvatar, userName, userEmail) {
  document.querySelectorAll(".dummyMessages").forEach((element) => {
    element.style.display = "none";
  });

  document.getElementById("chatAvatar").src = userAvatar.startsWith("https")
    ? userAvatar
    : "/" + userAvatar;
  document.getElementById("chatUsername").innerHTML = userName;

  socket.emit("openChat", {
    reciver: userEmail || user.email,
    sender: loginUser.email,
  });
}

socket.on("openChat", (messages) => {
  messages.forEach((messageObject) => {
    if (messageObject.sender === loginUser.email) {
      appendOutgoingMessage(messageObject.text);
    } else {
      appendIncomingMessage(messageObject.text);
    }
  });
});

socket.on("max", (messageObject) => {
  appendIncomingMessage(messageObject.message);
});

document.getElementById("messageForm").addEventListener("submit", function (e) {
  e.preventDefault();
  sendMessage(loginUser.email,email);
});

function sendMessage(loginUserEmail,userEmail) {
  let messageInput = document.getElementById("messageInput");
  let message = messageInput.value.trim();

  if (message !== "") {
    appendOutgoingMessage(message);
    socket.emit("messageObject", {
      message,
      reciver: userEmail,
      sender: loginUserEmail,
    });
    messageInput.value = ""; // Clear the input field
  }
}

// Append incoming messages
function appendIncomingMessage(message) {
  const chatArea = document.getElementById("chatArea");
  const template = `<div class="py-1 px-2 w-fit bg-gray-100 rounded-lg">${message}</div>`;
  chatArea.innerHTML += template;
}

// Append outgoing messages
function appendOutgoingMessage(message) {
  const chatArea = document.getElementById("chatArea");
  const template = `<div class="py-1 px-2 w-fit bg-gray-100 ml-auto rounded-lg">${message}</div>`;
  chatArea.innerHTML += template;
}


socket.on("getOnlineUser", ({ userId }) => {
  const lastSeenElement = document.getElementById(`${userId}-status`);
  if (lastSeenElement) {
    lastSeenElement.textContent = "online";
  }
});

socket.on("getOfflineUser", ({ userId, lastSeen }) => {
  const lastSeenElement = document.getElementById(`${userId}-status`);
  if (lastSeenElement) {
    const lastSeenDate = new Date(lastSeen);
    lastSeenElement.textContent = `Last seen: ${lastSeenDate.toLocaleString()}`;
  }
});



