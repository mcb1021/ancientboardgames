// ============================================
// MANCALA - AFRICAN SEED GAME
// ============================================

class MancalaGame {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = { mode: 'ai', aiDifficulty: 'medium', playerSide: 1, ...options };
        
        this.canvas.width = 700;
        this.canvas.height = 280;
        
        this.pitWidth = 70;
        this.pitHeight = 90;
        this.storeWidth = 80;
        this.storeHeight = 200;
        this.padding = 30;
        
        // Get equipped skins - board must match this game (mancala)
        const equippedBoard = Auth.getEquipped?.('board') || null;
        const equippedPieces = Auth.getEquipped?.('piece') || null;
        
        // Only apply board skin if it's for this game (contains 'mancala')
        const boardColors = (equippedBoard && equippedBoard.includes('mancala')) 
            ? window.ShopAssets?.getColors(equippedBoard) 
            : null;
        const pieceColors = window.ShopAssets?.getColors(equippedPieces);
        
        this.colors = {
            board: boardColors?.primary || '#3D2914',
            boardLight: boardColors?.secondary || '#5D4930',
            pit: '#2A1F14',
            pitHighlight: '#4A3728',
            store: '#1A1510',
            seed: pieceColors?.primary || '#C9A86C',
            seedHighlight: pieceColors?.highlight || '#FFD700',
            player1: '#E8D5A3',
            player2: '#8B7355',
            validMove: 'rgba(74, 124, 78, 0.4)'
        };
        
        this.reset();
        this.boundHandleClick = this.handleClick.bind(this);
        this.canvas.addEventListener('click', this.boundHandleClick);
        this.destroyed = false;
        this.render();
    }
    
    reset() {
        // Pits: indices 0-5 = player 1's pits (bottom, left to right)
        // Index 6 = player 1's store (right)
        // Indices 7-12 = player 2's pits (top, right to left)
        // Index 13 = player 2's store (left)
        this.pits = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
        
        this.currentPlayer = 1;
        this.selectedPit = null;
        this.gameOver = false;
        this.winner = null;
        this.animating = false;
        this.lastMove = null;
    }
    
    // Get pit positions for rendering
    getPitPosition(index) {
        const boardX = this.padding + this.storeWidth;
        const boardY = this.padding;
        
        if (index === 6) {
            // Player 1 store (right)
            return {
                x: boardX + 6 * this.pitWidth + 10,
                y: boardY + (this.storeHeight - this.pitHeight) / 2,
                width: this.storeWidth - 20,
                height: this.storeHeight,
                isStore: true
            };
        } else if (index === 13) {
            // Player 2 store (left)
            return {
                x: this.padding,
                y: boardY + (this.storeHeight - this.pitHeight) / 2,
                width: this.storeWidth - 20,
                height: this.storeHeight,
                isStore: true
            };
        } else if (index < 6) {
            // Player 1 pits (bottom row, left to right)
            return {
                x: boardX + index * this.pitWidth + 10,
                y: boardY + this.pitHeight + 20,
                width: this.pitWidth - 20,
                height: this.pitHeight,
                isStore: false,
                player: 1
            };
        } else {
            // Player 2 pits (top row, right to left)
            return {
                x: boardX + (12 - index) * this.pitWidth + 10,
                y: boardY,
                width: this.pitWidth - 20,
                height: this.pitHeight,
                isStore: false,
                player: 2
            };
        }
    }
    
    // Get valid moves for current player
    getValidMoves() {
        const moves = [];
        const start = this.currentPlayer === 1 ? 0 : 7;
        const end = this.currentPlayer === 1 ? 6 : 13;
        
        for (let i = start; i < end; i++) {
            if (this.pits[i] > 0) {
                moves.push(i);
            }
        }
        
        return moves;
    }
    
    // Make a move
    async makeMove(pitIndex) {
        if (this.animating || this.gameOver) return false;
        
        const player = this.currentPlayer;
        const playerStore = player === 1 ? 6 : 13;
        const opponentStore = player === 1 ? 13 : 6;
        
        // Pick up seeds - play move sound
        let seeds = this.pits[pitIndex];
        if (seeds === 0) return false;
        
        window.SoundManager?.play('move');
        
        this.pits[pitIndex] = 0;
        this.animating = true;
        
        // Sow seeds
        let currentPit = pitIndex;
        while (seeds > 0) {
            currentPit = (currentPit + 1) % 14;
            
            // Skip opponent's store
            if (currentPit === opponentStore) continue;
            
            this.pits[currentPit]++;
            seeds--;
            
            // Animate (optional delay for visual effect)
            this.render();
            await Utils.wait(100);
        }
        
        // Check for extra turn (ended in own store)
        let extraTurn = currentPit === playerStore;
        
        // Check for capture (ended in empty pit on own side)
        if (!extraTurn) {
            const ownPits = player === 1 ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12];
            
            if (ownPits.includes(currentPit) && this.pits[currentPit] === 1) {
                // Capture opposite pit
                const oppositePit = 12 - currentPit;
                if (this.pits[oppositePit] > 0) {
                    const captured = this.pits[oppositePit] + this.pits[currentPit];
                    this.pits[oppositePit] = 0;
                    this.pits[currentPit] = 0;
                    this.pits[playerStore] += captured;
                    
                    // Sound: capture!
                    window.SoundManager?.play('capture');
                    
                    this.render();
                    await Utils.wait(200);
                }
            }
        }
        
        this.animating = false;
        this.lastMove = pitIndex;
        
        // Check for game end
        if (this.checkGameEnd()) {
            this.onGameEnd(this.winner);
            return true;
        }
        
        // Switch player or keep turn
        if (!extraTurn) {
            this.currentPlayer = player === 1 ? 2 : 1;
        }
        
        this.render();
        
        // AI move
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide && !this.gameOver) {
            setTimeout(() => this.makeAiMove(), 500);
        }
        
        return true;
    }
    
    checkGameEnd() {
        // Check if either side is empty
        const player1Empty = this.pits.slice(0, 6).every(p => p === 0);
        const player2Empty = this.pits.slice(7, 13).every(p => p === 0);
        
        if (player1Empty || player2Empty) {
            // Collect remaining seeds
            if (player1Empty) {
                const remaining = this.pits.slice(7, 13).reduce((a, b) => a + b, 0);
                this.pits[13] += remaining;
                for (let i = 7; i < 13; i++) this.pits[i] = 0;
            } else {
                const remaining = this.pits.slice(0, 6).reduce((a, b) => a + b, 0);
                this.pits[6] += remaining;
                for (let i = 0; i < 6; i++) this.pits[i] = 0;
            }
            
            this.gameOver = true;
            
            // Determine winner
            if (this.pits[6] > this.pits[13]) {
                this.winner = 1;
            } else if (this.pits[13] > this.pits[6]) {
                this.winner = 2;
            } else {
                this.winner = 0; // Tie
            }
            
            return true;
        }
        
        return false;
    }
    
    makeAiMove() {
        const validMoves = this.getValidMoves();
        if (validMoves.length === 0) return;
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of validMoves) {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        // Add randomness for easier difficulties
        if (this.options.aiDifficulty === 'easy' && Math.random() < 0.4) {
            bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        }
        
        if (bestMove !== null) {
            this.makeMove(bestMove);
        }
    }
    
    evaluateMove(pitIndex) {
        // Simulate the move
        const savedPits = [...this.pits];
        const player = this.currentPlayer;
        const playerStore = player === 1 ? 6 : 13;
        const opponentStore = player === 1 ? 13 : 6;
        
        let seeds = this.pits[pitIndex];
        this.pits[pitIndex] = 0;
        let currentPit = pitIndex;
        
        while (seeds > 0) {
            currentPit = (currentPit + 1) % 14;
            if (currentPit === opponentStore) continue;
            this.pits[currentPit]++;
            seeds--;
        }
        
        let score = 0;
        
        // Extra turn
        if (currentPit === playerStore) {
            score += 20;
        }
        
        // Capture potential
        const ownPits = player === 1 ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12];
        if (ownPits.includes(currentPit) && this.pits[currentPit] === 1) {
            const oppositePit = 12 - currentPit;
            score += this.pits[oppositePit] * 3;
        }
        
        // Score difference
        score += (this.pits[playerStore] - savedPits[playerStore]) * 2;
        
        // Restore
        this.pits = savedPits;
        
        return score + Math.random() * 2;
    }
    
    handleClick(e) {
        if (this.animating || this.gameOver) return;
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check which pit was clicked
        const validMoves = this.getValidMoves();
        
        for (const pitIndex of validMoves) {
            const pos = this.getPitPosition(pitIndex);
            if (x >= pos.x && x <= pos.x + pos.width &&
                y >= pos.y && y <= pos.y + pos.height) {
                this.makeMove(pitIndex);
                return;
            }
        }
    }
    
    render() {
        const ctx = this.ctx;
        
        // Background
        ctx.fillStyle = this.colors.board;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Board border/frame
        ctx.strokeStyle = this.colors.boardLight;
        ctx.lineWidth = 4;
        ctx.strokeRect(5, 5, this.canvas.width - 10, this.canvas.height - 10);
        
        // Wood grain effect
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            const y = Math.random() * this.canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y + (Math.random() - 0.5) * 20);
            ctx.stroke();
        }
        
        // Valid moves highlight
        const validMoves = this.getValidMoves();
        
        // Draw all pits
        for (let i = 0; i < 14; i++) {
            const pos = this.getPitPosition(i);
            const isValid = validMoves.includes(i);
            
            // Pit background
            if (isValid) {
                ctx.fillStyle = this.colors.validMove;
                this.drawPit(pos.x - 3, pos.y - 3, pos.width + 6, pos.height + 6, pos.isStore);
            }
            
            ctx.fillStyle = pos.isStore ? this.colors.store : this.colors.pit;
            this.drawPit(pos.x, pos.y, pos.width, pos.height, pos.isStore);
            
            // Draw seeds
            this.drawSeeds(pos.x, pos.y, pos.width, pos.height, this.pits[i]);
            
            // Seed count
            ctx.fillStyle = '#F5F0E6';
            ctx.font = 'bold 16px "Noto Sans"';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.pits[i].toString(),
                pos.x + pos.width / 2,
                pos.y + pos.height + (pos.isStore ? -10 : 15)
            );
        }
        
        // Player labels
        ctx.fillStyle = '#D4AF37';
        ctx.font = '14px "Cinzel"';
        ctx.textAlign = 'center';
        
        // Player 2 (top) - their store is on left
        ctx.fillText('Player 2', this.canvas.width / 2, 20);
        
        // Player 1 (bottom) - their store is on right
        ctx.fillText('Player 1', this.canvas.width / 2, this.canvas.height - 8);
        
        // Store labels
        ctx.font = '12px "Noto Sans"';
        ctx.fillStyle = '#B8A888';
        ctx.fillText('Store', this.padding + 30, this.canvas.height / 2);
        ctx.fillText('Store', this.canvas.width - this.padding - 30, this.canvas.height / 2);
        
        // Turn indicator
        ctx.font = '16px "Cinzel"';
        ctx.fillStyle = this.currentPlayer === 1 ? this.colors.player1 : this.colors.player2;
        ctx.fillText(
            this.gameOver ? 'Game Over' : `${this.currentPlayer === 1 ? 'Player 1' : 'Player 2'}'s Turn`,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        
        // Scores
        ctx.font = 'bold 24px "Cinzel"';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText(this.pits[13].toString(), this.padding + 30, this.canvas.height / 2 + 30);
        ctx.fillText(this.pits[6].toString(), this.canvas.width - this.padding - 30, this.canvas.height / 2 + 30);
    }
    
    drawPit(x, y, width, height, isStore) {
        const ctx = this.ctx;
        const radius = isStore ? 20 : 15;
        
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
        ctx.fill();
        
        // Inner shadow
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    drawSeeds(pitX, pitY, pitWidth, pitHeight, count) {
        const ctx = this.ctx;
        const maxVisible = 12;
        const seedRadius = 6;
        
        const displayCount = Math.min(count, maxVisible);
        
        for (let i = 0; i < displayCount; i++) {
            // Arrange seeds in a pattern
            const row = Math.floor(i / 3);
            const col = i % 3;
            
            const x = pitX + 12 + col * 16 + (Math.random() - 0.5) * 4;
            const y = pitY + 15 + row * 14 + (Math.random() - 0.5) * 4;
            
            // Seed shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x + 1, y + 2, seedRadius, seedRadius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Seed
            const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, seedRadius);
            gradient.addColorStop(0, '#E8D5A3');
            gradient.addColorStop(1, this.colors.seed);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(x, y, seedRadius, seedRadius * 0.7, Math.random() * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Show + if more seeds than displayed
        if (count > maxVisible) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`+${count - maxVisible}`, pitX + pitWidth - 5, pitY + pitHeight - 5);
        }
    }
    
    onGameEnd(winner) {
        // Play win/lose sound
        const isWin = winner === this.options.playerSide;
        window.SoundManager?.play(winner === 0 ? 'move' : (isWin ? 'win' : 'lose'));
        
        Utils.showModal('game-end-modal');
        const content = Utils.$('#game-end-content');
        
        let resultText, resultColor;
        if (winner === 0) {
            resultText = "It's a Tie!";
            resultColor = '#B8A888';
        } else if (winner === this.options.playerSide) {
            resultText = '🏆 Victory!';
            resultColor = '#D4AF37';
        } else {
            resultText = 'Defeat';
            resultColor = '#8B2500';
        }
        
        if (content) {
            content.innerHTML = `
                <h2 style="color: ${resultColor}">${resultText}</h2>
                <p>Final Score: You ${this.pits[this.options.playerSide === 1 ? 6 : 13]} - ${this.pits[this.options.playerSide === 1 ? 13 : 6]} Opponent</p>
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
}

window.MancalaGame = MancalaGame;
