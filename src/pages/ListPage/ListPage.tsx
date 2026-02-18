import styles from './styles.module.css';
import { useCheckInStore } from '../../store';
import { Trash2Icon } from 'lucide-react';
import { MusicPlayer } from '../../components/MusicPlayer';

export function ListPage() {
  const checkIns = useCheckInStore(s => s.checkIns);
  const removeCheckIn = useCheckInStore(s => s.removeCheckIn);

  return (
    <div className={styles.container}>
      {checkIns.length > 0 && (
        <div className={styles.responsiveTable}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Flight</th>
              </tr>
            </thead>
            <tbody>
              {checkIns.map(({ name, flight }, index) => (
                <tr key={`${name}-${flight}-${index}`}>
                  <td>{name}</td>
                  <td className={styles.flightCell}>
                    <span>{flight}</span>
                    <button
                      className={styles.buttonTrash}
                      onClick={() => removeCheckIn(index)}
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 'auto', width: '100%' }}>
        <MusicPlayer />
      </div>
    </div>
  );
}
