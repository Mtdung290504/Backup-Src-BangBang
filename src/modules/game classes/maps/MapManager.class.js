import Map from "./Map.class.js";
import Wall from "./Wall.class.js";

export default class MapManager {
    #mapConfigs = {
        'Demo map': {
            size: {
                width: 2000,
                height: 2000,
            },
            walls: [
                { x: 500, y: 500, width: 100, height: 300 },
                { x: 800, y: 200, width: 200, height: 100 },
                { x: 1000, y: 700, width: 300, height: 100 },
                { x: 200, y: 800, width: 100, height: 400 }
            ]
        },

        '01': {
            originalSize: {
                width: 2560,
                height: 1940,
            },
            size: {
                width: 2560 / 1.2,
                height: 1940 / 1.2,
            },
            walls: [],
            obstacles: [],
        }
    }

    #maps = {}

    constructor() {
        this.#buildMaps();
    }

    /**
     * Lấy về map theo tên
     * @param {string} name 
     * @returns {Map | undefined}
     */
    getMap(name) {
        return this.#maps[name];
    }

    #buildMaps() {
        const mapConfigs = this.#mapConfigs;

        for (const mapName in mapConfigs) {
            if (Object.prototype.hasOwnProperty.call(mapConfigs, mapName)) {
                const mapConfig = mapConfigs[mapName];
                const { size: { width, height }, walls } = mapConfig;

                this.#maps[mapName] = new Map(width, height, walls.map(wallConfig => {
                    const { x, y, width, height, color } = wallConfig;

                    return new Wall({
                        location: { x, y },
                        display: { width, height, color }
                    });
                }));
            }
        }
    }
}