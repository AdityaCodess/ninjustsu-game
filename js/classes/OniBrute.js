import Enemy from './Enemy.js';

export default class OniBrute extends Enemy {
    constructor(x, y, player, spriteImage) {
        super(x, y);
        this.player = player;
        this.image = spriteImage; // Use the loaded image

        this.width = 150;
        this.height = 150;
        this.maxHealth = 200;
        this.health = this.maxHealth;
        this.speed = 0.15;
        
        this.detectionRange = 500;
        this.attackRange = 120;
        
        this.isAttacking = false;
        this.attackDuration = 500;
        this.attackCooldown = 2000;
        this.attackTimer = 0;
        this.attackCooldownTimer = 0;
        this.hitbox = { x: 0, y: 0, width: 150, height: 100 };
    }

    update(deltaTime) {
        super.update(deltaTime); // Still use parent for hit flash timer

        if (this.attackTimer > 0) this.attackTimer -= deltaTime;
        if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= deltaTime;

        if (this.isAttacking && this.attackTimer <= 0) {
            this.isAttacking = false;
        }

        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const selfCenterX = this.x + this.width / 2;
        const selfCenterY = this.y + this.height / 2;
        const dx = playerCenterX - selfCenterX;
        const dy = playerCenterY - selfCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!this.isAttacking) {
            if (distance < this.attackRange && this.attackCooldownTimer <= 0) {
                this.isAttacking = true;
                this.attackTimer = this.attackDuration;
                this.attackCooldownTimer = this.attackCooldown;
                const angle = Math.atan2(dy, dx);
                this.hitbox.x = selfCenterX + (Math.cos(angle) * (this.width / 2)) - this.hitbox.width / 2;
                this.hitbox.y = selfCenterY + (Math.sin(angle) * (this.height / 2)) - this.hitbox.height / 2;

            } else if (distance < this.detectionRange && distance > 0) { // Check distance > 0 to prevent NaN
                this.x += (dx / distance) * this.speed * deltaTime;
                this.y += (dy / distance) * this.speed * deltaTime;
            }
        }
    }

    draw(context) {
        // Apply a red tint if hit
        if (this.isHit) {
            context.save();
            context.globalAlpha = 0.5;
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.restore();
        }
        
        // Draw the sprite
        context.drawImage(this.image, this.x, this.y, this.width, this.height);

        // Draw Health Bar
        if (this.health < this.maxHealth) {
            const healthBarHeight = 10;
            const healthBarWidth = this.width;
            const healthBarX = this.x;
            const healthBarY = this.y - healthBarHeight - 5;
            context.fillStyle = '#c0392b';
            context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
            const currentHealthWidth = (this.health / this.maxHealth) * healthBarWidth;
            context.fillStyle = '#2ecc71';
            context.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
        }

        // Draw attack hitbox for debugging
        if (this.isAttacking) {
            context.fillStyle = 'rgba(255, 165, 0, 0.5)';
            context.fillRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height);
        }
    }
}