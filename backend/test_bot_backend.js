const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
const testData = {
    name: 'Test Agent',
    email: `agent_${Date.now()}@test.com`,
    password: 'password123'
};

async function testChatbot() {
    try {
        console.log('1. Registering user...');
        await axios.post(`${API_URL}/auth/register`, testData);
        console.log('Registration successful.');

        console.log('2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testData.email,
            password: testData.password
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token acquired.');

        console.log('3. Sending test message...');
        const chatRes = await axios.post(`${API_URL}/chat/send`, {
            message: 'Hello! I am testing your functionality. Can you hear me?',
            sessionId: 'test_session_' + Date.now()
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n--- Chatbot Response ---');
        console.log(chatRes.data.response);
        console.log('------------------------\n');

        if (chatRes.data.response) {
            console.log('TEST PASSED: Chatbot responded successfully.');
        } else {
            console.log('TEST FAILED: No response from chatbot.');
        }

    } catch (error) {
        console.error('TEST ERROR:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Message:', JSON.stringify(error.response.data));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

testChatbot();
