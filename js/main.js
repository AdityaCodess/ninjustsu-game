import Player from './classes/Player.js';
import InputHandler from './input.js';
import { loadAssets } from './utils/assets.js';
import World from './classes/World.js';
import Camera from './classes/Camera.js';
import OniBrute from './classes/OniBrute.js';
import FireSlime from './classes/FireSlime.js';
import UI from './classes/UI.js';

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
    const assets = await loadAssets();
    
    const player = new Player(world.width, world.height, assets.player);
    const input = new InputHandler();
    const camera = new Camera(player, world.width, world.height, canvas.width, canvas.height);
    const ui = new UI(player);

    let enemies = [];
    let projectiles = [];
    
    enemies.push(new FireSlime(player.x - 400, player.y - 100, player, assets.enemies.fireSlimeSheet));
    enemies.push(new FireSlime(player.x + 400, player.y + 100, player, assets.enemies.fireSlimeSheet));
    enemies.push(new OniBrute(player.x + 1000, player.y, player, assets.enemies.oniBrute));


    let lastTime = 0;

    function gameLoop(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        player.update(input, deltaTime, camera, enemies, projectiles);
        camera.update();
        enemies.forEach(enemy => enemy.update(deltaTime));
        projectiles.forEach(p => p.update(deltaTime));

        if (!player.isInvincible) {
            enemies.forEach(enemy => {
                if (enemy.isAttacking && enemy.hitbox) {
                    if (enemy.hitbox.x < player.x + player.width &&
                        enemy.hitbox.x + enemy.hitbox.width > player.x &&
                        enemy.hitbox.y < player.y + player.height &&
                        enemy.hitbox.y + enemy.hitbox.height > player.y) {
                        if (player.state === player.states.PARRYING) {
                            console.log("PARRIED!");
                        } else {
                            const damage = (enemy instanceof OniBrute) ? 10 : 5;
                            player.takeDamage(damage);
                        }
                        if (enemy instanceof OniBrute) {
                            enemy.isAttacking = false;
                        }
                    }
                }
            });
        }
        
        projectiles.forEach(projectile => {
            enemies.forEach(enemy => {
                if (!enemy.markedForDeletion && 
                    projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y)
                {
                    enemy.takeDamage(projectile.damage);
                    projectile.markedForDeletion = true;
                }
            });
        });
        
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
        projectiles = projectiles.filter(p => !p.markedForDeletion);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        world.draw(ctx);
        enemies.forEach(enemy => enemy.draw(ctx));
        projectiles.forEach(p => p.draw(ctx));
        
        // --- UPDATED: Isolate the player's draw call ---
        ctx.save();
        player.draw(ctx);
        ctx.restore();

        ctx.restore();

        ui.draw(ctx);
        
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

main();