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
        let modelName;
        let extraBody = undefined;

        if (process.env.NVIDIA_API_KEY) {
            client = new OpenAI({
                baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
                apiKey: process.env.NVIDIA_API_KEY
            });
            modelName = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-nano-30b-a3b';
            extraBody = { reasoning_budget: 16384 };
        } else if (process.env.AZURE_OPENAI_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
            client = new AzureOpenAI({
                endpoint: process.env.AZURE_OPENAI_ENDPOINT,
                apiKey: process.env.AZURE_OPENAI_KEY,
                apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
                deployment: process.env.AZURE_OPENAI_DEPLOYMENT
            });
            modelName = process.env.AZURE_OPENAI_DEPLOYMENT;
        } else if (process.env.OPENAI_API_KEY) {
            client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        } else {
            return res.status(500).json({ reply: 'Server Error: API key is not configured.' });
        }

        const payload = {
            model: modelName,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            max_tokens: 1024
        };

        if (extraBody) {
            payload.extra_body = extraBody;
        }

        const response = await client.chat.completions.create(payload);

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ reply: 'Error connecting to AI service. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
