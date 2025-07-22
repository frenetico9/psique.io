import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Session, User } from '../../types';

interface JitsiMeetModalProps {
  session: Session;
  currentUser: User;
  onClose: () => void;
}

const JitsiMeetModal: React.FC<JitsiMeetModalProps> = ({ session, currentUser, onClose }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    if (!jitsiContainerRef.current || !session) return;

    const domain = "meet.jit.si";
    const options = {
      roomName: session.id,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'hangup', 'profile', 'chat', 'settings', 'tileview'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
      userInfo: {
        displayName: currentUser.name,
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    jitsiApiRef.current = api;

    api.addEventListener('videoConferenceLeft', () => {
        onClose();
    });

    return () => {
      jitsiApiRef.current?.dispose();
    };
  }, [session, currentUser.name, onClose]);
  
  const handleLeave = () => {
      if (jitsiApiRef.current) {
          jitsiApiRef.current.executeCommand('hangup');
      } else {
          onClose();
      }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-fade-in">
        <header className="flex-shrink-0 bg-gray-800 p-3 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold">Sessão de Videoconferência</h2>
            <button onClick={handleLeave} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Sair da Chamada
            </button>
        </header>
        <main ref={jitsiContainerRef} className="flex-1 w-full h-full"></main>
         <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        `}</style>
    </div>,
    document.body
  );
};

export default JitsiMeetModal;