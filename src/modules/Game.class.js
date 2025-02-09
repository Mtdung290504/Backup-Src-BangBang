import AssetLoader from "./assets manager/AssetLoader.class.js";
import AssetLoadingInterface from "./assets manager/AssetLoadingInterface.class.js";
import collisionFomulars from "./calculators/collisionFomulars.js";
import Bullet from "./game classes/tank/Bullet.class.js";
import CollisionEffect from "./game classes/tank/CollisionEffect.class.js";
import Camera from "./game classes/maps/Camera.class.js";
import Map from "./game classes/maps/Map.class.js";
import MapManager from "./game classes/maps/MapManager.class.js";
import Tank from "./game classes/tank/Tank.class.js";
import fomulars from "./calculators/fomulars.js";

export default class Game {
    constructor() {
        this.#canvas = document.createElement('canvas');
        this.#ctx = this.#canvas.getContext('2d');
        document.body.appendChild(this.#canvas);

        this.#mapManager = new MapManager();

        this.#camera = new Camera({
            x: 0, y: 0,
            width: this.#canvas.width,
            height: this.#canvas.height,
        });

        this.#assetLoadingInterface = new AssetLoadingInterface(this.#canvas, this.#ctx);
        this.#assetLoader = new AssetLoader(this.#assetLoadingInterface);
        this.#assetLoadingInterface.start();

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('scroll', event => event.preventDefault());

        this.loadAssets();
    }

    #canvas;
    #ctx;
    #assetLoader;
    #assetLoadingInterface;
    #camera;
    #mapManager;
    #mousePlace = {
        clientX: 0,
        clientY: 0,
    }

    #gameEnv = {
        tanks: {
            /**@type {Array<Tank>} */
                allies: [],
            /**@type {Array<Tank>} */
                enemies: [],
            /**@type {Tank} */
                player: undefined,
        },
        /**@type {Bullet[]} */
            bullets: [],
        /**@type {CollisionEffect[]} */
            collisionEffects: [],
        /**@type {Map} */
            map: undefined,
    }

    #settings = {
        drawBorder: false,
        log: true,

        gameContainerSize: {
            widthRatio: 1,
            heightRatio: 1,
        },
    }

    resize() {
        const parent = this.#canvas.parentElement;
        const { widthRatio, heightRatio } = this.#settings.gameContainerSize;

        this.#canvas.width = parent.clientWidth * widthRatio;
        this.#canvas.height = parent.clientHeight * heightRatio;

        this.#camera.setSize(this.#canvas);

        const { tanks } = this.#gameEnv;
        if(tanks.player) {
            this.#camera.update(tanks.player.x, tanks.player.y);
        }
    }

    loadAssets() {
        this.#assetLoader.onAllAssetsLoaded(() => this.onAllAssetsLoaded());
        this.#assetLoader.loadImage('tank.demo.head', 'assets/images/tanks/demo/head.png');
        this.#assetLoader.loadImage('tank.demo.body', 'assets/images/tanks/demo/body.png');
        this.#assetLoader.loadImage('tank.demo.bullet', 'assets/images/tanks/demo/bullet.png');
        this.#assetLoader.loadImage('tank.demo.collision', 'assets/images/tanks/demo/collision.png');
        this.#assetLoader.loadImage('map.01', 'assets/images/maps/map-01/bg_optimized.jpeg');
        this.#assetLoader.loadImage('map.01.layer2', 'assets/images/maps/map-01/bg_layer2_optimized.png');
    }

    onAllAssetsLoaded() {
        this.buildGameEnv();
        let qTimeout = undefined;
        let spaceTimeout = undefined;
        const playerTank = this.#gameEnv.tanks.player;

        document.addEventListener('keydown', (event) => {
            if (playerTank.dead) return;
            playerTank.setKeyPressedState(event.key, true);

            if(event.key === 'q') {
                if (qTimeout) return;

                playerTank.shootType = 'disperse';

                qTimeout = setTimeout(() => {
                    if(playerTank.shootType === 'disperse') playerTank.shootType = 'normal';
                    clearTimeout(qTimeout);
                    qTimeout = undefined;
                }, 8000);
            }

            if(event.key === ' ') {
                if (spaceTimeout) return;

                const currentAtkSpd = playerTank.attackSpeed;
                const currentMvmSpeed = playerTank.speed;
                const currentBulletSpeed = playerTank.bulletSpeed;
                playerTank.attackSpeed = currentAtkSpd * 200 / 100;
                playerTank.speed = currentMvmSpeed * 150 / 100;
                playerTank.bulletSpeed = currentBulletSpeed * 150 / 100;
                playerTank.shootType = 'fiveDisperse';
                
                spaceTimeout = setTimeout(() => {
                    playerTank.attackSpeed = currentAtkSpd;
                    playerTank.speed = currentMvmSpeed;
                    playerTank.bulletSpeed = currentBulletSpeed;
                    if(playerTank.shootType === 'fiveDisperse') playerTank.shootType = 'normal';
                    clearTimeout(spaceTimeout);
                    spaceTimeout = undefined;
                }, 3000);
            }
        });
        document.addEventListener('keyup', (event) => {
            playerTank.setKeyPressedState(event.key, false);
        });
        
        this.#canvas.addEventListener('contextmenu', (event) => event.preventDefault());
        this.#canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.#canvas.addEventListener('mousedown', (event) => {
            if (event.button === 2) { // Chuột phải
                playerTank.autoShoot = !playerTank.autoShoot
            }
        });
        this.#canvas.addEventListener('click', (event) => this.playerShoot(event, playerTank.shootType));
        
        this.#assetLoadingInterface.complete();
        this.resize();
        this.startGameLoop();

        setInterval(() => {
            this.#gameEnv.tanks.enemies.forEach(enemyTank => {
                enemyTank.heal((enemyTank.maxHp - enemyTank.currentHp) * .1);
            });
            this.#gameEnv.tanks.player.heal((this.#gameEnv.tanks.player.maxHp - this.#gameEnv.tanks.player.currentHp) * .1);
        }, 1000);

        setInterval(() => {
            this.#gameEnv.collisionEffects = this.#gameEnv.collisionEffects.filter(effect => !effect.isExpired());
            this.#settings.log && console.log('Expired collision effect cleared', this.#gameEnv.collisionEffects);
        }, 5000);
    }

    buildGameEnv() {
        const gameEnv = this.#gameEnv;
        const assets = this.#assetLoader;
        const playerTank = new Tank()
            .withLocation(200, 1000)
            .withDisplay(75, 0, 0)
            .withTankImage({
                headImage: assets.getImage('tank.demo.head'),
                bodyImage: assets.getImage('tank.demo.body'),
                bulletImage: assets.getImage('tank.demo.bullet'),
                collisionImage: assets.getImage('tank.demo.collision')
            })
            .withStats({ hp: 4181, atk: 286, pen: 20, armor: 40, speed: 170, attackSpeed: 120, bulletRange: 336, bulletSpeed: 10 });

        const enemyTank1 = new Tank()
            .withLocation(1000, 700)
            .withDisplay(75, 90, 0)
            .withTankImage({
                headImage: assets.getImage('tank.demo.head'),
                bodyImage: assets.getImage('tank.demo.body'),
                bulletImage: assets.getImage('tank.demo.bullet'),
                collisionImage: assets.getImage('tank.demo.collision')
            })
            .withStats({ hp: 9533, atk: 186, pen: 10, armor: 40, speed: 15 });

        const enemyTank2 = new Tank()
            .withLocation(990, 900)
            .withDisplay(75, 40, 0)
            .withTankImage({
                headImage: assets.getImage('tank.demo.head'),
                bodyImage: assets.getImage('tank.demo.body'),
                bulletImage: assets.getImage('tank.demo.bullet'),
                collisionImage: assets.getImage('tank.demo.collision')
            })
            .withStats({ hp: 5981, atk: 186, pen: 10, armor: 40, speed: 15 });

        const allyTank = new Tank()
            .withLocation(300, 300)
            .withDisplay(75, 180)
            .withTankImage({
                headImage: assets.getImage('tank.demo.head'),
                bodyImage: assets.getImage('tank.demo.body'),
                bulletImage: assets.getImage('tank.demo.bullet'),
                collisionImage: assets.getImage('tank.demo.collision')
            })
            .withStats({ hp: 2981, atk: 186, pen: 10, armor: 40, speed: 15 });

        gameEnv.map = this.#mapManager.getMap('01');
        this.#camera.setMapSize(gameEnv.map.size);
        gameEnv.tanks.player = playerTank;
        gameEnv.tanks.enemies.push(enemyTank1, enemyTank2);
        gameEnv.tanks.allies.push(allyTank);

        this.#camera.apply(this.#ctx);
        this.#camera.update(playerTank.x, playerTank.y);
    }

    playerShoot(event, type) {
        const gameEnv = this.#gameEnv;
        const tanks = gameEnv.tanks;
        const now = Date.now();

        if(now - tanks.player.lastShotTime < 60000 / tanks.player.attackSpeed) {
            return;
        }
        tanks.player.lastShotTime = now;
        const rect = this.#canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
    
        // Hiệu chỉnh tọa độ của chuột theo vị trí của camera
        const adjustedMouseX = mouseX + this.#camera.x;
        const adjustedMouseY = mouseY + this.#camera.y;
    
        const dx = adjustedMouseX - tanks.player.x;
        const dy = adjustedMouseY - tanks.player.y;
        const angle = Math.atan2(dy, dx);

        const typeShoot = {
            'normal': [0],
            'disperse': [0, -15, 15],
            'fiveDisperse': [0, -10, 10, -20, 20],
            'sixDisperse': [0, 60, -60, 120, -120, -180],
            'twelveDisperse': [0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180],
        }

        this.#gameEnv.bullets.push(...typeShoot[type ?? 'normal'].map(angleDiff => 
            new Bullet()
                .withLocation(tanks.player.x, tanks.player.y)
                .withAngle(fomulars.toRadian(fomulars.toDegree(angle) + angleDiff))
                .withSpeed(tanks.player.bulletSpeed)
                .withRange(tanks.player.bulletRange)
                .withSize(100, 100 / 3)
                .withImage(tanks.player.bulletImage)
                .withCollisionImage(tanks.player.collisionImage)
        ));
    }

    handleMouseMove(event) {
        const gameEnv = this.#gameEnv;
        const tanks = gameEnv.tanks;
        const rect = this.#canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
    
        // Hiệu chỉnh tọa độ của chuột theo vị trí của camera
        const adjustedMouseX = mouseX + this.#camera.x;
        const adjustedMouseY = mouseY + this.#camera.y;
    
        const dx = adjustedMouseX - tanks.player.x;
        const dy = adjustedMouseY - tanks.player.y;
        
        tanks.player.headRotate = Math.atan2(dy, dx);
        this.#mousePlace = { clientX: mouseX, clientY: mouseY };
    }

    startGameLoop() { // Tạm thời dùng interval để draw thay requestAnimationFrame
        const tickRate = 1000 / 64;
        setInterval(() => this.draw(), tickRate);
    }
    
    draw() {
        const { width: mapWidth, height: mapHeight } = this.#gameEnv.map.size;
        const { width: canvasWidth, height: canvasHeight } = this.#canvas;
    
        this.#ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.#ctx.save();
        this.#camera.apply(this.#ctx);
    
        this.#ctx.drawImage(this.#assetLoader.getImage('map.01'), 0, 0, mapWidth, mapHeight);
        this.#gameDrawer.drawTanks();
        this.#gameDrawer.drawMap();
        this.#ctx.drawImage(this.#assetLoader.getImage('map.01.layer2'), 0, 0, mapWidth, mapHeight);
        this.#gameDrawer.drawBullet();
        this.#gameDrawer.drawCollisionEffect();

        this.#gameEnv.tanks.player.move(this.#camera);
    
        this.#ctx.restore();
    }

    #gameDrawer = {
        drawMap: () => {
            // this.#gameEnv.map.draw(this.#ctx);
        },

        drawTanks: () => {
            const { tanks } = this.#gameEnv;

            tanks.allies.forEach((ally, index) => {
                if(ally.dead) return;
                ally.drawHPBar(this.#ctx, 'rgb(70, 185, 225)', `Ally ${index + 1}`);
                ally.draw(this.#ctx, this.#settings.drawBorder);
            });

            tanks.enemies.forEach((enemy, index) => {
                if(enemy.dead) return;
                enemy.drawHPBar(this.#ctx, 'rgb(240, 0, 0)', `Enemy ${index + 1}`);
                enemy.draw(this.#ctx, this.#settings.drawBorder);
            });

            if(!tanks.player.dead) {
                tanks.player.drawHPBar(this.#ctx, 'rgb(0, 180, 0)', 'Player');
                tanks.player.draw(this.#ctx, this.#settings.drawBorder);
            }

            if(tanks.player.autoShoot) {
                this.playerShoot(this.#mousePlace, tanks.player.shootType);
            }
        },

        drawBullet: () => {
            const { bullets, tanks, collisionEffects, map: { walls }, map } = this.#gameEnv;

            bullets.forEach((bullet, index) => {
                if(bullet.draw(this.#ctx, this.#settings.drawBorder)) {
                    bullets.splice(index, 1);
                    return;
                };

                tanks.enemies.forEach(enemy => {
                    if (!enemy.dead && this.#collisionChecker.isBulletAndTankCollision(enemy, bullet)) {
                        this.#settings.log && console.log('Hit tank detected!');
                        collisionEffects.push(new CollisionEffect(bullet, 200, bullet.collisionImage));
                        bullets.splice(index, 1);

                        enemy.currentHp -= tanks.player.atk;
                        Math.random() < .25 && enemy.heal((enemy.maxHp - enemy.currentHp) * .1);

                        tanks.player.currentHp -= parseInt(tanks.player.atk * .15);
                        Math.random() < .25 && tanks.player.heal((tanks.player.maxHp - tanks.player.currentHp) * .1);
                    }
                });

                if (walls.some(wall => this.#collisionChecker.isBulletAndWallCollision(bullet, wall))) {
                    this.#settings.log && console.log('Hit wall detected!');
                    collisionEffects.push(new CollisionEffect(bullet, 200, bullet.collisionImage));
                    bullets.splice(index, 1);
                } else if (// Kiểm tra nếu viên đạn bay ra khỏi map
                        bullet.x < 0
                        || bullet.x > map.size.width
                        || bullet.y < 0
                        || bullet.y > map.size.height
                    ) {
                    this.#settings.log && console.log('Bullet out of map, remove');
                    bullets.splice(index, 1);
                }
            });
        },

        drawCollisionEffect: () => {
            let { collisionEffects } = this.#gameEnv;
            collisionEffects.forEach(effect => effect.draw(this.#ctx));
            collisionEffects = collisionEffects.filter(effect => !effect.isExpired());
        }
    }

    #collisionChecker = {
        /**
         * @param {Tank} circle - Tank object with properties x, y, and radius.
         * @param {Bullet} rect - Bullet object with properties x, y, angle, width, and height.
         * @returns {boolean} - True if collision is detected, otherwise false.
         */
        isBulletAndTankCollision(circle, rect) {
            // return collisionFomulars.isCircleAndRolatedRectangleCollision(circle, rect);
            return collisionFomulars.checkRotableRectangleCircleCollision(circle, rect);
        },

        /**
         * @param {Bullet} bullet - Bullet object with properties x, y, angle, width, height, and speed.
         * @param {Wall} wall - Wall object with properties x, y, width, and height.
         * @returns {boolean} - True if collision is detected, otherwise false.
         */
        isBulletAndWallCollision(bullet, wall) {
            return collisionFomulars.isRectangleAndRolatedRectangleCollision(bullet, wall);
        },
    }
}

class GameEnvDrawer {

}

class GameCollisionChecker {
    
}