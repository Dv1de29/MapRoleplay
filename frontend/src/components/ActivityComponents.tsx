import ProvinceSelected from "./activityComponents/ProvinceSelected";
import '../styles/activityComponents.css';
import MenuBar from "./activityComponents/MenuBar";
import { useGameStore } from "../store/GameStore";
import { useDesignStore } from "../store/DesignStore";

function ActivityComponents() {
    const isMenuOpen = useDesignStore((state) => state.isMenuOpen);

    const handleLeaveGame = () => {
        useGameStore.getState().leaveGame();
    };

    const handleTurnEnd = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();


        // useGameStore.getState().endTurn();
    };

    return (
        <>
            <MenuBar />

            {/* small box to show the selected province if its exist. The pop-up is implemented inside the component */}
            <ProvinceSelected />

            <button className="leave-btn" onClick={handleLeaveGame}>
                Leave Game
            </button>

            {!isMenuOpen && (
                <button className="end-turn-btn" onClick={handleTurnEnd}>
                    End Turn
                </button>
            )}
        </>
    )
}

export default ActivityComponents;