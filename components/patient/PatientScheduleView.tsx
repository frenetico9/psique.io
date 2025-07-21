
import React, { useState, useMemo } from 'react';
import { Session, SessionType, PatientView, User } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../ui/Toaster';
import { addSession } from '../../services/mockApi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import PaymentModal from './PaymentModal';
import UserAvatar from '../ui/UserAvatar';

interface PatientScheduleViewProps {
  setView: (view: PatientView) => void;
}

const ProfessionalCard: React.FC<{ professional: User, isSelected: boolean, onSelect: () => void }> = ({ professional, isSelected, onSelect }) => (
    <button 
        onClick={onSelect}
        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-4 w-full ${isSelected ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-400'}`}
    >
        <div className="w-12 h-12 flex-shrink-0">
            <UserAvatar name={professional.name} />
        </div>
        <div>
            <p className="font-bold text-gray-800">{professional.name}</p>
            <p className="text-sm text-gray-600">Psicólogo(a)</p>
        </div>
    </button>
);

const PatientScheduleView: React.FC<PatientScheduleViewProps> = ({ setView }) => {
    const { state, dispatch } = useAppContext();
    const { sessionTypes, sessions, currentUser, patients, professionals } = state;
    const toast = useToast();

    const [selectedType, setSelectedType] = useState<SessionType | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<User | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionToPay, setSessionToPay] = useState<Session | null>(null);
    const [showAiPromptModal, setShowAiPromptModal] = useState(false);
    
    const patientProfile = useMemo(() => {
        if (!currentUser || !currentUser.patientProfileId) return null;
        return patients.find(p => p.id === currentUser.patientProfileId);
    }, [currentUser, patients]);
    
    const hasHadFirstContact = useMemo(() => {
        if (!patientProfile) return false;
        return sessions.some(s => s.patientId === patientProfile.id && s.sessionTypeId === 'st_contact' && s.status !== 'cancelled_patient');
    }, [sessions, patientProfile]);

    const availableSlots = useMemo(() => {
        if (!selectedType || !selectedProfessional) return [];
        
        const professionalId = selectedProfessional.id;
        const professionalSessions = sessions.filter(s => s.professionalId === professionalId);

        const slotsByDay: { day: Date, slots: Date[] }[] = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() + i);
            day.setHours(0,0,0,0);
            
            if (day.getDay() === 0 || day.getDay() === 6) continue;

            const daySlots: Date[] = [];
            for (let hour = 9; hour < 17; hour++) {
                for (let minute of [0, 30]) {
                    const slotTime = new Date(day);
                    slotTime.setHours(hour, minute, 0, 0);

                    if (slotTime < new Date()) continue;

                    const conflict = professionalSessions.some(s => {
                        const sessStart = new Date(s.startTime).getTime();
                        const sessEnd = new Date(s.endTime).getTime();
                        const slotStart = slotTime.getTime();
                        const slotEnd = slotStart + selectedType.duration * 60000;
                        return (slotStart < sessEnd && slotEnd > sessStart);
                    });

                    if (!conflict) {
                        daySlots.push(slotTime);
                    }
                }
            }
            if (daySlots.length > 0) {
                slotsByDay.push({ day, slots: daySlots });
            }
        }
        return slotsByDay;
    }, [selectedType, sessions, selectedProfessional]);

    const handleConfirmBooking = async () => {
        if (!selectedSlot || !selectedType || !currentUser || !patientProfile || !selectedProfessional) return;
        setIsLoading(true);

        const endTime = new Date(selectedSlot.getTime() + selectedType.duration * 60000);

        const sessionData: Omit<Session, 'id'> = {
            patientId: patientProfile.id,
            professionalId: selectedProfessional.id,
            sessionTypeId: selectedType.id,
            startTime: selectedSlot,
            endTime,
            status: 'scheduled',
            paymentStatus: 'unpaid',
        };
        
        try {
            const newSess = await addSession(sessionData, currentUser);
            dispatch({ type: 'ADD_SESSION', payload: newSess });
            setIsConfirming(false);
            
            if (selectedType.price > 0) {
                setSessionToPay(newSess);
            } else {
                toast('Sessão gratuita agendada com sucesso!', 'success');
                setSelectedSlot(null);
                setView('sessions');
            }
        } catch (err) {
            toast('Falha ao agendar sessão.', 'error');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Agendar Nova Sessão</h1>

            {/* Step 1: Select Session Type */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-700">1. Escolha o tipo de sessão</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessionTypes.map(type => {
                        const isFirstContact = type.id === 'st_contact';
                        const isDisabled = isFirstContact && hasHadFirstContact;
                        return (
                            <button 
                                key={type.id} 
                                onClick={() => {
                                    if (isDisabled) return;
                                    if (isFirstContact && !patientProfile?.aiConsultationCompleted) {
                                        setShowAiPromptModal(true);
                                    } else {
                                        setSelectedType(type);
                                        setSelectedProfessional(null);
                                        setSelectedSlot(null);
                                    }
                                }}
                                disabled={isDisabled}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${selectedType?.id === type.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-200'} ${isDisabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:border-indigo-400'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-gray-800">{type.name}</p>
                                    {isDisabled && <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">Já realizado</span>}
                                </div>
                                <p className="text-sm text-gray-600 h-10">{type.description}</p>
                                <div className="flex justify-between items-center mt-2 text-sm">
                                    <span className="text-gray-500">{type.duration} min</span>
                                    <span className={`font-semibold ${type.price > 0 ? 'text-green-600' : 'text-indigo-600'}`}>
                                        {type.price > 0 ? type.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Gratuito'}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Step 2: Select Professional */}
            {selectedType && (
                <div className="bg-white p-6 rounded-xl shadow-sm border animate-fade-in">
                    <h2 className="text-xl font-semibold text-gray-700">2. Escolha o(a) profissional</h2>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {professionals.map(prof => (
                            <ProfessionalCard 
                                key={prof.id}
                                professional={prof}
                                isSelected={selectedProfessional?.id === prof.id}
                                onSelect={() => {
                                    setSelectedProfessional(prof);
                                    setSelectedSlot(null);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

             {/* Step 3: Select Slot */}
            {selectedType && selectedProfessional && (
                 <div className="bg-white p-6 rounded-xl shadow-sm border animate-fade-in">
                    <h2 className="text-xl font-semibold text-gray-700">3. Escolha um horário para <span className="text-indigo-600">{selectedType.name}</span> com <span className="text-indigo-600">{selectedProfessional.name.split(' ')[0]}</span></h2>
                    <div className="mt-4 space-y-6">
                        {availableSlots.length > 0 ? availableSlots.map(({ day, slots }) => (
                            <div key={day.toISOString()}>
                                <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">{day.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                    {slots.map(slot => (
                                        <Button 
                                            key={slot.toISOString()}
                                            variant={selectedSlot?.getTime() === slot.getTime() ? 'primary' : 'secondary'}
                                            size="sm"
                                            onClick={() => setSelectedSlot(slot)}
                                        >
                                            {slot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )) : <p className="text-center text-gray-500 py-4">Nenhum horário disponível para esta modalidade nos próximos 7 dias.</p>}
                        {selectedSlot && (
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setIsConfirming(true)}>Agendar Horário Selecionado</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <Modal isOpen={showAiPromptModal} onClose={() => setShowAiPromptModal(false)} title="Primeiro Passo Importante">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-white"/>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Análise Inicial com IA</h3>
                    <p className="mt-2 text-gray-600">Para otimizar sua primeira consulta, pedimos que realize uma breve conversa com nossa assistente de IA. É rápido, confidencial e ajuda seu psicólogo a entender melhor suas necessidades antes mesmo do primeiro encontro.</p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Button variant="secondary" onClick={() => setShowAiPromptModal(false)}>Agora não</Button>
                        <Button variant="primary" onClick={() => { setShowAiPromptModal(false); setView('ai_consultation'); }}>Iniciar Análise</Button>
                    </div>
                </div>
            </Modal>


            {isConfirming && selectedSlot && selectedType && selectedProfessional && (
                <Modal isOpen={isConfirming} onClose={() => setIsConfirming(false)} title="Confirmar Agendamento">
                    <div>
                        <p className="text-gray-600 mb-1">Você está agendando:</p>
                        <p className="text-lg font-bold text-indigo-700">{selectedType.name}</p>
                        <p className="mt-4 text-gray-600 mb-1">Profissional:</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProfessional.name}</p>
                        <p className="mt-4 text-gray-600 mb-1">Data e Hora:</p>
                        <p className="text-lg font-bold text-gray-800">
                           {selectedSlot.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                           <span className="font-semibold"> às </span>
                           {selectedSlot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                         <p className="mt-4 text-gray-600 mb-1">Valor:</p>
                        <p className={`text-lg font-bold ${selectedType.price > 0 ? 'text-green-600' : 'text-indigo-600'}`}>
                            {selectedType.price > 0 ? selectedType.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Gratuito'}
                        </p>
                    </div>
                     <div className="flex justify-end space-x-3 pt-6">
                        <Button variant="secondary" onClick={() => setIsConfirming(false)} disabled={isLoading}>Cancelar</Button>
                        <Button onClick={handleConfirmBooking} disabled={isLoading}>{isLoading ? 'Agendando...' : 'Confirmar'}</Button>
                    </div>
                </Modal>
            )}

            {sessionToPay && (
                 <PaymentModal
                    session={sessionToPay}
                    sessionType={sessionTypes.find(st => st.id === sessionToPay.sessionTypeId)}
                    onClose={() => {
                        setSessionToPay(null);
                        toast('Agendamento concluído. O pagamento ficará pendente.', 'info');
                        setView('sessions');
                    }}
                    onSuccess={(updatedSession) => {
                        dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
                        setSessionToPay(null);
                        toast('Pagamento realizado e sessão confirmada!', 'success');
                        setView('sessions');
                    }}
                />
            )}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    )
}

const ChatBubbleLeftRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.347 17.653 8.5 16.689 8.5 15.553V11.267c0-.97.616-1.813 1.5-2.097m6.25 0a9.023 9.023 0 00-12.5 0" /></svg>;

export default PatientScheduleView;
    
