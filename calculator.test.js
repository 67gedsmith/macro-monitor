const {
    convertFeetInchesToCm,
    convertStonesPoundsToKg,
    calculateBMR,
    calculateTDEE,
    calculateWeightLossCalories,
    calculateMacros,
    calculateLeanBodyMass,
    calculateKatchMcArdleBMR
} = require('./calculator');

describe('Unit Conversion Functions', () => {
    describe('convertFeetInchesToCm', () => {
        test('converts 5 feet 10 inches to centimeters correctly', () => {
            expect(convertFeetInchesToCm(5, 10)).toBeCloseTo(177.8, 1);
        });

        test('converts 6 feet 0 inches to centimeters correctly', () => {
            expect(convertFeetInchesToCm(6, 0)).toBeCloseTo(182.88, 1);
        });

        test('converts 5 feet 5 inches to centimeters correctly', () => {
            expect(convertFeetInchesToCm(5, 5)).toBeCloseTo(165.1, 1);
        });

        test('handles zero feet', () => {
            expect(convertFeetInchesToCm(0, 10)).toBeCloseTo(25.4, 1);
        });

        test('handles zero inches', () => {
            expect(convertFeetInchesToCm(5, 0)).toBeCloseTo(152.4, 1);
        });
    });

    describe('convertStonesPoundsToKg', () => {
        test('converts 10 stones 0 pounds to kilograms correctly', () => {
            expect(convertStonesPoundsToKg(10, 0)).toBeCloseTo(63.5, 1);
        });

        test('converts 12 stones 8 pounds to kilograms correctly', () => {
            expect(convertStonesPoundsToKg(12, 8)).toBeCloseTo(79.8, 1);
        });

        test('converts 0 stones 150 pounds to kilograms correctly', () => {
            expect(convertStonesPoundsToKg(0, 150)).toBeCloseTo(68.0, 1);
        });

        test('handles zero stones and pounds', () => {
            expect(convertStonesPoundsToKg(0, 0)).toBe(0);
        });
    });
});

describe('BMR Calculation (Mifflin-St Jeor)', () => {
    describe('calculateBMR for males', () => {
        test('calculates BMR for 30-year-old male, 80kg, 180cm', () => {
            const bmr = calculateBMR(80, 180, 30, 'male');
            expect(bmr).toBe(1780);
        });

        test('calculates BMR for 25-year-old male, 70kg, 175cm', () => {
            const bmr = calculateBMR(70, 175, 25, 'male');
            expect(bmr).toBe(1674);
        });

        test('calculates BMR for 40-year-old male, 90kg, 185cm', () => {
            const bmr = calculateBMR(90, 185, 40, 'male');
            expect(bmr).toBe(1861);
        });
    });

    describe('calculateBMR for females', () => {
        test('calculates BMR for 30-year-old female, 60kg, 165cm', () => {
            const bmr = calculateBMR(60, 165, 30, 'female');
            expect(bmr).toBe(1320);
        });

        test('calculates BMR for 25-year-old female, 55kg, 160cm', () => {
            const bmr = calculateBMR(55, 160, 25, 'female');
            expect(bmr).toBe(1264);
        });

        test('calculates BMR for 40-year-old female, 70kg, 170cm', () => {
            const bmr = calculateBMR(70, 170, 40, 'female');
            expect(bmr).toBe(1402);
        });
    });

    describe('calculateBMR validation', () => {
        test('throws error when weight is missing', () => {
            expect(() => calculateBMR(null, 180, 30, 'male')).toThrow('All parameters');
        });

        test('throws error when height is missing', () => {
            expect(() => calculateBMR(80, null, 30, 'male')).toThrow('All parameters');
        });

        test('throws error when age is missing', () => {
            expect(() => calculateBMR(80, 180, null, 'male')).toThrow('All parameters');
        });

        test('throws error when sex is missing', () => {
            expect(() => calculateBMR(80, 180, 30, null)).toThrow('All parameters');
        });

        test('throws error when weight is zero', () => {
            expect(() => calculateBMR(0, 180, 30, 'male')).toThrow('must be positive');
        });

        test('throws error when weight is negative', () => {
            expect(() => calculateBMR(-5, 180, 30, 'male')).toThrow('must be positive');
        });

        test('throws error when height is negative', () => {
            expect(() => calculateBMR(80, -180, 30, 'male')).toThrow('must be positive');
        });

        test('throws error when age is negative', () => {
            expect(() => calculateBMR(80, 180, -30, 'male')).toThrow('must be positive');
        });

        test('throws error when sex is invalid', () => {
            expect(() => calculateBMR(80, 180, 30, 'other')).toThrow('must be either');
        });
    });
});

describe('TDEE Calculation', () => {
    describe('calculateTDEE with various activity levels', () => {
        test('calculates TDEE for sedentary (1.2)', () => {
            const tdee = calculateTDEE(1780, 1.2);
            expect(tdee).toBe(2136);
        });

        test('calculates TDEE for light activity (1.375)', () => {
            const tdee = calculateTDEE(1780, 1.375);
            expect(tdee).toBe(2448);
        });

        test('calculates TDEE for moderate activity (1.55)', () => {
            const tdee = calculateTDEE(1780, 1.55);
            expect(tdee).toBe(2759);
        });

        test('calculates TDEE for very active (1.725)', () => {
            const tdee = calculateTDEE(1780, 1.725);
            expect(tdee).toBe(3071);
        });

        test('calculates TDEE for extremely active (1.9)', () => {
            const tdee = calculateTDEE(1780, 1.9);
            expect(tdee).toBe(3382);
        });
    });

    describe('calculateTDEE validation', () => {
        test('throws error when BMR is missing', () => {
            expect(() => calculateTDEE(null, 1.5)).toThrow('BMR and activity level are required');
        });

        test('throws error when activity level is missing', () => {
            expect(() => calculateTDEE(1780, null)).toThrow('BMR and activity level are required');
        });

        test('throws error when BMR is zero', () => {
            expect(() => calculateTDEE(0, 1.5)).toThrow('BMR must be a positive number');
        });

        test('throws error when BMR is negative', () => {
            expect(() => calculateTDEE(-1780, 1.5)).toThrow('BMR must be a positive number');
        });

        test('throws error when activity level is too low', () => {
            expect(() => calculateTDEE(1780, 0.5)).toThrow('Activity level must be between');
        });

        test('throws error when activity level is too high', () => {
            expect(() => calculateTDEE(1780, 3.0)).toThrow('Activity level must be between');
        });
    });
});

describe('Weight Loss Calorie Targets', () => {
    describe('calculateWeightLossCalories', () => {
        test('calculates weight loss targets for TDEE of 2500', () => {
            const targets = calculateWeightLossCalories(2500);
            expect(targets.loss05).toBe(2250); // -250 cal/day
            expect(targets.loss10).toBe(2000); // -500 cal/day
            expect(targets.loss15).toBe(1750); // -750 cal/day
            expect(targets.loss20).toBe(1500); // -1000 cal/day
        });

        test('calculates weight loss targets for TDEE of 3000', () => {
            const targets = calculateWeightLossCalories(3000);
            expect(targets.loss05).toBe(2750);
            expect(targets.loss10).toBe(2500);
            expect(targets.loss15).toBe(2250);
            expect(targets.loss20).toBe(2000);
        });

        test('calculates weight loss targets for TDEE of 2000', () => {
            const targets = calculateWeightLossCalories(2000);
            expect(targets.loss05).toBe(1750);
            expect(targets.loss10).toBe(1500);
            expect(targets.loss15).toBe(1250);
            expect(targets.loss20).toBe(1000);
        });
    });

    describe('calculateWeightLossCalories validation', () => {
        test('throws error when TDEE is missing', () => {
            expect(() => calculateWeightLossCalories(null)).toThrow('TDEE must be a positive number');
        });

        test('throws error when TDEE is zero', () => {
            expect(() => calculateWeightLossCalories(0)).toThrow('TDEE must be a positive number');
        });

        test('throws error when TDEE is negative', () => {
            expect(() => calculateWeightLossCalories(-2500)).toThrow('TDEE must be a positive number');
        });
    });
});

describe('Macro Calculations', () => {
    describe('calculateMacros with default percentages', () => {
        test('calculates macros for 2000 calories (35/35/30 split)', () => {
            const macros = calculateMacros(2000);
            expect(macros.protein.percent).toBe(35);
            expect(macros.protein.kcal).toBe(700);
            expect(macros.protein.grams).toBe(175);
            
            expect(macros.carbs.percent).toBe(35);
            expect(macros.carbs.kcal).toBe(700);
            expect(macros.carbs.grams).toBe(175);
            
            expect(macros.fat.percent).toBe(30);
            expect(macros.fat.kcal).toBe(600);
            expect(macros.fat.grams).toBe(67);
        });

        test('calculates macros for 2500 calories (35/35/30 split)', () => {
            const macros = calculateMacros(2500);
            expect(macros.protein.percent).toBe(35);
            expect(macros.protein.kcal).toBe(875);
            expect(macros.protein.grams).toBe(219);
            
            expect(macros.carbs.percent).toBe(35);
            expect(macros.carbs.kcal).toBe(875);
            expect(macros.carbs.grams).toBe(219);
            
            expect(macros.fat.percent).toBe(30);
            expect(macros.fat.kcal).toBe(750);
            expect(macros.fat.grams).toBe(83);
        });
    });

    describe('calculateMacros with custom percentages', () => {
        test('calculates macros for 2000 calories with 40/30/30 split', () => {
            const macros = calculateMacros(2000, { protein: 40, carbs: 30, fat: 30 });
            expect(macros.protein.percent).toBe(40);
            expect(macros.protein.kcal).toBe(800);
            expect(macros.protein.grams).toBe(200);
            
            expect(macros.carbs.percent).toBe(30);
            expect(macros.carbs.kcal).toBe(600);
            expect(macros.carbs.grams).toBe(150);
            
            expect(macros.fat.percent).toBe(30);
            expect(macros.fat.kcal).toBe(600);
            expect(macros.fat.grams).toBe(67);
        });

        test('calculates macros for 2000 calories with 30/40/30 split', () => {
            const macros = calculateMacros(2000, { protein: 30, carbs: 40, fat: 30 });
            expect(macros.protein.percent).toBe(30);
            expect(macros.protein.kcal).toBe(600);
            expect(macros.protein.grams).toBe(150);
            
            expect(macros.carbs.percent).toBe(40);
            expect(macros.carbs.kcal).toBe(800);
            expect(macros.carbs.grams).toBe(200);
            
            expect(macros.fat.percent).toBe(30);
            expect(macros.fat.kcal).toBe(600);
            expect(macros.fat.grams).toBe(67);
        });

        test('calculates macros for 2200 calories with 25/45/30 split', () => {
            const macros = calculateMacros(2200, { protein: 25, carbs: 45, fat: 30 });
            expect(macros.protein.percent).toBe(25);
            expect(macros.protein.kcal).toBe(550);
            expect(macros.protein.grams).toBe(138);
            
            expect(macros.carbs.percent).toBe(45);
            expect(macros.carbs.kcal).toBe(990);
            expect(macros.carbs.grams).toBe(248);
            
            expect(macros.fat.percent).toBe(30);
            expect(macros.fat.kcal).toBe(660);
            expect(macros.fat.grams).toBe(73);
        });
    });

    describe('calculateMacros validation', () => {
        test('throws error when daily calories is missing', () => {
            expect(() => calculateMacros(null)).toThrow('Daily calories must be a positive number');
        });

        test('throws error when daily calories is zero', () => {
            expect(() => calculateMacros(0)).toThrow('Daily calories must be a positive number');
        });

        test('throws error when daily calories is negative', () => {
            expect(() => calculateMacros(-2000)).toThrow('Daily calories must be a positive number');
        });

        test('throws error when macro percentages do not total 100', () => {
            expect(() => calculateMacros(2000, { protein: 30, carbs: 30, fat: 30 }))
                .toThrow('Macro percentages must total 100%');
        });

        test('throws error when macro percentages total more than 100', () => {
            expect(() => calculateMacros(2000, { protein: 40, carbs: 40, fat: 40 }))
                .toThrow('Macro percentages must total 100%');
        });

        test('throws error when protein percentage is negative', () => {
            expect(() => calculateMacros(2000, { protein: -10, carbs: 60, fat: 50 }))
                .toThrow('Macro percentages must be non-negative');
        });

        test('throws error when carbs percentage is negative', () => {
            expect(() => calculateMacros(2000, { protein: 40, carbs: -10, fat: 70 }))
                .toThrow('Macro percentages must be non-negative');
        });

        test('throws error when fat percentage is negative', () => {
            expect(() => calculateMacros(2000, { protein: 50, carbs: 60, fat: -10 }))
                .toThrow('Macro percentages must be non-negative');
        });
    });
});

describe('Katch-McArdle Formula', () => {
    describe('calculateLeanBodyMass', () => {
        test('calculates lean body mass for 80kg at 15% body fat', () => {
            const lbm = calculateLeanBodyMass(80, 15);
            expect(lbm).toBeCloseTo(68, 1);
        });

        test('calculates lean body mass for 70kg at 20% body fat', () => {
            const lbm = calculateLeanBodyMass(70, 20);
            expect(lbm).toBeCloseTo(56, 1);
        });

        test('calculates lean body mass for 60kg at 25% body fat', () => {
            const lbm = calculateLeanBodyMass(60, 25);
            expect(lbm).toBeCloseTo(45, 1);
        });

        test('calculates lean body mass for 90kg at 10% body fat', () => {
            const lbm = calculateLeanBodyMass(90, 10);
            expect(lbm).toBeCloseTo(81, 1);
        });
    });

    describe('calculateLeanBodyMass validation', () => {
        test('throws error when weight is missing', () => {
            expect(() => calculateLeanBodyMass(null, 15)).toThrow('Weight must be a positive number');
        });

        test('throws error when weight is zero', () => {
            expect(() => calculateLeanBodyMass(0, 15)).toThrow('Weight must be a positive number');
        });

        test('throws error when weight is negative', () => {
            expect(() => calculateLeanBodyMass(-80, 15)).toThrow('Weight must be a positive number');
        });

        test('throws error when body fat percentage is missing', () => {
            expect(() => calculateLeanBodyMass(80, null)).toThrow('Body fat percentage must be between 5 and 50');
        });

        test('throws error when body fat percentage is too low', () => {
            expect(() => calculateLeanBodyMass(80, 3)).toThrow('Body fat percentage must be between 5 and 50');
        });

        test('throws error when body fat percentage is too high', () => {
            expect(() => calculateLeanBodyMass(80, 55)).toThrow('Body fat percentage must be between 5 and 50');
        });
    });

    describe('calculateKatchMcArdleBMR', () => {
        test('calculates BMR for 68kg lean body mass', () => {
            const bmr = calculateKatchMcArdleBMR(68);
            expect(bmr).toBe(1839);
        });

        test('calculates BMR for 56kg lean body mass', () => {
            const bmr = calculateKatchMcArdleBMR(56);
            expect(bmr).toBe(1580);
        });

        test('calculates BMR for 45kg lean body mass', () => {
            const bmr = calculateKatchMcArdleBMR(45);
            expect(bmr).toBe(1342);
        });

        test('calculates BMR for 81kg lean body mass', () => {
            const bmr = calculateKatchMcArdleBMR(81);
            expect(bmr).toBe(2120);
        });
    });

    describe('calculateKatchMcArdleBMR validation', () => {
        test('throws error when lean body mass is missing', () => {
            expect(() => calculateKatchMcArdleBMR(null)).toThrow('Lean body mass must be a positive number');
        });

        test('throws error when lean body mass is zero', () => {
            expect(() => calculateKatchMcArdleBMR(0)).toThrow('Lean body mass must be a positive number');
        });

        test('throws error when lean body mass is negative', () => {
            expect(() => calculateKatchMcArdleBMR(-68)).toThrow('Lean body mass must be a positive number');
        });
    });
});

describe('Integration Tests - Complete Workflows', () => {
    describe('Complete BMR/TDEE/Macro calculation for male', () => {
        test('complete workflow for 30yo male, 80kg, 180cm, moderate activity', () => {
            // Step 1: Calculate BMR
            const bmr = calculateBMR(80, 180, 30, 'male');
            expect(bmr).toBe(1780);

            // Step 2: Calculate TDEE
            const tdee = calculateTDEE(bmr, 1.55);
            expect(tdee).toBe(2759);

            // Step 3: Calculate weight loss targets
            const targets = calculateWeightLossCalories(tdee);
            expect(targets.loss15).toBe(2009);

            // Step 4: Calculate macros for 1.5lb/week target
            const macros = calculateMacros(targets.loss15);
            expect(macros.protein.grams).toBe(176);
            expect(macros.carbs.grams).toBe(176);
            expect(macros.fat.grams).toBe(67);
        });
    });

    describe('Complete BMR/TDEE/Macro calculation for female', () => {
        test('complete workflow for 28yo female, 60kg, 165cm, light activity', () => {
            // Step 1: Calculate BMR
            const bmr = calculateBMR(60, 165, 28, 'female');
            expect(bmr).toBe(1330);

            // Step 2: Calculate TDEE
            const tdee = calculateTDEE(bmr, 1.375);
            expect(tdee).toBe(1829);

            // Step 3: Calculate weight loss targets
            const targets = calculateWeightLossCalories(tdee);
            expect(targets.loss10).toBe(1329);

            // Step 4: Calculate macros for 1lb/week target
            const macros = calculateMacros(targets.loss10);
            expect(macros.protein.grams).toBe(116);
            expect(macros.carbs.grams).toBe(116);
            expect(macros.fat.grams).toBe(44);
        });
    });

    describe('Complete Katch-McArdle workflow', () => {
        test('complete Katch-McArdle workflow for 80kg male at 15% body fat', () => {
            // Step 1: Calculate lean body mass
            const lbm = calculateLeanBodyMass(80, 15);
            expect(lbm).toBeCloseTo(68, 1);

            // Step 2: Calculate BMR using Katch-McArdle
            const bmr = calculateKatchMcArdleBMR(lbm);
            expect(bmr).toBe(1839);

            // Step 3: Calculate TDEE
            const tdee = calculateTDEE(bmr, 1.55);
            expect(tdee).toBe(2850);

            // Step 4: Calculate weight loss targets
            const targets = calculateWeightLossCalories(tdee);
            expect(targets.loss15).toBe(2100);

            // Step 5: Calculate macros
            const macros = calculateMacros(targets.loss15, { protein: 40, carbs: 30, fat: 30 });
            expect(macros.protein.grams).toBe(210);
            expect(macros.carbs.grams).toBe(158);
            expect(macros.fat.grams).toBe(70);
        });
    });

    describe('Unit conversion integration', () => {
        test('complete workflow with imperial units for height and weight', () => {
            // Convert height from feet/inches to cm
            const heightCm = convertFeetInchesToCm(5, 10);
            expect(heightCm).toBeCloseTo(177.8, 1);

            // Convert weight from stones/pounds to kg
            const weightKg = convertStonesPoundsToKg(12, 8);
            expect(weightKg).toBeCloseTo(79.8, 1);

            // Calculate BMR with converted values
            const bmr = calculateBMR(weightKg, heightCm, 35, 'male');
            expect(bmr).toBeGreaterThan(1700);
            expect(bmr).toBeLessThan(1800);
        });
    });
});

describe('Edge Cases and Boundary Tests', () => {
    test('handles very young age (18)', () => {
        const bmr = calculateBMR(70, 175, 18, 'male');
        expect(bmr).toBeGreaterThan(1700);
    });

    test('handles older age (65)', () => {
        const bmr = calculateBMR(70, 175, 65, 'male');
        expect(bmr).toBeGreaterThan(1400);
    });

    test('handles very lightweight person', () => {
        const bmr = calculateBMR(45, 150, 25, 'female');
        expect(bmr).toBeGreaterThan(1000);
    });

    test('handles heavyweight person', () => {
        const bmr = calculateBMR(120, 190, 30, 'male');
        expect(bmr).toBeGreaterThan(2200);
    });

    test('handles minimum activity level', () => {
        const tdee = calculateTDEE(1500, 1.0);
        expect(tdee).toBe(1500);
    });

    test('handles maximum realistic activity level', () => {
        const tdee = calculateTDEE(1500, 2.0);
        expect(tdee).toBe(3000);
    });

    test('handles extreme macro splits', () => {
        const macros1 = calculateMacros(2000, { protein: 50, carbs: 30, fat: 20 });
        expect(macros1.protein.grams).toBe(250);
        
        const macros2 = calculateMacros(2000, { protein: 20, carbs: 50, fat: 30 });
        expect(macros2.carbs.grams).toBe(250);
    });

    test('handles low body fat percentage (5%)', () => {
        const lbm = calculateLeanBodyMass(70, 5);
        expect(lbm).toBeCloseTo(66.5, 1);
    });

    test('handles high body fat percentage (50%)', () => {
        const lbm = calculateLeanBodyMass(100, 50);
        expect(lbm).toBeCloseTo(50, 1);
    });
});
