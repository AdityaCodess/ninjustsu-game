export default class InputHandler {
    constructor() {
        this.keys = new Set();
        this.attackPressed = false;
        this.parryPressed = false;
        this.throwPressed = false;

        this.mouseX = 0;
        this.mouseY = 0;

        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            if (e.code === 'Space') this.attackPressed = true;
            if (e.code === 'KeyQ') this.throwPressed = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
            if (e.code === 'Space') this.attackPressed = false;
            if (e.code === 'KeyQ') this.throwPressed = false;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.attackPressed = true;
            if (e.button === 2) this.parryPressed = true;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.attackPressed = false;
            if (e.button === 2) this.parryPressed = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        window.addEventListener('contextmenu', e => e.preventDefault());
    }
}