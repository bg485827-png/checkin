import { Link, useLocation } from 'react-router-dom';
import { Home, List, Music } from 'lucide-react';
import styles from './Navigation.module.css';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <Link
        to='/'
        className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
        title='Check-in'
      >
        <Home size={20} />
        <span>Check-in</span>
      </Link>
      <Link
        to='/list'
        className={`${styles.navLink} ${isActive('/list') ? styles.active : ''}`}
        title='Lista'
      >
        <List size={20} />
        <span>Lista</span>
      </Link>
      <Link
        to='/music'
        className={`${styles.navLink} ${isActive('/music') ? styles.active : ''}`}
        title='Música'
      >
        <Music size={20} />
        <span>Música</span>
      </Link>
    </nav>
  );
}
