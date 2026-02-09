// Calculator module - Pure calculation functions for BMR, TDEE, and Macros
// Extracted for testability

/**
 * Convert height from feet and inches to centimeters
 * @param {number} feet - Height in feet
 * @param {number} inches - Height in inches
 * @returns {number} Height in centimeters
 */
function convertFeetInchesToCm(feet, inches) {
    return (feet * 12 + inches) * 2.54;
}

/**
 * Convert weight from stones and pounds to kilograms
 * @param {number} stones - Weight in stones
 * @param {number} pounds - Weight in pounds
 * @returns {number} Weight in kilograms
 */
function convertStonesPoundsToKg(stones, pounds) {
    return stones * 6.35029318 + pounds * 0.453592;
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
 * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
 * 
 * @param {number} weight - Weight in kilograms
 * @param {number} height - Height in centimeters
 * @param {number} age - Age in years
 * @param {string} sex - 'male' or 'female'
 * @returns {number} BMR in kcal/day
 */
function calculateBMR(weight, height, age, sex) {
    if (weight === null || weight === undefined || height === null || height === undefined || 
        age === null || age === undefined || sex === null || sex === undefined) {
        throw new Error('All parameters (weight, height, age, sex) are required');
    }
    
    if (weight <= 0 || height <= 0 || age <= 0) {
        throw new Error('Weight, height, and age must be positive numbers');
    }
    
    if (sex !== 'male' && sex !== 'female') {
        throw new Error('Sex must be either "male" or "female"');
    }
    
    let bmr;
    if (sex === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    return Math.round(bmr);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {number} activityLevel - Activity multiplier (1.2-1.9)
 * @returns {number} TDEE in kcal/day
 */
function calculateTDEE(bmr, activityLevel) {
    if (bmr === null || bmr === undefined || activityLevel === null || activityLevel === undefined) {
        throw new Error('BMR and activity level are required');
    }
    
    if (bmr <= 0) {
        throw new Error('BMR must be a positive number');
    }
    
    if (activityLevel < 1.0 || activityLevel > 2.5) {
        throw new Error('Activity level must be between 1.0 and 2.5');
    }
    
    return Math.round(bmr * activityLevel);
}

/**
 * Calculate weight loss calorie targets
 * @param {number} tdee - Total Daily Energy Expenditure
 * @returns {object} Calorie targets for different weight loss rates
 */
function calculateWeightLossCalories(tdee) {
    if (!tdee || tdee <= 0) {
        throw new Error('TDEE must be a positive number');
    }
    
    return {
        loss05: Math.round(tdee - 250),  // 0.5 lb/week = 250 cal/day deficit
        loss10: Math.round(tdee - 500),  // 1 lb/week = 500 cal/day deficit
        loss15: Math.round(tdee - 750),  // 1.5 lb/week = 750 cal/day deficit
        loss20: Math.round(tdee - 1000)  // 2 lb/week = 1000 cal/day deficit
    };
}

/**
 * Calculate macronutrient breakdown
 * @param {number} dailyCalories - Daily calorie target
 * @param {object} macroPercentages - Macro split {protein: %, carbs: %, fat: %}
 * @returns {object} Macro breakdown with kcal and grams
 */
function calculateMacros(dailyCalories, macroPercentages = { protein: 35, carbs: 35, fat: 30 }) {
    if (!dailyCalories || dailyCalories <= 0) {
        throw new Error('Daily calories must be a positive number');
    }
    
    const { protein, carbs, fat } = macroPercentages;
    
    if (protein + carbs + fat !== 100) {
        throw new Error('Macro percentages must total 100%');
    }
    
    if (protein < 0 || carbs < 0 || fat < 0) {
        throw new Error('Macro percentages must be non-negative');
    }
    
    const proteinPercent = protein / 100;
    const carbsPercent = carbs / 100;
    const fatPercent = fat / 100;
    
    const proteinKcal = Math.round(dailyCalories * proteinPercent);
    const carbsKcal = Math.round(dailyCalories * carbsPercent);
    const fatKcal = Math.round(dailyCalories * fatPercent);
    
    const proteinGrams = Math.round(proteinKcal / 4);
    const carbsGrams = Math.round(carbsKcal / 4);
    const fatGrams = Math.round(fatKcal / 9);
    
    return {
        protein: { kcal: proteinKcal, grams: proteinGrams, percent: protein },
        carbs: { kcal: carbsKcal, grams: carbsGrams, percent: carbs },
        fat: { kcal: fatKcal, grams: fatGrams, percent: fat }
    };
}

/**
 * Calculate lean body mass from weight and body fat percentage
 * @param {number} weight - Weight in kilograms
 * @param {number} bodyFatPercent - Body fat percentage (5-50)
 * @returns {number} Lean body mass in kilograms
 */
function calculateLeanBodyMass(weight, bodyFatPercent) {
    if (!weight || weight <= 0) {
        throw new Error('Weight must be a positive number');
    }
    
    if (!bodyFatPercent || bodyFatPercent < 5 || bodyFatPercent > 50) {
        throw new Error('Body fat percentage must be between 5 and 50');
    }
    
    return weight * (1 - bodyFatPercent / 100);
}

/**
 * Calculate BMR using Katch-McArdle Formula
 * BMR = 370 + 21.6 × LBM (in kg)
 * 
 * @param {number} leanBodyMass - Lean body mass in kilograms
 * @returns {number} BMR in kcal/day
 */
function calculateKatchMcArdleBMR(leanBodyMass) {
    if (!leanBodyMass || leanBodyMass <= 0) {
        throw new Error('Lean body mass must be a positive number');
    }
    
    return Math.round(370 + 21.6 * leanBodyMass);
}

// Export for use in Node.js environment (tests)
/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convertFeetInchesToCm,
        convertStonesPoundsToKg,
        calculateBMR,
        calculateTDEE,
        calculateWeightLossCalories,
        calculateMacros,
        calculateLeanBodyMass,
        calculateKatchMcArdleBMR
    };
}
