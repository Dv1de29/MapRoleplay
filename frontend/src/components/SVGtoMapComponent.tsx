import { useEffect } from "react";

import { useGameStore } from "../store/GameStore";
import { useDesignStore } from "../store/DesignStore";
import { useAdjacencyDebugger } from "../utils/tempHookProvince";
import ArmyMarker from "./ArmyPainter";


function SVGtoMapComponent({ svg }: { svg: React.ReactNode }) {

    const selectedProvince = useDesignStore((state) => state.selectedProvince);
    const armies = useGameStore((state) => state.armies);

    // useAdjacencyDebugger(selectedProvince)

    ///coloring the map
    useEffect(() => {
        const initialState = useGameStore.getState();
        const initialOwners = initialState.provinceOwners;

        for (const provinceId in initialOwners) {
            const pathElement = document.getElementById(provinceId);
            if (pathElement) {
                const empireId = initialOwners[provinceId];
                const color = initialState.getEmpireColor(empireId);
                pathElement.setAttribute('fill', color);
            }
        }

        const unsubscribe = useGameStore.subscribe((state, previousState) => {

            const newOwners = state.provinceOwners;
            const previousOwners = previousState.provinceOwners;

            if (newOwners === previousOwners) return;

            for (const provinceId in newOwners) {
                if (newOwners[provinceId] !== previousOwners[provinceId]) {

                    const pathElement = document.getElementById(provinceId);
                    if (pathElement) {
                        const empireId = newOwners[provinceId];
                        const color = state.getEmpireColor(empireId);

                        pathElement.setAttribute('fill', color);
                    }
                }
            }
        });


        ////for adding something to every province
        // const paths = document.querySelectorAll('.map-svg');
        // paths.forEach((path) => {
        //     path.addEventListener('click', (e) => {
        //         const target = e.target as SVGElement;
        //         const provinceId = target.id;
        //         if (provinceId) {
        //             console.log("Clicked on province: ", provinceId);
        //             // useGameStore.getState().selectProvince(provinceId);
        //         }
        //     });
        // });

        return () => unsubscribe();
    }, [svg])

    return (
        <>
            <div className="svg-map-wrapper" style={{ width: '100%', height: '100%' }}>
                {svg}
                {Object.keys(armies).map(armyId => (
                    <ArmyMarker key={armyId} armyId={armyId} />
                ))}
            </div>
        </>
    )
}

export default SVGtoMapComponent;