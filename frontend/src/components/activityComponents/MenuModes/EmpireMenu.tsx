import { useState, useEffect } from "react";
import { useDesignStore } from "../../../store/DesignStore";
import { useGameStore } from "../../../store/GameStore";
import type { ProvinceInterface } from "../../../types/MapTypes";
import "../../../styles/EmpireMenu.css";
import { getPopulationString } from "../../../utils/utils";

function EmpireMenu() {
    const [isProvincesExpanded, setIsProvincesExpanded] = useState(true);

    const selectedEmpireId = useDesignStore((state) => state.selectedEmpire);
    const setSelectedEmpire = useDesignStore((state) => state.setSelectedEmpire);

    const localEmpireId = useGameStore.getState().getLocalPlayerEmpireId();

    const empireSelected = useGameStore((state) => selectedEmpireId ? state.empires[selectedEmpireId] : null);

    const playerCountry = useGameStore((state) => state.getPlayerCountry(selectedEmpireId!));

    const areAllied = useGameStore((state) =>
        (localEmpireId && selectedEmpireId && localEmpireId !== selectedEmpireId)
            ? state.isAllied(localEmpireId, selectedEmpireId)
            : false
    );

    const totalPopulation = useGameStore((state) => state.getTotalPopulation(selectedEmpireId!));
    const averageArableLand = useGameStore((state) => state.getAverageArableLand(selectedEmpireId!));

    useEffect(() => {
        if (!selectedEmpireId) {
            if (localEmpireId) {
                setSelectedEmpire(localEmpireId);
            }
        }
    }, [selectedEmpireId, setSelectedEmpire, localEmpireId]);

    const handleProvinceClick = (e: React.MouseEvent<HTMLElement>, province: ProvinceInterface) => {
        if (e.button !== 0) return;
        useDesignStore.getState().setSelectedProvince(province.id);
    }

    const handleProvinceRightClick = (province: ProvinceInterface) => {
        useDesignStore.getState().setSelectedProvince(province.id);

        ///!!!!! add in the future a view move to that province
    }


    return (
        <div className="empire-menu-container">
            <div className="empire-header">
                <h1 style={{ color: empireSelected?.color || 'inherit' }}>{empireSelected ? empireSelected.name : 'Empire Menu'}</h1>
                <p>ID: {playerCountry}</p>
                <p>Total Population: {getPopulationString(totalPopulation)}</p>
                <p>Average Arable Land: {averageArableLand.toFixed(2)}</p>
            </div>

            {empireSelected && (
                <div className="provinces-container">
                    <div className="provinces-header">
                        <h3>Provinces ({empireSelected.provinces.length})</h3>
                        <button 
                            className="toggle-provinces-btn"
                            onClick={() => setIsProvincesExpanded(!isProvincesExpanded)}
                            title={isProvincesExpanded ? "Collapse" : "Expand"}
                        >
                            <svg 
                                viewBox="0 0 24 24" 
                                width="16" 
                                height="16" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                fill="none" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                style={{ transform: isProvincesExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                    {isProvincesExpanded && (
                        <ul className="provinces-list">
                            {empireSelected.provinces.map((prov) => (
                                <li
                                    key={prov.id}
                                    className="province-item"
                                    onClick={(e) => handleProvinceClick(e, prov)}
                                    onContextMenu={() => handleProvinceRightClick(prov)}
                                >
                                    <strong>{prov.id}</strong>
                                    <span className="province-stats">
                                        Land: {prov.arable_land} | Pops: {prov.pops}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}



            {localEmpireId && empireSelected && localEmpireId !== empireSelected.id && (
                <div className="actions-buttons">
                    <div
                        className="ally-btn"
                        onClick={() => {
                            useGameStore.getState().setAlliance(localEmpireId, empireSelected.id);
                        }}
                    >
                        {useGameStore.getState().isAllied(localEmpireId, empireSelected.id) ? 'Allied' : 'Ally'}
                    </div>
                    <div className="war-btn">
                        Declare War
                    </div>
                </div>
            )}
        </div>
    )
}

export default EmpireMenu;