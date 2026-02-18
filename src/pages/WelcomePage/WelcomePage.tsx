import styles from './styles.module.css';
import { Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div>You’re cleared for departure, carry your story with you.</div>
      <img className={styles.img} src='/caixa.png'/>
      <button className={styles.button} onClick={() => navigate('/')}>
        <span>CHECK IN</span>
        <Plane size={18} />
      </button>
    </div>
  );
}
