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
    try {
        const { apiKey, model, referenceText, surveyPurpose, surveyTarget, prompt, temperature } = req.body;
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: model,
            messages: [
                {
                    role: "system",
                    content: `다음 정보를 바탕으로 답변해주세요:
참조 텍스트: ${referenceText}
설문 목적: ${surveyPurpose}
설문 대상: ${surveyTarget}`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: temperature || 0.7,
            max_tokens: 2000
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'API 호출 중 오류가 발생했습니다.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 