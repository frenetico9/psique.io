

// IMPORTANTE: Em uma aplicação real, estas chaves de API devem ser tratadas de forma segura em um backend
// e não expostas no código do frontend. Para esta demonstração, ela está incluída aqui.
const API_KEYS = [
    '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',
    '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',
    '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' // ← terceira chave aqui
];

let requestCount = 0;

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const getOpenRouterCompletion = async (messages: OpenRouterMessage[], jsonMode: boolean = false): Promise<string> => {
    try {
        // Alterna a chave a cada 2 solicitações
        const keyIndex = Math.floor(requestCount / 2) % API_KEYS.length;
        const apiKey = API_KEYS[keyIndex];
        requestCount++;

        const requestBody: {
            model: string;
            messages: OpenRouterMessage[];
            response_format?: { type: string };
        } = {
            model: "qwen/qwen-2.5-72b-instruct:free",
            messages: messages,
        };

        if (jsonMode) {
            requestBody.response_format = { type: "json_object" };
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://psique-io.vercel.app/",
                "X-Title": "Psique.IO",
            },
            body: JSON.stringify(requestBody)
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
        throw error;
    }
};
