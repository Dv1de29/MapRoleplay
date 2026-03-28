import { useGameStore } from "../../store/GameStore";
import { useDesignStore } from "../../store/DesignStore";

function ProvinceSelected() {
    const provinceId = useDesignStore((state) => state.selectedProvince);

    const provinceData = useGameStore(state => provinceId ? state.provinces[provinceId] : null);
    const provinceOwner = useGameStore(state => provinceId ? state.provinceOwners[provinceId] : null);
    const playerCountries = useGameStore(state => state.playerCountries);

    const empireColor = useGameStore(state => state.getEmpireColor(provinceOwner));

    const localPlayerId = useGameStore(state => state.localPlayerId);
    const localPlayerEmpireId = useGameStore(state => {
        for (const [key, value] of Object.entries(state.playerCountries)) {
            if (value === state.localPlayerId) return key;
        }
        return null;
    });

    const isOwner = provinceOwner === localPlayerEmpireId;

    if (!provinceId || !provinceData) return null;

    const playerName = provinceOwner && playerCountries[provinceOwner]
        ? playerCountries[provinceOwner]
        : "AI";

    // Clean up province ID for display (e.g. "Southern_Serbia" -> "Southern Serbia")
    const displayName = provinceId.replace(/_/g, ' ');

    return (
        <div className="province-selected">
            <div 
                className="province-color-indicator" 
                style={{ backgroundColor: empireColor }} 
            />
            
            <div className="province-content">
                <div className="province-title-row">
                    <span className="province-name" title={displayName}>{displayName}</span>
                </div>
                
                <div className="province-owner-row">
                    <span className="owner-badge" style={{ borderBottomColor: empireColor }}>
                        {provinceOwner || "Uncolonized"}
                    </span>
                    {playerName !== "AI" && <span className="player-badge">👤 {playerName}</span>}
                </div>
                
                <div className="province-stats-row">
                    <div className="stat-item tooltip" title="Arable Land">
                        🌾 <span>{provinceData.arable_land}</span>
                    </div>
                    <div className="stat-item tooltip" title="Population">
                        👥 <span>{provinceData.pops}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProvinceSelected;