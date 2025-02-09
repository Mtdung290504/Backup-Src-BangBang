export default class AssetLoadingInterface {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {CanvasRenderingContext2D} ctx 
     */
    constructor(canvas, ctx) {
        this.#canvas = canvas;
        this.#ctx = ctx;
        this.#loadAnimId = undefined;
        this.#rotationAngle = 0;
        this.#pointCount = 0;
        this.#completed = false;

        this.#assetsLimitCount = 0;
        this.#assetsLoadedCount = 0;
        this.#loadedAssetsText = "...";
    }

    #canvas;
    #ctx;
    #loadAnimId;
    #rotationAngle;
    #pointCount;
    #completed;
    #assetsLimitCount;
    #assetsLoadedCount;
    #loadedAssetsText;

    setAssetsLoadedCount(count) {
        this.#assetsLoadedCount = count;
    }

    setAssetsLimitCount(count) {
        this.#assetsLimitCount = count;
    }

    setLoadedAssetsText(text) {
        this.#loadedAssetsText = text;
    }

    complete() {
        this.#completed = true;
        setTimeout(() => this.stop(), 500);
    }

    start() {
        const points = Array(parseInt(this.#pointCount)).fill('.').join('');
        const textDisplay = `Đang tải${points}`;
        const { width, height } = this.#canvas;

        if (this.#pointCount > 4) this.#pointCount = 0;
        this.#pointCount += 0.1;

        // Tạo nền mờ
        this.#ctx.fillStyle = 'rgb(0, 0, 0)';
        this.#ctx.fillRect(0, 0, width, height);

        // Vẽ vòng tròn xoay với các đoạn màu
        const radius = 30;
        const lineWidth = 2;
        const numLines = 16;
        const lineLength = radius * 0.6;

        this.#ctx.save();
        this.#ctx.translate(width / 2, height / 2 + 70);
        this.#ctx.rotate(this.#rotationAngle);

        for (let i = 0; i < numLines; i++) {
            this.#ctx.beginPath();
            this.#ctx.rotate((Math.PI * 2) / numLines);
            this.#ctx.moveTo(radius - lineLength, 0);
            this.#ctx.lineTo(radius, 0);
            this.#ctx.lineWidth = lineWidth;
            this.#ctx.strokeStyle = `rgba(255, 255, 255, ${i / numLines})`; // Gradient effect
            this.#ctx.stroke();
        }

        this.#ctx.restore();

        // Vẽ chữ "Loading..."
        this.#ctx.font = `35px Arial`;
        this.#ctx.textAlign = 'center';
        this.#ctx.textBaseline = 'middle';
        this.#ctx.fillStyle = 'white';
        this.#ctx.fillText(textDisplay, width / 2, height / 2);

        // Vẽ text ở góc dưới trái
        this.#ctx.font = `20px Arial`;
        this.#ctx.textAlign = 'right';
        this.#ctx.textBaseline = 'bottom';
        this.#ctx.fillStyle = 'white';
        this.#ctx.fillText(
            this.#completed
                ? 'Tải hoàn tất'
                : `Đã tải: ${this.#loadedAssetsText} (${this.#assetsLoadedCount}/${this.#assetsLimitCount})`
            , width * 0.97, height * 0.97
        );

        this.#rotationAngle += 0.04; // Điều chỉnh tốc độ xoay
        this.#loadAnimId = requestAnimationFrame(() => this.start());
    }

    stop() {
        const { width, height } = this.#canvas;
        cancelAnimationFrame(this.#loadAnimId);
        this.#ctx.clearRect(0, 0, width, height);
    }
}