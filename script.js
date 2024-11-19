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

function updateCountdown() {
    const now = new Date();
    const target = getNextThursday();
    const diff = target - now;

    // Convert to days, hours, minutes, seconds, milliseconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const milliseconds = diff % 1000;

    // Update the display
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    document.getElementById('milliseconds').textContent = String(milliseconds).padStart(3, '0');
}

// Update immediately and then every 50ms for smooth milliseconds display
updateCountdown();
setInterval(updateCountdown, 50);
