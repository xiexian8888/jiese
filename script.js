document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素 ---
    const elements = {
        preloader: document.getElementById('preloader'),
        container: document.querySelector('.container'),
        // ... (其他元素与上一版类似，但为简洁省略，将在函数中直接使用)
    };

    // --- 状态与数据 ---
    const storageKeys = { data: 'checkInVivid_data', theme: 'checkInVivid_theme' };
    let state = {
        checkIns: {}, // 数据结构: { 'YYYY-MM-DD': { status: 'success' | 'failure', note: '...' } }
        bestStreak: 0,
    };
    let currentDate = new Date();
    let modalTarget = { date: null, status: null };

    // --- 初始化函数 ---
    const init = () => {
        // 加载动画
        setTimeout(() => {
            elements.preloader.style.opacity = '0';
            elements.container.style.opacity = '1';
            setTimeout(() => elements.preloader.style.display = 'none', 500);
        }, 500);

        loadState();
        initTheme();
        updateUI();
        addEventListeners();
    };
    
    // --- 数据处理 ---
    const toISODateString = (date) => date.toISOString().split('T')[0];
    const saveState = () => localStorage.setItem(storageKeys.data, JSON.stringify(state));
    const loadState = () => {
        const savedData = localStorage.getItem(storageKeys.data);
        if (savedData) state = JSON.parse(savedData);
    };

    // --- UI 更新 ---
    const updateUI = () => {
        updateStats();
        renderCalendar();
        updateLogButton();
        document.getElementById('quote').textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
    };

    const updateStats = () => {
        const dates = Object.keys(state.checkIns).sort();
        const successCount = dates.filter(d => state.checkIns[d].status === 'success').length;
        const totalCount = dates.length;
        
        document.getElementById('total-success-days').textContent = successCount;
        document.getElementById('success-rate').textContent = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(0) : 0;
        
        // 计算连胜
        let currentStreak = 0;
        const reversedDates = dates.reverse();
        for (const dateStr of reversedDates) {
            if (state.checkIns[dateStr].status === 'success') {
                const current = new Date(dateStr);
                const previousDate = new Date(current);
                previousDate.setDate(current.getDate() - 1);
                const previousDateStr = toISODateString(previousDate);
                if (reversedDates.includes(previousDateStr) && state.checkIns[previousDateStr].status === 'success') {
                     if (currentStreak === 0) currentStreak = 2; else currentStreak++;
                } else {
                    if (currentStreak === 0) currentStreak = 1;
                    break;
                }
            } else {
                break;
            }
        }
        
        document.getElementById('current-streak').textContent = currentStreak;
        if (currentStreak > state.bestStreak) state.bestStreak = currentStreak;
        document.getElementById('best-streak').textContent = state.bestStreak;
    };

    const renderCalendar = () => {
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        document.getElementById('calendar-month-year').textContent = `${year}年 ${month + 1}月`;
        
        ['日','一','二','三','四','五','六'].forEach(d => grid.innerHTML += `<div class="day-name">${d}</div>`);
        const firstDay = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="empty"></div>`;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.textContent = day;
            const dateStr = toISODateString(new Date(year, month, day));
            cell.dataset.date = dateStr;
            if (dateStr === toISODateString(new Date())) cell.classList.add('today');
            
            const record = state.checkIns[dateStr];
            if (record) {
                cell.classList.add(record.status); // 'success' or 'failure'
                if (record.note) cell.classList.add('has-note');
            }
            grid.appendChild(cell);
        }
    };
    
    const updateLogButton = () => {
        const btn = document.getElementById('log-day-btn');
        btn.disabled = !!state.checkIns[toISODateString(new Date())];
    };

    // --- 特效 ---
    const triggerConfetti = () => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    const shakeModal = (modal) => {
        modal.classList.add('shake');
        setTimeout(() => modal.classList.remove('shake'), 820);
    };
    
    // --- 弹窗逻辑 ---
    const openModal = (id) => document.getElementById(id).classList.remove('hidden');
    const closeModal = (id) => document.getElementById(id).classList.add('hidden');

    const handleLogDay = (status) => {
        modalTarget = { date: toISODateString(new Date()), status };
        closeModal('choice-modal');
        document.getElementById('modal-title').textContent = status === 'success' ? '记录一次成功 ✨' : '反思一次失败 🤔';
        document.getElementById('note-textarea').value = '';
        openModal('note-modal');
    };

    // --- 事件监听 ---
    const addEventListeners = () => {
        document.getElementById('log-day-btn').addEventListener('click', () => openModal('choice-modal'));
        document.getElementById('success-btn').addEventListener('click', () => handleLogDay('success'));
        document.getElementById('failure-btn').addEventListener('click', () => {
             shakeModal(document.querySelector('#choice-modal .modal-content'));
             setTimeout(() => handleLogDay('failure'), 200);
        });

        document.getElementById('save-note-btn').addEventListener('click', () => {
            const { date, status } = modalTarget;
            state.checkIns[date] = {
                status: status,
                note: document.getElementById('note-textarea').value
            };
            if (status === 'success') triggerConfetti();
            closeModal('note-modal');
            updateUI();
            saveState();
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => closeModal(btn.dataset.modalId));
        });
        
        document.getElementById('calendar-grid').addEventListener('click', (e) => {
            const target = e.target.closest('.day-cell');
            if (target && target.dataset.date) {
                const record = state.checkIns[target.dataset.date];
                if (record) {
                    modalTarget = { date: target.dataset.date, status: record.status };
                    document.getElementById('modal-title').textContent = `查看 ${target.dataset.date}`;
                    document.getElementById('note-textarea').value = record.note;
                    openModal('note-modal');
                }
            }
        });

        // 月份导航、主题切换、数据导入导出（与上一版类似，但确保稳定）
        document.getElementById('prev-month-btn').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        document.getElementById('next-month-btn').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('change', () => {
            const theme = themeToggle.checked ? 'dark' : 'light';
            document.documentElement.dataset.theme = theme;
            localStorage.setItem(storageKeys.theme, theme);
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            const dataStr = JSON.stringify(state, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `行动日志Vivid_备份_${toISODateString(new Date())}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        });

        const importFile = document.getElementById('import-file');
        document.getElementById('import-btn').addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedState = JSON.parse(event.target.result);
                    if (importedState.checkIns && typeof importedState.bestStreak !== 'undefined') {
                        state = importedState;
                        saveState(); updateUI(); alert('数据导入成功！');
                    } else { alert('文件格式无效！'); }
                } catch { alert('导入失败，文件内容可能已损坏。'); }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    };

    const initTheme = () => {
        const savedTheme = localStorage.getItem(storageKeys.theme) || 'light';
        document.documentElement.dataset.theme = savedTheme;
        document.getElementById('theme-toggle').checked = savedTheme === 'dark';
    };
    
    // 全局引用
    const quotes = [ "伟大的事业，不是靠力量，而是靠坚持来完成的。", "每天的涓滴之水，终将磨损坚硬的磐石。", "自律的代价是痛苦，不自律的代价是更大的痛苦。", "你当像鸟飞往你的山。", "种一棵树最好的时间是十年前，其次是现在。", "千里之行，始于足下。" ];

    // 启动 App
    init();
});
