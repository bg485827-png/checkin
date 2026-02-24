import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingPage } from '../LoadingPage/LoadingPage';
import { WelcomePage } from './WelcomePage';
import { useCheckInStore } from '../../store';

export function WelcomeWrapper() {
  const navigate = useNavigate();

  const status = useCheckInStore((s) => s.status);
  const errorMessage = useCheckInStore((s) => s.errorMessage);
  const pendingPromise = useCheckInStore((s) => s.pendingPromise);
  const resolvePending = useCheckInStore((s) => s.resolvePending);
  const resetRequest = useCheckInStore((s) => s.resetRequest);

  useEffect(() => {
    if (!pendingPromise && status === 'idle') {
      navigate('/');
      return;
    }

    if (pendingPromise && status === 'loading') {
      resolvePending(pendingPromise).catch(() => {
      });
    }
  }, [pendingPromise, resolvePending, status, navigate]);

  if (status === 'loading') {
    return <LoadingPage />;
  }

  if (status === 'error') {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ marginBottom: 8 }}>Não deu pra concluir o check-in.</p>
        <p style={{ color: 'tomato', marginBottom: 16 }}>
          {errorMessage ?? 'Erro desconhecido'}
        </p>

        <button
          onClick={() => {
            resetRequest();
            navigate('/');
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  return <WelcomePage />;
}