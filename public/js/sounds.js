// ============================================
// SOUND MANAGER - Ancient Board Games
// ============================================

const SoundManager = {
    enabled: true,
    volume: 0.5,
    sounds: {},
    
    // Initialize sound system with Web Audio API
    init() {
        this.audioContext = null;
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
        
        // Create audio context on first user interaction
        document.addEventListener('click', () => this.initAudioContext(), { once: true });
        document.addEventListener('keydown', () => this.initAudioContext(), { once: true });
        
        console.log('SoundManager initialized, enabled:', this.enabled);
    },
    
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateSounds();
        }
    },
    
    // Generate sounds programmatically (no external files needed!)
    generateSounds() {
        // Click/tap sound - short blip
        this.sounds.click = this.createToneBuffer(800, 0.05, 'sine', 0.3);
        
        // Move/place piece - slightly lower tone
        this.sounds.move = this.createToneBuffer(400, 0.1, 'sine', 0.4);
        
        // Capture/take piece - two-tone descending
        this.sounds.capture = this.createMultiToneBuffer([600, 300], [0.08, 0.12], 'square', 0.3);
        
        // Dice roll - noise burst
        this.sounds.dice = this.createNoiseBuffer(0.3, 0.4);
        
        // Win - triumphant ascending tones
        this.sounds.win = this.createMultiToneBuffer([400, 500, 600, 800], [0.15, 0.15, 0.15, 0.3], 'sine', 0.5);
        
        // Lose - descending sad tones
        this.sounds.lose = this.createMultiToneBuffer([400, 300, 200], [0.2, 0.2, 0.4], 'sine', 0.4);
        
        // Invalid move - short buzz
        this.sounds.invalid = this.createToneBuffer(150, 0.15, 'sawtooth', 0.3);
        
        // Turn notification - gentle ping
        this.sounds.turn = this.createToneBuffer(600, 0.15, 'sine', 0.3);
        
        // Mill formed (Morris) - satisfying chord
        this.sounds.mill = this.createChordBuffer([400, 500, 600], 0.3, 0.4);
        
        // Rosette landed (Ur) - magical sparkle
        this.sounds.rosette = this.createMultiToneBuffer([800, 1000, 1200], [0.1, 0.1, 0.2], 'sine', 0.3);
        
        console.log('Sounds generated');
    },
    
    // Create a simple tone buffer
    createToneBuffer(frequency, duration, type = 'sine', gainValue = 0.5) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let sample;
            
            switch (type) {
                case 'square':
                    sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'sawtooth':
                    sample = 2 * (t * frequency - Math.floor(0.5 + t * frequency));
                    break;
                default: // sine
                    sample = Math.sin(2 * Math.PI * frequency * t);
            }
            
            // Apply envelope (fade out)
            const envelope = 1 - (i / length);
            data[i] = sample * envelope * gainValue;
        }
        
        return buffer;
    },
    
    // Create multi-tone sequence
    createMultiToneBuffer(frequencies, durations, type = 'sine', gainValue = 0.5) {
        const sampleRate = this.audioContext.sampleRate;
        const totalDuration = durations.reduce((a, b) => a + b, 0);
        const totalLength = Math.ceil(sampleRate * totalDuration);
        const buffer = this.audioContext.createBuffer(1, totalLength, sampleRate);
        const data = buffer.getChannelData(0);
        
        let offset = 0;
        for (let f = 0; f < frequencies.length; f++) {
            const freq = frequencies[f];
            const dur = durations[f];
            const length = Math.ceil(sampleRate * dur);
            
            for (let i = 0; i < length && (offset + i) < totalLength; i++) {
                const t = i / sampleRate;
                let sample = Math.sin(2 * Math.PI * freq * t);
                const envelope = 1 - (i / length) * 0.5;
                data[offset + i] = sample * envelope * gainValue;
            }
            offset += length;
        }
        
        return buffer;
    },
    
    // Create chord (multiple frequencies at once)
    createChordBuffer(frequencies, duration, gainValue = 0.5) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            for (const freq of frequencies) {
                sample += Math.sin(2 * Math.PI * freq * t);
            }
            sample /= frequencies.length;
            
            const envelope = 1 - (i / length);
            data[i] = sample * envelope * gainValue;
        }
        
        return buffer;
    },
    
    // Create noise buffer (for dice)
    createNoiseBuffer(duration, gainValue = 0.5) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const envelope = 1 - (i / length);
            data[i] = (Math.random() * 2 - 1) * envelope * gainValue;
        }
        
        return buffer;
    },
    
    // Play a sound
    play(soundName) {
        if (!this.enabled || !this.audioContext || !this.sounds[soundName]) {
            return;
        }
        
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            gainNode.gain.value = this.volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    },
    
    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        return this.enabled;
    },
    
    // Set volume (0-1)
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        localStorage.setItem('soundVolume', this.volume);
    },
    
    // Enable sounds
    enable() {
        this.enabled = true;
        localStorage.setItem('soundEnabled', 'true');
    },
    
    // Disable sounds
    disable() {
        this.enabled = false;
        localStorage.setItem('soundEnabled', 'false');
    }
};

// Initialize on load
SoundManager.init();

// Make globally available
window.SoundManager = SoundManager;
