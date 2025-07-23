
import { useState, useEffect } from 'react';

// BeforeInstallPromptEvent não é um tipo padrão do TS, então o definimos.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Verifica se o aplicativo já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
        setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Impede que a mini-infobar apareça no celular
      e.preventDefault();
      // Guarda o evento para que possa ser acionado mais tarde.
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
        // Oculta o prompt
        setInstallPrompt(null);
        setIsAppInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    // Mostra o prompt de instalação
    await installPrompt.prompt();
    // Espera o usuário responder ao prompt
    const { outcome } = await installPrompt.userChoice;
    // Já usamos o prompt e não podemos usá-lo novamente, então o limpamos.
    setInstallPrompt(null);
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
      console.log('User accepted the PWA installation');
    } else {
      console.log('User dismissed the PWA installation');
    }
  };

  const canInstall = !!installPrompt && !isAppInstalled;

  return { canInstall, handleInstallClick };
};
