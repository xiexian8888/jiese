document.addEventListener('DOMContentLoaded', () => {
    // --- 元素获取 ---
    // (为简洁，在函数中直接获取或假定存在)

    // --- 全局状态 ---
    const storageKeys = { data: 'checkInPhoenix_data', theme: 'checkInPhoenix_theme' };
    let state = {
        checkIns: {}, // { 'YYYY-MM-DD': { status: 'success' | 'failure', note: '...' } }
        bestStreak: 0,
    };
    let currentDate = new Date();
    let modalTarget = { date: null, status: null };
    let monthlyChartInstance = null;
    let weekdayChartInstance = null;
    const quotes = ["数据不会说谎，它照亮你前行的路。", "每一次复盘，都是为了下一次更好的出发。", "洞察你的模式，掌控你的生活。", "坚持很酷，但有策略的坚持更酷。"];

    // --- 初始化 ---
    const init = () => {
        // ... (省略预加载动画，与Vivid版相同)
        setTimeout(() => {
            document.getElementById('preloader').style.opacity = '0';
            document.querySelector('.container').style.opacity = '1';
            setTimeout(() => document.getElementById('preloader').style.display = 'none', 500);
        }, 500);
        
        loadState();
        initTheme();
        updateUI();
        addEventListeners();
    };

    // --- 数据持久化 ---
    const toISODateString = (date) => date.toISOString().split('T')[0];
    const saveState = () => localStorage.setItem(storageKeys.data, JSON.stringify(state));
    const loadState = () => {
        const savedData = localStorage.getItem(storageKeys.data);
        if (savedData) state = JSON.parse(savedData);
    };

    // --- 主UI更新函数 ---
    const updateUI = () => {
        updateStats();
        renderCalendar();
        updateLogButton();
        renderCharts();
        renderActivityLog();
        document.getElementById('quote').textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
    };

    // --- 统计计算 ---
    const updateStats = () => { /* ... (与 Vivid 版相同，此处省略以保持简洁) ... */ };

    // --- 渲染日历 ---
    const renderCalendar = () => { /* ... (与 Vivid 版相同，此处省略) ... */ };
    
    // --- 渲染图表 ---
    const renderCharts = () => {
        // 准备数据
        const monthlyData = { labels: [], success: [], failure: [] };
        const weekdayData = { success: Array(7).fill(0), failure: Array(7).fill(0) }; // 0:Sun, 6:Sat
        const sortedDates = Object.keys(state.checkIns).sort();

        sortedDates.forEach(dateStr => {
            const date = new Date(dateStr);
            const monthLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData.labels.includes(monthLabel)) {
                monthlyData.labels.push(monthLabel);
                monthlyData.success.push(0);
                monthlyData.failure.push(0);
            }
            const monthIndex = monthlyData.labels.indexOf(monthLabel);
            const record = state.checkIns[dateStr];
            if (record.status === 'success') {
                monthlyData.success[monthIndex]++;
                weekdayData.success[date.getDay()]++;
            } else {
                monthlyData.failure[monthIndex]++;
                weekdayData.failure[date.getDay()]++;
            }
        });

        // 渲染月度图表
        const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
        if (monthlyChartInstance) monthlyChartInstance.destroy();
        monthlyChartInstance = new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    { label: '成功', data: monthlyData.success, backgroundColor: 'rgba(46, 204, 113, 0.7)' },
                    { label: '失败', data: monthlyData.failure, backgroundColor: 'rgba(231, 76, 60, 0.7)' }
                ]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
        
        // 渲染周趋势图表
        const weekdayCtx = document.getElementById('weekday-chart').getContext('2d');
        if (weekdayChartInstance) weekdayChartInstance.destroy();
        weekdayChartInstance = new Chart(weekdayCtx, {
            type: 'radar',
            data: {
                labels: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                datasets: [
                    { label: '成功次数', data: weekdayData.success, backgroundColor: 'rgba(46, 204, 113, 0.2)', borderColor: 'rgba(46, 204, 113, 1)', pointBackgroundColor: 'rgba(46, 204, 113, 1)' }
                ]
            },
            options: { responsive: true, elements: { line: { tension: 0.1 } } }
        });
    };

    // --- 渲染活动日志 ---
    const renderActivityLog = () => {
        const tableBody = document.querySelector('#activity-log-table tbody');
        tableBody.innerHTML = '';
        const sortedDates = Object.keys(state.checkIns).sort((a, b) => new Date(b) - new Date(a));
        
        if (sortedDates.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">暂无记录</td></tr>`;
            return;
        }

        sortedDates.forEach(dateStr => {
            const record = state.checkIns[dateStr];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateStr}</td>
                <td><span class="status-${record.status}">${record.status === 'success' ? '成功' : '失败'}</span></td>
                <td>${record.note || '<i>无笔记</i>'}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    const updateLogButton = () => { /* ... (与 Vivid 版相同) ... */ };
    const triggerConfetti = () => { /* ... (与 Vivid 版相同) ... */ };
    const shakeModal = () => { /* ... (与 Vivid 版相同) ... */ };
    const openModal = (id) => document.getElementById(id).classList.remove('hidden');
    const closeModal = (id) => document.getElementById(id).classList.add('hidden');
    const handleLogDay = (status) => { /* ... (与 Vivid 版相同) ... */ };
    
    // --- 事件监听器 ---
    const addEventListeners = () => {
        // 标签页切换
        document.querySelector('.tab-nav').addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.tab-btn');
            if (!targetBtn) return;

            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            targetBtn.classList.add('active');
            document.getElementById(`${targetBtn.dataset.tab}-view`).classList.add('active');
        });

        // 其他事件监听器 (按钮点击等，与Vivid版逻辑相同)
        /* ... (此处省略与 Vivid 版相同的事件监听代码以保持简洁) ... */
    };
    
    const initTheme = () => { /* ... (与 Vivid 版相同) ... */ };
    
    // --- 启动 APP ---
    init();

    // 将 Vivid 版省略的函数和事件监听器补全
    const vividCode = {
        updateStats: () => {
            const dates = Object.keys(state.checkIns).sort();
            const successCount = dates.filter(d => state.checkIns[d].status === 'success').length;
            const totalCount = dates.length;
            
            document.getElementById('total-success-days').textContent = successCount;
            document.getElementById('success-rate').textContent = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;
            
            let currentStreak = 0;
            const sortedDates = dates.slice().sort((a,b) => new Date(a) - new Date(b));
            let streak = 0;
            let lastDate = null;
            for(const dateStr of sortedDates) {
                if (state.checkIns[dateStr].status === 'success') {
                    if (lastDate) {
                        const diff = (new Date(dateStr) - lastDate) / (1000 * 60 * 60 * 24);
                        if (diff === 1) {
                            streak++;
                        } else {
                            streak = 1;
                        }
                    } else {
                        streak = 1;
                    }
                    lastDate = new Date(dateStr);
                    if (streak > currentStreak) currentStreak = streak;
                } else {
                    streak = 0;
                    lastDate = null;
                }
            }

            document.getElementById('current-streak').textContent = currentStreak;
            if (currentStreak > state.bestStreak) state.bestStreak = currentStreak;
            document.getElementById('best-streak').textContent = state.bestStreak;
        },
        renderCalendar: () => {
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
                    cell.classList.add(record.status);
                    if (record.note) cell.classList.add('has-note');
                }
                grid.appendChild(cell);
            }
        },
        updateLogButton: () => { document.getElementById('log-day-btn').disabled = !!state.checkIns[toISODateString(new Date())]; },
        triggerConfetti: () => { if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); },
        shakeModal: (modal) => { modal.classList.add('shake'); setTimeout(() => modal.classList.remove('shake'), 820); },
        handleLogDay: (status) => {
            modalTarget = { date: toISODateString(new Date()), status };
            closeModal('choice-modal');
            document.getElementById('modal-title').textContent = status === 'success' ? '记录一次成功 ✨' : '反思一次失败 🤔';
            document.getElementById('note-textarea').value = '';
            openModal('note-modal');
        },
        addEventListeners: () => {
             document.querySelector('.tab-nav').addEventListener('click', (e) => {
                const targetBtn = e.target.closest('.tab-btn');
                if (!targetBtn) return;
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                targetBtn.classList.add('active');
                document.getElementById(`${targetBtn.dataset.tab}-view`).classList.add('active');
            });
            document.getElementById('log-day-btn').addEventListener('click', () => openModal('choice-modal'));
            document.getElementById('success-btn').addEventListener('click', () => vividCode.handleLogDay('success'));
            document.getElementById('failure-btn').addEventListener('click', () => {
                vividCode.shakeModal(document.querySelector('#choice-modal .modal-content'));
                setTimeout(() => vividCode.handleLogDay('failure'), 200);
            });
            document.getElementById('save-note-btn').addEventListener('click', () => {
                const { date, status } = modalTarget;
                if (!date) return;
                state.checkIns[date] = { status: status, note: document.getElementById('note-textarea').value };
                if (status === 'success') vividCode.triggerConfetti();
                closeModal('note-modal');
                updateUI();
                saveState();
            });
            document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.modalId)));
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
            document.getElementById('prev-month-btn').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); vividCode.renderCalendar(); });
            document.getElementById('next-month-btn').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); vividCode.renderCalendar(); });
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
                a.download = `行动日志Phoenix_备份_${toISODateString(new Date())}.json`;
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
        },
        initTheme: () => {
            const savedTheme = localStorage.getItem(storageKeys.theme) || 'light';
            document.documentElement.dataset.theme = savedTheme;
            document.getElementById('theme-toggle').checked = savedTheme === 'dark';
        }
    };
    // 注入并替换省略的函数
    updateStats = vividCode.updateStats;
    renderCalendar = vividCode.renderCalendar;
    updateLogButton = vividCode.updateLogButton;
    triggerConfetti = vividCode.triggerConfetti;
    shakeModal = vividCode.shakeModal;
    handleLogDay = vividCode.handleLogDay;
    addEventListeners = vividCode.addEventListeners;
    initTheme = vividCode.initTheme;

    init();
});
