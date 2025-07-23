

import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import DashboardView from './views/DashboardView';
import CalendarView from './views/CalendarView';
import ReportsView from './views/ReportsView';
import SessionTypesView from './views/SessionTypesView';
import PatientsView from './views/PatientsView';
import PatientDetailView from './views/PatientDetailView';
import { View } from '../types';
import { useAppContext } from '../context/AppContext';
import NotificationPanel from './ui/NotificationPanel';
import { usePWAInstall } from '../context/usePWAInstall';

const AppHeader: React.FC<{ 
    title: string; 
    onMenuClick: () => void; 
    unreadCount: number;
    onNotificationClick: () => void;
    canInstall: boolean;
    onInstallClick: () => void;
}> = ({ title, onMenuClick, unreadCount, onNotificationClick, canInstall, onInstallClick }) => (
    <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-30">
      <button onClick={onMenuClick} className="text-gray-600 p-2 -ml-2">
        <MenuIcon />
      </button>
      <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
       <div className="flex items-center space-x-2">
        {canInstall && (
            <button onClick={onInstallClick} className="p-2 rounded-full text-green-600 hover:bg-green-100" title="Instalar App">
                <DownloadIcon />
            </button>
        )}
        <div className="relative">
            <button onClick={onNotificationClick} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative" title="Notificações">
              <BellIcon />
              {unreadCount > 0 && 
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                      {unreadCount}
                  </span>
              }
            </button>
        </div>
      </div>
    </header>
);
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;


const ProfessionalApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>({ type: 'dashboard' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { state, dispatch } = useAppContext();
  const { notifications } = state;
  const { canInstall, handleInstallClick } = usePWAInstall();

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const handleNavigate = (view: View) => {
    setActiveView(view);
    setIsSidebarOpen(false); // Close sidebar on mobile navigation
  }

  const handleNotificationClick = () => {
    setIsNotificationsOpen(o => !o);
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleMarkOneRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ', payload: [id] });
  };

  const handleMarkAllRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };
  
  const handleNotificationNavigate = (link?: string) => {
      if (link) {
          const viewType = link as View['type'];
          // Ensure we don't navigate to a view that requires an ID from a simple link.
          if (viewType !== 'patient_detail') {
              handleNavigate({ type: viewType });
          }
      }
      setIsNotificationsOpen(false);
  }

  const renderView = () => {
    switch (activeView.type) {
      case 'dashboard':
        return <DashboardView />;
      case 'calendar':
        return <CalendarView />;
      case 'reports':
        return <ReportsView />;
      case 'pricing':
        return <SessionTypesView />;
      case 'patients':
        return <PatientsView onSelectPatient={(patientId) => setActiveView({ type: 'patient_detail', patientId })} />;
      case 'patient_detail':
        return <PatientDetailView patientId={activeView.patientId} onBack={() => setActiveView({ type: 'patients' })} />;
      default:
        return <DashboardView />;
    }
  };

  const getActiveViewTypeForSidebar = () => {
    if (activeView.type === 'patient_detail') {
      return 'patients';
    }
    return activeView.type;
  }
  
  const getTitle = () => {
    const viewTitles: Record<string, string> = {
        dashboard: 'Dashboard',
        calendar: 'Agenda',
        patients: 'Pacientes',
        patient_detail: 'Prontuário do Paciente',
        pricing: 'Planos e Preços',
        reports: 'Relatórios',
    };
    if (activeView.type === 'patient_detail') {
        const patient = state.patients.find(p => p.id === activeView.patientId);
        return patient ? `Prontuário de ${patient.name.split(' ')[0]}` : 'Prontuário'
    }
    return viewTitles[activeView.type] || 'Dashboard';
  }

  return (
    <div className="flex h-screen bg-transparent font-sans overflow-hidden">
      <Sidebar 
        activeViewType={getActiveViewTypeForSidebar()} 
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        unreadCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        canInstall={canInstall}
        onInstallClick={handleInstallClick}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
         <AppHeader 
            title={getTitle()} 
            onMenuClick={() => setIsSidebarOpen(true)}
            unreadCount={unreadCount}
            onNotificationClick={handleNotificationClick}
            canInstall={canInstall}
            onInstallClick={handleInstallClick}
          />
         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent">
            {renderView()}
         </main>
      </div>

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

export default ProfessionalApp;
