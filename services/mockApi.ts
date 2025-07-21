


import { Patient, SessionType, Session, ClinicalNote, User, PatientFormData, Notification, Message } from '../types';

// --- MOCK DATA STORE ---
const generateId = (prefix: string) => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

let users: User[] = [
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

let patients: Patient[] = [
  { id: 'pat_1', professionalId: 'prof_1', name: 'Juliana Costa', phone: '(11)98765-4321', email: 'juliana.costa@email.com', lgpd_consent: true, dateOfBirth: '1990-05-15', createdAt: new Date(2023, 0, 10), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_2', professionalId: 'prof_1', name: 'Ricardo Almeida', phone: '(21)91234-5678', email: 'ricardo.a@email.com', lgpd_consent: true, dateOfBirth: '1985-11-22', createdAt: new Date(2023, 2, 20), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_3', professionalId: 'prof_1', name: 'Fernanda Lima', phone: '(31)99999-8888', email: 'fernanda.lima@email.com', lgpd_consent: true, dateOfBirth: '2001-02-10', createdAt: new Date(2023, 7, 1), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_5', professionalId: 'prof_1', name: 'Beatriz Martins', phone: '(11)98877-6655', email: 'beatriz.m@email.com', lgpd_consent: true, dateOfBirth: '1998-03-25', createdAt: new Date(2023, 4, 12), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_6', professionalId: 'prof_1', name: 'Guilherme Souza', phone: '(11)97766-5544', email: 'guilherme.s@email.com', lgpd_consent: true, dateOfBirth: '1992-08-19', createdAt: new Date(2023, 5, 2), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_7', professionalId: 'prof_1', name: 'Larissa Pereira', phone: '(21)96655-4433', email: 'larissa.p@email.com', lgpd_consent: false, dateOfBirth: '2000-01-05', createdAt: new Date(2023, 8, 30), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_8', professionalId: 'prof_1', name: 'Matheus Oliveira', phone: '(31)95544-3322', email: 'matheus.o@email.com', lgpd_consent: true, dateOfBirth: '1989-12-11', createdAt: new Date(2023, 9, 21), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_9', professionalId: 'prof_1', name: 'Camila Santos', phone: '(11)94433-2211', email: 'camila.s@email.com', lgpd_consent: true, dateOfBirth: '1995-07-07', createdAt: new Date(2024, 0, 5), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_10', professionalId: 'prof_1', name: 'Vinicius Ferreira', phone: '(21)93322-1100', email: 'vinicius.f@email.com', lgpd_consent: true, dateOfBirth: '1980-10-15', createdAt: new Date(2024, 1, 18), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_11', professionalId: 'prof_1', name: 'Eduarda Gomes', phone: '(11)92211-0099', email: 'eduarda.g@email.com', lgpd_consent: true, dateOfBirth: '2002-06-20', createdAt: new Date(2024, 2, 25), status: 'invited', aiConsultationCompleted: false, aiConsultationHistory: [] },
  { id: 'pat_4', professionalId: 'prof_2', name: 'Lucas Martins', phone: '(41)98888-7777', email: 'lucas.m@email.com', lgpd_consent: false, dateOfBirth: '1995-09-30', createdAt: new Date(2024, 0, 15), status: 'active', aiConsultationCompleted: false, aiConsultationHistory: [] },
];

let sessionTypes: SessionType[] = [
  { id: 'st_contact', name: 'Primeiro Contato', description: 'Sessão inicial gratuita de 30 min para alinhar expectativas.', duration: 30, price: 0, color: 'cyan' },
  { id: 'st_1', name: 'Terapia Individual', description: 'Sessão individual de 50 minutos.', duration: 50, price: 250.00, color: 'indigo' },
  { id: 'st_2', name: 'Terapia de Casal', description: 'Sessão para casais de 80 minutos.', duration: 80, price: 350.00, color: 'purple' },
  { id: 'st_3', name: 'Avaliação Psicológica', description: 'Processo de avaliação e diagnóstico.', duration: 60, price: 400.00, color: 'teal' },
  { id: 'st_4', name: 'Orientação Vocacional', description: 'Auxílio na escolha profissional.', duration: 50, price: 220.00, color: 'amber' },
];

let clinicalNotes: ClinicalNote[] = [
    { id: 'note_1', patientId: 'pat_1', sessionId: 'sess_1_past', content: 'Paciente relata melhora na ansiedade, mas ainda enfrenta desafios no ambiente de trabalho. Discutimos técnicas de mindfulness.', createdAt: new Date(new Date().setDate(new Date().getDate() - 7)) },
    { id: 'note_2', patientId: 'pat_2', sessionId: 'sess_2_past', content: 'Exploramos a dinâmica de comunicação do casal. Há progressos, mas a escuta ativa ainda precisa ser trabalhada. Tarefa de casa: praticar o "diário de apreciação".', createdAt: new Date(new Date().setDate(new Date().getDate() - 14)) },
    { id: 'note_3', patientId: 'pat_1', content: 'Juliana apresentou boa evolução na última semana, aplicando as técnicas de respiração discutidas. Demonstrou maior clareza ao falar sobre os gatilhos de estresse.', createdAt: new Date(new Date().setDate(new Date().getDate() - 21)) },
    { id: 'note_4', patientId: 'pat_2', content: 'Ricardo trouxe exemplos concretos onde conseguiu aplicar a comunicação não-violenta. Ainda há resistência em momentos de maior frustração, mas a conscientização aumentou.', createdAt: new Date(new Date().setDate(new Date().getDate() - 28)) },
    { id: 'note_5', patientId: 'pat_3', content: 'Fernanda falou sobre a dificuldade em estabelecer limites com a família. Exploramos os sentimentos de culpa associados. Paciente parece mais receptiva a novas perspectivas.', createdAt: new Date(new Date().setDate(new Date().getDate() - 10)) },
    { id: 'note_6', patientId: 'pat_5', content: 'Sessão focada em autoestima e autoimagem. Beatriz relata forte autocrítica, especialmente no contexto profissional. Iniciamos o trabalho com reestruturação cognitiva.', createdAt: new Date(new Date().setDate(new Date().getDate() - 5)) },
    { id: 'note_7', patientId: 'pat_6', content: 'Guilherme expressou sentimentos de estagnação na carreira. Discutimos valores pessoais e como eles se alinham (ou não) com sua situação atual. Tarefa: listar atividades que trazem satisfação.', createdAt: new Date(new Date().setDate(new Date().getDate() - 12)) },
];

let notifications: Notification[] = [];

const generateSessions = (): Session[] => {
    const today = new Date();
    const sessions: Session[] = [];
    let sessionId = 1;
    
    const prof1Patients = patients.filter(p => p.professionalId === 'prof_1' && p.status === 'active');
    const prof2Patients = patients.filter(p => p.professionalId === 'prof_2' && p.status === 'active');

    // --- Generate a busy schedule for today for prof_1---
    const todaySlots = [9, 10, 11, 13, 14, 15, 16, 17]; 
    todaySlots.forEach(hour => {
        if (Math.random() > 0.25) { 
            const patient = prof1Patients[Math.floor(Math.random() * prof1Patients.length)];
            const sessionType = sessionTypes[Math.floor(Math.random() * (sessionTypes.length - 1)) + 1]; 
            const startTime = new Date();
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(startTime.getTime() + sessionType.duration * 60000);

            sessions.push({
                id: `sess_${sessionId++}_today_p1`,
                patientId: patient.id,
                professionalId: 'prof_1',
                sessionTypeId: sessionType.id,
                startTime: startTime,
                endTime: endTime,
                status: 'scheduled',
                paymentStatus: 'unpaid',
            });
        }
    });

     // --- Generate a busy schedule for today for prof_2---
    const todaySlots2 = [9, 11, 14, 16]; 
    todaySlots2.forEach(hour => {
        if (Math.random() > 0.2) { 
            const patient = prof2Patients[Math.floor(Math.random() * prof2Patients.length)];
            if (!patient) return;
            const sessionType = sessionTypes[Math.floor(Math.random() * (sessionTypes.length - 1)) + 1]; 
            const startTime = new Date();
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(startTime.getTime() + sessionType.duration * 60000);

            sessions.push({
                id: `sess_${sessionId++}_today_p2`,
                patientId: patient.id,
                professionalId: 'prof_2',
                sessionTypeId: sessionType.id,
                startTime: startTime,
                endTime: endTime,
                status: 'scheduled',
                paymentStatus: 'unpaid',
            });
        }
    });


    // --- Generate a rich history and future appointments for all active patients---
    patients.filter(p => p.status === 'active').forEach(patient => {
        for (let i = -90; i < 30; i++) {
            if (i === 0) continue; 

            if (Math.random() < 0.25) { 
                const date = new Date();
                date.setDate(today.getDate() + i);
                
                const hour = 9 + Math.floor(Math.random() * 9); 
                const sessionType = sessionTypes[Math.floor(Math.random() * (sessionTypes.length - 1)) + 1];
                
                const startTime = new Date(date);
                startTime.setHours(hour, 0, 0, 0);

                const endTime = new Date(startTime.getTime() + sessionType.duration * 60000);
                
                const isPast = i < 0;
                let status: Session['status'] = 'scheduled';
                if (isPast) {
                    const rand = Math.random();
                    if (rand < 0.85) status = 'completed';      
                    else if (rand < 0.95) status = 'no_show'; 
                    else status = 'cancelled_patient';   
                }

                sessions.push({
                    id: `sess_${sessionId++}` + (isPast ? '_past' : '_future'),
                    patientId: patient.id,
                    professionalId: patient.professionalId,
                    sessionTypeId: sessionType.id,
                    startTime: startTime,
                    endTime: endTime,
                    status: status,
                    paymentStatus: status === 'completed' && Math.random() > 0.2 ? 'paid' : 'unpaid', 
                    satisfaction: status === 'completed' && Math.random() > 0.3 ? (Math.floor(Math.random() * 3) + 3) : undefined 
                });
            }
        }
    });
    
    return sessions;
}


let sessions: Session[] = generateSessions();


// --- API SIMULATION ---
const simulateDelay = <T,>(data: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 300 + Math.random() * 400));

const reviveDates = (data: any) => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];
                if (typeof value === 'string' && isoRegex.test(value)) {
                    data[key] = new Date(value);
                } else if (typeof value === 'object') {
                    reviveDates(value);
                }
            }
        }
    }
    return data;
}

// --- INTELLIGENT USER/PATIENT MANAGEMENT ---
const findOrCreatePatientUser = (patient: Patient, professionalName: string): User | null => {
    let user = users.find(u => u.email.toLowerCase() === patient.email.toLowerCase());
    
    // Create an "invited" user if they don't exist
    if (!user && patient.status === 'invited') {
        user = {
            id: generateId('user'),
            email: patient.email,
            name: patient.name,
            password: `invited_${generateId('pwd')}`, // unguessable password
            role: 'patient',
            patientProfileId: patient.id
        };
        users.push(user);
    }
    
    // Update existing user link if needed
    if (user && user.role === 'patient' && !user.patientProfileId) {
        user.patientProfileId = patient.id;
        createNotification(user.id, `${professionalName} adicionou você como paciente. Bem-vindo(a) à plataforma!`);
    }
    return user || null;
}

const createNotification = (userId: string, message: string) => {
    const newNotif: Notification = {
        id: generateId('notif'),
        userId,
        message,
        read: false,
        createdAt: new Date(),
    };
    notifications.push(newNotif);
    console.log("Notification created:", newNotif)
    return newNotif;
}


// --- AUTH ---
export const login = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            if (user) {
                // On patient login, check if their profile was 'invited' and update to 'active'
                if (user.role === 'patient' && user.patientProfileId) {
                    const patientProfile = patients.find(p => p.id === user.patientProfileId);
                    if (patientProfile && patientProfile.status === 'invited') {
                        patientProfile.status = 'active';
                    }
                }
                resolve(JSON.parse(JSON.stringify(user)));
            } else {
                reject(new Error("Credenciais inválidas."));
            }
        }, 500);
    });
};

export const register = (data: {name: string, email: string, password: string, phone: string, dateOfBirth: string}): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            let existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
            
            // Patient "claiming" their invited account
            if (existingUser && existingUser.role === 'patient' && existingUser.password.startsWith('invited_')) {
                existingUser.name = data.name;
                existingUser.password = data.password;
                
                const patientProfile = patients.find(p => p.id === existingUser!.patientProfileId);
                if(patientProfile) {
                    patientProfile.status = 'active';
                    patientProfile.phone = data.phone;
                    patientProfile.name = data.name;
                    patientProfile.dateOfBirth = data.dateOfBirth;
                }

                resolve(JSON.parse(JSON.stringify(existingUser)));
                return;
            }

            if (existingUser) {
                 return reject(new Error("Este e-mail já está em uso."));
            }

            const newUser: User = {
                id: generateId('user'),
                name: data.name,
                email: data.email,
                password: data.password,
                role: 'patient'
            };

            // If a new patient registers, check if a profile is waiting for them
            const waitingPatientProfile = patients.find(p => p.email.toLowerCase() === newUser.email.toLowerCase() && p.status === 'invited');
            if (waitingPatientProfile) {
                newUser.patientProfileId = waitingPatientProfile.id;
                waitingPatientProfile.status = 'active';
                waitingPatientProfile.name = data.name;
                waitingPatientProfile.phone = data.phone;
                waitingPatientProfile.dateOfBirth = data.dateOfBirth;
            } else {
                // No waiting profile, create a new one and assign to a default professional
                const newPatient: Patient = {
                    id: generateId('pat'),
                    professionalId: 'prof_1', // Assign to default professional
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
                patients.push(newPatient);
                newUser.patientProfileId = newPatient.id;
            }

            users.push(newUser);
            resolve(JSON.parse(JSON.stringify(newUser)));
        }, 500);
    });
}

export const resetPassword = (data: { name: string; email: string; phone: string; dateOfBirth: string; newPassword: string; }): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
            if (!user || user.role !== 'patient' || !user.patientProfileId) {
                return reject(new Error("Os dados fornecidos não correspondem aos nossos registros."));
            }
            
            const patient = patients.find(p => p.id === user.patientProfileId);
            if (!patient) {
                return reject(new Error("Os dados fornecidos não correspondem aos nossos registros."));
            }
            
            const formatPhoneForCompare = (phone: string) => phone.replace(/\D/g, '');
            
            if (
                patient.name.trim().toLowerCase() === data.name.trim().toLowerCase() &&
                formatPhoneForCompare(patient.phone) === formatPhoneForCompare(data.phone) &&
                patient.dateOfBirth === data.dateOfBirth
            ) {
                user.password = data.newPassword;
                resolve(JSON.parse(JSON.stringify(user)));
            } else {
                return reject(new Error("Os dados fornecidos não correspondem aos nossos registros. Verifique todos os campos e tente novamente."));
            }
        }, 500);
    });
};


// --- DATA FETCHING (SCOPED) ---
export const getAllData = (user: User) => {
    let scopedPatients: Patient[] = [];
    let scopedSessions: Session[] = [];
    let scopedClinicalNotes: ClinicalNote[] = [];
    let scopedNotifications: Notification[] = [];
    let scopedUsers: User[] = [];

    if (user.role === 'professional') {
        scopedPatients = patients.filter(p => p.professionalId === user.id);
        const patientIds = scopedPatients.map(p => p.id);
        scopedSessions = sessions.filter(s => patientIds.includes(s.patientId));
        scopedClinicalNotes = clinicalNotes.filter(n => patientIds.includes(n.patientId));
        scopedNotifications = notifications.filter(n => n.userId === user.id && !n.read);
    } else if (user.role === 'patient' && user.patientProfileId) {
        const patientProfile = patients.find(p => p.id === user.patientProfileId);
        if(patientProfile) {
            scopedPatients = [patientProfile];
            const professional = users.find(u => u.id === patientProfile.professionalId);
            if (professional) scopedUsers.push(professional);
            scopedSessions = sessions.filter(s => s.patientId === user.patientProfileId);
            scopedClinicalNotes = clinicalNotes.filter(n => n.patientId === user.patientProfileId);
        }
        scopedNotifications = notifications.filter(n => n.userId === user.id && !n.read);
    }
    
    return Promise.all([
        simulateDelay(scopedPatients),
        simulateDelay(scopedSessions),
        simulateDelay(sessionTypes), // All session types are public
        simulateDelay(scopedClinicalNotes),
        simulateDelay(scopedNotifications),
        simulateDelay(users.filter(u => u.role === 'professional')) // All professionals are public
    ]).then(([patients, sessions, sessionTypes, clinicalNotes, notifications, professionals]) => reviveDates({
        patients,
        sessions,
        sessionTypes,
        clinicalNotes,
        notifications,
        professionals
    }));
};

// CREATE
export const addSession = (sessData: Omit<Session, 'id' | 'paymentStatus'>, actor: User): Promise<Session> => {
    const newSession: Session = { ...sessData, id: generateId('sess'), paymentStatus: 'unpaid' };
    sessions.push(newSession);

    if (actor.role === 'professional') {
        const patientUser = users.find(u => u.patientProfileId === newSession.patientId);
        if (patientUser) {
            createNotification(patientUser.id, `${actor.name} agendou uma nova sessão para você.`);
        }
    } else { // Patient is booking
        const professional = users.find(u => u.id === newSession.professionalId);
        if (professional) {
            createNotification(professional.id, `Novo agendamento recebido de ${actor.name}.`);
        }
    }

    return simulateDelay(reviveDates(newSession));
};

export const addPatient = (patData: Omit<Patient, 'id' | 'createdAt' | 'professionalId' | 'status' | 'aiConsultationCompleted' | 'aiConsultationHistory'>, professionalId: string, professionalName: string): Promise<Patient> => {
    const newPatient: Patient = { 
        ...patData,
        id: generateId('pat'), 
        professionalId, 
        createdAt: new Date(),
        status: 'invited',
        aiConsultationCompleted: false,
        aiConsultationHistory: []
    };
    patients.push(newPatient);
    findOrCreatePatientUser(newPatient, professionalName);
    return simulateDelay(reviveDates(newPatient));
};

export const addSessionType = (st: Omit<SessionType, 'id'>): Promise<SessionType> => {
    const newSessionType: SessionType = { ...st, id: generateId('st') };
    sessionTypes.push(newSessionType);
    return simulateDelay(reviveDates(newSessionType));
};

export const addClinicalNote = (note: Omit<ClinicalNote, 'id' | 'createdAt'>): Promise<ClinicalNote> => {
    const newNote: ClinicalNote = { ...note, id: generateId('note'), createdAt: new Date() };
    clinicalNotes.push(newNote);
    return simulateDelay(reviveDates(newNote));
}

export const saveAiConsultationResult = (patientId: string, history: Message[]): Promise<Patient> => {
    const index = patients.findIndex(p => p.id === patientId);
    if (index === -1) return Promise.reject(new Error("Patient not found"));
    
    const patient = patients[index];
    patient.aiConsultationCompleted = true;
    patient.aiConsultationHistory = history;
    patients[index] = patient;
    
    // Notify the professional that the patient completed the analysis
    const professional = users.find(u => u.id === patient.professionalId);
    if (professional) {
        createNotification(professional.id, `O paciente ${patient.name} concluiu a Análise Inicial com IA e está pronto para agendar.`);
    }

    return simulateDelay(reviveDates(patient));
}

// UPDATE
export const updateSession = (updatedSess: Session): Promise<Session> => {
    const index = sessions.findIndex(a => a.id === updatedSess.id);
    if (index === -1) return Promise.reject(new Error("Session not found"));
    
    const originalSession = sessions[index];

    // Check if payment status changed to 'paid'
    if (updatedSess.paymentStatus === 'paid' && originalSession.paymentStatus !== 'paid') {
        const patient = patients.find(p => p.id === updatedSess.patientId);
        const sessionType = sessionTypes.find(st => st.id === updatedSess.sessionTypeId);

        if (patient && sessionType) {
            const message = `Pagamento de ${sessionType.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} recebido de ${patient.name} para a sessão do dia ${new Date(updatedSess.startTime).toLocaleDateString('pt-BR')}.`;
            createNotification(updatedSess.professionalId, message);
        }
    }

    sessions[index] = updatedSess;
    return simulateDelay(reviveDates(updatedSess));
};

export const updatePatient = (updatedPat: Patient): Promise<Patient> => {
    const index = patients.findIndex(c => c.id === updatedPat.id);
    if (index === -1) return Promise.reject(new Error("Patient not found"));
    patients[index] = updatedPat;
    return simulateDelay(reviveDates(updatedPat));
};

export const updateSessionType = (updatedST: SessionType): Promise<SessionType> => {
    const index = sessionTypes.findIndex(s => s.id === updatedST.id);
    if (index === -1) return Promise.reject(new Error("SessionType not found"));
    sessionTypes[index] = updatedST;
    return simulateDelay(reviveDates(updatedST));
};

// DELETE
export const deleteSession = (id: string): Promise<string> => {
    sessions = sessions.filter(a => a.id !== id);
    return simulateDelay(id);
};
export const deleteSessionType = (id: string): Promise<string> => {
    sessionTypes = sessionTypes.filter(s => s.id !== id);
    return simulateDelay(id);
};
export const deletePatient = (id: string): Promise<string> => {
    sessions = sessions.filter(a => a.patientId !== id);
    clinicalNotes = clinicalNotes.filter(n => n.patientId !== id);
    patients = patients.filter(c => c.id !== id);
    // Also remove the user if they are only linked to this patient profile
    const user = users.find(u => u.patientProfileId === id);
    if (user) {
        users = users.filter(u => u.id !== user.id);
    }
    return simulateDelay(id);
}