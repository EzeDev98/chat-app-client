/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/src/signupPage.js":
/*!**********************************!*\
  !*** ./public/src/signupPage.js ***!
  \**********************************/
/***/ (() => {

eval("\nconst form = document.getElementById(\"signup\");\nconst errorMessage = document.getElementById(\"error-message\");\nconst errorText = document.getElementById(\"error-text\");\n\nform.addEventListener('submit', function(event) {\n    event.preventDefault();\n\n    errorMessage.style.display = 'none';\n    errorText.innerHTML = '';\n\n    const firstName = document.getElementById(\"firstname\").value.trim();\n    const lastName = document.getElementById(\"lastname\").value.trim();\n    const username = document.getElementById(\"username\").value.trim();\n    const email = document.getElementById(\"email\").value.trim();\n    const phoneNumber = document.getElementById(\"phoneNumber\").value.trim();\n    const password = document.getElementById(\"password\").value;\n    const confirmPassword = document.getElementById(\"confirmPassword\").value;   \n\n    // Password match check\n    if (password !== confirmPassword) {\n        displayErrorMessages(\"Passwords do not match\");\n        return;\n    }\n\n    // Phone number validation\n    if (phoneNumber.length !== 11 || !/^\\d+$/.test(phoneNumber)) {\n        displayErrorMessages(\"Invalid phone number. Phone number should be exactly 11 digits.\");\n        return;\n    }\n\n    // Password validation\n    if (!isValidPassword(password)) {\n        displayErrorMessages(\"Password must contain at least 8 characters, including uppercase, lowercase, special characters and a number.\");\n        return;\n    }\n\n    const formData = {\n        first_name: firstName,\n        last_name: lastName,\n        username: username,\n        email: email,\n        phone_number: phoneNumber,\n        password: password,\n        confirm_password: confirmPassword,\n    };\n\n    fetch('http://localhost:3030/api/v1/create-user', {\n        method: 'POST',\n        headers: {\n            'Content-Type': 'application/json'\n        },\n        body: JSON.stringify(formData)\n    })\n    .then(async response => {\n        if (response.ok || response === 200 || response === 201) {\n            await response.json();\n            window.location.href = '/pages/login.html';\n        } else {\n            const data = await response.json();\n            displayErrorMessages(data.message || 'An error occurred. User not registered');\n        }\n    })\n    .catch(error => {\n        console.error(\"Error:\", error);\n        displayErrorMessages(\"An unexpected error occurred\");\n    });\n});\n\nfunction isValidPassword(password) {\n    const minLength = 8;\n    const hasUpperCase = /[A-Z]/.test(password);\n    const hasLowerCase = /[a-z]/.test(password);\n    const hasNumber = /\\d/.test(password);\n    const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);\n\n    return password.length >= minLength && hasUpperCase && hasLowerCase && hasSpecialChar && hasNumber; \n}\n\nfunction displayErrorMessages(messages) {\n    errorText.innerHTML = messages;\n    errorMessage.style.display = 'block';\n}\n\n\n//# sourceURL=webpack://chat_application-client/./public/src/signupPage.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./public/src/signupPage.js"]();
/******/ 	
/******/ })()
;