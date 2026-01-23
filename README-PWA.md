# Macro Monitor - Mobile PWA Version

This is the Progressive Web App (PWA) version of Macro Monitor, optimized for mobile devices.

## Features

- **Offline Support**: Works without an internet connection after first load
- **Installable**: Can be added to your phone's home screen
- **Mobile Optimized**: Responsive design for all screen sizes
- **Touch-Friendly**: Large buttons and inputs optimized for touch
- **Full Functionality**: All features from the desktop version

## How to Install on Android

### Method 1: Using Chrome
1. Open the app in Chrome browser on your Android device
2. Tap the menu (three dots) in the top right
3. Select "Add to Home screen" or "Install app"
4. Confirm by tapping "Add" or "Install"
5. The app icon will appear on your home screen

### Method 2: Using the Install Prompt
1. Open the app in a mobile browser
2. A banner will appear at the bottom asking to install
3. Tap "Install" on the banner
4. The app will be added to your home screen

## How to Install on iOS (iPhone/iPad)

1. Open the app in Safari browser
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Give it a name and tap "Add"
5. The app icon will appear on your home screen

## Hosting the PWA

To make this accessible on your phone, you have several options:

### Option 1: GitHub Pages (Free)
1. Go to your repository settings on GitHub
2. Navigate to "Pages" section
3. Select the `mobile-version` branch as the source
4. GitHub will provide a URL like: `https://yourusername.github.io/macro-monitor/`
5. Access this URL on your mobile device

### Option 2: Local Network (Testing)
1. Run a local web server on your computer
2. Access it from your phone on the same network
3. Example using Python: `python -m http.server 8000`
4. Access via: `http://your-computer-ip:8000`

### Option 3: Deploy to Netlify/Vercel (Free)
1. Connect your GitHub repository to Netlify or Vercel
2. Select the `mobile-version` branch
3. Deploy automatically
4. Access via the provided URL

## Development Notes

- All user data is stored locally on the device (localStorage)
- No backend server required
- Service worker caches files for offline use
- Icons are simple SVG placeholders (can be replaced with custom designs)

## Files Added for PWA

- `manifest.json` - App metadata and configuration
- `service-worker.js` - Offline caching functionality
- `icon-192.svg` - App icon (192x192)
- `icon-512.svg` - App icon (512x512)
- Mobile-responsive CSS updates in `styles.css`

## Browser Support

- Chrome/Edge (Android): Full PWA support
- Safari (iOS): Basic PWA support (add to home screen)
- Firefox (Android): Full PWA support

## Testing

Test the responsive design in your browser:
1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (or press Ctrl+Shift+M)
3. Select a mobile device from the dropdown
4. Test all features at different screen sizes
