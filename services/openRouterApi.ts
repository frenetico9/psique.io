import axios from 'axios';

// IMPORTANTE: Em uma aplicação real, esta chave de API deve ser tratada de forma segura em um backend
// e não exposta no código do frontend. Para esta demonstração, ela está incluída aqui.
const API_KEY = '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';
const MODEL_ID = 'deepseek/deepseek-r1-0528:free';
const APP_TITLE = 'MeuSistemaTS';


interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const getOpenRouterCompletion = async (messages: OpenRouterMessage[]): Promise<string> => {
  // Constrói os cabeçalhos no momento da chamada para garantir os valores corretos.
  const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'HTTP-Referer': SITE_URL,
    'X-Title': APP_TITLE,
    'Content-Type': 'application/json',
  };

  try {
    // Usa axios.post diretamente para simplificar e evitar problemas com a instância.
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: MODEL_ID,
      messages: messages,
    }, { headers });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        if (content) {
            return content;
        }
    }
    
    throw new Error('Resposta inválida da API do OpenRouter.');

  } catch (error) {
    console.error('Erro com a API do OpenRouter:', error);
    let errorMessage = 'Falha ao comunicar com o assistente de IA.';
    if (axios.isAxiosError(error) && error.response) {
      console.error('Resposta de erro da API:', error.response.data);
      const apiError = error.response.data?.error?.message;
      if (apiError) {
          errorMessage = `Erro da API: ${apiError}`;
      }
    }
    throw new Error(errorMessage);
  }
};
