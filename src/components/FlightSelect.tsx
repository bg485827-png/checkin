import { Listbox } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import styles from './FlightSelect.module.css';

interface FlightSelectProps {
  value: string;
  onChange: (value: string) => void;
  flights: string[];
}

export function FlightSelect({ value, onChange, flights }: FlightSelectProps) {
  return (
    <div className={styles.listboxContainer}>
      <Listbox value={value} onChange={onChange}>
        <div className={styles.relative}>
          <Listbox.Button className={styles.button}>
            <span className={styles.buttonText}>
              {value || 'Select a flight'}
            </span>
            <ChevronDown size={18} className={styles.icon} />
          </Listbox.Button>

          <Listbox.Options className={styles.options}>
            {flights.map(flight => (
              <Listbox.Option
                key={flight}
                value={flight}
                className={({ active, selected }) =>
                  `${styles.option} ${active ? styles.active : ''} ${
                    selected ? styles.selected : ''
                  }`
                }
              >
                {flight}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
