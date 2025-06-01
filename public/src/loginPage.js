import { loginUser } from "./apiService";
import { displayErrorMessages, setupPasswordToggle } from "./utils";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login");
  const errorMessage = document.getElementById("error-message");
  const errorText = document.getElementById("error-text");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    errorMessage.style.display = "none";
    errorText.innerHTML = "";

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "" || username === null) {
      displayErrorMessages("Username field cannot be empty");
      return;
    }

    if (password === "" || password === null) {
      displayErrorMessages("Password field cannot be empty");
      return;
    }

    try {
      const formData = {
        username: username,
        password: password,
      };

      const response = await loginUser(formData);

      console.log("Login response:", response);

      if (!response) {
        displayErrorMessages("Invalid response from server");
        return;
      }

      saveUserDetails(response);
      window.location.href = "/pages/chat.html";
    } catch (error) {
      console.error("Login error:", error);
      displayErrorMessages(error.message || "Login failed. Please try again.");
    } finally {
    }
  });

  setupPasswordToggle();
});


function saveUserDetails(response) {

  let profilePicture = response.profilePicture || '';
  
  profilePicture = profilePicture.replace(/['"]/g, '').trim();
  
  if (profilePicture && !profilePicture.startsWith('http')) {
    profilePicture = `http://localhost:3030/uploads/${profilePicture}`;
  }

  localStorage.setItem("userId", response.userId);
  localStorage.setItem("username", response.username);
  localStorage.setItem("firstname", response.firstname);
  localStorage.setItem("lastname", response.lastname);
  localStorage.setItem("email", response.email);
  localStorage.setItem("phoneNumber", response.phoneNumber);
  localStorage.setItem("profilePicture", profilePicture);
  localStorage.setItem("token", response.token);
}