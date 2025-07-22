

import React, { useState, useMemo } from 'react';
import { Session } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../ui/Toaster';
import { addSession, updateSession, deleteSession } from '../../services/mockApi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SessionForm from '../forms/SessionForm';
import Skeleton from '../ui/Skeleton';
import JitsiMeetModal from '../features/JitsiMeetModal';

const statusStyles: Record<Session['status'], { bg: string, border: string, text: string }> = {
    scheduled: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' },
    completed: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' },
    cancelled_patient: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800 line-through' },
    no_show: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800 line-through' },
};

const ROW_HEIGHT_PX = 28; // Height of a 10-minute slot in pixels

const CalendarView: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { state, dispatch } = useAppContext();
    const { sessions, patients, sessionTypes, currentUser, loading } = state;
    const toast = useToast();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [defaultDateTime, setDefaultDateTime] = useState<Date | undefined>();
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [meetingSession, setMeetingSession] = useState<Session | null>(null);
    
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

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let hour = 7; hour < 23; hour++) {
            for (let minute = 0; minute < 60; minute += 10) {
                slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
            }
        }
        return slots;
    }, []);

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
                toast('Sessão agendada!', 'success');
            }
            handleCloseForm();
        } catch (error) {
            toast('Falha ao salvar sessão.', 'error');
        }
    };
    
    const handleDeleteConfirm = async () => {
        if (!editingSession || !currentUser) return;
        try {
            await deleteSession(editingSession.id, currentUser);
            dispatch({ type: 'DELETE_SESSION', payload: editingSession.id });
            toast('Sessão excluída!', 'success');
            setIsConfirmDeleteOpen(false);
            handleCloseForm();
        } catch (error) {
            toast('Falha ao excluir sessão.', 'error');
        }
    };

    const handleJoinMeeting = (session: Session) => {
        setMeetingSession(session);
        handleCloseForm();
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
                    <div className="relative">
                        {/* Background Grid and Labels */}
                        {timeSlots.map(time => {
                            const [hour, minute] = time.split(':').map(Number);
                            const slotDateTime = new Date(selectedDate);
                            slotDateTime.setHours(hour, minute, 0, 0);

                            return (
                                <div 
                                    key={time} 
                                    className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] group border-t border-gray-200 first:border-t-0"
                                    style={{ height: `${ROW_HEIGHT_PX}px` }}
                                    onClick={() => handleOpenForm(null, slotDateTime)}
                                >
                                    <div className="flex items-start justify-center border-r border-gray-200 text-xs text-gray-400 font-semibold relative">
                                        {minute === 0 && (
                                            <span className="absolute -top-2 bg-white px-1 z-10">{time}</span>
                                        )}
                                    </div>
                                    <div className="relative cursor-pointer hover:bg-indigo-50 transition-colors"></div>
                                </div>
                            );
                        })}
                        
                        {/* Absolutely Positioned Sessions */}
                        {dailySessions.map(session => {
                            if (!session.sessionType) return null; // Guard against missing data

                            const style = statusStyles[session.status];
                            const startTime = new Date(session.startTime);
                            const endTime = new Date(session.endTime);
                            
                            // Don't render if outside of calendar view
                            if (startTime.getHours() < 7 || startTime.getHours() >= 23) {
                                return null;
                            }

                            // Calculate top position
                            const startOffsetMinutes = (startTime.getHours() - 7) * 60 + startTime.getMinutes();
                            const top = (startOffsetMinutes / 10) * ROW_HEIGHT_PX;

                            // Calculate height
                            const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
                            const height = (durationMinutes / 10) * ROW_HEIGHT_PX;

                            return (
                                <div 
                                    key={session.id}
                                    className="absolute left-[80px] md:left-[100px] right-0 pr-2 z-10"
                                    style={{ top: `${top}px`, height: `${height}px` }}
                                    onClick={(e) => { e.stopPropagation(); handleOpenForm(session); }}
                                >
                                    <div className={`h-full w-full ${style.bg} border-l-4 ${style.border} rounded-r-md p-2 flex flex-col justify-start cursor-pointer overflow-hidden`}>
                                        <p className={`font-bold ${style.text} text-xs truncate`}>{session.sessionType.name}</p>
                                        <p className={`text-xs ${style.text.split(' ')[0]} truncate`}>{session.patient?.name}</p>
                                        {durationMinutes >= 30 && ( // Only show icon if there's enough space
                                            <div className="flex items-center gap-1 mt-1">
                                                <VideoCameraIcon className={`w-3 h-3 ${style.text.split(' ')[0]}`} />
                                                <span className={`text-[10px] ${style.text.split(' ')[0]}`}>Online</span>
                                            </div>
                                        )}
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
                        onJoinMeeting={handleJoinMeeting}
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
            {meetingSession && (
                <JitsiMeetModal
                    session={meetingSession}
                    currentUser={currentUser}
                    onClose={() => setMeetingSession(null)}
                />
            )}
        </div>
    );
};

const CalendarSkeleton = () => (
    <div className="relative">
        {Array.from({ length: 16 }).map((_, i) => ( // Show 16 hourly slots skeleton
            <div key={i} className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr]" style={{height: `${ROW_HEIGHT_PX * 6}px`}}>
                <div className="border-r border-gray-200"></div>
                <div className="border-t border-gray-200"></div>
            </div>
        ))}
         {/* Skeleton for some events */}
        <div className="absolute left-[80px] md:left-[100px] right-0 pr-2 z-10" style={{top: `${ROW_HEIGHT_PX * 12}px`, height: `${ROW_HEIGHT_PX * 5}px`}}>
            <Skeleton className="w-full h-full rounded-lg" />
        </div>
         <div className="absolute left-[80px] md:left-[100px] right-0 pr-2 z-10" style={{top: `${ROW_HEIGHT_PX * 30}px`, height: `${ROW_HEIGHT_PX * 8}px`}}>
            <Skeleton className="w-full h-full rounded-lg" />
        </div>
    </div>
);


const VideoCameraIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-4 h-4"}><path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM15.5 5.75a.75.75 0 00-1.5 0v2.551l-1.42-1.066a.75.75 0 00-.962 1.28l1.75 1.313a.75.75 0 00.962 0l1.75-1.312a.75.75 0 00-.962-1.28L15.5 8.301V5.75z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

export default CalendarView;