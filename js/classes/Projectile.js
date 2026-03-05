export default class Projectile {
    constructor(x, y, velocityX, velocityY, image) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.image = image;
        
        // --- TUNED: Increased hitbox size ---
        this.width = 40; // Increased from 24
        this.height = 40; // Increased from 24

        this.speed = 0.8;
        this.damage = 10;
        this.rotation = 0;
        this.rotationSpeed = 0.5;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.x += this.velocityX * this.speed * deltaTime;
        this.y += this.velocityY * this.speed * deltaTime;
        this.rotation += this.rotationSpeed * deltaTime * 0.1;

        // Boundary check
        if (this.x < 0 || this.x > 4000 || this.y < 0 || this.y > 3000) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotation);
        // Draw the visual sprite slightly smaller than the hitbox
        context.drawImage(this.image, -this.width / 2 + 8, -this.height / 2 + 8, this.width - 16, this.height - 16);
        context.restore();
    }
}