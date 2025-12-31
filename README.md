# Ancient Board Games 🏛️

Play 5,000-year-old games online! A beautiful, immersive web application featuring five authentic ancient board games with AI opponents, online multiplayer, rankings, and cosmetic shop.

## 🎮 Featured Games

1. **Royal Game of Ur** (Mesopotamia, 2600 BCE)
   - Race game with strategy and luck
   - 4 tetrahedral dice, 7 pieces per player
   - Rosette squares grant extra turns and safety

2. **Senet** (Egypt, 3100 BCE)
   - Journey through the afterlife
   - Special squares with unique effects
   - Found in Tutankhamun's tomb

3. **Hnefatafl** (Scandinavia, 400 CE)
   - Asymmetric Viking war game
   - King must escape to corners
   - Attackers must capture the King

4. **Nine Men's Morris** (Roman Empire, 500 BCE)
   - Form mills to capture opponent pieces
   - Three phases: placing, moving, flying
   - Found carved in Roman ruins worldwide

5. **Mancala** (Africa, 700 CE)
   - Seed-sowing strategy game
   - Capture mechanism with extra turns
   - Over 800 regional variations

## ✨ Features

- 🤖 **AI Opponents** - Three difficulty levels (Easy, Medium, Hard)
- 👥 **Online Multiplayer** - Real-time gameplay with Socket.io
- 🏆 **Rankings** - ELO-based rating system with leaderboards
- 🎨 **Cosmetic Shop** - Board skins, pieces, avatars
- 💳 **Premium Membership** - Ad-free experience, exclusive content
- 📱 **Responsive Design** - Desktop and mobile optimized
- 🔐 **Firebase Auth** - Google sign-in and guest play
- 📚 **Historical Content** - Extensive rules and history for each game

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase project (for authentication and database)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ancient-board-games.git
cd ancient-board-games

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Start the server
npm start
```

The app will be available at `http://localhost:3001`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3001

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_monthly_id
STRIPE_ANNUAL_PRICE_ID=price_annual_id

# Firebase Admin (optional - for server-side operations)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## 🔧 Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Google provider
   - Enable Anonymous (for guest play)
4. Create Realtime Database:
   - Go to Realtime Database → Create Database
   - Start in test mode (configure rules for production)
5. Get your config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the firebaseConfig object
6. Update `public/js/config.js` with your Firebase credentials:

```javascript
firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
}
```

### Firebase Database Rules

Set these rules in your Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "rooms": {
      ".read": true,
      ".write": "auth != null"
    },
    "leaderboard": {
      ".read": true,
      ".write": false
    }
  }
}
```

### Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Dashboard
3. Create subscription products:

   **Monthly Subscription:**
   - Name: "Premium Monthly"
   - Price: $4.99/month
   - Copy the Price ID

   **Annual Subscription:**
   - Name: "Premium Annual"  
   - Price: $39.99/year
   - Copy the Price ID

4. Set up webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook signing secret

5. Update `public/js/config.js` with your Stripe public key:

```javascript
stripe: {
    publicKey: 'pk_test_your_public_key_here'
}
```

## 📁 Project Structure

```
ancient-board-games/
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── styles.css      # All styles
│   └── js/
│       ├── config.js       # Configuration
│       ├── utils.js        # Utility functions
│       ├── auth.js         # Firebase authentication
│       ├── main.js         # Main application logic
│       └── games/
│           ├── ur.js       # Royal Game of Ur
│           ├── senet.js    # Senet
│           ├── hnefatafl.js # Hnefatafl
│           ├── morris.js   # Nine Men's Morris
│           └── mancala.js  # Mancala
├── server.js               # Express + Socket.io server
├── package.json
├── .env                    # Environment variables
└── README.md
```

## 🎯 Game Rules Summary

### Royal Game of Ur
- Roll 4 binary dice (0-4 moves)
- Move pieces along the path to bear off
- Land on rosettes for extra turns and safety
- Capture opponent pieces by landing on them
- First to bear off all 7 pieces wins

### Senet
- Roll throwing sticks (1-5 moves)
- Move along boustrophedon path
- Special squares: House of Rebirth, Water, Beauty
- 1, 4, or 5 grants extra turn
- First to bear off all pieces wins

### Hnefatafl
- King and defenders vs attackers
- Defenders win if King reaches corner
- Attackers win by surrounding King on all 4 sides
- Capture by sandwiching between two pieces
- No dice - pure strategy

### Nine Men's Morris
- Phase 1: Place 9 pieces each
- Phase 2: Move pieces to adjacent points
- Phase 3: "Flying" when down to 3 pieces
- Form "mills" (3 in a row) to remove opponent pieces
- Win by reducing opponent to 2 pieces or blocking all moves

### Mancala
- Sow seeds counter-clockwise
- Land in your store for extra turn
- Land in empty pit to capture opposite seeds
- Game ends when one side is empty
- Most seeds in store wins

## 🚢 Deployment

### Deploy to Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create ancient-board-games

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
# ... set all other variables

# Deploy
git push heroku main
```

### Deploy to DigitalOcean App Platform

1. Connect GitHub repository
2. Select Node.js environment
3. Add environment variables
4. Deploy

## 🔒 Security Considerations

- Never expose Stripe secret keys in client code
- Use environment variables for all secrets
- Implement rate limiting for API endpoints
- Validate all user inputs
- Set proper CORS origins in production
- Use HTTPS in production
- Configure Firebase security rules properly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- British Museum for Royal Game of Ur research
- Irving Finkel for Ur rules reconstruction
- Archaeological sources for historical accuracy
- Socket.io for real-time multiplayer
- Firebase for authentication and database
- Stripe for payment processing

## 📧 Support

For support, email support@ancientboardgames.com or open an issue on GitHub.

---

**Play games that have entertained humanity for millennia!** 🎲
