// ============================================
// ANCIENT BOARD GAMES - MAIN APPLICATION
// ============================================

// Global state
let currentGame = null;
let currentPage = 'home';
let socket = null;

// Game class mapping - with fallback checks
const GameClasses = {};

// Safely add game classes if they exist
if (typeof UrGame !== 'undefined') GameClasses.ur = UrGame;
if (typeof SenetGame !== 'undefined') GameClasses.senet = SenetGame;
if (typeof HnefataflGame !== 'undefined') GameClasses.hnefatafl = HnefataflGame;
if (typeof MorrisGame !== 'undefined') GameClasses.morris = MorrisGame;
if (typeof MancalaGame !== 'undefined') GameClasses.mancala = MancalaGame;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    initViewToggle();
    initShop();
    initSocket();
    updateStats();
    
    // Check for URL parameters
    const gameParam = Utils.getQueryParam('game');
    const roomParam = Utils.getQueryParam('room');
    
    if (gameParam && GameClasses[gameParam]) {
        startQuickGame(gameParam);
    } else if (roomParam) {
        joinRoom(roomParam);
    }
});

// Navigation
function initNavigation() {
    const navBtns = Utils.$$('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Hide all pages
    Utils.$$('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = Utils.$(`#page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update nav buttons
    Utils.$$('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
    
    currentPage = page;
    
    // Page-specific initialization
    if (page === 'games') {
        renderGamesSelection();
    } else if (page === 'rankings') {
        loadRankings();
    } else if (page === 'lobby') {
        loadRooms();
    } else if (page === 'profile') {
        loadProfile();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Games selection page
function renderGamesSelection() {
    const container = Utils.$('.games-selection');
    if (!container) return;
    
    // Safety check for CONFIG
    if (typeof CONFIG === 'undefined' || !CONFIG.games) {
        container.innerHTML = '<p style="color: #D4AF37; text-align: center;">Loading games...</p>';
        console.error('CONFIG.games not available');
        return;
    }
    
    container.innerHTML = '';
    
    Object.entries(CONFIG.games).forEach(([key, game]) => {
        const card = Utils.createElement('div', { class: 'game-select-card', dataset: { game: key } }, [
            Utils.createElement('div', { class: 'game-select-header' }, [
                Utils.createElement('h3', {}, [game.name]),
                Utils.createElement('span', { class: 'game-era' }, [game.era])
            ]),
            Utils.createElement('p', {}, [game.description]),
            Utils.createElement('div', { class: 'game-select-actions' }, [
                Utils.createElement('button', { 
                    class: 'btn-primary',
                    onClick: () => showDifficultyModal(key)
                }, ['Play vs AI']),
                Utils.createElement('button', { 
                    class: 'btn-secondary',
                    onClick: () => {
                        Utils.$('#lobby-game-select').value = key;
                        navigateTo('lobby');
                    }
                }, ['Find Match']),
                Utils.createElement('button', { 
                    class: 'btn-secondary',
                    onClick: () => showGameInfo(key)
                }, ['Rules & History'])
            ])
        ]);
        container.appendChild(card);
    });
}

// Start a quick game against AI
// Store pending game info for difficulty selection
let pendingGameKey = null;

// Show difficulty selection modal
function showDifficultyModal(gameKey) {
    pendingGameKey = gameKey;
    const gameConfig = CONFIG.games[gameKey];
    
    const content = Utils.$('#difficulty-modal-content');
    if (content) {
        content.innerHTML = `
            <h2>Select Difficulty</h2>
            <p>Playing: ${gameConfig.name}</p>
            <div class="difficulty-options">
                <button class="btn-difficulty easy" onclick="startGameWithDifficulty('easy')">
                    <span class="diff-icon">🌱</span>
                    <span class="diff-name">Easy</span>
                    <span class="diff-desc">Relaxed gameplay, learning mode</span>
                </button>
                <button class="btn-difficulty medium" onclick="startGameWithDifficulty('medium')">
                    <span class="diff-icon">⚔️</span>
                    <span class="diff-name">Medium</span>
                    <span class="diff-desc">Balanced challenge</span>
                </button>
                <button class="btn-difficulty hard" onclick="startGameWithDifficulty('hard')">
                    <span class="diff-icon">🔥</span>
                    <span class="diff-name">Hard</span>
                    <span class="diff-desc">Expert AI opponent</span>
                </button>
            </div>
        `;
    }
    Utils.showModal('difficulty-modal');
}

// Start game with selected difficulty
function startGameWithDifficulty(difficulty) {
    Utils.hideModal('difficulty-modal');
    if (!pendingGameKey) return;
    startQuickGame(pendingGameKey, difficulty);
}

function startQuickGame(gameKey, difficulty = 'medium') {
    const GameClass = GameClasses[gameKey];
    if (!GameClass) {
        Utils.toast('Game not found', 'error');
        return;
    }
    
    // Navigate to play page
    navigateTo('play');
    
    // Get canvas
    const canvas = Utils.$('#game-canvas');
    if (!canvas) return;
    
    // Destroy existing game
    if (currentGame) {
        currentGame.destroy();
    }
    
    // Set canvas size based on game
    const gameConfig = CONFIG.games[gameKey];
    canvas.width = gameConfig.boardSize.width;
    canvas.height = gameConfig.boardSize.height;
    
    // Create new game
    currentGame = new GameClass(canvas, {
        mode: 'ai',
        aiDifficulty: difficulty,
        playerSide: 1
    });
    
    window.currentGame = currentGame;
    
    // Update UI
    Utils.$('#game-status').textContent = `Playing: ${gameConfig.name} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;
    updateTurnIndicator();
    updatePlayerNames(gameKey);
    
    // Setup dice button
    const diceBtn = Utils.$('#roll-dice-btn');
    if (diceBtn) {
        diceBtn.onclick = () => {
            if (currentGame && currentGame.rollDice) {
                currentGame.rollDice();
            }
        };
    }
    
    // Setup rules button
    const rulesBtn = Utils.$('#rules-btn');
    if (rulesBtn) {
        rulesBtn.onclick = () => showGameRules(gameKey);
    }
    
    // Setup resign button
    const resignBtn = Utils.$('#resign-btn');
    if (resignBtn) {
        resignBtn.onclick = () => {
            if (confirm('Are you sure you want to resign?')) {
                if (currentGame) {
                    currentGame.gameOver = true;
                    currentGame.winner = currentGame.currentPlayer === 1 ? 2 : 1;
                    currentGame.onGameEnd(currentGame.winner);
                }
            }
        };
    }
    
    Utils.toast(`Starting ${gameConfig.name}`, 'success');
}

function updateTurnIndicator() {
    const indicator = Utils.$('#turn-indicator');
    if (!indicator || !currentGame) return;
    
    const isYourTurn = currentGame.options.mode !== 'ai' || 
                       currentGame.currentPlayer === currentGame.options.playerSide;
    
    indicator.className = isYourTurn ? 'your-turn' : 'opponent-turn';
    indicator.textContent = isYourTurn ? 'Your Turn' : "Opponent's Turn";
}

// Update player names in the game UI
function updatePlayerNames(gameKey) {
    const player1Name = Utils.$('.player-1 .player-name');
    const player2Name = Utils.$('.player-2 .player-name');
    const player1Avatar = Utils.$('.player-1 .player-avatar');
    const player2Avatar = Utils.$('.player-2 .player-avatar');
    
    if (player1Name) {
        // Show user's name if signed in, otherwise "You"
        const userName = Auth.isSignedIn() ? (Auth.getUserName() || 'You') : 'You';
        player1Name.textContent = userName;
    }
    
    // Set player 1 avatar (user's equipped avatar)
    if (player1Avatar) {
        const equippedAvatar = Auth.getEquipped?.('avatar');
        if (equippedAvatar && window.ShopAssets) {
            const svg = window.ShopAssets.getSVG(equippedAvatar);
            if (svg) {
                player1Avatar.innerHTML = svg;
            }
        } else {
            // Default avatar
            player1Avatar.innerHTML = '';
        }
    }
    
    if (player2Name) {
        player2Name.textContent = 'AI Opponent';
    }
    
    // AI gets no avatar (or default)
    if (player2Avatar) {
        player2Avatar.innerHTML = '';
    }
}

// Show game rules popup while playing
function showGameRules(gameKey) {
    const game = CONFIG.games[gameKey];
    if (!game) return;
    
    const content = Utils.$('#rules-modal-content');
    if (content) {
        content.innerHTML = `
            <h2>${game.name} - Rules</h2>
            <div class="rules-content">
                ${game.rules}
            </div>
        `;
    }
    Utils.showModal('rules-modal');
}

// Check and hide ads for premium users
function checkPremiumStatus() {
    if (Auth.isSignedIn() && Auth.isPremium()) {
        document.body.classList.add('premium-user');
        // Hide AdSense ads
        Utils.$$('.adsbygoogle, [data-ad-slot]').forEach(ad => {
            ad.style.display = 'none';
        });
    } else {
        document.body.classList.remove('premium-user');
    }
}

// Show game info modal
function showGameInfo(gameKey) {
    const game = CONFIG.games[gameKey];
    if (!game) return;
    
    const content = Utils.$('#game-info-content');
    if (!content) return;
    
    content.innerHTML = `
        <h2>${game.name}</h2>
        <p class="game-era">${game.era}</p>
        <p>${game.description}</p>
        
        <div class="game-info-tabs">
            <button class="tab-btn active" onclick="showInfoTab('rules', '${gameKey}')">Rules</button>
            <button class="tab-btn" onclick="showInfoTab('history', '${gameKey}')">History</button>
        </div>
        
        <div id="info-tab-content">
            ${game.rules}
        </div>
        
        <div class="game-info-actions">
            <button class="btn-primary" onclick="Utils.hideModal('game-info-modal'); startQuickGame('${gameKey}');">
                Play Now
            </button>
        </div>
    `;
    
    Utils.showModal('game-info-modal');
}

function showInfoTab(tab, gameKey) {
    const game = CONFIG.games[gameKey];
    if (!game) return;
    
    const content = Utils.$('#info-tab-content');
    if (!content) return;
    
    content.innerHTML = tab === 'rules' ? game.rules : game.history;
    
    // Update tab buttons
    Utils.$$('.game-info-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === tab);
    });
}

// Modals
function initModals() {
    // Close buttons
    Utils.$$('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Click outside to close
    Utils.$$('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Auth button
    const authBtn = Utils.$('#auth-btn');
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            Utils.showModal('auth-modal');
        });
    }
}

// View toggle (desktop/mobile)
function initViewToggle() {
    const viewBtns = Utils.$$('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.body.classList.remove('desktop-view', 'mobile-view');
            document.body.classList.add(`${view}-view`);
            
            // Re-render current game if exists
            if (currentGame) {
                currentGame.render();
            }
        });
    });
}

// Shop
function initShop() {
    // Category navigation
    Utils.$$('.shop-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            Utils.$$('.shop-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            Utils.$$('.shop-section').forEach(sec => {
                sec.classList.toggle('active', sec.dataset.category === category);
            });
        });
    });
    
    // Load shop items
    loadShopItems();
}

function loadShopItems() {
    
    
    // Board skins
    const boardsGrid = Utils.$('#boards-grid');
    if (boardsGrid) {
        boardsGrid.innerHTML = '';
        CONFIG.shopItems.boards.forEach(item => {
            boardsGrid.appendChild(createShopItemCard(item, 'board'));
        });
    }
    
    // Pieces
    const piecesGrid = Utils.$('#pieces-grid');
    if (piecesGrid) {
        piecesGrid.innerHTML = '';
        CONFIG.shopItems.pieces.forEach(item => {
            piecesGrid.appendChild(createShopItemCard(item, 'piece'));
        });
    }
    
    // Avatars
    const avatarsGrid = Utils.$('#avatars-grid');
    if (avatarsGrid) {
        avatarsGrid.innerHTML = '';
        CONFIG.shopItems.avatars.forEach(item => {
            avatarsGrid.appendChild(createShopItemCard(item, 'avatar'));
        });
    }
}

function createShopItemCard(item, type) {
    const owned = Auth.ownsItem(item.id);
    const equipped = Auth.isEquipped(item.id);
    
    // Get SVG from ShopAssets
    const svg = window.ShopAssets?.getSVG(item.id);
    
    
    const previewEl = Utils.createElement('div', { class: 'item-preview' });
    if (svg) {
        previewEl.innerHTML = svg;
    } else {
        // Fallback colored circle
        const colors = {
            'board': 'linear-gradient(135deg, #D4AF37, #8B6914)',
            'piece': 'linear-gradient(135deg, #2ECC71, #1D6F3C)',
            'avatar': 'linear-gradient(135deg, #9B59B6, #6C3483)'
        };
        const itemType = item.id.split('_')[0];
        const fallback = Utils.createElement('div', {
            class: 'item-icon-fallback',
            style: { background: colors[itemType] || colors.piece }
        });
        previewEl.appendChild(fallback);
    }
    
    // Create action button
    let actionBtn;
    if (owned) {
        if (equipped) {
            actionBtn = Utils.createElement('button', { 
                class: 'btn-equipped', 
                onClick: () => unequipItem(item.id, type) 
            }, ['✓ Equipped']);
        } else {
            actionBtn = Utils.createElement('button', { 
                class: 'btn-secondary', 
                onClick: () => equipItem(item.id, type) 
            }, ['Equip']);
        }
    } else {
        actionBtn = Utils.createElement('button', { 
            class: 'btn-primary', 
            onClick: () => purchaseItem(item) 
        }, ['Buy']);
    }
    
    return Utils.createElement('div', { class: `shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}` }, [
        previewEl,
        Utils.createElement('h4', {}, [item.name]),
        Utils.createElement('div', { class: 'item-price' }, [
            owned ? (equipped ? 'Equipped' : 'Owned ✓') : `${item.price} coins`
        ]),
        actionBtn
    ]);
}

// Equip an item
async function equipItem(itemId, type) {
    if (!Auth.isSignedIn()) {
        Utils.showModal('auth-modal');
        return;
    }
    
    await Auth.equipItem(itemId, type);
    Utils.toast(`Equipped ${itemId.split('_').slice(1).join(' ')}!`, 'success');
    loadShopItems();
}

// Unequip an item
async function unequipItem(itemId, type) {
    if (!Auth.isSignedIn()) return;
    
    await Auth.unequipItem(type);
    Utils.toast('Item unequipped', 'info');
    loadShopItems();
}

async function purchaseItem(item) {
    if (!Auth.isSignedIn()) {
        Utils.showModal('auth-modal');
        return;
    }
    
    if (Auth.ownsItem(item.id)) {
        Utils.toast('You already own this item', 'info');
        return;
    }
    
    const success = await Auth.spendCoins(item.price);
    if (success) {
        await Auth.addToInventory(item.id);
        Utils.toast(`Purchased ${item.name}!`, 'success');
        loadShopItems();
    } else {
        Utils.toast('Not enough coins', 'error');
    }
}

function equipItem(itemId, type) {
    Utils.toast(`Equipped ${itemId}`, 'success');
    // In a full implementation, this would update user preferences
}

// Subscriptions
async function subscribe(plan) {
    if (!Auth.isSignedIn()) {
        Utils.showModal('auth-modal');
        return;
    }
    
    const priceId = plan === 'monthly' 
        ? CONFIG.pricing.stripePrices.monthly 
        : CONFIG.pricing.stripePrices.annual;
    
    try {
        Utils.toast('Redirecting to checkout...', 'info');
        
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                priceId,
                userId: Auth.user.uid,
                userEmail: Auth.user.email
            })
        });
        
        if (response.ok) {
            const { url } = await response.json();
            window.location.href = url;
        } else {
            throw new Error('Failed to create checkout session');
        }
    } catch (error) {
        console.error('Subscription error:', error);
        Utils.toast('Unable to process subscription. Please try again.', 'error');
    }
}

async function buyCoins(amount) {
    if (!Auth.isSignedIn()) {
        Utils.showModal('auth-modal');
        return;
    }
    
    const priceId = CONFIG.pricing.stripePrices[`coins_${amount}`];
    
    if (!priceId) {
        Utils.toast('Invalid coin package', 'error');
        return;
    }
    
    try {
        Utils.toast('Redirecting to checkout...', 'info');
        
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                priceId,
                userId: Auth.user.uid,
                userEmail: Auth.user.email
            })
        });
        
        if (response.ok) {
            const { url } = await response.json();
            window.location.href = url;
        } else {
            throw new Error('Failed to create checkout session');
        }
    } catch (error) {
        console.error('Purchase error:', error);
        Utils.toast('Unable to process purchase. Please try again.', 'error');
    }
}

// Lobby and Multiplayer
function initSocket() {
    try {
        socket = io(CONFIG.socketUrl, {
            transports: ['websocket'],
            reconnection: true
        });
        
        socket.on('connect', () => {
            console.log('Connected to game server');
            updateOnlineCount();
        });
        
        socket.on('room-created', (data) => {
            Utils.toast('Room created! Share the link with a friend.', 'success');
            Utils.copyToClipboard(window.location.origin + '?room=' + data.roomId);
        });
        
        socket.on('player-joined', (data) => {
            Utils.toast(`${data.playerName} joined the room!`, 'info');
        });
        
        socket.on('game-start', (data) => {
            startMultiplayerGame(data);
        });
        
        socket.on('opponent-move', (data) => {
            if (currentGame) {
                // Handle opponent's move
                currentGame.makeMove(data.move);
            }
        });
        
        socket.on('opponent-left', () => {
            Utils.toast('Opponent left the game', 'warning');
            if (currentGame) {
                currentGame.gameOver = true;
            }
        });
        
        socket.on('stats-update', (data) => {
            Utils.$('#online-count').textContent = data.online || '--';
            Utils.$('#games-today').textContent = data.gamesToday || '--';
        });
        
    } catch (error) {
        console.error('Socket connection error:', error);
    }
}

function updateOnlineCount() {
    if (socket && socket.connected) {
        socket.emit('get-stats');
    }
}

function loadRooms() {
    const roomsList = Utils.$('#rooms-list');
    if (!roomsList) return;
    
    // In production, this would fetch from the server
    roomsList.innerHTML = '<li class="empty-state">No open rooms. Create one!</li>';
    
    if (socket && socket.connected) {
        socket.emit('get-rooms');
        
        socket.once('rooms-list', (rooms) => {
            if (rooms.length === 0) {
                roomsList.innerHTML = '<li class="empty-state">No open rooms. Create one!</li>';
                return;
            }
            
            roomsList.innerHTML = '';
            rooms.forEach(room => {
                const li = Utils.createElement('li', {}, [
                    Utils.createElement('div', { class: 'room-info' }, [
                        Utils.createElement('span', { class: 'room-name' }, [room.name]),
                        Utils.createElement('span', { class: 'room-game' }, [CONFIG.games[room.game]?.name || room.game])
                    ]),
                    Utils.createElement('button', { 
                        class: 'btn-primary btn-small',
                        onClick: () => joinRoom(room.id)
                    }, ['Join'])
                ]);
                roomsList.appendChild(li);
            });
        });
    }
}

function createRoom() {
    if (!Auth.isSignedIn()) {
        Utils.showModal('auth-modal');
        return;
    }
    
    const game = Utils.$('#lobby-game-select').value;
    const name = Utils.$('#room-name-input').value || `${Auth.user.displayName}'s Room`;
    const isPrivate = Utils.$('.toggle-btn.active')?.dataset.mode === 'private';
    
    if (socket && socket.connected) {
        socket.emit('create-room', {
            game,
            name,
            isPrivate,
            hostId: Auth.user.uid,
            hostName: Auth.user.displayName
        });
    } else {
        Utils.toast('Not connected to server', 'error');
    }
}

function joinRoom(roomId) {
    if (!Auth.isSignedIn()) {
        Utils.showModal('auth-modal');
        return;
    }
    
    if (socket && socket.connected) {
        socket.emit('join-room', {
            roomId,
            playerId: Auth.user.uid,
            playerName: Auth.user.displayName
        });
    }
}

function startMultiplayerGame(data) {
    navigateTo('play');
    
    const canvas = Utils.$('#game-canvas');
    const GameClass = GameClasses[data.game];
    
    if (currentGame) {
        currentGame.destroy();
    }
    
    const gameConfig = CONFIG.games[data.game];
    canvas.width = gameConfig.boardSize.width;
    canvas.height = gameConfig.boardSize.height;
    
    currentGame = new GameClass(canvas, {
        mode: 'online',
        playerSide: data.playerSide,
        roomId: data.roomId
    });
    
    window.currentGame = currentGame;
}

// Quick match
function findQuickMatch() {
    if (!Auth.isSignedIn()) {
        Utils.showModal('auth-modal');
        return;
    }
    
    const game = Utils.$('#quick-match-game').value;
    const btn = Utils.$('#quick-match-btn');
    const spinner = btn.querySelector('.loading-spinner');
    const text = btn.querySelector('.btn-text');
    
    spinner.classList.remove('hidden');
    text.textContent = 'Searching...';
    
    if (socket && socket.connected) {
        socket.emit('find-match', {
            game: game === 'any' ? null : game,
            playerId: Auth.user.uid,
            playerName: Auth.user.displayName,
            rating: Auth.getRating(game)
        });
        
        // Timeout after 30 seconds
        setTimeout(() => {
            spinner.classList.add('hidden');
            text.textContent = 'Find Match';
        }, 30000);
    }
}

// Rankings
async function loadRankings(game = 'overall') {
    const tbody = Utils.$('#rankings-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    
    try {
        // In production, fetch from Firebase
        const db = firebase.database();
        let query;
        
        if (game === 'overall') {
            query = db.ref('users').orderByChild('stats/gamesWon').limitToLast(50);
        } else {
            query = db.ref('users').orderByChild(`ratings/${game}`).limitToLast(50);
        }
        
        const snapshot = await query.once('value');
        const users = [];
        
        snapshot.forEach(child => {
            const data = child.val();
            users.push({
                name: data.displayName,
                rating: game === 'overall' ? 
                    Math.round(Object.values(data.ratings || {}).reduce((a, b) => a + b, 0) / 5) :
                    data.ratings?.[game] || 1200,
                wins: data.stats?.gamesWon || 0,
                losses: data.stats?.gamesLost || 0
            });
        });
        
        // Sort and display
        users.sort((a, b) => b.rating - a.rating);
        
        tbody.innerHTML = '';
        users.slice(0, 50).forEach((user, index) => {
            const winRate = user.wins + user.losses > 0 ?
                Math.round((user.wins / (user.wins + user.losses)) * 100) : 0;
            
            const tr = Utils.createElement('tr', {}, [
                Utils.createElement('td', {}, [`#${index + 1}`]),
                Utils.createElement('td', {}, [user.name]),
                Utils.createElement('td', {}, [user.rating.toString()]),
                Utils.createElement('td', {}, [`${user.wins}/${user.losses}`]),
                Utils.createElement('td', {}, [`${winRate}%`])
            ]);
            tbody.appendChild(tr);
        });
        
        // Update podium
        updatePodium(users.slice(0, 3));
        
    } catch (error) {
        console.error('Load rankings error:', error);
        tbody.innerHTML = '<tr><td colspan="5">Failed to load rankings</td></tr>';
    }
}

function updatePodium(topThree) {
    const positions = ['first', 'second', 'third'];
    
    topThree.forEach((user, index) => {
        const podiumItem = Utils.$(`.podium-item.${positions[index]}`);
        if (podiumItem) {
            podiumItem.querySelector('.podium-name').textContent = user?.name || '--';
            podiumItem.querySelector('.podium-rating').textContent = user?.rating || '--';
        }
    });
}

// Rankings tabs
Utils.$$('.rankings-tabs .tab-btn')?.forEach(btn => {
    btn.addEventListener('click', () => {
        Utils.$$('.rankings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadRankings(btn.dataset.game);
    });
});

// Update stats periodically
function updateStats() {
    setInterval(updateOnlineCount, 30000);
}

// Filter buttons in lobby
Utils.$$('.filter-btn')?.forEach(btn => {
    btn.addEventListener('click', () => {
        Utils.$$('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Filter rooms by game type
    });
});

// Toggle buttons
Utils.$$('.toggle-btn')?.forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.parentElement;
        group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ============================================
// PROFILE PAGE
// ============================================

async function loadProfile() {
    if (!Auth.isSignedIn()) {
        Utils.$('#profile-name').textContent = 'Guest';
        Utils.$('#profile-membership').innerHTML = '<span class="membership-badge free">Sign in to track progress</span>';
        Utils.$('#profile-coins').textContent = '0';
        Utils.$('#profile-games').textContent = '0';
        Utils.$('#profile-wins').textContent = '0';
        Utils.$('#cancel-sub-btn')?.classList.add('hidden');
        return;
    }
    
    // Refresh profile from Firebase to get latest data
    await Auth.refreshProfile();
    
    const profile = Auth.userProfile;
    console.log('Profile loaded:', profile);
    console.log('Inventory:', profile?.inventory);
    
    // Basic info
    Utils.$('#profile-name').textContent = Auth.getUserName();
    Utils.$('#profile-coins').textContent = Utils.formatNumber(profile?.coins || 0);
    Utils.$('#profile-games').textContent = profile?.stats?.gamesPlayed || 0;
    Utils.$('#profile-wins').textContent = profile?.stats?.gamesWon || 0;
    
    // Membership status and cancel button
    const membershipEl = Utils.$('#profile-membership');
    const cancelBtn = Utils.$('#cancel-sub-btn');
    
    if (Auth.isPremium()) {
        if (profile?.cancelAtPeriodEnd) {
            membershipEl.innerHTML = '<span class="membership-badge premium">★ Premium (Canceling)</span>';
            cancelBtn?.classList.add('hidden');
        } else {
            membershipEl.innerHTML = '<span class="membership-badge premium">★ Premium Member</span>';
            cancelBtn?.classList.remove('hidden');
        }
    } else {
        membershipEl.innerHTML = '<span class="membership-badge free">Free Account</span>';
        cancelBtn?.classList.add('hidden');
    }
    
    // Equipped avatar
    const equippedAvatar = Auth.getEquipped('avatar');
    const avatarPreview = Utils.$('#profile-avatar');
    if (equippedAvatar && window.ShopAssets) {
        avatarPreview.innerHTML = window.ShopAssets.getSVG(equippedAvatar) || '';
    }
    
    // Load equipped items display
    loadEquippedDisplay();
    
    // Load collection
    loadCollection('boards');
    
    // Load ratings
    loadRatingsDisplay();
    
    // Setup collection tabs
    Utils.$$('.collection-tabs .tab-btn').forEach(btn => {
        btn.onclick = () => {
            Utils.$$('.collection-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadCollection(btn.dataset.tab);
        };
    });
}

function loadEquippedDisplay() {
    const types = ['board', 'piece', 'avatar'];
    
    types.forEach(type => {
        const equipped = Auth.getEquipped(type);
        const previewEl = Utils.$(`#equipped-${type}`);
        const nameEl = Utils.$(`#equipped-${type}-name`);
        
        if (equipped && window.ShopAssets) {
            const svg = window.ShopAssets.getSVG(equipped);
            if (previewEl && svg) previewEl.innerHTML = svg;
            
            // Find item name
            const allItems = [...(CONFIG.shopItems?.boards || []), 
                            ...(CONFIG.shopItems?.pieces || []), 
                            ...(CONFIG.shopItems?.avatars || [])];
            const item = allItems.find(i => i.id === equipped);
            if (nameEl) nameEl.textContent = item?.name || equipped;
        } else {
            if (previewEl) previewEl.innerHTML = '<span style="color:#666">None</span>';
            if (nameEl) nameEl.textContent = 'Default';
        }
    });
}

function loadCollection(category) {
    const grid = Utils.$('#collection-grid');
    if (!grid) return;
    
    const inventory = Auth.userProfile?.inventory || [];
    
    // Get items for this category
    let items = [];
    if (category === 'boards') items = CONFIG.shopItems?.boards || [];
    else if (category === 'pieces') items = CONFIG.shopItems?.pieces || [];
    else if (category === 'avatars') items = CONFIG.shopItems?.avatars || [];
    
    // Filter to owned items
    const owned = items.filter(item => inventory.includes(item.id));
    
    if (owned.length === 0) {
        grid.innerHTML = '<p class="empty-collection">No items in this category. Visit the shop!</p>';
        return;
    }
    
    grid.innerHTML = '';
    owned.forEach(item => {
        const isEquipped = Auth.isEquipped(item.id);
        const svg = window.ShopAssets?.getSVG(item.id) || '';
        
        const el = Utils.createElement('div', { 
            class: `collection-item ${isEquipped ? 'equipped' : ''}`,
            onClick: () => toggleEquip(item.id, category.slice(0, -1)) // Remove 's' from end
        }, []);
        
        el.innerHTML = `${svg}<div class="item-name">${item.name}</div>`;
        grid.appendChild(el);
    });
}

async function toggleEquip(itemId, type) {
    if (Auth.isEquipped(itemId)) {
        await Auth.unequipItem(type);
        Utils.toast('Item unequipped', 'info');
    } else {
        await Auth.equipItem(itemId, type);
        Utils.toast('Item equipped!', 'success');
    }
    loadProfile(); // Refresh display
}

function loadRatingsDisplay() {
    const grid = Utils.$('#ratings-grid');
    if (!grid) return;
    
    const ratings = Auth.userProfile?.ratings || {};
    const games = ['ur', 'senet', 'hnefatafl', 'morris', 'mancala'];
    const gameNames = {
        ur: 'Royal Game of Ur',
        senet: 'Senet',
        hnefatafl: 'Hnefatafl',
        morris: "Nine Men's Morris",
        mancala: 'Mancala'
    };
    
    grid.innerHTML = '';
    games.forEach(game => {
        const rating = ratings[game] || 1200;
        const card = Utils.createElement('div', { class: 'rating-card' }, [
            Utils.createElement('div', { class: 'game-name' }, [gameNames[game]]),
            Utils.createElement('div', { class: 'rating-value' }, [rating.toString()])
        ]);
        grid.appendChild(card);
    });
}

// Show Buy Coins section in shop
function showBuyCoins() {
    // Navigate to shop if not there
    navigateTo('shop');
    
    // Click the Buy Coins tab
    setTimeout(() => {
        const coinsTab = document.querySelector('.shop-nav-btn[data-category="coins"]');
        if (coinsTab) {
            coinsTab.click();
        }
    }, 100);
}

// Cancel subscription
async function cancelSubscription() {
    if (!Auth.isSignedIn()) return;
    
    // Confirm with user
    const confirmed = confirm(
        'Are you sure you want to cancel your subscription?\n\n' +
        'You will keep Premium access until the end of your current billing period.'
    );
    
    if (!confirmed) return;
    
    try {
        Utils.toast('Canceling subscription...', 'info');
        
        const response = await fetch('/api/cancel-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: Auth.user.uid })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            Utils.toast('Subscription canceled. You\'ll have access until the end of your billing period.', 'success');
            // Refresh profile to update UI
            await Auth.refreshProfile();
            loadProfile();
        } else {
            throw new Error(data.error || 'Failed to cancel subscription');
        }
    } catch (error) {
        console.error('Cancel subscription error:', error);
        Utils.toast('Failed to cancel subscription. Please try again.', 'error');
    }
}

// Global functions for HTML onclick handlers
window.navigateTo = navigateTo;
window.startQuickGame = startQuickGame;
window.showDifficultyModal = showDifficultyModal;
window.startGameWithDifficulty = startGameWithDifficulty;
window.showGameInfo = showGameInfo;
window.showInfoTab = showInfoTab;
window.showGameRules = showGameRules;
window.subscribe = subscribe;
window.buyCoins = buyCoins;
window.showBuyCoins = showBuyCoins;
window.cancelSubscription = cancelSubscription;
window.equipItem = equipItem;
window.unequipItem = unequipItem;
window.toggleEquip = toggleEquip;
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.findQuickMatch = findQuickMatch;

// Event handlers for lobby buttons
document.addEventListener('DOMContentLoaded', () => {
    const createRoomBtn = Utils.$('#create-room-btn');
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', createRoom);
    }
    
    const quickMatchBtn = Utils.$('#quick-match-btn');
    if (quickMatchBtn) {
        quickMatchBtn.addEventListener('click', findQuickMatch);
    }
    
    const refreshRoomsBtn = Utils.$('#refresh-rooms');
    if (refreshRoomsBtn) {
        refreshRoomsBtn.addEventListener('click', loadRooms);
    }
});
