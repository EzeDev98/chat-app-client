import { connectToWebSocketAndReceiveMessages, sendMessages } from "./webSocket";
import { addSenderToSearchResult, getCurrentReceiver, initializeReceiver, logoutUser, initializeChatList, initializeBackBtn, } from "./userService";
import { showMessage, populateUserProfile, focusMessageInput } from "./utils";

document.addEventListener("DOMContentLoaded", () => {
  const submitButton = document.getElementById("submit");
  const currentUser = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!currentUser) {
    window.location.href = "/pages/login.html";
    return;
  }

  initializeApplication();
  setupWebSocketConnection();
  setupEventListeners();

  function initializeApplication() {
    populateUserProfile();
    initializeReceiver();
    initializeChatList();
    initializeBackBtn();
    logoutUser();
  }

  function setupWebSocketConnection() {
    connectToWebSocketAndReceiveMessages(
      currentUser,
      token,
      handleIncomingMessage
    );
  }

  function setupEventListeners() {
    if (submitButton) {
      submitButton.addEventListener("click", (event) => {
        event.preventDefault();
        sendMessage();
      });
    }
  }

  function handleIncomingMessage(message) {
    const currentReceiver = getCurrentReceiver();

    if ((message.sender === currentUser && message.receiver === currentReceiver) ||
        (message.sender === currentReceiver && message.receiver === currentUser) ||
        (message.receiver === currentUser)) {
      showMessage(message);
    }
  
    if (message.sender !== currentUser) {
      addSenderToSearchResult(message.sender);
    }
  }

  function sendMessage() {
    const receiver = getCurrentReceiver();
    const messageInput = document.getElementById("send-message");
    const messageContent = messageInput.value.trim();

    console.log("Sending message to:", receiver);

    if (!receiver) {
      alert("Please select a user to chat with");
      return;
    }

    if (!messageContent) {
      alert("Message cannot be empty");
      return;
    }

    try {
      const success = sendMessages(
        currentUser,
        receiver,
        messageContent,
        token
      );
      
      if (success) {
        messageInput.value = "";
        focusMessageInput();

        if (receiver !== currentUser) {
          showMessage({
            sender: currentUser,
            receiver: receiver,
            message: messageContent,
            time: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  }
});
