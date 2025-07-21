

import React, { useState, useMemo } from 'react';
import { Session } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../ui/Toaster';
import { addSession, updateSession, deleteSession } from '../../services/mockApi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SessionForm from '../forms/SessionForm';
import Skeleton from '../ui/Skeleton';

const statusStyles: Record<Session['status'], { bg: string, border: string, text: string }> = {
    scheduled: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' },
    completed: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' },
    cancelled_patient: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800 line-through' },
    no_show: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800 line-through' },
};

const CalendarView: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { state, dispatch } = useAppContext();
    const { sessions, patients, sessionTypes, currentUser, loading } = state;
    const toast = useToast();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [defaultDateTime, setDefaultDateTime] = useState<Date | undefined>();
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    
    const dailySessions = useMemo(() => {
        return sessions
            .filter(s => new Date(s.startTime).toDateString() === selectedDate.toDateString())
            .map(sess => ({
                ...sess,
                patient: patients.find(p => p.id === sess.patientId),
                sessionType: sessionTypes.find(st => st.id === sess.sessionTypeId)
            }))
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [selectedDate, sessions, patients, sessionTypes]);

    const timeSlots = useMemo(() => Array.from({ length: 32 }, (_, i) => `${(7 + Math.floor(i / 2)).toString().padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`), []);

    const changeDate = (offset: number) => setSelectedDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + offset);
        return newDate;
    });

    const handleOpenForm = (session: Session | null, dateTime?: Date) => {
        setEditingSession(session);
        setDefaultDateTime(dateTime);
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setEditingSession(null);
        setDefaultDateTime(undefined);
    };

    const handleSaveSession = async (data: Omit<Session, 'id'> | Session) => {
        if (!currentUser) return;
        try {
            if ('id' in data) {
                const updated = await updateSession(data);
                dispatch({ type: 'UPDATE_SESSION', payload: { ...updated, startTime: new Date(updated.startTime), endTime: new Date(updated.endTime) } });
                toast('Sessão atualizada!', 'success');
            } else {
                const newSess = await addSession(data, currentUser);
                dispatch({ type: 'ADD_SESSION', payload: { ...newSess, startTime: new Date(newSess.startTime), endTime: new Date(newSess.endTime) } });
                dispatch({ type: 'ADD_NOTIFICATION', payload: { id: Date.now().toString(), userId: `user_${data.patientId}`, message: `${currentUser.name} agendou uma nova sessão para você.`, read: false, createdAt: new Date() } });
                toast('Sessão agendada!', 'success');
            }
            handleCloseForm();
        } catch (error) {
            toast('Falha ao salvar sessão.', 'error');
        }
    };
    
    const handleDeleteConfirm = async () => {
        if (!editingSession) return;
        try {
            await deleteSession(editingSession.id);
            dispatch({ type: 'DELETE_SESSION', payload: editingSession.id });
            toast('Sessão excluída!', 'success');
            setIsConfirmDeleteOpen(false);
            handleCloseForm();
        } catch (error) {
            toast('Falha ao excluir sessão.', 'error');
        }
    };

    const getSessionForSlot = (time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        return dailySessions.find(sess => {
            const sessTime = new Date(sess.startTime);
            return sessTime.getHours() === hour && sessTime.getMinutes() === minute;
        });
    };
    
    if (!currentUser) return null; // Should not happen if routed correctly

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Agenda</h1>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm border w-full sm:w-auto">
                        <button onClick={() => changeDate(-1)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600"><ChevronLeftIcon /></button>
                        <input type="date" value={selectedDate.toISOString().split('T')[0]} onChange={e => {
                            if (e.target.value) {
                                setSelectedDate(new Date(e.target.value + 'T00:00:00'));
                            }
                        }} className="flex-grow p-2 border-none rounded-md text-center font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500" />
                        <button onClick={() => changeDate(1)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600"><ChevronRightIcon /></button>
                    </div>
                     <Button onClick={() => handleOpenForm(null, new Date())} className="w-full sm:w-auto">
                        <PlusIcon /> Nova Sessão
                    </Button>
                </div>
            </div>
            
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
                {loading ? <CalendarSkeleton /> : (
                    <div className="grid grid-cols-1 divide-y divide-gray-200">
                        {timeSlots.map(time => {
                            const session = getSessionForSlot(time);
                            const style = session ? statusStyles[session.status] : null;
                            const [hour, minute] = time.split(':').map(Number);
                            const slotDateTime = new Date(selectedDate);
                            slotDateTime.setHours(hour, minute, 0, 0);

                            return (
                                <div key={time} className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] min-h-[80px] group" onClick={() => !session && handleOpenForm(null, slotDateTime)}>
                                    <div className="flex items-center justify-center border-r border-gray-200">
                                        <span className="text-gray-500 font-semibold">{time}</span>
                                    </div>
                                    <div className={`p-2 relative ${!session ? 'cursor-pointer hover:bg-indigo-50 transition-colors' : ''}`} onClick={(e) => { if(session) { e.stopPropagation(); handleOpenForm(session); }}}>
                                        {session && style && (
                                            <div className={`${style.bg} border-l-4 ${style.border} rounded-r-lg p-3 h-full flex flex-col justify-center cursor-pointer`}>
                                                <p className={`font-bold ${style.text}`}>{session.sessionType?.name}</p>
                                                <p className={`text-sm ${style.text.split(' ')[0]}`}>{session.patient?.name}</p>
                                            </div>
                                        )}
                                        {!session && <div className="absolute inset-y-0 left-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"><PlusIcon /></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {isFormModalOpen && (
                <Modal isOpen={isFormModalOpen} onClose={handleCloseForm} title={editingSession ? "Editar Sessão" : "Nova Sessão"}>
                    <SessionForm 
                        currentUser={currentUser}
                        session={editingSession}
                        patients={patients}
                        sessionTypes={sessionTypes}
                        onSave={handleSaveSession}
                        onClose={handleCloseForm}
                        onDelete={() => setIsConfirmDeleteOpen(true)}
                        defaultDateTime={defaultDateTime}
                    />
                </Modal>
            )}
            {isConfirmDeleteOpen && (
                <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Exclusão">
                    <p>Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>Excluir</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const CalendarSkeleton = () => (
    <div className="p-4 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-20 h-6 rounded" />
                <Skeleton className="flex-1 h-12 rounded-lg" />
            </div>
        ))}
    </div>
);

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

export default CalendarView;