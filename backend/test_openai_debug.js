const { OpenAI } = require('openai');
require('dotenv').config();

const openaiKey = process.env.OPENAI_API_KEY;

async function testOpenAI() {
    try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Hello" }],
            model: "gpt-4o-mini",
        });
        console.log('OpenAI Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('OpenAI Error:', error.message);
    }
}

testOpenAI();
