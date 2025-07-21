
import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import Skeleton from '../ui/Skeleton';
import { PatientView } from '../../types';
import Button from '../ui/Button';

interface PatientDashboardViewProps {
  setView: (view: PatientView) => void;
}

const PatientDashboardView: React.FC<PatientDashboardViewProps> = ({ setView }) => {
    const { state } = useAppContext();
    const { currentUser, sessions, sessionTypes, loading } = state;

    const { nextSession, upcomingCount, professionalName } = useMemo(() => {
        const upcoming = sessions
            .filter(s => new Date(s.startTime) > new Date() && s.status === 'scheduled')
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        const firstSession = upcoming.length > 0 ? upcoming[0] : null;
        
        // This is a simplification; in a real app, the professional's name would be on the session object.
        const profName = "seu/sua profissional"; 
        
        return {
            nextSession: firstSession,
            upcomingCount: upcoming.length,
            professionalName: profName
        };
    }, [sessions]);

    if (loading) return <DashboardSkeleton />;

    const sessionTypeName = sessionTypes.find(st => st.id === nextSession?.sessionTypeId)?.name;

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Bem-vindo(a) de volta, {currentUser?.name.split(' ')[0]}!
                </h1>
                <p className="mt-2 text-gray-600">
                  {upcomingCount > 0 
                    ? `Você tem ${upcomingCount} ${upcomingCount > 1 ? 'sessões agendadas' : 'sessão agendada'}.` 
                    : `Você não tem nenhuma sessão agendada no momento.`}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Precisa de uma nova sessão?</h2>
                        <p className="mt-1 opacity-90">Agende um novo horário com seu profissional de forma rápida e fácil.</p>
                    </div>
                    <Button variant="inverted" onClick={() => setView('schedule')} className="mt-6 w-full sm:w-auto self-start">
                        Agendar nova sessão
                    </Button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Sua Próxima Sessão</h2>
                    {nextSession ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="flex items-center justify-center h-16 w-16 bg-indigo-100 text-indigo-600 rounded-lg flex-shrink-0">
                                <CalendarIcon />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-indigo-800">{sessionTypeName || 'Sessão'}</p>
                                <p className="text-2xl font-light text-gray-800">
                                    {new Date(nextSession.startTime).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                </p>
                                <p className="text-xl font-semibold text-gray-800">
                                    às {new Date(nextSession.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center h-full">
                            <NoSessionsIcon />
                            <p className="mt-2 font-medium">Nenhuma sessão futura.</p>
                            <p className="text-sm">Clique em "Agendar" para marcar seu próximo encontro.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
        </div>
    </div>
);

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const NoSessionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;


export default PatientDashboardView;
