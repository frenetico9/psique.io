
import React, { useMemo } from 'react';
import StatCard from '../ui/StatCard';
import { useAppContext } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../ui/Skeleton';
import { Session } from '../../types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-semibold text-indigo-700">{`${payload[0].value} ${payload[0].value === 1 ? 'sessão' : 'sessões'}`}</p>
            </div>
        );
    }
    return null;
};

const DashboardView: React.FC = () => {
    const { state } = useAppContext();
    const { sessions, patients, sessionTypes, clinicalNotes, loading } = state;

    const stats = useMemo(() => {
        const totalSessionsPast = sessions.filter(s => new Date(s.startTime) < new Date()).length;
        const attendedSessions = sessions.filter(s => s.status === 'completed').length;
        const attendanceRate = totalSessionsPast > 0 ? ((attendedSessions / totalSessionsPast) * 100).toFixed(0) : '100';
        
        const sessionsWithNotes = new Set(clinicalNotes.map(n => n.sessionId));
        const pendingNotes = sessions.filter(s => s.status === 'completed' && !sessionsWithNotes.has(s.id)).length;

        return {
            activePatients: patients.length,
            sessionsToday: sessions.filter(s => new Date(s.startTime).toDateString() === new Date().toDateString()).length,
            attendanceRate: `${attendanceRate}%`,
            pendingNotes,
        }
    }, [sessions, patients, clinicalNotes]);

    const sessionsToday = useMemo(() => {
        return sessions
            .filter(s => new Date(s.startTime).toDateString() === new Date().toDateString())
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map(sess => ({
                ...sess,
                patient: patients.find(p => p.id === sess.patientId),
                sessionType: sessionTypes.find(st => st.id === sess.sessionTypeId)
            }));
    }, [sessions, patients, sessionTypes]);

    const chartData = useMemo(() => {
        const data: { [key: string]: number } = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toLocaleDateString('pt-BR', { weekday: 'short' });
            data[dateString] = 0;
        }

        sessions.forEach(sess => {
            const sessDate = new Date(sess.startTime);
            if (sess.status === 'completed' && sessDate <= today && sessDate > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
                const dateString = sessDate.toLocaleDateString('pt-BR', { weekday: 'short' });
                if(data[dateString] !== undefined) {
                   data[dateString]++;
                }
            }
        });

        return Object.entries(data).map(([name, value]) => ({ name, sessões: value }));
    }, [sessions]);
    
    if (loading) return <DashboardSkeleton />;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Clínico</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pacientes Ativos" value={stats.activePatients.toString()} icon={<UsersIcon />} color="text-indigo-500" />
                <StatCard title="Sessões Hoje" value={stats.sessionsToday.toString()} icon={<CalendarIcon />} color="text-teal-500" />
                <StatCard title="Taxa de Comparecimento" value={stats.attendanceRate} icon={<CheckBadgeIcon />} color="text-green-500" />
                <StatCard title="Anotações Pendentes" value={stats.pendingNotes.toString()} icon={<PencilSquareIcon />} color="text-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Sessões Realizadas (Últimos 7 Dias)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                            <Bar dataKey="sessões" fill="#6366f1" name="Sessões Realizadas" radius={[5, 5, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Foco do Dia</h2>
                    <div className="space-y-4">
                        {sessionsToday.length > 0 ? (
                            sessionsToday.map(sess => (
                                <div key={sess.id} className="flex items-center space-x-4">
                                    <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                                        <ClockIcon />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{new Date(sess.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {sess.patient?.name}</p>
                                        <p className="text-sm text-gray-500">{sess.sessionType?.name}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-gray-500">Nenhuma sessão agendada para hoje.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="h-9 w-72 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2"><Skeleton className="h-80 rounded-xl" /></div>
            <div><Skeleton className="h-80 rounded-xl" /></div>
        </div>
    </div>
);

// Icons
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const PencilSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default DashboardView;
