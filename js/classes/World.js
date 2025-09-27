export default class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.color = '#3a3a3a';

        // Create an array to hold some simple background objects
        this.scenery = [];
        for (let i = 0; i < 50; i++) {
            this.scenery.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 50 + 20 // Random size between 20 and 70
            });
        }
    }

    draw(context) {
        // Draw the main background
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.width, this.height);

        // Loop through the scenery objects and draw them
        context.fillStyle = 'white';
        this.scenery.forEach(item => {
            context.fillRect(item.x, item.y, item.size, item.size);
        });
    }
}