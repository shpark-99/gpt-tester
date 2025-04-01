import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import axios from 'axios';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');

  const models = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: `다음 참조 텍스트를 바탕으로 답변해주세요: ${referenceText}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      setResponse(response.data.choices[0].message.content);
    } catch (err) {
      setError('API 호출 중 오류가 발생했습니다. API 키와 입력 내용을 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        GPT 프롬프트 테스터
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="OpenAI API 키"
            type="password"
            value={apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
            margin="normal"
            required
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>GPT 모델 선택</InputLabel>
            <Select
              value={selectedModel}
              label="GPT 모델 선택"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => setSelectedModel(e.target.value as string)}
            >
              {models.map((model) => (
                <MenuItem key={model.value} value={model.value}>
                  {model.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            참조 텍스트
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={referenceText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceText(e.target.value)}
            margin="normal"
            required
            placeholder="GPT가 참고할 텍스트를 입력하세요..."
          />
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            프롬프트
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
            margin="normal"
            required
            placeholder="GPT에게 물어볼 내용을 입력하세요..."
          />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              type="submit" 
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : '전송'}
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {response && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            GPT 응답:
          </Typography>
          <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {response}
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default App; 