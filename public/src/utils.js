import { getCurrentReceiver } from "./userService";

const searchResultContainer = document.getElementById("search-results-container");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

export function isValidPassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasSpecialChar &&
    hasNumber
  );
}

export function setupPasswordToggle() {
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input");
      const icon = this.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });
}

export function displayErrorMessages(messages) {
  errorText.innerHTML = messages;
  errorMessage.style.display = "block";
}

export function showMessage(message) {
  const chatContainer = document.getElementById("chat-container");
  if (!chatContainer) return;

  const currentReceiver = getCurrentReceiver();
  const currentUser = localStorage.getItem("username");

  const isCurrentConversation =
    (message.sender === currentUser && message.receiver === currentReceiver) ||
    (message.sender === currentReceiver && message.receiver === currentUser);

  if (!isCurrentConversation) return;

  const isSender = message.sender === currentUser;
  const isReceiver = message.sender === currentReceiver || message.receiver === currentUser;

  if (!isSender && !isReceiver) return;

  const messageElement = document.createElement("div");
  messageElement.classList.add(
    isSender ? "message-contents-sender" : "message-contents-receiver"
  );

  const time = new Date(message.time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageElement.innerHTML = `
    <div class="missive ${isSender ? "sender-message" : "receiver-message"}">
      <h6>${message.message}</h6>
      <h5>${time}</h5>
    </div>
  `;

  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

export function clearChatDisplay() {
  const chatContainer = document.getElementById("chat-container");
  if (chatContainer) {
    chatContainer.innerHTML = ""; 
  }
}

export function populateUserProfile() {
  const profileImage = document.querySelector('.profile-image-con img');
  const profileName = document.querySelector('.profile-name-details h3');
  const chatHeadImage = document.querySelector('#chek-now');
  
  const username = localStorage.getItem('username');
  const firstname = localStorage.getItem('firstname');
  const lastname = localStorage.getItem('lastname');
  const profilePicture = localStorage.getItem('profilePicture');
  
  if (profilePicture) {
    profileImage.src = profilePicture;
    chatHeadImage.src = profilePicture;
  }
  
  const fullName = firstname && lastname && username
    ? `${firstname} ${lastname} ${username}`
    : username;
  profileName.textContent = fullName;
}

export function updateReceiverDetails(receiver) {
  const receiverImage = document.querySelector('.message-head .friend-details img');
  const receiverName = document.querySelector('.friend-contact h3');
  const receiverPhone = document.querySelector('.friend-contact h4');
  
  const modalImage = document.querySelector('.message-image-details img');
  const modalName = document.querySelector('.message-image-details h3');
  const modalPhone = document.querySelector('.message-image-details h4');

  let profilePicture = receiver.profilePicture || '';
  profilePicture = profilePicture.replace(/['"]/g, '').trim();
  
  if (profilePicture && !profilePicture.startsWith('http')) {
    profilePicture = `http://localhost:3030/uploads/${profilePicture}`;
  }

  if (receiverImage) {
    receiverImage.src = profilePicture;
    receiverImage.onerror = () => {
      receiverImage.src = '../chat-images/1.jpeg';
    };
  }

  if (receiverName) {
    receiverName.textContent = receiver.username || 'Unknown User';
  }

  if (receiverPhone) {
    receiverPhone.textContent = receiver.phoneNumber || 'No phone number';
  }

  if (modalImage) {
    modalImage.src = profilePicture || '../chat-images/1.jpeg';
    modalImage.onerror = () => {
      modalImage.src = '../chat-images/1.jpeg';
    };
  }

  if (modalName) {
    modalName.textContent = receiver.username || 'Unknown User';
  }

  if (modalPhone) {
    modalPhone.textContent = receiver.phoneNumber || 'No phone number';
  }
}

export function filterDuplicateUsers(users) {
  const uniqueUsers = [];
  const usernames = new Set();
  
  users.forEach(user => {
    if (!usernames.has(user.username)) {
      usernames.add(user.username);
      uniqueUsers.push(user);
    }
  });
  
  return uniqueUsers;
}

export function clearSearchResults() {
  if (searchResultContainer) {
    searchResultContainer.innerHTML = "";
    searchResultContainer.style.display = "none";
  }
}

export function focusMessageInput() {
  const chatMessageContainer = document.querySelector(".message-foot");
  if (!chatMessageContainer) return;

  chatMessageContainer.scrollIntoView({ behavior: "smooth" });

  const inputBox = document.querySelector("#send-message");
  if (inputBox) {
    inputBox.focus();
  }
}
