// IMPORTANTE: Em uma aplicação real, esta chave de API deve ser tratada de forma segura em um backend
// e não exposta no código do frontend. Para esta demonstração, ela está incluída aqui.
const ARLIAI_API_KEY = '19285904-92bc-4679-9e1f-5fe49fcbc5ce';

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * NOTE: This function now calls the ArliAI API.
 * The name is kept for compatibility with existing components to minimize changes.
 */
export const getOpenRouterCompletion = async (messages: OpenRouterMessage[]): Promise<string> => {
    try {
        const response = await fetch("https://api.arliai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ARLIAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "Gemma-3-27B-ArliAI-RPMax-v3",
                "messages": messages,
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("ArliAI API Error:", response.status, errorBody);
            throw new Error(`Erro na API: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Assuming an OpenAI-compatible response structure.
        // This is a common pattern for chat completion APIs.
        if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
            return data.choices[0].message.content;
        }

        // The user did not specify the response format. If the above assumption is wrong,
        // the application might not display the AI response correctly.
        throw new Error("A API não retornou uma resposta em um formato esperado.");

    } catch (error) {
        console.error("Falha ao obter resposta da ArliAI:", error);
        // Re-lança o erro para que o componente que chamou possa tratá-lo
        throw error;
    }
};
