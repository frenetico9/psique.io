
import React, { useState, useMemo } from 'react';
import { PatientView } from '../../types';
import { useAppContext } from '../../context/AppContext';
import UserAvatar from '../ui/UserAvatar';
import PatientDashboardView from './PatientDashboardView';
import PatientSessionsView from './PatientSessionsView';
import PatientProfileView from './PatientProfileView';
import PatientScheduleView from './PatientScheduleView';
import AIConsultationView from './AIConsultationView';
import NotificationPanel from '../ui/NotificationPanel';

// --- Bottom Navigation Component for Mobile ---
const BottomNav: React.FC<{
  activeView: PatientView;
  onNavigate: (view: PatientView) => void;
}> = ({ activeView, onNavigate }) => {
  const navItems: { id: PatientView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Início', icon: <HomeIcon /> },
    { id: 'schedule', label: 'Agendar', icon: <CalendarPlusIcon /> },
    { id: 'sessions', label: 'Sessões', icon: <CalendarIcon /> },
    { id: 'ai_consultation', label: 'Análise Inicial', icon: <ChatBubbleLeftRightIcon /> },
    { id: 'profile', label: 'Perfil', icon: <UserCircleIcon /> },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-white/20 shadow-t-lg z-30">
        <div className="flex justify-around items-center h-16">
            {navItems.map(item => (
                 <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
                        activeView === item.id 
                        ? 'text-indigo-600' 
                        : 'text-gray-500 hover:text-indigo-600'
                    }`}
                >
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                </button>
            ))}
        </div>
    </nav>
  );
};


const PatientApp: React.FC = () => {
  const [activeView, setActiveView] = useState<PatientView>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { state, dispatch } = useAppContext();
  const { currentUser, notifications } = state;

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const handleLogout = () => {
      dispatch({ type: 'LOGOUT' });
  };
  
  const handleMarkOneRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ', payload: [id] });
  };

  const handleMarkAllRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };
  
  const handleNotificationNavigate = (link?: string) => {
      if (link) {
          setActiveView(link as PatientView);
      }
      setIsNotificationsOpen(false);
  }

  const navItems: { id: PatientView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Início', icon: <HomeIcon /> },
    { id: 'schedule', label: 'Agendar', icon: <CalendarPlusIcon /> },
    { id: 'sessions', label: 'Minhas Sessões', icon: <CalendarIcon /> },
    { id: 'ai_consultation', label: 'Análise Inicial', icon: <ChatBubbleLeftRightIcon /> },
    { id: 'profile', label: 'Meu Perfil', icon: <UserCircleIcon /> },
  ];

  const renderView = () => {
    switch(activeView) {
        case 'dashboard':
            return <PatientDashboardView setView={setActiveView} />;
        case 'schedule':
            return <PatientScheduleView setView={setActiveView} />;
        case 'sessions':
            return <PatientSessionsView />;
        case 'ai_consultation':
            return <AIConsultationView setView={setActiveView} />;
        case 'profile':
            return <PatientProfileView />;
        default:
            return <PatientDashboardView setView={setActiveView} />;
    }
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-transparent font-sans pb-16 md:pb-0">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.5C12 2.5 6.5 5.5 6.5 12C6.5 18.5 12 21.5 12 21.5C12 21.5 17.5 18.5 17.5 12C17.5 5.5 12 2.5 12 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h1 className="text-xl font-bold tracking-wider text-slate-800">Psique<span className="font-light">.IO</span></h1>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center justify-center">
                    <div className="flex items-baseline space-x-4">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                    activeView === item.id 
                                    ? 'bg-indigo-100 text-indigo-700' 
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* User Menu */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="relative">
                        <button onClick={() => setIsNotificationsOpen(o => !o)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative" title="Notificações">
                           <BellIcon />
                           {unreadCount > 0 && 
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                                    {unreadCount}
                                </span>
                            }
                        </button>
                    </div>
                    <div className="h-10 w-10">
                        <UserAvatar name={currentUser.name} />
                    </div>
                    <button onClick={handleLogout} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hidden sm:block" title="Sair">
                        <LogOutIcon />
                    </button>
                </div>
            </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
      
      <NotificationPanel 
          isOpen={isNotificationsOpen}
          notifications={notifications}
          onMarkOneRead={handleMarkOneRead}
          onMarkAllRead={handleMarkAllRead}
          onNavigate={handleNotificationNavigate}
          onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

// Icons
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const CalendarPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v4m-2-2h4" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const ChatBubbleLeftRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.347 17.653 8.5 16.689 8.5 15.553V11.267c0-.97.616-1.813 1.5-2.097m6.25 0a9.023 9.023 0 00-12.5 0M15.5 10.125c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125S16.625 11.754 16.625 11.25s-.504-1.125-1.125-1.125zM12 10.125c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125S13.125 11.754 13.125 11.25s-.504-1.125-1.125-1.125zM8.5 10.125c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125S9.625 11.754 9.625 11.25s-.504-1.125-1.125-1.125z" /></svg>;


export default PatientApp;
