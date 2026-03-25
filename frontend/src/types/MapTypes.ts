export class ProvinceInterface {
    id: string;
    arable_land: string;
    pops: string;

    constructor(id: string, arable_land: string, pops: string) {
        this.id = id;
        this.arable_land = arable_land;
        this.pops = pops;
    }

    toString(): string {
        return `Province: ${this.id}, Arable Land: ${this.arable_land}, Pops: ${this.pops}`;
    }

    getArableLand(): number {
        return Number(this.arable_land);
    }

    getPops(): number {
        return Number(this.pops);
    }

    getId(): string {
        return this.id;
    }
}
