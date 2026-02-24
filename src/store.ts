import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from './lib/api';

export type CheckIn = {
  id: string;
  name: string;
  flightNumber: string;
  createdAt: number;
};

type CheckInPayload = {
  name: string;
  flightNumber: string;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

function waitMs(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

type CheckInState = {
  checkIns: CheckIn[];
  status: Status;
  errorMessage: string | null;
  pendingPromise: Promise<CheckIn> | null;

  startCheckIn: (payload: CheckInPayload) => void;
  resolvePending: (promise: Promise<CheckIn>) => Promise<void>;
  resetRequest: () => void;

  listStatus: Status;
  listErrorMessage: string | null;

  fetchCheckIns: (opts?: { silent?: boolean }) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;

  clearCheckIns: () => void;
};

type PersistedSlice = Pick<CheckInState, 'checkIns'>;

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      checkIns: [],

      status: 'idle',
      errorMessage: null,
      pendingPromise: null,

      startCheckIn: (payload) => {
        set({ status: 'loading', errorMessage: null });

        const promise = api
          .post<CheckIn>('/items', payload)
          .then((r) => r.data);

        set({ pendingPromise: promise });
      },

      resolvePending: async (promise) => {
        try {
          const [created] = await Promise.all([promise, waitMs(4000)]);
          if (get().pendingPromise !== promise) return;

          set((state) => ({
            checkIns: [...state.checkIns, created],
            status: 'success',
            errorMessage: null,
            pendingPromise: null,
          }));
        } catch (err: any) {
          await waitMs(4000);
          if (get().pendingPromise !== promise) return;

          const msg =
            err?.response?.data?.error ||
            err?.message ||
            'Falha ao enviar check-in';

          set({
            status: 'error',
            errorMessage: msg,
            pendingPromise: null,
          });

          throw err;
        }
      },

      resetRequest: () =>
        set({
          status: 'idle',
          errorMessage: null,
          pendingPromise: null,
        }),

      listStatus: 'idle',
      listErrorMessage: null,

      fetchCheckIns: async (opts) => {
        const silent = opts?.silent ?? false;
        if (!silent) set({ listStatus: 'loading', listErrorMessage: null });

        try {
          const { data } = await api.get<CheckIn[]>('/items');

          set({
            checkIns: data,
            listStatus: 'success',
            listErrorMessage: null,
          });
        } catch (err: any) {
          const msg =
            err?.response?.data?.error ||
            err?.message ||
            'Falha ao carregar lista';

          set({
            listStatus: 'error',
            listErrorMessage: msg,
          });

          throw err;
        }
      },

      deleteCheckIn: async (id) => {
        const prev = get().checkIns;
        set({ checkIns: prev.filter((c) => c.id !== id) });

        try {
          await api.delete(`/items/${id}`);
        } catch (err: any) {
          set({ checkIns: prev });

          const msg =
            err?.response?.data?.error ||
            err?.message ||
            'Falha ao deletar item';

          set({ listStatus: 'error', listErrorMessage: msg });
          throw err;
        }
      },

      clearCheckIns: () => set({ checkIns: [] }),
    }),
    {
      name: 'CheckInStateStorage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state): PersistedSlice => ({
        checkIns: state.checkIns,
      }),
    }
  )
);