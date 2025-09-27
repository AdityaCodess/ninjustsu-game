export default class Camera {
    constructor(target, worldWidth, worldHeight, screenWidth, screenHeight) {
        this.target = target; // The object to follow (our player)
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        // The top-left corner of the camera's view
        this.x = 0;
        this.y = 0;
    }

    update() {
        // Center the camera on the target
        this.x = this.target.x - this.screenWidth / 2;
        this.y = this.target.y - this.screenHeight / 2;

        // Clamp the camera to the world boundaries
        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.screenWidth));
        this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.screenHeight));
    }
}