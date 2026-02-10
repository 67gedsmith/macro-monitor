import { test, expect } from '@playwright/test';

test.describe('Macro Monitor - User Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8181');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the initial user creation form', async ({ page }) => {
    await expect(page.locator('#userSelectionSection')).toBeVisible();
    await expect(page.locator('#profileSection')).toBeVisible();
    await expect(page.locator('#weightSection')).not.toBeVisible();
  });

  test('should create a new user with metric units', async ({ page }) => {
    // Fill in user profile
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    
    // Use metric units (default)
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    
    // Submit profile
    await page.click('button[type="submit"]');
    
    // Should navigate to weight section
    await expect(page.locator('#weightSection')).toBeVisible();
    await expect(page.locator('#profileSection')).not.toBeVisible();
  });

  test('should create a new user with imperial units', async ({ page }) => {
    await page.fill('#userName', 'John Doe');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '25');
    
    // Switch to imperial units
    await page.click('input[name="heightUnit"][value="ft"]');
    await page.fill('#heightFeet', '5');
    await page.fill('#heightInches', '10');
    
    await page.selectOption('#activityLevel', '1.375');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#weightSection')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.click('button[type="submit"]');
    
    // Should show validation message
    await page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('required');
      await dialog.accept();
    });
  });

  test('should create and navigate to weight section', async ({ page }) => {
    // Create a user
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '28');
    await page.fill('#height', '165');
    await page.selectOption('#activityLevel', '1.2');
    await page.click('button[type="submit"]');
    
    // Should navigate to weight section
    await expect(page.locator('#weightSection')).toBeVisible();
    await expect(page.locator('#profileSection')).not.toBeVisible();
  });
});

test.describe('Macro Monitor - BMR and TDEE Calculations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8181');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create a test user
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('button[type="submit"]');
  });

  test('should calculate BMR and TDEE with metric weight', async ({ page }) => {
    // Enter weight
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    // Check results are displayed
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('#bmrValue')).toContainText('kcal/day');
    await expect(page.locator('#tdeeValue')).toContainText('kcal/day');
    
    // Verify BMR calculation (should be 1780 for 30yo male, 80kg, 180cm)
    const bmrText = await page.locator('#bmrValue').textContent();
    expect(bmrText).toContain('1780');
  });

  test('should calculate BMR and TDEE with imperial weight', async ({ page }) => {
    // Switch to imperial weight units
    await page.click('input[name="weightUnit"][value="st"]');
    await page.fill('#weightStones', '12');
    await page.fill('#weightPounds', '8');
    await page.click('#weightForm button[type="submit"]');
    
    // Check results are displayed
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('#bmrValue')).toContainText('kcal/day');
  });

  test('should display weight loss targets', async ({ page }) => {
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    // Check all weight loss targets are displayed
    await expect(page.locator('#loss05')).toContainText('kcal/day');
    await expect(page.locator('#loss10')).toContainText('kcal/day');
    await expect(page.locator('#loss15')).toContainText('kcal/day');
    await expect(page.locator('#loss20')).toContainText('kcal/day');
  });

  test('should update macros when changing weight loss target', async ({ page }) => {
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    // Get initial macro values
    const initialProtein = await page.locator('#proteinGrams').textContent();
    
    // Change weight loss target
    await page.selectOption('#weightLossTarget', 'loss10');
    
    // Macro values should update
    const updatedProtein = await page.locator('#proteinGrams').textContent();
    expect(updatedProtein).not.toBe(initialProtein);
  });

  test('should navigate back to weight entry', async ({ page }) => {
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    // Click back button
    await page.click('#backToWeightBtn');
    
    // Should scroll to weight section (it's still visible)
    await expect(page.locator('#weightSection')).toBeVisible();
  });
});

test.describe('Macro Monitor - Macro Customization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8181');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create user and enter weight
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('button[type="submit"]');
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
  });

  test('should open macro customization dialog', async ({ page }) => {
    await page.click('#customizeMacrosBtn');
    await expect(page.locator('#macroCustomizationSection')).toBeVisible();
  });

  test('should show default macro percentages', async ({ page }) => {
    await page.click('#customizeMacrosBtn');
    
    // Check default values (35/35/30)
    await expect(page.locator('#proteinPercent')).toHaveValue('35');
    await expect(page.locator('#carbsPercent')).toHaveValue('35');
    await expect(page.locator('#fatPercent')).toHaveValue('30');
    
    // Total should be 100
    await expect(page.locator('#totalMacroPercent')).toContainText('100');
  });

  test('should validate macro percentages total 100', async ({ page }) => {
    await page.click('#customizeMacrosBtn');
    
    // Change values that don't total 100
    await page.fill('#proteinPercent', '40');
    await page.fill('#carbsPercent', '40');
    await page.fill('#fatPercent', '40');
    
    // Total should show 120
    await expect(page.locator('#totalMacroPercent')).toContainText('120');
    
    // Try to save - should show error
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('100');
      await dialog.accept();
    });
    await page.click('#saveMacrosBtn');
  });

  test('should save custom macro percentages', async ({ page }) => {
    await page.click('#customizeMacrosBtn');
    
    // Set custom values (40/30/30)
    await page.fill('#proteinPercent', '40');
    await page.fill('#carbsPercent', '30');
    await page.fill('#fatPercent', '30');
    
    // Save
    await page.click('#saveMacrosBtn');
    
    // Dialog should close
    await expect(page.locator('#macroCustomizationSection')).not.toBeVisible();
    
    // Macro display should update to show 40%
    await expect(page.locator('#proteinPercent-display')).toContainText('40%');
  });

  test('should cancel macro customization', async ({ page }) => {
    await page.click('#customizeMacrosBtn');
    
    // Change values
    await page.fill('#proteinPercent', '50');
    
    // Cancel
    await page.click('#cancelMacrosBtn');
    
    // Dialog should close and original values preserved
    await expect(page.locator('#macroCustomizationSection')).not.toBeVisible();
    await expect(page.locator('#proteinPercent-display')).toContainText('35%');
  });
});

test.describe('Macro Monitor - Katch-McArdle Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8181');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create user and enter weight
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('button[type="submit"]');
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
  });

  test('should show Katch-McArdle section', async ({ page }) => {
    await page.click('#showKatchMcArdleBtn');
    await expect(page.locator('#katchMcArdleSection')).toBeVisible();
  });

  test('should calculate Katch-McArdle BMR', async ({ page }) => {
    await page.click('#showKatchMcArdleBtn');
    
    // Enter body fat percentage
    await page.fill('#bodyFatPercent', '15');
    await page.click('#calculateKatchMcArdleBtn');
    
    // Results should be displayed
    await expect(page.locator('#katchMcArdleResults')).toBeVisible();
    await expect(page.locator('#katchBmrValue')).toContainText('kcal/day');
    await expect(page.locator('#leanBodyMass')).toContainText('68');
  });

  test('should validate body fat percentage range', async ({ page }) => {
    await page.click('#showKatchMcArdleBtn');
    
    // Try invalid value
    await page.fill('#bodyFatPercent', '60');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('body fat');
      await dialog.accept();
    });
    
    await page.click('#calculateKatchMcArdleBtn');
  });

  test('should hide Katch-McArdle section', async ({ page }) => {
    await page.click('#showKatchMcArdleBtn');
    await expect(page.locator('#katchMcArdleSection')).toBeVisible();
    
    await page.click('#hideKatchMcArdleBtn');
    await expect(page.locator('#katchMcArdleSection')).not.toBeVisible();
  });

  test('should customize Katch-McArdle macros independently', async ({ page }) => {
    await page.click('#showKatchMcArdleBtn');
    await page.fill('#bodyFatPercent', '15');
    await page.click('#calculateKatchMcArdleBtn');
    
    // Open Katch-McArdle macro customization
    await page.click('#katchCustomizeMacrosBtn');
    await expect(page.locator('#katchMacroCustomizationSection')).toBeVisible();
    
    // Change values
    await page.fill('#katchProteinPercent', '45');
    await page.fill('#katchCarbsPercent', '30');
    await page.fill('#katchFatPercent', '25');
    
    await page.click('#katchSaveMacrosBtn');
    
    // Should update display
    await expect(page.locator('#katchProteinPercent-display')).toContainText('45%');
  });
});

test.describe('Macro Monitor - Profile Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8181');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create a user
    await page.fill('#userName', 'Test User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('button[type="submit"]');
  });

  test('should edit profile from weight section', async ({ page }) => {
    await page.click('#editProfile');
    
    // Should show profile section with populated values
    await expect(page.locator('#profileSection')).toBeVisible();
    await expect(page.locator('#userName')).toHaveValue('Test User');
    await expect(page.locator('#age')).toHaveValue('30');
    await expect(page.locator('#height')).toHaveValue('180');
  });

  test('should save edited profile', async ({ page }) => {
    await page.click('#editProfile');
    
    // Change age
    await page.fill('#age', '31');
    await page.click('button[type="submit"]');
    
    // Should return to weight section
    await expect(page.locator('#weightSection')).toBeVisible();
    
    // Edit again to verify saved
    await page.click('#editProfile');
    await expect(page.locator('#age')).toHaveValue('31');
  });
});

test.describe('Macro Monitor - User Persistence', () => {
  test('should persist user data across page reloads', async ({ page }) => {
    await page.goto('http://localhost:8181');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create a user
    await page.fill('#userName', 'Persistent User');
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '25');
    await page.fill('#height', '165');
    await page.selectOption('#activityLevel', '1.375');
    await page.click('button[type="submit"]');
    
    // Enter weight
    await page.fill('#weight', '60');
    await page.click('#weightForm button[type="submit"]');
    
    // Reload page
    await page.reload();
    
    // Should load directly to weight section with user data
    await expect(page.locator('#weightSection')).toBeVisible();
    await expect(page.locator('#userSelect')).toHaveValue(/.+/); // Has a value
  });

  test('should persist user selection across reloads', async ({ page }) => {
    await page.goto('http://localhost:8181');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create a user
    await page.fill('#userName', 'Persistent User');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('button[type="submit"]');
    
    // Verify we're in weight section
    await expect(page.locator('#weightSection')).toBeVisible();
    
    // Reload and verify user is still selected
    await page.goto('http://localhost:8181');
    await expect(page.locator('#weightSection')).toBeVisible();
    
    // Check that user dropdown has the created user
    const hasUserOption = await page.locator('#userSelect option').count();
    expect(hasUserOption).toBeGreaterThan(1); // More than just "Create New User"
  });
});

test.describe('Macro Monitor - UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8181');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should toggle between height units', async ({ page }) => {
    // Default should show cm input
    await expect(page.locator('#heightCm')).toBeVisible();
    await expect(page.locator('#heightFt')).not.toBeVisible();
    
    // Switch to feet/inches
    await page.click('input[name="heightUnit"][value="ft"]');
    await expect(page.locator('#heightCm')).not.toBeVisible();
    await expect(page.locator('#heightFt')).toBeVisible();
    
    // Switch back to cm
    await page.click('input[name="heightUnit"][value="cm"]');
    await expect(page.locator('#heightCm')).toBeVisible();
  });

  test('should toggle between weight units', async ({ page }) => {
    // Create user to get to weight section
    await page.fill('#userName', 'Test');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('button[type="submit"]');
    
    // Default should show kg input
    await expect(page.locator('#weightKg')).toBeVisible();
    await expect(page.locator('#weightSt')).not.toBeVisible();
    
    // Switch to stones/pounds
    await page.click('input[name="weightUnit"][value="st"]');
    await expect(page.locator('#weightKg')).not.toBeVisible();
    await expect(page.locator('#weightSt')).toBeVisible();
  });

  test('should display BMR and TDEE explanations', async ({ page }) => {
    await page.fill('#userName', 'Test');
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '30');
    await page.fill('#height', '180');
    await page.selectOption('#activityLevel', '1.55');
    await page.click('button[type="submit"]');
    await page.fill('#weight', '80');
    await page.click('#weightForm button[type="submit"]');
    
    // Check explanations are present using more specific selectors
    await expect(page.locator('h3:has-text("Basal Metabolic Rate")')).toBeVisible();
    await expect(page.locator('h3:has-text("Total Daily Energy Expenditure")')).toBeVisible();
  });
});

