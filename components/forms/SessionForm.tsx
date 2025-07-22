
import React, { useState } from 'react';
import { Session, Patient, SessionType, User } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface SessionFormProps {
  currentUser: User;
  patients: Patient[];
  sessionTypes: SessionType[];
  session?: Session | null;
  onSave: (session: Omit<Session, 'id'> | Session) => void;
  onClose: () => void;
  onDelete?: () => void;
  defaultDateTime?: Date;
  onJoinMeeting?: (session: Session) => void;
}

const isJoinable = (session: Session) => {
    // As per request, allow joining any scheduled session from the professional's calendar view.
    return session.status === 'scheduled';
}

const SessionForm: React.FC<SessionFormProps> = ({ currentUser, patients, sessionTypes, session, onSave, onClose, onDelete, defaultDateTime, onJoinMeeting }) => {
  const getInitialStartTime = () => {
    const timeSource = session?.startTime || defaultDateTime;
    return timeSource ? new Date(timeSource) : new Date();
  };
  
  const initialStartTime = getInitialStartTime();

  const [formData, setFormData] = useState({
    patientId: session?.patientId || '',
    sessionTypeId: session?.sessionTypeId || '',
    date: initialStartTime.toISOString().split('T')[0],
    time: initialStartTime.toTimeString().substr(0, 5),
    status: session?.status || 'scheduled',
    notes: session?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.patientId) newErrors.patientId = 'Paciente é obrigatório';
    if (!formData.sessionTypeId) newErrors.sessionTypeId = 'Tipo de sessão é obrigatório';
    if (!formData.date) newErrors.date = 'Data é obrigatória';
    if (!formData.time) newErrors.time = 'Hora é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const [year, month, day] = formData.date.split('-').map(Number);
    const [hours, minutes] = formData.time.split(':').map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes);
    
    const sessionType = sessionTypes.find(s => s.id === formData.sessionTypeId);
    if (!sessionType) return;

    const endTime = new Date(startTime.getTime() + sessionType.duration * 60000);

    const saveData = {
      patientId: formData.patientId,
      professionalId: currentUser.id,
      sessionTypeId: formData.sessionTypeId,
      startTime,
      endTime,
      status: formData.status as Session['status'],
      notes: formData.notes,
      paymentStatus: session?.paymentStatus || 'unpaid',
    };

    if (session) {
      onSave({ ...session, ...saveData });
    } else {
      onSave(saveData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Paciente"
        id="patientId"
        value={formData.patientId}
        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
        error={errors.patientId}
        required
      >
        <option value="">Selecione um paciente</option>
        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Select>
      
      <Select
        label="Tipo de Sessão"
        id="sessionTypeId"
        value={formData.sessionTypeId}
        onChange={(e) => setFormData({ ...formData, sessionTypeId: e.target.value })}
        error={errors.sessionTypeId}
        required
      >
        <option value="">Selecione um tipo de sessão</option>
        {sessionTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
      </Select>

      <div className="grid grid-cols-2 gap-4">
         <Input
            label="Data"
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={errors.date}
            required
        />
        <Input
            label="Hora"
            id="time"
            type="time"
            step="600"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            error={errors.time}
            required
        />
      </div>

       <Select
        label="Status"
        id="status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value as Session['status'] })}
      >
        <option value="scheduled">Agendada</option>
        <option value="completed">Realizada</option>
        <option value="cancelled_patient">Cancelada pelo Paciente</option>
        <option value="no_show">Não Compareceu</option>
      </Select>
      
      <div className="p-3 bg-indigo-50 rounded-md flex items-center gap-3">
        <VideoCameraIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
        <p className="text-sm text-indigo-800">Lembrete: Todas as sessões são realizadas de forma online.</p>
      </div>

      <div className="flex justify-between items-center w-full pt-4 border-t mt-4">
        <div className="flex gap-2">
           {session && onJoinMeeting && isJoinable(session) && (
              <Button type="button" onClick={() => onJoinMeeting(session)} className="bg-green-500 hover:bg-green-600">
                  <VideoCameraSolidIcon className="w-5 h-5 mr-2" />
                  Entrar na Chamada
              </Button>
            )}
            {session && onDelete && (
                <Button type="button" variant="danger" onClick={onDelete}>Excluir</Button>
            )}
        </div>
        <div className="flex space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{session ? 'Salvar Alterações' : 'Agendar Sessão'}</Button>
        </div>
      </div>
    </form>
  );
};

const VideoCameraIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM15.5 5.75a.75.75 0 00-1.5 0v2.551l-1.42-1.066a.75.75 0 00-.962 1.28l1.75 1.313a.75.75 0 00.962 0l1.75-1.312a.75.75 0 00-.962-1.28L15.5 8.301V5.75z" /></svg>;
const VideoCameraSolidIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412l-1.154-3.462a1.23 1.23 0 00-1.346-1.043l-1.453.484a1.23 1.23 0 01-1.272-.218l-1.453-.969a1.23 1.23 0 00-1.506 0l-1.453.969a1.23 1.23 0 01-1.272.218l-1.453-.484a1.23 1.23 0 00-1.346 1.043l-1.154 3.462z" /></svg>;

export default SessionForm;
