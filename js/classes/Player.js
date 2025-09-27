export default class Player {
    constructor(gameWidth, gameHeight, playerAssets) {
        this.worldWidth = gameWidth;
        this.worldHeight = gameHeight;
        
        this.idleImage = playerAssets.idle;
        this.runImages = playerAssets.run;
        this.attackImages = playerAssets.attack;
        this.image = this.idleImage;

        this.states = {
            IDLE: 0,
            RUNNING: 1,
            DASHING: 2,
            ATTACK_LUNGE: 3,
            ATTACK_STRIKE: 4,
            ATTACK_RETURN: 5,
            PARRYING: 6,
        };
        this.state = this.states.IDLE;

        this.frameX = 0;
        this.fps = 30;
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
        this.lastMoveX = 1;
        this.lastMoveY = 0;
        
        this.isDashing = false;
        this.dashSpeed = 2;
        this.dashDuration = 150;
        this.dashCooldown = 1000;
        this.dashTimer = 0;
        this.dashCooldownTimer = 0;
        
        this.attackCooldown = 800;
        this.attackCooldownTimer = 0;
        this.attackRange = 250;
        this.attackDamage = 20; // TUNED: Increased from 5 to 20
        this.attackTarget = null;
        this.originalPosition = { x: 0, y: 0 };
        this.damageDealt = false;

        this.maxHealth = 200;
        this.health = this.maxHealth;

        this.isParrying = false;
        this.parryDuration = 250;
        this.parryCooldown = 1500;
        this.parryTimer = 0;
        this.parryCooldownTimer = 0;

        // --- NEW: INVINCIBILITY PROPERTIES ---
        this.isInvincible = false;
        this.invincibilityDuration = 1000; // 1 second of invincibility
        this.invincibilityTimer = 0;
    }
    
    takeDamage(amount) {
        // Can't take damage if invincible
        if (this.isInvincible) return;

        this.health -= amount;
        this.isInvincible = true;
        this.invincibilityTimer = this.invincibilityDuration;
        console.log(`Player took ${amount} damage. Health is now ${this.health}`);
        if (this.health <= 0) {
            console.log("Player has been defeated!");
        }
    }

    update(input, deltaTime, camera, enemies) {
        // Timers
        if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= deltaTime;
        if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= deltaTime;
        if (this.parryCooldownTimer > 0) this.parryCooldownTimer -= deltaTime;
        
        // NEW: Invincibility timer
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= deltaTime;
        } else {
            this.isInvincible = false;
        }

        this.handleInput(input, enemies);
        
        switch (this.state) {
            case this.states.IDLE:
            case this.states.RUNNING:
                this.handleMovement(input, deltaTime);
                this.animate(this.runImages, this.isMoving, deltaTime);
                break;
            case this.states.DASHING:
                if (this.dashTimer > 0) {
                    this.dashTimer -= deltaTime;
                    const dashSpeed = this.speed * this.dashSpeed * deltaTime;
                    this.x += this.lastMoveX * dashSpeed;
                    this.y += this.lastMoveY * dashSpeed;
                    this.animate(this.runImages, true, deltaTime);
                } else {
                    this.state = this.states.IDLE;
                }
                break;
            case this.states.PARRYING:
                if (this.parryTimer > 0) {
                    this.parryTimer -= deltaTime;
                } else {
                    this.state = this.states.IDLE;
                }
                break;
            case this.states.ATTACK_LUNGE:
                const targetX = this.attackTarget.x + this.attackTarget.width / 2 - this.width / 2;
                const targetY = this.attackTarget.y + this.attackTarget.height / 2 - this.height / 2;
                if (this.moveTo(targetX, targetY, this.speed * 3 * deltaTime)) {
                    this.state = this.states.ATTACK_STRIKE;
                    this.frameX = 0;
                    this.frameTimer = 0;
                }
                this.animate(this.runImages, true, deltaTime);
                break;
            case this.states.ATTACK_STRIKE:
                this.frameTimer += deltaTime;
                if (this.frameTimer > this.frameInterval) {
                    this.frameX++;
                    this.frameTimer = 0;
                    
                    if (this.frameX === Math.floor(this.attackImages.length / 2) && !this.damageDealt) {
                        this.attackTarget.takeDamage(this.attackDamage);
                        this.damageDealt = true;
                    }
                }
                
                if (this.frameX >= this.attackImages.length) {
                    this.state = this.states.ATTACK_RETURN;
                }
                this.image = this.attackImages[this.frameX] || this.attackImages[this.attackImages.length - 1];
                break;
            case this.states.ATTACK_RETURN:
                if (this.moveTo(this.originalPosition.x, this.originalPosition.y, this.speed * 4 * deltaTime)) {
                    this.state = this.states.IDLE;
                }
                this.animate(this.runImages, true, deltaTime);
                break;
        }

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.worldWidth) this.x = this.worldWidth - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.worldHeight) this.y = this.worldHeight - this.height;
    }

    handleInput(input, enemies) {
        if (this.state === this.states.ATTACK_LUNGE || this.state === this.states.ATTACK_STRIKE || this.state === this.states.ATTACK_RETURN || this.state === this.states.DASHING) return;

        if (input.parryPressed && this.parryCooldownTimer <= 0) {
            this.state = this.states.PARRYING;
            this.parryTimer = this.parryDuration;
            this.parryCooldownTimer = this.parryCooldown;
        }
        else if (input.attackPressed && this.attackCooldownTimer <= 0) {
            let closestEnemy = this.findClosestEnemy(enemies);
            if (closestEnemy) {
                this.state = this.states.ATTACK_LUNGE;
                this.attackTarget = closestEnemy;
                this.originalPosition = { x: this.x, y: this.y };
                this.attackCooldownTimer = this.attackCooldown;
                this.damageDealt = false;
                this.lastMoveX = (closestEnemy.x > this.x) ? 1 : -1;
            }
        }
        else if (input.keys.includes('Shift') && this.dashCooldownTimer <= 0) {
            this.state = this.states.DASHING;
            this.dashTimer = this.dashDuration;
            this.dashCooldownTimer = this.dashCooldown;
        }
        else if (input.keys.some(key => ['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key))) {
            this.state = this.states.RUNNING;
        } else {
            this.state = this.states.IDLE;
        }
        input.attackPressed = false;
    }

    handleMovement(input, deltaTime) {
        const currentSpeed = this.speed * deltaTime;
        this.isMoving = false;
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
    }

    findClosestEnemy(enemies) {
        let closestEnemy = null;
        let minDistance = this.attackRange;
        enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - this.x)**2 + (enemy.y - this.y)**2);
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        });
        return closestEnemy;
    }
    
    moveTo(targetX, targetY, speed) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < speed) {
            this.x = targetX;
            this.y = targetY;
            return true;
        }
        this.x += (dx / distance) * speed;
        this.y += (dy / distance) * speed;
        return false;
    }
    
    animate(images, isMoving, deltaTime) {
        if (!isMoving) {
            this.frameX = 0;
            this.image = this.idleImage;
            return;
        }
        if (this.frameTimer > this.frameInterval) {
            this.frameX = (this.frameX + 1) % images.length;
            this.frameTimer = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        this.image = images[this.frameX];
    }

    draw(context) {
        context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(this.x + this.width / 2, this.y + this.height / 2, this.attackRange, 0, Math.PI * 2);
        context.stroke();

        if (this.state === this.states.PARRYING) {
            context.fillStyle = 'rgba(0, 150, 255, 0.5)';
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10, 0, Math.PI * 2);
            context.fill();
        }

        // NEW: Invincibility Flash
        if (this.isInvincible) {
            context.save();
            context.globalAlpha = 0.5;
        }

        if (this.lastMoveX === 1) {
            context.save();
            context.scale(-1, 1);
            context.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
            context.restore();
        } else {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        // NEW: Restore context after drawing if invincible
        if (this.isInvincible) {
            context.restore();
        }
    }
}