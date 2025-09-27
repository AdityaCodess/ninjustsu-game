export default class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.color = 'brown';

        // --- UPDATED: HEALTH SYSTEM ---
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.markedForDeletion = false;

        this.isHit = false;
        this.hitDuration = 150;
        this.hitTimer = 0;
    }

    takeDamage(amount) {
        this.isHit = true;
        this.hitTimer = this.hitDuration;
        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0; // Prevent health from going negative
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
        // Draw the enemy's body
        if (this.isHit) {
            context.fillStyle = 'red';
        } else {
            context.fillStyle = this.color;
        }
        context.fillRect(this.x, this.y, this.width, this.height);

        // --- NEW: DRAW HEALTH BAR ---
        // Only draw the health bar if the enemy has taken damage
        if (this.health < this.maxHealth) {
            const healthBarHeight = 10;
            const healthBarWidth = this.width;
            const healthBarX = this.x;
            const healthBarY = this.y - healthBarHeight - 5; // Position 5px above the enemy

            // Draw the background of the health bar (red)
            context.fillStyle = '#c0392b'; // A dark red
            context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

            // Calculate the width of the current health
            const currentHealthWidth = (this.health / this.maxHealth) * healthBarWidth;

            // Draw the foreground of the health bar (green)
            context.fillStyle = '#2ecc71'; // A bright green
            context.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
        }
    }
}