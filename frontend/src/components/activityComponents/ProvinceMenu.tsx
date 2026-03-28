import { useState } from "react";
import { useDesignStore } from "../../store/DesignStore";
import { useGameStore } from "../../store/GameStore";
import "../../styles/ProvinceMenu.css";

function ProvinceMenu() {
    const isMovingArmy = useDesignStore(state => state.isMovingArmy);
    const provinceId = useDesignStore(state => state.selectedProvince);
    const [spawnAmount, setSpawnAmount] = useState<number>(1);

    const localPlayerEmpireId = useGameStore(state => {
        const localId = state.localPlayerId;
        for (const [empireId, playerId] of Object.entries(state.playerCountries)) {
            if (playerId === localId) return empireId;
        }
        return null;
    });

    const provinceOwner = useGameStore(state => provinceId ? state.provinceOwners[provinceId] : null);
    const isOwner = provinceOwner === localPlayerEmpireId;

    const existingArmyInProvince = useGameStore(state => {
        if (!provinceId || !localPlayerEmpireId) return null;

        const foundArmy = Object.values(state.armies).find(
            a => a.location === provinceId && a.owner === localPlayerEmpireId
        );
        return foundArmy || null;
    });

    const hasArmy = !!existingArmyInProvince;

    if (!provinceId || !isOwner) return null;

    const handleSpawnArmy = () => {
        // Enforce the boundaries logically in case browser drops it
        const strengthK = Math.max(1, Math.min(900, spawnAmount));
        useGameStore.getState().spawnArmy(provinceId, strengthK * 1000);
    };

    const handleUpdateArmy = () => {
        console.log("Update army logic here");
    };

    const handleMoveTo = () => {
        if (isMovingArmy) {
            useDesignStore.getState().setisMovingArmy(null);
        } else {
            useDesignStore.getState().setisMovingArmy(existingArmyInProvince!.id);
        }
    };

    return (
        <div className="province-menu">
            <div className="province-menu-header">
                <div className="province-menu-header-title">Province Actions</div>
                <div className="province-menu-header-close" onClick={() => useDesignStore.getState().setSelectedProvince(null)}>X</div>
            </div>
            <div className="province-menu-content">
                <ul className="province-menu-list">
                    {/* Render Spawn Button if NO army is here */}
                    {isOwner && !hasArmy && (
                        <li style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0 0.5rem" }}>
                            <input
                                type="number"
                                min="1"
                                max="900"
                                value={spawnAmount}
                                onChange={(e) => setSpawnAmount(Number(e.target.value))}
                                style={{
                                    width: "3.5rem",
                                    padding: "0.3rem",
                                    border: "1px solid #444",
                                    backgroundColor: "#222",
                                    color: "white",
                                    borderRadius: "4px"
                                }}
                            />
                            <span style={{ color: "#aaa", fontSize: "0.85rem", fontWeight: "bold" }}>K</span>
                            <button className="province-menu-item-btn" onClick={handleSpawnArmy} style={{ flexGrow: 1, marginLeft: "0.5rem" }}>
                                Spawn army
                            </button>
                        </li>
                    )}

                    {/* Render Update/Move Buttons if an army IS here */}
                    {isOwner && hasArmy && (
                        <>
                            <li>
                                <button className="province-menu-item-btn" onClick={handleUpdateArmy}>
                                    Update army
                                </button>
                            </li>
                            <li>
                                <button
                                    className="province-menu-item-btn"
                                    onClick={handleMoveTo}
                                    style={{ backgroundColor: isMovingArmy ? "red" : "" }}
                                >
                                    {isMovingArmy ? "Cancel" : "Move to"}
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default ProvinceMenu;