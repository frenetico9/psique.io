
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Session, SessionType } from '../../types';
import Skeleton from '../ui/Skeleton';
import { useToast } from '../ui/Toaster';
import { updateSession } from '../../services/mockApi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import PaymentModal from './PaymentModal';

const statusBadge: Record<Session['status'], string> = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled_patient: "bg-yellow-100 text-yellow-800",
    no_show: "bg-red-100 text-red-800",
}

const statusText: Record<Session['status'], string> = {
    scheduled: "Agendada",
    completed: "Realizada",
    cancelled_patient: "Cancelada por você",
    no_show: "Não Compareceu",
}

const StarRating: React.FC<{
    rating: number;
    onRate: (rating: number) => void;
}> = ({ rating, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                return (
                    <button
                        key={starValue}
                        type="button"
                        onClick={() => onRate(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1"
                    >
                        <StarIcon
                            className={`w-6 h-6 transition-colors ${
                                (hoverRating || rating) >= starValue
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
};


const PatientSessionsView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { sessions, sessionTypes, loading } = state;
    const toast = useToast();
    
    const [cancellingSession, setCancellingSession] = useState<Session | null>(null);
    const [payingSession, setPayingSession] = useState<Session | null>(null);

    const { upcomingSessions, pastSessions } = useMemo(() => {
        const now = new Date();
        const sortedSessions = [...sessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        
        return {
            upcomingSessions: sortedSessions.filter(s => new Date(s.startTime) >= now),
            pastSessions: sortedSessions.filter(s => new Date(s.startTime) < now),
        }
    }, [sessions]);
    
    const handleCancelSession = async () => {
        if (!cancellingSession) return;
        
        const updated: Session = { ...cancellingSession, status: 'cancelled_patient' };
        
        try {
            const savedSession = await updateSession(updated);
            dispatch({ type: 'UPDATE_SESSION', payload: savedSession });
            toast('Sessão cancelada com sucesso.', 'success');
        } catch {
            toast('Não foi possível cancelar a sessão.', 'error');
        } finally {
            setCancellingSession(null);
        }
    }

    const handleRateSession = async (session: Session, rating: number) => {
        const updated: Session = { ...session, satisfaction: rating };
        try {
            const savedSession = await updateSession(updated);
            dispatch({ type: 'UPDATE_SESSION', payload: savedSession });
            toast('Avaliação enviada com sucesso!', 'success');
        } catch {
             toast('Não foi possível enviar sua avaliação.', 'error');
        }
    }

    const handlePaymentSuccess = (updatedSession: Session) => {
        dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
        setPayingSession(null);
        toast('Pagamento realizado com sucesso!', 'success');
    }

    if (loading) return <SessionsSkeleton />;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Próximas Sessões</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                    {upcomingSessions.length > 0 ? upcomingSessions.map(session => (
                        <SessionItem key={session.id} session={session} sessionTypes={sessionTypes} onCancel={() => setCancellingSession(session)} />
                    )) : (
                        <p className="text-center p-8 text-gray-500">Nenhuma sessão futura encontrada.</p>
                    )}
                </div>
            </div>
             <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Histórico de Sessões</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                    {pastSessions.length > 0 ? pastSessions.map(session => (
                        <SessionItem key={session.id} session={session} sessionTypes={sessionTypes} onRate={handleRateSession} onPay={setPayingSession}/>
                    )) : (
                        <p className="text-center p-8 text-gray-500">Nenhum histórico de sessões encontrado.</p>
                    )}
                </div>
            </div>
             {cancellingSession && (
                <Modal isOpen={true} onClose={() => setCancellingSession(null)} title="Cancelar Sessão">
                    <p>Tem certeza que deseja cancelar sua sessão de <span className="font-semibold">{sessionTypes.find(st => st.id === cancellingSession.sessionTypeId)?.name}</span> no dia {new Date(cancellingSession.startTime).toLocaleDateString('pt-BR')}?</p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setCancellingSession(null)}>Voltar</Button>
                        <Button variant="danger" onClick={handleCancelSession}>Sim, cancelar</Button>
                    </div>
                </Modal>
             )}
              {payingSession && (
                <PaymentModal
                    session={payingSession}
                    sessionType={sessionTypes.find(st => st.id === payingSession.sessionTypeId)}
                    onClose={() => setPayingSession(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

const SessionItem: React.FC<{
    session: Session, 
    sessionTypes: SessionType[], 
    onCancel?: () => void, 
    onRate?: (session: Session, rating: number) => void,
    onPay?: (session: Session) => void,
}> = ({ session, sessionTypes, onCancel, onRate, onPay }) => {
    const sessionType = sessionTypes.find(st => st.id === session.sessionTypeId);
    const sessionTypeName = sessionType?.name || 'Sessão';

    const isCancellable = session.status === 'scheduled' && onCancel;
    const isRateable = session.status === 'completed' && !session.satisfaction && onRate;
    const isPayable = session.status === 'completed' && session.paymentStatus === 'unpaid' && onPay;
    
    const hasBeenRated = session.status === 'completed' && session.satisfaction;

    return (
        <div className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${session.status === 'cancelled_patient' || session.status === 'no_show' ? 'opacity-60' : ''}`}>
            <div className="flex-grow">
                <p className={`font-semibold text-gray-800 ${session.status === 'cancelled_patient' || session.status === 'no_show' ? 'line-through' : ''}`}>{sessionTypeName}</p>
                <p className="text-sm text-gray-600">
                    {new Date(session.startTime).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
                 {isRateable && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Como você avalia esta sessão?</p>
                        <StarRating rating={0} onRate={(rating) => onRate(session, rating)} />
                    </div>
                 )}
                 {hasBeenRated && (
                     <div className="mt-2 flex items-center gap-2">
                        <p className="text-xs text-gray-500">Sua avaliação:</p>
                        <div className="flex">
                           {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < session.satisfaction! ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                        </div>
                    </div>
                 )}
            </div>
            <div className="flex items-center gap-4 self-end sm:self-center flex-wrap">
                {session.status === 'completed' && (
                     session.paymentStatus === 'paid' 
                        ? <span className="px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">Pago</span>
                        : <Button variant="primary" className="text-xs !py-1 !px-3" onClick={() => onPay?.(session)}>Pagar R${sessionType?.price.toFixed(2)}</Button>
                )}

                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge[session.status]}`}>
                    {statusText[session.status]}
                </span>
                {isCancellable && (
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 text-xs !py-1 !px-2" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
            </div>
        </div>
    )
}

const SessionsSkeleton = () => (
    <div className="space-y-8">
        <div>
            <Skeleton className="h-9 w-72 mb-4" />
            <div className="space-y-2 p-4 bg-white rounded-xl border">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        </div>
         <div>
            <Skeleton className="h-9 w-72 mb-4" />
            <div className="space-y-2 p-4 bg-white rounded-xl border">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        </div>
    </div>
)

const StarIcon: React.FC<{className: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

export default PatientSessionsView;