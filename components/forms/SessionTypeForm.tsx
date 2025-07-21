
import React, { useState } from 'react';
import { SessionType, SessionTypeFormData } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';

interface SessionTypeFormProps {
  sessionType?: SessionType | null;
  onSave: (sessionType: SessionTypeFormData | SessionType) => void;
  onClose: () => void;
}

const colorOptions = [
    { label: 'Índigo', value: 'indigo' },
    { label: 'Roxo', value: 'purple' },
    { label: 'Verde-azulado', value: 'teal' },
    { label: 'Rosa', value: 'pink' },
    { label: 'Âmbar', value: 'amber' },
    { label: 'Laranja', value: 'orange' },
];

const SessionTypeForm: React.FC<SessionTypeFormProps> = ({ sessionType, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: sessionType?.name || '',
    description: sessionType?.description || '',
    duration: sessionType?.duration || 50,
    price: sessionType?.price || 0,
    color: sessionType?.color || 'indigo',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (formData.duration <= 0) newErrors.duration = 'Duração deve ser positiva';
    if (formData.price < 0) newErrors.price = 'Valor não pode ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (sessionType) {
      onSave({ ...sessionType, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome do Tipo de Sessão"
        id="name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />
      <Input
        label="Descrição"
        id="description"
        type="text"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
            label="Duração (minutos)"
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            error={errors.duration}
            required
        />
        <Input
            label="Valor da Sessão (R$)"
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            error={errors.price}
            required
        />
      </div>
      <Select
        label="Cor na Agenda"
        id="color"
        value={formData.color}
        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
      >
        {colorOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit">{sessionType ? 'Salvar Alterações' : 'Adicionar Tipo'}</Button>
      </div>
    </form>
  );
};

export default SessionTypeForm;
