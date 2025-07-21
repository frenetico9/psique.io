
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
}

const SessionForm: React.FC<SessionFormProps> = ({ currentUser, patients, sessionTypes, session, onSave, onClose, onDelete, defaultDateTime }) => {
  const [formData, setFormData] = useState({
    patientId: session?.patientId || '',
    sessionTypeId: session?.sessionTypeId || '',
    date: (session?.startTime || defaultDateTime || new Date()).toISOString().split('T')[0],
    time: (session?.startTime || defaultDateTime || new Date()).toTimeString().substr(0, 5),
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
            step="1800"
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

      <div className="flex justify-between items-center w-full pt-4">
        <div>
            {session && onDelete && (
                <Button type="button" variant="danger" onClick={onDelete}>Excluir Sessão</Button>
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

export default SessionForm;