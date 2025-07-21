
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Skeleton from '../ui/Skeleton';
import { Session } from '../../types';
import Button from '../ui/Button';

// --- Custom Chart Components ---

const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value as number;
        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-semibold text-indigo-700">{value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
        );
    }
    return null;
};

const CustomServiceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800">{payload[0].name}</p>
                <p className="text-sm text-gray-600">{`${payload[0].value} ${payload[0].value === 1 ? 'sessão' : 'sessões'}`}</p>
            </div>
        );
    }
    return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't render label for small slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm pointer-events-none">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const SatisfactionCard: React.FC<{ session: Session }> = ({ session }) => {
    const { state } = useAppContext();
    const { sessionTypes } = state;
    const sessionType = sessionTypes.find(s => s.id === session.sessionTypeId);

    return (
        <div className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800">{sessionType?.name || 'Sessão'}</p>
                    <p className="text-sm text-gray-500">{new Date(session.startTime).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon key={i} className={`w-5 h-5 ${i < session.satisfaction! ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReportsView: React.FC = () => {
    const { state } = useAppContext();
    const { sessions, sessionTypes, loading } = state;

    const monthlyRevenueData = useMemo(() => {
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const revenueByMonth: { [key: string]: number } = {};

        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
            revenueByMonth[monthKey] = 0;
        }

        sessions.forEach(session => {
            if (session.status === 'completed') {
                const sessionType = sessionTypes.find(s => s.id === session.sessionTypeId);
                if (sessionType) {
                    const sessionDate = new Date(session.startTime);
                    const monthKey = `${monthNames[sessionDate.getMonth()]}/${sessionDate.getFullYear().toString().slice(-2)}`;
                    if (revenueByMonth.hasOwnProperty(monthKey)) {
                        revenueByMonth[monthKey] += sessionType.price;
                    }
                }
            }
        });

        return Object.entries(revenueByMonth).map(([name, faturamento]) => ({ name, faturamento }));
    }, [sessions, sessionTypes]);

    const popularServicesData = useMemo(() => {
        const serviceCounts: { [key: string]: number } = {};
        sessionTypes.forEach(s => serviceCounts[s.name] = 0);
        
        sessions.forEach(session => {
            const sessionType = sessionTypes.find(s => s.id === session.sessionTypeId);
            if (sessionType) {
                serviceCounts[sessionType.name]++;
            }
        });
        
        return Object.entries(serviceCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
    }, [sessions, sessionTypes]);
    
    const satisfactionData = useMemo(() => {
        return sessions.filter(s => s.status === 'completed' && s.satisfaction)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, 10);
    }, [sessions]);

    const COLORS = ['#6366f1', '#14b8a6', '#f97316', '#d946ef', '#8b5cf6'];

    if (loading) return <ReportsSkeleton />;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Relatórios e Análises</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Faturamento Mensal (Últimos 6 meses)</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value: number) => `R$${value/1000}k`} axisLine={false} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip content={<CustomRevenueTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Area type="monotone" dataKey="faturamento" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Tipos de Sessão Mais Populares</h2>
                     <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                             <Pie 
                                data={popularServicesData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={70} 
                                outerRadius={110} 
                                paddingAngle={3} 
                                labelLine={false} 
                                label={renderCustomizedLabel}
                             >
                                {popularServicesData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2}/>)}
                             </Pie>
                             <Tooltip content={<CustomServiceTooltip />} cursor={{ fill: 'transparent' }} />
                             <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}/>
                         </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Feedback de Satisfação Recente</h2>
                <div className="overflow-x-auto">
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        {satisfactionData.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {satisfactionData.map(session => <SatisfactionCard key={session.id} session={session} />)}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-gray-500">Nenhum feedback de satisfação recebido.</p>
                        )}
                    </div>
                    {/* Desktop Table View */}
                    <table className="hidden md:table min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Sessão</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {satisfactionData.map(session => (
                            <tr key={session.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{new Date(session.startTime).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{sessionTypes.find(s => s.id === session.sessionTypeId)?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <span className="flex items-center">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <StarIcon key={i} className={`w-5 h-5 ${i < session.satisfaction! ? 'text-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </span>
                                </td>
                            </tr>
                        ))}
                         {satisfactionData.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-gray-500">Nenhum feedback de satisfação recebido.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ReportsSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="h-9 w-80" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
    </div>
);

const StarIcon: React.FC<{className: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

export default ReportsView;