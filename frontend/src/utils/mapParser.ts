import { type Empire } from '../store/GameStore';
import { ProvinceInterface } from '../types/MapTypes';

export function parseMapOwners(csvText: string): {
    empires: Record<string, Empire>;
    provinceOwners: Record<string, string>
} {
    const empires: Record<string, Empire> = {};
    const provinceOwners: Record<string, string> = {};

    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const startIndex = lines[0].toLowerCase().includes('state') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        const [stateId, label, color] = lines[i].split(',');

        if (!stateId || !label || !color) continue;

        const empireId = label.trim();
        const cleanStateId = stateId.trim();

        if (!empires[empireId]) {
            empires[empireId] = {
                id: empireId,
                name: label.trim(),
                color: color.trim(),
                provinces: [],
                isAI: true
            };
        }

        provinceOwners[cleanStateId] = empireId;
    }

    console.log("empires", empires);
    console.log("provinceOwners", provinceOwners);

    return { empires, provinceOwners };
}


export function parseMapProvinces(
    csvText: string,
    empires: Record<string, Empire>,
    provinceOwners: Record<string, string>
): {
    provinces: Record<string, ProvinceInterface>
} {
    const provinces: Record<string, ProvinceInterface> = {};

    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const startIndex = lines[0].toLowerCase().includes('state') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        const [stateId, arable_land, pops] = lines[i].split(',');

        if (!stateId || !arable_land || !pops) continue;

        const cleanStateId = stateId.trim();

        if (!provinces[cleanStateId]) {
            const newProvince = new ProvinceInterface(cleanStateId, arable_land.trim(), pops.trim());
            provinces[cleanStateId] = newProvince;
            
            const ownerId = provinceOwners[cleanStateId];
            if (ownerId && empires[ownerId]) {
                empires[ownerId].provinces.push(newProvince);
            }
        }
    }

    console.log("provinces", provinces);

    return { provinces };
}
