

import { Patient, SessionType, Session, ClinicalNote, User, PatientFormData, Notification, Message, SessionTypeFormData, ClinicalNoteFormData } from '../types';

const generateId = (prefix: string) => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

// --- INITIAL MOCK DATA ---
const getInitialData = () => {
    const users: User[] = [
        { id: 'prof_1', name: 'Dra. Sofia Lima', email: 'sofia.lima@psique.io', password: 'password123', role: 'professional' },
        { id: 'prof_2', name: 'Dr. Carlos Andrade', email: 'carlos.andrade@psique.io', password: 'password123', role: 'professional' },
        { id: 'user_1', name: 'Juliana Costa', email: 'juliana.costa@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_1' },
        { id: 'user_2', name: 'Ricardo Almeida', email: 'ricardo.a@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_2' },
        { id: 'user_3', name: 'Fernanda Lima', email: 'fernanda.lima@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_3' },
        { id: 'user_4', name: 'Lucas Martins', email: 'lucas.m@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_4' },
        { id: 'user_5', name: 'Beatriz Martins', email: 'beatriz.m@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_5' },
        { id: 'user_6', name: 'Guilherme Souza', email: 'guilherme.s@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_6' },
        { id: 'user_7', name: 'Larissa Pereira', email: 'larissa.p@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_7' },
        { id: 'user_8', name: 'Matheus Oliveira', email: 'matheus.o@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_8' },
        { id: 'user_9', name: 'Camila Santos', email: 'camila.s@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_9' },
        { id: 'user_10', name: 'Vinicius Ferreira', email: 'vinicius.f@email.com', password: 'password123', role: 'patient', patientProfileId: 'pat_10' },
    ];

    const professionals = users.filter(u => u.role === 'professional');

    const patients: Patient[] = [
      { id: 'pat_1', professionalId: 'prof_1', name: 'Juliana Costa', phone: '(11)98765-4321', email: 'juliana.costa@email.com', lgpd_consent: true, dateOfBirth: '1990-05-15', createdAt: new Date(2023, 0, 10), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
      { id: 'pat_2', professionalId: 'prof_1', name: 'Ricardo Almeida', phone: '(21)99999-8888', email: 'ricardo.a@email.com', lgpd_consent: true, dateOfBirth: '1985-03-20', createdAt: new Date(2023, 1, 15), status: 'active', aiConsultationCompleted: true, aiConsultationHistory: [{ sender: 'ai', text: 'Bem-vindo!'}, { sender: 'user', text: 'Olá!'}] },
      { id: 'pat_3', professionalId: 'prof_1', name: 'Fernanda Lima', phone: '(31)98888-7777', email: 'fernanda.lima@email.com', lgpd_consent: true, dateOfBirth: '1992-11-30', createdAt: new Date(2023, 2, 20), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
      { id: 'pat_4', professionalId: 'prof_2', name: 'Lucas Martins', phone: '(41)97777-6666', email: 'lucas.m@email.com', lgpd_consent: true, dateOfBirth: '1995-07-12', createdAt: new Date(2023, 3, 25), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
      { id: 'pat_5', professionalId: 'prof_2', name: 'Beatriz Martins', phone: '(51)96666-5555', email: 'beatriz.m@email.com', lgpd_consent: true, dateOfBirth: '1998-01-01', createdAt: new Date(2023, 4, 30), status: 'invited', aiConsultationCompleted: false, aiConsultationHistory: [] },
      { id: 'pat_6', professionalId: 'prof_1', name: 'Guilherme Souza', phone: '(61)95555-4444', email: 'guilherme.s@email.com', lgpd_consent: true, dateOfBirth: '1988-09-05', createdAt: new Date(2023, 5, 5), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
      { id: 'pat_7', professionalId: 'prof_1', name: 'Larissa Pereira', phone: '(71)94444-3333', email: 'larissa.p@email.com', lgpd_consent: true, dateOfBirth: '1993-04-18', createdAt: new Date(2023, 6, 10), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
      { id: 'pat_8', professionalId: 'prof_2', name: 'Matheus Oliveira', phone: '(81)93333-2222', email: 'matheus.o@email.com', lgpd_consent: true, dateOfBirth: '1991-12-25', createdAt: new Date(2023, 7, 15), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
      { id: 'pat_9', professionalId: 'prof_1', name: 'Camila Santos', phone: '(91)92222-1111', email: 'camila.s@email.com', lgpd_consent: true, dateOfBirth: '1996-02-28', createdAt: new Date(2023, 8, 20), status: 'invited', aiConsultationCompleted: false, aiConsultationHistory: [] },
      { id: 'pat_10', professionalId: 'prof_2', name: 'Vinicius Ferreira', phone: '(11)91111-0000', email: 'vinicius.f@email.com', lgpd_consent: true, dateOfBirth: '1989-08-10', createdAt: new Date(2023, 9, 25), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
    ];

    const sessionTypes: SessionType[] = [
        { id: 'st_contact', name: 'Primeiro Contato', description: 'Uma sessão inicial mais curta para alinhamento e conhecimento mútuo.', duration: 30, price: 0, color: 'orange' },
        { id: 'st_therapy', name: 'Sessão de Terapia', description: 'Sessão padrão de acompanhamento psicoterapêutico.', duration: 50, price: 180, color: 'indigo' },
        { id: 'st_couple', name: 'Terapia de Casal', description: 'Sessão focada na dinâmica e comunicação do casal.', duration: 80, price: 250, color: 'pink' },
    ];
    
    const sessions: Session[] = [
      { id: 'sess_1', patientId: 'pat_1', professionalId: 'prof_1', sessionTypeId: 'st_therapy', startTime: new Date(new Date().setDate(new Date().getDate() - 7)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 7)).getTime() + 50 * 60000), status: 'completed', paymentStatus: 'paid', satisfaction: 5 },
      { id: 'sess_2', patientId: 'pat_2', professionalId: 'prof_1', sessionTypeId: 'st_therapy', startTime: new Date(new Date().setDate(new Date().getDate() - 5)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 50 * 60000), status: 'completed', paymentStatus: 'paid', satisfaction: 4 },
      { id: 'sess_3', patientId: 'pat_1', professionalId: 'prof_1', sessionTypeId: 'st_therapy', startTime: new Date(new Date().setDate(new Date().getDate() + 2)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).getTime() + 50 * 60000), status: 'scheduled', paymentStatus: 'unpaid' },
      { id: 'sess_4', patientId: 'pat_3', professionalId: 'prof_1', sessionTypeId: 'st_couple', startTime: new Date(new Date().setDate(new Date().getDate() - 10)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 10)).getTime() + 80 * 60000), status: 'no_show', paymentStatus: 'unpaid' },
      { id: 'sess_5', patientId: 'pat_4', professionalId: 'prof_2', sessionTypeId: 'st_therapy', startTime: new Date(new Date().setDate(new Date().getDate() - 2)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).getTime() + 50 * 60000), status: 'completed', paymentStatus: 'paid' },
      { id: 'sess_6', patientId: 'pat_1', professionalId: 'prof_1', sessionTypeId: 'st_therapy', startTime: new Date(new Date().setHours(new Date().getHours() + 1)), endTime: new Date(new Date().setHours(new Date().getHours() + 2)), status: 'scheduled', paymentStatus: 'unpaid' },
      { id: 'sess_7', patientId: 'pat_6', professionalId: 'prof_1', sessionTypeId: 'st_therapy', startTime: new Date(new Date().setDate(new Date().getDate() - 1)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() + 50 * 60000), status: 'completed', paymentStatus: 'unpaid' },
    ];

    const clinicalNotes: ClinicalNote[] = [
        { id: 'note_1', patientId: 'pat_1', sessionId: 'sess_1', content: 'Paciente relata melhora na ansiedade, mas ainda enfrenta dificuldades no ambiente de trabalho.', createdAt: new Date(new Date().setDate(new Date().getDate() - 7)) },
        { id: 'note_2', patientId: 'pat_2', sessionId: 'sess_2', content: 'Exploramos as origens da procrastinação do paciente, conectando com eventos da infância.', createdAt: new Date(new Date().setDate(new Date().getDate() - 5)) },
    ];
    
    const notifications: Notification[] = [];

    return { users, professionals, patients, sessionTypes, sessions, clinicalNotes, notifications };
};

// --- DATA PERSISTENCE ---
const MOCK_DATA_KEY = 'psiqueMockData';

let dataStore: ReturnType<typeof getInitialData>;

const saveDataToStorage = () => {
    localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(dataStore));
};

const loadDataFromStorage = () => {
    try {
        const storedData = localStorage.getItem(MOCK_DATA_KEY);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            // Re-hydrate Date objects from string representations
            dataStore = {
                ...parsed,
                patients: parsed.patients.map((p: Patient) => ({ ...p, createdAt: new Date(p.createdAt) })),
                sessions: parsed.sessions.map((s: Session) => ({ ...s, startTime: new Date(s.startTime), endTime: new Date(s.endTime) })),
                clinicalNotes: parsed.clinicalNotes.map((n: ClinicalNote) => ({ ...n, createdAt: new Date(n.createdAt) })),
                notifications: parsed.notifications.map((n: Notification) => ({ ...n, createdAt: new Date(n.createdAt) })),
            };
        } else {
            dataStore = getInitialData();
            saveDataToStorage();
        }
    } catch (error) {
        console.error("Failed to load or parse mock data, initializing with defaults.", error);
        dataStore = getInitialData();
        saveDataToStorage();
    }
};

loadDataFromStorage();


// --- API FUNCTIONS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth
export const login = async (email: string, password: string): Promise<User> => {
    await delay(500);
    const user = dataStore.users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Credenciais inválidas.');
    return JSON.parse(JSON.stringify(user));
};

export const register = async (data: Omit<User, 'id' | 'role' | 'patientProfileId'> & {phone: string, dateOfBirth: string}): Promise<User> => {
    await delay(500);
    if (dataStore.users.some(u => u.email === data.email)) {
        throw new Error('Este e-mail já está em uso.');
    }
    const newPatientId = generateId('pat');
    
    // Create patient record
    const newPatient: Patient = {
        id: newPatientId,
        professionalId: 'prof_1', // Assign to default professional for now
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        lgpd_consent: true,
        createdAt: new Date(),
        status: 'active',
        aiConsultationCompleted: false,
        aiConsultationHistory: []
    };
    dataStore.patients.push(newPatient);

    // Create user account
    const newUser: User = {
        id: generateId('user'),
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'patient',
        patientProfileId: newPatientId,
    };
    dataStore.users.push(newUser);
    saveDataToStorage();
    return JSON.parse(JSON.stringify(newUser));
}

export const resetPassword = async (data: { name: string, email: string, phone: string, dateOfBirth: string, newPassword: string}): Promise<void> => {
    await delay(500);
    const userIndex = dataStore.users.findIndex(u => u.email === data.email);
    if (userIndex === -1) throw new Error('Usuário não encontrado.');
    
    const patientProfile = dataStore.patients.find(p => p.id === dataStore.users[userIndex].patientProfileId);
    if (!patientProfile || patientProfile.name !== data.name || patientProfile.phone !== data.phone || patientProfile.dateOfBirth !== data.dateOfBirth) {
        throw new Error('Os dados de verificação não correspondem. Tente novamente.');
    }
    
    dataStore.users[userIndex].password = data.newPassword;
    saveDataToStorage();
    return;
}


// Data Fetching
export const getAllData = async (user: User) => {
    await delay(800);
    let data;
    if (user.role === 'professional') {
        const professionalPatients = dataStore.patients.filter(p => p.professionalId === user.id);
        const professionalPatientIds = professionalPatients.map(p => p.id);
        data = {
            patients: professionalPatients,
            sessions: dataStore.sessions.filter(s => professionalPatientIds.includes(s.patientId)),
            sessionTypes: [...dataStore.sessionTypes],
            clinicalNotes: dataStore.clinicalNotes.filter(n => professionalPatientIds.includes(n.patientId)),
            notifications: dataStore.notifications.filter(n => n.userId === user.id),
            professionals: [...dataStore.professionals],
        };
    } else { // Patient data
        const patientProfile = dataStore.patients.find(p => p.id === user.patientProfileId);
        if (!patientProfile) throw new Error('Perfil de paciente não encontrado.');
        data = {
            patients: [patientProfile],
            sessions: dataStore.sessions.filter(s => s.patientId === patientProfile.id),
            sessionTypes: [...dataStore.sessionTypes],
            clinicalNotes: [], // Patients don't see clinical notes
            notifications: dataStore.notifications.filter(n => n.userId === user.id),
            professionals: [...dataStore.professionals],
        };
    }
    // Deep copy to prevent direct mutation of the "database"
    return JSON.parse(JSON.stringify(data));
};

export const getPatientById = (patientId: string): Promise<Patient> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const patient = dataStore.patients.find(p => p.id === patientId);
            if (patient) {
                // Deep copy to simulate fresh API call
                resolve(JSON.parse(JSON.stringify(patient))); 
            } else {
                reject(new Error('Paciente não encontrado.'));
            }
        }, 300); 
    });
};

// Sessions
export const addSession = async (data: Omit<Session, 'id'>, user: User): Promise<Session> => {
    await delay(300);
    const newSession: Session = { ...data, id: generateId('sess') };
    dataStore.sessions.push(newSession);
    saveDataToStorage();
    return JSON.parse(JSON.stringify(newSession));
};

export const updateSession = async (data: Session): Promise<Session> => {
    await delay(300);
    const index = dataStore.sessions.findIndex(s => s.id === data.id);
    if (index > -1) {
        dataStore.sessions[index] = JSON.parse(JSON.stringify(data));
        saveDataToStorage();
        return { ...dataStore.sessions[index] };
    }
    throw new Error('Sessão não encontrada.');
};

export const deleteSession = async (id: string): Promise<void> => {
    await delay(300);
    dataStore.sessions = dataStore.sessions.filter(s => s.id !== id);
    saveDataToStorage();
};

// Patients
export const addPatient = async (data: Omit<Patient, 'id' | 'createdAt' | 'professionalId' | 'status' | 'aiConsultationCompleted' | 'aiConsultationHistory'>, professionalId: string, professionalName: string): Promise<Patient> => {
    await delay(300);
    const patientId = generateId('pat');
    const newPatient: Patient = { 
        ...data, 
        id: patientId, 
        professionalId,
        createdAt: new Date(), 
        status: 'invited',
        aiConsultationCompleted: false,
        aiConsultationHistory: []
    };
    dataStore.patients.push(newPatient);

    const newUser: User = {
        id: generateId('user'),
        name: data.name,
        email: data.email,
        password: 'password123',
        role: 'patient',
        patientProfileId: patientId,
    };
    dataStore.users.push(newUser);
    
    dataStore.notifications.unshift({ id: generateId('notif'), userId: professionalId, message: `Você adicionou um novo paciente: ${data.name}`, read: false, createdAt: new Date() });
    
    saveDataToStorage();
    return JSON.parse(JSON.stringify(newPatient));
};

export const updatePatient = async (data: Patient): Promise<Patient> => {
    await delay(300);
    const index = dataStore.patients.findIndex(p => p.id === data.id);
    if (index > -1) {
        dataStore.patients[index] = JSON.parse(JSON.stringify(data));
        saveDataToStorage();
        return { ...dataStore.patients[index] };
    }
    throw new Error('Paciente não encontrado.');
};

export const deletePatient = async (id: string): Promise<void> => {
    await delay(300);
    dataStore.patients = dataStore.patients.filter(p => p.id !== id);
    dataStore.sessions = dataStore.sessions.filter(s => s.patientId !== id);
    dataStore.clinicalNotes = dataStore.clinicalNotes.filter(n => n.patientId !== id);
    saveDataToStorage();
};


// Session Types
export const addSessionType = async (data: SessionTypeFormData): Promise<SessionType> => {
    await delay(300);
    const newType: SessionType = { ...data, id: generateId('st') };
    dataStore.sessionTypes.push(newType);
    saveDataToStorage();
    return JSON.parse(JSON.stringify(newType));
};

export const updateSessionType = async (data: SessionType): Promise<SessionType> => {
    await delay(300);
    const index = dataStore.sessionTypes.findIndex(st => st.id === data.id);
    if (index > -1) {
        dataStore.sessionTypes[index] = JSON.parse(JSON.stringify(data));
        saveDataToStorage();
        return { ...dataStore.sessionTypes[index] };
    }
    throw new Error('Tipo de sessão não encontrado.');
};

export const deleteSessionType = async (id: string): Promise<void> => {
    await delay(300);
    dataStore.sessionTypes = dataStore.sessionTypes.filter(st => st.id !== id);
    saveDataToStorage();
};

// Clinical Notes
export const addClinicalNote = async (data: ClinicalNoteFormData): Promise<ClinicalNote> => {
    await delay(300);
    const newNote: ClinicalNote = { ...data, id: generateId('note'), createdAt: new Date() };
    dataStore.clinicalNotes.push(newNote);
    saveDataToStorage();
    return JSON.parse(JSON.stringify(newNote));
};

// AI Consultation
export const saveAiConsultationResult = async (patientId: string, history: Message[]): Promise<Patient> => {
    await delay(400);
    const patientIndex = dataStore.patients.findIndex(p => p.id === patientId);
    if(patientIndex > -1) {
        dataStore.patients[patientIndex].aiConsultationCompleted = true;
        dataStore.patients[patientIndex].aiConsultationHistory = history;
        saveDataToStorage();
        return JSON.parse(JSON.stringify(dataStore.patients[patientIndex]));
    }
    throw new Error("Patient not found to save AI consultation");
};
