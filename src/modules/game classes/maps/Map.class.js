import Wall from "./Wall.class.js";

export default class Map {
    #size = { width: 0, height: 0 };

    /**@type {HTMLImageElement} */
        #backgroundImage;

    /**@type {Wall[]} */
        #walls = [];

    get walls() {
        return this.#walls;
    }

    get size() {
        return this.#size;
    }

    get backgroundImage() {
        return this.#backgroundImage;
    }

    /**
     * @param {number} width 
     * @param {number} height 
     * @param {Wall[]} walls 
     */
    constructor(width, height, walls, backgroundImage) {
        Object.assign(this.#size, { width, height });
        this.#walls = walls;
        this.#backgroundImage = backgroundImage;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        this.#walls.forEach(wall => wall.draw(ctx));
    }
}