import React from 'react';
import ReactDOM from 'react-dom';
import { Session, User } from '../../types';

interface VideoCallModalProps {
  session: Session;
  currentUser: User;
  onClose: () => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ session, currentUser, onClose }) => {
  // Construct the Mirotalk URL dynamically
  // Room name based on session ID for uniqueness
  const roomName = session.id.replace(/[^a-zA-Z0-9-_]/g, ''); // Sanitize room name
  // URL-encode the user's name to handle spaces and special characters
  const userName = encodeURIComponent(currentUser.name);
  const miroTalkUrl = `https://sfu.mirotalk.com/${roomName}?username=${userName}&audio=1&video=1`;

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
              src={miroTalkUrl}
              allow="camera; microphone; fullscreen; display-capture"
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

export default VideoCallModal;
