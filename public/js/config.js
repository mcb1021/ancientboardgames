// ============================================
// ANCIENT BOARD GAMES - CONFIGURATION
// ============================================

const CONFIG = {
    // Firebase Configuration (Replace with your own)
    firebase: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "your-project.firebaseapp.com",
        databaseURL: "https://your-project-default-rtdb.firebaseio.com",
        projectId: "your-project",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    
    // Stripe Configuration
    stripe: {
        publicKey: "pk_test_YOUR_STRIPE_PUBLIC_KEY"
    },
    
    // Socket.io Server URL (for multiplayer)
    // Railway auto-detects - just uses same domain
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
                
                <h3>Capturing</h3>
                <p>Land on an opponent's piece to send it back to start. You cannot capture on rosette squares - they are safe zones.</p>
                
                <h3>Rosette Squares</h3>
                <p>Landing on a rosette grants an extra turn. Pieces on rosettes cannot be captured.</p>
                
                <h3>Bearing Off</h3>
                <p>To remove a piece from the board, you must roll the exact number needed to move off the end of the path.</p>
            `,
            history: `
                <h3>Discovery</h3>
                <p>The Royal Game of Ur was discovered by Sir Leonard Woolley between 1922-1934 during excavations of the Royal Cemetery at Ur in modern-day Iraq. Five game boards were found in the tombs, dating to approximately 2600 BCE.</p>
                
                <h3>The Game Board</h3>
                <p>The most famous board, now in the British Museum, is elaborately decorated with shell plaques inlaid with red limestone and lapis lazuli. The distinctive rosette patterns marked special squares on the board.</p>
                
                <h3>Deciphering the Rules</h3>
                <p>For decades after its discovery, no one knew how to play the game. In the 1980s, Irving Finkel, a curator at the British Museum, translated a Babylonian clay tablet from 177 BCE that described the rules. This tablet was written by a scribe named Itti-Marduk-balāṭu.</p>
                
                <h3>Cultural Significance</h3>
                <p>The game wasn't just entertainment - it had divinatory significance. Landing on certain squares could predict your future: "You will find a friend" or "You will become powerful like a lion."</p>
                
                <h3>Spread and Influence</h3>
                <p>The game spread throughout the ancient world - boards have been found in Egypt, Iran, Syria, Lebanon, Sri Lanka, Cyprus, and Crete. It's considered an ancestor of modern backgammon.</p>
            `
        },
        senet: {
            name: "Senet",
            era: "Egypt • 3100 BCE",
            players: 2,
            duration: "20-40 min",
            pieces: 5,
            boardSize: { width: 700, height: 300 },
            description: "The game of passing to the afterlife, found in Tutankhamun's tomb and played by pharaohs.",
            rules: `
                <h3>Objective</h3>
                <p>Be the first to bear all 5 of your pieces off the board.</p>
                
                <h3>The Board</h3>
                <p>Senet is played on a 30-square board arranged in 3 rows of 10. Pieces move in a snake-like (boustrophedon) pattern.</p>
                
                <h3>Movement</h3>
                <ul>
                    <li>Throw 4 casting sticks (or dice equivalent: 1-5).</li>
                    <li>Move one piece forward by the result.</li>
                    <li>Rolling 1, 4, or 5 grants an extra turn.</li>
                </ul>
                
                <h3>Special Squares</h3>
                <ul>
                    <li><strong>House of Rebirth (15):</strong> Safe square, pieces restart here if sent back.</li>
                    <li><strong>House of Beauty (26):</strong> Must land here before bearing off. Safe.</li>
                    <li><strong>House of Water (27):</strong> Land here and return to House of Rebirth.</li>
                    <li><strong>House of Three Truths (28):</strong> Requires roll of 3 to leave.</li>
                    <li><strong>House of Re-Atoum (29):</strong> Requires roll of 2 to leave.</li>
                </ul>
                
                <h3>Capturing</h3>
                <p>Land on an opponent to swap positions. Cannot swap if opponent has adjacent pieces forming a block.</p>
            `,
            history: `
                <h3>Ancient Origins</h3>
                <p>Senet is one of the oldest known board games, with evidence dating back to 3100 BCE in ancient Egypt. The name means "passing" - referring to the journey through the afterlife.</p>
                
                <h3>Tutankhamun's Games</h3>
                <p>Four complete Senet game sets were found in Tutankhamun's tomb, including one of ebony and ivory. Pharaohs were buried with the game to help navigate the underworld.</p>
                
                <h3>Religious Evolution</h3>
                <p>Over time, Senet transformed from a simple race game to a religious ritual representing the soul's journey through the Duat (underworld) to join Ra, the sun god.</p>
                
                <h3>In Egyptian Art</h3>
                <p>Paintings in tombs show people playing Senet, including Queen Nefertari depicted playing in her tomb in the Valley of the Queens. The game was beloved by all social classes.</p>
            `
        },
        hnefatafl: {
            name: "Hnefatafl",
            era: "Scandinavia • 400 CE",
            players: 2,
            duration: "30-60 min",
            pieces: { attackers: 24, defenders: 12, king: 1 },
            boardSize: { width: 600, height: 600 },
            description: "The Viking war game of asymmetric warfare - can the King escape or will the attackers prevail?",
            rules: `
                <h3>Objective</h3>
                <ul>
                    <li><strong>Defenders (White):</strong> Help the King escape to any corner square.</li>
                    <li><strong>Attackers (Black):</strong> Capture the King by surrounding him on all 4 sides.</li>
                </ul>
                
                <h3>Setup</h3>
                <p>The King starts in the center (throne). 12 defenders surround him in a cross pattern. 24 attackers start on the edges of the 11×11 board.</p>
                
                <h3>Movement</h3>
                <ul>
                    <li>All pieces move like chess rooks - any number of squares orthogonally.</li>
                    <li>Only the King may land on the throne or corners.</li>
                    <li>No jumping over pieces.</li>
                </ul>
                
                <h3>Capture</h3>
                <p>Capture an enemy piece by sandwiching it between two of your pieces (custodian capture). The throne and corners can act as the second capturing piece.</p>
                
                <h3>Capturing the King</h3>
                <p>The King must be surrounded on all 4 sides by attackers (or 3 sides plus the throne/edge). The King is strong - he participates in captures.</p>
            `,
            history: `
                <h3>Viking Game of Kings</h3>
                <p>Hnefatafl (pronounced "nef-ah-tah-fel") means "fist table" in Old Norse. It was the game of Vikings, played throughout Scandinavia, Britain, and wherever Norse influence spread.</p>
                
                <h3>Before Chess</h3>
                <p>This was THE strategy game of Northern Europe before chess arrived around 1000 CE. It remained popular in Scandinavia until the 18th century and in Lapland until the early 20th century.</p>
                
                <h3>Asymmetric Warfare</h3>
                <p>Unlike most ancient games, Hnefatafl features asymmetric gameplay - one side attacks, one defends. This mirrors Viking raid scenarios and creates unique strategic depth.</p>
                
                <h3>Archaeological Evidence</h3>
                <p>Game pieces and boards have been found across the Viking world, from boat burials in Norway to settlements in Iceland and the British Isles. The Lewis Chessmen set includes Hnefatafl pieces.</p>
            `
        },
        morris: {
            name: "Nine Men's Morris",
            era: "Roman Empire • 500 BCE",
            players: 2,
            duration: "10-20 min",
            pieces: 9,
            boardSize: { width: 500, height: 500 },
            description: "Form 'mills' of three pieces to capture your opponent's pieces in this ancient strategy game.",
            rules: `
                <h3>Objective</h3>
                <p>Reduce your opponent to 2 pieces, or block them so they cannot move.</p>
                
                <h3>Phase 1: Placing</h3>
                <p>Players alternate placing their 9 pieces on empty intersections. If you form a "mill" (3 pieces in a row along a line), remove one opponent's piece.</p>
                
                <h3>Phase 2: Moving</h3>
                <p>Once all pieces are placed, move one piece per turn to an adjacent empty point. Continue forming mills to capture.</p>
                
                <h3>Phase 3: Flying</h3>
                <p>When reduced to 3 pieces, that player may "fly" - move to ANY empty intersection, not just adjacent ones.</p>
                
                <h3>Mill Rules</h3>
                <ul>
                    <li>Form a mill to remove one opponent piece.</li>
                    <li>Cannot remove pieces from an opponent's mill unless no other pieces available.</li>
                    <li>Can "break" and reform the same mill for repeated captures.</li>
                </ul>
            `,
            history: `
                <h3>Worldwide Appeal</h3>
                <p>Nine Men's Morris is found across virtually every ancient civilization - from Egypt to Rome to China. It may be the most widely played board game in human history.</p>
                
                <h3>Roman Connection</h3>
                <p>The Romans called it "Merrels" and carved boards into the stones of their buildings. You can still see game boards carved into the steps of ancient Roman structures.</p>
                
                <h3>Medieval Popularity</h3>
                <p>The game was immensely popular in medieval Europe. Shakespeare mentions it in "A Midsummer Night's Dream." Boards were carved into church pews and monastery cloisters.</p>
                
                <h3>Modern Analysis</h3>
                <p>Computer analysis has shown that with perfect play, the game is a draw. However, the game tree complexity means humans can still enjoy competitive play.</p>
            `
        },
        mancala: {
            name: "Mancala",
            era: "Africa • 700 CE",
            players: 2,
            duration: "10-20 min",
            pieces: 48,
            boardSize: { width: 700, height: 300 },
            description: "Sow and capture seeds in this ancient African counting and strategy game.",
            rules: `
                <h3>Objective</h3>
                <p>Capture more seeds than your opponent. The game ends when one side is empty.</p>
                
                <h3>Setup</h3>
                <p>Place 4 seeds in each of the 12 small pits. Each player owns the 6 pits on their side and the large store (mancala) on their right.</p>
                
                <h3>Gameplay</h3>
                <ul>
                    <li>Pick up all seeds from one of YOUR pits.</li>
                    <li>"Sow" by dropping one seed in each pit counter-clockwise, including your store.</li>
                    <li>Skip your opponent's store when sowing.</li>
                </ul>
                
                <h3>Special Rules</h3>
                <ul>
                    <li><strong>Extra Turn:</strong> If your last seed lands in your store, go again.</li>
                    <li><strong>Capture:</strong> If your last seed lands in an empty pit on YOUR side, capture that seed plus all seeds in the opposite pit.</li>
                </ul>
                
                <h3>Game End</h3>
                <p>When one side is empty, the other player captures all remaining seeds on their side. Most seeds wins!</p>
            `,
            history: `
                <h3>African Origins</h3>
                <p>Mancala games originated in Africa, with evidence dating back at least 1,300 years. The word "mancala" comes from the Arabic "naqala" meaning "to move."</p>
                
                <h3>Countless Variations</h3>
                <p>There are over 800 named variations of mancala games across Africa, the Middle East, and Asia. Oware, Bao, Kalah, and Congkak are just a few popular versions.</p>
                
                <h3>Mathematical Depth</h3>
                <p>Despite simple rules, mancala games have remarkable mathematical depth. They've been studied extensively by computer scientists and mathematicians.</p>
                
                <h3>Cultural Significance</h3>
                <p>In many African cultures, mancala was more than a game - it was used for education, divination, and as a social gathering activity. Boards were often carved into stone or wood with artistic embellishments.</p>
            `
        }
    },
    
    // Pricing (in cents for Stripe)
    pricing: {
        membership: {
            monthly: 499,
            annual: 3999
        },
        coins: {
            100: 99,
            500: 399,
            1000: 699,
            2500: 1499,
            5000: 2499
        },
        bonusCoins: {
            100: 0,
            500: 50,
            1000: 200,
            2500: 750,
            5000: 2000
        }
    },
    
    // Shop items
    shopItems: {
        boards: [
            { id: 'board_gold_ur', game: 'ur', name: 'Golden Tablets', price: 500, preview: '🏆' },
            { id: 'board_lapis_ur', game: 'ur', name: 'Lapis Lazuli', price: 750, preview: '💎' },
            { id: 'board_obsidian_ur', game: 'ur', name: 'Obsidian Night', price: 500, preview: '🖤' },
            { id: 'board_pharaoh_senet', game: 'senet', name: 'Pharaoh\'s Board', price: 600, preview: '👑' },
            { id: 'board_papyrus_senet', game: 'senet', name: 'Ancient Papyrus', price: 400, preview: '📜' },
            { id: 'board_viking_hnef', game: 'hnefatafl', name: 'Viking Longship', price: 650, preview: '⛵' },
            { id: 'board_rune_hnef', game: 'hnefatafl', name: 'Runic Stone', price: 550, preview: '🪨' },
            { id: 'board_marble_morris', game: 'morris', name: 'Roman Marble', price: 500, preview: '🏛️' },
            { id: 'board_wood_mancala', game: 'mancala', name: 'Carved Mahogany', price: 450, preview: '🪵' }
        ],
        pieces: [
            { id: 'piece_jade', name: 'Jade Set', price: 300, preview: '🟢' },
            { id: 'piece_amber', name: 'Amber Set', price: 350, preview: '🟠' },
            { id: 'piece_ivory', name: 'Ivory & Ebony', price: 400, preview: '⚪' },
            { id: 'piece_crystal', name: 'Crystal Set', price: 500, preview: '💠' },
            { id: 'piece_bronze', name: 'Bronze Warriors', price: 450, preview: '🥉' }
        ],
        avatars: [
            { id: 'avatar_pharaoh', name: 'Pharaoh', price: 200, preview: '👑' },
            { id: 'avatar_viking', name: 'Viking Warrior', price: 200, preview: '⚔️' },
            { id: 'avatar_scholar', name: 'Ancient Scholar', price: 150, preview: '📚' },
            { id: 'avatar_merchant', name: 'Silk Road Merchant', price: 150, preview: '🐫' },
            { id: 'avatar_oracle', name: 'Oracle', price: 250, preview: '🔮' },
            { id: 'avatar_general', name: 'Roman General', price: 200, preview: '🦅' }
        ]
    },
    
    // Rating system (ELO-like)
    rating: {
        initial: 1200,
        kFactor: 32,
        minRating: 100
    },
    
    // Penalties
    penalties: {
        leaveGame: -15,
        disconnect: -5,
        timeout: -10
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.firebase);
Object.freeze(CONFIG.games);
Object.freeze(CONFIG.pricing);
