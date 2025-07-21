
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Skeleton from '../ui/Skeleton';
import Input from '../ui/Input';
import Button from '../ui/Button';
import UserAvatar from '../ui/UserAvatar';

const PatientProfileView: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser, patients, loading } = state;
    
    const patientProfile = patients.find(p => p.id === currentUser?.patientProfileId);

    const [name, setName] = useState(currentUser?.name || '');
    const [phone, setPhone] = useState(patientProfile?.phone || '');

    if (loading || !currentUser || !patientProfile) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
            
            {/* Personal Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 flex items-center space-x-6">
                    <div className="h-24 w-24 flex-shrink-0">
                        <UserAvatar name={currentUser.name} className="text-4xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                        <p className="text-gray-600">{currentUser.email}</p>
                        <p className="text-sm text-gray-500 mt-1">Membro desde: {new Date(patientProfile.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>

                <form className="p-6 border-t border-gray-200 space-y-4">
                    <Input 
                        label="Nome Completo" 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
                     <Input 
                        label="Telefone" 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                    />
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Salvar Alterações</Button>
                    </div>
                </form>
            </div>

            {/* Security Card */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                 <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Segurança da Conta</h3>
                    <p className="text-sm text-gray-500 mt-1">Altere sua senha para manter sua conta segura.</p>
                 </div>
                <form className="p-6 border-t border-gray-200 space-y-4">
                    <Input 
                        label="Senha Atual" 
                        id="current_password" 
                        type="password"
                        placeholder="********"
                    />
                     <Input 
                        label="Nova Senha" 
                        id="new_password" 
                        type="password"
                        placeholder="********"
                    />
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Alterar Senha</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProfileSkeleton = () => (
    <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-9 w-48" />
        <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
            </div>
            <div className="mt-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
         <div className="bg-white rounded-xl p-6 space-y-4">
             <Skeleton className="h-6 w-40" />
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
        </div>
    </div>
);

export default PatientProfileView;
