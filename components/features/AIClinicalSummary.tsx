import React, { useState } from 'react';
import { ClinicalNote } from '../../types';
import { getOpenRouterCompletion } from '../../services/openRouterApi';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';

interface AIClinicalSummaryProps {
    notes: ClinicalNote[];
    patientName: string;
}

interface AISummary {
    summary: string;
    themes: string[];
    suggestions: string[];
}

const extractJsonFromString = (text: string): string => {
    // Matches a JSON block wrapped in ```json ... ``` or just ``` ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    // If no markdown block is found, return the original text, trimmed.
    // JSON.parse will then handle it.
    return text.trim();
};

const AIClinicalSummary: React.FC<AIClinicalSummaryProps> = ({ notes, patientName }) => {
    const [summary, setSummary] = useState<AISummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setError(null);
        setSummary(null);

        const notesContent = notes
            .map(note => `Data: ${new Date(note.createdAt).toLocaleDateString('pt-BR')}\nAnotação: ${note.content}`)
            .join('\n\n---\n\n');

        const systemPrompt = `Você é um assistente de IA para psicólogos. Sua tarefa é analisar anotações clínicas e retornar um resumo estruturado em formato JSON. Seja conciso, profissional e baseie-se estritamente nas informações fornecidas. Não invente detalhes. A sua resposta DEVE conter APENAS o objeto JSON, sem nenhum texto adicional, explicação ou marcadores de markdown.`;
        
        const userPrompt = `Analise as seguintes anotações clínicas para o paciente ${patientName}.
    
Anotações:
---
${notesContent}
---

Retorne um objeto JSON com as seguintes chaves:
- "summary": Um resumo conciso do progresso geral do paciente (máximo de 4 frases).
- "themes": Uma lista de 3 a 5 temas ou tópicos principais que aparecem repetidamente nas anotações.
- "suggestions": Uma lista de 2 a 3 sugestões de ponto a serem explorados ou técnicas a serem consideradas na próxima sessão, com base nos temas identificados.`;


        try {
            const messages = [
                { role: 'system' as const, content: systemPrompt },
                { role: 'user' as const, content: userPrompt }
            ];
            
            const responseText = await getOpenRouterCompletion(messages, true); // true for JSON mode
            const jsonString = extractJsonFromString(responseText);
            const parsedSummary: AISummary = JSON.parse(jsonString);
            setSummary(parsedSummary);

        } catch (err) {
            console.error("Error generating summary:", err);
            setError("Não foi possível gerar o resumo. A resposta da IA pode não ser um JSON válido ou a API pode estar indisponível. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (notes.length === 0) {
        return (
            <div className="text-center py-12 px-6 bg-white rounded-lg border-2 border-dashed">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Sem Anotações Clínicas</h3>
                <p className="mt-1 text-sm text-gray-500">Adicione anotações clínicas para habilitar os insights da IA.</p>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg border shadow-sm text-center">
                 <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                     <SparklesIcon className="w-8 h-8 text-white"/>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Insights Clínicos com IA</h2>
                <p className="mt-2 max-w-2xl mx-auto text-gray-600">
                    Obtenha um resumo rápido, identifique temas recorrentes e receba sugestões para as próximas sessões, tudo com base no histórico de anotações do paciente.
                </p>
                <Button onClick={handleGenerateSummary} disabled={isLoading} className="mt-6">
                    {isLoading ? 'Gerando Resumo...' : 'Gerar Resumo Clínico'}
                </Button>
            </div>
            
            {isLoading && <SummarySkeleton />}

            {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>}
            
            {summary && (
                <div className="p-6 bg-white rounded-lg border shadow-sm space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                           <ClipboardDocumentCheckIcon/> Resumo Geral
                        </h3>
                        <p className="mt-2 text-gray-700">{summary.summary}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <TagIcon /> Temas Principais
                            </h3>
                            <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
                                {summary.themes.map((theme, i) => <li key={i}>{theme}</li>)}
                            </ul>
                        </div>
                         <div>
                             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <LightBulbIcon /> Sugestões para Próxima Sessão
                            </h3>
                            <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
                                {summary.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                            </ul>
                        </div>
                    </div>
                     <p className="text-xs text-center text-gray-400 pt-4">∗ Este resumo foi gerado por IA e deve ser usado apenas como um auxílio. Sempre confie no seu julgamento clínico.</p>
                </div>
            )}
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

const SummarySkeleton = () => (
    <div className="p-6 bg-white rounded-lg border shadow-sm space-y-6">
        <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Skeleton className="h-6 w-40 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
            </div>
            <div>
                <Skeleton className="h-6 w-40 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    </div>
);

// Icons
const SparklesIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.25 2.25A2.25 2.25 0 003 4.5v15A2.25 2.25 0 005.25 21.75h13.5A2.25 2.25 0 0021 19.5V4.5A2.25 2.25 0 0018.75 2.25H5.25zM6.75 6a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zM6 15a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9A.75.75 0 016 15z" clipRule="evenodd" /></svg>;
const ClipboardDocumentCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10.5 3.75a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h3a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25h-3zm.75 4.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm0 3a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" clipRule="evenodd" /><path d="M5.25 3.75A2.25 2.25 0 003 6v10.5a2.25 2.25 0 002.25 2.25h.75V18a3 3 0 013-3h3a3 3 0 013 3v1.5h.75a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018.75 3.75h-3.75a.75.75 0 01-.75-.75V3a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v.75a.75.75 0 01-.75.75H5.25z" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M5.625 1.5a.75.75 0 01.75.75v1.875c0 .354.112.686.309.966l7.58 11.368a.75.75 0 01-.93.931l-7.58-11.368A2.25 2.25 0 006.375 6V4.125a.75.75 0 01-.75-.75V1.5a.75.75 0 01.75-.75zm10.84 3.39a.75.75 0 01.321.966l-7.58 11.368a.75.75 0 01-1.282-.398L.879 5.864a.75.75 0 011.282-.398l7.233 10.85A2.25 2.25 0 0011.625 18v1.875a.75.75 0 01-1.5 0V18a3.75 3.75 0 01-2.09-7.04l-7.233-10.85a2.25 2.25 0 013.845-1.195l7.58 11.368a.75.75 0 00.93.931l7.58-11.368a2.25 2.25 0 013.845 1.195l-7.233 10.85A3.75 3.75 0 0112.375 6V4.125a.75.75 0 00-1.5 0V6a2.25 2.25 0 001.373 2.126l7.233-10.85a.75.75 0 00-1.282-.398L10.95 14.142a.75.75 0 11-1.282-.398L16.899 2.4a.75.75 0 01.562-1.15z" clipRule="evenodd" /></svg>;
const LightBulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM17.834 17.834a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.834a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6.166 6.166a.75.75 0 00-1.06 1.06L6.696 8.82a.75.75 0 001.06-1.06L6.166 6.166zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75z" /></svg>;

export default AIClinicalSummary;
