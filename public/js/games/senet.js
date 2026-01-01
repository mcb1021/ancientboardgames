// ============================================
// SENET - ANCIENT EGYPTIAN BOARD GAME
// ============================================

class SenetGame {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = { mode: 'ai', aiDifficulty: 'medium', playerSide: 1, ...options };
        
        this.cellSize = 60;
        this.boardPadding = 40;
        this.canvas.width = this.cellSize * 10 + this.boardPadding * 2;
        this.canvas.height = this.cellSize * 3 + this.boardPadding * 2;
        
        this.colors = {
            board: '#C9A86C',
            cell: '#E8D5A3',
            cellBorder: '#8B7355',
            player1: '#F5F5DC',
            player2: '#2C2C2C',
            special: '#1E3A5F',
            highlight: 'rgba(30, 58, 95, 0.4)'
        };
        
        // Special squares (0-indexed)
        this.specialSquares = {
            14: { name: 'House of Rebirth', safe: true },
            25: { name: 'House of Beauty', safe: true, mustPass: true },
            26: { name: 'House of Water', water: true },
            27: { name: 'House of Three Truths', requirement: 3 },
            28: { name: 'House of Re-Atoum', requirement: 2 },
            29: { name: 'Exit', exit: true }
        };
        
        this.reset();
        this.boundHandleClick = this.handleClick.bind(this);
        this.canvas.addEventListener('click', this.boundHandleClick);
        this.destroyed = false;
        this.render();
    }
    
    reset() {
        // Alternating pieces at start
        this.pieces = { 1: [], 2: [] };
        for (let i = 0; i < 10; i++) {
            this.pieces[i % 2 === 0 ? 1 : 2].push(i);
        }
        
        this.currentPlayer = 1;
        this.diceResult = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
    }
    
    // Senet uses throwing sticks (simulate 1-5)
    rollDice() {
        if (this.gameOver) return;
        
        // 4 sticks: count flat sides up (0-4), 0 counts as 5
        let result = 0;
        for (let i = 0; i < 4; i++) {
            if (Math.random() < 0.5) result++;
        }
        this.diceResult = result === 0 ? 5 : result;
        
        this.calculateValidMoves();
        
        if (this.validMoves.length === 0) {
            setTimeout(() => this.endTurn(false), 800);
        } else if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide) {
            setTimeout(() => this.makeAiMove(), 500);
        }
        
        this.render();
        return this.diceResult;
    }
    
    // Get board position from index (boustrophedon path)
    getPosition(index) {
        const row = Math.floor(index / 10);
        let col = index % 10;
        if (row === 1) col = 9 - col; // Middle row goes right to left
        return {
            x: this.boardPadding + col * this.cellSize,
            y: this.boardPadding + row * this.cellSize,
            row, col
        };
    }
    
    calculateValidMoves() {
        this.validMoves = [];
        if (!this.diceResult) return;
        
        const player = this.currentPlayer;
        const opponent = player === 1 ? 2 : 1;
        
        this.pieces[player].forEach((pos, pieceIndex) => {
            const target = pos + this.diceResult;
            
            // Check if target is valid
            if (target > 29) return; // Can only exit from 29
            if (target === 29 && pos !== 28) return; // Must be on 28 to exit
            
            // Check if occupied by own piece
            if (this.pieces[player].includes(target)) return;
            
            // Check special squares
            const special = this.specialSquares[target];
            if (special?.water && target === 26) {
                // Landing on water sends back to House of Rebirth
                this.validMoves.push({ pieceIndex, from: pos, to: 14, isWater: true });
                return;
            }
            
            // Check if can swap with opponent
            const opponentPiece = this.pieces[opponent].indexOf(target);
            if (opponentPiece !== -1) {
                // Can swap if not protected (no adjacent friendly pieces)
                const isProtected = this.isProtected(opponent, target);
                if (!isProtected && !special?.safe) {
                    this.validMoves.push({ pieceIndex, from: pos, to: target, swap: opponentPiece });
                }
                return;
            }
            
            this.validMoves.push({ pieceIndex, from: pos, to: target });
        });
    }
    
    isProtected(player, pos) {
        return this.pieces[player].includes(pos - 1) || this.pieces[player].includes(pos + 1);
    }
    
    makeMove(move) {
        const player = this.currentPlayer;
        const opponent = player === 1 ? 2 : 1;
        
        if (move.swap !== undefined) {
            // Swap positions
            this.pieces[opponent][move.swap] = move.from;
        }
        
        if (move.to === 29 || move.to > 29) {
            // Piece exits
            this.pieces[player].splice(move.pieceIndex, 1);
        } else {
            this.pieces[player][move.pieceIndex] = move.to;
        }
        
        // Check win
        if (this.pieces[player].length === 0) {
            this.gameOver = true;
            this.winner = player;
            this.onGameEnd(player);
            return;
        }
        
        // Extra turn for 1, 4, or 5
        const extraTurn = [1, 4, 5].includes(this.diceResult);
        this.endTurn(extraTurn);
        this.render();
    }
    
    endTurn(extraTurn) {
        this.diceResult = null;
        this.validMoves = [];
        
        if (!extraTurn) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }
        
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide && !this.gameOver) {
            setTimeout(() => this.rollDice(), 800);
        }
    }
    
    makeAiMove() {
        if (this.validMoves.length === 0) return;
        
        // Simple AI: prioritize exits, then swaps, then progress
        const moves = [...this.validMoves].sort((a, b) => {
            if (a.to >= 29) return -1;
            if (b.to >= 29) return 1;
            if (a.swap !== undefined) return -1;
            if (b.swap !== undefined) return 1;
            return b.to - a.to;
        });
        
        this.makeMove(moves[0]);
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (!this.diceResult) {
            this.rollDice();
            return;
        }
        
        // Check clicks on valid moves
        for (const move of this.validMoves) {
            const pos = this.getPosition(this.pieces[this.currentPlayer][move.pieceIndex]);
            if (x >= pos.x && x < pos.x + this.cellSize && y >= pos.y && y < pos.y + this.cellSize) {
                this.makeMove(move);
                return;
            }
        }
    }
    
    render() {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.board;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells
        for (let i = 0; i < 30; i++) {
            const pos = this.getPosition(i);
            const special = this.specialSquares[i];
            
            ctx.fillStyle = special ? this.colors.special : this.colors.cell;
            ctx.strokeStyle = this.colors.cellBorder;
            ctx.lineWidth = 2;
            ctx.fillRect(pos.x + 2, pos.y + 2, this.cellSize - 4, this.cellSize - 4);
            ctx.strokeRect(pos.x + 2, pos.y + 2, this.cellSize - 4, this.cellSize - 4);
            
            // Draw hieroglyph-style markers for special squares
            if (special) {
                ctx.fillStyle = '#D4AF37';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(special.name.split(' ')[2] || '★', pos.x + this.cellSize/2, pos.y + this.cellSize - 8);
            }
        }
        
        // Draw valid move highlights
        for (const move of this.validMoves) {
            const fromPos = this.getPosition(this.pieces[this.currentPlayer][move.pieceIndex]);
            ctx.fillStyle = this.colors.highlight;
            ctx.fillRect(fromPos.x + 2, fromPos.y + 2, this.cellSize - 4, this.cellSize - 4);
        }
        
        // Draw pieces
        for (const player of [1, 2]) {
            ctx.fillStyle = this.colors[`player${player}`];
            this.pieces[player].forEach(piecePos => {
                const pos = this.getPosition(piecePos);
                ctx.beginPath();
                ctx.arc(pos.x + this.cellSize/2, pos.y + this.cellSize/2, this.cellSize * 0.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = player === 1 ? '#B8A888' : '#555';
                ctx.stroke();
            });
        }
        
        // Draw dice result
        ctx.fillStyle = '#2A1F14';
        ctx.font = 'bold 24px Cinzel';
        ctx.textAlign = 'center';
        ctx.fillText(this.diceResult ? `Roll: ${this.diceResult}` : 'Click to Roll', this.canvas.width/2, this.canvas.height - 10);
    }
    
    onGameEnd(winner) {
        Utils.showModal('game-end-modal');
        const content = Utils.$('#game-end-content');
        if (content) {
            const isWin = winner === this.options.playerSide;
            content.innerHTML = `
                <h2 style="color: ${isWin ? '#D4AF37' : '#8B2500'}">${isWin ? '🏆 Victory!' : 'Defeat'}</h2>
                <p>Your soul has ${isWin ? 'passed' : 'failed'} through the afterlife!</p>
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

window.SenetGame = SenetGame;
