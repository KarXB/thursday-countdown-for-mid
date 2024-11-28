// Theme toggle functionality
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference, default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    }

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
        updateExplanationButtonsTheme();
    });
}

// Credits modal functionality
function initCredits() {
    const creditsBtn = document.getElementById('creditsBtn');
    const creditsModal = document.getElementById('creditsModal');

    creditsBtn.addEventListener('click', () => {
        creditsModal.classList.remove('hidden');
        creditsModal.classList.add('flex');
    });

    // Close modal when clicking outside or on close button
    creditsModal.addEventListener('click', (e) => {
        if (e.target === creditsModal) {
            creditsModal.classList.add('hidden');
            creditsModal.classList.remove('flex');
        }
    });
}

// Update explanation buttons theme
function updateExplanationButtonsTheme() {
    const detailedBtn = document.getElementById('detailedBtn');
    const simpleBtn = document.getElementById('simpleBtn');
    const isDark = document.documentElement.classList.contains('dark');
    const isDetailedActive = detailedBtn.classList.contains('active');

    if (isDetailedActive) {
        detailedBtn.className = `flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 ${isDark ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-800 hover:bg-gray-700'} text-white active`;
        simpleBtn.className = `flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`;
    } else {
        simpleBtn.className = `flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 ${isDark ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-800 hover:bg-gray-700'} text-white active`;
        detailedBtn.className = `flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`;
    }

    // Update ARIA attributes
    detailedBtn.setAttribute('aria-pressed', isDetailedActive);
    simpleBtn.setAttribute('aria-pressed', !isDetailedActive);
}

// Explanation type toggle
function initExplanationToggle() {
    const detailedBtn = document.getElementById('detailedBtn');
    const simpleBtn = document.getElementById('simpleBtn');

    detailedBtn.addEventListener('click', () => {
        detailedBtn.classList.add('active');
        simpleBtn.classList.remove('active');
        updateExplanationButtonsTheme();
        // Recalculate if result is shown
        if (!document.querySelector('.result-section').classList.contains('hidden')) {
            calculateModulo();
        }
    });

    simpleBtn.addEventListener('click', () => {
        simpleBtn.classList.add('active');
        detailedBtn.classList.remove('active');
        updateExplanationButtonsTheme();
        // Recalculate if result is shown
        if (!document.querySelector('.result-section').classList.contains('hidden')) {
            calculateModulo();
        }
    });
}

// History management
function initHistory() {
    // Load history from localStorage
    const history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
    updateHistoryDisplay(history);
}

function addToHistory(calculation) {
    let history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
    calculation.timestamp = new Date().toLocaleString();
    history.unshift(calculation);
    if (history.length > 10) history.pop();
    localStorage.setItem('calculationHistory', JSON.stringify(history));
    updateHistoryDisplay(history);
}

function clearHistory() {
    localStorage.removeItem('calculationHistory');
    updateHistoryDisplay([]);
    document.getElementById('historyModal').classList.add('hidden');
}

function updateHistoryDisplay(history) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="text-gray-500 dark:text-gray-400 text-center py-4">
                No calculations yet
            </div>
        `;
        return;
    }

    history.forEach((calc, index) => {
        const item = document.createElement('div');
        item.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer';
        item.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">${calc.timestamp}</span>
            </div>
            <div class="text-gray-800 dark:text-gray-200">
                ${calc.dividend} mod ${calc.divisor} = ${calc.remainder}
            </div>
        `;
        item.onclick = () => recallCalculation(calc);
        historyList.appendChild(item);
    });
}

function recallCalculation(calc) {
    document.getElementById('number1').value = calc.dividend;
    document.getElementById('number2').value = calc.divisor;
    document.getElementById('number1Type').value = calc.number1Type;
    document.getElementById('number2Type').value = calc.number2Type;
    document.getElementById('historyModal').classList.add('hidden');
    calculateModulo();
}

function toggleHistory() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal.classList.contains('hidden')) {
        historyModal.classList.remove('hidden');
        historyModal.classList.add('flex');
    } else {
        historyModal.classList.add('hidden');
        historyModal.classList.remove('flex');
    }
}

// Number type handling
function formatNumber(value, type) {
    const num = parseFloat(value);
    if (type === 'int') {
        return Math.floor(num);
    }
    return num;
}

// Calculate modulo
function calculateModulo() {
    // Get input values and types
    const number1 = document.getElementById('number1').value;
    const number2 = document.getElementById('number2').value;
    const number1Type = document.getElementById('number1Type').value;
    const number2Type = document.getElementById('number2Type').value;
    
    // Get result elements
    const resultSection = document.querySelector('.result-section');
    const resultSpan = document.getElementById('result');
    const explanationP = document.getElementById('explanation');
    
    // Validate inputs
    if (!number1 || !number2) {
        alert('Please enter both numbers');
        return;
    }
    
    if (number2 == 0) {
        alert('Cannot divide by zero');
        return;
    }
    
    // Convert to numbers based on type
    const dividend = formatNumber(number1, number1Type);
    const divisor = formatNumber(number2, number2Type);
    
    // Calculate quotient and remainder
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    const decimalRemainder = dividend % divisor;
    
    // Add to history
    addToHistory({
        dividend,
        divisor,
        remainder,
        number1Type,
        number2Type,
        timestamp: new Date().toLocaleString()
    });

    // Display results with animation
    resultSection.classList.remove('hidden');
    
    // Show both integer and decimal results if applicable
    const hasDecimal = decimalRemainder !== Math.floor(decimalRemainder);
    resultSpan.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-center gap-2">
                <span class="text-4xl font-bold text-gray-800 dark:text-green-400">${remainder}</span>
                <button id="copyBtn" onclick="copyResult()" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                </button>
            </div>
            ${hasDecimal ? `
                <div class="text-sm text-gray-600 dark:text-gray-400">
                    Decimal remainder: ${decimalRemainder.toFixed(4)}
                </div>
            ` : ''}
        </div>
    `;
    
    // Generate explanation based on type
    if (document.getElementById('detailedBtn').classList.contains('active')) {
        generateDetailedExplanation(dividend, divisor, quotient, remainder, decimalRemainder, number1Type, number2Type);
    } else {
        generateSimpleExplanation(dividend, divisor, quotient, remainder, decimalRemainder, number1Type, number2Type);
    }
}

function generateDetailedExplanation(dividend, divisor, quotient, remainder, decimalRemainder, number1Type, number2Type) {
    const explanationP = document.getElementById('explanation');
    const steps = [
        {
            title: 'Understanding the Numbers',
            content: `
                Input numbers:
                <ul class="list-disc list-inside mt-2 space-y-1">
                    <li>Dividend: ${dividend} (${number1Type})</li>
                    <li>Divisor: ${divisor} (${number2Type})</li>
                </ul>
            `
        },
        {
            title: 'Division Step',
            content: `Divide ${dividend} by ${divisor}:<br>
                     <code class="block bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mt-2 font-mono text-sm text-gray-800 dark:text-green-400">${dividend} ÷ ${divisor} = ${(dividend/divisor).toFixed(4)}</code>`
        },
        {
            title: 'Find the Quotient',
            content: `Round down to get the largest whole number of times ${divisor} goes into ${dividend}:<br>
                     <code class="block bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mt-2 font-mono text-sm text-gray-800 dark:text-green-400">Quotient = ${quotient}</code>`
        },
        {
            title: 'Multiplication Step',
            content: `Multiply the divisor by the quotient:<br>
                     <code class="block bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mt-2 font-mono text-sm text-gray-800 dark:text-green-400">${divisor} × ${quotient} = ${divisor * quotient}</code>`
        },
        {
            title: 'Finding the Remainder',
            content: `
                <div class="space-y-2">
                    <div>Subtract to find what's left over:</div>
                    <code class="block bg-gray-50 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-800 dark:text-green-400">${dividend} - ${divisor * quotient} = ${remainder}</code>
                    ${decimalRemainder !== remainder ? `
                        <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Note: The decimal remainder is ${decimalRemainder.toFixed(4)}, but since we're working with integers, we round down to ${remainder}.
                        </div>
                    ` : ''}
                </div>
            `
        },
        {
            title: 'Verification',
            content: `We can verify this is correct because:<br>
                     <code class="block bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mt-2 font-mono text-sm text-gray-800 dark:text-green-400">${dividend} = (${divisor} × ${quotient}) + ${remainder}</code>
                     <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">And ${remainder} is less than ${divisor}</p>`
        }
    ];
    
    explanationP.innerHTML = `
        <div class="space-y-4">
            ${steps.map(step => `
                <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover-scale animate-fade-in">
                    <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">${step.title}</h4>
                    <div class="text-gray-600 dark:text-gray-300">${step.content}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function generateSimpleExplanation(dividend, divisor, quotient, remainder, decimalRemainder, number1Type, number2Type) {
    const explanationP = document.getElementById('explanation');
    let explanation = '';

    if (divisor > dividend) {
        explanation = `Since ${divisor} is greater than ${dividend}, the remainder is ${dividend}.`;
    } else if (/^10+$/.test(divisor.toString())) {
        const digits = divisor.toString().length - 1;
        explanation = `Since ${divisor} is a power of 10 (10${'0'.repeat(digits)}), the remainder is the last ${digits} digit${digits > 1 ? 's' : ''} of ${dividend}, which is ${remainder}.`;
    } else {
        explanation = `
            The largest multiple of ${divisor} that's less than or equal to ${dividend} is ${divisor * quotient} (${divisor} × ${quotient}).
            Therefore, the remainder is ${dividend} - ${divisor * quotient} = ${remainder}.
        `;
    }

    if (decimalRemainder !== remainder) {
        explanation += `<br><br>Note: Since we're working with ${number1Type}/${number2Type} numbers, we round the decimal remainder (${decimalRemainder.toFixed(4)}) down to ${remainder}.`;
    }

    explanationP.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover-scale animate-fade-in">
            <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Simple Explanation</h4>
            <div class="text-gray-600 dark:text-gray-300">${explanation}</div>
        </div>
    `;
}

// Copy result to clipboard
async function copyResult() {
    const result = document.getElementById('result').textContent;
    if (result) {
        try {
            await navigator.clipboard.writeText(result);
            const copyBtn = document.getElementById('copyBtn');
            copyBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            `;
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                `;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }
}

// Clear inputs and results
function clearInputs() {
    document.getElementById('number1').value = '';
    document.getElementById('number2').value = '';
    document.querySelector('.result-section').classList.add('hidden');
    document.getElementById('result').textContent = '';
    document.getElementById('explanation').innerHTML = '';
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Enter to calculate
    if (event.key === 'Enter') {
        calculateModulo();
    }
    // Escape to clear
    if (event.key === 'Escape') {
        clearInputs();
    }
});

// Initialize all functionality on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCredits();
    initExplanationToggle();
    initHistory();
});