import { create } from 'zustand';

import type { PlayerInterface } from '../types/LobbyTypes';
import type { ProvinceInterface, ArmiesInterface, MapAdjacencyList, Empire } from '../types/MapTypes';
import { useDesignStore } from './DesignStore';
import { getPopulationString, parsePopString } from '../utils/utils';

// --- TYPES ---
export type GamePhase = 'MAIN_MENU' | 'LOBBY' | 'PLAYING';



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

    adjacencies: MapAdjacencyList;
    armies: Record<string, ArmiesInterface>;

    empiresAlliance: Record<string, string[]>

    empiresWars: Record<string, string[]>
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
    initGameState: (empires: Record<string, Empire>, initialOwners: Record<string, string>, provinces: Record<string, ProvinceInterface>, adjacencies: MapAdjacencyList, armies: Record<string, ArmiesInterface>) => void;
    recalculateCountryStats: () => void;


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
    getTotalArableLand: (empireId: string) => number;


    ///aliances
    setAlliance: (empire1: string, empire2: string) => void
    dissolveAlliance: (empire1: string, empire2: string) => void
    getAlliances: (empire1: string) => string[]
    isAllied: (empire1: string, empire2: string) => boolean,

    //wars
    setWar: (empire1: string, empire2: string) => void,
    removeWar: (empire1: string, empire2: string) => void,
    isAtWar: (empire1: string, empire2: string) => boolean,

    /// armies
    spawnArmy: (provinceId: string, strength: number) => void,
    modifyArmy: (armyId: string, newArmy: ArmiesInterface) => void,
    removeArmy: (armyId: string) => void,

    moveArmy: (armyId: string, targetProvinceId: string) => void,
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

    adjacencies: { adj: {} },
    armies: {},

    empiresAlliance: {},
    empiresWars: {},


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

            adjacencies: { adj: {} },
            armies: {},

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
        useDesignStore.getState().resetDesign();

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
    initGameState: (empires, initialOwners, provinces, adjacencies, armies) => {
        set({
            empires: empires,
            provinceOwners: initialOwners,
            provinces: provinces,
            adjacencies: adjacencies,
            armies: armies
        });
        get().recalculateCountryStats();
    },

    recalculateCountryStats: () => {
        const { empires, provinces, provinceOwners } = get();
        const updatedEmpires = { ...empires };

        // Reset stats
        for (const empireId of Object.keys(updatedEmpires)) {
            updatedEmpires[empireId] = {
                ...updatedEmpires[empireId],
                manpower: 0,
                supplyLimit: 0
            };
        }

        // Calculate based on provinces
        for (const [provinceId, ownerId] of Object.entries(provinceOwners)) {
            if (ownerId && updatedEmpires[ownerId] && provinces[provinceId]) {
                const popString = provinces[provinceId].pops || "0";
                const lastChar = popString.slice(-1).toUpperCase();

                let popNum = 0;
                if (lastChar === 'K') {
                    popNum = Number(popString.slice(0, -1)) * 1000;
                } else if (lastChar === 'M') {
                    popNum = Number(popString.slice(0, -1)) * 1000000;
                } else {
                    popNum = Number(popString);
                }

                const arableLand = Number(provinces[provinceId].arable_land || 0);

                // Add to empire
                updatedEmpires[ownerId].manpower += Math.floor(popNum * 0.05); // 5% conscription
                updatedEmpires[ownerId].supplyLimit += arableLand * 1000;      // 1000 per arable land
            }
        }

        set({ empires: updatedEmpires });
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

    getTotalArableLand: (empireId) => {
        if (!empireId) return 0;

        const provinces = get().provinces;
        const provinceOwners = get().provinceOwners;

        let totalArableLand = 0;

        for (const [provinceId, ownerId] of Object.entries(provinceOwners)) {
            if (ownerId === empireId) {
                totalArableLand += Number(provinces[provinceId].arable_land);
            }
        }

        return totalArableLand;
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
    },


    ///wars
    setWar: (empire1, empire2) => {
        set((state) => {
            const wars1 = state.empiresWars[empire1] || [];
            const wars2 = state.empiresWars[empire2] || [];

            const newWars1 = wars1.includes(empire2) ? wars1 : [...wars1, empire2];
            const newWars2 = wars2.includes(empire1) ? wars2 : [...wars2, empire1];

            return {
                empiresWars: {
                    ...state.empiresWars,
                    [empire1]: newWars1,
                    [empire2]: newWars2
                }
            };
        });
    },

    removeWar: (empire1, empire2) => {
        set((state) => {
            const wars1 = state.empiresWars[empire1] || [];
            const wars2 = state.empiresWars[empire2] || [];

            return {
                empiresWars: {
                    ...state.empiresWars,
                    [empire1]: wars1.filter(id => id !== empire2),
                    [empire2]: wars2.filter(id => id !== empire1)
                }
            };
        });
    },

    isAtWar: (empire1, empire2) => {
        const empiresWars = get().empiresWars;
        if (!empiresWars[empire1]) return false;
        return empiresWars[empire1].includes(empire2);
    },


    ///armies
    spawnArmy: (provinceId, armyStrength) => {

        const state = get();
        const owner = state.provinceOwners[provinceId];


        if (!owner) {
            return;
        }

        const newOwnerEmpire = { ...state.empires[owner] };

        if (newOwnerEmpire.manpower < armyStrength) {
            console.log("Not enough Manpower Reserve to spawn army!");
            return;
        }

        console.log(newOwnerEmpire.manpower, armyStrength);

        newOwnerEmpire.manpower -= armyStrength;

        const provinces = { ...state.provinces };

        // 1. Gather eligible provinces for proportional taxation
        const eligibleProvinces: { id: string; popNum: number }[] = [];
        let totalEligiblePop = 0;

        for (const [id, provOwner] of Object.entries(state.provinceOwners)) {
            if (provOwner === owner && provinces[id]) {
                const popNum = parsePopString(provinces[id].pops);
                // Proportional Taxation logic: ignore tiny provinces entirely
                if (popNum >= 1000) {
                    eligibleProvinces.push({ id, popNum });
                    totalEligiblePop += popNum;
                }
            }
        }

        // Prevent crashes or cheating
        if (totalEligiblePop < armyStrength) {
            console.log("Not enough population in eligible provinces to spawn army!");
            return;
        }

        // 2. Perform proportional deduction smoothly avoiding decimals
        let remainingToDeduct = armyStrength;

        // Sort descending so the most populated areas absorb any fractional rounding hits
        eligibleProvinces.sort((a, b) => b.popNum - a.popNum);

        for (let i = 0; i < eligibleProvinces.length; i++) {
            const prov = eligibleProvinces[i];

            let deduction = 0;
            // The last province absorbs the rest of the deduction to avoid fractional loss
            if (i === eligibleProvinces.length - 1) {
                deduction = remainingToDeduct;
            } else {
                const weight = prov.popNum / totalEligiblePop;
                deduction = Math.floor(armyStrength * weight);
            }

            // Final safety catch
            deduction = Math.min(deduction, remainingToDeduct);

            const newPop = prov.popNum - deduction;

            provinces[prov.id] = {
                ...provinces[prov.id],
                pops: getPopulationString(newPop)
            };

            remainingToDeduct -= deduction;
            if (remainingToDeduct <= 0) break;
        }

        // 3. Create army and inject updated provinces back into state
        set((currentState) => {
            const newArmy: ArmiesInterface = {
                id: `army-${Date.now()}`,
                name: "Army",
                strength: armyStrength,
                location: provinceId,
                owner: owner
            };

            return {
                ...currentState,
                provinces: provinces,
                armies: {
                    ...currentState.armies,
                    [newArmy.id]: newArmy
                },
                empires: {
                    ...currentState.empires,
                    [owner]: newOwnerEmpire
                }
            };
        });

        // 4. Force recalculation of country stats (manpower drops instantly!)
        // get().recalculateCountryStats();
    },

    modifyArmy: (armyId, newArmy) => {
        set((state) => ({
            armies: {
                ...state.armies,
                [armyId]: newArmy
            }
        }));
    },

    removeArmy: (armyId) => {
        const army = get().armies[armyId];

        if (!army) {
            return;
        }

        set((state) => {
            const newArmies = { ...state.armies };
            delete newArmies[armyId];
            return { armies: newArmies };
        });
    },

    moveArmy: (armyId, targetProvinceId) => {
        const army = get().armies[armyId];

        if (!army) {
            return;
        }

        const targetProvince = get().provinces[targetProvinceId];
        if (!targetProvince) {
            console.log("Target province not found!")
            return;
        }

        const targetOwner = get().provinceOwners[targetProvinceId];
        if (!targetOwner || targetOwner !== army.owner) {
            return;
        }

        set((state) => {
            const army = state.armies[armyId];
            if (!army) return state;

            return {
                armies: {
                    ...state.armies,
                    [armyId]: {
                        ...army,
                        location: targetProvinceId
                    }
                }
            };
        });
    },

}));