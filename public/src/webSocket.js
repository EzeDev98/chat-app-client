import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
let activeSubscriptions = new Map();
let reconnectAttempts = 0;

export function connectToWebSocketAndReceiveMessages(currentUser, token, handleIncomingMessage) {
  if (stompClient) {
    disconnectWebSocket();
  }

  const socket = new SockJS("http://localhost:3030/chat");

  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.debug('STOMP: ', str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    beforeConnect: () => {
      console.log("Attempting to connect with token:", token);
    },
    onConnect: (frame) => {
      console.log("Connected to WebSocket server. Session ID:", frame.headers['session']);
      reconnectAttempts = 0;

      activeSubscriptions.forEach((subId) => {
        stompClient.unsubscribe(subId);
      });
      activeSubscriptions.clear();

      const subscription = stompClient.subscribe(
        `/queue/messages-${currentUser}`,
        (message) => {
          console.log("Received raw message:", message);
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log("Received message:", parsedMessage);
            handleIncomingMessage(parsedMessage);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        },
        {
          id: `sub-${currentUser}-${Date.now()}`,
          Authorization: `Bearer ${token}`
        }
      );

      activeSubscriptions.set(`/queue/messages-${currentUser}`, subscription.id);
    },
    onDisconnect: () => {
      console.log("WebSocket disconnected");
      activeSubscriptions.clear();
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame.headers.message);
      if (frame.headers.message.includes("Invalid JWT token") || 
          frame.headers.message.includes("Authorization header missing")) {
        console.error("Authentication error - disconnecting");
        disconnectWebSocket();
      }
    },
    onWebSocketError: (error) => {
      console.error("WebSocket error:", error);
      attemptReconnect(currentUser, token, handleIncomingMessage);
    },
    onWebSocketClose: (event) => {
      console.log("WebSocket closed:", event.reason);
      if (event.reason !== "Normal closure") {
        attemptReconnect(currentUser, token, handleIncomingMessage);
      }
    }
  });

  stompClient.activate();
}

export const sendMessages = (sender, receiver, messageContent, token) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("Cannot send message - WebSocket not connected");
    return false;
  }

  try {
    const chatMessage = {
      sender: sender,
      receiver: receiver,
      message: messageContent.trim(),
      time: new Date().toISOString()
    };

    console.log("Attempting to send message with headers:", {
      destination: "/app/sendMessage",
      body: chatMessage,
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json'
      }
    });

    stompClient.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify(chatMessage),
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json'
      }
    });

    console.log("Message sent to", receiver);
    return true;
  } catch (error) {
    console.error("Failed to send message:", error);
    return false;
  }
};

export function disconnectWebSocket() {
  if (stompClient) {
    activeSubscriptions.clear();
    stompClient.deactivate().then(() => {
      console.log("WebSocket disconnected");
    }).catch(err => {
      console.error("Error during disconnect:", err);
    });
    stompClient = null;
  }
}
