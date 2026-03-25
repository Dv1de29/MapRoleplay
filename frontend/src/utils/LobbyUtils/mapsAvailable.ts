import WW1_Europe_CSV from "../../data/mapsColors/Vic_Europe/WW1_Europe.csv?raw";
import Napoleonic_Europe_CSV from "../../data/mapsColors/Vic_Europe/Napoleonic_Europe.csv?raw";
import WW2_Europe_CSV from "../../data/mapsColors/Vic_Europe/WW2_Europe.csv?raw";


import Vic_Europe_Provinces from "../../data/mapsValue/Vic_Europe.csv?raw"


export const mapsAvailable = [
    "WW1_Europe",
    "WW2_Europe",
    "Napoleonic_Europe"
];

export const getMapDataFilePath = (mapName: string): string => {
    switch (mapName) {
        case "WW1_Europe":
            return WW1_Europe_CSV;
        case "WW2_Europe":
            return WW2_Europe_CSV;
        case "Napoleonic_Europe":
            return Napoleonic_Europe_CSV;
        default:
            return WW1_Europe_CSV;
    }
}

export const getMapValueFilePath = (mapName: string): string => {
    return Vic_Europe_Provinces;
}