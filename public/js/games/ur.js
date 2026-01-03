// ============================================
// ROYAL GAME OF UR - COMPLETE IMPLEMENTATION
// ============================================

class UrGame {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            mode: 'ai', // 'ai', 'local', 'online'
            aiDifficulty: 'medium',
            playerSide: 1,
            ...options
        };
        
        // Board dimensions
        this.cellSize = 70;
        this.boardPadding = 40;
        
        // Set canvas size
        this.canvas.width = this.cellSize * 8 + this.boardPadding * 2;
        this.canvas.height = this.cellSize * 3 + this.boardPadding * 2;
        
        // Game state
        this.reset();
        
        // Get equipped skins - board must match this game (ur)
        const equippedBoard = Auth.getEquipped?.('board') || null;
        const equippedPieces = Auth.getEquipped?.('piece') || null;
        
        // Only apply board skin if it's for this game (contains 'ur') - board is personal
        const boardColors = (equippedBoard && equippedBoard.includes('_ur')) 
            ? window.ShopAssets?.getColors(equippedBoard) 
            : null;
        
        // Get MY piece colors
        const myPieceColors = window.ShopAssets?.getColors(equippedPieces);
        
        // Get OPPONENT's piece colors (from multiplayer options)
        const opponentPieceColors = this.options.opponentPieces 
            ? window.ShopAssets?.getColors(this.options.opponentPieces)
            : null;
        
        // Assign colors based on which side I am
        let player1Color, player1Border, player2Color, player2Border;
        if (this.options.playerSide === 1) {
            // I'm player 1 - my colors are player1, opponent's are player2
            player1Color = myPieceColors?.primary || '#F5E6C8';
            player1Border = myPieceColors?.secondary || '#C9B896';
            player2Color = opponentPieceColors?.primary || '#1A1A1A';
            player2Border = opponentPieceColors?.secondary || '#444444';
        } else {
            // I'm player 2 - opponent's colors are player1, my colors are player2
            player1Color = opponentPieceColors?.primary || '#F5E6C8';
            player1Border = opponentPieceColors?.secondary || '#C9B896';
            player2Color = myPieceColors?.primary || '#1A1A1A';
            player2Border = myPieceColors?.secondary || '#444444';
        }
        
        // Colors - use equipped or defaults
        this.colors = {
            board: boardColors?.primary || '#4A3728',
            boardLight: boardColors?.secondary || '#5D4A3A',
            cell: '#2A1F14',
            cellBorder: boardColors?.accent || '#6B5344',
            rosette: '#D4AF37',
            rosetteGlow: 'rgba(212, 175, 55, 0.3)',
            player1: player1Color,
            player1Border: player1Border,
            player2: player2Color,
            player2Border: player2Border,
            highlight: 'rgba(74, 124, 78, 0.5)',
            validMove: 'rgba(212, 175, 55, 0.4)'
        };
        
        // Bind events - store references for removal
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.canvas.addEventListener('click', this.boundHandleClick);
        this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
        
        // Animation state
        this.animating = false;
        this.hoverCell = null;
        this.destroyed = false;
        
        // Start render loop
        this.render();
    }
    
    // Reset game state
    reset() {
        // Each player has 7 pieces
        // Position -1 = off board (start), 15 = scored
        this.pieces = {
            1: Array(7).fill(-1), // Player 1 pieces
            2: Array(7).fill(-1)  // Player 2 pieces
        };
        
        this.currentPlayer = 1;
        this.diceResult = null;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
        
        // Board layout - defines the path for each player
        // Rosette positions: 4, 8, 14 (0-indexed: 3, 7, 13)
        this.rosettes = [3, 7, 13];
        
        // The paths each player takes (board position indices)
        // Player 1 path (top row then middle then bottom-right)
        // Player 2 path (bottom row then middle then top-right)
        this.paths = {
            1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            2: [20, 21, 22, 23, 4, 5, 6, 7, 8, 9, 10, 11, 24, 25, 26]
        };
        
        // Board cell positions (x, y) for rendering
        this.cellPositions = this.calculateCellPositions();
    }
    
    // Calculate cell positions on canvas
    calculateCellPositions() {
        const positions = {};
        const pad = this.boardPadding;
        const size = this.cellSize;
        
        // Top row (player 1 start) - positions 0-3
        for (let i = 0; i < 4; i++) {
            positions[i] = { x: pad + i * size, y: pad, row: 0, col: i };
        }
        
        // Middle row - positions 4-11
        for (let i = 0; i < 8; i++) {
            positions[4 + i] = { x: pad + i * size, y: pad + size, row: 1, col: i };
        }
        
        // Top row end - positions 12-13
        positions[12] = { x: pad + 6 * size, y: pad, row: 0, col: 6 };
        positions[13] = { x: pad + 7 * size, y: pad, row: 0, col: 7 };
        
        // Bottom row (player 2 start) - positions 20-23
        for (let i = 0; i < 4; i++) {
            positions[20 + i] = { x: pad + i * size, y: pad + 2 * size, row: 2, col: i };
        }
        
        // Bottom row end - positions 24-25
        positions[24] = { x: pad + 6 * size, y: pad + 2 * size, row: 2, col: 6 };
        positions[25] = { x: pad + 7 * size, y: pad + 2 * size, row: 2, col: 7 };
        
        // Exit position (virtual)
        positions[14] = { x: pad + 8 * size, y: pad, row: 0, col: 8 };
        positions[26] = { x: pad + 8 * size, y: pad + 2 * size, row: 2, col: 8 };
        
        return positions;
    }
    
    // Roll dice (4 tetrahedral dice, each has 2 marked corners)
    rollDice() {
        if (this.animating || this.gameOver) return;
        
        // Sound: dice roll
        window.SoundManager?.play('dice');
        
        // Simulate 4 binary dice
        let result = 0;
        const diceResults = [];
        
        for (let i = 0; i < 4; i++) {
            const roll = Math.random() < 0.5 ? 1 : 0;
            result += roll;
            diceResults.push(roll);
        }
        
        this.diceResult = result;
        this.diceIndividual = diceResults;
        
        // Animate dice
        this.animateDice(diceResults).then(() => {
            // Calculate valid moves
            this.calculateValidMoves();
            
            // If no valid moves, pass turn
            if (this.validMoves.length === 0) {
                this.addMoveToHistory(`Player ${this.currentPlayer} rolled ${result} - no valid moves`);
                setTimeout(() => this.endTurn(false), 1000);
            } else {
                this.addMoveToHistory(`Player ${this.currentPlayer} rolled ${result}`);
            }
            
            // If AI's turn
            if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide) {
                setTimeout(() => this.makeAiMove(), 500);
            }
        });
        
        return result;
    }
    
    // Animate dice roll
    async animateDice(results) {
        const container = Utils.$('#dice-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Create dice elements
        for (let i = 0; i < 4; i++) {
            const dice = Utils.createElement('div', { 
                class: 'dice pyramid rolling'
            });
            container.appendChild(dice);
        }
        
        // Wait for animation
        await Utils.wait(500);
        
        // Show results
        const diceElements = container.querySelectorAll('.dice');
        results.forEach((result, i) => {
            diceElements[i].classList.remove('rolling');
            if (result === 1) {
                diceElements[i].classList.add('marked');
            }
            diceElements[i].textContent = result;
        });
        
        Utils.playSound('dice');
    }
    
    // Calculate valid moves for current player
    calculateValidMoves() {
        this.validMoves = [];
        
        if (this.diceResult === 0 || this.diceResult === null) return;
        
        const player = this.currentPlayer;
        const path = this.paths[player];
        const pieces = this.pieces[player];
        
        pieces.forEach((position, pieceIndex) => {
            // Piece already scored
            if (position >= path.length) return;
            
            // Calculate target position
            const currentPathIndex = position; // -1 means off board
            const targetPathIndex = currentPathIndex + this.diceResult;
            
            // Check if move is valid
            if (targetPathIndex < path.length) {
                const targetBoardPos = path[targetPathIndex];
                
                // Check if target is occupied by own piece
                const ownPieceAtTarget = pieces.some((p, i) => 
                    i !== pieceIndex && p === targetPathIndex
                );
                
                if (!ownPieceAtTarget) {
                    // Check if target is rosette with opponent
                    const opponentPieces = this.pieces[player === 1 ? 2 : 1];
                    const opponentPath = this.paths[player === 1 ? 2 : 1];
                    
                    // Find opponent piece at same board position
                    const opponentAtTarget = opponentPieces.findIndex((p, i) => {
                        if (p < 0 || p >= opponentPath.length) return false;
                        return opponentPath[p] === targetBoardPos;
                    });
                    
                    // Can't capture on rosette
                    const isRosette = this.rosettes.includes(targetPathIndex);
                    if (opponentAtTarget !== -1 && isRosette) {
                        return; // Can't land on rosette with opponent
                    }
                    
                    this.validMoves.push({
                        pieceIndex,
                        from: currentPathIndex,
                        to: targetPathIndex,
                        captures: opponentAtTarget !== -1 ? opponentAtTarget : null,
                        isRosette
                    });
                }
            } else if (targetPathIndex === path.length) {
                // Exact roll to bear off
                this.validMoves.push({
                    pieceIndex,
                    from: currentPathIndex,
                    to: targetPathIndex,
                    captures: null,
                    isRosette: false,
                    bearsOff: true
                });
            }
        });
    }
    
    // Make a move
    makeMove(move, isRemote = false) {
        if (this.animating || this.gameOver) return false;
        
        const player = this.currentPlayer;
        
        // Emit move to server if online mode and local player made the move
        if (this.options.mode === 'online' && !isRemote && player === this.options.playerSide) {
            window.socket?.emit('game-move', {
                roomId: this.options.roomId,
                move: move,
                gameState: this.getState()
            });
        }
        
        // Handle capture
        if (move.captures !== null) {
            const opponent = player === 1 ? 2 : 1;
            this.pieces[opponent][move.captures] = -1;
            this.addMoveToHistory(`Player ${player} captured opponent's piece!`);
            window.SoundManager?.play('capture');
        } else {
            // Normal move sound
            window.SoundManager?.play('move');
        }
        
        // Move piece
        this.pieces[player][move.pieceIndex] = move.to;
        
        // Check for win
        if (this.checkWin(player)) {
            this.gameOver = true;
            this.winner = player;
            this.onGameEnd(player);
            return true;
        }
        
        // Check for extra turn (rosette)
        const extraTurn = move.isRosette;
        
        if (extraTurn) {
            this.addMoveToHistory(`Player ${player} landed on rosette - extra turn!`);
            window.SoundManager?.play('rosette');
        }
        
        this.endTurn(extraTurn);
        this.render();
        
        return true;
    }
    
    // End turn
    endTurn(extraTurn = false) {
        this.diceResult = null;
        this.selectedPiece = null;
        this.validMoves = [];
        
        if (!extraTurn) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }
        
        this.updateTurnIndicator();
        
        // If AI's turn
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide && !this.gameOver) {
            setTimeout(() => this.rollDice(), 800);
        }
    }
    
    // Check for win
    checkWin(player) {
        const path = this.paths[player];
        return this.pieces[player].every(p => p >= path.length);
    }
    
    // AI move selection
    makeAiMove() {
        if (this.validMoves.length === 0) return;
        
        let move;
        
        switch (this.options.aiDifficulty) {
            case 'easy':
                // Random move
                move = Utils.randomChoice(this.validMoves);
                break;
                
            case 'medium':
                // Prioritize captures, rosettes, and progress
                move = this.selectMediumAiMove();
                break;
                
            case 'hard':
                // Use minimax with evaluation
                move = this.selectHardAiMove();
                break;
                
            default:
                move = this.selectMediumAiMove();
        }
        
        if (move) {
            this.makeMove(move);
        }
    }
    
    // Medium AI: Simple heuristics
    selectMediumAiMove() {
        const moves = [...this.validMoves];
        
        // Sort by priority
        moves.sort((a, b) => {
            // Bearing off is highest priority
            if (a.bearsOff && !b.bearsOff) return -1;
            if (b.bearsOff && !a.bearsOff) return 1;
            
            // Captures are high priority
            if (a.captures !== null && b.captures === null) return -1;
            if (b.captures !== null && a.captures === null) return 1;
            
            // Rosettes are good
            if (a.isRosette && !b.isRosette) return -1;
            if (b.isRosette && !a.isRosette) return 1;
            
            // Prefer advancing furthest piece
            return b.to - a.to;
        });
        
        // Add some randomness
        if (moves.length > 1 && Math.random() < 0.3) {
            return moves[1];
        }
        
        return moves[0];
    }
    
    // Hard AI: Minimax evaluation
    selectHardAiMove() {
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of this.validMoves) {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove || this.validMoves[0];
    }
    
    // Evaluate a move for AI
    evaluateMove(move) {
        let score = 0;
        
        // Bearing off
        if (move.bearsOff) score += 100;
        
        // Capturing
        if (move.captures !== null) score += 50;
        
        // Landing on rosette (safe + extra turn)
        if (move.isRosette) score += 40;
        
        // Progress
        score += move.to * 2;
        
        // Moving from unsafe position
        if (move.from >= 0 && !this.rosettes.includes(move.from)) {
            score += 10;
        }
        
        // Entering the shared middle path strategically
        if (move.to >= 4 && move.to <= 11) {
            score += 5;
        }
        
        return score;
    }
    
    // Handle canvas click
    handleClick(e) {
        if (this.animating || this.gameOver) return;
        if (this.options.mode === 'ai' && this.currentPlayer !== this.options.playerSide) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicked on dice area (roll)
        if (this.diceResult === null) {
            this.rollDice();
            return;
        }
        
        // Check if clicked on a valid move
        for (const move of this.validMoves) {
            const piece = this.pieces[this.currentPlayer][move.pieceIndex];
            
            // Get piece position
            let pos;
            if (piece === -1) {
                // Off-board piece - check start area
                pos = this.getStartAreaPosition(this.currentPlayer, move.pieceIndex);
            } else {
                const boardPos = this.paths[this.currentPlayer][piece];
                pos = this.cellPositions[boardPos];
            }
            
            if (pos && this.isClickInCell(x, y, pos.x, pos.y)) {
                this.makeMove(move);
                return;
            }
            
            // Also check target position
            if (move.to < this.paths[this.currentPlayer].length) {
                const targetBoardPos = this.paths[this.currentPlayer][move.to];
                const targetPos = this.cellPositions[targetBoardPos];
                if (targetPos && this.isClickInCell(x, y, targetPos.x, targetPos.y)) {
                    this.makeMove(move);
                    return;
                }
            }
        }
    }
    
    // Handle mouse move for hover effects
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.hoverCell = null;
        
        for (const [key, pos] of Object.entries(this.cellPositions)) {
            if (this.isClickInCell(x, y, pos.x, pos.y)) {
                this.hoverCell = parseInt(key);
                break;
            }
        }
        
        this.render();
    }
    
    // Check if click is within a cell
    isClickInCell(clickX, clickY, cellX, cellY) {
        return clickX >= cellX && clickX < cellX + this.cellSize &&
               clickY >= cellY && clickY < cellY + this.cellSize;
    }
    
    // Get start area position for off-board pieces
    getStartAreaPosition(player, pieceIndex) {
        const pad = this.boardPadding;
        const size = this.cellSize;
        
        if (player === 1) {
            return {
                x: pad - size - 20 + (pieceIndex % 4) * 20,
                y: pad + Math.floor(pieceIndex / 4) * 25,
                isStart: true
            };
        } else {
            return {
                x: pad - size - 20 + (pieceIndex % 4) * 20,
                y: pad + 2 * size + Math.floor(pieceIndex / 4) * 25,
                isStart: true
            };
        }
    }
    
    // Main render function
    render() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = this.colors.board;
        ctx.fillRect(0, 0, width, height);
        
        // Draw board background pattern
        this.drawBoardBackground();
        
        // Draw cells
        this.drawCells();
        
        // Draw valid move highlights
        this.drawValidMoveHighlights();
        
        // Draw pieces
        this.drawPieces();
        
        // Draw start areas
        this.drawStartAreas();
        
        // Request next frame if animating
        if (this.animating && !this.destroyed) {
            requestAnimationFrame(() => this.render());
        }
    }
    
    // Draw board background
    drawBoardBackground() {
        const ctx = this.ctx;
        const pad = this.boardPadding;
        const size = this.cellSize;
        
        // Wood grain effect
        ctx.fillStyle = this.colors.boardLight;
        for (let i = 0; i < 20; i++) {
            const y = Math.random() * this.canvas.height;
            ctx.globalAlpha = 0.1;
            ctx.fillRect(0, y, this.canvas.width, 2);
        }
        ctx.globalAlpha = 1;
    }
    
    // Draw all cells
    drawCells() {
        const ctx = this.ctx;
        const size = this.cellSize;
        
        // Define which cells exist on the board
        const existingCells = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20, 21, 22, 23, 24, 25];
        
        for (const cellIndex of existingCells) {
            const pos = this.cellPositions[cellIndex];
            if (!pos) continue;
            
            // Draw cell
            ctx.fillStyle = this.colors.cell;
            ctx.strokeStyle = this.colors.cellBorder;
            ctx.lineWidth = 2;
            
            Utils.canvas.roundRect(ctx, pos.x + 2, pos.y + 2, size - 4, size - 4, 4);
            ctx.fill();
            ctx.stroke();
            
            // Check if this is a rosette
            const isRosette = this.isRosetteCell(cellIndex);
            if (isRosette) {
                this.drawRosette(pos.x + size / 2, pos.y + size / 2, size * 0.35);
            }
            
            // Hover effect
            if (this.hoverCell === cellIndex) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                Utils.canvas.roundRect(ctx, pos.x + 2, pos.y + 2, size - 4, size - 4, 4);
                ctx.fill();
            }
        }
    }
    
    // Check if a board position is a rosette
    isRosetteCell(boardPos) {
        // Rosettes are at path positions 3, 7, 13 for player 1
        // Which correspond to board positions: 3, 7, 13 (same indices)
        // And for player 2 the middle rosette is shared
        const rosettePositions = [3, 7, 13, 23]; // 23 is player 2's start rosette equivalent
        return rosettePositions.includes(boardPos);
    }
    
    // Draw rosette pattern
    drawRosette(x, y, radius) {
        const ctx = this.ctx;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
        gradient.addColorStop(0, this.colors.rosetteGlow);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw flower pattern
        Utils.canvas.drawRosette(ctx, x, y, radius);
    }
    
    // Draw valid move highlights
    drawValidMoveHighlights() {
        if (this.validMoves.length === 0) return;
        
        const ctx = this.ctx;
        const size = this.cellSize;
        const player = this.currentPlayer;
        const path = this.paths[player];
        
        for (const move of this.validMoves) {
            // Highlight source piece
            const piecePos = this.pieces[player][move.pieceIndex];
            if (piecePos >= 0 && piecePos < path.length) {
                const boardPos = path[piecePos];
                const pos = this.cellPositions[boardPos];
                if (pos) {
                    ctx.fillStyle = 'rgba(74, 124, 78, 0.3)';
                    Utils.canvas.roundRect(ctx, pos.x + 2, pos.y + 2, size - 4, size - 4, 4);
                    ctx.fill();
                }
            }
            
            // Highlight target
            if (move.to < path.length) {
                const targetBoardPos = path[move.to];
                const targetPos = this.cellPositions[targetBoardPos];
                if (targetPos) {
                    ctx.fillStyle = this.colors.validMove;
                    Utils.canvas.roundRect(ctx, targetPos.x + 2, targetPos.y + 2, size - 4, size - 4, 4);
                    ctx.fill();
                    
                    // Draw arrow or indicator
                    ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
                    ctx.beginPath();
                    ctx.arc(targetPos.x + size / 2, targetPos.y + size / 2, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    // Draw all pieces on the board
    drawPieces() {
        const ctx = this.ctx;
        const size = this.cellSize;
        const pieceRadius = size * 0.3;
        
        for (const player of [1, 2]) {
            const path = this.paths[player];
            const color = player === 1 ? this.colors.player1 : this.colors.player2;
            const borderColor = player === 1 ? this.colors.player1Border : this.colors.player2Border;
            
            this.pieces[player].forEach((pathPos, pieceIndex) => {
                if (pathPos < 0 || pathPos >= path.length) return; // Off board or scored
                
                const boardPos = path[pathPos];
                const pos = this.cellPositions[boardPos];
                if (!pos) return;
                
                const x = pos.x + size / 2;
                const y = pos.y + size / 2;
                
                // Draw piece shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.ellipse(x + 2, y + 4, pieceRadius, pieceRadius * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw piece
                const gradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, pieceRadius);
                gradient.addColorStop(0, player === 1 ? '#FFFEF0' : '#3A3A3A');
                gradient.addColorStop(1, color);
                
                ctx.fillStyle = gradient;
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, pieceRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Draw dots on piece
                this.drawPieceDots(x, y, pieceRadius * 0.6, player);
            });
        }
    }
    
    // Draw decorative dots on pieces
    drawPieceDots(x, y, radius, player) {
        const ctx = this.ctx;
        const dotColor = player === 1 ? '#2A1F14' : '#D4AF37';
        const dotRadius = 3;
        
        ctx.fillStyle = dotColor;
        
        // Center dot
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Surrounding dots
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, dotRadius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw start areas showing pieces waiting to enter
    drawStartAreas() {
        const ctx = this.ctx;
        const pad = this.boardPadding;
        const size = this.cellSize;
        
        for (const player of [1, 2]) {
            const offBoardPieces = this.pieces[player].filter(p => p === -1).length;
            const scoredPieces = this.pieces[player].filter(p => p >= this.paths[player].length).length;
            
            // Starting pieces indicator
            const startY = player === 1 ? pad - 25 : pad + 3 * size + 5;
            ctx.fillStyle = this.colors[`player${player}`];
            ctx.font = '14px "Noto Sans"';
            ctx.textAlign = 'left';
            ctx.fillText(`Waiting: ${offBoardPieces}`, pad, startY);
            
            // Scored pieces indicator
            const endX = pad + 8 * size + 10;
            ctx.textAlign = 'right';
            ctx.fillText(`Scored: ${scoredPieces}`, endX, startY);
            
            // Draw small piece indicators
            const indicatorSize = 15;
            for (let i = 0; i < offBoardPieces; i++) {
                ctx.fillStyle = player === 1 ? this.colors.player1 : this.colors.player2;
                ctx.beginPath();
                ctx.arc(pad + 80 + i * 20, startY - 5, indicatorSize / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = player === 1 ? this.colors.player1Border : this.colors.player2Border;
                ctx.stroke();
            }
        }
    }
    
    // Add move to history
    addMoveToHistory(text) {
        this.moveHistory.push({
            text,
            timestamp: Date.now()
        });
        
        // Update UI
        const historyList = Utils.$('#move-history');
        if (historyList) {
            const li = Utils.createElement('li', {}, [text]);
            historyList.appendChild(li);
            historyList.scrollTop = historyList.scrollHeight;
        }
    }
    
    // Update turn indicator
    updateTurnIndicator() {
        const indicator = Utils.$('#turn-indicator');
        if (!indicator) return;
        
        const isYourTurn = this.options.mode !== 'ai' || this.currentPlayer === this.options.playerSide;
        
        indicator.className = isYourTurn ? 'your-turn' : 'opponent-turn';
        indicator.textContent = isYourTurn ? 'Your Turn - Click to Roll' : "Opponent's Turn";
    }
    
    // Handle game end
    onGameEnd(winner) {
        const isPlayerWin = this.options.mode !== 'ai' || winner === this.options.playerSide;
        
        // Play win/lose sound
        window.SoundManager?.play(isPlayerWin ? 'win' : 'lose');
        
        // Show result modal
        const modal = Utils.$('#game-end-modal');
        const content = Utils.$('#game-end-content');
        
        if (modal && content) {
            content.innerHTML = `
                <div class="game-result-overlay">
                    <h2 class="result-title ${isPlayerWin ? 'victory' : 'defeat'}">
                        ${isPlayerWin ? '🏆 Victory!' : 'Defeat'}
                    </h2>
                    <div class="result-stats">
                        <div class="result-stat">
                            <span class="result-stat-value">${this.moveHistory.length}</span>
                            <span class="result-stat-label">Moves</span>
                        </div>
                    </div>
                    <div class="result-actions">
                        <button class="btn-primary" onclick="window.currentGame.reset(); window.currentGame.render(); Utils.hideModal('game-end-modal');">
                            Play Again
                        </button>
                        <button class="btn-secondary" onclick="navigateTo('games')">
                            Choose Game
                        </button>
                    </div>
                </div>
            `;
            Utils.showModal('game-end-modal');
        }
        
        // Update stats if signed in
        if (Auth.isSignedIn()) {
            Auth.updateStats(isPlayerWin);
        }
        
        Utils.playSound(isPlayerWin ? 'victory' : 'defeat');
    }
    
    // Destroy game instance
    destroy() {
        this.destroyed = true;
        this.animating = false;
        this.gameOver = true;
        this.canvas.removeEventListener('click', this.boundHandleClick);
        this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Get game state for syncing
    getState() {
        return {
            pieces: JSON.parse(JSON.stringify(this.pieces)),
            currentPlayer: this.currentPlayer,
            diceResult: this.diceResult,
            moveHistory: [...this.moveHistory]
        };
    }
    
    // Receive move from opponent (multiplayer)
    receiveMove(move) {
        this.makeMove(move, true);
    }
    
    // Receive dice roll from opponent
    receiveDiceRoll(result) {
        this.diceResult = result;
        this.calculateValidMoves();
        this.render();
    }
}

// Export for use
window.UrGame = UrGame;
