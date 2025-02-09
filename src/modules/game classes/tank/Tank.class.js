import fomulars from "../../calculators/fomulars.js";

export default class Tank {
    #dead = false;
    #location = { x: 0, y: 0 };
    #autoShoot = false;
    #display = { radius: 75, rotate: 0, headRotate: 0, width: 150, height: 150 };
    #tankImage = { headImage: undefined, bodyImage: undefined, bulletImage: undefined, collisionImage: null };
    #stats = { hp: 0, maxHp: 0, atk: 0, pen: 0, armor: 0, speed: 0, attackSpeed: 0, bulletRange: 0, bulletSpeed: 0 };
    #keysPressed = {};
    #effects = [];
    #lastShotTime = 0;
    shootType = undefined;

    get dead() { return this.#dead; }
    set dead(dead) { 
        this.#dead = dead;
        if(!this.#dead) 
            this.revive();
    }

    get currentHp() { return this.#stats.hp; }

    defaultAngles = [Math.PI / 2, Math.PI / 4, (3 * Math.PI) / 4];
    angles = [...this.defaultAngles];
    set currentHp(hp) {
        const diff = hp - this.#stats.hp;
        const x = this.x;
        const y = this.y; // Bắt đầu từ tâm tank
    
        if (diff !== 0) {
            const value = Math.abs(diff);
            const color = diff > 0 ? "rgb(0, 180, 0)" : "rgb(240, 0, 0)";
            if(this.angles.length === 0) this.angles = [...this.defaultAngles];
            const angle = this.angles.shift();
            this.#effects.push(new Effect(value, color, x, y, angle, this.#display.height * 0.16)); // Điều chỉnh speed
        }
    
        this.#stats.hp = hp;
        if(this.currentHp <= 0) {
            this.#dead = true;
            setTimeout(() => this.revive(), 3000);
        }
    }

    get maxHp() { return this.#stats.maxHp; }
    set maxHp(maxHp) { this.#stats.maxHp = maxHp; }

    get x() { return this.#location.x; }
    set x(x) { this.#location.x = x; }

    get y() { return this.#location.y; }
    set y(y) { this.#location.y = y; }

    get radius() { return this.#display.radius; }

    get speed() { return this.#stats.speed; }
    set speed(speed) { this.#stats.speed = speed; }

    get bulletImage() { return this.#tankImage.bulletImage; }

    get collisionImage() { return this.#tankImage.collisionImage; }

    get rotate() { return this.#display.rotate; }
    set rotate(rotate) { this.#display.rotate = rotate; }
    
    get headRotate() { return this.#display.headRotate }
    set headRotate(headRotate) { this.#display.headRotate = headRotate; }

    get bulletRange() { return this.#stats.bulletRange; }
    get bulletSpeed() { return this.#stats.bulletSpeed; }
    set bulletSpeed(bulletSpeed) { this.#stats.bulletSpeed = bulletSpeed; }
    
    get attackSpeed() { return this.#stats.attackSpeed;  }
    set attackSpeed(spd) { this.#stats.attackSpeed = spd; } 

    set lastShotTime(time) { this.#lastShotTime = time; }
    get lastShotTime() { return this.#lastShotTime; }

    get atk() { return this.#stats.atk }
    set atk(atk) { this.#stats.atk = atk; }

    set autoShoot(state) { this.#autoShoot = state; }
    get autoShoot() { return this.#autoShoot; }

    setKeyPressedState(key, boolean) {
        this.#keysPressed[key] = boolean;
    }

    withLocation(x, y) {
        this.#location = { x, y };
        return this;
    }

    withDisplay(radius, rotate, headRotate) {
        this.#display = { radius, rotate, headRotate };
        this.#display.width = radius * 2;
        this.#display.height = radius *2;
        return this;
    }

    withTankImage({ headImage, bodyImage, bulletImage, collisionImage }) {
        this.#tankImage = { headImage, bodyImage, bulletImage, collisionImage };
        return this;
    }

    withStats({ hp, atk, pen, armor, speed, attackSpeed, bulletRange, bulletSpeed }) {
        this.#stats = { hp, maxHp: hp, atk, pen, armor, speed, attackSpeed, bulletRange, bulletSpeed };
        return this;
    }

    revive() {
        this.#dead = false;
        this.#stats.hp = this.#stats.maxHp;
    }
    heal(hp) {
        this.currentHp += Math.min(this.maxHp - this.currentHp, parseInt(hp));
    }

    move(camera) {
        const { speed } = this.#stats;
        const keysPressed = this.#keysPressed;
        const speedCalculationConstant = 24 / 1000;

        let moveX = 0;
        let moveY = 0;
    
        if (keysPressed['w'] || keysPressed['ArrowUp']) moveY -= 1;
        if (keysPressed['a'] || keysPressed['ArrowLeft']) moveX -= 1;
        if (keysPressed['s'] || keysPressed['ArrowDown']) moveY += 1;
        if (keysPressed['d'] || keysPressed['ArrowRight']) moveX += 1;
    
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        if (length !== 0) {
            moveX = (moveX / length) * speed * speedCalculationConstant;
            moveY = (moveY / length) * speed * speedCalculationConstant;

            const targetAngle = Math.atan2(moveY, moveX) * (180 / Math.PI);
            const rotateSpeed = speed / 15;
    
            let angleDiff = fomulars.normalizeAngle(targetAngle - this.#display.rotate);
    
            if (angleDiff > 180) {
                angleDiff -= 360;
            } else if (angleDiff < -180) {
                angleDiff += 360;
            }
    
            // Điều chỉnh góc xoay
            if (Math.abs(angleDiff) < rotateSpeed) {
                this.#display.rotate = targetAngle;
            } else {
                this.#display.rotate += rotateSpeed * Math.sign(angleDiff);
            }
    
            this.#display.rotate = fomulars.normalizeAngle(this.#display.rotate);
        }
    
        this.x += moveX;
        this.y += moveY;
    
        camera.update(this.x, this.y);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {boolean} [border=false] Border để debug
     */
    draw(ctx, border = false) {
        const { x, y } = this.#location;
        const { radius, width, height, rotate, headRotate } = this.#display;
        const { headImage, bodyImage } = this.#tankImage;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(fomulars.toRadian(rotate));

        // Thiết lập hiệu ứng drop shadow
            ctx.shadowOffsetX = 0; // Offset ngang của shadow
            // ctx.shadowOffsetY = fomulars.normalizeAngle(rotate) === 90 ? -height * .05 : height * .08; // Offset dọc của shadow
            ctx.shadowOffsetY = height * .07;
            ctx.shadowBlur = 2; // Độ mờ của shadow
            ctx.shadowColor = 'rgba(0, 0, 0, .5)'; // Màu sắc và độ mờ của shadow

        // Vẽ phần thân tank
            // for (let i = 0; i < 5; i++) {
                ctx.drawImage(bodyImage, -width / 2, -height / 2, width, height);
            // }

        // Vẽ phần đầu tank trong một ngữ cảnh mới
            ctx.restore(); // Phục hồi lại ngữ cảnh ban đầu trước khi vẽ phần đầu tank

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(headRotate);
            ctx.shadowOffsetX = 0; // Offset ngang của shadow
            // ctx.shadowOffsetY = fomulars.normalizeAngle(headRotate) === 90 ? -height * .05 : height * .08; // Offset dọc của shadow
            ctx.shadowOffsetY = height * .07;
            ctx.shadowBlur = 2; // Độ mờ của shadow
            ctx.shadowColor = 'rgba(0, 0, 0, .5)'; // Màu sắc và độ mờ của shadow
        ctx.drawImage(headImage, -width / 2, -height / 2, width, height);
        ctx.restore();

        // Cập nhật và vẽ các hiệu ứng
            this.#effects = this.#effects.filter(effect => {
                const done = effect.update();
                effect.draw(ctx);
                return !done;
            });

        if (border) {
            ctx.save();
            ctx.translate(x, y);
            ctx.strokeStyle = 'white';
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
    
    drawHPBar(ctx, color, characterName) {
        const { x, y } = this.#location;
        const { width, height } = this.#display;
        const { hp, maxHp } = this.#stats;
    
        const barWidth = width * 0.65; // Chiều rộng thanh máu
        const barHeight = height * 0.093; // Chiều cao của thanh máu
        const borderRadius = 4; // Bo góc cho thanh máu
        const borderWidth = 1; // Độ dày của viền thanh máu
        const barX = x - barWidth / 2; // Vị trí vẽ thanh máu (phía dưới tank)
        const barY = y + this.radius + 10; // Đặt thanh máu phía dưới tank với một khoảng cách nhỏ (10px)
        const currentHpWidth = (hp / maxHp) * barWidth;// Tính toán độ dài của thanh máu hiện tại

        ctx.save();
        // Viền xám mờ
            ctx.beginPath();
            ctx.strokeStyle = '#666666'; // Màu viền
            ctx.lineWidth = 2; // Độ dày viền
            ctx.roundRect(barX -1, barY -1, barWidth +2, barHeight +2, borderRadius);
            ctx.stroke();
            ctx.closePath();    
        // Viền trong
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 0, 0, .5)'; // Màu viền
            ctx.lineWidth = borderWidth; // Độ dày viền
            ctx.roundRect(barX, barY, barWidth, barHeight, borderRadius);
            ctx.stroke();
            ctx.closePath();

        // Viền ngoài
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 0, 0, .9)'; // Màu viền
            ctx.lineWidth = borderWidth; // Độ dày viền
            ctx.roundRect(barX -2.5, barY -2.5, barWidth +5, barHeight +5, borderRadius);
            ctx.stroke();
            ctx.closePath();

        // Tạo gradient cho nền thanh máu
            const bgGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
                bgGradient.addColorStop(0, 'rgba(0, 0, 0, .5)'); // Màu chính
                bgGradient.addColorStop(0.5, 'rgba(0, 0, 0, .5)'); // Giữ màu chính cho 50% đầu tiên
                bgGradient.addColorStop(1,  this.darkenColor('rgba(0, 0, 0, .5)', 0.5)); // Màu đậm hơn ở phần dưới cùng
        // Vẽ nền thanh máu
            ctx.fillStyle = bgGradient;
            ctx.beginPath();
            ctx.roundRect(barX + borderWidth / 2, barY + borderWidth / 2, barWidth - borderWidth, barHeight - borderWidth, 0);
            ctx.fill();
            ctx.closePath();
    
        // Tạo gradient cho thanh máu
            const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
                gradient.addColorStop(0, color); // Màu chính
                gradient.addColorStop(0.5, color); // Giữ màu chính cho 50% đầu tiên
                gradient.addColorStop(1,  this.darkenColor(color, 0.5)); // Màu đậm hơn ở phần dưới cùng
        // Vẽ nền thanh máu hiện tại
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(barX + borderWidth / 2, barY + borderWidth / 2, currentHpWidth - borderWidth, barHeight - borderWidth, 0);
            ctx.fill();
            ctx.closePath();

        // Vẽ các vạch phân chia 500HP
            if(maxHp < 7501) {
                for(let i=0; i<1; i++) {
                    ctx.strokeStyle = 'black';
                    const segmentWidth = barWidth / (maxHp / 500);
                    for (let i = 1; i < maxHp / 500; i++) {
                        const segmentX = barX + i * segmentWidth;
                        ctx.beginPath();
                        ctx.moveTo(segmentX, barY);
                        ctx.lineTo(segmentX, barY + barHeight - barHeight * 0.4);
                        ctx.stroke();
                    }
                }
            }

        // Vẽ tên nhân vật phía dưới thanh máu
            ctx.fillStyle = color; // Màu chữ
            ctx.font = `600 ${height * 0.15}px "Montserrat", sans-serif`; // Kích thước và font chữ
            ctx.textAlign = "center"; // Căn giữa
            ctx.textBaseline = "top"; // Căn trên cùng
            
            const textY = barY + barHeight + 10; // Tọa độ Y - Cách thanh máu một khoảng (5px)
            ctx.lineWidth = height * 0.15 / 25;  // Điều chỉnh độ dày viền theo font size
            ctx.strokeText(characterName, x + height * 0.15 / 25, textY);
            ctx.fillText(characterName, x, textY); // Vẽ tên nhân vật

        ctx.restore();
    }    

    // Hàm để làm tối màu
    darkenColor(color, amount) {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        return `rgb(${Math.max(r - amount * 255, 0)}, ${Math.max(g - amount * 255, 0)}, ${Math.max(b - amount * 255, 0)})`;
    }
}

class Effect {
    constructor(value, color, startX, startY, angle, fontSize) {
        this.value = value;
        this.color = color;
        this.x = startX;
        this.y = startY;
        this.angle = angle;
        this.fontSize = fontSize;
        this.speed = 2.5;
        this.duration = 500;  // Tổng thời gian effect tồn tại
        this.startTime = Date.now();
        this.opacity = 1;  // Khởi tạo độ mờ ban đầu là 1
    }

    update() {
        const timePassed = Date.now() - this.startTime;
        const progress = timePassed / this.duration;  // Tỷ lệ tiến trình so với tổng thời gian

        // Easing function để làm mượt quá trình giảm opacity
        const easeOut = (t) => t * (2 - t);  // Hàm easing cho hiệu ứng mượt hơn

        if(progress < .75) {
            if (this.angle === Math.PI / 2) {
                this.y -= this.speed;
            } else if (this.angle === Math.PI / 4) {
                this.x -= this.speed;
                this.y -= this.speed;
            } else if (this.angle === 3 * Math.PI / 4) {
                this.x += this.speed;
                this.y -= this.speed;
            }            
        }

        // Giảm opacity chỉ khi tiến trình vượt qua 50%
        if (progress >= 0.8) {
            const fadeProgress = (progress - 0.8) / 0.2;  // Tính toán phần còn lại trong 50%
            this.opacity = 1 - easeOut(fadeProgress);  // Giảm dần opacity mượt mà hơn với easing
        }

        // Trả về true nếu thời gian đã vượt quá duration
        return timePassed > this.duration;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;  // Áp dụng độ mờ dựa trên giá trị opacity

        // Vẽ viền đen
        ctx.font = `Bold ${this.fontSize}px "Montserrat", sans-serif`;
        ctx.textAlign = "center";
        ctx.strokeStyle = 'black';
        ctx.lineWidth = this.fontSize / 30;  // Điều chỉnh độ dày viền theo font size
        ctx.strokeText(this.value, this.x, this.y);

        // Vẽ chữ màu
        ctx.fillStyle = this.color;
        ctx.fillText(this.value, this.x, this.y);

        ctx.restore();
    }
}