function getNextThursday() {
    const now = new Date();
    const targetDay = 4; // Thursday (0 = Sunday, 4 = Thursday)
    const targetHour = 11;
    const targetMinute = 30;
    
    let thursday = new Date(now);
    thursday.setHours(targetHour, targetMinute, 0, 0);
    
    // If it's past Thursday 11:30, get next Thursday
    if (now.getDay() > targetDay || (now.getDay() === targetDay && now > thursday)) {
        thursday.setDate(thursday.getDate() + (7 - thursday.getDay() + targetDay));
    } 
    // If it's before Thursday, get this Thursday
    else if (now.getDay() < targetDay) {
        thursday.setDate(thursday.getDate() + (targetDay - thursday.getDay()));
    }
    
    return thursday;
}

function getTargetDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    return tomorrow;
}

// Study tips
const studyTips = [
    "Take regular breaks - 5 minutes every 25 minutes",
    "Stay hydrated - keep water nearby",
    "Use active recall instead of passive reading",
    "Create mind maps for complex topics",
    "Get enough sleep before the exam",
    "Review past exam questions",
    "Study in a quiet environment",
    "Explain concepts to others"
];

function updateStudyTip() {
    const tip = studyTips[Math.floor(Math.random() * studyTips.length)];
    document.getElementById('study-tip').textContent = tip;
}

// Initialize study tip
updateStudyTip();
document.getElementById('new-tip-btn').addEventListener('click', updateStudyTip);

// Sound control
let soundEnabled = false;

// Sound toggle event listener
document.getElementById('sound-toggle').addEventListener('click', function() {
    soundEnabled = !soundEnabled;
    this.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
});

function updateCountdown() {
    const now = new Date();
    const target = getTargetDate();
    const diff = target - now;

    if (diff <= 0) {
        document.querySelector('.countdown').innerHTML = '<h2>Time is up!</h2>';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const milliseconds = diff % 1000;

    // Update display
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    document.getElementById('milliseconds').textContent = String(milliseconds).padStart(3, '0');

    // Update progress bar
    const totalTime = getTargetDate() - new Date(now.setHours(0,0,0,0));
    const elapsedTime = now.getTime() - new Date(now.setHours(0,0,0,0));
    const progress = (elapsedTime / totalTime) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// Update immediately and then every 50ms for smooth milliseconds display
updateCountdown();
setInterval(updateCountdown, 50);

// Share functionality
document.getElementById('share-btn').addEventListener('click', function() {
    const text = `I'm counting down to my midterm exam! Check it out!`;
    if (navigator.share) {
        navigator.share({
            title: 'Midterm Countdown',
            text: text,
            url: window.location.href
        }).catch(() => {
            navigator.clipboard.writeText(text + ' ' + window.location.href)
                .then(() => alert('Link copied to clipboard!'));
        });
    } else {
        navigator.clipboard.writeText(text + ' ' + window.location.href)
            .then(() => alert('Link copied to clipboard!'))
            .catch(() => alert('Failed to copy link'));
    }
});

// Mini-game
let score = 0;
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
