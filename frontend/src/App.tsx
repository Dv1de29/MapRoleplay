import { useEffect } from "react"


import MainMenu from "./pages/MainMenu";
import Lobby from "./pages/Lobby";
import Playing from "./pages/Playing";

import { useGameStore } from "./store/GameStore";


function App() {
    const gamePhase = useGameStore(state => state.gamePhase);

    const controller = useGameStore.getState();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get("room")

        if ( roomCode ){
            console.log(`Invite code active: ${roomCode}`);
            controller.joinGame(roomCode);

            window.history.replaceState({}, document.title, window.location.pathname)
        }

    }, [])

    switch(gamePhase) {
        case 'MAIN_MENU':
            return < MainMenu/>;
        case 'LOBBY':
            return < Lobby/>;
        case 'PLAYING':
            return < Playing/>;
    }
}

export default App
