# Axon Privacy Wallet

A modern, privacy-focused Web3 wallet built with React, TypeScript, and Solana integration.

## 🚀 Recent Mobile UI & Security Improvements

### Mobile-First Design Optimizations
- **Responsive Layout**: Optimized for mobile devices with proper viewport settings
- **Touch-Friendly Interface**: Added `touch-manipulation` CSS for better touch response
- **Safe Area Support**: Proper handling of iPhone notch and bottom safe areas
- **Improved Navigation**: Enhanced bottom navigation with better touch targets
- **Mobile Input Optimization**: Prevents zoom on input focus with proper font sizing

### Enhanced User Wallet Isolation
- **Strict User Separation**: Each Gmail/X login gets a unique wallet stored separately
- **User-Specific Storage**: Wallets are stored with user-specific keys (`axon_sk_${userId}`)
- **Clean Login Protocol**: Previous wallet data is cleared on new authentication
- **Firebase Integration**: User wallets are synced to Firebase with user ID tracking
- **Auto-Login Security**: Only auto-login for the specific user who was last logged in

### UI/UX Improvements
- **Better Button Feedback**: All buttons now have proper active states and loading indicators
- **Copy Functionality**: Added copy-to-clipboard with visual feedback for addresses and keys
- **Improved Modals**: Better mobile-responsive modals with proper scrolling
- **Enhanced Forms**: Better input validation and user feedback
- **Loading States**: Consistent loading indicators across all components

### Technical Improvements
- **TypeScript Strict Mode**: Better type safety throughout the application
- **Error Handling**: Improved error handling and user feedback
- **Performance**: Optimized re-renders and state management
- **Security**: Enhanced private key handling and storage isolation

## 🔧 Key Features

- **Non-Custodial**: Users own their private keys
- **Social Login**: Login with Google or X (Twitter)
- **Solana Integration**: Full Solana blockchain support
- **Privacy-First**: End-to-end encrypted wallet storage
- **Mobile Optimized**: Perfect mobile experience
- **Axon Snap**: Create shareable payment links
- **QR Code Support**: Scan and generate QR codes for payments

## 🛠 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 Mobile Features

- **PWA Ready**: Can be installed as a mobile app
- **Offline Support**: Core functionality works offline
- **Touch Optimized**: All interactions optimized for touch
- **Safe Area Aware**: Proper handling of device-specific UI elements

## 🔐 Security Features

- **User Isolation**: Each user gets a unique wallet
- **Firebase Sync**: Secure cloud backup of encrypted keys
- **Clean Logout**: Complete data cleanup on logout
- **Demo Mode**: Safe demo mode when Firebase is not configured

## 🎨 UI Components

All UI components are mobile-first and include:
- Proper touch targets (minimum 44px)
- Active states for better feedback
- Loading states for async operations
- Error handling and validation
- Accessibility considerations

The wallet is now production-ready with enterprise-grade security and mobile-first design!