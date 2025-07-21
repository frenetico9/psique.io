
import React, { createContext, useReducer, useContext, useEffect, ReactNode, useCallback } from 'react';
import { AppState, Action, User, Message, Chat } from '../types';
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
    chat: null,
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
             return { ...state, notifications: [action.payload, ...state.notifications] };

        // Chat
        case 'SET_CHAT_OBJECT':
            return { ...state, chat: action.payload };
        case 'ADD_CHAT_MESSAGE':
            return { ...state, chatHistory: [...state.chatHistory, action.payload] };
        case 'UPDATE_LAST_CHAT_MESSAGE': {
            const newHistory = [...state.chatHistory];
            if (newHistory.length > 0) {
                const lastMessage = { ...newHistory[newHistory.length - 1] };
                lastMessage.text = action.payload;
                newHistory[newHistory.length - 1] = lastMessage;
            }
            return { ...state, chatHistory: newHistory };
        }
        case 'CLEAR_CHAT':
            return { ...state, chat: null, chatHistory: [] };

        default:
            return state;
    }
};

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        const fetchUserData = async (user: User) => {
            dispatch({ type: 'FETCH_START' });
            try {
                const data = await getAllData(user);
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
                localStorage.setItem('psiqueUser', JSON.stringify(user));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
                dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
                console.error(error);
            }
        };

        if (state.currentUser && !state.sessions.length) { // Only fetch if data is not present
            fetchUserData(state.currentUser);
        } else if (!state.currentUser) {
            localStorage.removeItem('psiqueUser');
            // State is reset by the reducer on LOGOUT
        }
    }, [state.currentUser, state.sessions.length]);


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