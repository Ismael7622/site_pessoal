class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);

        // Initialize Custom Audio
        this.audio = new Audio('Writing on keyboard Sound Effect [Typing].mp3');
        this.audio.loop = true; // Loop in case the text takes longer than the sound
        this.audio.volume = 0.5; // Reasonable volume
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

        // Start playing audio when text starts
        this.audio.currentTime = 0;
        this.audio.play().catch(e => console.log("Audio play failed (interaction required):", e));

        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            // Stop audio abruptly when finished
            this.audio.pause();
            this.audio.currentTime = 0;
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

// Localization Data
const translations = {
    pt: {
        phrases: [
            'sistemas não se criam sozinhos',
            'eles são pensados',
            'orquestrados',
            'automatizados...',
            'bem vindo a uma realidade onde todos os seus sistemas podem trabalhar a seu favor.'
        ],
        btn: '[ acessar o sistema ]'
    },
    en: {
        phrases: [
            'systems don\'t create themselves',
            'they are thought out',
            'orchestrated',
            'automated...',
            'welcome to a reality where all your systems can work in your favor.'
        ],
        btn: '[ access system ]'
    },
    es: {
        phrases: [
            'los sistemas no se crean solos',
            'son pensados',
            'orquestados',
            'automatizados...',
            'bienvenido a una realidad donde todos sus sistemas pueden trabajar a su favor.'
        ],
        btn: '[ acceder al sistema ]'
    },
    fr: {
        phrases: [
            'les systèmes ne se créent pas tout seuls',
            'ils sont pensés',
            'orchestrés',
            'automatisés...',
            'bienvenue dans une réalité où tous vos systèmes peuvent travailler en votre faveur.'
        ],
        btn: '[ accéder au système ]'
    }
};

const el = document.querySelector('.scramble-text');
const fx = new TextScramble(el);
const ctaBtn = document.querySelector('.system-btn');
const langOverlay = document.getElementById('lang-overlay');

let currentPhrases = [];
let counter = 0;

const next = () => {
    // If we've reached the end of the phrases, show the button and stop
    if (counter >= currentPhrases.length) {
        document.querySelector('.cta-container').classList.add('visible');
        return;
    }

    fx.setText(currentPhrases[counter]).then(() => {
        if (counter < currentPhrases.length) {
            // Standard delay
            setTimeout(next, 2000);
        } else {
            // Final delay before button
            setTimeout(() => {
                document.querySelector('.cta-container').classList.add('visible');
            }, 800);
        }
    });
    counter++;
};

// Handle Language Selection
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        const data = translations[lang];

        // 1. Set data
        currentPhrases = data.phrases;
        ctaBtn.innerText = data.btn;

        // 2. Unlock Audio (User interaction happened!)
        // Play a silent note or just play the typing sound briefly to "warm up" if needed, 
        // but our logic plays it on setText anyway.
        // We assume fx.audio is ready.

        // 3. Hide overlay
        langOverlay.classList.add('hidden');

        // 4. Start sequence after slight delay
        setTimeout(next, 1000);
    });
});
