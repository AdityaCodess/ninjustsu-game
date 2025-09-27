import Enemy from './Enemy.js';

export default class FireSlime extends Enemy {
    // UPDATED: The constructor now accepts the spritesheet directly
    constructor(x, y, player, spritesheet) {
        super(x, y);
        this.player = player;
        this.spritesheet = spritesheet; // This line is now correct

        // Animation
        this.cols = 6;
        this.rows = 4;
        this.spriteWidth = this.spritesheet.width / this.cols;
        this.spriteHeight = this.spritesheet.height / this.rows;
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 10;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;

        // Tuned Stats
        this.width = 120;
        this.height = 120;
        this.maxHealth = 40;
        this.health = this.maxHealth;
        this.speed = 0.12;
        
        // Melee Attack
        this.isAttacking = false;
        this.attackRange = 60;
        this.hitbox = { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    update(deltaTime) {
        super.update(deltaTime);

        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const selfCenterX = this.x + this.width / 2;
        const selfCenterY = this.y + this.height / 2;
        const dx = playerCenterX - selfCenterX;
        const dy = playerCenterY - selfCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.attackRange) {
            this.isAttacking = false;
            this.x += (dx / distance) * this.speed * deltaTime;
            this.y += (dy / distance) * this.speed * deltaTime;
        } else {
            this.isAttacking = true;
        }
        
        if (this.frameTimer > this.frameInterval) {
            this.frameX++;
            if (this.frameX >= this.cols) {
                this.frameX = 0;
                this.frameY++;
                if (this.frameY >= this.rows) {
                    this.frameY = 0;
                }
            }
            this.frameTimer = 0;
        } else {
            this.frameTimer += deltaTime;
        }

        this.hitbox.x = this.x;
        this.hitbox.y = this.y;
    }

    draw(context) {
        if (this.isHit) {
            context.save();
            context.globalAlpha = 0.5;
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.restore();
        }
        
        context.drawImage(
            this.spritesheet,
            this.frameX * this.spriteWidth,
            this.frameY * this.spriteHeight,
            this.spriteWidth, this.spriteHeight,
            this.x, this.y,
            this.width, this.height
        );

        if (this.health < this.maxHealth) {
            const healthBarHeight = 8;
            const healthBarWidth = this.width;
            const healthBarX = this.x;
            const healthBarY = this.y - healthBarHeight - 5;
            context.fillStyle = '#c03a2b';
            context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
            const currentHealthWidth = (this.health / this.maxHealth) * healthBarWidth;
            context.fillStyle = '#2ecc71';
            context.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
        }
    }
}