import React from 'react';
import '../../../styles/AllianceMenu.css';
import { useGameStore } from '../../../store/GameStore';

function AllianceMenu() {
    const localEmpireId = useGameStore.getState().getLocalPlayerEmpireId();
    const empiresAlliance = useGameStore(state => state.empiresAlliance);
    const empires = useGameStore(state => state.empires);

    // Default to empty array if no alliances exist yet
    const myAlliances = localEmpireId ? (empiresAlliance[localEmpireId] || []) : [];
    // Map alliance IDs to the actual empire objects
    const alliedEmpires = myAlliances.map(id => empires[id]).filter(Boolean);

    return (
        <div className="alliance-menu-container">
            <h2 className="alliance-menu-title">My Alliances</h2>
            
            <div className="alliances-list">
                {alliedEmpires.length === 0 ? (
                    <div className="alliance-empty-state">No active alliances.</div>
                ) : (
                    alliedEmpires.map(empire => (
                        <div key={empire.id} className="alliance-item">
                            <div 
                                className="alliance-avatar" 
                                style={{ backgroundColor: empire.color }}
                                title={empire.name}
                            >
                                {empire.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="alliance-info">
                                <span className="alliance-name">{empire.name}</span>
                            </div>
                            <button 
                                className="dissolve-btn" 
                                onClick={() => useGameStore.getState().dissolveAlliance(localEmpireId!, empire.id)}
                                title={`Dissolve Alliance with ${empire.name}`}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default AllianceMenu;