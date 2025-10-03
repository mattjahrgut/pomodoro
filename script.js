class PomodoroTimer {
    constructor() {
        this.modes = {
            'work': { duration: 25, label: 'Focus Time' },
            'short-break': { duration: 5, label: 'Short Break' },
            'long-break': { duration: 15, label: 'Long Break' }
        };
        
        this.currentMode = 'work';
        this.timeLeft = this.modes[this.currentMode].duration * 60; // in seconds
        this.totalTime = this.timeLeft;
        this.isRunning = false;
        this.timer = null;
        this.sessionCount = 0;
        this.sessionsBeforeLongBreak = 4;
        this.focusTarget = 4;
        this.autoMode = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('time-display');
        this.modeLabel = document.getElementById('mode-label');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.endBtn = document.getElementById('end-btn');
        this.autoBtn = document.getElementById('auto-btn');
        this.sessionCountDisplay = document.getElementById('session-count');
        this.progressRing = document.querySelector('.progress-ring-progress');
        this.timerCard = document.querySelector('.timer-card');
        this.settingsToggleBtn = document.getElementById('settings-toggle-btn');
        this.settingsPanel = document.getElementById('settings-panel');
        
        // Settings inputs
        this.workDurationInput = document.getElementById('work-duration');
        this.shortBreakDurationInput = document.getElementById('short-break-duration');
        this.longBreakDurationInput = document.getElementById('long-break-duration');
        this.sessionsBeforeLongBreakInput = document.getElementById('sessions-before-long-break');
        this.focusTargetInput = document.getElementById('focus-target');
        
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.endBtn.addEventListener('click', () => this.endSession());
        this.autoBtn.addEventListener('click', () => this.toggleAutoMode());
        this.settingsToggleBtn.addEventListener('click', () => this.toggleSettings());
        
        // Mode selection removed - sessions are now automatic
        
        // Settings inputs
        this.workDurationInput.addEventListener('change', () => this.updateModeDuration('work', this.workDurationInput.value));
        this.shortBreakDurationInput.addEventListener('change', () => this.updateModeDuration('short-break', this.shortBreakDurationInput.value));
        this.longBreakDurationInput.addEventListener('change', () => this.updateModeDuration('long-break', this.longBreakDurationInput.value));
        this.sessionsBeforeLongBreakInput.addEventListener('change', () => this.updateSessionsBeforeLongBreak(this.sessionsBeforeLongBreakInput.value));
        this.focusTargetInput.addEventListener('change', () => this.updateFocusTarget(this.focusTargetInput.value));
    }
    
    updateModeDuration(mode, minutes) {
        this.modes[mode].duration = parseInt(minutes);
        if (mode === this.currentMode && !this.isRunning) {
            this.resetTimer();
        }
    }
    
    updateSessionsBeforeLongBreak(sessions) {
        this.sessionsBeforeLongBreak = parseInt(sessions);
    }
    
    updateFocusTarget(target) {
        this.focusTarget = parseInt(target);
        this.updateSessionCount();
    }
    
    toggleAutoMode() {
        this.autoMode = !this.autoMode;
        this.updateAutoButton();
    }
    
    updateAutoButton() {
        if (this.autoMode) {
            this.autoBtn.classList.add('active');
            this.autoBtn.innerHTML = '<span class="btn-text">Auto: ON</span>';
        } else {
            this.autoBtn.classList.remove('active');
            this.autoBtn.innerHTML = '<span class="btn-text">Auto: OFF</span>';
        }
    }
    
    toggleSettings() {
        this.settingsPanel.classList.toggle('visible');
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        this.timeLeft = this.modes[mode].duration * 60;
        this.totalTime = this.timeLeft;
        this.updateDisplay();
        this.updateProgressRing();
        this.updateModeClass();
    }
    
    
    updateModeClass() {
        this.timerCard.className = 'timer-card';
        this.timerCard.classList.add(`${this.currentMode}-mode`);
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.startBtn.innerHTML = '<span class="btn-text">Pause</span>';
        this.startBtn.classList.add('pause');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgressRing();
            
            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isRunning = false;
        this.startBtn.innerHTML = '<span class="btn-text">Start</span>';
        this.startBtn.classList.remove('pause');
        clearInterval(this.timer);
    }
    
    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.modes[this.currentMode].duration * 60;
        this.totalTime = this.timeLeft;
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    endSession() {
        if (this.isRunning) {
            this.pauseTimer();
        }
        this.completeSession();
    }
    
    completeSession() {
        this.pauseTimer();
        this.playNotificationSound();
        this.showNotification();
        
        if (this.currentMode === 'work') {
            this.sessionCount++;
            this.updateSessionCount();
            this.timerCard.classList.add('celebrate');
            setTimeout(() => this.timerCard.classList.remove('celebrate'), 600);
            
            // Auto-switch to break mode
            const nextMode = this.sessionCount % this.sessionsBeforeLongBreak === 0 ? 'long-break' : 'short-break';
            setTimeout(() => {
                this.switchMode(nextMode);
                // Auto-start break if auto mode is enabled
                if (this.autoMode) {
                    setTimeout(() => this.startTimer(), 500);
                }
            }, 1000);
        } else {
            // Auto-switch back to work mode after break (but don't auto-start work)
            setTimeout(() => this.switchMode('work'), 1000);
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.modeLabel.textContent = this.modes[this.currentMode].label;
        
        // Update document title
        document.title = `${this.timeDisplay.textContent} - ${this.modes[this.currentMode].label}`;
    }
    
    updateProgressRing() {
        const circumference = 2 * Math.PI * 140; // radius = 140
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const offset = circumference * (1 - progress);
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    updateSessionCount() {
        this.sessionCountDisplay.textContent = `${this.sessionCount}/${this.focusTarget}`;
    }
    
    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    }
    
    showNotification() {
        const messages = {
            'work': '🎉 Great work! Time for a break!',
            'short-break': '💪 Break\'s over! Ready to focus?',
            'long-break': '🚀 Long break finished! Let\'s get back to work!'
        };
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: messages[this.currentMode],
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
            });
        }
        
        // Visual notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = messages[this.currentMode];
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    
    // Request notification permission on first interaction
    document.addEventListener('click', () => {
        timer.requestNotificationPermission();
    }, { once: true });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input')) {
            e.preventDefault();
            timer.toggleTimer();
        } else if (e.code === 'KeyR' && !e.target.matches('input')) {
            e.preventDefault();
            timer.resetTimer();
        }
    });
    
    // Prevent timer from running when tab is not visible (optional)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && timer.isRunning) {
            // Timer continues running in background
            // You could pause it here if desired: timer.pauseTimer();
        }
    });
});
