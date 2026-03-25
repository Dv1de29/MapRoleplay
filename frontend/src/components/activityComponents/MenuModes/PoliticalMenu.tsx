import React from 'react';
import { useGameStore } from '../../../store/GameStore';
import '../../../styles/PoliticalMenu.css';
import { useDesignStore } from '../../../store/DesignStore';




function PoliticalMenu() {
    const { empires, playerCountries, players, getLocalPlayerEmpireId, isAllied } = useGameStore();

    const localPlayerEmpire = getLocalPlayerEmpireId();

    const getPlayerName = (countryId: string, isAI: boolean) => {
        const playerId = playerCountries[countryId];
        if (playerId) {
            const player = players.find(p => p.id === playerId);
            return player ? player.name : 'Unknown';
        }
        return isAI ? 'AI' : 'Uncontrolled';
    };

    const handleCountryClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log("Country clicked:", e);

        useDesignStore.getState().setSelectedEmpire(e.currentTarget.id);
        useDesignStore.getState().setMenuMode("EMPIRE")
    }

    return (
        <div className="political-menu-container">
            {/* <h2 className="political-menu-title">Political Menu</h2> */}
            <div className="countries-list">
                {Object.values(empires).map((empire) => (
                    <div key={empire.id} className="country-row" onClick={handleCountryClick}>
                        <div
                            className="country-initial"
                            style={{ backgroundColor: empire.color }}
                        >
                            {empire.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="country-info">
                            <span className="country-name">{empire.name}</span>
                            <span className="country-player">
                                {getPlayerName(empire.id, empire.isAI)}
                            </span>
                        </div>
                        {isAllied(localPlayerEmpire!, empire.id) && (<div className="alliance-box">
                            <div className="alliance-flag" title="Alliance with this empire">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#4ade80" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                    <line x1="4" x2="4" y1="22" y2="15"></line>
                                </svg>
                            </div>
                        </div>)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PoliticalMenu;