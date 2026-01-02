// ============================================
// ANCIENT BOARD GAMES - SERVER
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
    }
});

// Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin (use environment variable for service account)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
} else {
    // Fallback for local development
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const db = admin.database();

// Stripe setup
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe Price ID mapping
const PRICE_IDS = {
    monthly: 'price_1SkpyqJmPcz7JQnM4V226T1n',
    annual: 'price_1Skq2SJmPcz7JQnMwp0wtyEI',
    coins_100: 'price_1SkxA9JmPcz7JQnMilXnihn4',
    coins_500: 'price_1SkxDfJmPcz7JQnM0k9JPuNT',
    coins_1000: 'price_1SkxExJmPcz7JQnM1bQ4tMJu',
    coins_2500: 'price_1SkxGoJmPcz7JQnM1aLo3wYL',
    coins_5000: 'price_1SkxHzJmPcz7JQnMurCMW7V0'
};

// Coin amounts (including bonuses)
const COIN_AMOUNTS = {
    'price_1SkxA9JmPcz7JQnMilXnihn4': 100,
    'price_1SkxDfJmPcz7JQnM0k9JPuNT': 550,    // 500 + 50 bonus
    'price_1SkxExJmPcz7JQnM1bQ4tMJu': 1200,   // 1000 + 200 bonus
    'price_1SkxGoJmPcz7JQnM1aLo3wYL': 3250,   // 2500 + 750 bonus
    'price_1SkxHzJmPcz7JQnMurCMW7V0': 7000    // 5000 + 2000 bonus
};

// In-memory storage (use Redis/DB in production)
const rooms = new Map();
const matchmakingQueue = new Map();
const onlinePlayers = new Set();
let gamesToday = 0;

// Middleware - IMPORTANT: raw body for webhook, json for others
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// STRIPE PAYMENT ENDPOINTS
// ============================================

// Create checkout session for subscriptions
app.post('/api/create-checkout-session', async (req, res) => {
    console.log('Checkout request received:', JSON.stringify(req.body));
    
    try {
        const { priceId, userId, userEmail } = req.body;
        
        console.log('priceId:', priceId, 'userId:', userId, 'userEmail:', userEmail);
        
        if (!priceId || !userId) {
            console.log('Missing priceId or userId');
            return res.status(400).json({ error: 'Missing priceId or userId' });
        }
        
        // Determine if subscription or one-time payment
        const isSubscription = priceId === PRICE_IDS.monthly || priceId === PRICE_IDS.annual;
        console.log('Is subscription:', isSubscription);
        
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            mode: isSubscription ? 'subscription' : 'payment',
            success_url: `${process.env.CLIENT_URL || 'https://ancientboardgames.io'}/?success=true`,
            cancel_url: `${process.env.CLIENT_URL || 'https://ancientboardgames.io'}/?canceled=true`,
            metadata: {
                userId: userId,
                priceId: priceId,
                type: isSubscription ? 'subscription' : 'coins'
            }
        };
        
        if (userEmail) {
            sessionConfig.customer_email = userEmail;
        }
        
        console.log('Creating Stripe session...');
        const session = await stripe.checkout.sessions.create(sessionConfig);
        console.log('Session created:', session.id);
        
        res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Checkout session error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook for fulfillment
app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    console.log('Webhook received:', event.type);
    
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleCheckoutComplete(session);
            break;
            
        case 'customer.subscription.updated':
            const updatedSub = event.data.object;
            await handleSubscriptionUpdate(updatedSub);
            break;
            
        case 'customer.subscription.deleted':
            const deletedSub = event.data.object;
            await handleSubscriptionCanceled(deletedSub);
            break;
            
        case 'invoice.payment_succeeded':
            // Recurring subscription payment
            const invoice = event.data.object;
            if (invoice.subscription) {
                await handleRecurringPayment(invoice);
            }
            break;
    }
    
    res.json({ received: true });
});

// Handle successful checkout
async function handleCheckoutComplete(session) {
    const { userId, priceId, type } = session.metadata;
    
    if (!userId) {
        console.error('No userId in session metadata');
        return;
    }
    
    console.log(`Processing checkout for user ${userId}, type: ${type}, priceId: ${priceId}`);
    
    try {
        const userRef = db.ref(`users/${userId}`);
        
        if (type === 'subscription') {
            // Set premium status
            await userRef.update({
                isPremium: true,
                subscriptionId: session.subscription,
                subscriptionPriceId: priceId,
                subscriptionStart: admin.database.ServerValue.TIMESTAMP
            });
            console.log(`User ${userId} is now premium!`);
            
        } else if (type === 'coins') {
            // Add coins
            const coinAmount = COIN_AMOUNTS[priceId] || 0;
            if (coinAmount > 0) {
                const snapshot = await userRef.child('coins').once('value');
                const currentCoins = snapshot.val() || 0;
                await userRef.update({
                    coins: currentCoins + coinAmount
                });
                console.log(`Added ${coinAmount} coins to user ${userId}`);
            }
        }
    } catch (error) {
        console.error('Error fulfilling order:', error);
    }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
    // Find user by subscription ID
    const usersRef = db.ref('users');
    const snapshot = await usersRef.orderByChild('subscriptionId').equalTo(subscription.id).once('value');
    
    if (snapshot.exists()) {
        const userId = Object.keys(snapshot.val())[0];
        const userRef = db.ref(`users/${userId}`);
        
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        await userRef.update({
            isPremium: isActive,
            subscriptionStatus: subscription.status
        });
        console.log(`Updated subscription status for user ${userId}: ${subscription.status}`);
    }
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription) {
    const usersRef = db.ref('users');
    const snapshot = await usersRef.orderByChild('subscriptionId').equalTo(subscription.id).once('value');
    
    if (snapshot.exists()) {
        const userId = Object.keys(snapshot.val())[0];
        const userRef = db.ref(`users/${userId}`);
        
        await userRef.update({
            isPremium: false,
            subscriptionStatus: 'canceled'
        });
        console.log(`Subscription canceled for user ${userId}`);
    }
}

// Handle recurring subscription payment (monthly coin bonus)
async function handleRecurringPayment(invoice) {
    if (!invoice.subscription) return;
    
    const usersRef = db.ref('users');
    const snapshot = await usersRef.orderByChild('subscriptionId').equalTo(invoice.subscription).once('value');
    
    if (snapshot.exists()) {
        const userId = Object.keys(snapshot.val())[0];
        const userRef = db.ref(`users/${userId}`);
        
        // Give monthly bonus coins (500)
        const coinSnapshot = await userRef.child('coins').once('value');
        const currentCoins = coinSnapshot.val() || 0;
        await userRef.update({
            coins: currentCoins + 500,
            lastCoinGrant: admin.database.ServerValue.TIMESTAMP
        });
        console.log(`Monthly bonus: Added 500 coins to premium user ${userId}`);
    }
}
// ============================================
// SOCKET.IO MULTIPLAYER
// ============================================

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    onlinePlayers.add(socket.id);
    broadcastStats();
    
    // Get current stats
    socket.on('get-stats', () => {
        socket.emit('stats-update', {
            online: onlinePlayers.size,
            gamesToday: gamesToday
        });
    });
    
    // Get available rooms
    socket.on('get-rooms', () => {
        const publicRooms = [];
        rooms.forEach((room, id) => {
            if (!room.isPrivate && room.players.length < 2) {
                publicRooms.push({
                    id,
                    name: room.name,
                    game: room.game,
                    host: room.hostName
                });
            }
        });
        socket.emit('rooms-list', publicRooms);
    });
    
    // Create a room
    socket.on('create-room', (data) => {
        const roomId = generateRoomId();
        
        rooms.set(roomId, {
            id: roomId,
            name: data.name,
            game: data.game,
            isPrivate: data.isPrivate,
            hostId: data.hostId,
            hostName: data.hostName,
            players: [{
                id: data.hostId,
                name: data.hostName,
                socketId: socket.id,
                side: 1
            }],
            gameState: null,
            createdAt: Date.now()
        });
        
        socket.join(roomId);
        socket.emit('room-created', { roomId });
        
        console.log(`Room created: ${roomId} by ${data.hostName}`);
    });
    
    // Join a room
    socket.on('join-room', (data) => {
        const room = rooms.get(data.roomId);
        
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }
        
        if (room.players.length >= 2) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }
        
        room.players.push({
            id: data.playerId,
            name: data.playerName,
            socketId: socket.id,
            side: 2
        });
        
        socket.join(data.roomId);
        
        // Notify other players
        socket.to(data.roomId).emit('player-joined', {
            playerId: data.playerId,
            playerName: data.playerName
        });
        
        // Start game if room is full
        if (room.players.length === 2) {
            gamesToday++;
            
            io.to(data.roomId).emit('game-start', {
                roomId: data.roomId,
                game: room.game,
                players: room.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    side: p.side
                }))
            });
            
            // Send individual player sides
            room.players.forEach(player => {
                io.to(player.socketId).emit('game-start', {
                    roomId: data.roomId,
                    game: room.game,
                    playerSide: player.side,
                    players: room.players.map(p => ({
                        id: p.id,
                        name: p.name,
                        side: p.side
                    }))
                });
            });
        }
    });
    
    // Handle game moves
    socket.on('game-move', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) return;
        
        // Validate move belongs to correct player
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) return;
        
        // Broadcast move to opponent
        socket.to(data.roomId).emit('opponent-move', {
            move: data.move,
            playerId: player.id
        });
        
        // Update game state
        room.gameState = data.gameState;
    });
    
    // Handle game end
    socket.on('game-end', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) return;
        
        io.to(data.roomId).emit('game-ended', {
            winner: data.winner,
            reason: data.reason
        });
        
        // Clean up room after delay
        setTimeout(() => {
            rooms.delete(data.roomId);
        }, 60000);
    });
    
    // Quick matchmaking
    socket.on('find-match', (data) => {
        const game = data.game || 'any';
        
        if (!matchmakingQueue.has(game)) {
            matchmakingQueue.set(game, []);
        }
        
        const queue = matchmakingQueue.get(game);
        
        // Check if there's someone waiting
        if (queue.length > 0) {
            const opponent = queue.shift();
            
            // Create a match
            const roomId = generateRoomId();
            
            rooms.set(roomId, {
                id: roomId,
                name: 'Quick Match',
                game: game === 'any' ? getRandomGame() : game,
                isPrivate: true,
                players: [
                    { ...opponent, side: 1 },
                    { id: data.playerId, name: data.playerName, socketId: socket.id, side: 2 }
                ],
                gameState: null,
                createdAt: Date.now()
            });
            
            const room = rooms.get(roomId);
            
            socket.join(roomId);
            io.sockets.sockets.get(opponent.socketId)?.join(roomId);
            
            gamesToday++;
            
            // Notify both players
            room.players.forEach(player => {
                io.to(player.socketId).emit('match-found', {
                    roomId,
                    game: room.game,
                    playerSide: player.side,
                    opponent: room.players.find(p => p.id !== player.id)
                });
                
                io.to(player.socketId).emit('game-start', {
                    roomId,
                    game: room.game,
                    playerSide: player.side,
                    players: room.players
                });
            });
            
        } else {
            // Add to queue
            queue.push({
                id: data.playerId,
                name: data.playerName,
                socketId: socket.id,
                rating: data.rating || 1200,
                timestamp: Date.now()
            });
            
            socket.emit('matchmaking-started', { position: queue.length });
        }
    });
    
    // Cancel matchmaking
    socket.on('cancel-matchmaking', () => {
        matchmakingQueue.forEach((queue, game) => {
            const index = queue.findIndex(p => p.socketId === socket.id);
            if (index !== -1) {
                queue.splice(index, 1);
            }
        });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        onlinePlayers.delete(socket.id);
        
        // Remove from matchmaking queues
        matchmakingQueue.forEach((queue, game) => {
            const index = queue.findIndex(p => p.socketId === socket.id);
            if (index !== -1) {
                queue.splice(index, 1);
            }
        });
        
        // Notify rooms
        rooms.forEach((room, roomId) => {
            const player = room.players.find(p => p.socketId === socket.id);
            if (player) {
                socket.to(roomId).emit('opponent-left', { playerId: player.id });
                
                // Remove player from room
                room.players = room.players.filter(p => p.socketId !== socket.id);
                
                // Delete empty rooms
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                }
            }
        });
        
        broadcastStats();
    });
});

// Helper functions
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomGame() {
    const games = ['ur', 'senet', 'hnefatafl', 'morris', 'mancala'];
    return games[Math.floor(Math.random() * games.length)];
}

function broadcastStats() {
    io.emit('stats-update', {
        online: onlinePlayers.size,
        gamesToday: gamesToday
    });
}

// Clean up old rooms periodically
setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, roomId) => {
        // Remove rooms older than 2 hours with no activity
        if (now - room.createdAt > 2 * 60 * 60 * 1000 && room.players.length < 2) {
            rooms.delete(roomId);
        }
    });
    
    // Remove stale matchmaking entries
    matchmakingQueue.forEach((queue, game) => {
        const filtered = queue.filter(p => now - p.timestamp < 5 * 60 * 1000);
        matchmakingQueue.set(game, filtered);
    });
}, 60000);

// Reset daily stats at midnight
const resetDailyStats = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;
    
    setTimeout(() => {
        gamesToday = 0;
        broadcastStats();
        resetDailyStats();
    }, msUntilMidnight);
};
resetDailyStats();

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Ancient Board Games server running on port ${PORT}`);
});

module.exports = { app, server, io };
