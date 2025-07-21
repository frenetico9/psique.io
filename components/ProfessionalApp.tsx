
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardView from './views/DashboardView';
import CalendarView from './views/CalendarView';
import ReportsView from './views/ReportsView';
import SessionTypesView from './views/SessionTypesView';
import PatientsView from './views/PatientsView';
import PatientDetailView from './views/PatientDetailView';
import { View } from '../types';
import { useAppContext } from '../context/AppContext';

const AppHeader: React.FC<{ title: string; onMenuClick: () => void; }> = ({ title, onMenuClick }) => (
    <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-30">
      <button onClick={onMenuClick} className="text-gray-600 p-2 -ml-2">
        <MenuIcon />
      </button>
      <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
      <div className="w-6"></div> {/* Spacer */}
    </header>
);
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;


const ProfessionalApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>({ type: 'dashboard' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { state } = useAppContext();

  const handleNavigate = (view: View) => {
    setActiveView(view);
    setIsSidebarOpen(false); // Close sidebar on mobile navigation
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
      />
      <div className="flex-1 flex flex-col overflow-hidden">
         <AppHeader title={getTitle()} onMenuClick={() => setIsSidebarOpen(true)} />
         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent">
            {renderView()}
         </main>
      </div>
    </div>
  );
};

export default ProfessionalApp;