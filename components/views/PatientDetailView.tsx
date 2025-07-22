

import React, { useMemo, useState, useEffect } from 'react';
import { Patient, Session, ClinicalNote, ClinicalNoteFormData } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { addClinicalNote } from '../../services/mockApi';
import { useToast } from '../ui/Toaster';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import UserAvatar from '../ui/UserAvatar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import EmptyState from '../ui/EmptyState';
import AIClinicalSummary from '../features/AIClinicalSummary';

interface PatientDetailViewProps {
    patientId: string;
    onBack: () => void;
}

const statusBadge: Record<Session['status'], string> = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled_patient: "bg-yellow-100 text-yellow-800",
    no_show: "bg-red-100 text-red-800",
};

const statusText: Record<Session['status'], string> = {
    scheduled: "Agendada",
    completed: "Realizada",
    cancelled_patient: "Cancelada",
    no_show: "Não Compareceu",
};

const ClinicalNoteForm: React.FC<{ patientId: string, onNoteAdded: () => void }> = ({ patientId, onNoteAdded }) => {
    const { dispatch } = useAppContext();
    const toast = useToast();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            toast('A anotação não pode estar vazia.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const newNoteData: ClinicalNoteFormData = { patientId, content };
            const newNote = await addClinicalNote(newNoteData);
            dispatch({ type: 'ADD_CLINICAL_NOTE', payload: newNote });
            toast('Anotação salva com sucesso!', 'success');
            setContent('');
            onNoteAdded();
        } catch {
            toast('Falha ao salvar anotação.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Escreva sua anotação de evolução aqui..."
            />
            <div className="text-right">
                <Button type="submit" disabled={isSubmitting || !content.trim()}>
                    {isSubmitting ? 'Salvando...' : 'Salvar Anotação'}
                </Button>
            </div>
        </form>
    );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.07) return null; // Don't render label for small slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm select-none pointer-events-none">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800">{`${payload[0].name}: ${payload[0].value} ${payload[0].value === 1 ? 'sessão' : 'sessões'}`}</p>
            </div>
        );
    }
    return null;
};

const PatientOverview: React.FC<{ patient: Patient, sessions: Session[], notes: ClinicalNote[] }> = ({ patient, sessions, notes }) => {
    
    const stats = useMemo(() => {
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const noShowSessions = sessions.filter(s => s.status === 'no_show');
        const totalConsidered = completedSessions.length + noShowSessions.length;
        const attendanceRate = totalConsidered > 0 ? (completedSessions.length / totalConsidered * 100).toFixed(0) : '100';
        const nextSession = sessions.filter(s => s.status === 'scheduled' && new Date(s.startTime) > new Date()).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
        
        return {
            totalSessions: sessions.length,
            attendanceRate: `${attendanceRate}%`,
            nextSession: nextSession ? new Date(nextSession.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'N/A'
        }
    }, [sessions]);

    const sessionStatusData = useMemo(() => {
        const statusCounts = sessions.reduce((acc, session) => {
            acc[session.status] = (acc[session.status] || 0) + 1;
            return acc;
        }, {} as Record<Session['status'], number>);
        
        return [
            { name: 'Realizadas', value: statusCounts.completed || 0, color: '#14b8a6' },
            { name: 'Agendadas', value: statusCounts.scheduled || 0, color: '#6366f1' },
            { name: 'Canceladas', value: statusCounts.cancelled_patient || 0, color: '#f59e0b' },
            { name: 'Faltas', value: statusCounts.no_show || 0, color: '#f43f5e' },
        ].filter(item => item.value > 0);
    }, [sessions]);

    const recentActivity = useMemo(() => {
        const sessionActivities = sessions.map(s => ({
            type: 'session',
            date: new Date(s.startTime),
            description: `Sessão ${statusText[s.status].toLowerCase()}`,
            id: s.id,
        }));
        const noteActivities = notes.map(n => ({
            type: 'note',
            date: new Date(n.createdAt),
            description: 'Anotação clínica adicionada',
            id: n.id
        }));

        return [...sessionActivities, ...noteActivities]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);
    }, [sessions, notes]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<ListBulletIcon />} title="Total de Sessões" value={stats.totalSessions} />
                <StatCard icon={<CheckBadgeIcon />} title="Comparecimento" value={stats.attendanceRate} />
                <StatCard icon={<CalendarDaysIcon />} title="Próxima Sessão" value={stats.nextSession} />
                <StatCard icon={<UserPlusIcon />} title="Paciente Desde" value={new Date(patient.createdAt).toLocaleDateString('pt-br')} />
            </div>
            <div className="lg:col-span-1 bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center">
                <h3 className="font-semibold text-gray-700 mb-2">Distribuição de Sessões</h3>
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie 
                            data={sessionStatusData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={5}
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                             {sessionStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="#fff" strokeWidth={2} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }}/>
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div className="lg:col-span-2 bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-4">Atividade Recente</h3>
                <ul className="space-y-3">
                    {recentActivity.map((activity) => (
                        <li key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
                            <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${activity.type === 'session' ? 'bg-indigo-500' : 'bg-green-500'}`}></div>
                            <div className="flex-grow">
                                <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                                <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </div>
                        </li>
                    ))}
                    {recentActivity.length === 0 && <p className="text-sm text-center py-8 text-gray-500">Nenhuma atividade recente.</p>}
                </ul>
            </div>
        </div>
    );
};

const StatCard: React.FC<{icon: React.ReactNode, title: string, value: string | number}> = ({icon, title, value}) => (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
            <div className="text-indigo-500 bg-indigo-100 p-3 rounded-lg">{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const PatientDetailSkeleton = () => (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-9 w-64 rounded-md" />
        </div>

        {/* Patient Info Banner */}
        <Skeleton className="h-28 rounded-lg" />

        {/* Tabs */}
        <div className="border-b border-gray-200">
            <div className="flex space-x-6">
                <Skeleton className="h-8 w-24 mb-2 rounded" />
                <Skeleton className="h-8 w-20 mb-2 rounded" />
                <Skeleton className="h-8 w-32 mb-2 rounded" />
            </div>
        </div>
        
        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="h-64 rounded-lg" />
            <div className="lg:col-span-2"><Skeleton className="h-64 rounded-lg" /></div>
        </div>
    </div>
);


const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patientId, onBack }) => {
    const { state, dispatch } = useAppContext();
    const { sessions, sessionTypes, clinicalNotes, patients, loading } = state;
    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'notes' | 'ai_consultation' | 'ai_summary'>('overview');
    const toast = useToast();

    const patient = useMemo(() => patients.find(p => p.id === patientId), [patients, patientId]);

    useEffect(() => {
        // Se o carregamento terminou e o paciente não foi encontrado, volta para a lista.
        if (!loading && !patient) {
            toast('Paciente não encontrado.', 'error');
            onBack();
        }
    }, [loading, patient, onBack, toast]);

    const patientData = useMemo(() => {
        if (!patient) return { sessions: [], notes: [] };
        const patientSessions = sessions
            .filter(s => s.patientId === patient.id)
            .map(s => ({ 
                ...s, 
                sessionTypeName: sessionTypes.find(st => st.id === s.sessionTypeId)?.name || 'Desconhecido' 
            }))
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        
        const patientNotes = clinicalNotes
            .filter(n => n.patientId === patient.id)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { sessions: patientSessions, notes: patientNotes };
    }, [sessions, sessionTypes, clinicalNotes, patient]);

    // Usa o estado de carregamento global. Se o paciente ainda não estiver carregado, mostra o esqueleto.
    if (loading || !patient) {
        return <PatientDetailSkeleton />;
    }
    
    const tabs = [
        { id: 'overview', label: 'Visão Geral' },
        { id: 'sessions', label: 'Sessões' },
        { id: 'notes', label: 'Anotações Clínicas' },
        { id: 'ai_consultation', label: 'Análise Inicial (IA)' },
        { id: 'ai_summary', label: 'Resumo Clínico (IA)' },
    ];
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onBack} className="!p-2 h-10 w-10 !rounded-full"><ArrowLeftIcon /></Button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 truncate">Prontuário de {patient.name}</h1>
            </div>

            {/* Patient Info Banner */}
            <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <UserAvatar name={patient.name} className="w-16 h-16 flex-shrink-0 text-2xl" />
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                     <div>
                        <p className="text-xs text-slate-500">Paciente</p>
                        <p className="font-semibold text-slate-700 truncate">{patient.name}</p>
                     </div>
                      <div>
                        <p className="text-xs text-slate-500">Contato</p>
                        <p className="font-semibold text-slate-700 truncate">{patient.phone}</p>
                     </div>
                      <div>
                        <p className="text-xs text-slate-500">E-mail</p>
                        <p className="font-semibold text-slate-700 truncate">{patient.email}</p>
                     </div>
                      <div>
                        <p className="text-xs text-slate-500">Paciente desde</p>
                        <p className="font-semibold text-slate-700">{new Date(patient.createdAt).toLocaleDateString('pt-br')}</p>
                     </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`whitespace-nowrap py-3 px-2 sm:px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {/* Tab Content */}
            <div className="pt-2">
                {activeTab === 'overview' && <PatientOverview patient={patient} sessions={patientData.sessions} notes={patientData.notes} />}
                {activeTab === 'sessions' && (
                     <div className="bg-white rounded-lg border shadow-sm divide-y divide-gray-200">
                        {patientData.sessions.length > 0 ? (
                            patientData.sessions.map(s => (
                                <div key={s.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                    <div>
                                        <p className="font-semibold text-gray-800">{s.sessionTypeName}</p>
                                        <p className="text-sm text-gray-600">{new Date(s.startTime).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                                    </div>
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge[s.status]} self-end sm:self-center`}>{statusText[s.status]}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-6">
                                <EmptyState icon={<CalendarDaysIcon className="h-8 w-8"/>} title="Nenhuma sessão encontrada" description="Nenhuma sessão foi agendada para este paciente ainda."/>
                            </div>
                        )}
                    </div>
                )}
                 {activeTab === 'notes' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                            <h4 className="font-semibold text-slate-700 mb-2 text-lg">Nova Anotação de Evolução</h4>
                            <ClinicalNoteForm patientId={patient.id} onNoteAdded={() => {}}/>
                        </div>
                         {patientData.notes.length > 0 ? (
                            patientData.notes.map(note => (
                                <div key={note.id} className="p-4 bg-white border rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-medium mb-1">{new Date(note.createdAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                </div>
                            ))
                         ) : (
                            <div className="p-6 bg-white rounded-lg border shadow-sm">
                                <EmptyState icon={<DocumentTextIcon className="h-8 w-8"/>} title="Nenhuma anotação clínica" description="Adicione a primeira anotação para começar o histórico."/>
                            </div>
                         )}
                    </div>
                )}
                {activeTab === 'ai_consultation' && (
                     <div className="bg-white rounded-lg border shadow-sm p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcrição da Análise Inicial com IA</h3>
                        {patient.aiConsultationHistory && patient.aiConsultationHistory.length > 0 ? (
                            <div className="space-y-6 max-h-[60vh] overflow-y-auto p-4 bg-slate-50 rounded-lg">
                                {patient.aiConsultationHistory.map((msg, index) => (
                                    <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender === 'ai' && (
                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <SparklesIcon className="w-5 h-5 text-white"/>
                                            </div>
                                        )}
                                        <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                           <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                         {msg.sender === 'user' && (
                                             <div className="w-8 h-8 flex-shrink-0"><UserAvatar name={patient.name} /></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState 
                                icon={<ChatBubbleLeftRightIcon className="h-8 w-8"/>} 
                                title="Nenhuma Análise Inicial Realizada" 
                                description="O paciente ainda não completou a conversa inicial com o assistente de IA."
                            />
                        )}
                    </div>
                )}
                {activeTab === 'ai_summary' && <AIClinicalSummary notes={patientData.notes} patientName={patient.name} />}
            </div>
        </div>
    );
};

// --- ICONS ---
const SparklesIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const ChatBubbleLeftRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.347 17.653 8.5 16.689 8.5 15.553V11.267c0-.97.616-1.813 1.5-2.097m6.25 0a9.023 9.023 0 00-12.5 0M15.5 10.125c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125S16.625 11.754 16.625 11.25s-.504-1.125-1.125-1.125zM12 10.125c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125S13.125 11.754 13.125 11.25s-.504-1.125-1.125-1.125zM8.5 10.125c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125S9.625 11.754 9.625 11.25s-.504-1.125-1.125-1.125z" /></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const ListBulletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75c-1.357 0-2.573-.6-3.397-1.549a4.49 4.49 0 01-3.498-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.498 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>;
const CalendarDaysIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12.75 12.75a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V18a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25v-2.25z" /><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h15a3 3 0 013 3v15a3 3 0 01-3-3h-15a3 3 0 01-3-3v-15zM3 6a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 6v13.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5V6z" clipRule="evenodd" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.12v-.003zM16 12.75a.75.75 0 00-1.5 0v2.25h-2.25a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5h-2.25V12.75z" /></svg>;
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.25 2.25A2.25 2.25 0 003 4.5v15A2.25 2.25 0 005.25 21.75h13.5A2.25 2.25 0 0021 19.5V4.5A2.25 2.25 0 0018.75 2.25H5.25zM6.75 6a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zM6 15a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9A.75.75 0 016 15z" clipRule="evenodd" /></svg>;

export default PatientDetailView;