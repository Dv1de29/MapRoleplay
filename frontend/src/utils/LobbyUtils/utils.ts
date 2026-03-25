import type { PlayerInterface } from "../../types/LobbyTypes";

export function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

export function getLobbyStatusText(players: PlayerInterface[], maxPlayers: number) {
    if (players.length === 0) {
        return { text: 'Waiting for players...', color: '#ff0000' };
    }
    if (players.length === maxPlayers) {
        return { text: 'All players have joined', color: '#00ff00' };
    }
    return { text: `${players.length}/${maxPlayers} players joined`, color: '#00ff00' };
}