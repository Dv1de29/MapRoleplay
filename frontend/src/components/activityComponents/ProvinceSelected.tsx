import { useGameStore } from "../../store/GameStore";
import { useDesignStore } from "../../store/DesignStore";

function ProvinceSelected() {
    const provinceId = useDesignStore((state) => state.selectedProvince);

    const provinceData = useGameStore(state => provinceId ? state.provinces[provinceId] : null);
    const provinceOwner = useGameStore(state => provinceId ? state.provinceOwners[provinceId] : null);
    const playerCountries = useGameStore(state => state.playerCountries);

    const empireColor = useGameStore(state => state.getEmpireColor(provinceOwner));

    if (!provinceId || !provinceData) return null;

    const playerName = provinceOwner && playerCountries[provinceOwner]
        ? playerCountries[provinceOwner]
        : "AI";

    return (
        <div className="province-selected" style={{ backgroundColor: empireColor }}>
            <div className="province-selected-header">
                <div className="province-selected-header-title">{provinceId}</div>
                <div className="province-selected-header-owner">{provinceOwner}; {playerName}</div>
                <div className="province-selected-header-title">Arable: {provinceData.arable_land}; Pops: {provinceData.pops}</div>
            </div>
        </div>
    );
}

export default ProvinceSelected;