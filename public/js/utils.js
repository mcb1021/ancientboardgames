// ============================================
// ANCIENT BOARD GAMES - UTILITY FUNCTIONS
// ============================================

const Utils = {
    // DOM helpers
    $(selector) {
        return document.querySelector(selector);
    },
    
    $$(selector) {
        return document.querySelectorAll(selector);
    },
    
    // Create element with attributes and children
    createElement(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'class') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([k, v]) => el.dataset[k] = v);
            } else {
                el.setAttribute(key, value);
            }
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                el.appendChild(child);
            }
        });
        return el;
    },
    
    // Toast notifications
    toast(message, type = 'info', duration = 3000) {
        const container = Utils.$('#toast-container');
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const toast = Utils.createElement('div', { class: `toast ${type}` }, [
            Utils.createElement('span', { class: 'toast-icon' }, [icons[type] || icons.info]),
            Utils.createElement('span', { class: 'toast-message' }, [message]),
            Utils.createElement('button', { 
                class: 'toast-close',
                onClick: () => toast.remove()
            }, ['×'])
        ]);
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    },
    
    // Modal helpers
    showModal(modalId) {
        const modal = Utils.$(`#${modalId}`);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    hideModal(modalId) {
        const modal = Utils.$(`#${modalId}`);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    hideAllModals() {
        Utils.$$('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },
    
    // Local storage helpers
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage remove error:', e);
                return false;
            }
        }
    },
    
    // Random number utilities
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    
    // Format helpers
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },
    
    formatCurrency(cents) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(cents / 100);
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date));
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Deep clone
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // URL helpers
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },
    
    setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },
    
    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Utils.toast('Copied to clipboard!', 'success');
            return true;
        } catch (e) {
            console.error('Copy failed:', e);
            Utils.toast('Failed to copy', 'error');
            return false;
        }
    },
    
    // Sound effects
    sounds: {},
    
    loadSound(name, url) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        Utils.sounds[name] = audio;
    },
    
    playSound(name, volume = 0.5) {
        const sound = Utils.sounds[name];
        if (sound) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    },
    
    // Animation helpers
    animate(element, keyframes, options = {}) {
        const defaults = {
            duration: 300,
            easing: 'ease',
            fill: 'forwards'
        };
        return element.animate(keyframes, { ...defaults, ...options });
    },
    
    // Wait helper
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // ELO rating calculation
    calculateElo(playerRating, opponentRating, won, kFactor = 32) {
        const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
        const actualScore = won ? 1 : 0;
        const newRating = Math.round(playerRating + kFactor * (actualScore - expectedScore));
        return Math.max(CONFIG.rating.minRating, newRating);
    },
    
    // Canvas drawing helpers
    canvas: {
        roundRect(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        },
        
        drawRosette(ctx, x, y, radius) {
            const petals = 8;
            ctx.save();
            ctx.translate(x, y);
            
            // Draw petals
            for (let i = 0; i < petals; i++) {
                ctx.rotate(Math.PI / (petals / 2));
                ctx.beginPath();
                ctx.ellipse(0, radius * 0.4, radius * 0.25, radius * 0.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(212, 175, 55, 0.6)';
                ctx.fill();
            }
            
            // Center circle
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = '#D4AF37';
            ctx.fill();
            
            ctx.restore();
        },
        
        createGradient(ctx, x, y, width, height, colors) {
            const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
            colors.forEach((color, index) => {
                gradient.addColorStop(index / (colors.length - 1), color);
            });
            return gradient;
        }
    }
};

// Make Utils globally available
window.Utils = Utils;
