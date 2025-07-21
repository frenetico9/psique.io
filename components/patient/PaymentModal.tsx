
import React, { useState, useMemo } from 'react';
import { Session, SessionType } from '../../types';
import { updateSession } from '../../services/mockApi';
import { useToast } from '../ui/Toaster';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

// --- Main Component ---
interface PaymentModalProps {
    session: Session;
    sessionType?: SessionType;
    onClose: () => void;
    onSuccess: (session: Session) => void;
}

type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'boleto';

const PaymentModal: React.FC<PaymentModalProps> = ({ session, sessionType, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<PaymentMethod>('credit_card');

    return (
        <Modal isOpen={true} onClose={onClose} title="Realizar Pagamento">
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-700">{sessionType?.name}</h3>
                    <p className="text-sm text-gray-500">{new Date(session.startTime).toLocaleString('pt-BR', { dateStyle: 'full' })}</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-2">{sessionType?.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                        <TabButton id="credit_card" label="Cartão de Crédito" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CreditCardIcon />} />
                        <TabButton id="debit_card" label="Cartão de Débito" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CreditCardIcon />} />
                        <TabButton id="pix" label="Pix" activeTab={activeTab} setActiveTab={setActiveTab} icon={<PixIcon />} />
                        <TabButton id="boleto" label="Boleto" activeTab={activeTab} setActiveTab={setActiveTab} icon={<BarcodeIcon />} />
                    </nav>
                </div>

                <div className="pt-2">
                    {activeTab === 'credit_card' && <CardPaymentForm session={session} sessionType={sessionType} onSuccess={onSuccess} cardType="credit" />}
                    {activeTab === 'debit_card' && <CardPaymentForm session={session} sessionType={sessionType} onSuccess={onSuccess} cardType="debit" />}
                    {activeTab === 'pix' && <PixPayment session={session} sessionType={sessionType} onSuccess={onSuccess} />}
                    {activeTab === 'boleto' && <BoletoPayment sessionType={sessionType} onClose={onClose} />}
                </div>
            </div>
        </Modal>
    );
};

// --- Child Components ---

const TabButton: React.FC<{id: PaymentMethod, label: string, activeTab: PaymentMethod, setActiveTab: (id: PaymentMethod) => void, icon: React.ReactNode}> = 
({ id, label, activeTab, setActiveTab, icon }) => (
    <button 
        onClick={() => setActiveTab(id)} 
        className={`whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === id 
            ? 'border-indigo-500 text-indigo-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {icon}
        {label}
    </button>
);


const CardPaymentForm: React.FC<Omit<PaymentModalProps, 'onClose'> & { cardType: 'credit' | 'debit' }> = ({ session, sessionType, onSuccess, cardType }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [installments, setInstallments] = useState('1');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            const result = await updateSession({ ...session, paymentStatus: 'paid' });
            onSuccess(result);
        } catch (error) { console.error("Payment failed", error); } 
        finally { setIsLoading(false); }
    };
    
    const price = sessionType?.price || 0;
    const installmentOptions = useMemo(() => {
        const options = [];
        for (let i = 1; i <= 3; i++) {
            const installmentPrice = (price / i).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            options.push({ value: i.toString(), label: `${i}x de ${installmentPrice}`});
        }
        return options;
    }, [price]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={`Número do Cartão de ${cardType === 'credit' ? 'Crédito' : 'Débito'}`} id="cardNumber" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} required />
            <Input label="Nome no Cartão" id="cardName" placeholder="Nome Completo" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Validade (MM/AA)" id="cardExpiry" placeholder="MM/AA" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} required />
                <Input label="CVV" id="cardCvv" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} required />
            </div>
            {cardType === 'credit' && price > 50 && (
                 <div className="w-full">
                    <label htmlFor="installments" className="block text-sm font-medium text-gray-700 mb-1">
                        Parcelas
                    </label>
                    <select
                        id="installments"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                    >
                        {installmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            )}
            <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Processando...' : `Pagar ${sessionType?.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                </Button>
            </div>
        </form>
    );
};


const PixPayment: React.FC<Omit<PaymentModalProps, 'onClose'>> = ({ session, sessionType, onSuccess }) => {
    const [isWaiting, setIsWaiting] = useState(false);
    const toast = useToast();

    const handlePay = async () => {
        setIsWaiting(true);
        // Simulate waiting for PIX confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
            const result = await updateSession({ ...session, paymentStatus: 'paid' });
            onSuccess(result);
        } catch (error) { console.error("Payment failed", error); } 
        finally { setIsWaiting(false); }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText("00020126330014br.gov.bcb.pix0111123456789010204000003039860415.000503000520400005303986540550.005802BR5913NOME COMPLETO6009SAO PAULO62070503***6304ABCD");
        toast('Código Pix copiado!', 'success');
    }

    if (isWaiting) {
        return (
            <div className="text-center py-8 flex flex-col items-center justify-center animate-fade-in">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-4 font-semibold text-gray-700">Aguardando confirmação do pagamento...</p>
                <p className="text-sm text-gray-500">Mantenha esta tela aberta.</p>
            </div>
        )
    }

    return (
        <div className="text-center space-y-4 animate-fade-in">
            <p className="text-gray-600">Escaneie o QR Code abaixo com o app do seu banco para pagar.</p>
            <img src="https://i.imgur.com/g27b5hG.png" alt="QR Code PIX" className="w-48 h-48 mx-auto border-4 border-white shadow-md rounded-lg"/>
            <p className="text-gray-600">Ou use o Pix Copia e Cola:</p>
            <Button variant="secondary" onClick={copyToClipboard} className="w-full">
                <ClipboardIcon /> Copiar Código Pix
            </Button>
            <div className="pt-2">
                 <Button onClick={handlePay} className="w-full">
                    Simular Pagamento Confirmado
                </Button>
            </div>
        </div>
    );
};


const BoletoPayment: React.FC<Pick<PaymentModalProps, 'sessionType' | 'onClose'>> = ({ sessionType, onClose }) => {
    const toast = useToast();
    const copyToClipboard = () => {
        navigator.clipboard.writeText("12345.67890 12345.678901 12345.678901 1 12345678901234");
        toast('Código de barras copiado!', 'success');
    }
    return (
        <div className="text-center space-y-4 animate-fade-in">
             <p className="text-gray-600">Pague o boleto em qualquer banco, casa lotérica ou pelo app do seu banco.</p>
             <img src="https://i.imgur.com/u5aY12G.png" alt="Código de Barras" className="w-full h-auto mx-auto"/>
             <Button variant="secondary" onClick={copyToClipboard} className="w-full">
                <ClipboardIcon /> Copiar Linha Digitável
            </Button>
            <div className="pt-2">
                <Button onClick={onClose} className="w-full">
                    Fechar (Pagamento Simulado)
                </Button>
                 <p className="text-xs text-gray-500 mt-2">A confirmação do boleto pode levar até 3 dias úteis.</p>
            </div>
        </div>
    );
};

// --- Icons ---
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const PixIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01,2.5L12.01,2.5c-5.25,0-9.5,4.25-9.5,9.5c0,3.58,1.99,6.71,4.96,8.28l-0.01-0.01c-0.12-0.3-0.19-0.62-0.19-0.96V19c0-0.83-0.67-1.5-1.5-1.5h-1.4l-0.07,0.01C7.62,13.6,10.6,11,14.5,11h1.79l0.21,0.01c2.19-0.83,3.5-3.04,3.5-5.51C20,5.5,16.5,2.5,12.01,2.5z M12,6.5c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5S12.83,6.5,12,6.5z"/></svg>;
const BarcodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-4-14v12m8-12v12m-6-10h4m-4 8h4M3 8h2m-2 8h2m14-8h2m-2 8h2" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

export default PaymentModal;
