export interface ProvinceInterface {
    id: string;
    arable_land: string;
    pops: string;
}

export interface Empire {
    id: string;
    name: string;
    color: string;
    provinces: ProvinceInterface[];
    isAI: boolean;
    manpower: number;
    supplyLimit: number;
}


export interface ArmiesInterface {
    id: string;
    name: string;
    strength: number;
    location: string;
    owner: string;
}

export function getArmyShow(army: ArmiesInterface): { form: string, number: number } {
    if (army.strength < 1e6) {
        return { form: "circle", number: army.strength / 1e3 };
    }

    return { form: "rectangle", number: army.strength / 1e6 };
}


export interface MapAdjacencyList {
    adj: Record<string, string[]>;
}
