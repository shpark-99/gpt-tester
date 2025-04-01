const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('public'));

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isCompleteResponse = (response) => {
    const text = response.trim();
    return text.endsWith('.') || text.endsWith('!') || text.endsWith('?');
};

app.post('/api/chat', async (req, res) => {
    const { apiKey, model, referenceText, prompt, temperature } = req.body;
    let lastResponse = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: model,
                messages: [
                    {
                        role: "system",
                        content: `다음 참조 텍스트를 바탕으로 답변해주세요: ${referenceText}`
                    },
                    ...(lastResponse ? [{ role: "assistant", content: lastResponse }] : []),
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: temperature || 0.7,
                max_tokens: 2000 // 토큰 수 증가
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const content = response.data.choices[0].message.content;
            
            // 응답이 완전한지 확인
            if (isCompleteResponse(content)) {
                return res.json({ response: content });
            }

            // 응답이 완전하지 않으면 저장하고 재시도
            lastResponse = content;
            if (attempt < MAX_RETRIES - 1) {
                await sleep(RETRY_DELAY);
                continue;
            }

        } catch (error) {
            console.error('Error:', error);
            if (attempt < MAX_RETRIES - 1) {
                await sleep(RETRY_DELAY);
                continue;
            }
            return res.status(500).json({ error: 'API 호출 중 오류가 발생했습니다.' });
        }
    }

    // 모든 재시도 후에도 완전하지 않은 응답을 반환
    return res.json({ response: lastResponse });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 