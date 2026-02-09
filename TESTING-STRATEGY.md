# Testing Strategy for Macro Monitor

## Overview
This document outlines the testing approach for the Macro Monitor desktop application, which is built using Electron.

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

### 2. Front-End Tests (Playwright)
**Approach:** Web-based testing (not Electron-specific)

#### Why Web Testing Instead of Electron Testing?

**Core functionality is platform-agnostic:**
The app's primary features (calculations, forms, user management, localStorage) work identically in browsers and Electron. Testing as a web app is simpler and covers 95% of functionality.

**What WILL be tested (95% coverage):**
- ✅ User interface interactions (forms, buttons, dropdowns)
- ✅ Profile creation and management
- ✅ User switching and deletion
- ✅ BMR/TDEE calculations through the UI
- ✅ Weight entry and result display
- ✅ Macro customization
- ✅ Katch-McArdle calculator
- ✅ Data persistence (localStorage)
- ✅ Unit toggle functionality (cm/ft, kg/st)
- ✅ Form validation
- ✅ Navigation between sections
- ✅ Responsive layout and styling

**What WON'T be tested (5% - Electron-specific):**
- ❌ IPC (Inter-Process Communication) - `ipcRenderer.send('wake-input')`
- ❌ Electron window management (minimize, maximize, close)
- ❌ OS-level input focus workarounds
- ❌ Native desktop menus and keyboard shortcuts
- ❌ Desktop-specific rendering quirks

#### Why This Approach Makes Sense

1. **Graceful degradation:** The app already has try-catch blocks around Electron-specific code, so it works without Electron features.

2. **Core business logic tested:** Unit tests + web UI tests cover all critical functionality (calculations, data management, user flows).

3. **Faster and simpler:** Web testing with Playwright is easier to set up, faster to run, and more maintainable.

4. **The 5% doesn't affect correctness:** Electron-specific features are UX enhancements (window behavior, focus management), not core functionality.

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
```

### CI/CD Pipeline (Future)
- Run unit tests on every commit
- Run Playwright tests on every pull request
- Generate coverage reports
- Block merges if tests fail

---

## Testing Philosophy

**Test what matters:** Focus on user-facing functionality and business logic rather than implementation details or platform-specific quirks.

**Maintain high coverage:** Keep unit test coverage at 100% for calculation logic. Aim for comprehensive UI test coverage of critical user workflows.

**Fast feedback:** Tests should run quickly to enable rapid development cycles.

---

## Future Enhancements

If Electron-specific testing becomes necessary:
1. Add `@playwright/test` with Electron support
2. Test IPC communication patterns
3. Test window lifecycle events
4. Test native menus and shortcuts

Current assessment: Not needed for this application.
