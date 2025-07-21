
import React, { useState } from 'react';
import { SessionType, SessionTypeFormData } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { addSessionType, updateSessionType, deleteSessionType } from '../../services/mockApi';
import { useToast } from '../ui/Toaster';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SessionTypeForm from '../forms/SessionTypeForm';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

const PricingPlanCard: React.FC<{
  st: SessionType;
  billingCycle: 'session' | 'package';
  onEdit: () => void;
  onDelete: () => void;
}> = ({ st, billingCycle, onEdit, onDelete }) => {

  const features = [
    'Atendimento personalizado',
    'Acesso à plataforma do paciente',
    'Suporte via chat (horário comercial)',
    billingCycle === 'package' ? 'Sessões semanais garantidas' : 'Flexibilidade de agendamento'
  ];

  const price = billingCycle === 'package' ? st.price * 4 * 0.9 : st.price;

  return (
    <div className="border-2 rounded-xl p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-indigo-500 relative bg-white">
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-800">{st.name}</h3>
        <p className="text-sm text-gray-500 mt-1 h-10">{st.description}</p>
        
        <div className="my-6">
          <span className="text-4xl font-extrabold text-gray-900">
            {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-base font-medium text-gray-500">
            /{billingCycle === 'package' ? 'mês' : 'sessão'}
          </span>
          {billingCycle === 'package' && 
            <p className="text-sm text-green-600 font-semibold mt-1">Economize 10%!</p>
          }
        </div>

        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <CheckIcon />
              <span className="text-sm text-gray-600 ml-3">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 pt-4 border-t flex items-center gap-2">
        <Button variant="primary" onClick={onEdit} className="w-full">Editar Plano</Button>
        <Button variant="ghost" onClick={onDelete} className="text-red-600 hover:bg-red-50 !p-2"><TrashIcon/></Button>
      </div>
    </div>
  );
};


const PricingView: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { sessionTypes, loading } = state;
  const toast = useToast();

  const [billingCycle, setBillingCycle] = useState<'session' | 'package'>('session');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSessionType, setEditingSessionType] = useState<SessionType | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenForm = (st: SessionType | null) => {
    setEditingSessionType(st);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingSessionType(null);
  };

  const handleSave = async (data: SessionTypeFormData | SessionType) => {
    try {
      if ('id' in data) {
        const updated = await updateSessionType(data);
        dispatch({ type: 'UPDATE_SESSION_TYPE', payload: updated });
        toast('Plano atualizado!', 'success');
      } else {
        const newSt = await addSessionType(data);
        dispatch({ type: 'ADD_SESSION_TYPE', payload: newSt });
        toast('Plano adicionado!', 'success');
      }
      handleCloseForm();
    } catch (error) {
      toast('Falha ao salvar o plano.', 'error');
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeletingId(id);
    setIsConfirmModalOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeletingId(null);
    setIsConfirmModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteSessionType(deletingId);
      dispatch({ type: 'DELETE_SESSION_TYPE', payload: deletingId });
      toast('Plano excluído!', 'success');
      closeDeleteConfirm();
    } catch (error) {
      toast('Falha ao excluir.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Planos e Preços</h1>
          <p className="text-gray-500 mt-1">Gerencie os serviços oferecidos aos seus pacientes.</p>
        </div>
        <Button onClick={() => handleOpenForm(null)}>
            <PlusIcon />
            <span className="hidden sm:inline ml-2">Novo Plano</span>
        </Button>
      </div>

      <div className="flex justify-center">
        <div className="relative flex p-1 bg-gray-200 rounded-full">
          <button 
            onClick={() => setBillingCycle('session')}
            className={`relative w-32 py-2 text-sm font-semibold z-10 transition-colors duration-300 ${billingCycle === 'session' ? 'text-indigo-700' : 'text-gray-600'}`}
          >
            Sessão Avulsa
          </button>
           <button 
            onClick={() => setBillingCycle('package')}
            className={`relative w-32 py-2 text-sm font-semibold z-10 transition-colors duration-300 ${billingCycle === 'package' ? 'text-indigo-700' : 'text-gray-600'}`}
          >
            Pacote Mensal
          </button>
          <div className={`absolute top-1 h-10 w-32 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${billingCycle === 'package' ? 'translate-x-full' : ''}`}></div>
        </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <Skeleton className="h-96 rounded-xl" />
           <Skeleton className="h-96 rounded-xl" />
           <Skeleton className="h-96 rounded-xl" />
         </div>
      ) : sessionTypes.length === 0 ? (
        <EmptyState 
          icon={<TagIcon />}
          title="Nenhum plano criado"
          description="Crie planos para organizar e precificar seus atendimentos."
          action={{ text: 'Criar Primeiro Plano', onClick: () => handleOpenForm(null) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessionTypes.map(st => (
            <PricingPlanCard 
              key={st.id} 
              st={st} 
              billingCycle={billingCycle} 
              onEdit={() => handleOpenForm(st)}
              onDelete={() => openDeleteConfirm(st.id)}
            />
          ))}
        </div>
      )}

      {isFormModalOpen && (
        <Modal isOpen={isFormModalOpen} onClose={handleCloseForm} title={editingSessionType ? 'Editar Plano' : 'Novo Plano'}>
          <SessionTypeForm sessionType={editingSessionType} onSave={handleSave} onClose={handleCloseForm} />
        </Modal>
      )}

      {isConfirmModalOpen && (
        <Modal isOpen={isConfirmModalOpen} onClose={closeDeleteConfirm} title="Confirmar Exclusão">
          <p>Tem certeza que deseja excluir este plano? Isso pode afetar sessões já agendadas.</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeDeleteConfirm}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ICONS
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v18" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default PricingView;
