// IMPORTANTE: Em uma aplicação real, esta chave de API deve ser tratada de forma segura em um backend
// e não exposta no código do frontend. Para esta demonstração, ela está incluída aqui.
const API_KEY = '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';

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const getOpenRouterCompletion = async (messages: OpenRouterMessage[]): Promise<string> => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                // Headers opcionais para ranking no openrouter.ai
                "HTTP-Referer": "https://psique-io.vercel.app/", 
                "X-Title": "Psique.IO",
            },
            body: JSON.stringify({
                "model": "moonshotai/kimi-k2:free",
                "messages": messages,
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenRouter API Error:", response.status, errorBody);
            throw new Error(`Erro na API: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
            return data.choices[0].message.content;
        }

        throw new Error("A API não retornou uma resposta válida.");

    } catch (error) {
        console.error("Falha ao obter resposta do OpenRouter:", error);
        // Re-lança o erro para que o componente que chamou possa tratá-lo
        throw error;
    }
};
