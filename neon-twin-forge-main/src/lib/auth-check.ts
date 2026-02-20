// src/lib/auth-check.js (or .ts if preferred)

export const isUserLoggedIn = () => {
    // Check for the presence of the authentication token or user data
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!token && !!user;
};