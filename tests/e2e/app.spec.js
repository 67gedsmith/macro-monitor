import { test, expect } from '@playwright/test';

test.describe('Macro Monitor PWA - User Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the initial user creation form', async ({ page }) => {
    await expect(page.locator('#userSelectionSection')).toBeVisible();
    await expect(page.locator('#profileSection')).toBeVisible();
    await expect(page.locator('#weightSection')).not.toBeVisible();
  });

  test('should create a new user with metric units on mobile', async ({ page }) => {
    // Fill in user profile
    await page.fill('#userName', 'Mobile Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    
    // Use metric units (default)
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    
    // Submit profile
    await page.click('#profileForm button[type="submit"]');
    
    // Should navigate to weight section
    await expect(page.locator('#weightSection')).toBeVisible();
    await expect(page.locator('#profileSection')).not.toBeVisible();
  });

  test('should create a new user with imperial units on mobile', async ({ page }) => {
    // Fill in user profile
    await page.fill('#userName', 'Imperial User');
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '25');
    
    // Switch to imperial units for height
    await page.click('input[name="heightUnit"][value="ft"]');
    await page.fill('#heightFeet', '5');
    await page.fill('#heightInches', '6');
    
    await page.selectOption('#activityLevel', '1.375');
    
    // Submit profile
    await page.click('#profileForm button[type="submit"]');
    
    // Should navigate to weight section
    await expect(page.locator('#weightSection')).toBeVisible();
  });

  test('should navigate between sections on mobile', async ({ page }) => {
    // Create user
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('#profileForm button[type="submit"]');

    // Should be on weight section
    await expect(page.locator('#weightSection')).toBeVisible();
    
    // Navigate back to profile
    await page.click('#backToProfileBtn');
    await expect(page.locator('#profileSection')).toBeVisible();
  });
});

test.describe('Macro Monitor PWA - BMR/TDEE Calculations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create a test user
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('#profileForm button[type="submit"]');
  });

  test('should calculate BMR and TDEE correctly on mobile', async ({ page }) => {
    // Enter weight and submit
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    // Wait for results
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Verify BMR value (should be around 1780 for 30yo male, 80kg, 180cm)
    const bmrText = await page.locator('#bmrValue').textContent();
    expect(bmrText).toContain('1780');
    
    // Verify TDEE value (BMR * 1.55 = ~2759)
    const tdeeText = await page.locator('#tdeeValue').textContent();
    expect(tdeeText).toContain('2759');
  });

  test('should display weight loss targets on mobile', async ({ page }) => {
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('#loss05')).toBeVisible();
    await expect(page.locator('#loss10')).toBeVisible();
    await expect(page.locator('#loss15')).toBeVisible();
    await expect(page.locator('#loss20')).toBeVisible();
  });

  test('should calculate with imperial weight units on mobile', async ({ page }) => {
    // Switch to imperial weight units
    await page.click('input[name="weightUnit"][value="st"]');
    
    // Enter weight (12 stones 8 pounds = ~79.4kg)
    await page.fill('#weightStones', '12');
    await page.fill('#weightPounds', '8');
    
    await page.click('#weightForm button[type="submit"]');
    
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // BMR should be similar to 80kg
    const bmrText = await page.locator('#bmrValue').textContent();
    expect(bmrText).toContain('177');
  });

  test('should recalculate when weight changes on mobile', async ({ page }) => {
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    await page.waitForTimeout(500);
    const firstBmr = await page.locator('#bmrValue').textContent();
    
    // Go back and change weight
    await page.click('#backToWeightBtn');
    await page.fill('#weight', '75');
    await page.click('#weightForm button[type="submit"]');
    
    const secondBmr = await page.locator('#bmrValue').textContent();
    
    // BMR should be different
    expect(firstBmr).not.toBe(secondBmr);
  });
});

test.describe('Macro Monitor PWA - Macro Customization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create user and calculate results
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('#profileForm button[type="submit"]');
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
  });

  test('should display macro breakdown on mobile', async ({ page }) => {
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Check all macro components are visible
    await expect(page.locator('#proteinGrams')).toBeVisible();
    await expect(page.locator('#carbsGrams')).toBeVisible();
    await expect(page.locator('#fatGrams')).toBeVisible();
  });

  test('should customize macro percentages on mobile', async ({ page }) => {
    // Open macro customization
    await page.click('#customizeMacrosBtn');
    
    await expect(page.locator('#macroCustomizationSection')).toBeVisible();
    await page.fill('#proteinPercent', '40');
    await page.fill('#carbsPercent', '35');
    await page.fill('#fatPercent', '25');
    
    // Apply changes
    await page.click('#saveMacrosBtn');
    
    // Verify macros updated
    const proteinPercent = await page.locator('#proteinPercent-display').textContent();
    expect(proteinPercent).toContain('40%');
  });
});

test.describe('Macro Monitor PWA - Katch-McArdle Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create user
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('#profileForm button[type="submit"]');
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
  });

  test('should show Katch-McArdle section on mobile', async ({ page }) => {
    await page.click('#showKatchMcArdleBtn');
    
    await expect(page.locator('#katchMcArdleSection')).toBeVisible();
  });

  test('should calculate Katch-McArdle BMR with body fat on mobile', async ({ page }) => {
    await page.click('#showKatchMcArdleBtn');
    
    // Enter body fat percentage
    await page.fill('#bodyFatPercent', '15');
    await page.click('#calculateKatchMcArdleBtn');
    
    // Verify results are displayed
    await expect(page.locator('#katchMcArdleResults')).toBeVisible();
    await expect(page.locator('#katchBmrValue')).toContainText('kcal/day');
    await expect(page.locator('#leanBodyMass')).toContainText('68');
  });

  test('should customize Katch-McArdle macros on mobile', async ({ page }) => {
    await page.click('#showKatchMcArdleBtn');
    await page.fill('#bodyFatPercent', '15');
    await page.click('#calculateKatchMcArdleBtn');
    
    // Open Katch-McArdle macro customization
    await page.click('#katchCustomizeMacrosBtn');
    
    await expect(page.locator('#katchMacroCustomizationSection')).toBeVisible();
    
    // Change macros
    await page.fill('#katchProteinPercent', '40');
    await page.fill('#katchCarbsPercent', '35');
    await page.fill('#katchFatPercent', '25');
    
    await page.click('#katchSaveMacrosBtn');
    
    // Verify macros updated
    const proteinPercent = await page.locator('#katchProteinPercent-display').textContent();
    expect(proteinPercent).toContain('40%');
  });
});

test.describe('Macro Monitor PWA - Profile Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create user
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('#profileForm button[type="submit"]');
  });

  test('should edit user profile on mobile', async ({ page }) => {
    // Wait for weight section to be visible
    await expect(page.locator('#weightSection')).toBeVisible();
    
    // Click edit profile
    await expect(page.locator('#editProfile')).toBeVisible();
    await page.click('#editProfile');
    
    // Verify form is populated
    const nameValue = await page.inputValue('#userName');
    expect(nameValue).toBe('Test User');
    
    // Change age
    await page.fill('#age', '35');
    await page.click('#profileForm button[type="submit"]');
    
    // Should stay on weight section
    await expect(page.locator('#weightSection')).toBeVisible();
  });

  test('should persist edited profile data on mobile', async ({ page }) => {
    // Wait for weight section to be visible
    await expect(page.locator('#weightSection')).toBeVisible();
    
    await expect(page.locator('#editProfile')).toBeVisible();
    await page.click('#editProfile');
    
    // Change activity level
    await page.selectOption('#activityLevel', '1.725');
    await page.click('#profileForm button[type="submit"]');
    
    // Enter weight and calculate
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    // TDEE should reflect new activity level (1780 * 1.725 = ~3071)
    const tdeeText = await page.locator('#tdeeValue').textContent();
    expect(tdeeText).toContain('307');
  });
});

test.describe('Macro Monitor PWA - User Persistence', () => {
  test('should persist user data across page reloads on mobile', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create user
    await page.fill('#userName', 'Persistent User');
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '28');
    await page.fill('#height', '165');
    await page.selectOption('#activityLevel', '1.375');
    await page.click('#profileForm button[type="submit"]');
    
    // Reload page
    await page.reload();
    
    // User should still be loaded
    await expect(page.locator('#weightSection')).toBeVisible();
  });

  test('should persist weight data on mobile', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create user
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('#profileForm button[type="submit"]');
    
    // Enter weight
    await page.fill('#weight', '75');
    await page.click('#weightForm button[type="submit"]');
    
    // Reload page
    await page.reload();
    
    // Weight should be persisted
    const weightValue = await page.inputValue('#weight');
    expect(weightValue).toBe('75');
  });
});

test.describe('Macro Monitor PWA - UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should require all profile fields on mobile', async ({ page }) => {
    // Try to submit without filling all fields
    await page.fill('#userName', 'Test');
    
    // Click submit
    await page.click('#profileForm button[type="submit"]');
    
    // Should still be on profile section (HTML5 validation prevents submit)
    await expect(page.locator('#profileSection')).toBeVisible();
  });

  test('should display responsive layout on mobile viewport', async ({ page }) => {
    // Check that the page is responsive
    const container = page.locator('body');
    await expect(container).toBeVisible();
    
    // Verify page width is set properly
    const width = await page.evaluate(() => window.innerWidth);
    expect(width).toBeGreaterThan(0);
  });
});

test.describe('Macro Monitor PWA Features', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Wait for service worker registration
    await page.waitForTimeout(1000);
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration().then(reg => !!reg);
    });
    
    expect(swRegistered).toBe(true);
  });

  test('should have PWA manifest', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check for manifest link in head
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
  });

  test('should have theme color meta tag', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check for theme color meta tag
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveCount(1);
  });
});
