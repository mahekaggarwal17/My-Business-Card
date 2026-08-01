const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
    try {
        const { message, systemPrompt } = req.body;

        const nvidiaKey = process.env.NVIDIA_API_KEY;
        const azureKey = process.env.AZURE_OPENAI_KEY;
        const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const openaiKey = process.env.OPENAI_API_KEY;

        let replyText = "";

        if (nvidiaKey && nvidiaKey.trim()) {
            const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${nvidiaKey.trim()}`
                },
                body: JSON.stringify({
                    model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-nano-30b-a3b',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                replyText = data.choices[0].message.content;
            } else if (data.error) {
                replyText = `NVIDIA API Error: ${data.error.message || JSON.stringify(data.error)}`;
            } else {
                replyText = "Error retrieving response from NVIDIA API.";
            }
        } else if (azureKey && azureEndpoint) {
            const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
            const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
            const url = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': azureKey.trim()
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 500
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                replyText = data.choices[0].message.content;
            } else if (data.error) {
                replyText = `Azure OpenAI Error: ${data.error.message || JSON.stringify(data.error)}`;
            } else {
                replyText = "Error retrieving response from Azure OpenAI.";
            }
        } else if (openaiKey && openaiKey.trim()) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey.trim()}`
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 500
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                replyText = data.choices[0].message.content;
            } else {
                replyText = "Error retrieving response from OpenAI.";
            }
        } else {
            return res.status(500).json({
                reply: "Configuration error: Neither NVIDIA_API_KEY, AZURE_OPENAI_KEY, nor OPENAI_API_KEY is configured."
            });
        }

        res.json({ reply: replyText });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ reply: `Server Error: ${error.message || error}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
