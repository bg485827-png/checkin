import { useMemo, useState } from 'react';
import { Plane } from 'lucide-react';
import styles from './styles.module.css';
import { useCheckInStore } from '../../store';
import { useNavigate } from 'react-router-dom';

const FLIGHTS = [
  'BR1888',
  'JP1908',
  'EU1938',
  'NK1988',
  'EU2022',
  'PH2013',
  'UN1951',
  'US2003',
];

export function CheckInPage() {
  const navigate = useNavigate();

  const startCheckIn = useCheckInStore((s) => s.startCheckIn);

  const [name, setName] = useState('');
  const [flight, setFlight] = useState('');

  const isFormValid = useMemo(() => {
    return name.trim() !== '' && flight.trim() !== '';
  }, [name, flight]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    startCheckIn({
      name: name.trim(),
      flightNumber: flight.trim(),
    });
    navigate('/welcome');
    setName('');
    setFlight('');
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <div>Welcome to Way Back Home</div>
        <div>Please enter your name and select your flight option below</div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <label htmlFor="name">Enter your full name</label>
          <input
            className={styles.input}
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="off"
          />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="flight">Flights</label>
          <select
            className={`${styles.input} ${!flight ? styles.placeholder : ''}`}
            id="flight"
            value={flight}
            onChange={(e) => setFlight(e.target.value)}
          >
            <option value="" disabled hidden>
              Select a flight
            </option>

            {FLIGHTS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <button className={styles.button} type="submit" disabled={!isFormValid}>
            <span>CHECK IN</span>
            <Plane size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}