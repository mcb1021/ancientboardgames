// ============================================
// ANCIENT BOARD GAMES - CONFIGURATION
// ============================================

const CONFIG = {
    // Firebase Configuration
    firebase: {
        apiKey: "AIzaSyD-okLJ_W5KU8j57kextDCONVG6Zw1fp3c",
        authDomain: "ancient-board-games-af64c.firebaseapp.com",
        databaseURL: "https://ancient-board-games-af64c-default-rtdb.firebaseio.com",
        projectId: "ancient-board-games-af64c",
        storageBucket: "ancient-board-games-af64c.firebasestorage.app",
        messagingSenderId: "29980255876",
        appId: "1:29980255876:web:5822e7719910d8757044d1"
    },
    
    // Stripe Configuration
    stripe: {
        publicKey: "pk_live_51RyjMMJmPcz7JQnM27qD3sYGmXrvDIf5jjryZIaOJMHrS3B4lytSmWTo1E41ikRAqLfMfyBUR2UETwG9y9VudhoP00O2aWbnNl"
    },
    
    // Socket.io Server URL (for multiplayer)
    socketUrl: window.location.origin,
    
    // Game Settings
    games: {
        ur: {
            name: "Royal Game of Ur",
            era: "Mesopotamia • 2600 BCE",
            players: 2,
            duration: "15-30 min",
            pieces: 7,
            boardSize: { width: 800, height: 400 },
            description: "Race your pieces across the board in this 4,600-year-old game of strategy and luck from ancient Mesopotamia.",
            rules: `
                <h3>Objective</h3>
                <p>Be the first player to move all 7 of your pieces off the board.</p>
                
                <h3>Setup</h3>
                <p>Each player starts with 7 pieces off the board. The board has 20 squares arranged in a distinctive pattern with 5 rosette (flower) squares.</p>
                
                <h3>Movement</h3>
                <ul>
                    <li>Roll 4 tetrahedral dice. Count the marked corners facing up (0-4).</li>
                    <li>Move one piece forward by that many squares along your path.</li>
                    <li>If you roll 0, you lose your turn.</li>
                </ul>
                
                <h3>Special Rules</h3>
                <ul>
                    <li><strong>Rosettes:</strong> Landing on a rosette grants an extra turn and protection from capture.</li>
                    <li><strong>Capture:</strong> Land on an opponent's piece to send it back to start.</li>
                    <li><strong>Exact Exit:</strong> You must roll the exact number to bear off a piece.</li>
                </ul>
            `,
            history: `
                <p>The Royal Game of Ur was discovered by Sir Leonard Woolley in the 1920s during excavations of the Royal Cemetery of Ur in modern-day Iraq. The most famous board, dating to approximately 2600 BCE, is now housed in the British Museum.</p>
                
                <p>This makes it one of the oldest known board games in human history, predating chess by over 3,000 years. The game was played across the ancient Middle East for over 2,000 years.</p>
                
                <p>The rules were reconstructed by Irving Finkel, a curator at the British Museum, who deciphered a Babylonian clay tablet from 177 BCE that described how to play.</p>
            `
        },
        senet: {
            name: "Senet",
            era: "Egypt • 3100 BCE",
            players: 2,
            duration: "20-40 min",
            pieces: 5,
            boardSize: { width: 600, height: 300 },
            description: "The game of passing to the afterlife, found in Tutankhamun's tomb. Guide your pieces through the underworld.",
            rules: `
                <h3>Objective</h3>
                <p>Be the first to move all 5 pieces off the board by reaching the final square and beyond.</p>
                
                <h3>The Board</h3>
                <p>30 squares arranged in 3 rows of 10. Pieces move in a boustrophedon (zig-zag) pattern.</p>
                
                <h3>Movement</h3>
                <ul>
                    <li>Throw 4 casting sticks to determine movement (1-5).</li>
                    <li>Throwing 1, 4, or 5 grants an extra turn.</li>
                    <li>Pieces move forward along the path.</li>
                </ul>
                
                <h3>Special Squares</h3>
                <ul>
                    <li><strong>House of Beauty (15):</strong> Safe square, mandatory stop.</li>
                    <li><strong>House of Water (27):</strong> Piece returns to House of Rebirth or start.</li>
                    <li><strong>House of Three Truths (28):</strong> Must roll exactly 3 to leave.</li>
                    <li><strong>House of Re-Atoum (29):</strong> Must roll exactly 2 to leave.</li>
                </ul>
            `,
            history: `
                <p>Senet is one of the oldest known board games, with artifacts dating back to around 3100 BCE in Egypt. The name "Senet" means "game of passing."</p>
                
                <p>The game was immensely popular in ancient Egypt and was played by all social classes. Complete Senet boards were found in Tutankhamun's tomb, and paintings show Queen Nefertari playing the game.</p>
                
                <p>Over time, Senet evolved from a secular game into one with deep religious significance, representing the soul's journey through the underworld to reach the afterlife.</p>
            `
        },
        hnefatafl: {
            name: "Hnefatafl",
            era: "Scandinavia • 400 CE",
            players: 2,
            duration: "30-60 min",
            pieces: 25,
            boardSize: { width: 550, height: 550 },
            description: "The Viking war game of asymmetric strategy. The King must escape while attackers try to capture him.",
            rules: `
                <h3>Objective</h3>
                <ul>
                    <li><strong>Defenders (White):</strong> Help the King escape to any corner square.</li>
                    <li><strong>Attackers (Black):</strong> Capture the King by surrounding him on all 4 sides.</li>
                </ul>
                
                <h3>Movement</h3>
                <ul>
                    <li>All pieces move like a rook in chess - any number of squares horizontally or vertically.</li>
                    <li>Pieces cannot jump over other pieces.</li>
                    <li>Only the King may land on the throne (center) or corner squares.</li>
                </ul>
                
                <h3>Capture</h3>
                <ul>
                    <li>Capture enemy pieces by sandwiching them between two of your pieces.</li>
                    <li>The King is captured when surrounded on all 4 sides (or 3 sides and the throne).</li>
                    <li>The throne and corners act as enemies for capture purposes.</li>
                </ul>
            `,
            history: `
                <p>Hnefatafl (pronounced "nef-ah-tah-fel") was the chess of the Vikings, played throughout Scandinavia and wherever Norse culture spread, from Ireland to Ukraine.</p>
                
                <p>The game dates to around 400 CE and remained popular until chess arrived from the Arab world around 1000 CE. The name means "fist table" in Old Norse.</p>
                
                <p>Archaeological evidence includes gaming pieces found in ship burials and Viking settlements across Europe. The game represents a siege, with the King trying to escape the attacking forces.</p>
            `
        },
        morris: {
            name: "Nine Men's Morris",
            era: "Roman Empire • 500 BCE",
            players: 2,
            duration: "10-20 min",
            pieces: 9,
            boardSize: { width: 500, height: 500 },
            description: "Form mills to capture your opponent's pieces in this strategic game found carved into ancient Roman buildings.",
            rules: `
                <h3>Objective</h3>
                <p>Reduce your opponent to 2 pieces, or block them so they cannot move.</p>
                
                <h3>Phase 1: Placing</h3>
                <ul>
                    <li>Players alternate placing pieces on empty points.</li>
                    <li>Each player has 9 pieces to place.</li>
                </ul>
                
                <h3>Phase 2: Moving</h3>
                <ul>
                    <li>Players alternate moving one piece to an adjacent empty point.</li>
                    <li>Pieces move along the lines of the board.</li>
                </ul>
                
                <h3>Mills</h3>
                <ul>
                    <li>Form a "mill" (3 pieces in a row along a line) to remove one opponent's piece.</li>
                    <li>Pieces in a mill cannot be removed unless no other pieces are available.</li>
                </ul>
                
                <h3>Phase 3: Flying</h3>
                <ul>
                    <li>When reduced to 3 pieces, a player may "fly" - move to ANY empty point.</li>
                </ul>
            `,
            history: `
                <p>Nine Men's Morris is one of the oldest games still played today. Boards have been found carved into the roofing tiles of an Egyptian temple from around 1400 BCE.</p>
                
                <p>The game was wildly popular in the Roman Empire, with boards carved into the steps of public buildings throughout Rome. It spread across medieval Europe and was mentioned in Shakespeare's "A Midsummer Night's Dream."</p>
                
                <p>Also known as Mills, Merels, or Cowboy Checkers in America, the game has been played continuously for over 3,000 years.</p>
            `
        },
        mancala: {
            name: "Mancala",
            era: "Africa • 700 CE",
            players: 2,
            duration: "10-20 min",
            pieces: 48,
            boardSize: { width: 700, height: 280 },
            description: "Sow and capture seeds in this ancient counting and strategy game with over 800 regional variations.",
            rules: `
                <h3>Objective</h3>
                <p>Capture more seeds than your opponent. The game ends when one side is empty.</p>
                
                <h3>Setup</h3>
                <p>The board has 12 small pits (6 per player) and 2 large stores. Each small pit starts with 4 seeds.</p>
                
                <h3>Movement (Sowing)</h3>
                <ul>
                    <li>Pick up all seeds from one of your pits.</li>
                    <li>Drop one seed in each pit counter-clockwise, including your store.</li>
                    <li>Skip your opponent's store.</li>
                </ul>
                
                <h3>Special Rules</h3>
                <ul>
                    <li><strong>Extra Turn:</strong> If your last seed lands in your store, go again.</li>
                    <li><strong>Capture:</strong> If your last seed lands in an empty pit on your side, capture that seed plus all seeds in the opposite pit.</li>
                </ul>
                
                <h3>Ending</h3>
                <p>When one side is empty, the other player captures all remaining seeds on their side.</p>
            `,
            history: `
                <p>Mancala refers to a family of over 800 related games originating in Africa. The oldest known mancala boards, found in Ethiopia and Eritrea, date to around 700 CE.</p>
                
                <p>The game spread along trade routes throughout Africa, the Middle East, and Asia. Each culture developed its own variant with unique rules and names: Oware in West Africa, Bao in East Africa, Kalah in America.</p>
                
                <p>Mancala games are sometimes called "sowing games" because the motion of distributing seeds mimics the planting of crops. They're among the most-played games in Africa today.</p>
            `
        }
    },
    
    // Pricing Configuration
    pricing: {
        membership: {
            monthly: 499,  // $4.99 in cents
            annual: 3999   // $39.99 in cents
        },
        coins: {
            100: 99,       // $0.99 for 100 coins
            500: 399,      // $3.99 for 500 coins
            1000: 699,     // $6.99 for 1000 coins
            2500: 1499,    // $14.99 for 2500 coins
            5000: 2499     // $24.99 for 5000 coins
        },
        bonusCoins: {
            100: 0,
            500: 50,
            1000: 200,
            2500: 750,
            5000: 2000
        }
    },
    
    // Shop Items
    shopItems: {
        boards: [
            { id: 'board-golden', name: 'Golden Tablets', price: 500, preview: '🏛️' },
            { id: 'board-lapis', name: 'Lapis Lazuli', price: 750, preview: '💎' },
            { id: 'board-obsidian', name: 'Obsidian Night', price: 500, preview: '🖤' },
            { id: 'board-pharaoh', name: "Pharaoh's Board", price: 600, preview: '👑' },
            { id: 'board-papyrus', name: 'Ancient Papyrus', price: 400, preview: '📜' },
            { id: 'board-viking', name: 'Viking Longship', price: 650, preview: '⛵' },
            { id: 'board-runic', name: 'Runic Stone', price: 550, preview: '🪨' },
            { id: 'board-roman', name: 'Roman Marble', price: 500, preview: '🏛️' }
        ],
        pieces: [
            { id: 'piece-jade', name: 'Jade Set', price: 300, preview: '🟢' },
            { id: 'piece-amber', name: 'Amber Set', price: 350, preview: '🟠' },
            { id: 'piece-ivory', name: 'Ivory & Ebony', price: 400, preview: '⚪' },
            { id: 'piece-crystal', name: 'Crystal Set', price: 500, preview: '💠' },
            { id: 'piece-bronze', name: 'Bronze Warriors', price: 450, preview: '🥉' }
        ],
        avatars: [
            { id: 'avatar-pharaoh', name: 'Pharaoh', price: 200, preview: '👑' },
            { id: 'avatar-viking', name: 'Viking Warrior', price: 200, preview: '⚔️' },
            { id: 'avatar-scholar', name: 'Ancient Scholar', price: 150, preview: '📚' },
            { id: 'avatar-merchant', name: 'Silk Road Merchant', price: 150, preview: '🐪' },
            { id: 'avatar-oracle', name: 'Oracle', price: 250, preview: '🔮' },
            { id: 'avatar-general', name: 'Roman General', price: 200, preview: '🦅' }
        ]
    }
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(CONFIG.firebase);
}

// Make CONFIG available globally
window.CONFIG = CONFIG;
