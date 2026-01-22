// BMR Calculator using Mifflin-St Jeor Equation
// Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
// Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161

class MacroMonitor {
    constructor() {
        this.profile = null;
        this.init();
    }

    init() {
        this.loadProfile();
        this.setupEventListeners();
        this.setupUnitToggles();
    }

    setupUnitToggles() {
        // Height unit toggle
        const heightRadios = document.querySelectorAll('input[name="heightUnit"]');
        heightRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const heightCm = document.getElementById('heightCm');
                const heightFt = document.getElementById('heightFt');
                if (e.target.value === 'cm') {
                    heightCm.style.display = 'block';
                    heightFt.style.display = 'none';
                } else {
                    heightCm.style.display = 'none';
                    heightFt.style.display = 'block';
                }
            });
        });

        // Weight unit toggle
        const weightRadios = document.querySelectorAll('input[name="weightUnit"]');
        weightRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const weightKg = document.getElementById('weightKg');
                const weightSt = document.getElementById('weightSt');
                if (e.target.value === 'kg') {
                    weightKg.style.display = 'block';
                    weightSt.style.display = 'none';
                } else {
                    weightKg.style.display = 'none';
                    weightSt.style.display = 'block';
                }
            });
        });
    }

    setupEventListeners() {
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        document.getElementById('weightForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateResults();
        });

        document.getElementById('editProfile').addEventListener('click', () => {
            this.editProfile();
        });
    }

    // Conversion helpers
    convertHeightToCm() {
        const heightUnit = document.querySelector('input[name="heightUnit"]:checked').value;
        if (heightUnit === 'cm') {
            return parseFloat(document.getElementById('height').value);
        } else {
            const feet = parseFloat(document.getElementById('heightFeet').value) || 0;
            const inches = parseFloat(document.getElementById('heightInches').value) || 0;
            return (feet * 12 + inches) * 2.54;
        }
    }

    convertWeightToKg() {
        const weightUnit = document.querySelector('input[name="weightUnit"]:checked').value;
        if (weightUnit === 'kg') {
            return parseFloat(document.getElementById('weight').value);
        } else {
            const stones = parseFloat(document.getElementById('weightStones').value) || 0;
            const pounds = parseFloat(document.getElementById('weightPounds').value) || 0;
            return stones * 6.35029318 + pounds * 0.453592;
        }
    }

    saveProfile() {
        const heightCm = this.convertHeightToCm();
        
        if (!heightCm || heightCm <= 0) {
            alert('Please enter a valid height');
            return;
        }

        const profile = {
            sex: document.getElementById('sex').value,
            age: parseFloat(document.getElementById('age').value),
            height: heightCm,
            activityLevel: parseFloat(document.getElementById('activityLevel').value)
        };

        localStorage.setItem('userProfile', JSON.stringify(profile));
        this.profile = profile;

        // Show weight section, hide profile section
        document.getElementById('profileSection').style.display = 'none';
        document.getElementById('weightSection').style.display = 'block';
    }

    loadProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
            this.populateProfileForm();
            document.getElementById('profileSection').style.display = 'none';
            document.getElementById('weightSection').style.display = 'block';

            // Check if we have a saved weight
            const savedWeight = localStorage.getItem('currentWeight');
            if (savedWeight) {
                document.getElementById('weight').value = savedWeight;
                this.calculateResults();
            }
        }
    }

    populateProfileForm() {
        document.getElementById('sex').value = this.profile.sex;
        document.getElementById('age').value = this.profile.age;
        document.getElementById('height').value = this.profile.height;
        document.getElementById('activityLevel').value = this.profile.activityLevel;
    }

    editProfile() {
        document.getElementById('profileSection').style.display = 'block';
        document.getElementById('weightSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        this.populateProfileForm();
    }

    calculateBMR(weight) {
        const { sex, age, height } = this.profile;
        let bmr;

        if (sex === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        return Math.round(bmr);
    }

    calculateTDEE(bmr) {
        return Math.round(bmr * this.profile.activityLevel);
    }

    calculateWeightLossCalories(tdee) {
        // 1 pound = 3500 calories
        // Calculate daily calorie targets for different weight loss rates
        return {
            loss05: Math.round(tdee - 250),  // 0.5 lb/week = 250 cal/day deficit
            loss10: Math.round(tdee - 500),  // 1 lb/week = 500 cal/day deficit
            loss15: Math.round(tdee - 750),  // 1.5 lb/week = 750 cal/day deficit
            loss20: Math.round(tdee - 1000)  // 2 lb/week = 1000 cal/day deficit
        };
    }

    calculateMacros(dailyCalories) {
        // Macro split: 35% protein, 35% carbs, 30% fat
        // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
        
        const proteinKcal = Math.round(dailyCalories * 0.35);
        const carbsKcal = Math.round(dailyCalories * 0.35);
        const fatKcal = Math.round(dailyCalories * 0.30);

        const proteinGrams = Math.round(proteinKcal / 4);
        const carbsGrams = Math.round(carbsKcal / 4);
        const fatGrams = Math.round(fatKcal / 9);

        return {
            protein: { kcal: proteinKcal, grams: proteinGrams },
            carbs: { kcal: carbsKcal, grams: carbsGrams },
            fat: { kcal: fatKcal, grams: fatGrams }
        };
    }

    calculateResults() {
        const weight = this.convertWeightToKg();

        if (!weight || weight <= 0) {
            alert('Please enter a valid weight');
            return;
        }

        // Save current weight
        localStorage.setItem('currentWeight', weight);

        // Calculate BMR
        const bmr = this.calculateBMR(weight);

        // Calculate TDEE
        const tdee = this.calculateTDEE(bmr);

        // Calculate weight loss targets
        const weightLoss = this.calculateWeightLossCalories(tdee);

        // Calculate macros for 1.5 lb/week target
        const macros = this.calculateMacros(weightLoss.loss15);

        // Display results
        this.displayResults(bmr, tdee, weightLoss, macros);
    }

    displayResults(bmr, tdee, weightLoss, macros) {
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';

        // Display BMR and TDEE
        document.getElementById('bmrValue').textContent = `${bmr} kcal/day`;
        document.getElementById('tdeeValue').textContent = `${tdee} kcal/day`;

        // Display weight loss targets
        document.getElementById('loss05').textContent = `${weightLoss.loss05} kcal/day`;
        document.getElementById('loss10').textContent = `${weightLoss.loss10} kcal/day`;
        document.getElementById('loss15').innerHTML = `<strong>${weightLoss.loss15} kcal/day</strong>`;
        document.getElementById('loss20').textContent = `${weightLoss.loss20} kcal/day`;

        // Display macros
        document.getElementById('proteinKcal').textContent = `${macros.protein.kcal} kcal`;
        document.getElementById('proteinGrams').textContent = `${macros.protein.grams}g`;
        document.getElementById('carbsKcal').textContent = `${macros.carbs.kcal} kcal`;
        document.getElementById('carbsGrams').textContent = `${macros.carbs.grams}g`;
        document.getElementById('fatKcal').textContent = `${macros.fat.kcal} kcal`;
        document.getElementById('fatGrams').textContent = `${macros.fat.grams}g`;

        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MacroMonitor();
});
