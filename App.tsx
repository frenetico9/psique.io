
import React, { useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { Toaster } from './components/ui/Toaster';
import AuthView from './components/views/AuthView';
import ProfessionalApp from './components/ProfessionalApp';
import PatientApp from './components/patient/PatientApp';
import Skeleton from './components/ui/Skeleton';
import InstallPWAButton from './components/ui/InstallPWAButton';

const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentUser, loading } = state;

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('psiqueUser');
      if (storedUser) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(storedUser) });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const renderApp = () => {
    if (loading && !currentUser) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-transparent">
           <div className="w-full max-w-md p-8 space-y-6">
             <div className="flex items-center justify-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-8 w-40 rounded-lg" />
             </div>
             <Skeleton className="h-10 w-full rounded-lg" />
             <Skeleton className="h-10 w-full rounded-lg" />
             <Skeleton className="h-10 w-full rounded-lg" />
           </div>
        </div>
      );
    }
    
    if (!currentUser) {
      return <AuthView />;
    }
    if (currentUser.role === 'professional') {
      return <ProfessionalApp />;
    }
    if (currentUser.role === 'patient') {
      return <PatientApp />;
    }

    return <AuthView />; // Fallback to login
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      {renderApp()}
      <Toaster />
      <InstallPWAButton />
    </div>
  );
};

export default App;
