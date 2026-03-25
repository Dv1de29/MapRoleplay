
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import '../styles/Playing.css';

import SVGtoMapComponent from "../components/SVGtoMapComponent";

import ActivityComponents from "../components/ActivityComponents";

import { useGameStore } from "../store/GameStore";
import { useDesignStore } from "../store/DesignStore";


import Vic_Europe from "../data/maps/Vic_Europe";

const getMapComponent = (mapName: string) => {
    const mapStyles = { width: '100%', height: '100%' };

    switch (mapName) {
        case "Vic_Europe":
            return <Vic_Europe style={mapStyles} />;
        // case "World_Map":
        //     return <WorldMap style={mapStyles} />;
        default:
            return <Vic_Europe style={mapStyles} />;
    }
}




const Playing = () => {

    const mapName = "Vic_Europe";
    const TimePeriod = "WW1_Europe";
    // const TimePeriod = "WW2_Europe";
    // const TimePeriod = "Napoleonic_Europe";

    // useEffect(() => {
    //     const csvText = getMapDataFilePath(TimePeriod);
    //     const { empires, provinceOwners } = parseMapData(csvText);
    //     console.log(`Initializing mapColors wiht ${empires} and ${provinceOwners}`)
    //     useGameStore.getState().initGameState(empires, provinceOwners);
    // }, [TimePeriod]);


    const handleProvinceClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.button !== 0) return;

        const target = e.target as SVGElement;

        if (target.tagName.toLowerCase() === 'path') {
            const regionId = target.id || target.getAttribute('name');
            if (!regionId) return;

            console.log("Clicked Region:", regionId);

            // TODO: Tell Zustand that the player clicked this province!
            // useGameStore.getState().setLastClicked(regionId);
            useDesignStore.getState().setSelectedProvince(regionId);
        } else {
            console.log("Clicked on: ", target);
            useDesignStore.getState().setSelectedProvince(null);
        }
    };

    const handleProvinceRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const target = e.target as SVGElement;

        if (target.tagName.toLowerCase() === 'path') {
            const regionId = target.id || target.getAttribute('name');
            if (!regionId) return;

            console.log("Right Clicked Region:", regionId);

            useDesignStore.getState().setSelectedEmpire(useGameStore.getState().getCountryInProvince(regionId));
            useDesignStore.getState().setMenuMode("EMPIRE");
            useDesignStore.getState().toggleMenu(true);
        } else {
            console.log("Right Clicked on: ", target);

            // uncomment when we want the selected empire to be null when right clicking on the map
            // useDesignStore.getState().setSelectedEmpire(null);
            useDesignStore.getState().toggleMenu(false);
        }
    }

    return (
        <div className="playing-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <TransformWrapper
                initialScale={1.25}
                minScale={1}
                maxScale={20}
                centerOnInit={true}
                limitToBounds={true}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                panning={{ disabled: false }}
            >
                {/* The wrapper handles the zoom/pan math */}
                <TransformComponent
                    wrapperClass="map-transform-wrapper"
                    contentClass="map-transform-content"
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                >
                    <div
                        className="game-map-svg"
                        onClick={handleProvinceClick}
                        onContextMenu={handleProvinceRightClick}
                        style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <SVGtoMapComponent svg={getMapComponent(mapName)} />
                    </div>

                </TransformComponent>
            </TransformWrapper>

            <ActivityComponents />
        </div>
    );
};

export default Playing;