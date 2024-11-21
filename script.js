// Audio context for sound effects
let audioContext;
try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
    console.log('Web Audio API is not supported in this browser');
}

// Sound effect function
function playSound(frequency, type, duration, volume = 0.1) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Smoother attack and release
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
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
    const titleElement = document.querySelector('h1');
    const arabicTextElement = document.querySelector('.arabic-text');
    
    // Set all timer digits to 0
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    document.getElementById('milliseconds').textContent = '000';
    
    // Update messages
    titleElement.textContent = 'THE EXAMS ARE FINISHED';
    arabicTextElement.textContent = 'سقطنا؟';
    arabicTextElement.classList.add('timer-end-text');
    
    // Set progress bar to 100%
    document.getElementById('progress-bar').style.width = '100%';
    
    if (isSoundEnabled) {
        playSound(440, 'sine', 0.5);
    }
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
showEndMessage();

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

// Platformer Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 400;
}
resizeCanvas();

// Initialize game state
const game = {
    active: false,
    isRunning: false,
    levelWidth: canvas.width * 3,
    gravity: 0.5,
    score: 0,
    soundEnabled: true,
    camera: {
        x: 0,
        y: 0
    },
    player: {
        x: 50,
        y: 200,
        width: 40,
        height: 40,
        vx: 0,
        vy: 0,
        speed: 5,
        jumpForce: 12,
        canJump: false,
        color: '#4F46E5',
        trailPoints: [],
        eyeOffset: 0,
        direction: 'right'
    },
    platforms: [],
    coins: [],
    particles: []
};

let animationFrameId = null;

// Initialize game
function initGame() {
    // Draw initial start screen
    drawStartScreen();
    
    // Set up event listeners
    const startButton = document.getElementById('startGame');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Prevent default touch behaviors
    const mobileControls = document.getElementById('mobileControls');
    if (mobileControls) {
        mobileControls.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
}

// Mobile control handler
function handleMobileControl(action, isPressed) {
    if (!game.isRunning) return;
    
    switch(action) {
        case 'left':
            game.player.vx = isPressed ? -game.player.speed : 0;
            if (isPressed) game.player.direction = 'left';
            break;
        case 'right':
            game.player.vx = isPressed ? game.player.speed : 0;
            if (isPressed) game.player.direction = 'right';
            break;
        case 'jump':
            if (isPressed && game.player.canJump) {
                game.player.vy = -game.player.jumpForce;
                game.player.canJump = false;
                playJumpSound();
            }
            break;
    }
}

// Make handleMobileControl available globally
window.handleMobileControl = handleMobileControl;

// Key handlers
function handleKeyDown(e) {
    if (!game.isRunning) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case 'd':
            game.player.vx = game.player.speed;
            game.player.direction = 'right';
            break;
        case 'ArrowLeft':
        case 'a':
            game.player.vx = -game.player.speed;
            game.player.direction = 'left';
            break;
        case 'ArrowUp':
        case 'w':
        case ' ':
            if (game.player.canJump) {
                game.player.vy = -game.player.jumpForce;
                game.player.canJump = false;
                playJumpSound();
            }
            break;
    }
}

function handleKeyUp(e) {
    if (!game.isRunning) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case 'd':
            if (game.player.vx > 0) game.player.vx = 0;
            break;
        case 'ArrowLeft':
        case 'a':
            if (game.player.vx < 0) game.player.vx = 0;
            break;
    }
}

// Start/Restart game function
function startGame() {
    resetGame();
    game.isRunning = true;
    document.getElementById('startGame').textContent = 'Restart Game';
    
    // Start game loop if not already running
    if (!animationFrameId) {
        gameLoop();
    }
}

// Reset game state
function resetGame() {
    // Cancel current animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Reset game state
    game.isRunning = true;
    game.score = 0;
    game.levelWidth = canvas.width * 3;
    game.camera.x = 0;
    game.camera.y = 0;
    
    // Reset player
    game.player.x = 50;
    game.player.y = 200;
    game.player.vx = 0;
    game.player.vy = 0;
    game.player.canJump = false;
    game.player.trailPoints = [];
    game.player.direction = 'right';
    
    // Clear arrays
    game.platforms = [];
    game.coins = [];
    game.particles = [];
    
    // Generate new level
    generatePlatforms();
    generateCoins();
    
    // Update score display
    document.getElementById('gameScore').textContent = `Score: ${game.score}`;
}

// Game loop
function gameLoop() {
    if (!game.isRunning) {
        cancelAnimationFrame(animationFrameId);
        drawStartScreen();
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game state
    updateGame();
    
    // Draw everything
    drawGame();
    
    // Continue loop
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Update camera position
function updateCamera() {
    // Target is one-third from the left of the screen
    const targetX = game.player.x - canvas.width / 3;
    
    // Smooth camera movement
    game.camera.x += (targetX - game.camera.x) * 0.1;
    
    // Keep camera within bounds
    game.camera.x = Math.max(0, Math.min(game.camera.x, game.levelWidth - canvas.width));
}

// Draw coins
function drawCoins() {
    game.coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2);
            ctx.rotate(coin.angle);
            
            // Draw coin glow
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.width/1.5);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, coin.width/1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    });
}

// Draw game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context for camera transform
    ctx.save();
    ctx.translate(-Math.floor(game.camera.x), 0);
    
    // Draw background
    const gradient = ctx.createLinearGradient(game.camera.x, 0, game.camera.x + canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#2a2a4e');
    ctx.fillStyle = gradient;
    ctx.fillRect(game.camera.x, 0, canvas.width, canvas.height);
    
    // Draw platforms
    game.platforms.forEach(platform => {
        const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
        gradient.addColorStop(0, platform.color);
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw coins
    drawCoins();
    
    // Draw particles
    game.particles.forEach(particle => {
        particle.draw(ctx);
    });
    
    // Draw player trail and body
    game.player.trailPoints.forEach((point, index) => {
        const alpha = (1 - index / game.player.trailPoints.length) * 0.3;
        ctx.fillStyle = `rgba(79, 70, 229, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x + game.player.width/2, point.y + game.player.height/2, 
                game.player.width/2 * (1 - index/game.player.trailPoints.length), 
                0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw player body
    ctx.fillStyle = game.player.color;
    ctx.beginPath();
    ctx.arc(game.player.x + game.player.width/2, game.player.y + game.player.height/2, 
            game.player.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    const eyeX = game.player.direction === 'right' ? 8 : -8;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(game.player.x + game.player.width/2 + eyeX, 
            game.player.y + game.player.height/2 - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(game.player.x + game.player.width/2 + eyeX + game.player.eyeOffset, 
            game.player.y + game.player.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Restore context
    ctx.restore();
}

// Draw start screen
function drawStartScreen() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click Start to Play!', canvas.width / 2, canvas.height / 2);
}

// Update game state
function updateGame() {
    if (!game.isRunning) return;

    // Update camera position
    updateCamera();
    
    // Check if player has moved past 70% of the current level width
    if (game.player.x > game.levelWidth * 0.7) {
        extendLevel();
    }
    
    // Update player position
    game.player.vy += game.gravity;
    game.player.x += game.player.vx;
    game.player.y += game.player.vy;
    
    // Update trail
    game.player.trailPoints.unshift({ x: game.player.x, y: game.player.y });
    if (game.player.trailPoints.length > 5) {
        game.player.trailPoints.pop();
    }
    
    // Check platform collisions
    game.player.canJump = false;
    game.platforms.forEach(platform => {
        if (game.player.x < platform.x + platform.width &&
            game.player.x + game.player.width > platform.x &&
            game.player.y < platform.y + platform.height &&
            game.player.y + game.player.height > platform.y) {
            
            // Collision from top
            if (game.player.vy > 0 && 
                game.player.y + game.player.height - game.player.vy <= platform.y) {
                game.player.y = platform.y - game.player.height;
                game.player.vy = 0;
                game.player.canJump = true;
            }
            // Collision from bottom
            else if (game.player.vy < 0 && 
                     game.player.y - game.player.vy >= platform.y + platform.height) {
                game.player.y = platform.y + platform.height;
                game.player.vy = 0;
            }
            // Collision from left
            else if (game.player.vx > 0 && 
                     game.player.x + game.player.width - game.player.vx <= platform.x) {
                game.player.x = platform.x - game.player.width;
            }
            // Collision from right
            else if (game.player.vx < 0 && 
                     game.player.x - game.player.vx >= platform.x + platform.width) {
                game.player.x = platform.x + platform.width;
            }
        }
    });
    
    // Check coin collisions
    game.coins.forEach(coin => {
        if (!coin.collected &&
            game.player.x < coin.x + coin.width &&
            game.player.x + game.player.width > coin.x &&
            game.player.y < coin.y + coin.height &&
            game.player.y + game.player.height > coin.y) {
            
            coin.collected = true;
            game.score += 10;
            document.getElementById('gameScore').textContent = `Score: ${game.score}`;
            
            // Create particles
            for (let i = 0; i < 10; i++) {
                game.particles.push(new Particle(
                    coin.x + coin.width/2,
                    coin.y + coin.height/2
                ));
            }
            
            // Play coin sound
            playCoinSound();
        }
    });
    
    // Update particles
    game.particles = game.particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
    
    // Update coin rotation
    game.coins.forEach(coin => {
        if (!coin.collected) {
            coin.angle += 0.05;
        }
    });
    
    // Clean up old platforms and coins
    const cleanupX = game.camera.x - canvas.width;
    game.platforms = game.platforms.filter(platform => platform.x + platform.width > cleanupX);
    game.coins = game.coins.filter(coin => coin.x > cleanupX);
    
    // Keep player in bounds
    if (game.player.x < 0) game.player.x = 0;
    if (game.player.x + game.player.width > game.levelWidth) {
        game.player.x = game.levelWidth - game.player.width;
    }
    if (game.player.y > canvas.height) {
        resetGame();
    }
}

// Calculate maximum jump distance
function calculateMaxJumpDistance() {
    // Time to reach peak of jump
    const timeToApex = game.player.jumpForce / game.gravity;
    
    // Horizontal distance covered during jump
    const horizontalDistance = game.player.speed * (timeToApex * 2);
    
    // Add a small safety margin
    return horizontalDistance * 0.85;
}

// Calculate maximum jump height
function calculateMaxJumpHeight() {
    // Using physics formula: h = v0^2 / (2g)
    const maxHeight = (game.player.jumpForce * game.player.jumpForce) / (2 * game.gravity);
    
    // Add a small safety margin
    return maxHeight * 0.85;
}

// Generate platforms with guaranteed possible jumps
function generatePlatforms() {
    const platformHeight = 20;
    let lastX = 0;
    const maxJumpDistance = calculateMaxJumpDistance();
    const maxJumpHeight = calculateMaxJumpHeight();
    
    // Add starting platform
    game.platforms.push({
        x: 0,
        y: canvas.height - 100,
        width: 200,
        height: platformHeight,
        color: '#4F46E5'
    });
    
    lastX = 200;
    let lastY = canvas.height - 100;
    
    // Generate initial set of platforms
    while (lastX < game.levelWidth) {
        // Platform dimensions
        const width = Math.random() * 80 + 80; // Width between 80 and 160
        
        // Calculate gap based on max jump distance
        const minGap = 50; // Minimum gap between platforms
        const maxGap = maxJumpDistance - width; // Maximum gap based on jump distance
        const gap = Math.random() * (maxGap - minGap) + minGap;
        
        // Calculate height difference
        const maxHeightDiff = maxJumpHeight * 0.7; // Use 70% of max jump height for safety
        const minHeight = Math.max(100, lastY - maxHeightDiff); // Don't go too high
        const maxHeight = Math.min(canvas.height - 150, lastY + maxHeightDiff); // Don't go too low
        const newY = Math.random() * (maxHeight - minHeight) + minHeight;
        
        game.platforms.push({
            x: lastX + gap,
            y: newY,
            width: width,
            height: platformHeight,
            color: '#4F46E5'
        });
        
        lastX += gap + width;
        lastY = newY;
    }
}

// Extend level with guaranteed possible jumps
function extendLevel() {
    const oldLevelWidth = game.levelWidth;
    game.levelWidth += canvas.width * 2;
    
    let lastPlatform = game.platforms[game.platforms.length - 1];
    let lastX = lastPlatform.x + lastPlatform.width;
    let lastY = lastPlatform.y;
    
    const maxJumpDistance = calculateMaxJumpDistance();
    const maxJumpHeight = calculateMaxJumpHeight();
    
    // Generate new platforms
    while (lastX < game.levelWidth) {
        // Platform dimensions
        const width = Math.random() * 80 + 80; // Width between 80 and 160
        
        // Calculate gap based on max jump distance
        const minGap = 50; // Minimum gap between platforms
        const maxGap = maxJumpDistance - width; // Maximum gap based on jump distance
        const gap = Math.random() * (maxGap - minGap) + minGap;
        
        // Calculate height difference
        const maxHeightDiff = maxJumpHeight * 0.7; // Use 70% of max jump height for safety
        const minHeight = Math.max(100, lastY - maxHeightDiff); // Don't go too high
        const maxHeight = Math.min(canvas.height - 150, lastY + maxHeightDiff); // Don't go too low
        const newY = Math.random() * (maxHeight - minHeight) + minHeight;
        
        const platform = {
            x: lastX + gap,
            y: newY,
            width: width,
            height: 20,
            color: '#4F46E5'
        };
        
        game.platforms.push(platform);
        
        // Add coins to new platform
        if (Math.random() < 0.7) { // 70% chance of coin on platform
            game.coins.push({
                x: platform.x + platform.width/2 - 10,
                y: platform.y - 40,
                width: 20,
                height: 20,
                angle: 0,
                collected: false
            });
        }
        
        lastX = platform.x + width;
        lastY = newY;
    }
}

// Generate coins
function generateCoins() {
    game.platforms.forEach(platform => {
        if (Math.random() < 0.7) { // 70% chance of coin on platform
            game.coins.push({
                x: platform.x + platform.width/2 - 10,
                y: platform.y - 40,
                width: 20,
                height: 20,
                angle: 0,
                collected: false
            });
        }
    });
}

// Sound effects
function playCoinSound() {
    // Lower frequencies and volume for coin sound
    playSound(600, 'sine', 0.15, 0.05); // Softer base note
    setTimeout(() => playSound(800, 'sine', 0.1, 0.03), 50); // Gentler high note
}

function playJumpSound() {
    // Lower frequency and softer sound for jump
    playSound(300, 'sine', 0.15, 0.08); // Changed from square to sine for softer sound
}

// Particle system
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.life = 1;
        this.color = '#FFD700';
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Gravity
        this.life -= 0.02;
    }
    
    draw(ctx) {
        ctx.fillStyle = `rgba(255, 215, 0, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Add particles array to game state
game.particles = [];

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', initGame);
