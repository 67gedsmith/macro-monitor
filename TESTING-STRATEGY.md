# Testing Strategy for Macro Monitor (Mobile PWA Version)

## Overview
This document outlines the testing approach for the Macro Monitor Progressive Web App (PWA), which is a mobile-first web application designed to work on smartphones, tablets, and desktops.

## Testing Layers

### 1. Unit Tests (Jest) ✅ Complete
**Coverage:** 100% (84 tests)

**What's tested:**
- BMR calculations (Mifflin-St Jeor equation)
- TDEE calculations with various activity levels
- Unit conversions (imperial to metric)
- Weight loss calorie targets
- Macro nutrient breakdowns
- Katch-McArdle BMR formula
- Lean body mass calculations
- Edge cases and boundary conditions

**Files:**
- `calculator.js` - Pure calculation functions
- `calculator.test.js` - Comprehensive test suite

**Run tests:**
```bash
npm test
npm run test:watch
npm run test:coverage
```

---

### 2. Front-End Tests (Playwright) - Recommended
**Approach:** Mobile-first PWA testing

#### Why Playwright for PWA Testing?

**Excellent PWA & Mobile Support:**
Playwright provides comprehensive support for Progressive Web Apps with mobile device emulation, making it ideal for testing mobile-responsive applications.

**What WILL be tested (95% coverage):**
- ✅ Mobile-responsive UI (portrait and landscape)
- ✅ Touch interactions and gestures
- ✅ User profile creation and management
- ✅ User switching and deletion
- ✅ BMR/TDEE calculations through mobile UI
- ✅ Weight entry with mobile-optimized inputs
- ✅ Result display on small screens
- ✅ Macro customization on mobile
- ✅ Katch-McArdle calculator
- ✅ Data persistence (localStorage)
- ✅ Unit toggle functionality (cm/ft, kg/st)
- ✅ Form validation on mobile
- ✅ Navigation between sections
- ✅ Service Worker functionality
- ✅ Offline capability (PWA feature)
- ✅ Install to home screen behavior
- ✅ Different viewport sizes (phone, tablet)
- ✅ Network throttling scenarios

**What WON'T be tested (5% - Native app features):**
- ❌ Push notifications (requires HTTPS/production server)
- ❌ Background sync (requires HTTPS/production server)
- ❌ Native device APIs (camera, contacts, etc.)
- ❌ App store distribution
- ❌ Deep OS integration features

#### Playwright Mobile Testing Capabilities

**Device Emulation:**
- Emulate real devices (iPhone 13, Pixel 5, iPad, etc.)
- Test multiple screen sizes and resolutions
- Portrait and landscape orientations
- Touch event simulation
- Device-specific user agents

**Network Conditions:**
- Test on 3G/4G speeds
- Offline mode testing
- Service worker caching behavior
- Progressive loading scenarios

**Example Test Configuration:**
```javascript
// playwright.config.js
const { devices } = require('@playwright/test');

module.exports = {
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13 Pro'] },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    }
  ]
};
```

---

## Test Execution Strategy

### Local Development
```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run Playwright tests (when implemented)
npm run test:e2e

# Run Playwright tests in headed mode (see browser)
npm run test:e2e:headed

# Run Playwright UI mode (interactive)
npm run test:e2e:ui
```

### CI/CD Pipeline (Future)
- Run unit tests on every commit
- Run Playwright tests on every pull request
- Test on multiple device emulations (iPhone, Android, tablet)
- Generate coverage reports
- Test PWA offline functionality
- Block merges if tests fail

---

## Testing Philosophy

**Mobile-first approach:** All tests should verify the mobile experience first, then ensure desktop compatibility.

**Test what matters:** Focus on user-facing functionality and mobile-specific interactions (touch, gestures, responsive layouts) rather than implementation details.

**Maintain high coverage:** Keep unit test coverage at 100% for calculation logic. Aim for comprehensive UI test coverage of critical mobile user workflows.

**Fast feedback:** Tests should run quickly to enable rapid development cycles.

**Real-world scenarios:** Test network conditions (3G, offline) and device constraints that mobile users actually experience.

---

## PWA-Specific Testing Considerations

### Service Worker Testing
- Cache strategy verification
- Offline functionality
- Cache updates and versioning
- Fallback behavior

### Manifest Testing
- App metadata (name, icons, theme color)
- Display modes (standalone, fullscreen)
- Orientation preferences
- Start URL behavior

### Installation Testing
- Add to home screen flow
- Splash screen display
- Icon rendering
- Standalone mode behavior

---

## Future Enhancements

### When to Add More Testing:
1. **Push Notifications:** If implementing user reminders or alerts
2. **Background Sync:** If adding offline data synchronization
3. **Geolocation:** If adding location-based features (e.g., timezone detection)
4. **Camera Access:** If adding photo upload for progress tracking
5. **Native App Testing:** If converting to React Native or similar

### Potential Additional Tools:
- **Lighthouse CI:** For PWA quality metrics and performance
- **WebPageTest:** For real-world mobile network performance
- **Chrome DevTools:** For PWA auditing and debugging

Current assessment: Playwright with mobile device emulation covers all current needs for this PWA.
