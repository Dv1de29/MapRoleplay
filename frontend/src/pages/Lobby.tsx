
import { useEffect } from 'react';
import CountrySelector from '../components/CountrySelector';
import Player from '../components/MainMenu/Player';
import { useGameStore } from '../store/GameStore';
import '../styles/Lobby.css';

import { getLobbyStatusText } from '../utils/LobbyUtils/utils';
import { parseMapOwners, parseMapProvinces } from '../utils/mapParser';
import type { MapAdjacencyList, ArmiesInterface } from '../types/MapTypes';
import adjacenciesJson from '../data/maps/Vic_Europe_neib.json';

/// with this we get the csv file for the map
import { getMapDataFilePath, getMapValueFilePath } from '../utils/LobbyUtils/mapsAvailable';
import { initAI } from '../ai-worker/aiService';



const Lobby = () => {

    const players = useGameStore((state) => state.players);
    const maxPlayers = useGameStore((state) => state.maxPlayers);

    const controller = useGameStore.getState();

    const { text: lobbyStatusText, color: lobbyStatusColor } = getLobbyStatusText(players, maxPlayers);

    // !!!!!!!!!!! this will later come from a parameter passed to the Lobby component
    const mapName = useGameStore((state) => state.mapName);
    const timePeriod = useGameStore((state) => state.timePeriod);
    // const TimePeriod = "WW2_Europe";
    // const TimePeriod = "Napoleonic_Europe";

    useEffect(() => {
        ///getting provinces Owners and colors
        const csvText = getMapDataFilePath(timePeriod);
        const { empires, provinceOwners } = parseMapOwners(csvText);
        console.log(`Initializing mapColors wiht ${empires} and ${provinceOwners}`)

        const csvProvinces = getMapValueFilePath(timePeriod);
        const { provinces } = parseMapProvinces(csvProvinces, empires, provinceOwners);
        console.log(`Initializing provinces wiht ${provinces}`)

        const adjData = adjacenciesJson as Record<string, string[]>;
        const adjacencyList: MapAdjacencyList = { adj: adjData };

        useGameStore.getState().initGameState(empires, provinceOwners, provinces, adjacencyList, {});
    }, [timePeriod]);


    const handleStartGame = () => {
        console.log('Start game');
        controller.setGamePhase('PLAYING');
        initAI((progress) => {
            console.log(progress)
            console.log("Loading the LLM");
        })
    }

    const localPlayerId = useGameStore((state) => state.localPlayerId);
    const localPlayer = players.find(p => p.id === localPlayerId);
    const isLocalPlayerReady = localPlayer?.isReady || false;
    const isHost = localPlayer?.isHost || false;

    const handleReadyUp = () => {
        if (localPlayerId) {
            controller.setPlayerReady(localPlayerId, !isLocalPlayerReady);
        }
    }

    const handleLeaveLobby = () => {
        console.log('Leave lobby');
        controller.setGamePhase('MAIN_MENU');
    }

    return (
        <div className="lobby-page-wrapper">
            <CountrySelector />

            <div className="lobby-main-container">
                <div className="lobby-header">
                    <div>
                        <h1 className="lobby-title">Game Lobby</h1>
                        <span className="lobby-subtitle">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            {players.length}/{maxPlayers} players joined
                        </span>
                    </div>

                    <div className="lobby-status-badge">
                        <span className="status-dot" style={{ backgroundColor: lobbyStatusColor }}></span>
                        {lobbyStatusText}
                    </div>
                </div>

                <div className="joined-section-title">JOINED PLAYERS</div>

                <div className="players-list">
                    {[0, 1, 2, 3].map((idx) => {
                        const player = players.at(idx);

                        return (
                            <Player key={idx} player={player} />
                        )
                    })}
                </div>

                <div className="lobby-footer">
                    <div className="host-indicator">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5386dd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        You are the host
                    </div>
                    <div className="lobby-actions">
                        <button
                            className="btn-leave"
                            onClick={handleLeaveLobby}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Leave Lobby
                        </button>
                        <button
                            className="btn-start"
                            onClick={isLocalPlayerReady && isHost ? handleStartGame : handleReadyUp}
                            disabled={!localPlayer?.countryId && !isLocalPlayerReady}
                            style={{ opacity: (!localPlayer?.countryId && !isLocalPlayerReady) ? 0.5 : 1, cursor: (!localPlayer?.countryId && !isLocalPlayerReady) ? 'not-allowed' : 'pointer' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            {isLocalPlayerReady ? (isHost ? 'Start Game' : 'Unready') : 'Ready Up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
