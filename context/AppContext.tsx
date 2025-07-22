

import React, { createContext, useReducer, useContext, useEffect, ReactNode, useCallback } from 'react';
import { AppState, Action, User, Message, Notification, Patient } from '../types';
import { getAllData } from '../services/mockApi';

const initialState: AppState = {
    currentUser: null,
    patients: [],
    sessions: [],
    sessionTypes: [],
    clinicalNotes: [],
    notifications: [],
    professionals: [],
    loading: true,
    error: null,
    chatHistory: [],
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({
    state: initialState,
    dispatch: () => null,
});

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, currentUser: action.payload, loading: true };
        case 'LOGOUT':
            // Reset to a clean slate, but keep loading false
            return { 
                ...initialState,
                currentUser: null, 
                loading: false 
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, ...action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        
        // Sessions
        case 'ADD_SESSION':
            return { ...state, sessions: [...state.sessions, action.payload] };
        case 'UPDATE_SESSION':
            return { ...state, sessions: state.sessions.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'DELETE_SESSION':
            return { ...state, sessions: state.sessions.filter(s => s.id !== action.payload) };

        // Patients
        case 'ADD_PATIENT':
            return { ...state, patients: [...state.patients, action.payload] };
        case 'UPDATE_PATIENT':
            return { ...state, patients: state.patients.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_PATIENT':
            return { 
                ...state, 
                patients: state.patients.filter(p => p.id !== action.payload),
                sessions: state.sessions.filter(s => s.patientId !== action.payload),
                clinicalNotes: state.clinicalNotes.filter(n => n.patientId !== action.payload)
            };

        // Session Types
        case 'ADD_SESSION_TYPE':
            return { ...state, sessionTypes: [...state.sessionTypes, action.payload] };
        case 'UPDATE_SESSION_TYPE':
            return { ...state, sessionTypes: state.sessionTypes.map(st => st.id === action.payload.id ? action.payload : st) };
        case 'DELETE_SESSION_TYPE':
            return { ...state, sessionTypes: state.sessionTypes.filter(st => st.id !== action.payload) };

        // Clinical Notes
        case 'ADD_CLINICAL_NOTE':
            return { ...state, clinicalNotes: [...state.clinicalNotes, action.payload] };
            
        // Notifications
        case 'ADD_NOTIFICATION':
             // Prevent duplicate reminder notifications
            if (state.notifications.some(n => n.id === action.payload.id)) {
                return state;
            }
             return { ...state, notifications: [action.payload, ...state.notifications] };
        case 'MARK_NOTIFICATIONS_READ':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    action.payload.includes(n.id) ? { ...n, read: true } : n
                ),
            };
        case 'MARK_ALL_NOTIFICATIONS_READ':
            return {
                ...state,
                notifications: state.notifications.map(n => 
                    n.userId === state.currentUser?.id ? { ...n, read: true } : n
                ),
            };

        // Chat
        case 'ADD_CHAT_MESSAGE':
            return { ...state, chatHistory: [...state.chatHistory, action.payload] };
        case 'CLEAR_CHAT':
            return { ...state, chatHistory: [] };

        default:
            return state;
    }
};

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const checkAndCreateReminders = useCallback((user: User, data: { sessions: AppState['sessions'], notifications: AppState['notifications'], patients: Patient[], professionals: User[] }) => {
        const { sessions, notifications: currentNotifications, patients, professionals } = data;
        const now = new Date().getTime();
        const oneHour = 60 * 60 * 1000;
        const twentyFourHours = 24 * oneHour;

        const remindersToAdd: Notification[] = [];

        sessions.forEach(session => {
            if (session.status === 'scheduled') {
                const startTime = new Date(session.startTime).getTime();
                const timeDiff = startTime - now;
                const sessionTime = new Date(session.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});

                let message24h = '';
                let message1h = '';

                if (user.role === 'professional') {
                    const patient = patients.find(p => p.id === session.patientId);
                    const patientName = patient ? patient.name.split(' ')[0] : 'seu paciente';
                    message24h = `Lembrete: Sua sessão com ${patientName} é amanhã às ${sessionTime}.`;
                    message1h = `Sua sessão com ${patientName} começa em menos de uma hora, às ${sessionTime}.`;
                } else { // patient
                    const professional = professionals.find(p => p.id === session.professionalId);
                    const professionalName = professional ? professional.name : 'seu/sua profissional';
                    message24h = `Lembrete: Sua sessão com ${professionalName} é amanhã às ${sessionTime}.`;
                    message1h = `Sua sessão com ${professionalName} começa em menos de uma hora, às ${sessionTime}.`;
                }

                // 24-hour reminder
                const reminder24hId = `reminder_24h_${session.id}`;
                if (timeDiff > 0 && timeDiff < twentyFourHours && !currentNotifications.some(n => n.id === reminder24hId)) {
                    remindersToAdd.push({
                        id: reminder24hId,
                        userId: user.id,
                        message: message24h,
                        read: false,
                        createdAt: new Date(),
                        link: user.role === 'professional' ? 'calendar' : 'sessions'
                    });
                }

                // 1-hour reminder
                const reminder1hId = `reminder_1h_${session.id}`;
                if (timeDiff > 0 && timeDiff < oneHour && !currentNotifications.some(n => n.id === reminder1hId)) {
                     remindersToAdd.push({
                        id: reminder1hId,
                        userId: user.id,
                        message: message1h,
                        read: false,
                        createdAt: new Date(),
                        link: user.role === 'professional' ? 'calendar' : 'sessions'
                    });
                }
            }
        });
        
        remindersToAdd.forEach(reminder => {
            dispatch({ type: 'ADD_NOTIFICATION', payload: reminder });
        });

    }, [dispatch]);

    useEffect(() => {
        const fetchUserData = async (user: User) => {
            dispatch({ type: 'FETCH_START' });
            try {
                const data = await getAllData(user);
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
                localStorage.setItem('psiqueUser', JSON.stringify(user));
                // After data is fetched, check for reminders
                checkAndCreateReminders(user, data);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
                dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
                console.error(error);
            }
        };

        if (state.currentUser && state.loading) { // Only fetch if data is not present or loading is true
            fetchUserData(state.currentUser);
        } else if (!state.currentUser) {
            localStorage.removeItem('psiqueUser');
            // State is reset by the reducer on LOGOUT
        }
    }, [state.currentUser, state.loading, checkAndCreateReminders]);


    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};