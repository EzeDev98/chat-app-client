export async function loginUser(requestData) {
  try {
    const response = await fetch("http://localhost:3030/api/v1/login-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.detail || "Login failed");
    }

    return responseData;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}

export async function registerUser(formData) {
  try {
    const response = await fetch("http://localhost:3030/api/v1/create-user", {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMsg = responseData.detail || responseData.message || responseData.error || "Registration failed";
      throw new Error(errorMsg);
    }

    return responseData;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
}

export async function searchUsersByName(query) {
  if (query.length < 2) {
    return [];
  }

  const response = await fetch(`http://localhost:3030/api/v1/search-user?name=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || `Server error: ${response.status}`);
  }

  return await response.json();
}


export async function logout() {
  try {
    const response = await fetch("http://localhost:3030/api/v1/logout", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Logout failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Network error during logout:", error);
    throw error;
  }
}

export async function fetchPreviousConversations(sender, receiver) {
  try {
    const response = await fetch(`http://localhost:3030/api/v1/conversations?sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching previous conversations:", error);
    throw error;
  }

}