import { useGameStore } from "../store/GameStore"


function MainMenu() {

    const handleStartGameDev = () => {
        useGameStore.getState().hostNewGame()
    }

    return (
        <>
            <button
                onClick={handleStartGameDev}
            >Start Game for dev</button>
        </>
    )
}

export default MainMenu