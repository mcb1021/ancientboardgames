// ============================================
// SHOP ITEM ASSETS - SVG GRAPHICS
// ============================================

const ShopAssets = {
    // Board Skins - Each returns an SVG string
    boards: {
        'board_gold_ur': {
            name: 'Golden Tablets',
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#FFD700"/>
                        <stop offset="50%" style="stop-color:#D4AF37"/>
                        <stop offset="100%" style="stop-color:#B8860B"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="4" fill="url(#gold1)" stroke="#8B6914" stroke-width="2"/>
                <rect x="8" y="8" width="18" height="14" rx="2" fill="#8B6914" opacity="0.3"/>
                <rect x="31" y="8" width="18" height="14" rx="2" fill="#8B6914" opacity="0.3"/>
                <rect x="54" y="8" width="18" height="14" rx="2" fill="#8B6914" opacity="0.3"/>
                <rect x="8" y="28" width="18" height="14" rx="2" fill="#8B6914" opacity="0.3"/>
                <rect x="31" y="28" width="18" height="14" rx="2" fill="#8B6914" opacity="0.3"/>
                <rect x="54" y="28" width="18" height="14" rx="2" fill="#8B6914" opacity="0.3"/>
                <circle cx="17" cy="15" r="3" fill="#FFE55C"/>
                <circle cx="63" cy="35" r="3" fill="#FFE55C"/>
            </svg>`,
            colors: { primary: '#D4AF37', secondary: '#8B6914', accent: '#FFE55C' }
        },
        'board_lapis_ur': {
            name: 'Lapis Lazuli',
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="lapis1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#1E3A8A"/>
                        <stop offset="50%" style="stop-color:#2563EB"/>
                        <stop offset="100%" style="stop-color:#1E40AF"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="4" fill="url(#lapis1)" stroke="#1E3A8A" stroke-width="2"/>
                <rect x="8" y="8" width="18" height="14" rx="2" fill="#1E3A8A" opacity="0.5"/>
                <rect x="31" y="8" width="18" height="14" rx="2" fill="#1E3A8A" opacity="0.5"/>
                <rect x="54" y="8" width="18" height="14" rx="2" fill="#1E3A8A" opacity="0.5"/>
                <rect x="8" y="28" width="18" height="14" rx="2" fill="#1E3A8A" opacity="0.5"/>
                <rect x="31" y="28" width="18" height="14" rx="2" fill="#1E3A8A" opacity="0.5"/>
                <rect x="54" y="28" width="18" height="14" rx="2" fill="#1E3A8A" opacity="0.5"/>
                <circle cx="12" cy="12" r="1.5" fill="#FFD700"/>
                <circle cx="45" cy="20" r="1" fill="#FFD700"/>
                <circle cx="68" cy="38" r="1.5" fill="#FFD700"/>
            </svg>`,
            colors: { primary: '#2563EB', secondary: '#1E3A8A', accent: '#FFD700' }
        },
        'board_obsidian_ur': {
            name: 'Obsidian Night',
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="obsidian1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#1a1a1a"/>
                        <stop offset="50%" style="stop-color:#2d2d2d"/>
                        <stop offset="100%" style="stop-color:#0d0d0d"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="4" fill="url(#obsidian1)" stroke="#444" stroke-width="2"/>
                <rect x="8" y="8" width="18" height="14" rx="2" fill="#000" opacity="0.5"/>
                <rect x="31" y="8" width="18" height="14" rx="2" fill="#000" opacity="0.5"/>
                <rect x="54" y="8" width="18" height="14" rx="2" fill="#000" opacity="0.5"/>
                <rect x="8" y="28" width="18" height="14" rx="2" fill="#000" opacity="0.5"/>
                <rect x="31" y="28" width="18" height="14" rx="2" fill="#000" opacity="0.5"/>
                <rect x="54" y="28" width="18" height="14" rx="2" fill="#000" opacity="0.5"/>
                <line x1="5" y1="5" x2="20" y2="10" stroke="#555" stroke-width="0.5" opacity="0.5"/>
                <line x1="60" y1="40" x2="75" y2="45" stroke="#555" stroke-width="0.5" opacity="0.5"/>
            </svg>`,
            colors: { primary: '#1a1a1a', secondary: '#0d0d0d', accent: '#555' }
        },
        'board_pharaoh_senet': {
            name: "Pharaoh's Board",
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="pharaoh1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#D4AF37"/>
                        <stop offset="100%" style="stop-color:#8B6914"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="2" fill="#2C1810" stroke="url(#pharaoh1)" stroke-width="3"/>
                <rect x="6" y="6" width="68" height="38" fill="#3D2317"/>
                <!-- Hieroglyphic-style patterns -->
                <path d="M15 15 L20 10 L25 15 L20 20 Z" fill="#D4AF37" opacity="0.6"/>
                <path d="M55 15 L60 10 L65 15 L60 20 Z" fill="#D4AF37" opacity="0.6"/>
                <circle cx="40" cy="25" r="8" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.6"/>
                <path d="M36 25 L40 20 L44 25 L40 30 Z" fill="#D4AF37" opacity="0.8"/>
            </svg>`,
            colors: { primary: '#3D2317', secondary: '#2C1810', accent: '#D4AF37' }
        },
        'board_papyrus_senet': {
            name: 'Ancient Papyrus',
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="papyrus1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#E8D5A3"/>
                        <stop offset="100%" style="stop-color:#C9A86C"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="1" fill="url(#papyrus1)" stroke="#8B7355" stroke-width="2"/>
                <!-- Papyrus texture lines -->
                <line x1="5" y1="8" x2="75" y2="8" stroke="#B8956C" stroke-width="0.5" opacity="0.4"/>
                <line x1="5" y1="16" x2="75" y2="16" stroke="#B8956C" stroke-width="0.5" opacity="0.4"/>
                <line x1="5" y1="24" x2="75" y2="24" stroke="#B8956C" stroke-width="0.5" opacity="0.4"/>
                <line x1="5" y1="32" x2="75" y2="32" stroke="#B8956C" stroke-width="0.5" opacity="0.4"/>
                <line x1="5" y1="40" x2="75" y2="40" stroke="#B8956C" stroke-width="0.5" opacity="0.4"/>
                <!-- Grid overlay -->
                <rect x="8" y="10" width="8" height="12" fill="none" stroke="#6B5344" stroke-width="1"/>
                <rect x="20" y="10" width="8" height="12" fill="none" stroke="#6B5344" stroke-width="1"/>
                <rect x="32" y="10" width="8" height="12" fill="none" stroke="#6B5344" stroke-width="1"/>
            </svg>`,
            colors: { primary: '#E8D5A3', secondary: '#C9A86C', accent: '#6B5344' }
        },
        'board_viking_hnef': {
            name: 'Viking Longship',
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="viking1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#5D4E37"/>
                        <stop offset="100%" style="stop-color:#3D2E1F"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="2" fill="url(#viking1)" stroke="#2A1F14" stroke-width="2"/>
                <!-- Wood grain -->
                <line x1="5" y1="10" x2="75" y2="10" stroke="#4A3B28" stroke-width="1"/>
                <line x1="5" y1="25" x2="75" y2="25" stroke="#4A3B28" stroke-width="1"/>
                <line x1="5" y1="40" x2="75" y2="40" stroke="#4A3B28" stroke-width="1"/>
                <!-- Viking knot pattern -->
                <circle cx="20" cy="25" r="6" fill="none" stroke="#8B7355" stroke-width="1.5"/>
                <circle cx="40" cy="25" r="6" fill="none" stroke="#8B7355" stroke-width="1.5"/>
                <circle cx="60" cy="25" r="6" fill="none" stroke="#8B7355" stroke-width="1.5"/>
                <path d="M14 25 Q20 19, 26 25 Q20 31, 14 25" fill="none" stroke="#C9A86C" stroke-width="1"/>
            </svg>`,
            colors: { primary: '#5D4E37', secondary: '#3D2E1F', accent: '#C9A86C' }
        },
        'board_rune_hnef': {
            name: 'Runic Stone',
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="rune1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#708090"/>
                        <stop offset="100%" style="stop-color:#4A5568"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="3" fill="url(#rune1)" stroke="#2D3748" stroke-width="2"/>
                <!-- Rune symbols -->
                <text x="15" y="30" font-size="16" fill="#E2E8F0" font-family="serif">ᚠ</text>
                <text x="32" y="30" font-size="16" fill="#E2E8F0" font-family="serif">ᚢ</text>
                <text x="49" y="30" font-size="16" fill="#E2E8F0" font-family="serif">ᚦ</text>
                <text x="66" y="30" font-size="16" fill="#E2E8F0" font-family="serif">ᚨ</text>
                <!-- Stone texture -->
                <circle cx="10" cy="10" r="2" fill="#5A6A7A" opacity="0.5"/>
                <circle cx="70" cy="40" r="3" fill="#5A6A7A" opacity="0.5"/>
            </svg>`,
            colors: { primary: '#708090', secondary: '#4A5568', accent: '#E2E8F0' }
        },
        'board_marble_morris': {
            name: 'Roman Marble',
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="marble1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#F5F5F5"/>
                        <stop offset="50%" style="stop-color:#E0E0E0"/>
                        <stop offset="100%" style="stop-color:#BDBDBD"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="2" fill="url(#marble1)" stroke="#9E9E9E" stroke-width="2"/>
                <!-- Marble veins -->
                <path d="M10 10 Q30 20 50 15 Q70 10 75 25" fill="none" stroke="#BDBDBD" stroke-width="1" opacity="0.6"/>
                <path d="M5 35 Q25 40 45 30 Q65 25 75 40" fill="none" stroke="#9E9E9E" stroke-width="0.5" opacity="0.5"/>
                <!-- Grid pattern -->
                <rect x="15" y="10" width="50" height="30" fill="none" stroke="#757575" stroke-width="1.5"/>
                <rect x="25" y="17" width="30" height="16" fill="none" stroke="#757575" stroke-width="1"/>
            </svg>`,
            colors: { primary: '#F5F5F5', secondary: '#E0E0E0', accent: '#757575' }
        },
        'board_wood_mancala': {
            name: 'Carved Mahogany',
            svg: `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="mahogany1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#8B4513"/>
                        <stop offset="100%" style="stop-color:#5D2E0C"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="76" height="46" rx="4" fill="url(#mahogany1)" stroke="#3D1F08" stroke-width="2"/>
                <!-- Carved pits -->
                <ellipse cx="15" cy="18" rx="6" ry="5" fill="#3D1F08"/>
                <ellipse cx="30" cy="18" rx="6" ry="5" fill="#3D1F08"/>
                <ellipse cx="45" cy="18" rx="6" ry="5" fill="#3D1F08"/>
                <ellipse cx="60" cy="18" rx="6" ry="5" fill="#3D1F08"/>
                <ellipse cx="15" cy="35" rx="6" ry="5" fill="#3D1F08"/>
                <ellipse cx="30" cy="35" rx="6" ry="5" fill="#3D1F08"/>
                <ellipse cx="45" cy="35" rx="6" ry="5" fill="#3D1F08"/>
                <ellipse cx="60" cy="35" rx="6" ry="5" fill="#3D1F08"/>
            </svg>`,
            colors: { primary: '#8B4513', secondary: '#5D2E0C', accent: '#3D1F08' }
        }
    },

    // Game Pieces
    pieces: {
        'piece_jade': {
            name: 'Jade Set',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="jade1" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#5EE07E"/>
                        <stop offset="100%" style="stop-color:#1D6F3C"/>
                    </radialGradient>
                </defs>
                <circle cx="25" cy="25" r="20" fill="url(#jade1)" stroke="#0F4D25" stroke-width="2"/>
                <ellipse cx="18" cy="18" rx="6" ry="4" fill="#8EF0A8" opacity="0.5"/>
            </svg>`,
            colors: { primary: '#2ECC71', secondary: '#1D6F3C', highlight: '#8EF0A8' }
        },
        'piece_amber': {
            name: 'Amber Set',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="amber1" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#FFB347"/>
                        <stop offset="100%" style="stop-color:#CC5500"/>
                    </radialGradient>
                </defs>
                <circle cx="25" cy="25" r="20" fill="url(#amber1)" stroke="#8B3A00" stroke-width="2"/>
                <ellipse cx="18" cy="18" rx="6" ry="4" fill="#FFD699" opacity="0.6"/>
                <circle cx="30" cy="28" r="2" fill="#8B3A00" opacity="0.3"/>
            </svg>`,
            colors: { primary: '#E67E22', secondary: '#CC5500', highlight: '#FFD699' }
        },
        'piece_ivory': {
            name: 'Ivory & Ebony',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="ivory1" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#FFFFF0"/>
                        <stop offset="100%" style="stop-color:#D4D4AA"/>
                    </radialGradient>
                </defs>
                <circle cx="25" cy="25" r="20" fill="url(#ivory1)" stroke="#8B8B6B" stroke-width="2"/>
                <ellipse cx="18" cy="18" rx="6" ry="4" fill="#FFFFFF" opacity="0.7"/>
                <path d="M20 30 Q25 35 30 30" fill="none" stroke="#5C5C3D" stroke-width="1"/>
            </svg>`,
            colors: { primary: '#FFFFF0', secondary: '#D4D4AA', highlight: '#FFFFFF' }
        },
        'piece_crystal': {
            name: 'Crystal Set',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="crystal1" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#87CEEB"/>
                        <stop offset="100%" style="stop-color:#1E90FF"/>
                    </radialGradient>
                </defs>
                <circle cx="25" cy="25" r="20" fill="url(#crystal1)" stroke="#0066CC" stroke-width="2"/>
                <ellipse cx="18" cy="18" rx="6" ry="4" fill="#FFFFFF" opacity="0.6"/>
                <path d="M15 25 L25 15 L35 25 L25 35 Z" fill="#FFFFFF" opacity="0.2"/>
            </svg>`,
            colors: { primary: '#3498DB', secondary: '#1E90FF', highlight: '#87CEEB' }
        },
        'piece_bronze': {
            name: 'Bronze Warriors',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="bronze1" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#CD9B5A"/>
                        <stop offset="100%" style="stop-color:#8B5A2B"/>
                    </radialGradient>
                </defs>
                <circle cx="25" cy="25" r="20" fill="url(#bronze1)" stroke="#5D3A1A" stroke-width="2"/>
                <ellipse cx="18" cy="18" rx="5" ry="3" fill="#DEB887" opacity="0.5"/>
                <circle cx="25" cy="25" r="8" fill="none" stroke="#5D3A1A" stroke-width="1" opacity="0.5"/>
            </svg>`,
            colors: { primary: '#CD7F32', secondary: '#8B5A2B', highlight: '#DEB887' }
        }
    },

    // Avatars
    avatars: {
        'avatar_pharaoh': {
            name: 'Pharaoh',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" fill="#1E3A5F" stroke="#D4AF37" stroke-width="2"/>
                <!-- Nemes headdress -->
                <path d="M10 20 L25 8 L40 20 L40 35 L35 40 L15 40 L10 35 Z" fill="#D4AF37"/>
                <path d="M15 20 L25 12 L35 20 L35 32 L25 38 L15 32 Z" fill="#FFD700"/>
                <!-- Face -->
                <ellipse cx="25" cy="28" rx="8" ry="10" fill="#D4A574"/>
                <!-- Eyes -->
                <ellipse cx="22" cy="26" rx="2" ry="1" fill="#1a1a1a"/>
                <ellipse cx="28" cy="26" rx="2" ry="1" fill="#1a1a1a"/>
                <!-- Uraeus (cobra) -->
                <circle cx="25" cy="15" r="2" fill="#D4AF37"/>
            </svg>`,
            colors: { primary: '#D4AF37', secondary: '#1E3A5F' }
        },
        'avatar_viking': {
            name: 'Viking Warrior',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" fill="#2F4858" stroke="#8B7355" stroke-width="2"/>
                <!-- Helmet -->
                <ellipse cx="25" cy="18" rx="12" ry="8" fill="#708090"/>
                <rect x="13" y="18" width="24" height="4" fill="#708090"/>
                <!-- Horns -->
                <path d="M10 18 Q5 10 8 5" fill="none" stroke="#D4D4AA" stroke-width="3" stroke-linecap="round"/>
                <path d="M40 18 Q45 10 42 5" fill="none" stroke="#D4D4AA" stroke-width="3" stroke-linecap="round"/>
                <!-- Face -->
                <ellipse cx="25" cy="30" rx="8" ry="9" fill="#D4A574"/>
                <!-- Beard -->
                <path d="M17 32 Q25 45 33 32" fill="#8B4513"/>
                <!-- Eyes -->
                <ellipse cx="22" cy="28" rx="2" ry="1.5" fill="#1a1a1a"/>
                <ellipse cx="28" cy="28" rx="2" ry="1.5" fill="#1a1a1a"/>
            </svg>`,
            colors: { primary: '#708090', secondary: '#2F4858' }
        },
        'avatar_scholar': {
            name: 'Ancient Scholar',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" fill="#4A3728" stroke="#D4AF37" stroke-width="2"/>
                <!-- Head covering -->
                <ellipse cx="25" cy="18" rx="12" ry="10" fill="#8B4513"/>
                <!-- Face -->
                <ellipse cx="25" cy="28" rx="9" ry="10" fill="#D4A574"/>
                <!-- Glasses -->
                <circle cx="21" cy="26" r="4" fill="none" stroke="#2C2C2C" stroke-width="1.5"/>
                <circle cx="29" cy="26" r="4" fill="none" stroke="#2C2C2C" stroke-width="1.5"/>
                <line x1="25" y1="26" x2="25" y2="26" stroke="#2C2C2C" stroke-width="1.5"/>
                <!-- Gray beard -->
                <path d="M16 32 Q25 42 34 32" fill="#9E9E9E"/>
                <!-- Eyes -->
                <circle cx="21" cy="26" r="1.5" fill="#1a1a1a"/>
                <circle cx="29" cy="26" r="1.5" fill="#1a1a1a"/>
            </svg>`,
            colors: { primary: '#8B4513', secondary: '#4A3728' }
        },
        'avatar_merchant': {
            name: 'Silk Road Merchant',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" fill="#8B6914" stroke="#D4AF37" stroke-width="2"/>
                <!-- Turban -->
                <ellipse cx="25" cy="15" rx="13" ry="9" fill="#DC143C"/>
                <ellipse cx="25" cy="14" rx="10" ry="6" fill="#FF6B6B"/>
                <!-- Jewel -->
                <circle cx="25" cy="12" r="3" fill="#50C878"/>
                <!-- Face -->
                <ellipse cx="25" cy="30" rx="9" ry="10" fill="#D4A574"/>
                <!-- Mustache -->
                <path d="M18 33 Q25 36 32 33" fill="#2C2C2C"/>
                <!-- Eyes -->
                <ellipse cx="22" cy="28" rx="2" ry="1.5" fill="#1a1a1a"/>
                <ellipse cx="28" cy="28" rx="2" ry="1.5" fill="#1a1a1a"/>
                <!-- Smile -->
                <path d="M22 35 Q25 37 28 35" fill="none" stroke="#8B4513" stroke-width="1"/>
            </svg>`,
            colors: { primary: '#DC143C', secondary: '#8B6914' }
        },
        'avatar_oracle': {
            name: 'Oracle',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" fill="#2E1A47" stroke="#9B59B6" stroke-width="2"/>
                <!-- Hood -->
                <path d="M8 35 Q8 10 25 8 Q42 10 42 35" fill="#4A235A"/>
                <!-- Face (mysterious, shadowed) -->
                <ellipse cx="25" cy="28" rx="8" ry="10" fill="#3D2352"/>
                <!-- Glowing eyes -->
                <ellipse cx="22" cy="26" rx="2" ry="2" fill="#9B59B6"/>
                <ellipse cx="28" cy="26" rx="2" ry="2" fill="#9B59B6"/>
                <ellipse cx="22" cy="26" rx="1" ry="1" fill="#E8DAEF"/>
                <ellipse cx="28" cy="26" rx="1" ry="1" fill="#E8DAEF"/>
                <!-- Third eye -->
                <ellipse cx="25" cy="18" rx="2" ry="2" fill="#9B59B6"/>
                <ellipse cx="25" cy="18" rx="1" ry="1" fill="#E8DAEF"/>
            </svg>`,
            colors: { primary: '#9B59B6', secondary: '#2E1A47' }
        },
        'avatar_general': {
            name: 'Roman General',
            svg: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" fill="#8B0000" stroke="#D4AF37" stroke-width="2"/>
                <!-- Helmet -->
                <ellipse cx="25" cy="16" rx="12" ry="8" fill="#B8860B"/>
                <!-- Crest -->
                <path d="M25 5 Q30 8 30 16 L25 14 L20 16 Q20 8 25 5" fill="#DC143C"/>
                <!-- Face -->
                <ellipse cx="25" cy="30" rx="9" ry="10" fill="#D4A574"/>
                <!-- Helmet front -->
                <rect x="15" y="20" width="20" height="4" fill="#B8860B"/>
                <!-- Eyes -->
                <ellipse cx="22" cy="28" rx="2" ry="1.5" fill="#1a1a1a"/>
                <ellipse cx="28" cy="28" rx="2" ry="1.5" fill="#1a1a1a"/>
                <!-- Stern expression -->
                <line x1="20" y1="35" x2="30" y2="35" stroke="#8B4513" stroke-width="1.5"/>
            </svg>`,
            colors: { primary: '#B8860B', secondary: '#8B0000' }
        }
    },

    // Get SVG for an item
    getSVG(itemId) {
        // Check all categories
        if (this.boards[itemId]) return this.boards[itemId].svg;
        if (this.pieces[itemId]) return this.pieces[itemId].svg;
        if (this.avatars[itemId]) return this.avatars[itemId].svg;
        return null;
    },

    // Get colors for game rendering
    getColors(itemId) {
        if (this.boards[itemId]) return this.boards[itemId].colors;
        if (this.pieces[itemId]) return this.pieces[itemId].colors;
        if (this.avatars[itemId]) return this.avatars[itemId].colors;
        return null;
    }
};

// Make globally available
window.ShopAssets = ShopAssets;

