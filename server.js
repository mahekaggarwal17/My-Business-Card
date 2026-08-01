const express = require('express');
const { AzureOpenAI, OpenAI } = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
    try {
        const { message, systemPrompt } = req.body;

        let client;
        if (process.env.AZURE_OPENAI_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
            client = new AzureOpenAI({
                endpoint: process.env.AZURE_OPENAI_ENDPOINT,
                apiKey: process.env.AZURE_OPENAI_KEY,
                apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
                deployment: process.env.AZURE_OPENAI_DEPLOYMENT
            });
        } else if (process.env.OPENAI_API_KEY) {
            client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        } else {
            return res.status(500).json({ reply: 'Server Error: OpenAI API credentials are not configured.' });
        }

        const modelName = process.env.AZURE_OPENAI_DEPLOYMENT || process.env.OPENAI_MODEL || 'gpt-4o-mini';

        const response = await client.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            max_tokens: 300
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ reply: 'Error connecting to AI service. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
