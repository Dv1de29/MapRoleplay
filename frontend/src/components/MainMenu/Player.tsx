import type { PlayerInterface } from "../../types/LobbyTypes";
import { useGameStore } from "../../store/GameStore";

function Player({ player }: {
    player: PlayerInterface | undefined
}) {
    const empires = useGameStore((state) => state.empires);
    
    const country = player?.countryId ? empires[player.countryId] : null;

    if (!player) {
        return (
            <div className="player-item">
                <div className="player-avatar" style={{ backgroundColor: '#1b2642' }}>
                    <span className="avatar-emoji">🥷</span>
                </div>
                <div className="player-info">
                    <div className="player-name-row">
                        <span className="player-name">Waiting for player...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="player-item">
            <div className="player-avatar" style={{ backgroundColor: '#1b2642' }}>
                <span className="avatar-emoji">🥷</span>
            </div>
            <div className="player-info">
                <div className="player-name-row">
                    <span className="player-name">{player.name}</span>
                    {player.isHost &&
                        (<span className="host-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            HOST
                        </span>
                        )}
                    {player.isReady && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                            READY
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span className="player-id">{player.id}</span>
                    {country && (
                        <span style={{ fontSize: '0.8rem', color: '#a0a0b0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: country.color, display: 'inline-block' }}></span>
                            {country.name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Player;