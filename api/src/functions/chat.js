const { app } = require('@azure/functions');
const { AzureOpenAI, OpenAI } = require('openai');

app.http('chat', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { message, systemPrompt } = body;

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
                return {
                    status: 500,
                    jsonBody: {
                        reply: "Configuration error: Azure OpenAI Environment variables are not set in Azure Portal."
                    }
                };
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

            return {
                jsonBody: {
                    reply: response.choices[0].message.content
                }
            };
        } catch (error) {
            context.log('Error processing chat completion:', error);
            return {
                status: 500,
                jsonBody: {
                    reply: "Error connecting to AI service. Please verify Environment Variables in Azure Portal."
                }
            };
        }
    }
});