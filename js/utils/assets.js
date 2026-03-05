export function loadAssets() {
    // Player assets
    const playerIdlePromise = new Promise((resolve, reject) => {
        const image = new Image();
        image.src = 'assets/sprites/player/player_idle.png';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load player idle sprite"));
    });

    const playerRunPromises = [];
    for (let i = 0; i < 10; i++) {
        const promise = new Promise((resolve, reject) => {
            const image = new Image();
            const frameNumber = String(i).padStart(2, '0');
            image.src = `assets/sprites/player/run_anim/player_run_${frameNumber}.png`;
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Could not load frame player_run_${frameNumber}.png`));
        });
        playerRunPromises.push(promise);
    }
    
    const playerAttackPromises = [];
    for (let i = 0; i < 6; i++) {
        const promise = new Promise((resolve, reject) => {
            const image = new Image();
            const frameNumber = String(i).padStart(2, '0');
            image.src = `assets/sprites/player/attack_anim/player_attack_${frameNumber}.png`;
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Could not load frame player_attack_${frameNumber}.png`));
        });
        playerAttackPromises.push(promise);
    }
    
    // Enemy assets
    const oniBrutePromise = new Promise((resolve, reject) => {
        const image = new Image();
        image.src = 'assets/sprites/enemies/oni_brute.png';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load oni brute sprite"));
    });

    const fireSlimeSheetPromise = new Promise((resolve, reject) => {
        const image = new Image();
        image.src = 'assets/sprites/enemies/fire_slime_idle_sheet.png';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load fire slime idle sheet"));
    });
    
    // Shuriken asset (now considered a player asset)
    const shurikenPromise = new Promise((resolve, reject) => {
        const image = new Image();
        image.src = 'assets/sprites/fx/shuriken.png';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load shuriken sprite"));
    });

    // Combine all promises
    return Promise.all([
        playerIdlePromise,
        Promise.all(playerRunPromises),
        Promise.all(playerAttackPromises),
        oniBrutePromise,
        fireSlimeSheetPromise,
        shurikenPromise
    ]).then(([playerIdle, playerRun, playerAttack, oniBrute, fireSlimeSheet, shuriken]) => {
        // Return all loaded assets as a structured object
        return {
            player: {
                idle: playerIdle,
                run: playerRun,
                attack: playerAttack,
                shuriken: shuriken // The shuriken is now part of the player asset object
            },
            enemies: {
                oniBrute: oniBrute,
                fireSlimeSheet: fireSlimeSheet
            }
        };
    });
}