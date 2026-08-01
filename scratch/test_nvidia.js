async function test() {
    try {
        console.log("Testing NVIDIA API with native fetch...");
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-nano-30b-a3b',
                messages: [
                    { role: 'system', content: 'You are an AI assistant representing Mehek Aggarwal.' },
                    { role: 'user', content: 'What is Mehek fun fact?' }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        console.log("HTTP Status:", response.status);
        const data = await response.json();
        console.log("API Response Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("ERROR from NVIDIA API:", err);
    }
}

test();
