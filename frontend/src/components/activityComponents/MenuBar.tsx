import { useState } from "react";

import PoliticalMenu from "./MenuModes/PoliticalMenu";
import ChatMenu from "./MenuModes/ChatMenu";
import AllianceMenu from "./MenuModes/AllianceMenu";
import EmpireMenu from "./MenuModes/EmpireMenu";

import "../../styles/MenuBar.css";
import { useGameStore } from "../../store/GameStore";
import { useDesignStore } from "../../store/DesignStore";

const MenuBar = () => {
    const isOpen = useDesignStore((state) => state.isMenuOpen);
    const setIsOpen = useDesignStore((state) => state.toggleMenu);

    const menuMode = useDesignStore((state) => state.menuMode);
    const setMenuMode = useDesignStore((state) => state.setMenuMode);

    const handleLeaveGame = () => {
        useGameStore.getState().leaveGame();
    };

    return (
        <>
            <div
                className="burger-menu"
                style={{ display: isOpen ? 'none' : 'flex' }}
                onClick={() => setIsOpen(true)}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                    <path d="M4 6H20M4 12H20M4 18H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className={`menu-bar ${isOpen ? 'open' : ''}`}>
                <div className="menu-bar-header">
                    <h2>Menu</h2>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                            <path d="M6 18L18 6M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <div className="menu-options-list">
                    <button className="menu-option-btn btn-political" onClick={() => setMenuMode('POLITICAL')}>P</button>
                    <button className="menu-option-btn btn-chat" onClick={() => setMenuMode('CHAT')}>C</button>
                    <button className="menu-option-btn btn-alliance" onClick={() => setMenuMode('ALLIANCE')}>A</button>
                    <button className="menu-option-btn btn-empire" onClick={() => setMenuMode('EMPIRE')}>E</button>
                </div>
                <div className={`menu-bar-content ${menuMode === 'CHAT' ? 'no-scroll' : ''}`}>
                    {/* Add any menu items here */}
                    {menuMode === 'POLITICAL' && <PoliticalMenu />}
                    {menuMode === 'CHAT' && <ChatMenu />}
                    {menuMode === 'ALLIANCE' && <AllianceMenu />}
                    {menuMode === 'EMPIRE' && <EmpireMenu />}
                </div>

                {/* <button className="leave-btn" onClick={handleLeaveGame}>
                    Leave Game
                </button> */}
            </div>
        </>
    )
}

export default MenuBar;