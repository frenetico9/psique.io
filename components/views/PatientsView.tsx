
import React, { useState, useRef, useEffect } from 'react';
import { Patient, PatientFormData } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { addPatient, updatePatient, deletePatient } from '../../services/mockApi';
import { useToast } from '../ui/Toaster';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import PatientForm from '../forms/PatientForm';
import Skeleton from '../ui/Skeleton';
import UserAvatar from '../ui/UserAvatar';
import EmptyState from '../ui/EmptyState';

// --- Responsive Card Component for Mobile ---
const PatientCard: React.FC<{
  patient: Patient;
  onSelectPatient: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ patient, onSelectPatient, onEdit, onDelete }) => {
  const statusBadge: Record<Patient['status'], string> = {
    active: 'bg-green-100 text-green-800',
    invited: 'bg-blue-100 text-blue-800',
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  }

  return (
    <div className="p-4 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 h-10 w-10"><UserAvatar name={patient.name} /></div>
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{patient.name}</p>
                    <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                </div>
            </div>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(o => !o)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                    <DotsVerticalIcon />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10">
                        <button onClick={() => handleMenuAction(() => onSelectPatient(patient.id))} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ver Prontuário</button>
                        <button onClick={() => handleMenuAction(onEdit)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Editar</button>
                        <button onClick={() => handleMenuAction(onDelete)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Excluir</button>
                    </div>
                )}
            </div>
        </div>
        <div className="mt-3 pl-14 text-sm text-gray-700 space-y-1">
             <p><strong>Telefone:</strong> {patient.phone}</p>
             <p><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge[patient.status]}`}>{patient.status === 'active' ? 'Ativo' : 'Convidado'}</span></p>
        </div>
    </div>
  );
};

const CardListSkeleton = () => (
    <div className="p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
    </div>
);

interface PatientsViewProps {
  onSelectPatient: (patientId: string) => void;
}

const PatientsView: React.FC<PatientsViewProps> = ({ onSelectPatient }) => {
  const { state, dispatch } = useAppContext();
  const { patients, currentUser, loading } = state;
  const toast = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);

  const handleOpenForm = (patient: Patient | null) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
  };

  const handleSave = async (data: PatientFormData | Patient) => {
    try {
      if (!currentUser) throw new Error("Usuário não autenticado.");

      if ('id' in data) {
        const updated = await updatePatient(data);
        dispatch({ type: 'UPDATE_PATIENT', payload: updated });
        toast('Paciente atualizado!', 'success');
      } else {
        const { inviteUser, ...patientData } = data; // separate PatientFormData from extra fields
        const created = await addPatient(patientData, currentUser.id, currentUser.name);
        dispatch({ type: 'ADD_PATIENT', payload: created });
        toast('Paciente adicionado!', 'success');
      }
      handleCloseForm();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Falha ao salvar paciente.', 'error');
    }
  };
  
  const openDeleteConfirm = (id: string) => {
    setDeletingPatientId(id);
    setIsConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeletingPatientId(null);
    setIsConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingPatientId) return;
    try {
      await deletePatient(deletingPatientId);
      dispatch({ type: 'DELETE_PATIENT', payload: deletingPatientId });
      toast('Paciente e seus dados foram excluídos!', 'success');
      closeDeleteConfirm();
    } catch (error) {
      toast('Falha ao excluir o paciente.', 'error');
    }
  };

  const statusBadge: Record<Patient['status'], string> = {
    active: 'bg-green-100 text-green-800',
    invited: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Pacientes</h1>
        <Button onClick={() => handleOpenForm(null)}>
          <PlusIcon /> <span className="hidden sm:inline ml-2">Novo Paciente</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {!loading && patients.length === 0 ? (
            <div className="p-4">
              <EmptyState 
                icon={<UsersIcon />}
                title="Nenhum paciente cadastrado"
                description="Comece a gerenciar seus pacientes adicionando o primeiro."
                action={{ text: 'Adicionar Paciente', onClick: () => handleOpenForm(null) }}
              />
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden">
                {loading ? <CardListSkeleton /> : (
                  <div className="divide-y divide-gray-200">
                    {patients.map(patient => <PatientCard key={patient.id} patient={patient} onSelectPatient={onSelectPatient} onEdit={() => handleOpenForm(patient)} onDelete={() => openDeleteConfirm(patient.id)}/>)}
                  </div>
                )}
              </div>
              
              {/* Desktop Table View */}
              <table className="hidden md:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contato</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? <TableSkeleton /> : patients.map(patient => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <UserAvatar name={patient.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">{patient.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge[patient.status]}`}>
                          {patient.status === 'active' ? 'Ativo' : 'Convidado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <Button variant="ghost" size="sm" onClick={() => onSelectPatient(patient.id)}>Ver Prontuário</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenForm(patient)}>Editar</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-50" onClick={() => openDeleteConfirm(patient.id)}>Excluir</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
      </div>
      
      {isFormOpen && (
        <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingPatient ? "Editar Paciente" : "Novo Paciente"}>
            <PatientForm patient={editingPatient} onSave={handleSave} onClose={handleCloseForm} />
        </Modal>
      )}

      {isConfirmOpen && (
        <Modal isOpen={isConfirmOpen} onClose={closeDeleteConfirm} title="Confirmar Exclusão">
          <p>Tem certeza que deseja excluir este paciente? Todas as suas sessões e anotações clínicas também serão removidas. Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeDeleteConfirm}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </Modal>
      )}

    </div>
  );
};

const TableSkeleton = () => (
    <>
        {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
                <td className="px-6 py-4"><div className="flex items-center"><Skeleton className="h-10 w-10 rounded-full" /><div className="ml-4 space-y-2"><Skeleton className="h-4 w-32 rounded" /><Skeleton className="h-3 w-40 rounded" /></div></div></td>
                <td className="px-6 py-4 space-y-2"><Skeleton className="h-4 w-24 rounded" /></td>
                <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-md" /></td>
                <td className="px-6 py-4"><Skeleton className="h-5 w-48 rounded" /></td>
            </tr>
        ))}
    </>
);

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-2.305c.395-.429.744-1.21.744-2.128v-1.172c0-.918-.349-1.699-.744-2.128A9.337 9.337 0 0017.625 9.5a9.38 9.38 0 00-2.625.372M10.5 19.128c-2.28-.48-4.25-2.26-4.25-4.628v-1.172c0-.918.349-1.699.744-2.128A9.337 9.337 0 0110.5 9.5a9.38 9.38 0 012.625.372M10.5 19.128v-1.5c0-1.077.528-2.043 1.375-2.628M10.5 9.5c-2.28.48-4.25 2.26-4.25 4.628v1.172c0 .918-.349 1.699-.744 2.128A9.337 9.337 0 006.25 19.5a9.38 9.38 0 002.625-.372m-4.5-9.25a.75.75 0 100-1.5.75.75 0 000 1.5zM12 7.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM15 3.75a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>;
const DotsVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>;


export default PatientsView;
