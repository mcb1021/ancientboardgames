// ============================================
// HNEFATAFL - VIKING STRATEGY GAME
// ============================================

class HnefataflGame {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = { mode: 'ai', aiDifficulty: 'medium', playerSide: 2, ...options }; // Defenders usually go second
        
        this.boardSize = 11;
        this.cellSize = 50;
        this.boardPadding = 30;
        this.canvas.width = this.cellSize * this.boardSize + this.boardPadding * 2;
        this.canvas.height = this.cellSize * this.boardSize + this.boardPadding * 2;
        
        // Get equipped skins - board must match this game (hnef)
        const equippedBoard = Auth.getEquipped?.('board') || null;
        const equippedPieces = Auth.getEquipped?.('piece') || null;
        
        // Only apply board skin if it's for this game (contains 'hnef') - board is personal
        const boardColors = (equippedBoard && equippedBoard.includes('hnef')) 
            ? window.ShopAssets?.getColors(equippedBoard) 
            : null;
        
        // Get MY piece colors
        const myPieceColors = window.ShopAssets?.getColors(equippedPieces);
        
        // Get OPPONENT's piece colors (from multiplayer options)
        const opponentPieceColors = this.options.opponentPieces 
            ? window.ShopAssets?.getColors(this.options.opponentPieces)
            : null;
        
        // Hnefatafl: Player 1 = Attackers (black), Player 2 = Defenders (white)
        let attackerColor, defenderColor;
        if (this.options.playerSide === 1) {
            // I'm attackers - my colors, opponent's are defenders
            attackerColor = myPieceColors?.primary || '#1A1A1A';
            defenderColor = opponentPieceColors?.primary || '#F5F5DC';
        } else {
            // I'm defenders - opponent's are attackers, my colors are defenders
            attackerColor = opponentPieceColors?.primary || '#1A1A1A';
            defenderColor = myPieceColors?.primary || '#F5F5DC';
        }
        
        this.colors = {
            board: boardColors?.primary || '#2F4858',
            cellLight: boardColors?.secondary || '#3D5A6C',
            cellDark: '#2A4A5A',
            corner: '#1A3040',
            throne: boardColors?.accent || '#D4AF37',
            attacker: attackerColor,
            defender: defenderColor,
            king: '#FFD700',
            highlight: 'rgba(212, 175, 55, 0.4)',
            selected: 'rgba(74, 124, 78, 0.5)'
        };
        
        this.reset();
        this.boundHandleClick = this.handleClick.bind(this);
        this.canvas.addEventListener('click', this.boundHandleClick);
        this.destroyed = false;
        this.render();
    }
    
    reset() {
        // Initialize board - 0 = empty, 1 = attacker, 2 = defender, 3 = king
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
        
        // Place attackers (24 pieces on edges)
        const attackerPositions = [
            [0,3],[0,4],[0,5],[0,6],[0,7],[1,5], // Top
            [10,3],[10,4],[10,5],[10,6],[10,7],[9,5], // Bottom
            [3,0],[4,0],[5,0],[6,0],[7,0],[5,1], // Left
            [3,10],[4,10],[5,10],[6,10],[7,10],[5,9]  // Right
        ];
        attackerPositions.forEach(([r, c]) => this.board[r][c] = 1);
        
        // Place defenders (12 pieces + king)
        const defenderPositions = [
            [3,5],[4,4],[4,5],[4,6],[5,3],[5,4],[5,6],[5,7],[6,4],[6,5],[6,6],[7,5]
        ];
        defenderPositions.forEach(([r, c]) => this.board[r][c] = 2);
        
        // Place king in center
        this.board[5][5] = 3;
        this.kingPos = { r: 5, c: 5 };
        
        this.currentPlayer = 1; // Attackers go first
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
    }
    
    // Get valid moves for a piece
    getValidMoves(r, c) {
        const piece = this.board[r][c];
        if (piece === 0) return [];
        
        const moves = [];
        const directions = [[0,1],[0,-1],[1,0],[-1,0]];
        
        for (const [dr, dc] of directions) {
            let nr = r + dr;
            let nc = c + dc;
            
            while (nr >= 0 && nr < this.boardSize && nc >= 0 && nc < this.boardSize) {
                // Check if square is empty
                if (this.board[nr][nc] !== 0) break;
                
                // Corners and throne restrictions
                const isCorner = this.isCorner(nr, nc);
                const isThrone = nr === 5 && nc === 5;
                
                // Only king can enter corners
                if (isCorner && piece !== 3) break;
                
                // Throne: anyone can pass through, only king can stop
                if (isThrone && piece !== 3) {
                    nr += dr;
                    nc += dc;
                    continue;
                }
                
                moves.push({ r: nr, c: nc });
                nr += dr;
                nc += dc;
            }
        }
        
        return moves;
    }
    
    isCorner(r, c) {
        return (r === 0 || r === 10) && (c === 0 || c === 10);
    }
    
    makeMove(fromR, fromC, toR, toC, isRemote = false) {
        const piece = this.board[fromR][fromC];
        
        // Emit move to server if online mode
        if (this.options.mode === 'online' && !isRemote && this.currentPlayer === this.options.playerSide) {
            window.socket?.emit('game-move', {
                roomId: this.options.roomId,
                move: { fromR, fromC, toR, toC },
                gameState: this.getState()
            });
            // Signal turn change for timer
            window.onTurnChange?.();
        }
        
        this.board[fromR][fromC] = 0;
        this.board[toR][toC] = piece;
        
        // Sound: move piece
        window.SoundManager?.play('move');
        
        // Update king position
        if (piece === 3) {
            this.kingPos = { r: toR, c: toC };
            
            // Check if king escaped to corner
            if (this.isCorner(toR, toC)) {
                this.gameOver = true;
                this.winner = 2; // Defenders win
                this.onGameEnd(2);
                return;
            }
        }
        
        // Check for captures
        this.checkCaptures(toR, toC, piece);
        
        // Check if king is captured
        if (this.isKingCaptured()) {
            this.gameOver = true;
            this.winner = 1; // Attackers win
            this.onGameEnd(1);
            return;
        }
        
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        // AI move
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide && !this.gameOver) {
            setTimeout(() => this.makeAiMove(), 500);
        }
        
        this.render();
    }
    
    checkCaptures(r, c, piece) {
        const directions = [[0,1],[0,-1],[1,0],[-1,0]];
        const isAttacker = piece === 1;
        const enemyTypes = isAttacker ? [2] : [1]; // King captured differently
        let anyCaptured = false;
        
        for (const [dr, dc] of directions) {
            const adjR = r + dr;
            const adjC = c + dc;
            const farR = r + dr * 2;
            const farC = c + dc * 2;
            
            if (adjR < 0 || adjR >= this.boardSize || adjC < 0 || adjC >= this.boardSize) continue;
            
            const adjPiece = this.board[adjR][adjC];
            if (!enemyTypes.includes(adjPiece)) continue;
            
            // Check if sandwiched
            let captured = false;
            
            if (farR >= 0 && farR < this.boardSize && farC >= 0 && farC < this.boardSize) {
                const farPiece = this.board[farR][farC];
                // Sandwiched by friendly piece
                if ((isAttacker && farPiece === 1) || (!isAttacker && (farPiece === 2 || farPiece === 3))) {
                    captured = true;
                }
            }
            
            // Sandwiched against corner or throne (if throne is empty)
            if (this.isCorner(farR, farC) || (farR === 5 && farC === 5 && this.board[5][5] === 0)) {
                captured = true;
            }
            
            if (captured) {
                this.board[adjR][adjC] = 0;
                anyCaptured = true;
            }
        }
        
        // Play capture sound if any captures
        if (anyCaptured) {
            window.SoundManager?.play('capture');
        }
    }
    
    isKingCaptured() {
        const { r, c } = this.kingPos;
        const directions = [[0,1],[0,-1],[1,0],[-1,0]];
        
        // King must be surrounded on all 4 sides
        let surrounded = 0;
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            
            if (nr < 0 || nr >= this.boardSize || nc < 0 || nc >= this.boardSize) {
                surrounded++; // Edge counts as surrounding
            } else if (this.board[nr][nc] === 1) {
                surrounded++;
            } else if (nr === 5 && nc === 5) {
                surrounded++; // Empty throne counts
            }
        }
        
        return surrounded === 4;
    }
    
    makeAiMove() {
        const pieces = [];
        const isAttacker = this.currentPlayer === 1;
        const pieceTypes = isAttacker ? [1] : [2, 3];
        
        // Collect all pieces and their moves
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (pieceTypes.includes(this.board[r][c])) {
                    const moves = this.getValidMoves(r, c);
                    moves.forEach(move => {
                        pieces.push({ from: { r, c }, to: move, score: this.evaluateMove(r, c, move.r, move.c) });
                    });
                }
            }
        }
        
        if (pieces.length === 0) return;
        
        // Sort by score and pick best (with some randomness)
        pieces.sort((a, b) => b.score - a.score);
        const topMoves = pieces.slice(0, Math.min(3, pieces.length));
        const move = topMoves[Math.floor(Math.random() * topMoves.length)];
        
        this.makeMove(move.from.r, move.from.c, move.to.r, move.to.c);
    }
    
    evaluateMove(fromR, fromC, toR, toC) {
        let score = 0;
        const piece = this.board[fromR][fromC];
        const isKing = piece === 3;
        
        // King escape to corner
        if (isKing && this.isCorner(toR, toC)) return 1000;
        
        // King moving toward corners
        if (isKing) {
            const cornerDist = Math.min(
                Math.abs(toR) + Math.abs(toC),
                Math.abs(toR) + Math.abs(toC - 10),
                Math.abs(toR - 10) + Math.abs(toC),
                Math.abs(toR - 10) + Math.abs(toC - 10)
            );
            score += (20 - cornerDist) * 5;
        }
        
        // Potential captures
        const directions = [[0,1],[0,-1],[1,0],[-1,0]];
        for (const [dr, dc] of directions) {
            const adjR = toR + dr;
            const adjC = toC + dc;
            if (adjR >= 0 && adjR < this.boardSize && adjC >= 0 && adjC < this.boardSize) {
                const adjPiece = this.board[adjR][adjC];
                if ((piece === 1 && adjPiece === 2) || (piece !== 1 && adjPiece === 1)) {
                    score += 20;
                }
            }
        }
        
        // Attackers: move toward king
        if (piece === 1) {
            const kingDist = Math.abs(toR - this.kingPos.r) + Math.abs(toC - this.kingPos.c);
            score += (20 - kingDist) * 2;
        }
        
        return score;
    }
    
    handleClick(e) {
        if (this.gameOver) return;
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.boardPadding;
        const y = e.clientY - rect.top - this.boardPadding;
        const c = Math.floor(x / this.cellSize);
        const r = Math.floor(y / this.cellSize);
        
        if (r < 0 || r >= this.boardSize || c < 0 || c >= this.boardSize) return;
        
        // If piece selected, try to move
        if (this.selectedPiece) {
            const validMove = this.validMoves.find(m => m.r === r && m.c === c);
            if (validMove) {
                this.makeMove(this.selectedPiece.r, this.selectedPiece.c, r, c);
                return;
            }
        }
        
        // Select piece
        const piece = this.board[r][c];
        const canSelect = (this.currentPlayer === 1 && piece === 1) ||
                         (this.currentPlayer === 2 && (piece === 2 || piece === 3));
        
        if (canSelect) {
            this.selectedPiece = { r, c };
            this.validMoves = this.getValidMoves(r, c);
        } else {
            this.selectedPiece = null;
            this.validMoves = [];
        }
        
        this.render();
    }
    
    render() {
        const ctx = this.ctx;
        const pad = this.boardPadding;
        const size = this.cellSize;
        
        // Background
        ctx.fillStyle = this.colors.board;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const x = pad + c * size;
                const y = pad + r * size;
                
                // Cell color
                if (this.isCorner(r, c)) {
                    ctx.fillStyle = this.colors.corner;
                } else if (r === 5 && c === 5) {
                    ctx.fillStyle = this.colors.throne;
                } else {
                    ctx.fillStyle = (r + c) % 2 === 0 ? this.colors.cellLight : this.colors.cellDark;
                }
                
                ctx.fillRect(x, y, size, size);
                ctx.strokeStyle = '#1A3040';
                ctx.strokeRect(x, y, size, size);
            }
        }
        
        // Draw valid moves
        ctx.fillStyle = this.colors.highlight;
        this.validMoves.forEach(move => {
            ctx.fillRect(pad + move.c * size, pad + move.r * size, size, size);
        });
        
        // Draw selected
        if (this.selectedPiece) {
            ctx.fillStyle = this.colors.selected;
            ctx.fillRect(pad + this.selectedPiece.c * size, pad + this.selectedPiece.r * size, size, size);
        }
        
        // Draw pieces
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const piece = this.board[r][c];
                if (piece === 0) continue;
                
                const x = pad + c * size + size / 2;
                const y = pad + r * size + size / 2;
                const radius = size * 0.35;
                
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(x + 2, y + 3, radius, radius * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Piece
                if (piece === 3) {
                    // King
                    ctx.fillStyle = this.colors.king;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#B8860B';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Crown symbol
                    ctx.fillStyle = '#8B4513';
                    ctx.font = `${size * 0.4}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('♔', x, y);
                } else {
                    ctx.fillStyle = piece === 1 ? this.colors.attacker : this.colors.defender;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = piece === 1 ? '#333' : '#B8A888';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
        
        // Turn indicator
        ctx.fillStyle = '#F5F0E6';
        ctx.font = '14px "Noto Sans"';
        ctx.textAlign = 'center';
        ctx.fillText(
            this.currentPlayer === 1 ? 'Attackers Turn (Black)' : 'Defenders Turn (White)',
            this.canvas.width / 2,
            this.canvas.height - 10
        );
    }
    
    onGameEnd(winner) {
        const isWin = (winner === 1 && this.options.playerSide === 1) || 
                      (winner === 2 && this.options.playerSide === 2);
        window.SoundManager?.play(isWin ? 'win' : 'lose');
        
        Utils.showModal('game-end-modal');
        const content = Utils.$('#game-end-content');
        if (content) {
            content.innerHTML = `
                <h2 style="color: ${isWin ? '#D4AF37' : '#8B2500'}">${isWin ? '🏆 Victory!' : 'Defeat'}</h2>
                <p>${winner === 1 ? 'The King has been captured!' : 'The King has escaped!'}</p>
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
    
    getState() {
        return {
            board: this.board.map(row => [...row]),
            currentPlayer: this.currentPlayer,
            kingPos: {...this.kingPos}
        };
    }
    
    receiveMove(move) {
        this.makeMove(move.fromR, move.fromC, move.toR, move.toC, true);
    }
}

window.HnefataflGame = HnefataflGame;
