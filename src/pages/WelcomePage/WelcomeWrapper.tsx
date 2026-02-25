import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingPage } from '../LoadingPage/LoadingPage';
import { WelcomePage } from './WelcomePage';
import { useCheckInStore } from '../../store';

const WELCOME_IMAGE_SRC = '/caixa.png';

export function WelcomeWrapper() {
  const navigate = useNavigate();

  const status = useCheckInStore((s) => s.status);
  const errorMessage = useCheckInStore((s) => s.errorMessage);
  const pendingPromise = useCheckInStore((s) => s.pendingPromise);
  const resolvePending = useCheckInStore((s) => s.resolvePending);
  const resetRequest = useCheckInStore((s) => s.resetRequest);
  const [imageReady, setImageReady] = useState(false);
  const [canShowWelcome, setCanShowWelcome] = useState(false);
  const preloadStartedRef = useRef(false);

  useEffect(() => {
    if (!pendingPromise && status === 'idle') {
      navigate('/');
      return;
    }

    if (pendingPromise && status === 'loading') {
      resolvePending(pendingPromise).catch(() => {});
    }
  }, [pendingPromise, resolvePending, status, navigate]);

  useEffect(() => {
    if (status === 'loading' || status === 'error') return;
    if (preloadStartedRef.current) return;

    preloadStartedRef.current = true;

    const img = new Image();
    img.src = WELCOME_IMAGE_SRC;

    if (img.complete) {
      setImageReady(true);
      return;
    }

    img.onload = () => setImageReady(true);
    img.onerror = () => {
      setImageReady(true);
    };
  }, [status]);
  useEffect(() => {
    if (status === 'loading') {
      setCanShowWelcome(false);
      return;
    }

    if (status === 'error') {
      setCanShowWelcome(false);
      return;
    }

    if (imageReady) {
      const t = window.setTimeout(() => setCanShowWelcome(true), 16);
      return () => window.clearTimeout(t);
    }
  }, [status, imageReady]);

  if (status === 'loading' || !canShowWelcome) {
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