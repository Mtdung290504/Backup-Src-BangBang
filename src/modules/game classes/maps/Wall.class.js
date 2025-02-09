export default class Wall {
    constructor({
        location: { x, y },
        display: { width, height, color }
    }) {
        this.#location = { x, y };
        this.#display = { width, height, color: color ?? 'black' }
    }

    #location;
    #display;

    get x() { return this.#location.x }
    get y() { return this.#location.y }
    get width() { return this.#display.width }
    get height() { return this.#display.height }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        const { x, y } = this.#location;
        const { width, height, color } = this.#display;

        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.restore();
    }
}