export interface PlayerInterface {
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
    countryId?: string | null;
}

export interface Lobby {
    id: string;
    players: PlayerInterface[];
    isHost: boolean;
}
