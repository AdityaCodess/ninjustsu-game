export default class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.color = 'brown';

        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.markedForDeletion = false;

        this.isHit = false;
        this.hitDuration = 150;
        this.hitTimer = 0;
    }

    takeDamage(amount) {
        // --- DEBUGGING: Log every time damage is taken ---
        console.log(`DAMAGE! Amount: ${amount}. Health before: ${this.health}. New health: ${this.health - amount}`);

        this.isHit = true;
        this.hitTimer = this.hitDuration;
        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.markedForDeletion = true;
        }
    }

    update(deltaTime) {
        if (this.isHit && this.hitTimer > 0) {
            this.hitTimer -= deltaTime;
        } else {
            this.isHit = false;
        }
    }

    draw(context) {
        if (this.isHit) {
            context.fillStyle = 'red';
        } else {
            context.fillStyle = this.color;
        }
        context.fillRect(this.x, this.y, this.width, this.height);

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
    }
}