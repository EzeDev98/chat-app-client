document.addEventListener("DOMContentLoaded", () => {
  const searchResultContainer = document.getElementById("search-results-container");
  const searchInput = document.getElementById("auto-search-user");
  const submitButton = document.getElementById("submit");

  let receiver = null;

  // Get the current user from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const currentUser = urlParams.get("user");

  // Check if the currentUser is retrieved from URL parameters
  if (currentUser) {
    console.log("Current user found, connecting to WebSocket...");
    connectToWebSocket(currentUser);
  } else {
    alert("No user found. Please log in to continue.");
    console.log("No currentUser found in URL.");
  }

  // Debounce function to limit API calls
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Search input listener with debounce
  if (searchInput) {
    searchInput.addEventListener("keyup", debounce(searchUser, 400));
  }

  // Function to search users
  function searchUser() {
    const query = searchInput.value.trim();

    if (query.length >= 2) {
      fetch(`http://localhost:3030/api/v1/search-user?name=${encodeURIComponent(query)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => displaySearchResults(data))
        .catch((error) => {
          console.error("Error fetching user:", error);
          searchResultContainer.innerHTML = "<p>Error fetching users. Please try again later.</p>";
          searchResultContainer.style.display = "block";
        });
    } else {
      clearSearchResults();
    }
  }

  // Function to clear search results
  function clearSearchResults() {
    searchResultContainer.innerHTML = "";
    searchResultContainer.style.display = "none";
  }

  // Function to display search results
  function displaySearchResults(users) {
    clearSearchResults();

    if (users.length === 0) {
      searchResultContainer.innerHTML = "<p>No users found</p>";
      searchResultContainer.style.display = "block";
      return;
    }

    users.forEach((user) => {
      const chatLink = createChatLink(user);
      searchResultContainer.appendChild(chatLink);

      chatLink.addEventListener("click", (event) => {
        event.preventDefault();
        searchedReceiver(user);
        focusMessageInput();
      });
    });

    searchResultContainer.style.display = "block";
  }

  // Function to update the selected receiver
  function searchedReceiver(user) {
    receiver = user;
    console.log("Receiver: ", receiver.username);
  }

  // Function to create a chat link
  function createChatLink(user) {
    const chatLink = document.createElement("a");
    chatLink.href = "#";
    chatLink.classList.add("chat-link");

    const chatDesc = document.createElement("div");
    chatDesc.classList.add("chat-desc");

    const imageDiv = document.createElement("div");
    imageDiv.classList.add("image");

    const userImage = document.createElement("img");
    userImage.src = user.imageUrl || "../chat-images/1.jpeg";
    userImage.alt = `${user.username}'s profile picture`;

    imageDiv.appendChild(userImage);

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("name");

    const userName = document.createElement("h3");
    userName.textContent = user.username || "John Doe";

    const lastMessage = document.createElement("h4");
    lastMessage.textContent = user.lastMessage || "No message";

    nameDiv.appendChild(userName);
    nameDiv.appendChild(lastMessage);

    chatDesc.appendChild(imageDiv);
    chatDesc.appendChild(nameDiv);

    const timeDiv = document.createElement("div");
    timeDiv.classList.add("time");

    const time = document.createElement("h3");
    time.textContent = user.time || "1:30 pm";

    const volumeIcon = document.createElement("i");
    volumeIcon.classList.add("fa", "fa-volume-up");
    volumeIcon.setAttribute("aria-hidden", "true");

    timeDiv.appendChild(time);
    timeDiv.appendChild(volumeIcon);

    chatLink.appendChild(chatDesc);
    chatLink.appendChild(timeDiv);

    return chatLink;
  }

  // Function to focus on the message input
  function focusMessageInput() {
    const chatMessageContainer = document.querySelector(".message-foot");

    if (chatMessageContainer) {
      chatMessageContainer.scrollIntoView({ behavior: "smooth" });

      const inputBox = document.querySelector("#send-message");

      if (inputBox) {
        inputBox.focus();
      }
    }
  }

  // Function to connect to WebSocket and set up event handlers
  function connectToWebSocket(currentUser) {
    let socket = new SockJS("http://localhost:3030/chat");
    let stompClient = Stomp.over(socket);

    stompClient.connect({ username: currentUser }, onConnected, onError);

    function onError(error) {
      console.error("Could not connect to WebSocket server. Please refresh this page to try again!: " + error);
    }

    function onConnected() {
      
      stompClient.subscribe(`/user/${currentUser}/queue/messages`, (message) => {
        showMessage(JSON.parse(message.body));
      });

      // Subscribe to general chat messages
      stompClient.subscribe("/queue/messages", (message) => {
        showMessage(JSON.parse(message.body));
      });
    }

    // Function to send a message
    function sendMessage() {
      const messageContent = document.getElementById("send-message").value;

      if (messageContent && stompClient && receiver) {
        const chatMessage = {
          sender: currentUser,
          receiver: receiver.username,
          message: messageContent,
          time: new Date().toLocaleTimeString(),
        };

        stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));

        document.getElementById("send-message").value = "";
      } else if (!receiver || !receiver.username) {
        alert("Please search for a user to chat with");
        console.log("Message receiver not selected");
      }
    }

    // Send message on button click
    if (submitButton) {
      submitButton.addEventListener("click", (event) => {
        event.preventDefault();
        sendMessage();
      });
    }
  }

  // Function to display a message in the chat window
  function showMessage(message) {
    const chatContainer = document.getElementById("chat-container");

    const isSender = message.sender === currentUser;
    const isReceiver = message.sender === receiver?.username || message.receiver === currentUser;

    const messageElement = document.createElement("div");

    if (isSender) {
      messageElement.classList.add("message-contents-sender");
    } else if (isReceiver) {
      messageElement.classList.add("message-contents-receiver");
    }

    const messageContent = `
      <div class="missive ${isSender ? "sender-message" : "receiver-message"}">
        <h6>${message.message}</h6>
        <h5>${message.time}</h5>
      </div>
    `;

    messageElement.innerHTML = messageContent;

    chatContainer.appendChild(messageElement);

    // Scroll to the bottom for the latest message
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (!isSender) {
      addSenderToSearchResult(message.sender);
    }
  }

  // Function to add the sender to the search results
  function addSenderToSearchResult(senderUserName) {
    fetch(`http://localhost:3030/api/v1/search-user?name=${encodeURIComponent(senderUserName)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then((users) => {
        if (users.length > 0) {
          const sender = users.find((user) => user.username === senderUserName);

          if (!sender) {
            console.log("Sender not found in search result");
            return;
          }

          // Check if the sender is already in the search results
          const existingUser = Array.from(document.querySelectorAll(".chat-link"))
            .find((link) => link.querySelector("h3").textContent === sender.username);

          console.log("Existing user: ", existingUser);

          if (!existingUser) {
            console.log("Adding sender to search results:", sender.username);
            displaySearchResults([sender]);
          } else {
            console.log("Sender is already in search results");
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching sender details:", error);
      });
  }
});


// document.addEventListener("DOMContentLoaded", () => {
//   const searchResultContainer = document.getElementById("search-results-container");
//   const searchInput = document.getElementById("auto-search-user");
//   const submitButton = document.getElementById("submit");

//   let receiver = null;

//   // Get the current user from the URL parameters
//   const urlParams = new URLSearchParams(window.location.search);
//   const currentUser = urlParams.get("user");

//   console.log("Current user: ", currentUser);

//   // Check if the currentUser is retrieved from URL parameters
//   if (currentUser) {
//     console.log("Current user found, connecting to WebSocket...");
//     connectToWebSocket(currentUser);
//   } else {
//     alert("No user found. Please log in to continue.");
//     console.log("No currentUser found in URL.");
//     console.log("User not found.");
//   }

//   // Debounce function to limit API calls
//   function debounce(func, delay) {
//     let timeout;
//     return function (...args) {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => func.apply(this, args), delay);
//     };
//   }

//   // Search input listener with debounce
//   if (searchInput) {
//     searchInput.addEventListener("keyup", debounce(searchUser, 400));
//   }

//   // Function to search users
//   function searchUser() {
//     const query = searchInput.value.trim();

//     if (query.length >= 2) {
//       fetch(
//         `http://localhost:3030/api/v1/search-user?name=${encodeURIComponent(query)}`
//       )
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`Server error: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => displaySearchResults(data))
//         .catch((error) => {
//           console.error("Error fetching user:", error);
//           searchResultContainer.innerHTML =
//             "<p>Error fetching users. Please try again later.</p>";
//           searchResultContainer.style.display = "block";
//         });
//     } else {
//       clearSearchResults();
//     }
//   }


//   function addSenderToSearchResult(senderUserName) {
//       fetch(`http://localhost:3030/api/v1/search-user?name=${encodeURIComponent(senderUserName)}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`Server error: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((users) => {
//         if (users.length > 0) {
//           const sender = users.find(user => user.username === senderUserName);

//           if (!sender) {
//             console.log("Sender not found in search result");
//             return;
//           }

//           // Check if the sender is already in the search results
//           const existingUser = Array.from(document.querySelectorAll(".chat-link"))
//           .find(link => link.querySelector("h3").textContent === sender.username);

//           console.log("Existing user: ", existingUser);

//           if (!existingUser) {
//             console.log("Adding sender to search results:", sender.username);
//               displaySearchResults([sender]);
//           } else {
//             console.log("Sender is already in search results");
//           }

//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching sender details:", error);
//       });
//   }

//   // Clear search results
//   function clearSearchResults() {
//     searchResultContainer.innerHTML = "";
//     searchResultContainer.style.display = "none";
//   }

//   // Function to display search results
//   function displaySearchResults(users) {
//     clearSearchResults();

//     if (users.length === 0) {
//       searchResultContainer.innerHTML = "<p>No users found</p>";
//       searchResultContainer.style.display = "block";
//       return;
//     }

//     users.forEach((user) => {
//       const chatLink = createChatLink(user);
//       searchResultContainer.appendChild(chatLink);

//       chatLink.addEventListener("click", (event) => {
//         event.preventDefault();
//         searchedReceiver(user);
//         focusMessageInput();
//       });
//     });

//     searchResultContainer.style.display = "block";
//   }

//   function searchedReceiver(user) {
//     receiver = user;
//     console.log("Receiver: ", receiver.username);
//   }

//   // Function to create a chat link
//   function createChatLink(user) {
//     const chatLink = document.createElement("a");
//     chatLink.href = "#";
//     chatLink.classList.add("chat-link");

//     const chatDesc = document.createElement("div");
//     chatDesc.classList.add("chat-desc");

//     const imageDiv = document.createElement("div");
//     imageDiv.classList.add("image");

//     const userImage = document.createElement("img");
//     userImage.src = user.imageUrl || "../chat-images/1.jpeg";
//     userImage.alt = `${user.username}'s profile picture`;

//     imageDiv.appendChild(userImage);

//     const nameDiv = document.createElement("div");
//     nameDiv.classList.add("name");

//     const userName = document.createElement("h3");
//     userName.textContent = user.username || "John Doe";

//     const lastMessage = document.createElement("h4");
//     lastMessage.textContent = user.lastMessage || "No message";

//     nameDiv.appendChild(userName);
//     nameDiv.appendChild(lastMessage);

//     chatDesc.appendChild(imageDiv);
//     chatDesc.appendChild(nameDiv);

//     const timeDiv = document.createElement("div");
//     timeDiv.classList.add("time");

//     const time = document.createElement("h3");
//     time.textContent = user.time || "1:30 pm";

//     const volumeIcon = document.createElement("i");
//     volumeIcon.classList.add("fa", "fa-volume-up");
//     volumeIcon.setAttribute("aria-hidden", "true");

//     timeDiv.appendChild(time);
//     timeDiv.appendChild(volumeIcon);

//     chatLink.appendChild(chatDesc);
//     chatLink.appendChild(timeDiv);

//     return chatLink;
//   }

//   // Function to focus on the message input
//   function focusMessageInput() {
//     const chatMessageContainer = document.querySelector(".message-foot");

//     if (chatMessageContainer) {
//       chatMessageContainer.scrollIntoView({ behavior: "smooth" });

//       const inputBox = document.querySelector("#send-message");

//       if (inputBox) {
//         inputBox.focus();
//       }
//     }
//   }

//   // Function to connect to WebSocket and set up the necessary event handlers
//   function connectToWebSocket(currentUser) {
//     let socket = new SockJS("http://localhost:3030/chat");
//     let stompClient = Stomp.over(socket);

//     stompClient.connect({username : currentUser}, onConnected, onError);

//     function onError(error) {
//       console.error(
//         "Could not connect to WebSocket server. Please refresh this page to try again!: " + error
//       );
//     }

//     function onConnected() {

//       console.log("WebSocket connected to server at: " + socket._transport.url);

//       stompClient.subscribe(
//         `/user/${currentUser}/queue/messages`,
//         function (message) {
//           showMessage(JSON.parse(message.body));
//         }
//       );

//       // Subscribe to general chat messages
//       stompClient.subscribe("/queue/messages", function (message) {
//         showMessage(JSON.parse(message.body));
//       });

//     }

//     // Send message functionality
//     function sendMessage() {

//       const messageContent = document.getElementById("send-message").value;

//       if (messageContent && stompClient && receiver) {
//         const chatMessage = {
//           sender: currentUser,
//           receiver: receiver.username,
//           message: messageContent,
//           time: new Date().toLocaleTimeString(),
//         };

//         console.log("Sending message: ", chatMessage);

//         stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
        
//         document.getElementById("send-message").value = "";
        
//       } else if (!receiver || !receiver.username) {
//         alert("Please search for a user to chat with");
//         console.log("Message receiver not selected");
//       }
//     }

//     // Send message on button click
//     if (submitButton) {
//       submitButton.addEventListener("click", (event) => {
//         event.preventDefault();
//         sendMessage();
//       });
//     }
//   }

//   // Function to display a message in the chat window
//   function showMessage(message) {
//     const chatContainer = document.getElementById("chat-container");

//     const isSender = message.sender === currentUser;
//     const isReceiver = message.sender === receiver?.username || message.receiver === currentUser;

//     const messageElement = document.createElement("div");

//     if (isSender) {
//       messageElement.classList.add("message-contents-sender");
//     } else if (isReceiver) {
//       messageElement.classList.add("message-contents-receiver");
//     }

//     const messageContent = `
//       <div class="missive ${isSender ? "sender-message" : "receiver-message"}">
//         <h6>${message.message}</h6>
//         <h5>${message.time}</h5>
//       </div>
//     `;

//     messageElement.innerHTML = messageContent;

//     chatContainer.appendChild(messageElement);

//     // Scroll to the bottom for the latest message
//     chatContainer.scrollTop = chatContainer.scrollHeight;

//     if (!isSender) {
//       addSenderToSearchResult(message.sender);
//     }
//   }
// });

