
import React from 'react';
import { Notification } from '../../types';
import Modal from './Modal';

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return "agora mesmo";
    
    let interval = seconds / 31536000;
    if (interval > 1) {
        const value = Math.floor(interval);
        return `${value} ano${value > 1 ? 's' : ''} atrás`;
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
        const value = Math.floor(interval);
        return `${value} ${value > 1 ? 'meses' : 'mês'} atrás`;
    }
    
    interval = seconds / 86400;
    if (interval > 1) {
        const value = Math.floor(interval);
        return `${value} dia${value > 1 ? 's' : ''} atrás`;
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
        const value = Math.floor(interval);
        return `${value} hora${value > 1 ? 's' : ''} atrás`;
    }
    
    interval = seconds / 60;
    const value = Math.floor(interval);
    return `${value} minuto${value > 1 ? 's' : ''} atrás`;
}

const BellAlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2.25c-5.13 0-9.25 3.758-9.25 8.416v.207c-.504 3.337-2.316 4.89-2.583 5.122a.75.75 0 00.583 1.355h1.294a4.55 4.55 0 004.559 4.148h.186a4.55 4.55 0 004.559-4.148h1.294a.75.75 0 00.583-1.355c-.267-.232-2.079-1.785-2.583-5.122v-.207C21.25 6.008 17.13 2.25 12 2.25zM12.75 22.5a1.5 1.5 0 01-1.5 0h.001z" clipRule="evenodd" /></svg>;
const CalendarDaysIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.75 12.75a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V18a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25v-2.25z" /><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h15a3 3 0 013 3v15a3 3 0 01-3 3h-15a3 3 0 01-3-3v-15zM3 6a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 6v13.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5V6z" clipRule="evenodd" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-400"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>;


const NotificationItem: React.FC<{ notification: Notification; onMarkOneRead: (id: string) => void; onNavigate: (link?: string) => void; }> = ({ notification, onMarkOneRead, onNavigate }) => {
    const handleClick = () => {
        if (!notification.read) {
            onMarkOneRead(notification.id);
        }
        onNavigate(notification.link);
    };
    
    const lowerCaseMessage = notification.message.toLowerCase();
    let icon = <BellAlertIcon />;
    if (lowerCaseMessage.includes('sessão') || lowerCaseMessage.includes('lembrete')) {
        icon = <CalendarDaysIcon />;
    } else if (lowerCaseMessage.includes('paciente') || lowerCaseMessage.includes('adicionou') || lowerCaseMessage.includes('conta')) {
        icon = <UserCircleIcon />;
    }

    return (
        <li
            onClick={handleClick}
            className="group cursor-pointer"
        >
             <div className="flex items-start gap-4 p-4 transition-colors group-hover:bg-indigo-50">
                <div className={`mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notification.read ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                  {icon}
                </div>
                <div className="flex-grow">
                  <p className={`text-sm leading-snug ${notification.read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                )}
              </div>
        </li>
    );
};

interface NotificationPanelProps {
    isOpen: boolean;
    notifications: Notification[];
    onClose: () => void;
    onMarkOneRead: (id: string) => void;
    onMarkAllRead: () => void;
    onNavigate: (link?: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
    isOpen,
    notifications,
    onClose,
    onMarkOneRead,
    onMarkAllRead,
    onNavigate,
}) => {
    const hasUnread = notifications.some(n => !n.read);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notificações">
            <div className="flow-root">
                 <div className="flex justify-end items-center -mt-4 mb-2 pr-1">
                    {hasUnread && (
                        <button
                            onClick={onMarkAllRead}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
                        >
                            Marcar todas como lidas
                        </button>
                    )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto -mx-6">
                    {notifications.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {notifications.map(notif => (
                                <NotificationItem
                                    key={notif.id}
                                    notification={notif}
                                    onMarkOneRead={onMarkOneRead}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                            <div className="p-4 bg-slate-100 rounded-full">
                                <CheckCircleIcon />
                            </div>
                            <p className="mt-4 font-semibold">Tudo em dia!</p>
                            <p className="text-sm">Você não tem novas notificações.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default NotificationPanel;
