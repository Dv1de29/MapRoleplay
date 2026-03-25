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