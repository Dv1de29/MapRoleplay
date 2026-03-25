import { create } from 'zustand';

import type { PlayerInterface } from '../types/LobbyTypes';
import { ProvinceInterface } from '../types/MapTypes';

// --- TYPES ---
export type GamePhase = 'MAIN_MENU' | 'LOBBY' | 'PLAYING';

export interface Empire {
    id: string;
    name: string;
    color: string;
    provinces: ProvinceInterface[];
    isAI: boolean; // Crucial for when we hook up WebLLM later!
}

interface GameState {
    // 1. Networking State
    gamePhase: GamePhase;
    roomCode: string | null;
    isHost: boolean;

    mapName: string;
    timePeriod: string;

    maxPlayers: number;
    players: PlayerInterface[];
    allReadyPlayers: boolean;
    localPlayerId: string | null;

    playerCountries: Record<string, string>; // Maps countryId -> playerId

    // 2. Game Engine State
    empires: Record<string, Empire>;
    provinceOwners: Record<string, string | null>;
    provinces: Record<string, ProvinceInterface>;

    empiresAlliance: Record<string, string[]>

}

interface GameActions {
    // Networking Actions
    setGamePhase: (phase: GamePhase) => void;
    hostNewGame: () => void;
    joinGame: (code: string) => void;
    leaveGame: () => void;

    // Player Actions
    setLocalPlayerId: (id: string | null) => void;
    setPlayerCountry: (playerId: string, countryId: string | null) => void;
    setPlayerReady: (playerId: string, isReady: boolean) => void;

    // Game Engine Actions
    setProvinceOwner: (provinceId: string, empireId: string | null) => void;
    initGameState: (empires: Record<string, Empire>, initialOwners: Record<string, string>, provinces: Record<string, ProvinceInterface>) => void;


    // Utility Actions
    getEmpireColor: (empireId: string | null) => string;
    getProvinceOwner: (provinceId: string) => string | null;
    getPlayerCountry: (empireId: string) => string;


    /// setting Time and Map
    setMapName: (mapName: string) => void;
    setTimePeriod: (timePeriod: string) => void;

    /// get Empire's
    getLocalPlayerEmpireId: () => string | null;
    getCountryInProvince: (provinceId: string) => string | null;
    getTotalPopulation: (empireId: string) => number;
    getAverageArableLand: (empireId: string) => number;


    ///aliances
    setAlliance: (empire1: string, empire2: string) => void
    dissolveAlliance: (empire1: string, empire2: string) => void
    getAlliances: (empire1: string) => string[]
    isAllied: (empire1: string, empire2: string) => boolean,
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
    // --- INITIAL STATE ---
    gamePhase: 'MAIN_MENU',
    roomCode: null,
    isHost: false,

    mapName: "Vic_Europe",
    timePeriod: "WW1_Europe",

    maxPlayers: 4,
    players: [],
    allReadyPlayers: false,
    localPlayerId: null,

    playerCountries: {},

    empires: {},
    provinceOwners: {},
    provinces: {},

    empiresAlliance: {},


    ////hard reset of the state:
    resetGame: () => {
        set({
            gamePhase: 'MAIN_MENU',
            roomCode: null,
            isHost: false,

            mapName: "Vic_Europe",
            timePeriod: "WW1_Europe",

            maxPlayers: 4,
            players: [],
            allReadyPlayers: false,
            localPlayerId: null,

            playerCountries: {},

            empires: {},
            provinceOwners: {},
            provinces: {},

            empiresAlliance: {},
        })
    },


    // --- NETWORKING ACTIONS ---
    setGamePhase: (phase) => set({ gamePhase: phase }),

    hostNewGame: () => {
        const dummyCode = "XYZ-" + Math.floor(Math.random() * 1000);
        const hostId = "Host-" + Math.floor(Math.random() * 1000);
        set({
            gamePhase: 'LOBBY',
            roomCode: dummyCode,
            isHost: true,
            localPlayerId: hostId,
            players: [{ id: hostId, name: 'Host', isHost: true, isReady: false, countryId: null }]
        });

        const MOCK_MAP = "Vic_Europe";
    },

    joinGame: (code) => {
        const dummyId = "Guest-" + Math.floor(Math.random() * 1000);
        set((state) => ({
            gamePhase: 'LOBBY',
            roomCode: code,
            isHost: false,
            localPlayerId: dummyId,
            players: [...state.players, { id: dummyId, name: 'Guest', isHost: false, isReady: false, countryId: null }]
        }));
    },

    leaveGame: () => {
        set({ gamePhase: 'MAIN_MENU', roomCode: null, isHost: false, localPlayerId: null, players: [], playerCountries: {} });
    },

    setLocalPlayerId: (id) => set({ localPlayerId: id }),

    setPlayerCountry: (playerId, countryId) => {
        set((state) => {
            const newPlayerCountries = { ...state.playerCountries };

            // Remove old country if the player had one
            const player = state.players.find(p => p.id === playerId);

            if (!player) {
                console.error("Player not found!");
                return state;
            }

            if (player.countryId) {
                delete newPlayerCountries[player.countryId];
            }

            // Assign new country
            if (countryId) {
                newPlayerCountries[countryId] = playerId;
            }

            return {
                players: state.players.map(p =>
                    p.id === playerId ? { ...p, countryId, isReady: false } : p
                ),
                playerCountries: newPlayerCountries
            };
        });
    },

    setPlayerReady: (playerId, isReady) => {
        set((state) => ({
            players: state.players.map(p => p.id === playerId ? { ...p, isReady } : p)
        }));
    },

    // --- GAME ENGINE ACTIONS ---

    // Call this when the game officially transitions from LOBBY to PLAYING
    initGameState: (empires, initialOwners, provinces) => {
        set({
            empires: empires,
            provinceOwners: initialOwners,
            provinces: provinces
        });
    },

    // Call this when an army conquers a province!
    setProvinceOwner: (provinceId, empireId) => {
        set((state) => ({
            provinceOwners: {
                ...state.provinceOwners,
                [provinceId]: empireId
            }
        }));
    },

    // A helper to instantly resolve the color of a province owner
    getEmpireColor: (empireId) => {
        if (!empireId) return "#E0E0E0"; // Default neutral gray

        const empire = get().empires[empireId];
        return empire ? empire.color : "#E0E0E0";
    },

    getProvinceOwner: (provinceId) => {
        return get().provinceOwners[provinceId];
    },

    getPlayerCountry: (empireId) => {
        return get().playerCountries[empireId] || "AI";
    },

    setMapName: (mapName) => set({ mapName }),
    setTimePeriod: (timePeriod) => set({ timePeriod }),



    /// this will return the localPlayer's empireId
    getLocalPlayerEmpireId: () => {
        const localPlayerId = get().localPlayerId;
        const playerCountries = get().playerCountries;

        console.log(localPlayerId);
        console.log(playerCountries);

        for (const [key, value] of Object.entries(playerCountries)) {
            if (value === localPlayerId) {
                return key;
            }
        }

        return null;
    },

    getCountryInProvince: (provinceId) => {
        return get().provinceOwners[provinceId]
    },

    getTotalPopulation: (empireId) => {
        if (!empireId) return 0;

        const provinces = get().provinces;
        const provinceOwners = get().provinceOwners;

        let totalPopulation = 0;

        for (const [provinceId, ownerId] of Object.entries(provinceOwners)) {
            if (ownerId === empireId) {
                // population is soemthing like 12K or 12M so we need string splitting
                const popString = provinces[provinceId].pops;
                const popValue = Number(popString.slice(0, -1));
                const popUnit = popString.slice(-1);

                if (popUnit === 'K') {
                    totalPopulation += popValue * 1000;
                } else if (popUnit === 'M') {
                    totalPopulation += popValue * 1000000;
                } else {
                    totalPopulation += popValue;
                }
            }
        }

        return totalPopulation;
    },

    getAverageArableLand: (empireId) => {
        if (!empireId) return 0;

        const provinces = get().provinces;
        const provinceOwners = get().provinceOwners;

        let totalArableLand = 0;
        let provinceCount = 0;

        for (const [provinceId, ownerId] of Object.entries(provinceOwners)) {
            if (ownerId === empireId) {
                totalArableLand += Number(provinces[provinceId].arable_land);
                provinceCount++;
            }
        }

        return provinceCount > 0 ? totalArableLand / provinceCount : 0;
    },


    ///aliances
    setAlliance: (empire1, empire2) => {
        set((state) => {
            const alliances1 = state.empiresAlliance[empire1] || [];
            const alliances2 = state.empiresAlliance[empire2] || [];

            // Add each other if they aren't already allied
            const newAlliances1 = alliances1.includes(empire2) ? alliances1 : [...alliances1, empire2];
            const newAlliances2 = alliances2.includes(empire1) ? alliances2 : [...alliances2, empire1];

            return {
                empiresAlliance: {
                    ...state.empiresAlliance,
                    [empire1]: newAlliances1,
                    [empire2]: newAlliances2
                }
            };
        });
    },

    dissolveAlliance: (empire1, empire2) => {
        set((state) => {
            const alliances1 = state.empiresAlliance[empire1] || [];
            const alliances2 = state.empiresAlliance[empire2] || [];

            return {
                empiresAlliance: {
                    ...state.empiresAlliance,
                    [empire1]: alliances1.filter(id => id !== empire2),
                    [empire2]: alliances2.filter(id => id !== empire1)
                }
            };
        });
    },

    getAlliances: (empire1) => {
        return get().empiresAlliance[empire1];
    },

    isAllied: (empire1, empire2) => {
        const empiresAlliance = get().empiresAlliance;
        if (!empiresAlliance[empire1]) return false;
        return empiresAlliance[empire1].includes(empire2);
    }
}));