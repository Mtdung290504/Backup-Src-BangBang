export default class Bullet {
    #x = 0;
    #y = 0;
    #angle = 0;
    #speed = 15;
    #range = 336;
    #width = 90;
    #height = 30;
    #image = null;
    #collisionImage = null;
    #traveledDistance = 0;

    withLocation(x, y) {
        this.#x = x;
        this.#y = y;
        return this;
    }

    withAngle(angle) {
        this.#angle = angle;
        return this;
    }

    withSpeed(speed) {
        this.#speed = speed;
        return this;
    }

    withRange(range) {
        this.#range = range;
        return this;
    }

    withSize(width, height) {
        this.#width = width;
        this.#height = height;
        return this;
    }

    withImage(image) {
        this.#image = image;
        return this;
    }

    withCollisionImage(collisionImage) {
        this.#collisionImage = collisionImage;
        return this;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get angle() {
        return this.#angle;
    }

    get speed() {
        return this.#speed;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get image() {
        return this.#image;
    }

    get collisionImage() {
        return this.#collisionImage;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx, border = false) {
        let deltaX = Math.cos(this.#angle) * this.#speed;
        let deltaY = Math.sin(this.#angle) * this.#speed;
        this.#x += deltaX;
        this.#y += deltaY;
        this.#traveledDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        ctx.save();
        ctx.translate(this.#x, this.#y);
        ctx.rotate(this.#angle);
        ctx.drawImage(this.#image, -this.#width / 2, -this.#height / 2, this.#width, this.#height);
        ctx.restore();

        if (border) {
            ctx.save();
            ctx.translate(this.#x, this.#y);
            ctx.rotate(this.#angle);
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(-this.#width / 2, -this.#height / 2, this.#width, this.#height);
            ctx.restore();
        }

        return this.#traveledDistance >= this.#range + this.#width / 2;
    }
}