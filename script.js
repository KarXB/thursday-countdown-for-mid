// Audio context for sound effects
let audioContext;
try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
    console.log('Web Audio API is not supported in this browser');
}

// Sound effect function
function playSound(frequency = 440, type = 'sine', duration = 0.1) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Sound control
let isSoundEnabled = false;
const soundToggle = document.getElementById('sound-toggle');
soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.innerHTML = `<i class="fas fa-volume-${isSoundEnabled ? 'up' : 'mute'}"></i>`;
    if (isSoundEnabled && audioContext?.state === 'suspended') {
        audioContext.resume();
    }
});

// Countdown Timer
const targetTime = new Date();
targetTime.setHours(10, 30, 0, 0); // Set to 10:30 AM
if (targetTime < new Date()) {
    targetTime.setDate(targetTime.getDate() + 1);
}

function showEndMessage() {
    const countdownElement = document.querySelector('.countdown');
    const progressContainer = document.querySelector('.progress-container');
    const arabicTextElement = document.querySelector('.arabic-text');
    
    // Hide countdown and progress bar with fade out
    countdownElement.style.opacity = '0';
    progressContainer.style.opacity = '0';
    
    setTimeout(() => {
        countdownElement.style.display = 'none';
        progressContainer.style.display = 'none';
        
        // Update and show the end message
        arabicTextElement.textContent = 'سقطنا؟';
        arabicTextElement.classList.add('timer-end-text');
        
        if (isSoundEnabled) {
            playSound(440, 'sine', 0.5); // Play a longer sound for the end state
        }
    }, 1000);
}

function updateCountdown() {
    const now = new Date();
    const difference = targetTime - now;
    
    if (difference <= 0) {
        showEndMessage();
        return;
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((difference % 1000) / 10);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    document.getElementById('milliseconds').textContent = String(milliseconds).padStart(3, '0');
    
    // Update progress bar
    const totalTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const elapsed = totalTime - difference;
    const progress = (elapsed / totalTime) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// Check if we should show end message immediately
if (new Date() >= targetTime) {
    showEndMessage();
} else {
    setInterval(updateCountdown, 50);
}

// Study Tips
const studyTips = [
    "Break your study sessions into 25-minute focused intervals (Pomodoro Technique)",
    "Create mind maps to visualize complex concepts",
    "Teach the material to someone else to reinforce your understanding",
    "Take regular breaks to maintain focus and productivity",
    "Use active recall instead of passive reading",
    "Create flashcards for key concepts",
    "Study in a quiet, well-lit environment",
    "Get enough sleep before the exam",
    "Stay hydrated and maintain a healthy diet",
    "Review past exam questions and practice problems"
];

let currentTipIndex = -1;

function showNewTip() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * studyTips.length);
    } while (newIndex === currentTipIndex);
    
    currentTipIndex = newIndex;
    const tipElement = document.getElementById('study-tip');
    tipElement.style.opacity = '0';
    
    setTimeout(() => {
        tipElement.textContent = studyTips[currentTipIndex];
        tipElement.style.opacity = '1';
        if (isSoundEnabled) {
            playSound(880, 'sine', 0.1);
        }
    }, 300);
}

document.getElementById('new-tip-btn').addEventListener('click', showNewTip);
showNewTip(); // Show initial tip

// Star Catching Game
const gameContainer = document.getElementById('game-container');
const star = document.getElementById('star');
const scoreElement = document.getElementById('score');
let score = 0;

function repositionStar() {
    const containerRect = gameContainer.getBoundingClientRect();
    const starRect = star.getBoundingClientRect();
    
    const maxX = containerRect.width - starRect.width;
    const maxY = containerRect.height - starRect.height;
    
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    star.style.left = `${randomX}px`;
    star.style.top = `${randomY}px`;
}

star.addEventListener('click', () => {
    score++;
    scoreElement.textContent = score;
    if (isSoundEnabled) {
        playSound(1200, 'sine', 0.1);
    }
    repositionStar();
});

repositionStar(); // Initial star position

// Share functionality
document.getElementById('share-btn').addEventListener('click', async () => {
    const shareData = {
        title: 'Midterm Countdown',
        text: `Join me in preparing for the midterm! ${document.getElementById('days').textContent}d ${document.getElementById('hours').textContent}h ${document.getElementById('minutes').textContent}m remaining.`,
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.text);
            alert('Countdown info copied to clipboard!');
        }
        if (isSoundEnabled) {
            playSound(660, 'sine', 0.1);
        }
    } catch (err) {
        console.error('Error sharing:', err);
    }
});

// Mini-game
let gameActive = false;

function startGame() {
    if (gameActive) return;
    gameActive = true;
    score = 0;
    document.getElementById('score').textContent = score;
    
    const container = document.getElementById('game-container');
    const player = document.getElementById('player');
    const star = document.getElementById('star');
    
    function movestar() {
        const x = Math.random() * (container.offsetWidth - 30);
        const y = Math.random() * (container.offsetHeight - 30);
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
    }
    
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left - 15;
        const y = e.clientY - rect.top - 15;
        player.style.left = `${x}px`;
        player.style.top = `${y}px`;
        
        const playerRect = player.getBoundingClientRect();
        const starRect = star.getBoundingClientRect();
        
        if (!(playerRect.right < starRect.left || 
              playerRect.left > starRect.right || 
              playerRect.bottom < starRect.top || 
              playerRect.top > starRect.bottom)) {
            score++;
            document.getElementById('score').textContent = score;
            movestar();
        }
    });
    
    movestar();
}

document.getElementById('start-game').addEventListener('click', startGame);
