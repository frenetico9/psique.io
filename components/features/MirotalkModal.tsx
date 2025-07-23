import React from 'react';
import ReactDOM from 'react-dom';
import { Session, User } from '../../types';

interface MirotalkModalProps {
  session: Session;
  currentUser: User;
  onClose: () => void;
}

const MirotalkModal: React.FC<MirotalkModalProps> = ({ session, currentUser, onClose }) => {
  // Cria um nome de sala único e seguro a partir do ID da sessão.
  const roomName = `psiqueio-${session.id.replace(/[^a-zA-Z0-9-_]/g, '')}`;
  
  // Constrói a URL do Mirotalk com parâmetros para melhorar a experiência do usuário.
  const mirotalkUrl = `https://p2p.mirotalk.com/join?room=${roomName}&name=${encodeURIComponent(currentUser.name)}&video=true&audio=true&screenSharing=true&chat=true&autoJoin=true`;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-fade-in">
        <header className="flex-shrink-0 bg-gray-800 p-3 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold">Sessão de Videoconferência</h2>
            <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Encerrar e Fechar
            </button>
        </header>
        <main className="flex-1 w-full h-full bg-black">
           <iframe
              title="Sessão de Videoconferência (Mirotalk)"
              src={mirotalkUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
        </main>
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

export default MirotalkModal;
