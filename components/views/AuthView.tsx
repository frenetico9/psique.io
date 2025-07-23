
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../ui/Toaster';
import { login, register, resetPassword } from '../../services/mockApi';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AuthView: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgotPassword'>('login');

  const renderForm = () => {
    switch (authMode) {
      case 'register':
        return <RegisterForm setAuthMode={setAuthMode} />;
      case 'forgotPassword':
        return <ForgotPasswordForm setAuthMode={setAuthMode} />;
      case 'login':
      default:
        return <LoginForm setAuthMode={setAuthMode} />;
    }
  };
  
  const getToggleText = () => {
     switch(authMode) {
         case 'login':
            return { question: 'Não tem uma conta?', action: 'Cadastre-se', mode: 'register' };
         case 'register':
            return { question: 'Já possui uma conta?', action: 'Faça login', mode: 'login' };
         case 'forgotPassword':
            return { question: 'Lembrou a senha?', action: 'Faça login', mode: 'login' };
     }
  }

  const toggle = getToggleText();

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-4">
      <div className="flex items-center space-x-2 mb-8">
        <img src="https://iili.io/FOD9dQI.png" alt="Psique.IO Logo" className="w-10 h-10"/>
        <h1 className="text-3xl font-bold tracking-wider text-slate-800">Psique<span className="font-light">.IO</span></h1>
      </div>
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20">
        {renderForm()}
        <p className="mt-6 text-center text-sm text-gray-800">
          {toggle.question}
          <button onClick={() => setAuthMode(toggle.mode as any)} className="font-semibold text-indigo-600 hover:text-indigo-500 ml-1">
            {toggle.action}
          </button>
        </p>
      </div>
      <p className="text-xs text-slate-200 text-center mt-8 drop-shadow">© 2024 Psique.IO</p>
    </div>
  );
};

const LoginForm = ({ setAuthMode }: { setAuthMode: (mode: 'register' | 'forgotPassword') => void }) => {
    const { dispatch } = useAppContext();
    const toast = useToast();
    const [email, setEmail] = useState('sofia.lima@psique.io');
    const [password, setPassword] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await login(email, password);
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
            toast(`Bem-vindo(a), ${user.name}!`, 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast(message, 'error');
            setIsLoading(false);
        }
    };
    
    const setPatientCredentials = () => {
        setEmail('juliana.costa@email.com');
        setPassword('password123');
    }
    
    const setProfessionalCredentials = () => {
        setEmail('sofia.lima@psique.io');
        setPassword('password123');
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">Acesse sua Conta</h2>
            <div>
              <Input label="Email" id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
               <div className="text-xs text-gray-500 mt-2">
                 Exemplos: 
                 <button type="button" onClick={setProfessionalCredentials} className="text-indigo-600 hover:underline mx-1">Profissional</button>
                 |
                 <button type="button" onClick={setPatientCredentials} className="text-indigo-600 hover:underline ml-1">Paciente</button>
               </div>
            </div>
            <div>
                <Input label="Senha" id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                <div className="text-right mt-2">
                    <button type="button" onClick={() => setAuthMode('forgotPassword')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                        Esqueceu a senha?
                    </button>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar'}</Button>
        </form>
    );
};

const RegisterForm = ({ setAuthMode }: { setAuthMode: (mode: 'login') => void }) => {
    const { dispatch } = useAppContext();
    const toast = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatPhone = (value: string) => {
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        return value.slice(0, 15); // (XX) XXXXX-XXXX is 15 chars
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(password.length < 6) {
            toast('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }
         if(!dateOfBirth) {
            toast('A data de nascimento é obrigatória.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const newUser = await register({ name, email, password, phone, dateOfBirth });
            dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
            toast(`Cadastro realizado com sucesso, ${newUser.name}!`, 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast(message, 'error');
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-2xl font-bold text-center text-gray-800">Crie sua Conta de Paciente</h2>
            <Input label="Nome Completo" id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
            <Input label="Email" id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
            <Input label="Telefone" id="reg-phone" type="tel" value={phone} onChange={handlePhoneChange} placeholder="(XX) XXXXX-XXXX" required disabled={isLoading} />
            <Input label="Data de Nascimento" id="reg-dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required disabled={isLoading} />
            <Input label="Senha (mín. 6 caracteres)" id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>{isLoading ? 'Criando conta...' : 'Cadastrar'}</Button>
        </form>
    );
};

const ForgotPasswordForm = ({ setAuthMode }: { setAuthMode: (mode: 'login') => void }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', dateOfBirth: '', newPassword: '', confirmPassword: ''});
    const [isLoading, setIsLoading] = useState(false);

    const formatPhone = (value: string) => {
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        return value.slice(0, 15);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, phone: formatPhone(e.target.value) });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.id]: e.target.value});
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { newPassword, confirmPassword, ...verificationData } = formData;
        if (newPassword !== confirmPassword) {
            toast('As senhas não coincidem.', 'error');
            return;
        }
        if (newPassword.length < 6) {
            toast('A nova senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword({ ...verificationData, newPassword });
            toast('Senha alterada com sucesso! Faça login com sua nova senha.', 'success');
            setAuthMode('login');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Recuperar Senha</h2>
            <p className="text-sm text-center text-gray-600 !mb-5">Para sua segurança, preencha todos os campos abaixo para definir uma nova senha.</p>
            <Input label="Nome Completo" id="name" value={formData.name} onChange={handleChange} required disabled={isLoading} />
            <Input label="Email" id="email" type="email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
            <Input label="Telefone" id="phone" type="tel" value={formData.phone} onChange={handlePhoneChange} placeholder="(XX) XXXXX-XXXX" required disabled={isLoading} />
            <Input label="Data de Nascimento" id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required disabled={isLoading} />
            <Input label="Nova Senha (mín. 6 caracteres)" id="newPassword" type="password" value={formData.newPassword} onChange={handleChange} required disabled={isLoading} />
            <Input label="Confirmar Nova Senha" id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} />
            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Alterar Senha'}
            </Button>
        </form>
    );
};


export default AuthView;
