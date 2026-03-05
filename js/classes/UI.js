export default class UI {
    constructor(player) {
        this.player = player;
    }

    draw(context) {
        context.save();

        // Player Health Bar
        const barWidth = 250;
        const barHeight = 20;
        const x = 20;
        const y = 20;
        context.fillStyle = '#111';
        context.fillRect(x, y, barWidth, barHeight);
        const currentHealthWidth = (this.player.health / this.player.maxHealth) * barWidth;
        context.fillStyle = '#2ecc71';
        if (currentHealthWidth > 0) {
            context.fillRect(x, y, currentHealthWidth, barHeight);
        }
        context.fillStyle = 'white';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`${this.player.health} / ${this.player.maxHealth}`, x + barWidth / 2, y + barHeight / 2);

        // Shuriken Count
        context.font = '24px Arial';
        context.textAlign = 'left';
        context.fillText(`Shurikens: ${this.player.shurikenCount}`, 20, 60);

        context.restore();
    }
}