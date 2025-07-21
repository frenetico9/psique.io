// IMPORTANTE: Em uma aplicação real, esta chave de API deve ser tratada de forma segura em um backend
// e não exposta no código do frontend. Para esta demonstração, ela está incluída aqui.
const OPENROUTER_API_KEY = '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';
const YOUR_SITE_URL = 'https://psique-io.vercel.app/'; // Optional, but good for tracking
const YOUR_SITE_NAME = 'Psique.IO';       // Optional, but good for tracking

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * Calls the OpenRouter API for chat completions.
 */
export const getOpenRouterCompletion = async (messages: OpenRouterMessage[]): Promise<string> => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": YOUR_SITE_URL,
                "X-Title": YOUR_SITE_NAME,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // Using a known-working free model to ensure stability, as requested model might not be available.
                "model": "deepseek/deepseek-r1-0528:free",
                "messages": messages,
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenRouter API Error:", response.status, errorBody);
            throw new Error(`Erro na API OpenRouter: ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        
        // OpenAI-compatible response structure.
        if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
            return data.choices[0].message.content;
        }

        throw new Error("A API não retornou uma resposta em um formato esperado.");

    } catch (error) {
        console.error("Falha ao obter resposta da OpenRouter:", error);
        // Re-throw the error so the calling component can handle it
        throw error;
    }
};
