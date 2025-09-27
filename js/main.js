import Player from './classes/Player.js';
import InputHandler from './input.js';
import { loadPlayerSprite } from './utils/assets.js';
import World from './classes/World.js';
import Camera from './classes/Camera.js';
import Enemy from './classes/Enemy.js';
import OniBrute from './classes/OniBrute.js';

async function main() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    console.log("Game engine starting...");

    const world = new World(3000, 2000);
    const playerSprite = await loadPlayerSprite();
    
    const player = new Player(world.width, world.height, playerSprite);
    const input = new InputHandler();
    const camera = new Camera(player, world.width, world.height, canvas.width, canvas.height);

    let enemies = [];
    enemies.push(new OniBrute(player.x + 500, player.y, player));

    let lastTime = 0;

    function gameLoop(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // --- UPDATE PHASE ---
        player.update(input, deltaTime, camera, enemies);
        camera.update();
        enemies.forEach(enemy => enemy.update(deltaTime));

        // --- COLLISION DETECTION ---
        enemies.forEach(enemy => {
            // Check if player attack hits enemy
            if (player.isAttacking) {
                if (player.hitbox.x < enemy.x + enemy.width &&
                    player.hitbox.x + player.hitbox.width > enemy.x &&
                    player.hitbox.y < enemy.y + enemy.height &&
                    player.hitbox.y + player.hitbox.height > enemy.y) {
                    enemy.takeDamage(player.attackDamage);
                    // Prevent one swing from hitting multiple times
                    player.isAttacking = false;
                }
            }

            // Check if enemy attack hits player
            if (enemy.isAttacking) {
                if (enemy.hitbox.x < player.x + player.width &&
                    enemy.hitbox.x + enemy.hitbox.width > player.x &&
                    enemy.hitbox.y < player.y + player.height &&
                    enemy.hitbox.y + enemy.hitbox.height > player.y) {
                    if (player.isParrying) {
                        console.log("PARRIED!");
                        // We can add a stun effect later
                    } else {
                        player.takeDamage(10);
                    }
                    // Prevent one swing from hitting multiple times
                    enemy.isAttacking = false;
                }
            }
        });
        
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);

        // --- DRAW PHASE ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        world.draw(ctx);
        enemies.forEach(enemy => enemy.draw(ctx));
        player.draw(ctx);

        ctx.restore();
        
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

main();