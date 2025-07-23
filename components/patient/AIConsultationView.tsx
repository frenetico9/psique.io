
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getOpenRouterCompletion } from '../../services/openRouterApi';
import { Message, PatientView } from '../../types';
import Button from '../ui/Button';
import UserAvatar from '../ui/UserAvatar';
import { useAppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import { saveAiConsultationResult } from '../../services/mockApi';

interface AIConsultationViewProps {
    setView: (view: PatientView) => void;
}

const AIConsultationView: React.FC<AIConsultationViewProps> = ({ setView }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser, chatHistory, patients } = state;

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const patientProfile = useMemo(() => {
        if (!currentUser || !currentUser.patientProfileId) return null;
        return patients.find(p => p.id === currentUser.patientProfileId);
    }, [currentUser, patients]);

    const getSystemPrompt = (userName: string, userTurns: number = 0) => {
        // After the user answers all 6 questions + consent, the AI must conclude.
        // This corresponds to the call after the 7th user message, so userTurns will be 8.
        const shouldConclude = userTurns >= 8;

        const conclusionInstruction = shouldConclude
            ? `Você já coletou informações sobre todos os seis tópicos. **É ABSOLUTAMENTE OBRIGATÓRIO que você encerre a conversa AGORA na sua PRÓXIMA resposta, sem fazer mais perguntas.**`
            : `Após cobrir o último tópico ("6. Expectativas"), você deve encerrar a conversa.`;
    
        return `Você é a Psique (pronuncia-se 'Pí-si-quê'), uma IA psicóloga assistente. Seu tom é calmo, empático, profissional e acolhedor. Você está conversando com ${userName}.

Seu objetivo é conduzir uma entrevista inicial detalhada para coletar informações essenciais que ajudarão o psicólogo. Você DEVE seguir o roteiro abaixo de forma ESTRITA, fazendo **uma pergunta de cada vez** e avançando para o próximo tópico somente após receber uma resposta.

---
**ROTEIRO OBRIGATÓRIO DA ENTREVISTA**

**Passo 1: Boas-vindas e Consentimento (Apenas na sua primeira mensagem)**
- Se esta for sua primeira mensagem, apresente-se e explique o propósito. Sua mensagem deve ser muito similar a esta: "Olá, ${userName}. Eu sou a Psique, sua assistente de IA para o primeiro contato. Nossa conversa inicial é confidencial e tem como objetivo me ajudar a entender um pouco sobre você, para que sua primeira sessão com um de nossos psicólogos seja o mais produtiva possível. Podemos começar?"
- Aguarde a confirmação do usuário para prosseguir.

**Passo 2: Início da Coleta de Dados (Após consentimento)**
Após o usuário consentir, inicie a sequência de perguntas. Valide cada resposta com uma frase empática curta (ex: "Entendo.", "Obrigada por compartilhar.", "Compreendo.") antes de fazer a próxima pergunta.

**Sequência de Perguntas (Siga esta ordem):**

**1. Motivo Principal:**
   - **Pergunta:** "Para começarmos, poderia me contar um pouco mais detalhadamente sobre o que te trouxe a buscar apoio psicológico neste momento?"

**2. Histórico e Duração:**
   - **Pergunta:** "Há quanto tempo você vem se sentindo assim ou lidando com essa questão?"

**3. Impacto na Rotina:**
   - **Pergunta:** "De que maneira isso tem afetado seu dia a dia? Por exemplo, seu trabalho, estudos, sono ou relacionamentos."

**4. Sentimentos e Sintomas:**
   - **Pergunta:** "Quais são os principais sentimentos ou talvez sintomas físicos que você tem experienciado por conta disso? (Ex: ansiedade, tristeza, falta de energia, etc.)"
    
**5. Experiência Prévia:**
   - **Pergunta:** "Você já fez terapia ou algum tipo de acompanhamento psicológico antes? Se sim, como foi essa experiência para você?"

**6. Expectativas:**
   - **Pergunta:** "E para finalizarmos, o que você mais espera ou gostaria de alcançar com a terapia?"

---
**Passo 3: Encerramento da Conversa**
- ${conclusionInstruction}
- Para encerrar, sua mensagem deve ser muito similar a esta, sem adicionar perguntas: "Agradeço muito por compartilhar tudo isso comigo, ${userName}. Suas respostas foram salvas de forma segura e confidencial, e serão de grande ajuda para o profissional que irá te atender. O próximo passo é agendar sua sessão de 'Primeiro Contato'. Você já pode fazer isso na aba 'Agendar'."
- Após enviar a mensagem de encerramento, não faça mais NENHUMA PERGUNTA.

**Regras Essenciais:**
- **FORMATO DA RESPOSTA:** Sua resposta deve ser apenas a mensagem para o usuário, em português. NUNCA inclua blocos de pensamento como \`<think>\`, comentários internos ou repetições. A resposta deve ser limpa, direta e não pode ser duplicada.
- **NÃO SEJA TERAPEUTA:** Seu papel é exclusivamente coletar informações. NUNCA forneça diagnósticos, conselhos, opiniões, ou tratamento.
- **CRISE (PERIGO IMINENTE):** Se o usuário expressar ideação suicida ou perigo, interrompa o roteiro IMEDIATAMENTE e responda APENAS com: "Compreendo que você está passando por um momento muito difícil. Como uma inteligência artificial, não tenho a capacidade para oferecer o suporte de que você precisa. Por favor, entre em contato com o CVV (Centro de Valorização da Vida) pelo número 188 ou procure um serviço de emergência. Sua segurança é a prioridade."
- **FOCO NO ROTEIRO:** Mantenha-se fiel ao roteiro e à ordem das perguntas. Não desvie do assunto.

Inicie a conversa conforme as instruções do Passo 1, se for a primeira mensagem. Se a conversa já começou, continue a partir da próxima pergunta pendente na sequência.`;
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        const initializeChat = async () => {
            if (!currentUser || patientProfile?.aiConsultationCompleted || chatHistory.length > 0) {
                setIsInitializing(false);
                return;
            }
            setIsInitializing(true);
            try {
                const systemInstruction = getSystemPrompt(currentUser.name, 0);
                const messages = [
                    { role: 'system' as const, content: systemInstruction },
                    { role: 'user' as const, content: "Olá, pode iniciar a conversa." }
                ];
                const firstAiResponse = await getOpenRouterCompletion(messages);
                dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { sender: 'ai', text: firstAiResponse } });
            } catch (error) {
                console.error("Error initializing AI Chat:", error);
                dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { sender: 'ai', text: 'Ocorreu um erro ao iniciar o assistente. Tente novamente mais tarde.' } });
            } finally {
                setIsInitializing(false);
            }
        };
        initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, patientProfile]);
    
    useEffect(() => {
        const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
        if (lastMessage &&
            lastMessage.sender === 'ai' &&
            lastMessage.text.includes("Agradeço muito por compartilhar tudo isso comigo") &&
            currentUser?.patientProfileId &&
            !patientProfile?.aiConsultationCompleted) {

            const saveResult = async () => {
                try {
                    const updatedPatient = await saveAiConsultationResult(currentUser.patientProfileId!, chatHistory);
                    dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
                } catch (error) {
                    console.error("Failed to save AI consultation", error);
                }
            };

            saveResult();
        }
    }, [chatHistory, currentUser, patientProfile, dispatch]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || isInitializing || !currentUser) return;

        const userMessage: Message = { sender: 'user', text: input };
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const userTurns = chatHistory.filter(msg => msg.sender === 'user').length + 1;
            const systemInstruction = getSystemPrompt(currentUser.name, userTurns);
            
            const messages = [
                { role: 'system' as const, content: systemInstruction },
                ...chatHistory.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : ('assistant' as 'user' | 'assistant'),
                    content: msg.text
                })),
                { role: 'user' as const, content: currentInput }
            ];

            const aiResponseText = await getOpenRouterCompletion(messages);
            const aiMessage: Message = { sender: 'ai', text: aiResponseText };
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: aiMessage });

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMsg: Message = { sender: 'ai', text: 'Desculpe, não consegui processar sua mensagem. Tente novamente.' };
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmNewChat = () => {
        dispatch({ type: 'CLEAR_CHAT' });
        setIsConfirmModalOpen(false);
        // The useEffect will re-initialize the chat
        setIsInitializing(true); 
    };
    
    const renderContent = () => {
        if (patientProfile?.aiConsultationCompleted) {
             return (
                <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500" />
                    <h2 className="text-2xl font-bold mt-4 text-gray-800">Análise Concluída!</h2>
                    <p className="text-gray-600 mt-2 max-w-md">
                        Você completou a análise inicial. Suas respostas foram salvas e enviadas ao seu psicólogo. Agora você já pode agendar seu "Primeiro Contato".
                    </p>
                    <Button onClick={() => setView('schedule')} className="mt-6">
                        Agendar Primeira Consulta
                    </Button>
                </div>
            );
        }
        
        return (
            <>
                 {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isInitializing && chatHistory.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        chatHistory.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <SparklesIcon className="w-5 h-5 text-white"/>
                                    </div>
                                )}
                                <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text || '...'}</p>
                                </div>
                                {msg.sender === 'user' && currentUser && (
                                    <div className="w-8 h-8 flex-shrink-0"><UserAvatar name={currentUser.name} /></div>
                                )}
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex items-end gap-3 justify-start">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <SparklesIcon className="w-5 h-5 text-white"/>
                            </div>
                            <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            disabled={isLoading || isInitializing}
                        />
                        <Button onClick={handleSend} disabled={isLoading || isInitializing || !input.trim()} className="!rounded-full w-12 h-12 flex-shrink-0">
                            <SendIcon />
                        </Button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-xl shadow-lg border">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-800">Análise Inicial com IA</h1>
                        <p className="text-sm text-gray-500">Uma conversa guiada para otimizar sua primeira consulta.</p>
                    </div>
                </div>
                {!patientProfile?.aiConsultationCompleted && (
                    <Button variant="ghost" size="sm" onClick={() => setIsConfirmModalOpen(true)} title="Nova conversa">
                        <TrashIcon /> <span className="hidden sm:inline ml-2">Nova Conversa</span>
                    </Button>
                )}
            </div>

            {renderContent()}
            
            {isConfirmModalOpen && (
                <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Iniciar Nova Conversa">
                    <p>Tem certeza que deseja apagar o histórico e começar uma nova conversa com o assistente?</p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={handleConfirmNewChat}>Sim, Iniciar Nova</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const SparklesIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

export default AIConsultationView;
