console.log("forumScrip is runnnnnnning");

// groupChat started here .........

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
let globalGroupId;
const forumTiles = document.querySelectorAll(".forumTiles");

forumTiles.forEach((forum) => {
  forum.addEventListener("click", () => {
    globalGroupId = forum.getAttribute("forumId");
    groupName = forum.getAttribute("forumName");
    console.log(globalGroupId, groupName);
    document.getElementById("forumTitle").textContent = groupName;
    document.querySelectorAll('.dummyMessages').forEach((message)=>{
        message.remove();
    })
    document.querySelectorAll('.groupMessages').forEach((message)=>{
        message.remove();
    })
    socket.emit("openGroupChat",globalGroupId);
  });
});

// Append group messages

function appendGroupMessage(message) {
    console.log(message);
  const chatArea = document.getElementById("chatArea");
  const template = `<div class="groupMessages flex items-start space-x-4">
            <img src='${
                message.createdBy.avatar
            }' alt="User Avatar" class="w-10 h-10 rounded-full" />
            <div>
              <div class="flex items-center space-x-2">
                <h4 class="font-semibold text-gray-900">${
                    message.createdBy.username
                }</h4>
                <span class="text-gray-500 text-sm">${new Date(
                  message.createdAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
              </div>
              <p class="text-gray-800">${message.message}</p>
            </div>
          </div>`;
  chatArea.innerHTML += template;
}

document.getElementById("groupChatForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    sendGroupMessage(loginUser._id, globalGroupId);
  });

function sendGroupMessage(loginUserId, groupId) {
  let messageInput = document.getElementById("messageInput");
  let message = messageInput.value.trim();
//   appendGroupMessage(message);
  if (message !== "") {
      socket.emit("groupMessage", {
          message,
          reciver: groupId,
          sender: loginUserId,
        });
        // appendGroupMessage(message,loginUser);
        
    messageInput.value = ""; // Clear the input field
  }
}

socket.on("groupChatMessage", (groupMessage) => {
    // console.log(groupMessage);
  appendGroupMessage(groupMessage);
});

socket.on("openGroupChat", (messages) => {
    // console.log(messages,'ffffffffffffffffff')
  messages.forEach((groupMessage) => {
    appendGroupMessage(groupMessage);
  });
});
