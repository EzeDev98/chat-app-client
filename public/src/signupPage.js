import { registerUser } from "./apiService";
import { displayErrorMessages, setupPasswordToggle, isValidPassword } from "./utils";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signup");
  const errorMessage = document.getElementById("error-message");
  const errorText = document.getElementById("error-text");
  const profilePictureInput = document.getElementById("profilePicture");
  const previewContainer = document.getElementById("preview-container");
  const previewImage = document.getElementById("preview-image");

  profilePictureInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        displayErrorMessages("Please select an image file (JPEG, PNG, etc.)");
        this.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        displayErrorMessages("Image size too large. Maximum 2MB allowed.");
        this.value = "";
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      previewImage.src = objectUrl;
      previewContainer.style.display = "block";
    } else {
      previewContainer.style.display = "none";
      previewImage.src = "#";
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    errorMessage.style.display = "none";
    errorText.innerHTML = "";

    const firstName = document.getElementById("firstname").value.trim();
    const lastName = document.getElementById("lastname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!firstName) {
      displayErrorMessages("First name is required");
      return;
    }

    if (!lastName) {
      displayErrorMessages("Last name is required");
      return;
    }

    if (!username) {
      displayErrorMessages("Username is required");
      return;
    }

    if (!email) {
      displayErrorMessages("Email is required");
      return;
    }

    if (!phoneNumber) {
      displayErrorMessages("Phone number is required");
      return;
    }

    if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
      displayErrorMessages("Invalid phone number. Must be exactly 11 digits.");
      return;
    }

    if (!password) {
      displayErrorMessages("Password is required");
      return;
    }

    if (!isValidPassword(password)) {
      displayErrorMessages("Password must contain: 8+ characters, uppercase, lowercase, number, and special character");
      return;
    }

    if (password !== confirmPassword) {
      displayErrorMessages("Passwords do not match");
      return;
    }

    try {

      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("phone_number", phoneNumber);
      formData.append("password", password);
      formData.append("confirm_password", confirmPassword);

      const file = profilePictureInput.files[0];
      if (file) {
        formData.append("profilePicture", file);
      }

      const response = await registerUser(formData);

      if (response) {
        window.location.href = "login.html";
      } else {
        const errorMsg = response?.message || "Registration failed. Please try again.";
        displayErrorMessages(errorMsg);
      }
    } catch (error) {
      console.error("Registration error:", error);
      displayErrorMessages(error.message || "An error occurred during registration");
    }
  });

  setupPasswordToggle();
});
