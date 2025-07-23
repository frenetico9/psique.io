// User & Auth
export interface User {
  id: string;
  name: string;
  email: string;
  password; // In a real app, this would be a hash
  role: 'professional' | 'patient';
  patientProfileId?: string; // Link to patient record if role is 'patient'
}

// AI Chat
export interface Message {
    sender: 'user' | 'ai';
    text: string;
}

// Core Clinical Models
export interface Patient {
  id: string;
  professionalId: string; // Link to the psychologist
  name: string;
  phone: string;
  email: string; // Email is now mandatory
  dateOfBirth: string; 
  lgpd_consent: boolean;
  createdAt: Date;
  status: 'active' | 'invited';
  aiConsultationCompleted?: boolean;
  aiConsultationHistory?: Message[];
}

export interface SessionType {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  color: string; // Hex color for calendar
}

export interface Session {
  id:string;
  patientId: string;
  professionalId: string;
  sessionTypeId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled_patient' | 'no_show';
  notes?: string; // Brief notes, full notes are in ClinicalNote
  satisfaction?: number; // 1 to 5
  paymentStatus: 'paid' | 'unpaid';
}

export interface ClinicalNote {
    id: string;
    patientId: string;
    sessionId?: string; // Optional: can be a general note
    content: string;
    createdAt: Date;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: Date;
    link?: string; // Optional link for navigation
}

// App Structure
export type View = 
  | { type: 'dashboard' | 'calendar' | 'pricing' | 'patients' | 'reports' }
  | { type: 'patient_detail', patientId: string };
  
export type PatientView = 'dashboard' | 'sessions' | 'profile' | 'schedule' | 'ai_consultation';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// State Management (Reducer)
export interface AppState {
    currentUser: User | null;
    patients: Patient[];
    sessions: Session[];
    sessionTypes: SessionType[];
    clinicalNotes: ClinicalNote[];
    notifications: Notification[];
    professionals: User[];
    loading: boolean;
    error: string | null;
    chatHistory: Message[];
}

export type Action =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { patients: Patient[]; sessions: Session[]; sessionTypes: SessionType[], clinicalNotes: ClinicalNote[], notifications: Notification[], professionals: User[] } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: Session }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'DELETE_PATIENT'; payload: string }
  | { type: 'ADD_SESSION_TYPE'; payload: SessionType }
  | { type: 'UPDATE_SESSION_TYPE'; payload: SessionType }
  | { type: 'DELETE_SESSION_TYPE'; payload: string }
  | { type: 'ADD_CLINICAL_NOTE'; payload: ClinicalNote }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATIONS_READ'; payload: string[] }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_CHAT_MESSAGE'; payload: Message }
  | { type: 'CLEAR_CHAT' };

// Form Data Types
export type SessionFormData = Omit<Session, 'id' | 'endTime' | 'paymentStatus'>;
export type PatientFormData = Omit<Patient, 'id' | 'createdAt' | 'professionalId' | 'status' | 'aiConsultationCompleted' | 'aiConsultationHistory'> & { inviteUser: boolean };
export type SessionTypeFormData = Omit<SessionType, 'id'>;
export type ClinicalNoteFormData = Omit<ClinicalNote, 'id' | 'createdAt'>;