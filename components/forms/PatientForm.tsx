
import React, { useState } from 'react';
import { Patient, PatientFormData } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface PatientFormProps {
  patient?: Patient | null;
  onSave: (patient: PatientFormData | Patient) => void;
  onClose: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
    dateOfBirth: patient?.dateOfBirth || '',
    lgpd_consent: patient?.lgpd_consent ?? true,
    inviteUser: !patient, // Default to inviting new patients
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const formatPhone = (value: string) => {
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value.slice(0, 15); // (XX) XXXXX-XXXX is 15 chars
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: formatPhone(e.target.value) });
  };


  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.email.trim()) {
        newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'E-mail inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (patient) {
      onSave({ ...patient, ...formData });
    } else {
      onSave(formData as PatientFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome Completo"
        id="name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Input
            label="Telefone (WhatsApp)"
            id="phone"
            type="tel"
            placeholder="(XX) XXXXX-XXXX"
            value={formData.phone}
            onChange={handlePhoneChange}
            error={errors.phone}
            required
            />
        <Input
            label="Data de Nascimento"
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        />
      </div>
      <Input
        label="E-mail"
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
        disabled={!!patient} // Do not allow changing email for existing patients
      />
      <div className="flex items-start pt-2 space-x-3">
        <input
            id="lgpd_consent"
            type="checkbox"
            className="h-4 w-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            checked={formData.lgpd_consent}
            onChange={(e) => setFormData({ ...formData, lgpd_consent: e.target.checked })}
        />
        <label htmlFor="lgpd_consent" className="block text-sm text-gray-900">
            Paciente concedeu consentimento para uso de dados (LGPD).
        </label>
      </div>
       {!patient && (
         <div className="flex items-start pt-2 space-x-3">
            <input
                id="inviteUser"
                type="checkbox"
                className="h-4 w-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                checked={formData.inviteUser}
                onChange={(e) => setFormData({ ...formData, inviteUser: e.target.checked })}
            />
            <label htmlFor="inviteUser" className="block text-sm text-gray-900">
                Convidar paciente para a plataforma.
                <span className="block text-xs text-gray-500">Uma conta de usuário será criada para este e-mail.</span>
            </label>
         </div>
       )}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit">{patient ? 'Salvar Alterações' : 'Adicionar Paciente'}</Button>
      </div>
    </form>
  );
};

export default PatientForm;