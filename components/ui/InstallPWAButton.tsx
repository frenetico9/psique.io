import React, { useState, useEffect } from 'react';
import Button from './Button';

const InstallPWAButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the browser's default mini-infobar from appearing
            e.preventDefault();
            
            // The 'beforeinstallprompt' event is only fired by the browser when the app is installable and not yet installed.
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            // The app has been installed, so we should hide the button.
            setDeferredPrompt(null);
        };
        
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }
        // Show the browser's installation prompt.
        deferredPrompt.prompt();
        
        // We can optionally wait for the user's choice.
        const { outcome } = await deferredPrompt.userChoice;
        
        // The 'appinstalled' event will handle hiding the button,
        // but we can clear it here as a fallback.
        if (outcome === 'accepted') {
            console.log('User accepted the PWA installation');
        } else {
            console.log('User dismissed the PWA installation');
        }
        setDeferredPrompt(null);
    };

    if (!deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
            <Button onClick={handleInstallClick} variant="primary" className="shadow-lg hover:shadow-xl">
                <DownloadIcon />
                <span className="ml-2 hidden sm:inline">Instalar App</span>
            </Button>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export default InstallPWAButton;
