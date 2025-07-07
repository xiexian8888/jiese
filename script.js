document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素获取 ---
    const elements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
        level: document.getElementById('level'),
        bestStreak: document.getElementById('best-streak'),
        quote: document.getElementById('quote'),
        startBtn: document.getElementById('start-btn'),
        resetBtn: document.getElementById('reset-btn'),
        timerCard: document.getElementById('timer-card'),
        statsCard: document.getElementById('stats-card'),
    };

    // --- 状态与数据 ---
    let timerInterval = null;
    const storageKeys = {
        startTime: 'nofap_startTime',
        bestStreak: 'nofap_bestStreak'
    };

    const levels = [
        { days: 0, name: "初窥门径" },
        { days: 3, name: "渐入佳境" },
        { days: 7, name: "脱胎换骨" },
        { days: 14, name: "意志坚定" },
        { days: 30, name: "心如止水" },
        { days: 60, name: "掌控自我" },
        { days: 90, name: "超凡入圣" },
        { days: 180, name: "天人合一" },
        { days: 365, name: "得道宗师" }
    ];

    const quotes = [
        "最大的胜利，是战胜自己。",
        "每一次克制，都是一次新生。",
        "欲望如水，可载舟亦可覆舟，智者驭之。",
        "正念长存，方能百邪不侵。",
        "你的身体是圣殿，而非欲望的囚笼。",
        "坚持住，你正在成为更强大的自己。"
    ];

    // --- 功能函数 ---

    /**
     * 更新计时器显示
     */
    function updateTimer() {
        const startTime = localStorage.getItem(storageKeys.startTime);
        if (!startTime) return;

        const diff = new Date().getTime() - startTime;
        if (diff < 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        elements.days.textContent = String(d).padStart(2, '0');
        elements.hours.textContent = String(h).padStart(2, '0');
        elements.minutes.textContent = String(m).padStart(2, '0');
        elements.seconds.textContent = String(s).padStart(2, '0');
        
        updateLevel(d);
    }

    /**
     * 更新等级
     * @param {number} currentDays - 当前坚持的天数
     */
    function updateLevel(currentDays) {
        const currentLevel = levels.slice().reverse().find(l => currentDays >= l.days);
        elements.level.textContent = currentLevel ? currentLevel.name : "尚未开始";
    }

    /**
     * 更新最佳纪录显示
     */
    function updateBestStreakDisplay() {
        const best = localStorage.getItem(storageKeys.bestStreak) || 0;
        const d = Math.floor(best / (1000 * 60 * 60 * 24));
        const h = Math.floor((best % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((best % (1000 * 60 * 60)) / (1000 * 60));
        elements.bestStreak.textContent = `${d} 天 ${h} 小时 ${m} 分钟`;
    }

    /**
     * 检查并更新最佳纪录
     */
    function checkAndUpdateBestStreak() {
        const startTime = localStorage.getItem(storageKeys.startTime);
        if (!startTime) return;
        
        const currentStreak = new Date().getTime() - startTime;
        const bestStreak = localStorage.getItem(storageKeys.bestStreak) || 0;

        if (currentStreak > bestStreak) {
            localStorage.setItem(storageKeys.bestStreak, currentStreak);
        }
    }
    
    /**
     * 更新UI状态
     */
    function updateUI() {
        const startTime = localStorage.getItem(storageKeys.startTime);
        if (startTime) {
            // 正在计时状态
            elements.timerCard.classList.remove('hidden');
            elements.statsCard.classList.remove('hidden');
            elements.resetBtn.classList.remove('hidden');
            elements.startBtn.classList.add('hidden');
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
            updateBestStreakDisplay();
        } else {
            // 初始或重置状态
            elements.timerCard.classList.add('hidden');
            elements.statsCard.classList.remove('hidden'); // 仍然显示最佳纪录
            elements.resetBtn.classList.add('hidden');
            elements.startBtn.classList.remove('hidden');
            elements.level.textContent = "尚未开始";
            updateBestStreakDisplay();
        }
        // 随机更新一句引言
        elements.quote.textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
    }

    // --- 事件监听 ---

    /**
     * 开始按钮点击事件
     */
    elements.startBtn.addEventListener('click', () => {
        const now = new Date().getTime();
        localStorage.setItem(storageKeys.startTime, now);
        if (timerInterval) clearInterval(timerInterval);
        updateUI();
    });

    /**
     * 重置按钮点击事件
     */
    elements.resetBtn.addEventListener('click', () => {
        if (confirm('你确定要重置吗？这将结束本次挑战，但你的最佳纪录会被保留。')) {
            checkAndUpdateBestStreak(); // 在重置前，最后检查一次是否创造了新纪录
            localStorage.removeItem(storageKeys.startTime);
            if (timerInterval) clearInterval(timerInterval);
            // 清空计时器显示
            elements.days.textContent = "00";
            elements.hours.textContent = "00";
            elements.minutes.textContent = "00";
            elements.seconds.textContent = "00";
            updateUI();
        }
    });

    // --- 初始化 ---
    function initialize() {
        updateUI();
        // 初始化粒子背景
        particlesJS("particles-js", {
            "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#ffffff" }, "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 5 }, "image": { "src": "img/github.svg", "width": 100, "height": 100 } }, "opacity": { "value": 0.5, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } }, "size": { "value": 3, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false } }, "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 6, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }, "modes": { "grab": { "distance": 400, "line_linked": { "opacity": 1 } }, "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 }, "repulse": { "distance": 200, "duration": 0.4 }, "push": { "particles_nb": 4 }, "remove": { "particles_nb": 2 } } }, "retina_detect": true
        });
    }

    initialize();
});
