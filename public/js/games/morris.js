// ============================================
// NINE MEN'S MORRIS - ROMAN STRATEGY GAME
// ============================================

class MorrisGame {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = { mode: 'ai', aiDifficulty: 'medium', playerSide: 1, ...options };
        
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.padding = 50;
        this.spacing = (this.canvas.width - this.padding * 2) / 6;
        
        // Get equipped skins - board must match this game (morris)
        const equippedBoard = Auth.getEquipped?.('board') || null;
        const equippedPieces = Auth.getEquipped?.('piece') || null;
        
        // Only apply board skin if it's for this game (contains 'morris') - board is personal
        const boardColors = (equippedBoard && equippedBoard.includes('morris')) 
            ? window.ShopAssets?.getColors(equippedBoard) 
            : null;
        
        // Get MY piece colors
        const myPieceColors = window.ShopAssets?.getColors(equippedPieces);
        
        // Get OPPONENT's piece colors (from multiplayer options)
        const opponentPieceColors = this.options.opponentPieces 
            ? window.ShopAssets?.getColors(this.options.opponentPieces)
            : null;
        
        // Assign colors based on which side I am
        // Player 1 = white/light side, Player 2 = black/dark side
        let player1Color, player2Color;
        if (this.options.playerSide === 1) {
            // I'm player 1 - my colors are player1, opponent's are player2
            player1Color = myPieceColors?.primary || '#F5F5DC';
            player2Color = opponentPieceColors?.primary || '#2C2C2C';
        } else {
            // I'm player 2 - opponent's colors are player1, my colors are player2
            player1Color = opponentPieceColors?.primary || '#F5F5DC';
            player2Color = myPieceColors?.primary || '#2C2C2C';
        }
        
        this.colors = {
            board: boardColors?.primary || '#4A1C1C',
            lines: boardColors?.secondary || '#8B4513',
            point: boardColors?.accent || '#CD853F',
            pointHighlight: '#FFD700',
            player1: player1Color,
            player2: player2Color,
            mill: 'rgba(212, 175, 55, 0.5)',
            validMove: 'rgba(74, 124, 78, 0.5)'
        };
        
        // Define the 24 positions on the board (3 concentric squares)
        this.positions = this.definePositions();
        this.adjacencies = this.defineAdjacencies();
        this.mills = this.defineMills();
        
        this.reset();
        this.boundHandleClick = this.handleClick.bind(this);
        this.canvas.addEventListener('click', this.boundHandleClick);
        this.destroyed = false;
        this.render();
    }
    
    definePositions() {
        const p = this.padding;
        const s = this.spacing;
        return [
            // Outer square (0-7)
            { x: p, y: p },               // 0 - top left
            { x: p + 3*s, y: p },         // 1 - top middle
            { x: p + 6*s, y: p },         // 2 - top right
            { x: p + 6*s, y: p + 3*s },   // 3 - right middle
            { x: p + 6*s, y: p + 6*s },   // 4 - bottom right
            { x: p + 3*s, y: p + 6*s },   // 5 - bottom middle
            { x: p, y: p + 6*s },         // 6 - bottom left
            { x: p, y: p + 3*s },         // 7 - left middle
            // Middle square (8-15)
            { x: p + s, y: p + s },       // 8
            { x: p + 3*s, y: p + s },     // 9
            { x: p + 5*s, y: p + s },     // 10
            { x: p + 5*s, y: p + 3*s },   // 11
            { x: p + 5*s, y: p + 5*s },   // 12
            { x: p + 3*s, y: p + 5*s },   // 13
            { x: p + s, y: p + 5*s },     // 14
            { x: p + s, y: p + 3*s },     // 15
            // Inner square (16-23)
            { x: p + 2*s, y: p + 2*s },   // 16
            { x: p + 3*s, y: p + 2*s },   // 17
            { x: p + 4*s, y: p + 2*s },   // 18
            { x: p + 4*s, y: p + 3*s },   // 19
            { x: p + 4*s, y: p + 4*s },   // 20
            { x: p + 3*s, y: p + 4*s },   // 21
            { x: p + 2*s, y: p + 4*s },   // 22
            { x: p + 2*s, y: p + 3*s }    // 23
        ];
    }
    
    defineAdjacencies() {
        return {
            0: [1, 7], 1: [0, 2, 9], 2: [1, 3], 3: [2, 4, 11], 4: [3, 5], 5: [4, 6, 13], 6: [5, 7], 7: [0, 6, 15],
            8: [9, 15], 9: [1, 8, 10, 17], 10: [9, 11], 11: [3, 10, 12, 19], 12: [11, 13], 13: [5, 12, 14, 21], 14: [13, 15], 15: [7, 8, 14, 23],
            16: [17, 23], 17: [9, 16, 18], 18: [17, 19], 19: [11, 18, 20], 20: [19, 21], 21: [13, 20, 22], 22: [21, 23], 23: [15, 16, 22]
        };
    }
    
    defineMills() {
        return [
            // Outer square
            [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
            // Middle square
            [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
            // Inner square
            [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
            // Vertical connections
            [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23]
        ];
    }
    
    reset() {
        this.board = Array(24).fill(0); // 0 = empty, 1 = player1, 2 = player2
        this.piecesToPlace = { 1: 9, 2: 9 };
        this.piecesOnBoard = { 1: 0, 2: 0 };
        this.currentPlayer = 1;
        this.phase = 'placing'; // 'placing', 'moving', 'flying'
        this.selectedPiece = null;
        this.mustRemove = false; // After forming mill, must remove opponent piece
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
    }
    
    // Check if position is part of a mill for given player
    checkMill(pos, player) {
        return this.mills.some(mill => 
            mill.includes(pos) && mill.every(p => this.board[p] === player)
        );
    }
    
    // Get all mills for a player
    getPlayerMills(player) {
        return this.mills.filter(mill => mill.every(p => this.board[p] === player));
    }
    
    // Check if a piece can be removed (not in mill unless all pieces are in mills)
    canRemovePiece(pos, player) {
        if (this.board[pos] !== player) return false;
        
        // Check if piece is in a mill
        const inMill = this.checkMill(pos, player);
        if (!inMill) return true;
        
        // Can only remove from mill if all opponent pieces are in mills
        const opponentPieces = this.board.map((p, i) => p === player ? i : -1).filter(i => i >= 0);
        return opponentPieces.every(p => this.checkMill(p, player));
    }
    
    // Get valid moves for current state
    calculateValidMoves() {
        this.validMoves = [];
        const player = this.currentPlayer;
        
        if (this.mustRemove) {
            // Must remove an opponent piece
            const opponent = player === 1 ? 2 : 1;
            for (let i = 0; i < 24; i++) {
                if (this.canRemovePiece(i, opponent)) {
                    this.validMoves.push({ type: 'remove', pos: i });
                }
            }
        } else if (this.phase === 'placing') {
            // Can place on any empty position
            for (let i = 0; i < 24; i++) {
                if (this.board[i] === 0) {
                    this.validMoves.push({ type: 'place', pos: i });
                }
            }
        } else {
            // Moving or flying phase
            const canFly = this.piecesOnBoard[player] === 3;
            
            for (let i = 0; i < 24; i++) {
                if (this.board[i] !== player) continue;
                
                if (canFly) {
                    // Can move to any empty position
                    for (let j = 0; j < 24; j++) {
                        if (this.board[j] === 0) {
                            this.validMoves.push({ type: 'move', from: i, to: j });
                        }
                    }
                } else {
                    // Can only move to adjacent positions
                    for (const adj of this.adjacencies[i]) {
                        if (this.board[adj] === 0) {
                            this.validMoves.push({ type: 'move', from: i, to: adj });
                        }
                    }
                }
            }
        }
    }
    
    makeMove(move, isRemote = false) {
        const player = this.currentPlayer;
        const opponent = player === 1 ? 2 : 1;
        let formedMill = false;
        
        // Emit move to server if online mode and local player made the move
        if (this.options.mode === 'online' && !isRemote && player === this.options.playerSide) {
            window.socket?.emit('game-move', {
                roomId: this.options.roomId,
                move: move,
                gameState: this.getState()
            });
            // Signal turn change for timer
            window.onTurnChange?.();
        }
        
        if (move.type === 'remove') {
            this.board[move.pos] = 0;
            this.piecesOnBoard[opponent]--;
            this.mustRemove = false;
            
            // Sound: capture piece
            window.SoundManager?.play('capture');
            
            // Check for win
            if (this.checkWin()) return;
            
            // End turn
            this.endTurn();
        } else if (move.type === 'place') {
            this.board[move.pos] = player;
            this.piecesToPlace[player]--;
            this.piecesOnBoard[player]++;
            
            // Sound: place piece
            window.SoundManager?.play('move');
            
            // Check if formed mill
            formedMill = this.checkMill(move.pos, player);
            
            // Check if placing phase is over
            if (this.piecesToPlace[1] === 0 && this.piecesToPlace[2] === 0) {
                this.phase = 'moving';
            }
        } else if (move.type === 'move') {
            this.board[move.from] = 0;
            this.board[move.to] = player;
            this.selectedPiece = null;
            
            // Sound: move piece
            window.SoundManager?.play('move');
            
            // Check if formed mill
            formedMill = this.checkMill(move.to, player);
        }
        
        if (formedMill) {
            // Sound: mill formed!
            window.SoundManager?.play('mill');
            
            this.mustRemove = true;
            this.calculateValidMoves();
            
            // If no pieces can be removed, skip
            if (this.validMoves.length === 0) {
                this.mustRemove = false;
                this.endTurn();
            } else if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide) {
                setTimeout(() => this.makeAiMove(), 300);
            }
        } else if (move.type !== 'remove') {
            this.endTurn();
        }
        
        this.render();
    }
    
    endTurn() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.selectedPiece = null;
        this.calculateValidMoves();
        
        // Check if current player can move
        if (this.phase !== 'placing' && this.validMoves.length === 0) {
            // Current player loses (blocked)
            this.gameOver = true;
            this.winner = this.currentPlayer === 1 ? 2 : 1;
            this.onGameEnd(this.winner);
            return;
        }
        
        // AI move
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide && !this.gameOver) {
            setTimeout(() => this.makeAiMove(), 500);
        }
    }
    
    checkWin() {
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        
        // Win if opponent has less than 3 pieces (and placing is done)
        if (this.phase !== 'placing' && this.piecesOnBoard[opponent] < 3) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.onGameEnd(this.currentPlayer);
            return true;
        }
        return false;
    }
    
    makeAiMove() {
        if (this.validMoves.length === 0) return;
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of this.validMoves) {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        // Add randomness for lower difficulties
        if (this.options.aiDifficulty === 'easy' && Math.random() < 0.4) {
            bestMove = this.validMoves[Math.floor(Math.random() * this.validMoves.length)];
        }
        
        if (bestMove) {
            this.makeMove(bestMove);
        }
    }
    
    evaluateMove(move) {
        let score = Math.random() * 5; // Small random factor
        const player = this.currentPlayer;
        
        if (move.type === 'remove') {
            // Prioritize removing pieces that could form mills
            score += 50;
            // Check if opponent piece is close to forming mill
            for (const mill of this.mills) {
                if (mill.includes(move.pos)) {
                    const opponentInMill = mill.filter(p => this.board[p] === (player === 1 ? 2 : 1)).length;
                    if (opponentInMill === 2) score += 30;
                }
            }
        } else if (move.type === 'place' || move.type === 'move') {
            const targetPos = move.type === 'place' ? move.pos : move.to;
            
            // Simulate the move
            const originalBoard = [...this.board];
            if (move.type === 'move') this.board[move.from] = 0;
            this.board[targetPos] = player;
            
            // Check if forms mill
            if (this.checkMill(targetPos, player)) {
                score += 100;
            }
            
            // Check potential mills (2 in a row)
            for (const mill of this.mills) {
                if (mill.includes(targetPos)) {
                    const playerPieces = mill.filter(p => this.board[p] === player).length;
                    if (playerPieces === 2) score += 30;
                }
            }
            
            // Block opponent mills
            const opponent = player === 1 ? 2 : 1;
            for (const mill of this.mills) {
                if (mill.includes(targetPos)) {
                    const opponentPieces = mill.filter(p => originalBoard[p] === opponent).length;
                    if (opponentPieces === 2 && originalBoard[targetPos] === 0) {
                        score += 40;
                    }
                }
            }
            
            // Center positions are valuable
            const centerPositions = [9, 11, 13, 15, 17, 19, 21, 23];
            if (centerPositions.includes(targetPos)) score += 10;
            
            // Restore board
            this.board = originalBoard;
        }
        
        return score;
    }
    
    handleClick(e) {
        if (this.gameOver) return;
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide) return;
        // In online mode, only allow clicks on your turn
        if (this.options.mode === 'online' && this.currentPlayer !== this.options.playerSide) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find clicked position
        let clickedPos = -1;
        for (let i = 0; i < 24; i++) {
            const pos = this.positions[i];
            const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
            if (dist < 20) {
                clickedPos = i;
                break;
            }
        }
        
        if (clickedPos === -1) return;
        
        this.calculateValidMoves();
        
        if (this.mustRemove) {
            // Must remove opponent piece
            const removeMove = this.validMoves.find(m => m.type === 'remove' && m.pos === clickedPos);
            if (removeMove) {
                this.makeMove(removeMove);
            }
        } else if (this.phase === 'placing') {
            // Placing phase
            const placeMove = this.validMoves.find(m => m.type === 'place' && m.pos === clickedPos);
            if (placeMove) {
                this.makeMove(placeMove);
            }
        } else {
            // Moving phase
            if (this.selectedPiece === null) {
                // Select a piece to move
                if (this.board[clickedPos] === this.currentPlayer) {
                    this.selectedPiece = clickedPos;
                    this.render();
                }
            } else {
                // Try to move selected piece
                const moveAction = this.validMoves.find(m => 
                    m.type === 'move' && m.from === this.selectedPiece && m.to === clickedPos
                );
                
                if (moveAction) {
                    this.makeMove(moveAction);
                } else if (this.board[clickedPos] === this.currentPlayer) {
                    // Select different piece
                    this.selectedPiece = clickedPos;
                    this.render();
                } else {
                    this.selectedPiece = null;
                    this.render();
                }
            }
        }
    }
    
    render() {
        const ctx = this.ctx;
        const p = this.padding;
        const s = this.spacing;
        
        // Background
        ctx.fillStyle = this.colors.board;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board lines
        ctx.strokeStyle = this.colors.lines;
        ctx.lineWidth = 3;
        
        // Outer square
        ctx.strokeRect(p, p, 6*s, 6*s);
        // Middle square
        ctx.strokeRect(p + s, p + s, 4*s, 4*s);
        // Inner square
        ctx.strokeRect(p + 2*s, p + 2*s, 2*s, 2*s);
        
        // Connecting lines
        ctx.beginPath();
        ctx.moveTo(p + 3*s, p); ctx.lineTo(p + 3*s, p + 2*s);
        ctx.moveTo(p + 3*s, p + 4*s); ctx.lineTo(p + 3*s, p + 6*s);
        ctx.moveTo(p, p + 3*s); ctx.lineTo(p + 2*s, p + 3*s);
        ctx.moveTo(p + 4*s, p + 3*s); ctx.lineTo(p + 6*s, p + 3*s);
        ctx.stroke();
        
        // Calculate valid moves for highlighting
        this.calculateValidMoves();
        
        // Draw valid move highlights
        ctx.fillStyle = this.colors.validMove;
        for (const move of this.validMoves) {
            if (move.type === 'place' || (move.type === 'move' && move.from === this.selectedPiece)) {
                const pos = this.positions[move.type === 'place' ? move.pos : move.to];
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
                ctx.fill();
            }
            if (move.type === 'remove') {
                const pos = this.positions[move.pos];
                ctx.fillStyle = 'rgba(139, 37, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = this.colors.validMove;
            }
        }
        
        // Draw mills highlight
        ctx.fillStyle = this.colors.mill;
        for (const player of [1, 2]) {
            const playerMills = this.getPlayerMills(player);
            for (const mill of playerMills) {
                for (const pos of mill) {
                    const p = this.positions[pos];
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Draw points
        for (let i = 0; i < 24; i++) {
            const pos = this.positions[i];
            
            ctx.fillStyle = this.selectedPiece === i ? this.colors.pointHighlight : this.colors.point;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw pieces
        for (let i = 0; i < 24; i++) {
            if (this.board[i] === 0) continue;
            
            const pos = this.positions[i];
            const player = this.board[i];
            
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(pos.x + 2, pos.y + 3, 15, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Piece
            ctx.fillStyle = player === 1 ? this.colors.player1 : this.colors.player2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = player === 1 ? '#B8A888' : '#444';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Selected indicator
            if (this.selectedPiece === i) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Draw UI info
        ctx.fillStyle = '#F5F0E6';
        ctx.font = '14px "Noto Sans"';
        ctx.textAlign = 'left';
        
        // Player 1 info
        ctx.fillText(`White: ${this.piecesToPlace[1]} to place, ${this.piecesOnBoard[1]} on board`, 10, 20);
        
        // Player 2 info
        ctx.fillText(`Black: ${this.piecesToPlace[2]} to place, ${this.piecesOnBoard[2]} on board`, 10, this.canvas.height - 10);
        
        // Current state
        ctx.textAlign = 'center';
        let stateText = '';
        if (this.mustRemove) {
            stateText = 'Mill formed! Remove opponent piece';
        } else if (this.phase === 'placing') {
            stateText = `${this.currentPlayer === 1 ? 'White' : 'Black'} to place`;
        } else {
            stateText = `${this.currentPlayer === 1 ? 'White' : 'Black'} to move`;
            if (this.piecesOnBoard[this.currentPlayer] === 3) stateText += ' (Flying!)';
        }
        ctx.fillText(stateText, this.canvas.width / 2, this.canvas.height - 10);
    }
    
    onGameEnd(winner) {
        // Play win/lose sound
        const isWin = winner === this.options.playerSide;
        window.SoundManager?.play(isWin ? 'win' : 'lose');
        
        Utils.showModal('game-end-modal');
        const content = Utils.$('#game-end-content');
        if (content) {
            content.innerHTML = `
                <h2 style="color: ${isWin ? '#D4AF37' : '#8B2500'}">${isWin ? '🏆 Victory!' : 'Defeat'}</h2>
                <p>${winner === 1 ? 'White' : 'Black'} wins!</p>
                <button class="btn-primary" onclick="window.currentGame.reset(); window.currentGame.render(); Utils.hideModal('game-end-modal');">Play Again</button>
            `;
        }
    }
    
    destroy() {
        this.destroyed = true;
        this.gameOver = true;
        this.canvas.removeEventListener('click', this.boundHandleClick);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Get game state for syncing
    getState() {
        return {
            board: [...this.board],
            currentPlayer: this.currentPlayer,
            phase: this.phase,
            piecesToPlace: {...this.piecesToPlace},
            piecesOnBoard: {...this.piecesOnBoard},
            mustRemove: this.mustRemove,
            selectedPiece: this.selectedPiece
        };
    }
    
    // Receive move from opponent (multiplayer)
    receiveMove(move) {
        this.makeMove(move, true);
    }
}

window.MorrisGame = MorrisGame;
