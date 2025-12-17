import { create } from 'zustand';

type NetworkState = {
    isOnline: boolean;
    setOnline: (value: boolean) => void;
    toggle: () => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
    isOnline: true, // assume online by default
    setOnline: (value) => set({ isOnline: value }),
    toggle: () => set((s) => ({ isOnline: !s.isOnline })),
}));
