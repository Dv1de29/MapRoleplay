export function getPopulationString(population: number): string {
    if (population >= 1000000000) {
        return `${(population / 1000000000).toFixed(2)}B`;
    } else if (population >= 1000000) {
        return `${(population / 1000000).toFixed(2)}M`;
    } else if (population >= 1000) {
        return `${(population / 1000).toFixed(2)}K`;
    } else {
        return population.toString();
    }
}

export function parsePopString(popString: string): number {
    const lastChar = popString.slice(-1).toUpperCase();
    let popNum = 0;

    if (lastChar === 'K') {
        popNum = Number(popString.slice(0, -1)) * 1000;
    } else if (lastChar === 'M') {
        popNum = Number(popString.slice(0, -1)) * 1000000;
    } else {
        popNum = Number(popString);
    }

    return popNum;
}