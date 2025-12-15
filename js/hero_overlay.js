class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);

        // Initialize Audio Context
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API not supported");
        }
    }

    playBlip() {
        if (!this.audioCtx) return;

        // Resume context if suspended (browser policy)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // Digital "blip" sound characteristics
        oscillator.type = 'square';
        // Random pitch variation for realism (800Hz - 1500Hz)
        oscillator.frequency.value = 800 + Math.random() * 700;

        // Short envelope
        gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.1);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;
        let playedSound = false; // To limit sounds per frame

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;

                    // Play sound occasionally when chars change (e.g., 20% chance per frame)
                    // and only once per frame to avoid distortion
                    if (!playedSound && Math.random() < 0.2) {
                        this.playBlip();
                        playedSound = true;
                    }
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Sequence of phrases
const phrases = [
    'sistemas não se criam sozinhos',
    'eles são pensados',
    'orquestrados',
    'automatizados...',
    'bem vindo a uma realidade onde todos os seus sistemas podem trabalhar a seu favor.'
];

const el = document.querySelector('.scramble-text');
const fx = new TextScramble(el); // Removed 'window.fx =' to avoid global pollution if not needed

let counter = 0;
const next = () => {
    // If we've reached the end of the phrases, show the button and stop
    if (counter >= phrases.length) {
        document.querySelector('.cta-container').classList.add('visible');
        return;
    }

    fx.setText(phrases[counter]).then(() => {
        // Wait differently based on the phrase length or specific needs
        // The user wanted "one by one", implying a sequence.
        // For the last phrase, we want it to stay.
        if (counter < phrases.length) {
            // Standard delay for short phrases
            setTimeout(next, 2000);
        } else {
            // Final phrase: show button after a short delay
            setTimeout(() => {
                document.querySelector('.cta-container').classList.add('visible');
            }, 800);
        }
    });
    counter++;
};

// Start the sequence after a slight delay
setTimeout(next, 1500);
