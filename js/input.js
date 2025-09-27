export default class InputHandler {
    constructor() {
        this.keys = [];
        this.attackPressed = false;
        this.parryPressed = false;

        this.mouseX = 0;
        this.mouseY = 0;

        window.addEventListener('keydown', (e) => {
            // Replaced 'f' with ' ' (Spacebar), added 'Shift'
            const validKeys = ['d', 'ArrowRight', 'a', 'ArrowLeft', 'w', 'ArrowUp', 's', 'ArrowDown', ' ', 'Shift'];
            if (validKeys.includes(e.key) && this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
            // Attack is now Spacebar
            if (e.key === ' ') this.attackPressed = true;
        });

        window.addEventListener('keyup', (e) => {
            const validKeys = ['d', 'ArrowRight', 'a', 'ArrowLeft', 'w', 'ArrowUp', 's', 'ArrowDown', ' ', 'Shift'];
            if (validKeys.includes(e.key)) {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
            // Attack is now Spacebar
            if (e.key === ' ') this.attackPressed = false;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.attackPressed = true; // Left click
            if (e.button === 2) this.parryPressed = true;  // Right click
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.attackPressed = false;
            if (e.button === 2) this.parryPressed = false;   // Right click
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Prevent context menu on right click
        window.addEventListener('contextmenu', e => e.preventDefault());
    }
}