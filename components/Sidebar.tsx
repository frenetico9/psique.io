
import React from 'react';
import { View } from '../types';
import { useAppContext } from '../context/AppContext';
import UserAvatar from './ui/UserAvatar';

interface SidebarProps {
  activeViewType: View['type'];
  onNavigate: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  unreadCount: number;
  onNotificationClick: () => void;
}

const NavIcon: React.FC<{ children: React.ReactNode; isActive: boolean }> = ({ children, isActive }) => (
    <span className={`transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'}`}>
      {children}
    </span>
);

const NavLabel: React.FC<{ label: string, isActive: boolean }> = ({ label, isActive }) => (
    <span className={`transition-colors duration-200 ml-3 ${isActive ? 'font-semibold text-indigo-700' : 'font-medium text-gray-700 group-hover:text-gray-900'}`}>
      {label}
    </span>
);

const Sidebar: React.FC<SidebarProps> = ({ 
    activeViewType, onNavigate, isOpen, setIsOpen, 
    unreadCount, onNotificationClick
}) => {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;

  const handleLogout = () => {
      dispatch({ type: 'LOGOUT' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { id: 'calendar', label: 'Agenda', icon: <CalendarIcon /> },
    { id: 'patients', label: 'Pacientes', icon: <UsersIcon /> },
    { id: 'pricing', label: 'Planos e Preços', icon: <TagIcon /> },
    { id: 'reports', label: 'Relatórios', icon: <ChartBarIcon /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
          className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col fixed md:static inset-y-0 left-0 z-40 transform md:transform-none transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 flex items-center justify-center border-b border-gray-200 px-4">
          <img src="https://iili.io/FOD9dQI.png" alt="Logo" className="h-[10rem] w-auto"/>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate({ type: item.id } as View)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group ${
                    activeViewType === item.id ? 'bg-indigo-50' : 'hover:bg-gray-100'
                  }`}
                >
                  <NavIcon isActive={activeViewType === item.id}>{item.icon}</NavIcon>
                  <NavLabel label={item.label} isActive={activeViewType === item.id} />
                </button>
              </li>
            ))}
             <li className="!mt-4 border-t border-gray-200 pt-2">
                 <div className="relative">
                    <button
                        onClick={onNotificationClick}
                        className="w-full flex items-center p-3 rounded-lg transition-all duration-200 group hover:bg-gray-100"
                    >
                        <NavIcon isActive={false}><BellIcon/></NavIcon>
                        <NavLabel label="Notificações" isActive={false} />
                        {unreadCount > 0 && (
                            <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10">
                 <UserAvatar name={currentUser?.name || ''} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              <LogOutIcon />
              Sair
            </button>
        </div>
      </aside>
    </>
  );
};

// SVG Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v18" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;


export default Sidebar;
