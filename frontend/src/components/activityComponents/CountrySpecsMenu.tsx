import React from 'react';
import { useGameStore } from '../../store/GameStore';
import '../../styles/CountrySpecsMenu.css';

const CountrySpecsMenu: React.FC = () => {
    // Get necessary reactive states
    const localPlayerId = useGameStore((state) => state.localPlayerId);
    const playerCountries = useGameStore((state) => state.playerCountries);
    const empires = useGameStore((state) => state.empires);
    const empiresWars = useGameStore((state) => state.empiresWars);

    // Find the empire ID connected to the local player
    let localPlayerEmpireId: string | null = null;
    for (const [key, value] of Object.entries(playerCountries)) {
        if (value === localPlayerId) {
            localPlayerEmpireId = key;
            break;
        }
    }

    const empire = localPlayerEmpireId ? empires[localPlayerEmpireId] : null;

    const manpower = empire?.manpower || 0;
    const supplyLimit = empire?.supplyLimit || 0;

    // Calculate Wars Count
    const warsCount = localPlayerEmpireId && empiresWars[localPlayerEmpireId]
        ? empiresWars[localPlayerEmpireId].length
        : 0;


    // Helper to format large numbers nicely (e.g., 12.5M, 300K)
    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    if (!localPlayerEmpireId) {
        return null; // Don't show if the player hasn't selected a country
    }

    return (
        <div className="country-specs-menu">
            <div className="spec-item manpower">
                <span className="spec-value">{formatNumber(manpower)}</span>
                <span className="spec-label">Manpower</span>
            </div>

            <div className="spec-item supply">
                <span className="spec-value">{formatNumber(supplyLimit)}</span>
                <span className="spec-label">Supply Limit</span>
            </div>

            <div className="spec-item wars">
                <span className="spec-value">{warsCount}</span>
                <span className="spec-label">Wars</span>
            </div>
        </div>
    );
};

export default CountrySpecsMenu;
