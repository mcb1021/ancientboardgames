// ============================================
// ANCIENT BOARD GAMES - AUTHENTICATION
// ============================================

const Auth = {
    user: null,
    db: null,
    initialized: false,
    
    // Initialize Firebase
    async init() {
        if (this.initialized) return;
        
        try {
            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(CONFIG.firebase);
            }
            
            this.db = firebase.database();
            
            // Listen for auth state changes
            firebase.auth().onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
            
            this.initialized = true;
            console.log('Auth initialized');
        } catch (error) {
            console.error('Auth init error:', error);
        }
    },
    
    // Handle auth state changes
    async handleAuthStateChange(user) {
        this.user = user;
        
        const authBtn = Utils.$('#auth-btn');
        const userInfo = Utils.$('#user-info');
        const userAvatar = Utils.$('#user-avatar');
        const userName = Utils.$('#user-name');
        const coinCount = Utils.$('.coin-count');
        
        if (user) {
            // User is signed in
            authBtn.classList.add('hidden');
            userInfo.classList.remove('hidden');
            
            // Set user display info
            userAvatar.src = user.photoURL || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%232A241C"/><circle cx="50" cy="40" r="20" fill="%23D4AF37"/><ellipse cx="50" cy="85" rx="35" ry="25" fill="%23D4AF37"/></svg>';
            userName.textContent = user.displayName || 'Player';
            
            // Load or create user profile
            await this.loadUserProfile(user);
            
            // Update coin display
            if (coinCount && this.userProfile) {
                coinCount.textContent = Utils.formatNumber(this.userProfile.coins || 0);
            }
            
            // Check subscription status and apply benefits
            await this.checkSubscription();
            
            Utils.toast(`Welcome back, ${user.displayName || 'Player'}!`, 'success');
        } else {
            // User is signed out
            authBtn.classList.remove('hidden');
            userInfo.classList.add('hidden');
            this.userProfile = null;
            document.body.classList.remove('premium-user');
        }
        
        // Emit auth change event
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user } }));
    },
    
    // Load or create user profile in database
    async loadUserProfile(user) {
        if (!user || !this.db) return null;
        
        const userRef = this.db.ref(`users/${user.uid}`);
        
        try {
            const snapshot = await userRef.once('value');
            let profile = snapshot.val();
            
            if (!profile) {
                // Create new profile
                profile = {
                    uid: user.uid,
                    displayName: user.displayName || 'Player',
                    email: user.email,
                    photoURL: user.photoURL,
                    coins: 100, // Starting coins
                    isPremium: false,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    stats: {
                        gamesPlayed: 0,
                        gamesWon: 0,
                        gamesLost: 0
                    },
                    ratings: {
                        ur: CONFIG?.rating?.initial || 1200,
                        senet: CONFIG?.rating?.initial || 1200,
                        hnefatafl: CONFIG?.rating?.initial || 1200,
                        morris: CONFIG?.rating?.initial || 1200,
                        mancala: CONFIG?.rating?.initial || 1200
                    },
                    inventory: [],
                    equipped: {},
                    settings: {
                        soundEnabled: true,
                        musicEnabled: true,
                        notifications: true
                    }
                };
                
                await userRef.set(profile);
            } else {
                // Update last login
                await userRef.update({
                    lastLogin: firebase.database.ServerValue.TIMESTAMP
                });
            }
            
            this.userProfile = profile;
            return profile;
        } catch (error) {
            console.error('Load profile error:', error);
            return null;
        }
    },
    
    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth().signInWithPopup(provider);
            Utils.hideModal('auth-modal');
        } catch (error) {
            console.error('Google sign in error:', error);
            Utils.toast('Sign in failed. Please try again.', 'error');
        }
    },
    
    // Sign in as guest
    async signInAsGuest() {
        try {
            const result = await firebase.auth().signInAnonymously();
            
            // Set a guest display name
            await result.user.updateProfile({
                displayName: `Guest_${Utils.generateId().slice(0, 6)}`
            });
            
            Utils.hideModal('auth-modal');
            Utils.toast('Playing as guest. Sign in to save progress!', 'info');
        } catch (error) {
            console.error('Guest sign in error:', error);
            Utils.toast('Guest login failed. Please try again.', 'error');
        }
    },
    
    // Sign out
    async signOut() {
        try {
            await firebase.auth().signOut();
            Utils.toast('Signed out successfully', 'info');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    },
    
    // Check if user is signed in
    isSignedIn() {
        return !!this.user;
    },
    
    // Get user's display name
    getUserName() {
        if (this.user) {
            return this.user.displayName || this.userProfile?.username || 'Player';
        }
        return 'Guest';
    },
    
    // Check if user is premium
    isPremium() {
        return this.userProfile?.isPremium || false;
    },
    
    // Get user's rating for a specific game
    getRating(game) {
        return this.userProfile?.ratings?.[game] || CONFIG.rating.initial;
    },
    
    // Update user's rating
    async updateRating(game, newRating) {
        if (!this.user || !this.db) return;
        
        try {
            await this.db.ref(`users/${this.user.uid}/ratings/${game}`).set(newRating);
            if (this.userProfile) {
                this.userProfile.ratings[game] = newRating;
            }
        } catch (error) {
            console.error('Update rating error:', error);
        }
    },
    
    // Update user stats after a game
    async updateStats(won) {
        if (!this.user || !this.db) return;
        
        const updates = {
            'stats/gamesPlayed': firebase.database.ServerValue.increment(1)
        };
        
        if (won) {
            updates['stats/gamesWon'] = firebase.database.ServerValue.increment(1);
        } else {
            updates['stats/gamesLost'] = firebase.database.ServerValue.increment(1);
        }
        
        try {
            await this.db.ref(`users/${this.user.uid}`).update(updates);
        } catch (error) {
            console.error('Update stats error:', error);
        }
    },
    
    // Add coins to user account
    async addCoins(amount) {
        if (!this.user || !this.db) return false;
        
        try {
            await this.db.ref(`users/${this.user.uid}/coins`).transaction(current => {
                return (current || 0) + amount;
            });
            
            if (this.userProfile) {
                this.userProfile.coins = (this.userProfile.coins || 0) + amount;
            }
            
            // Update display
            const coinCount = Utils.$('.coin-count');
            if (coinCount) {
                coinCount.textContent = Utils.formatNumber(this.userProfile.coins);
            }
            
            return true;
        } catch (error) {
            console.error('Add coins error:', error);
            return false;
        }
    },
    
    // Spend coins
    async spendCoins(amount) {
        if (!this.user || !this.db) return false;
        if ((this.userProfile?.coins || 0) < amount) return false;
        
        try {
            const result = await this.db.ref(`users/${this.user.uid}/coins`).transaction(current => {
                if ((current || 0) >= amount) {
                    return current - amount;
                }
                return; // Abort transaction
            });
            
            if (result.committed) {
                if (this.userProfile) {
                    this.userProfile.coins -= amount;
                }
                
                // Update display
                const coinCount = Utils.$('.coin-count');
                if (coinCount) {
                    coinCount.textContent = Utils.formatNumber(this.userProfile.coins);
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Spend coins error:', error);
            return false;
        }
    },
    
    // Add item to inventory
    async addToInventory(itemId) {
        if (!this.user || !this.db) return false;
        
        try {
            await this.db.ref(`users/${this.user.uid}/inventory`).transaction(inventory => {
                if (!inventory) inventory = [];
                if (!inventory.includes(itemId)) {
                    inventory.push(itemId);
                }
                return inventory;
            });
            
            if (this.userProfile && !this.userProfile.inventory.includes(itemId)) {
                this.userProfile.inventory.push(itemId);
            }
            
            return true;
        } catch (error) {
            console.error('Add to inventory error:', error);
            return false;
        }
    },
    
    // Check if user owns an item
    ownsItem(itemId) {
        return this.userProfile?.inventory?.includes(itemId) || false;
    },
    
    // Check if an item is equipped
    isEquipped(itemId) {
        if (!this.userProfile?.equipped) return false;
        const type = itemId.split('_')[0];
        return this.userProfile.equipped[type] === itemId;
    },
    
    // Get equipped item of a type
    getEquipped(type) {
        return this.userProfile?.equipped?.[type] || null;
    },
    
    // Equip an item
    async equipItem(itemId, type) {
        if (!this.user || !this.db) return false;
        if (!this.ownsItem(itemId)) return false;
        
        try {
            const itemType = itemId.split('_')[0]; // 'board', 'piece', or 'avatar'
            await this.db.ref(`users/${this.user.uid}/equipped/${itemType}`).set(itemId);
            
            if (!this.userProfile.equipped) {
                this.userProfile.equipped = {};
            }
            this.userProfile.equipped[itemType] = itemId;
            
            return true;
        } catch (error) {
            console.error('Equip item error:', error);
            return false;
        }
    },
    
    // Unequip an item
    async unequipItem(type) {
        if (!this.user || !this.db) return false;
        
        try {
            const itemType = type.split('_')[0];
            await this.db.ref(`users/${this.user.uid}/equipped/${itemType}`).remove();
            
            if (this.userProfile.equipped) {
                delete this.userProfile.equipped[itemType];
            }
            
            return true;
        } catch (error) {
            console.error('Unequip item error:', error);
            return false;
        }
    },
    
    // Check subscription status and give monthly coins
    async checkSubscription() {
        if (!this.user || !this.userProfile) return;
        
        const now = Date.now();
        const lastCoinGrant = this.userProfile.lastCoinGrant || 0;
        const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
        
        // If premium and hasn't received coins this month
        if (this.isPremium() && (now - lastCoinGrant > oneMonth)) {
            try {
                // Grant 500 monthly coins for premium
                await this.addCoins(500);
                await this.db.ref(`users/${this.user.uid}/lastCoinGrant`).set(now);
                this.userProfile.lastCoinGrant = now;
                Utils.toast('Premium bonus: +500 coins!', 'success');
            } catch (error) {
                console.error('Monthly coin grant error:', error);
            }
        }
        
        // Hide ads for premium users
        if (this.isPremium()) {
            document.body.classList.add('premium-user');
        } else {
            document.body.classList.remove('premium-user');
        }
    },
    
    // Apply penalty for leaving game
    async applyPenalty(type) {
        if (!this.user || !this.db) return;
        
        const penalty = CONFIG.penalties[type] || 0;
        if (penalty === 0) return;
        
        // For now, we'll track penalty points separately
        // In a full implementation, this could affect matchmaking
        try {
            await this.db.ref(`users/${this.user.uid}/penalties`).transaction(current => {
                return (current || 0) + Math.abs(penalty);
            });
            
            Utils.toast(`Penalty applied: ${penalty} points`, 'warning');
        } catch (error) {
            console.error('Apply penalty error:', error);
        }
    }
};

// Global auth functions for HTML onclick handlers
window.signInWithGoogle = () => Auth.signInWithGoogle();
window.playAsGuest = () => Auth.signInAsGuest();
window.signOut = () => Auth.signOut();

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
