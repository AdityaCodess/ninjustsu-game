export default class Player {
    constructor(gameWidth, gameHeight, playerAssets) {
        this.worldWidth = gameWidth;
        this.worldHeight = gameHeight;
        
        this.idleImage = playerAssets.idle;
        this.runImages = playerAssets.run;
        this.image = this.idleImage;

        this.frameX = 0;
        this.maxFrame = this.runImages.length - 1;
        this.fps = 10;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;
        
        this.spriteWidth = this.idleImage.width;
        this.spriteHeight = this.idleImage.height;
        const desiredWidth = 100;
        const aspectRatio = this.spriteWidth / this.spriteHeight;
        this.width = desiredWidth;
        this.height = desiredWidth / aspectRatio;

        this.x = this.worldWidth / 2 - this.width / 2;
        this.y = this.worldHeight / 2 - this.height / 2;
        
        this.speed = 0.5;
        this.isMoving = false;
        
        this.isDashing = false;
        this.dashSpeed = 2;
        this.dashDuration = 150;
        this.dashCooldown = 1000;
        this.dashTimer = 0;
        this.dashCooldownTimer = 0;
        
        this.lastMoveX = 1;
        this.lastMoveY = 0;

        this.isAttacking = false;
        this.attackDuration = 200;
        this.attackCooldown = 500;
        this.attackTimer = 0;
        this.attackCooldownTimer = 0;
        this.hitbox = { x: 0, y: 0, width: 80, height: 80 };
        
        this.attackRange = 150;
        this.attackDamage = 25;

        // --- PLAYER HEALTH ---
        this.maxHealth = 100;
        this.health = this.maxHealth;

        // --- PARRY PROPERTIES ---
        this.isParrying = false;
        this.parryDuration = 250;
        this.parryCooldown = 1500;
        this.parryTimer = 0;
        this.parryCooldownTimer = 0;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        console.log(`Player took ${amount} damage. Health is now ${this.health}`);
        if (this.health <= 0) {
            console.log("Player has been defeated!");
        }
    }

    update(input, deltaTime, camera, enemies) {
        // --- TIMERS ---
        if (this.dashTimer > 0) this.dashTimer -= deltaTime;
        if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= deltaTime;
        if (this.attackTimer > 0) this.attackTimer -= deltaTime;
        if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= deltaTime;
        if (this.parryTimer > 0) this.parryTimer -= deltaTime;
        if (this.parryCooldownTimer > 0) this.parryCooldownTimer -= deltaTime;
        
        // --- STATE TRANSITIONS ---
        if (this.isDashing && this.dashTimer <= 0) this.isDashing = false;
        if (this.isAttacking && this.attackTimer <= 0) this.isAttacking = false;
        if (this.isParrying && this.parryTimer <= 0) this.isParrying = false;
        
        // --- INPUT HANDLING ---
        // Parry Input (highest priority)
        if (input.parryPressed && !this.isParrying && !this.isAttacking && !this.isDashing && this.parryCooldownTimer <= 0) {
            this.isParrying = true;
            this.parryTimer = this.parryDuration;
            this.parryCooldownTimer = this.parryCooldown;
        }

        // Attack Input
        if (input.attackPressed && !this.isAttacking && !this.isDashing && !this.isParrying && this.attackCooldownTimer <= 0) {
            if (input.keys.includes('f')) {
                const playerCenterX = this.x + this.width / 2;
                const playerCenterY = this.y + this.height / 2;
                let closestEnemy = null;
                let minDistance = this.attackRange;
                enemies.forEach(enemy => {
                    const enemyCenterX = enemy.x + enemy.width / 2;
                    const enemyCenterY = enemy.y + enemy.height / 2;
                    const dx = enemyCenterX - playerCenterX;
                    const dy = enemyCenterY - playerCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestEnemy = enemy;
                    }
                });
                if (closestEnemy) {
                    this.isAttacking = true;
                    this.attackTimer = this.attackDuration;
                    this.attackCooldownTimer = this.attackCooldown;
                    this.hitbox.x = closestEnemy.x + closestEnemy.width / 2 - this.hitbox.width / 2;
                    this.hitbox.y = closestEnemy.y + closestEnemy.height / 2 - this.hitbox.height / 2;
                    this.lastMoveX = (closestEnemy.x > this.x) ? 1 : -1;
                }
            } else {
                const mouseWorldX = input.mouseX + camera.x;
                const mouseWorldY = input.mouseY + camera.y;
                const playerCenterX = this.x + this.width / 2;
                const playerCenterY = this.y + this.height / 2;
                const dx = mouseWorldX - playerCenterX;
                const dy = mouseWorldY - playerCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.attackRange) {
                    this.isAttacking = true;
                    this.attackTimer = this.attackDuration;
                    this.attackCooldownTimer = this.attackCooldown;
                    this.hitbox.x = mouseWorldX - this.hitbox.width / 2;
                    this.hitbox.y = mouseWorldY - this.hitbox.height / 2;
                }
            }
            input.attackPressed = false;
        }

        // Dash Input
        if (input.keys.includes(' ') && !this.isDashing && !this.isAttacking && !this.isParrying && this.dashCooldownTimer <= 0) {
            this.isDashing = true;
            this.dashTimer = this.dashDuration;
            this.dashCooldownTimer = this.attackCooldown;
        }
        
        const currentSpeed = (this.isDashing ? this.speed * this.dashSpeed : this.speed) * deltaTime;
        this.isMoving = false;
        
        // Disable movement while attacking or parrying
        if (!this.isAttacking && !this.isParrying) {
            if (!this.isDashing) {
                let moveX = 0;
                let moveY = 0;
                if (input.keys.includes('d') || input.keys.includes('ArrowRight')) moveX = 1;
                else if (input.keys.includes('a') || input.keys.includes('ArrowLeft')) moveX = -1;
                if (input.keys.includes('w') || input.keys.includes('ArrowUp')) moveY = -1;
                else if (input.keys.includes('s') || input.keys.includes('ArrowDown')) moveY = 1;
                if (moveX !== 0 || moveY !== 0) {
                    this.isMoving = true;
                    if (moveX !== 0) this.lastMoveX = moveX;
                    this.lastMoveY = moveY;
                }
                this.x += moveX * currentSpeed;
                this.y += moveY * currentSpeed;
            } else {
                this.isMoving = true;
                this.x += this.lastMoveX * currentSpeed;
                this.y += this.lastMoveY * currentSpeed;
            }
        }
        
        // Animation Logic
        if (this.isMoving) {
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.image = this.runImages[this.frameX];
        } else {
            this.frameX = 0;
            this.image = this.idleImage;
        }

        // World Boundary
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.worldWidth) this.x = this.worldWidth - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.worldHeight) this.y = this.worldHeight - this.height;
    }

    draw(context) {
        // Attack Range Circle
        context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(this.x + this.width / 2, this.y + this.height / 2, this.attackRange, 0, Math.PI * 2);
        context.stroke();

        // Parry Visual
        if (this.isParrying) {
            context.fillStyle = 'rgba(0, 150, 255, 0.5)';
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10, 0, Math.PI * 2);
            context.fill();
        }

        // Sprite Flipping and Drawing
        if (this.lastMoveX === 1) {
            context.save();
            context.scale(-1, 1);
            context.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
            context.restore();
        } else {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        // Attack Hitbox
        if (this.isAttacking) {
            context.fillStyle = 'rgba(255, 255, 255, 0.5)';
            context.fillRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height);
        }
    }
}