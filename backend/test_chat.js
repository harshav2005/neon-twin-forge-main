const axios = require('axios');

const testChat = async () => {
    try {
        const email = "test1771073588054@example.com"; // User from Step 514
        const password = "password123";

        console.log(`Logging in user: ${email}...`);
        const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: email,
            password: password
        });
        const token = loginRes.data.token;
        console.log("Login successful.");

        // Configure Twin (Retry with valid schema)
        console.log("Configuring Twin...");
        await axios.post('http://127.0.0.1:5000/api/twin/profile', {
            personality: { analytical: 80, creative: 60, empathetic: 70, adventurous: 40, organized: 90, social: 50 },
            preferences: [
                { name: "coding", enabled: true },
                { name: "ai", enabled: true }
            ]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Twin configured.");

        // Test Chat
        console.log("Sending chat message to /api/twin/chat...");
        const chatRes = await axios.post('http://127.0.0.1:5000/api/twin/chat', {
            message: "Hello twin, confirm you are working."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Chat Response Status:", chatRes.status);
        console.log("Chat Response Data:", JSON.stringify(chatRes.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error("API Error Status:", error.response.status);
            console.error("API Error Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("No response received. Server might be down or not reachable.", error.code);
        } else {
            console.error("Error setting up request:", error.message);
        }
    }
};

testChat();
