export default class Camera {
    /**
     * @param {{ x: number, y: number, width: number, height: number }} params
     */
    constructor({ x, y, width, height }) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
    }

    #x;
    #y;
    #width;
    #height;
    #mapWidth;
    #mapHeight;

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get mapWidth() {
        return this.#mapWidth;
    }

    get mapHeight() {
        return this.#mapHeight;
    }

    setSize({ width, height }) {
        this.#width = width;
        this.#height = height;
    }

    setMapSize({ width, height }) {
        this.#mapWidth = width;
        this.#mapHeight = height;
    }

    update(playerX, playerY) {
        this.#x = playerX - this.#width / 2;
        this.#y = playerY - this.#height / 2;
        this.clamp();
    }

    apply(ctx) {
        ctx.translate(-this.#x, -this.#y);
    }

    // clamp() {
    //     this.#x = Math.max(0, Math.min(this.#x, this.#mapWidth - this.#width));
    //     this.#y = Math.max(0, Math.min(this.#y, this.#mapHeight - this.#height));
    // }

    clamp() {
        const offsetX = Math.max(0, (this.#width - this.#mapWidth) / 2);
        const offsetY = Math.max(0, (this.#height - this.#mapHeight) / 2);
    
        this.#x = Math.max(-offsetX, Math.min(this.#x, this.#mapWidth - this.#width + offsetX));
        this.#y = Math.max(-offsetY, Math.min(this.#y, this.#mapHeight - this.#height + offsetY));
    }    
}