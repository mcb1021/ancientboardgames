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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Stripe setup
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY');

// In-memory storage (use Redis/DB in production)
const rooms = new Map();
const matchmakingQueue = new Map(); // game -> [players]
const onlinePlayers = new Set();
let gamesToday = 0;

// ============================================
// STRIPE PAYMENT ENDPOINTS
// ============================================

// Create checkout session for subscriptions and purchases
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { plan, type, amount, price, userId } = req.body;
        
        let lineItems;
        let mode;
        
        if (type === 'coins') {
            // One-time coin purchase
            lineItems = [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${amount} Ancient Coins`,
                        description: 'In-game currency for Ancient Board Games'
                    },
                    unit_amount: price
                },
                quantity: 1
            }];
            mode = 'payment';
        } else {
            // Subscription
            const priceId = plan === 'monthly' 
                ? process.env.STRIPE_MONTHLY_PRICE_ID 
                : process.env.STRIPE_ANNUAL_PRICE_ID;
            
            lineItems = [{
                price: priceId,
                quantity: 1
            }];
            mode = 'subscription';
        }
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: mode,
            success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}?canceled=true`,
            metadata: {
                userId,
                type: type || 'subscription',
                amount: amount?.toString() || '',
                plan: plan || ''
            }
        });
        
        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook for fulfillment
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await fulfillOrder(session);
            break;
            
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            // Handle subscription changes
            break;
    }
    
    res.json({ received: true });
});

async function fulfillOrder(session) {
    const { userId, type, amount, plan } = session.metadata;
    
    // In production, update Firebase here
    console.log(`Fulfilling order for user ${userId}: ${type} - ${amount || plan}`);
    
    // You would update the user's account in Firebase:
    // - Add coins for coin purchases
    // - Set isPremium flag for subscriptions
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
