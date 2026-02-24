import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.css';
import { useCheckInStore } from '../../store';
import { Trash2Icon } from 'lucide-react';
import { MusicPlayer } from '../../components/MusicPlayer';

type DisplayItem = {
  id: string;
  name: string;
  flightNumber: string;
};

const PAGE_SIZE = 5;

const ROW_DELAY_MS = 90;
const FLIP_DURATION_MS = 520;
const SWAP_AT_MS = FLIP_DURATION_MS / 2;

const PAGE_INTERVAL_MS = 3_000;

function toSlots(items: DisplayItem[]): Array<DisplayItem | null> {
  const slots: Array<DisplayItem | null> = Array(PAGE_SIZE).fill(null);
  for (let i = 0; i < PAGE_SIZE; i++) slots[i] = items[i] ?? null;
  return slots;
}

export function ListPage() {
  const checkIns = useCheckInStore((s) => s.checkIns);

  const listStatus = useCheckInStore((s) => s.listStatus);
  const listErrorMessage = useCheckInStore((s) => s.listErrorMessage);

  const fetchCheckIns = useCheckInStore((s) => s.fetchCheckIns);
  const deleteCheckIn = useCheckInStore((s) => s.deleteCheckIn);

  const [pageIndex, setPageIndex] = useState(0);

  const [displayedSlots, setDisplayedSlots] = useState<Array<DisplayItem | null>>(
    Array(PAGE_SIZE).fill(null)
  );

  const [isFlipping, setIsFlipping] = useState(false);
  const [rowSwapped, setRowSwapped] = useState<boolean[]>(
    Array(PAGE_SIZE).fill(false)
  );

  const nextSlotsRef = useRef<Array<DisplayItem | null>>(Array(PAGE_SIZE).fill(null));
  const timeoutsRef = useRef<number[]>([]);

  const pageIndexRef = useRef(0);
  const checkInsRef = useRef(checkIns);

  useEffect(() => {
    pageIndexRef.current = pageIndex;
  }, [pageIndex]);

  useEffect(() => {
    checkInsRef.current = checkIns;
  }, [checkIns]);

  const isLoading = listStatus === 'loading';

  useEffect(() => {
    fetchCheckIns().catch(() => {});
  }, [fetchCheckIns]);

  useEffect(() => {
    if (isFlipping) return;

    const list = checkIns;
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

    if (pageIndex >= totalPages) {
      setPageIndex(0);
      return;
    }

    const start = pageIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const items = list.slice(start, end).map((x) => ({
      id: x.id,
      name: x.name,
      flightNumber: x.flightNumber,
    }));

    setDisplayedSlots(toSlots(items));
  }, [checkIns, pageIndex, isFlipping]);

  function clearAllTimeouts() {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchCheckIns({ silent: true }).catch(() => {});

      const list = checkInsRef.current;
      const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
      if (totalPages <= 1) return;

      const current = pageIndexRef.current;
      const nextIndex = (current + 1) % totalPages;

      const start = nextIndex * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      const nextItems = list.slice(start, end).map((x) => ({
        id: x.id,
        name: x.name,
        flightNumber: x.flightNumber,
      }));

      nextSlotsRef.current = toSlots(nextItems);

      setIsFlipping(true);
      setRowSwapped(Array(PAGE_SIZE).fill(false));
      clearAllTimeouts();

      for (let i = 0; i < PAGE_SIZE; i++) {
        const delay = i * ROW_DELAY_MS;

        const tSwap = window.setTimeout(() => {
          setRowSwapped((prev) => {
            const copy = [...prev];
            copy[i] = true;
            return copy;
          });
        }, delay + SWAP_AT_MS);

        timeoutsRef.current.push(tSwap);
      }

      const lastDelay = (PAGE_SIZE - 1) * ROW_DELAY_MS;
      const tEnd = window.setTimeout(() => {
        setPageIndex(nextIndex);
        pageIndexRef.current = nextIndex;

        setDisplayedSlots(nextSlotsRef.current);
        setIsFlipping(false);
        setRowSwapped(Array(PAGE_SIZE).fill(false));
      }, lastDelay + FLIP_DURATION_MS);

      timeoutsRef.current.push(tEnd);
    }, PAGE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      clearAllTimeouts();
    };
  }, [fetchCheckIns]);

  const renderSlots = useMemo(() => {
    if (!isFlipping) return displayedSlots;

    const nextSlots = nextSlotsRef.current;
    return displayedSlots.map((curr, i) => (rowSwapped[i] ? nextSlots[i] : curr));
  }, [displayedSlots, isFlipping, rowSwapped]);

  return (
    <div className={styles.container}>
      {isLoading && <div>Loading list...</div>}

      {listStatus === 'error' && (
        <div style={{ color: 'tomato' }}>
          {listErrorMessage ?? 'Erro ao carregar lista'}
        </div>
      )}

      {!isLoading && checkIns.length > 0 && (
        <div className={styles.responsiveTable}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Flight</th>
              </tr>
            </thead>

            <tbody className={isFlipping ? styles.tbodyFlip : undefined}>
              {renderSlots.map((item, slotIndex) => (
                <tr key={slotIndex}>
                  {/* NAME: continua flipando o texto inteiro */}
                  <td>
                    <div
                      className={
                        isFlipping ? `${styles.flipInner} ${styles.flipGlow}` : undefined
                      }
                      style={
                        isFlipping
                          ? ({ ['--d' as any]: `${slotIndex * ROW_DELAY_MS}ms` } as any)
                          : undefined
                      }
                    >
                      {item?.name ?? ''}
                    </div>
                  </td>

                  {/* FLIGHT: flip só no texto, botão fora (fixo) */}
                  <td className={styles.flightCell}>
                    <div
                      className={
                        isFlipping ? `${styles.flipInner} ${styles.flipGlow}` : undefined
                      }
                      style={
                        isFlipping
                          ? ({ ['--d' as any]: `${slotIndex * ROW_DELAY_MS}ms` } as any)
                          : undefined
                      }
                    >
                      <span>{item?.flightNumber ?? ''}</span>
                    </div>

                    <button
                      className={styles.buttonTrash}
                      onClick={() => item && deleteCheckIn(item.id)}
                      aria-label="Delete"
                      title="Delete"
                      disabled={!item || isFlipping}
                      style={{ visibility: item ? 'visible' : 'hidden' }}
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

      {!isLoading && checkIns.length === 0 && listStatus !== 'error' && (
        <div>No check-ins yet.</div>
      )}

      <div style={{ marginTop: 'auto', width: '100%' }}>
        <MusicPlayer />
      </div>
    </div>
  );
}