import { searchUsersByName, logout, fetchPreviousConversations } from "./apiService";
import { showMessage, clearChatDisplay, focusMessageInput, updateReceiverDetails, clearSearchResults, filterDuplicateUsers } from "./utils";

const searchResultContainer = document.getElementById("search-results-container");
const searchInput = document.getElementById("auto-search-user");

let currentReceiver = localStorage.getItem('currentReceiver') || null;

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

if (searchInput) {
  searchInput.addEventListener("keyup", debounce(searchUser, 400));
}

export function initializeChatList() {
  const selectedChats = getSelectedChats();
  if (selectedChats.length > 0) {
    displaySearchResults(selectedChats);
    
    const currentReceiver = getCurrentReceiver();
    if (currentReceiver) {
      const receiver = selectedChats.find(u => u.username === currentReceiver);
      if (receiver) {
        updateReceiverDetails(receiver);
        
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        if (!isMobile) {
          updatePreviousConversation();
        }
      }
    }
  }
}

export function initializeReceiver() {
  currentReceiver = localStorage.getItem('currentReceiver');
  const receiverData = localStorage.getItem("currentReceiverData");
  
  if (receiverData) {
    updateReceiverDetails(JSON.parse(receiverData));
  }
}

export function initializeBackBtn() {
  const backButton = document.querySelector('.back-to-search');
    if (backButton) {
        backButton.addEventListener('click', () => {
            const searchContainer = document.querySelector('.chat-description-container');
            const chatContainer = document.querySelector('.chat-messages-container');
            
            if (searchContainer && chatContainer) {
                searchContainer.classList.remove('hidden');
                chatContainer.classList.remove('active');
            }
        });
    }
}

async function searchUser() {
  const query = searchInput.value.trim();

  try {
    if (query.length >= 2) {
      const users = await searchUsersByName(query);
      const uniqueUsers = filterDuplicateUsers(users);
      displaySearchResults(uniqueUsers);
    } else {
      clearSearchResults();
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    searchResultContainer.innerHTML = "<p>Error fetching users. Please try again later.</p>";
    searchResultContainer.style.display = "block";
  }
}

function displaySearchResults(users) {
  clearSearchResults();
  const selectedChats = getSelectedChats();
  
  const allUsers = [...selectedChats, ...users].reduce((acc, user) => {
    if (!acc.some(u => u.username === user.username)) {
      acc.push(user);
    }
    return acc;
  }, []);

  if (allUsers.length === 0) {
    searchResultContainer.innerHTML = "<p>No users found</p>";
    searchResultContainer.style.display = "block";
    return;
  }

  allUsers.forEach((user) => {
    const chatLink = createChatLink(user);

    if (user.username === currentReceiver) {
      chatLink.classList.add('active-chat');
    }

    searchResultContainer.appendChild(chatLink);

    chatLink.addEventListener("click", (event) => {
      event.preventDefault();
      setCurrentReceiver(user);
      focusMessageInput();
    });
  });

  searchResultContainer.style.display = "block";
}

export function getCurrentReceiver() {
  const storedReceiver = localStorage.getItem('currentReceiver');
  if (storedReceiver !== currentReceiver) {
    currentReceiver = storedReceiver;
  }
  return currentReceiver;
}

async function setCurrentReceiver(user) {
  clearChatDisplay();
  currentReceiver = user.username;

  if (!currentReceiver) {
    console.error("Invalid username provided to setCurrentReceiver");
    return;
  }

  localStorage.setItem("currentReceiverData", JSON.stringify(user));
  localStorage.setItem('currentReceiver', currentReceiver);
  
  addSelectedChat(user);
  updateReceiverDetails(user);

  toggleMobileViews();
  await updatePreviousConversation();
}

function toggleMobileViews() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  
  if (isMobile) {
    const searchContainer = document.querySelector('.chat-description-container');
    const chatContainer = document.querySelector('.chat-messages-container');
    
    if (searchContainer && chatContainer) {
      searchContainer.classList.add('hidden');
      chatContainer.classList.add('active');
    }
  }
}

async function updatePreviousConversation() {
  try {
    const chatContainer = document.getElementById("chat-container");
    if (!chatContainer) return;
    
    chatContainer.innerHTML = "<div class='loading'>Loading messages...</div>";
    
    const sender = localStorage.getItem("username");
    const receiver = getCurrentReceiver();
    
    if (!sender || !receiver) {
      chatContainer.innerHTML = "<div class='empty'>Select a user to view messages</div>";
      return;
    }
    
    const conversations = await fetchPreviousConversations(sender, receiver);
    chatContainer.innerHTML = "";
    
    if (conversations.length === 0) {
      return;
    }
    
    conversations.sort((a, b) => new Date(a.time) - new Date(b.time));
    
    conversations.forEach(message => {
      showMessage({
        sender: message.sender,
        receiver: message.receiver,
        message: message.message,
        time: message.time
      });
    });
    
  } catch (error) {
    console.error("Error loading previous conversations:", error);
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.innerHTML = "<div class='error'>Failed to load messages. Please try again.</div>";
    }
  }
}

function addSelectedChat(user) {
  const chats = getSelectedChats();
  const existingIndex = chats.findIndex(chat => chat.username === user.username);
  
  if (existingIndex === -1) {
    chats.push(user);
    localStorage.setItem('selectedChats', JSON.stringify(chats));
  }
}

function getSelectedChats() {
  const chats = localStorage.getItem('selectedChats');
  return chats ? JSON.parse(chats) : [];
}

function createChatLink(user) {
  const chatLink = document.createElement("a");
  chatLink.href = "#";
  chatLink.classList.add("chat-link");

  const chatDesc = document.createElement("div");
  chatDesc.classList.add("chat-desc");

  const imageDiv = document.createElement("div");
  imageDiv.classList.add("image");

  const userImage = document.createElement("img");


  if (userImage) {

  let profilePicture = user.profilePicture;
  
   profilePicture = profilePicture.replace(/['"]/g, '').trim();
  
  if (profilePicture && !profilePicture.startsWith('http')) {
    profilePicture = `http://localhost:3030/uploads/${profilePicture}`;
  }

  userImage.src = profilePicture;
  userImage.onerror = () => {
      userImage.src = '../chat-images/1.jpeg';
   };
  }

  userImage.alt = `${user.username}'s profile picture`;

  imageDiv.appendChild(userImage);

  const nameDiv = document.createElement("div");
  nameDiv.classList.add("name");

  const userName = document.createElement("h3");
  userName.textContent = user.username;

  nameDiv.appendChild(userName);
  chatDesc.appendChild(imageDiv);
  chatDesc.appendChild(nameDiv);

  const timeDiv = document.createElement("div");
  timeDiv.classList.add("time");

  const time = document.createElement("h3");
  time.textContent = "1:30 pm";

  const volumeIcon = document.createElement("i");
  volumeIcon.classList.add("fa", "fa-volume-up");
  volumeIcon.setAttribute("aria-hidden", "true");

  timeDiv.appendChild(time);
  timeDiv.appendChild(volumeIcon);

  chatLink.appendChild(chatDesc);
  chatLink.appendChild(timeDiv);

  return chatLink;
}

export async function addSenderToSearchResult(senderUserName) {
  try {
    const users = await searchUsersByName(senderUserName);
    const sender = users.find((user) => user.username === senderUserName);
    
    if (!sender) {
      console.log("Sender not found in search result");
      return;
    }

    const existingUser = Array.from(document.querySelectorAll(".chat-link"))
      .find(link => link.querySelector("h3").textContent === sender.username);

    if (!existingUser) {
      displaySearchResults([sender]);
    }
  } catch (error) {
    console.error("Error fetching sender details:", error);
  }
}

export async function logoutUser() {
  const logoutBtn = document.querySelector(".logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        logoutBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Logging out...';
        logoutBtn.disabled = true;

        await logout();
        localStorage.clear();
        window.location.href = "/pages/login.html";
        
      } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
        
        logoutBtn.innerHTML = '<i class="fa fa-sign-out"></i> Logout';
        logoutBtn.disabled = false;
      }
    });
  }
}