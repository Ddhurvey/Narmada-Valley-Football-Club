# Narmada Valley Football Club (NVFC) Website

Official website for Narmada Valley Football Club - A production-grade, fully functional football club website built with modern web technologies.

## 🚀 Features

- ✅ **Real-time Match Updates** - Live scores and match events via Socket.IO
- ✅ **E-commerce Store** - Full shopping cart and Stripe checkout integration
- ✅ **Ticket Booking** - Match ticket booking with seat selection
- ✅ **Admin Panel** - Complete CRUD operations for content management
- ✅ **Firebase Authentication** - Secure user authentication and authorization
- ✅ **Modern Animations** - Framer Motion and GSAP animations
- ✅ **PWA Support** - Installable app with offline capabilities
- ✅ **Responsive Design** - Mobile-first, fully responsive UI
- ✅ **SEO Optimized** - Meta tags, Open Graph, and Schema.org markup

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion + GSAP
- **State Management**: React Context + Hooks

### Backend

- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Real-time**: Socket.IO
- **Payments**: Stripe (Test Mode)

### DevOps

- **Hosting**: Firebase Hosting
- **CI/CD**: GitHub Actions
- **Testing**: Jest + Cypress

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm
- Git
- A Firebase account
- A Stripe account (test mode)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NVFC
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "NVFC" (or your preferred name)
3. Enable the following services:
   - **Authentication** → Enable Email/Password provider
   - **Firestore Database** → Create database in production mode
   - **Storage** → Enable Firebase Storage
   - **Hosting** → Set up hosting

4. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the configuration object

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# Socket.IO Server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Switch to **Test Mode** (toggle in the top right)
3. Go to Developers → API Keys
4. Copy the **Publishable key** and **Secret key**
5. Add them to your `.env.local` file

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
NVFC/
├── app/                    # Next.js app directory
│   ├── (pages)/           # Route pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Header.tsx        # Header with navigation
│   ├── Footer.tsx        # Footer component
│   └── AnimatedHero.tsx  # Hero section
├── lib/                   # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── context/               # React context providers
├── server/                # Socket.IO server
├── public/                # Static assets
└── __tests__/            # Test files
```

## 🎨 Design System

### Brand Colors

- **Primary**: `#1a1f71` (Deep Blue)
- **Secondary**: `#ffd700` (Gold)
- **Accent**: `#e63946` (Red)
- **Dark**: `#0a0e27`
- **Light**: `#f8f9fa`

### Typography

- **Display Font**: Outfit
- **Body Font**: Inter

## 🔐 Authentication

The app uses Firebase Authentication with the following features:

- Email/Password sign up and login
- Protected routes
- Role-based access control (User vs Admin)
- Password reset functionality

### Creating an Admin User

1. Sign up normally through the UI
2. Go to Firebase Console → Firestore Database
3. Find your user document in the `users` collection
4. Change the `role` field from `"user"` to `"admin"`

## 🛒 E-commerce Features

### Test Stripe Checkout

Use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## 🎫 Ticket Booking

The ticket booking system includes:

- Match listing
- Seat selection (mock)
- Booking confirmation
- Ticket storage in Firestore
- "My Tickets" dashboard

## 📡 Real-time Features

### Socket.IO Server

The Socket.IO server needs to be run separately for real-time match updates:

```bash
cd server
npm install
npm start
```

The server will run on `http://localhost:3001`.

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run cypress
```

## 🚀 Deployment

### Firebase Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase:

```bash
firebase init
```

Select:

- Hosting
- Firestore
- Functions (for Socket.IO server)

4. Build and deploy:

```bash
npm run build
firebase deploy
```

### Environment Variables in Production

Add your production environment variables in:

- Firebase Console → Hosting → Environment Configuration
- Or use Firebase Functions config for sensitive keys

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run cypress` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests headlessly

## 🎯 Key Pages

- `/` - Home page with hero, news, and standings
- `/news` - News listing and articles
- `/fixtures` - Fixtures and results
- `/players` - Squad and player profiles
- `/live` - Live match center
- `/tickets` - Ticket booking
- `/store` - Official merchandise store
- `/membership` - Membership plans
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin panel (protected, admin only)

## 🔒 Security

- All sensitive keys are stored in environment variables
- Firebase Security Rules are configured
- Protected routes use authentication middleware
- Admin routes have role-based access control
- Stripe payments use test mode by default

## 🐛 Troubleshooting

### Firebase Connection Issues

- Ensure all environment variables are set correctly
- Check Firebase project settings
- Verify Firebase services are enabled

### Stripe Checkout Not Working

- Confirm you're using test mode keys
- Check Stripe dashboard for errors
- Ensure webhook endpoints are configured (if using)

### Socket.IO Connection Failed

- Make sure the Socket.IO server is running
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
- Verify port 3001 is not in use

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@nvfc.com or join our Discord community.

---

**Built with ⚽ by the NVFC Development Team**
