import Bullet from "./Bullet.class.js";

export default class CollisionEffect {
    /**
     * @param {Bullet} bullet - Đối tượng đạn với thuộc tính x, y, angle, width, height.
     * @param {number} [duration=250] - Thời gian tồn tại của hiệu ứng (ms).
     * @param {HTMLImageElement} [image=null] - Hình ảnh cho hiệu ứng.
     * @param {number} [maxWidth=40] - Chiều rộng tối đa của hiệu ứng.
     * @param {number} [maxHeight=40] - Chiều cao tối đa của hiệu ứng.
     */
    constructor(bullet, duration = 250, image = null, maxWidth = 40, maxHeight = 40) {
        this.duration = duration;
        this.startTime = Date.now();
        this.image = image;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.radius = 10;

        // Tính toán vị trí va chạm
        this.calculateCollisionPoint(bullet);
    }

    calculateCollisionPoint(bullet) {
        // Tính toán vị trí va chạm dựa trên góc và kích thước của đạn
        const radian = bullet.angle;
        const halfWidth = bullet.width / 2;
        const halfHeight = bullet.height / 2;
        
        const offsetX = Math.cos(radian) * halfWidth;
        const offsetY = Math.sin(radian) * halfHeight;
        
        this.collisionX = bullet.x + offsetX;
        this.collisionY = bullet.y + offsetY;
    }

    isExpired() {
        return Date.now() - this.startTime > this.duration;
    }

    draw(ctx) {
        if (this.isExpired()) return;
    
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
    
        // Tính toán alpha (độ trong suốt) và scale (tỷ lệ phóng to)
        let alpha; // Giảm dần độ trong suốt từ 1 đến 0
        const scale = 1 + 0.5 * progress; // Tăng kích thước từ 1 đến 1.5 lần
    
        if (progress <= 0.45) {
            alpha = 1;
        } else {
            alpha = 1 - ((progress - 0.45) / 0.55);
        }

        ctx.save();
        ctx.globalAlpha = alpha;
    
        // Dịch chuyển vị trí vẽ đến điểm va chạm và phóng to hiệu ứng
        ctx.translate(this.collisionX, this.collisionY);
        ctx.scale(scale, scale);
        ctx.translate(-this.collisionX, -this.collisionY);
    
        if (this.image) {
            // Tính toán kích thước của hình ảnh dựa trên kích thước tối đa
            const aspectRatio = this.image.width / this.image.height;
            let width = this.image.width;
            let height = this.image.height;
    
            if (width > this.maxWidth) {
                width = this.maxWidth;
                height = width / aspectRatio;
            }
            if (height > this.maxHeight) {
                height = this.maxHeight;
                width = height * aspectRatio;
            }
    
            // Vẽ hình ảnh hiệu ứng với kích thước được giới hạn tại vị trí va chạm
            ctx.drawImage(this.image, this.collisionX - width / 2, this.collisionY - height / 2, width, height);
        } else {
            // Vẽ hiệu ứng vụ nổ mặc định tại vị trí va chạm
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    
        ctx.restore();
    }
}