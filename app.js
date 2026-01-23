// BMR Calculator using Mifflin-St Jeor Equation
// Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
// Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161

class MacroMonitor {
    constructor() {
        this.users = {};
        this.currentUserId = null;
        this.init();
    }

    init() {
        this.loadUsers();
        this.setupUnitToggles();
        this.setupEventListeners();
        this.updateUserDropdown();
        this.checkUserSelection();
        
        // Setup input handlers last with delay to ensure DOM is ready
        setTimeout(() => {
            this.setupInputFieldHandlers();
        }, 100);
        
        // Force all inputs to be interactive on page load
        setTimeout(() => {
            const allInputs = document.querySelectorAll('input[type="text"], input[type="number"]');
            allInputs.forEach(input => {
                input.disabled = false;
                input.readOnly = false;
                input.removeAttribute('disabled');
                input.removeAttribute('readonly');
            });
        }, 100);
    }

    setupUnitToggles() {
        // Height unit toggle
        const heightRadios = document.querySelectorAll('input[name="heightUnit"]');
        const heightCm = document.getElementById('heightCm');
        const heightFt = document.getElementById('heightFt');
        
        heightRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'cm') {
                    heightCm.style.display = 'block';
                    heightFt.style.display = 'none';
                } else {
                    heightCm.style.display = 'none';
                    heightFt.style.display = 'block';
                }
            });
            
            // Also add click listener as backup
            radio.addEventListener('click', function() {
                if (this.value === 'cm') {
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
        const weightKg = document.getElementById('weightKg');
        const weightSt = document.getElementById('weightSt');
        
        weightRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'kg') {
                    weightKg.style.display = 'block';
                    weightSt.style.display = 'none';
                } else {
                    weightKg.style.display = 'none';
                    weightSt.style.display = 'block';
                }
            });
            
            // Also add click listener as backup
            radio.addEventListener('click', function() {
                if (this.value === 'kg') {
                    weightKg.style.display = 'block';
                    weightSt.style.display = 'none';
                } else {
                    weightKg.style.display = 'none';
                    weightSt.style.display = 'block';
                }
            });
        });
    }

    setupInputFieldHandlers() {
        // Use IPC to tell main process to blur/focus the window at OS level
        try {
            const { ipcRenderer } = require('electron');
            if (ipcRenderer) {
                ipcRenderer.send('wake-input');
            }
        } catch (e) {
            // Silently fail if IPC not available
        }
        
        // Just make sure fields are enabled
        ['userName', 'age', 'height', 'heightFeet', 'heightInches'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = false;
                field.readOnly = false;
                
                field.addEventListener('focus', () => {
                    field.style.outline = '2px solid #667eea';
                    field.style.boxShadow = '0 0 5px rgba(102, 126, 234, 0.5)';
                    field.style.border = '2px solid #667eea';
                });
                
                field.addEventListener('blur', () => {
                    field.style.outline = '';
                    field.style.boxShadow = '';
                    field.style.border = '2px solid #ddd';
                });
            }
        });
    }

    setupEventListeners() {
        document.getElementById('userSelect').addEventListener('change', (e) => {
            this.handleUserSelect(e.target.value);
        });

        document.getElementById('deleteUserBtn').addEventListener('click', () => {
            this.deleteCurrentUser();
        });

        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
        
        // Force enable all inputs when clicked
        document.getElementById('profileForm').addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') {
                e.target.disabled = false;
                e.target.readOnly = false;
                e.target.focus();
            }
        });

        document.getElementById('weightForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateResults();
        });

        document.getElementById('editProfile').addEventListener('click', () => {
            this.editProfile();
        });

        document.getElementById('customizeMacrosBtn').addEventListener('click', () => {
            this.showMacroCustomization();
        });

        document.getElementById('saveMacrosBtn').addEventListener('click', () => {
            this.saveMacroPercentages();
        });

        document.getElementById('cancelMacrosBtn').addEventListener('click', () => {
            this.hideMacroCustomization();
        });

        document.getElementById('backToWeightBtn').addEventListener('click', () => {
            this.backToWeightEntry();
        });

        // Update total when macro percentages change
        ['proteinPercent', 'carbsPercent', 'fatPercent'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateMacroTotal();
            });
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

    // User Management Methods
    loadUsers() {
        const savedUsers = localStorage.getItem('macroMonitorUsers');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }
        
        const savedCurrentUser = localStorage.getItem('macroMonitorCurrentUser');
        if (savedCurrentUser) {
            this.currentUserId = savedCurrentUser;
        }
    }

    saveUsers() {
        localStorage.setItem('macroMonitorUsers', JSON.stringify(this.users));
        if (this.currentUserId) {
            localStorage.setItem('macroMonitorCurrentUser', this.currentUserId);
        }
    }

    updateUserDropdown() {
        const select = document.getElementById('userSelect');
        select.innerHTML = '<option value="">-- Create New User --</option>';
        
        Object.keys(this.users).forEach(userId => {
            const user = this.users[userId];
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = user.name;
            if (userId === this.currentUserId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    checkUserSelection() {
        if (this.currentUserId && this.users[this.currentUserId]) {
            document.getElementById('userSelectionSection').style.display = 'none';
            document.getElementById('profileSection').style.display = 'none';
            document.getElementById('weightSection').style.display = 'block';
            document.getElementById('deleteUserBtn').style.display = 'inline-block';
            
            // Load saved weight if available
            const user = this.users[this.currentUserId];
            if (user.weight) {
                document.getElementById('weight').value = user.weight;
                this.calculateResults();
            }
        } else {
            document.getElementById('userSelectionSection').style.display = 'block';
            document.getElementById('profileSection').style.display = 'block';
            document.getElementById('weightSection').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'none';
            document.getElementById('deleteUserBtn').style.display = 'none';
        }
    }

    handleUserSelect(userId) {
        if (!userId) {
            // Create new user
            this.currentUserId = null;
            
            // Show the sections needed for creating a new user
            document.getElementById('userSelectionSection').style.display = 'block';
            document.getElementById('profileSection').style.display = 'block';
            document.getElementById('weightSection').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'none';
            document.getElementById('deleteUserBtn').style.display = 'none';
            
            // Force a reflow to ensure inputs are rendered properly
            const profileSection = document.getElementById('profileSection');
            profileSection.style.display = 'none';
            profileSection.offsetHeight; // Force reflow
            profileSection.style.display = 'block';
            
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                this.clearProfileForm();
                
                // Reset radio buttons to defaults
                document.getElementById('heightCm').style.display = 'block';
                document.getElementById('heightFt').style.display = 'none';
                
                // Re-setup input handlers for new user
                this.setupInputFieldHandlers();
                
                // Force window blur/focus cycle to initialize Electron input handling
                setTimeout(() => {
                    window.blur();
                    setTimeout(() => {
                        window.focus();
                        document.getElementById('userName')?.focus();
                    }, 50);
                }, 50);
                
                // Explicitly enable the first field
                const userName = document.getElementById('userName');
                userName.disabled = false;
                userName.readOnly = false;
                userName.tabIndex = 0;
                userName.focus();
            }, 100);
        } else {
            // Load existing user
            this.currentUserId = userId;
            this.saveUsers();
            this.checkUserSelection();
        }
    }

    deleteCurrentUser() {
        if (!this.currentUserId) return;
        
        const user = this.users[this.currentUserId];
        if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            delete this.users[this.currentUserId];
            this.currentUserId = null;
            this.saveUsers();
            localStorage.removeItem('macroMonitorCurrentUser');
            
            // Show the sections needed for creating a new user FIRST
            document.getElementById('userSelectionSection').style.display = 'block';
            document.getElementById('profileSection').style.display = 'block';
            document.getElementById('weightSection').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'none';
            document.getElementById('deleteUserBtn').style.display = 'none';
            
            // Update dropdown after showing sections
            this.updateUserDropdown();
            
            // Clear form fields
            this.clearProfileForm();
            
            // Reset radio buttons to defaults
            document.querySelector('input[name="heightUnit"][value="cm"]').checked = true;
            document.querySelector('input[name="weightUnit"][value="kg"]').checked = true;
            
            // Reset input boxes to default display
            document.getElementById('heightCm').style.display = 'block';
            document.getElementById('heightFt').style.display = 'none';
            document.getElementById('weightKg').style.display = 'block';
            document.getElementById('weightSt').style.display = 'none';
            
            // Reset weight fields
            document.getElementById('weight').value = '';
            document.getElementById('weightStones').value = '';
            document.getElementById('weightPounds').value = '';
            
            // Re-setup input handlers after deletion with delay
            setTimeout(() => {
                this.setupInputFieldHandlers();
                // Force window blur/focus cycle to initialize Electron input handling
                setTimeout(() => {
                    window.blur();
                    setTimeout(() => {
                        window.focus();
                        document.getElementById('userName')?.focus();
                    }, 50);
                }, 50);
            }, 100);
        }
    }

    clearProfileForm() {
        // Get all input elements
        const userName = document.getElementById('userName');
        const age = document.getElementById('age');
        const sex = document.getElementById('sex');
        const height = document.getElementById('height');
        const heightFeet = document.getElementById('heightFeet');
        const heightInches = document.getElementById('heightInches');
        const activityLevel = document.getElementById('activityLevel');
        const profileForm = document.getElementById('profileForm');
        
        // Ensure form is enabled
        if (profileForm) {
            profileForm.disabled = false;
            profileForm.removeAttribute('disabled');
        }
        
        // Clear all values
        if (userName) userName.value = '';
        if (age) age.value = '';
        if (sex) sex.value = '';
        if (height) height.value = '';
        if (heightFeet) heightFeet.value = '';
        if (heightInches) heightInches.value = '';
        if (activityLevel) activityLevel.value = '';
        
        // Ensure ALL fields are enabled and not readonly
        [userName, age, height, heightFeet, heightInches].forEach(field => {
            if (field) {
                field.disabled = false;
                field.readOnly = false;
                field.removeAttribute('disabled');
                field.removeAttribute('readonly');
                field.style.pointerEvents = 'auto';
                field.tabIndex = 0;
            }
        });
        
        // Try to focus the first field after a short delay
        setTimeout(() => {
            if (userName) {
                userName.focus();
            }
        }, 100);
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveProfile() {
        const heightCm = this.convertHeightToCm();
        
        if (!heightCm || heightCm <= 0) {
            alert('Please enter a valid height');
            return;
        }

        const userName = document.getElementById('userName').value.trim();
        if (!userName) {
            alert('Please enter a user name');
            return;
        }

        // Create or update user
        if (!this.currentUserId) {
            this.currentUserId = this.generateUserId();
        }

        this.users[this.currentUserId] = {
            name: userName,
            sex: document.getElementById('sex').value,
            age: parseFloat(document.getElementById('age').value),
            height: heightCm,
            activityLevel: parseFloat(document.getElementById('activityLevel').value),
            macros: this.users[this.currentUserId]?.macros || {
                protein: 35,
                carbs: 35,
                fat: 30
            }
        };

        this.saveUsers();
        this.updateUserDropdown();

        // Show weight section, hide profile section
        document.getElementById('userSelectionSection').style.display = 'none';
        document.getElementById('profileSection').style.display = 'none';
        document.getElementById('weightSection').style.display = 'block';
        document.getElementById('deleteUserBtn').style.display = 'inline-block';
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
        console.log('=== populateProfileForm called ===');
        const user = this.users[this.currentUserId];
        if (!user) return;
        
        document.getElementById('userName').value = user.name;
        document.getElementById('sex').value = user.sex;
        document.getElementById('age').value = user.age;
        document.getElementById('height').value = user.height;
        document.getElementById('activityLevel').value = user.activityLevel;
    }

    editProfile() {
        document.getElementById('userSelectionSection').style.display = 'block';
        document.getElementById('profileSection').style.display = 'block';
        document.getElementById('weightSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        this.populateProfileForm();
        
        // Ensure unit toggles are in correct state
        setTimeout(() => {
            const heightUnit = document.querySelector('input[name="heightUnit"]:checked');
            if (heightUnit && heightUnit.value === 'ft') {
                document.getElementById('heightCm').style.display = 'none';
                document.getElementById('heightFt').style.display = 'block';
            }
        }, 50);
    }

    // Macro Customization Methods
    showMacroCustomization() {
        const user = this.users[this.currentUserId];
        if (!user) return;

        document.getElementById('proteinPercent').value = user.macros.protein;
        document.getElementById('carbsPercent').value = user.macros.carbs;
        document.getElementById('fatPercent').value = user.macros.fat;
        
        this.updateMacroTotal();
        document.getElementById('macroCustomizationSection').style.display = 'block';
    }

    hideMacroCustomization() {
        document.getElementById('macroCustomizationSection').style.display = 'none';
    }

    updateMacroTotal() {
        const protein = parseFloat(document.getElementById('proteinPercent').value) || 0;
        const carbs = parseFloat(document.getElementById('carbsPercent').value) || 0;
        const fat = parseFloat(document.getElementById('fatPercent').value) || 0;
        const total = protein + carbs + fat;
        
        const totalSpan = document.getElementById('totalMacroPercent');
        totalSpan.textContent = total;
        
        const validationBox = document.getElementById('macroValidation');
        if (total === 100) {
            validationBox.style.backgroundColor = '#d4edda';
            validationBox.style.borderColor = '#c3e6cb';
            validationBox.style.color = '#155724';
        } else {
            validationBox.style.backgroundColor = '#f8d7da';
            validationBox.style.borderColor = '#f5c6cb';
            validationBox.style.color = '#721c24';
        }
    }

    saveMacroPercentages() {
        const protein = parseFloat(document.getElementById('proteinPercent').value) || 0;
        const carbs = parseFloat(document.getElementById('carbsPercent').value) || 0;
        const fat = parseFloat(document.getElementById('fatPercent').value) || 0;
        const total = protein + carbs + fat;

        if (total !== 100) {
            alert('Macro percentages must total 100%');
            return;
        }

        const user = this.users[this.currentUserId];
        user.macros = { protein, carbs, fat };
        this.saveUsers();

        this.hideMacroCustomization();
        
        // Recalculate with new macros
        const weight = this.convertWeightToKg();
        if (weight && weight > 0) {
            this.calculateResults();
        }
    }

    backToWeightEntry() {
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('weightSection').scrollIntoView({ behavior: 'smooth' });
    }

    calculateBMR(weight) {
        const user = this.users[this.currentUserId];
        if (!user) return 0;

        const { sex, age, height } = user;
        let bmr;

        if (sex === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        return Math.round(bmr);
    }

    calculateTDEE(bmr) {
        const user = this.users[this.currentUserId];
        if (!user) return 0;
        return Math.round(bmr * user.activityLevel);
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
        const user = this.users[this.currentUserId];
        if (!user) return null;

        // Get user's custom macro percentages
        const proteinPercent = user.macros.protein / 100;
        const carbsPercent = user.macros.carbs / 100;
        const fatPercent = user.macros.fat / 100;
        
        const proteinKcal = Math.round(dailyCalories * proteinPercent);
        const carbsKcal = Math.round(dailyCalories * carbsPercent);
        const fatKcal = Math.round(dailyCalories * fatPercent);

        const proteinGrams = Math.round(proteinKcal / 4);
        const carbsGrams = Math.round(carbsKcal / 4);
        const fatGrams = Math.round(fatKcal / 9);

        return {
            protein: { kcal: proteinKcal, grams: proteinGrams, percent: user.macros.protein },
            carbs: { kcal: carbsKcal, grams: carbsGrams, percent: user.macros.carbs },
            fat: { kcal: fatKcal, grams: fatGrams, percent: user.macros.fat }
        };
    }

    calculateResults() {
        const weight = this.convertWeightToKg();

        if (!weight || weight <= 0) {
            alert('Please enter a valid weight');
            return;
        }

        if (!this.currentUserId || !this.users[this.currentUserId]) {
            alert('No user selected');
            return;
        }

        // Save current weight for this user
        this.users[this.currentUserId].weight = weight;
        this.saveUsers();

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

        // Display macros with custom percentages
        document.getElementById('proteinPercent-display').textContent = `${macros.protein.percent}%`;
        document.getElementById('proteinKcal').textContent = `${macros.protein.kcal} kcal`;
        document.getElementById('proteinGrams').textContent = `${macros.protein.grams}g`;
        
        document.getElementById('carbsPercent-display').textContent = `${macros.carbs.percent}%`;
        document.getElementById('carbsKcal').textContent = `${macros.carbs.kcal} kcal`;
        document.getElementById('carbsGrams').textContent = `${macros.carbs.grams}g`;
        
        document.getElementById('fatPercent-display').textContent = `${macros.fat.percent}%`;
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
