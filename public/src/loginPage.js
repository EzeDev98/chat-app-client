const form = document.getElementById("login");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    errorMessage.style.display = "none";
    errorText.innerHTML = '';

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Use empty string check instead of null
    if (username === "") {
        displayErrorMessages("Username field cannot be empty");
        return;
    }

    if (password === "") {
        displayErrorMessages("Password field cannot be empty");
        return;
    }

    const formData = {
        username: username,
        password: password,
    };

    // Log formData for debugging
    console.log("Form Data Sent: ", formData);

    fetch("http://localhost:3030/api/v1/login-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log("Raw Response from server: ", response);

        // response.ok checks for 2xx status codes
        if (response.ok) {
            return response.json();
        } else {
            // Handle error response and display messages
            return response.json().then(data => {
                displayErrorMessages(data.messages || "Login failed!");
            });
        }
    })
    .then(payload => {
        // Only proceed if payload is valid
        if (payload && payload.payload && payload.payload.username) {
            const loggedInUser = payload.payload.username;
            console.log("User: ", loggedInUser);

            // Redirect to chat page with user as a query parameter
            window.location.href = `/pages/chat.html?user=${encodeURIComponent(loggedInUser)}`;
        } else {
            displayErrorMessages("Login failed! Invalid response from server.");
        }
    })
    .catch(error => {
        console.error("Error: ", error);
        displayErrorMessages("An unexpected error occurred. Login failed");
    });
});

// Function to display error messages
function displayErrorMessages(messages) {
    errorText.innerHTML = messages;
    errorMessage.style.display = 'block';
}
