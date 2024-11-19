
const form = document.getElementById("signup");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

form.addEventListener('submit', function(event) {
    event.preventDefault();

    errorMessage.style.display = 'none';
    errorText.innerHTML = '';

    const firstName = document.getElementById("firstname").value.trim();
    const lastName = document.getElementById("lastname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;   

    // Password match check
    if (password !== confirmPassword) {
        displayErrorMessages("Passwords do not match");
        return;
    }

    // Phone number validation
    if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
        displayErrorMessages("Invalid phone number. Phone number should be exactly 11 digits.");
        return;
    }

    // Password validation
    if (!isValidPassword(password)) {
        displayErrorMessages("Password must contain at least 8 characters, including uppercase, lowercase, special characters and a number.");
        return;
    }

    const formData = {
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        phone_number: phoneNumber,
        password: password,
        confirm_password: confirmPassword,
    };

    fetch('http://localhost:3030/api/v1/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(async response => {
        if (response.ok || response === 200 || response === 201) {
            await response.json();
            window.location.href = '/pages/login.html';
        } else {
            const data = await response.json();
            displayErrorMessages(data.message || 'An error occurred. User not registered');
        }
    })
    .catch(error => {
        console.error("Error:", error);
        displayErrorMessages("An unexpected error occurred");
    });
});

function isValidPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasSpecialChar && hasNumber; 
}

function displayErrorMessages(messages) {
    errorText.innerHTML = messages;
    errorMessage.style.display = 'block';
}
