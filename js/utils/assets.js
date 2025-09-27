// This function now loads both the idle sprite and the run animation frames.
export function loadPlayerSprite() {
    // Promise for the idle image
    const idlePromise = new Promise((resolve, reject) => {
        const idleImage = new Image();
        idleImage.src = 'assets/sprites/player/player_idle.png';
        idleImage.onload = () => resolve(idleImage);
        idleImage.onerror = () => reject(new Error("Could not load player idle sprite"));
    });

    // Promises for the run animation frames
    const runPromises = [];
    const frameCount = 10;
    for (let i = 0; i < frameCount; i++) {
        const promise = new Promise((resolve, reject) => {
            const image = new Image();
            const frameNumber = String(i).padStart(2, '0');
            image.src = `assets/sprites/player/run_anim/player_run_${frameNumber}.png`;
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Could not load frame player_run_${frameNumber}.png`));
        });
        runPromises.push(promise);
    }

    // Wait for all promises to resolve
    return Promise.all([idlePromise, Promise.all(runPromises)])
        .then(([idle, run]) => {
            // Return the loaded assets as a structured object
            return { idle, run };
        });
}