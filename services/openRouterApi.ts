import axios from 'axios';

const API_KEY = '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';
const MODEL_ID = 'deepseek/deepseek-r1-0528:free';

const openRouterApi = axios.create({
  baseURL: 'https://openrouter.ai/api/v1/chat/completions',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://psique-io.vercel.app/', // As per user instruction
    'X-Title': 'MeuSistemaTS', // As per user instruction
  }
});

type MessageRole = 'system' | 'user' | 'assistant';

export const getOpenRouterCompletion = async (messages: Array<{role: MessageRole, content: string}>): Promise<string> => {
    try {
        const response = await openRouterApi.post('/chat/completions', {
            model: MODEL_ID,
            messages: messages,
        });

        if (response.data && response.data.choices && response.data.choices[0].message && response.data.choices[0].message.content) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error("Invalid response structure from OpenRouter API");
        }
    } catch (error: any) {
        console.error('Erro ao chamar o modelo OpenRouter:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || 'Failed to get response from OpenRouter API');
    }
};
