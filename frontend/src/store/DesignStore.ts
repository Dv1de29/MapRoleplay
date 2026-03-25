import { create } from 'zustand';

interface DesignState {
    // Menus and Modals
    isMenuOpen: boolean;
    isChatOpen: boolean;

    // In-Game UI Context
    // Moving selectedProvince here is actually a smart optimization!
    // Player 2 doesn't need to know what you are clicking on until you confirm an order.
    selectedProvince: string | null;
    selectedEmpire: string | null;

    menuMode: 'POLITICAL' | 'CHAT' | 'ALLIANCE' | 'EMPIRE';

    // Map View Modes (e.g., viewing Political Map vs. Economic Map)
    mapMode: 'POLITICAL' | 'ECONOMIC' | 'POPULATION';
}

interface DesignActions {
    toggleMenu: (newValue?: boolean) => void;
    setChatOpen: (isOpen: boolean) => void;
    setSelectedProvince: (id: string | null) => void;
    setSelectedEmpire: (id: string | null) => void;
    setMenuMode: (mode: 'POLITICAL' | 'CHAT' | 'ALLIANCE' | 'EMPIRE') => void;
    setMapMode: (mode: 'POLITICAL' | 'ECONOMIC' | 'POPULATION') => void;
}

export const useDesignStore = create<DesignState & DesignActions>((set) => ({
    isMenuOpen: false,
    isChatOpen: false,
    selectedProvince: null,
    selectedEmpire: null,
    menuMode: 'POLITICAL',
    mapMode: 'POLITICAL',

    toggleMenu: (newValue?) => {
        if (!newValue) {
            set((state) => ({ isMenuOpen: !state.isMenuOpen }))
        } else {
            set({ isMenuOpen: newValue })
        }
    },
    setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
    setSelectedProvince: (id) => set({ selectedProvince: id }),
    setSelectedEmpire: (id) => set({ selectedEmpire: id }),
    setMenuMode: (mode) => set({ menuMode: mode }),
    setMapMode: (mode) => set({ mapMode: mode }),
}));