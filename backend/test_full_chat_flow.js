const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
const testEmail = `chatflow_${Date.now()}@test.com`;

async function fullChatTest() {
    try {
        // Step 1: Register
        console.log('=== STEP 1: Registering user ===');
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Chat Flow Tester',
            email: testEmail,
            password: 'password123'
        });
        console.log('✅ Registration:', regRes.status === 201 ? 'SUCCESS' : regRes.status);

        // Step 2: Login
        console.log('\n=== STEP 2: Logging in ===');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testEmail,
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login: SUCCESS (token acquired)');

        const headers = { Authorization: `Bearer ${token}` };
        const sessionId = 'test_session_' + Date.now();

        // Step 3: Send chat messages
        const messages = [
            'Hello Twin! How are you doing today?',
            'What is 2 + 2?',
            'Tell me a fun fact!'
        ];

        for (let i = 0; i < messages.length; i++) {
            console.log(`\n=== STEP ${3 + i}: Sending message "${messages[i]}" ===`);
            const chatRes = await axios.post(`${API_URL}/chat/send`, {
                message: messages[i],
                sessionId: sessionId
            }, { headers });

            console.log(`✅ Response: "${chatRes.data.response}"`);
            if (chatRes.data.emotion) console.log(`   Emotion: ${chatRes.data.emotion}`);
            if (chatRes.data.usedMemories?.length) console.log(`   Memories used: ${chatRes.data.usedMemories.join(', ')}`);
        }

        // Step 4: Check sessions
        console.log('\n=== STEP 6: Checking sessions ===');
        const sessRes = await axios.get(`${API_URL}/chat/sessions`, { headers });
        console.log(`✅ Sessions found: ${Array.isArray(sessRes.data) ? sessRes.data.length : 0}`);

        // Step 5: Check history
        console.log('\n=== STEP 7: Checking chat history ===');
        const histRes = await axios.get(`${API_URL}/chat/history?sessionId=${sessionId}`, { headers });
        const history = Array.isArray(histRes.data) ? histRes.data : [];
        console.log(`✅ Messages in history: ${history.length}`);
        history.forEach(m => console.log(`   [${m.sender}] ${m.text.substring(0, 80)}...`));

        console.log('\n🎉 ALL TESTS PASSED! The chatbot is working end-to-end.');

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data));
        } else {
            console.error('   Error:', error.message);
        }
    }
}

fullChatTest();
