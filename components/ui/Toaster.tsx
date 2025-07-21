
import React, { useState, useEffect, useCallback } from 'react';
import { Toast } from '../../types';

let toastId = 0;
const toasts: Toast[] = [];
let listeners: React.Dispatch<React.SetStateAction<Toast[]>>[] = [];

const toast = (message: string, type: Toast['type'] = 'info') => {
  toastId += 1;
  toasts.push({ id: toastId, message, type });
  listeners.forEach(listener => listener([...toasts]));
};

export const useToast = () => {
    return toast;
}

export const Toaster: React.FC = () => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  const removeToast = useCallback((id: number) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  }, []);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter(l => l !== setCurrentToasts);
    };
  }, []);

  useEffect(() => {
    if (currentToasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(currentToasts[0].id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentToasts, removeToast]);

  const toastBgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`relative flex items-center justify-between w-full max-w-sm p-4 mb-4 text-white ${toastBgColor[toast.type]} rounded-lg shadow-lg transition-all duration-300 ease-in-out transform animate-slide-in`}
        >
          <div className="flex items-center">
            <span>{toast.message}</span>
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-white hover:text-gray-200">&times;</button>
        </div>
      ))}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s forwards;
        }
      `}</style>
    </div>
  );
};
