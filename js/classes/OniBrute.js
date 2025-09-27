import Enemy from './Enemy.js';

export default class OniBrute extends Enemy {
    constructor(x, y, player) {
        super(x, y); // Call the parent constructor
        this.player = player; // The enemy needs to know about the player to chase it

        this.width = 150;
        this.height = 150;
        this.color = '#8e44ad'; // A purple color for the brute
        this.maxHealth = 200;
        this.health = this.maxHealth;
        this.speed = 0.15;
        
        // AI Properties
        this.detectionRange = 500;
        this.attackRange = 120;
        
        // Attack Properties
        this.isAttacking = false;
        this.attackDuration = 500;
        this.attackCooldown = 2000;
        this.attackTimer = 0;
        this.attackCooldownTimer = 0;
        this.hitbox = { x: 0, y: 0, width: 150, height: 100 };
    }

    update(deltaTime) {
        super.update(deltaTime); // Run the parent's update logic (for hit flashes)

        // Timers
        if (this.attackTimer > 0) this.attackTimer -= deltaTime;
        if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= deltaTime;

        // State transitions
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

        // AI Logic
        if (!this.isAttacking) {
            if (distance < this.attackRange && this.attackCooldownTimer <= 0) {
                // If in attack range and cooldown is over, ATTACK
                this.isAttacking = true;
                this.attackTimer = this.attackDuration;
                this.attackCooldownTimer = this.attackCooldown;
                // Position hitbox in front of the brute, towards the player
                const angle = Math.atan2(dy, dx);
                this.hitbox.x = selfCenterX + (Math.cos(angle) * (this.width / 2)) - this.hitbox.width / 2;
                this.hitbox.y = selfCenterY + (Math.sin(angle) * (this.height / 2)) - this.hitbox.height / 2;

            } else if (distance < this.detectionRange) {
                // If in detection range but not attack range, CHASE
                this.x += (dx / distance) * this.speed * deltaTime;
                this.y += (dy / distance) * this.speed * deltaTime;
            }
        }
    }

    draw(context) {
        super.draw(context); // Run the parent's draw logic (body and health bar)

        // Draw attack hitbox for debugging
        if (this.isAttacking) {
            context.fillStyle = 'rgba(255, 165, 0, 0.5)'; // Semi-transparent orange
            context.fillRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height);
        }
    }
}