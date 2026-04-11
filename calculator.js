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

/**
 * Calculate One Rep Max using Epley Formula
 * 1RM = Weight × (1 + Repetitions/30)
 * 
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions (1-10 for best accuracy)
 * @returns {number} Estimated one rep max
 */
function calculateEpleyOneRepMax(weight, reps) {
    if (!weight || weight <= 0) {
        throw new Error('Weight must be a positive number');
    }
    
    if (!reps || reps < 1 || reps > 10) {
        throw new Error('Repetitions must be between 1 and 10 for accurate results');
    }
    
    if (reps === 1) {
        return weight;
    }
    
    return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate One Rep Max using Brzycki Formula
 * 1RM = Weight × 36/(37 – Repetitions)
 * 
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions (1-10 for best accuracy)
 * @returns {number} Estimated one rep max
 */
function calculateBrzyckiOneRepMax(weight, reps) {
    if (!weight || weight <= 0) {
        throw new Error('Weight must be a positive number');
    }
    
    if (!reps || reps < 1 || reps > 10) {
        throw new Error('Repetitions must be between 1 and 10 for accurate results');
    }
    
    if (reps === 1) {
        return weight;
    }
    
    return Math.round(weight * 36 / (37 - reps));
}

/**
 * Calculate One Rep Max using Lombardi Formula
 * 1RM = Weight × Repetitions^0.10
 * 
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions (1-10 for best accuracy)
 * @returns {number} Estimated one rep max
 */
function calculateLombardiOneRepMax(weight, reps) {
    if (!weight || weight <= 0) {
        throw new Error('Weight must be a positive number');
    }
    
    if (!reps || reps < 1 || reps > 10) {
        throw new Error('Repetitions must be between 1 and 10 for accurate results');
    }
    
    if (reps === 1) {
        return weight;
    }
    
    return Math.round(weight * Math.pow(reps, 0.10));
}

/**
 * Calculate all three One Rep Max formulas and return average
 * 
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions (1-10 for best accuracy)
 * @returns {object} Object containing all three formula results and average
 */
function calculateAllOneRepMax(weight, reps) {
    const epley = calculateEpleyOneRepMax(weight, reps);
    const brzycki = calculateBrzyckiOneRepMax(weight, reps);
    const lombardi = calculateLombardiOneRepMax(weight, reps);
    const average = Math.round((epley + brzycki + lombardi) / 3);
    
    return {
        epley,
        brzycki,
        lombardi,
        average
    };
}

/**
 * Reverse Epley Formula - Calculate weight needed for target 1RM
 * Weight = 1RM / (1 + Reps/30)
 * 
 * @param {number} targetOneRepMax - Target one rep max
 * @param {number} reps - Number of repetitions (1-10)
 * @returns {number} Weight needed to achieve target 1RM
 */
function reverseEpleyFormula(targetOneRepMax, reps) {
    if (!targetOneRepMax || targetOneRepMax <= 0) {
        throw new Error('Target 1RM must be a positive number');
    }
    
    if (!reps || reps < 1 || reps > 10) {
        throw new Error('Repetitions must be between 1 and 10');
    }
    
    if (reps === 1) {
        return targetOneRepMax;
    }
    
    return targetOneRepMax / (1 + reps / 30);
}

/**
 * Reverse Brzycki Formula - Calculate weight needed for target 1RM
 * Weight = 1RM × (37 - Reps)/36
 * 
 * @param {number} targetOneRepMax - Target one rep max
 * @param {number} reps - Number of repetitions (1-10)
 * @returns {number} Weight needed to achieve target 1RM
 */
function reverseBrzyckiFormula(targetOneRepMax, reps) {
    if (!targetOneRepMax || targetOneRepMax <= 0) {
        throw new Error('Target 1RM must be a positive number');
    }
    
    if (!reps || reps < 1 || reps > 10) {
        throw new Error('Repetitions must be between 1 and 10');
    }
    
    if (reps === 1) {
        return targetOneRepMax;
    }
    
    return targetOneRepMax * (37 - reps) / 36;
}

/**
 * Reverse Lombardi Formula - Calculate weight needed for target 1RM
 * Weight = 1RM / Reps^0.10
 * 
 * @param {number} targetOneRepMax - Target one rep max
 * @param {number} reps - Number of repetitions (1-10)
 * @returns {number} Weight needed to achieve target 1RM
 */
function reverseLombardiFormula(targetOneRepMax, reps) {
    if (!targetOneRepMax || targetOneRepMax <= 0) {
        throw new Error('Target 1RM must be a positive number');
    }
    
    if (!reps || reps < 1 || reps > 10) {
        throw new Error('Repetitions must be between 1 and 10');
    }
    
    if (reps === 1) {
        return targetOneRepMax;
    }
    
    return targetOneRepMax / Math.pow(reps, 0.10);
}

/**
 * Round weight to achievable gym plate combinations
 * Standard gym plates: 1.25kg, 2.5kg, 5kg, 10kg, 15kg, 20kg, 25kg
 * Since plates are added in pairs, the smallest increment is 2.5kg (pair of 1.25kg)
 * 
 * @param {number} weight - Weight to round
 * @returns {number} Weight rounded to nearest 2.5kg
 */
function roundToGymWeight(weight) {
    return Math.round(weight / 2.5) * 2.5;
}

/**
 * Calculate average weight needed for target 1RM across all three formulas
 * Rounded to achievable gym weight (nearest 2.5kg)
 * 
 * @param {number} targetOneRepMax - Target one rep max
 * @param {number} reps - Number of repetitions (1-10)
 * @returns {number} Average weight needed, rounded to gym plates
 */
function calculateWeightForTarget1RM(targetOneRepMax, reps) {
    const epley = reverseEpleyFormula(targetOneRepMax, reps);
    const brzycki = reverseBrzyckiFormula(targetOneRepMax, reps);
    const lombardi = reverseLombardiFormula(targetOneRepMax, reps);
    
    const average = (epley + brzycki + lombardi) / 3;
    return roundToGymWeight(average);
}

/**
 * Generate a table of weights for different rep counts to achieve target 1RM
 * 
 * @param {number} targetOneRepMax - Target one rep max
 * @param {number} minReps - Minimum reps (default 1)
 * @param {number} maxReps - Maximum reps (default 10)
 * @returns {Array} Array of objects with reps and weight
 */
function generateTargetWeightTable(targetOneRepMax, minReps = 1, maxReps = 10) {
    if (!targetOneRepMax || targetOneRepMax <= 0) {
        throw new Error('Target 1RM must be a positive number');
    }
    
    const table = [];
    for (let reps = minReps; reps <= maxReps; reps++) {
        table.push({
            reps: reps,
            weight: calculateWeightForTarget1RM(targetOneRepMax, reps)
        });
    }
    
    return table;
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
        calculateKatchMcArdleBMR,
        calculateEpleyOneRepMax,
        calculateBrzyckiOneRepMax,
        calculateLombardiOneRepMax,
        calculateAllOneRepMax,
        reverseEpleyFormula,
        reverseBrzyckiFormula,
        reverseLombardiFormula,
        roundToGymWeight,
        calculateWeightForTarget1RM,
        generateTargetWeightTable
    };
}
