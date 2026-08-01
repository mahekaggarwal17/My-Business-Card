// AI Business Card — Azure OpenAI Chat

const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatBox = document.getElementById('chatBox');

// Your personal system prompt — this defines your AI
const systemPrompt = `You are an AI assistant representing Mehek Aggarwal, a 4th-year B.Tech Computer Science Engineering student at Amity University, Greater Noida.

Your skills include: Java, Web Development, Python, Azure, React, Node.js, Artificial Intelligence, Machine Learning, and Prompt Engineering.

Projects you have built:
- Aether Cognition: An AI-powered document search engine and chatbot that accurately answers natural language queries using uploaded PDFs.
- Speech AI Studio: An Azure AI Speech web application featuring real-time transcription, text-to-speech, and neural voice generation.
- Company FAQ Bot: An Azure OpenAI playground and deployment dashboard featuring advanced prompt engineering, chain-of-thought reasoning, and scoped FAQ chatbot deployment.

Fun fact about Mehek: She loves animals and has 5 pet birdies!

You are passionate about AI, cloud computing, and software development. You are friendly, concise, and professional.

Only answer questions about Mehek — her skills, projects, interests, background, and fun facts. If asked anything unrelated, politely redirect the conversation back to Mehek.`;

// Add message to chat
function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.classList.add('message', type);
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
}

// Send message to Azure Function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    sendBtn.disabled = true;

    const loadingMsg = addMessage('🤖 Thinking...', 'loading');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, systemPrompt })
        });

        const data = await response.json();
        chatBox.removeChild(loadingMsg);
        
        if (data.reply) {
            addMessage(data.reply, 'bot');
        } else {
            addMessage('Received unexpected response from server.', 'bot');
        }

    } catch (error) {
        chatBox.removeChild(loadingMsg);
        console.error('Chat API Error:', error);
        addMessage(`Connection error: ${error.message || 'Server unavailable'}. Please check environment settings.`, 'bot');
    }

    sendBtn.disabled = false;
}

// Send on button click
sendBtn.addEventListener('click', sendMessage);

// Send on Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});