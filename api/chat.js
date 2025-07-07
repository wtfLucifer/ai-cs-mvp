const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Create an express app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// In-memory conversation store (for simplicity)
// In a real-world app, you might use a database like Firestore.
const conversations = new Map();

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    const { message, language = 'english', userId = 'defaultUser' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    // Retrieve conversation history for the user
    const userHistory = conversations.get(userId) || [];

    // Construct the prompt for the Gemini API
    const languageMap = {
        hindi: 'Hindi',
        hinglish: 'Hinglish (a mix of Hindi and English)',
        english: 'English'
    };

    const prompt = `
        You are a friendly and helpful AI shopkeeper for a store in India.
        Your customer is speaking ${languageMap[language]}.
        Your goal is to understand their shopping needs, suggest relevant products, and help them place an order.
        Keep your responses concise, friendly, and natural.

        Conversation History:
        ${userHistory.map(entry => `${entry.role}: ${entry.parts[0].text}`).join('\n')}

        Current User Message:
        ${message}
    `;

    try {
        // Call the Gemini API
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const reply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text.trim() || 'Sorry, I am having trouble understanding. Can you please repeat?';

        // Update conversation history
        const updatedHistory = [
            ...userHistory,
            { role: 'user', parts: [{ text: message }] },
            { role: 'model', parts: [{ text: reply }] }
        ];
        // Keep the history from getting too long
        if (updatedHistory.length > 10) {
            updatedHistory.splice(0, 2);
        }
        conversations.set(userId, updatedHistory);


        res.json({ reply });

    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({ reply: 'An error occurred while talking to the AI. Please try again.' });
    }
});

// Export the app for Vercel
module.exports = app;
