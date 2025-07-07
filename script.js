document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素 ---
    const elements = {
        quote: document.getElementById('quote'),
        totalDays: document.getElementById('total-days'),
        currentStreak: document.getElementById('current-streak'),
        bestStreak: document.getElementById('best-streak'),
        checkInBtn: document.getElementById('check-in-btn'),
        calendarMonthYear: document.getElementById('calendar-month-year'),
        calendarGrid: document.getElementById('calendar-grid'),
        prevMonthBtn: document.getElementById('prev-month-btn'),
        nextMonthBtn: document.getElementById('next-month-btn'),
        resetDataBtn: document.getElementById('reset-data-btn'),
    };

    // --- 状态与数据 ---
    const storageKeys = {
        checkIns: 'checkInApp_checkIns',
        bestStreak: 'checkInApp_bestStreak'
    };
    let checkIns = JSON.parse(localStorage.getItem(storageKeys.checkIns)) || [];
    let currentDate = new Date(); // 用于日历导航

    // --- 功能函数 ---

    /**
     * 将日期对象转换为 'YYYY-MM-DD' 格式的字符串
     * @param {Date} date - 日期对象
     * @returns {string}
     */
    const toISODateString = (date) => date.toISOString().split('T')[0];

    /**
     * 保存数据到 localStorage
     */
    const saveData = () => {
        localStorage.setItem(storageKeys.checkIns, JSON.stringify(checkIns));
    };

    /**
     * 计算并更新统计数据
     */
    const updateStats = () => {
        // 1. 总打卡天数
        elements.totalDays.textContent = checkIns.length;

        // 2. 计算连续天数
        let currentStreak = 0;
        if (checkIns.length > 0) {
            const sortedCheckIns = [...checkIns].sort().reverse();
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            // 检查今天是否打卡，或者昨天是否打卡，以确定连续的起点
            if (sortedCheckIns[0] === toISODateString(today) || sortedCheckIns[0] === toISODateString(yesterday)) {
                currentStreak = 1;
                for (let i = 0; i < sortedCheckIns.length - 1; i++) {
                    const current = new Date(sortedCheckIns[i]);
                    const previous = new Date(sortedCheckIns[i+1]);
                    const diff = (current - previous) / (1000 * 60 * 60 * 24);
                    if (diff === 1) {
                        currentStreak++;
                    } else {
                        break; // 连续中断
                    }
                }
            }
        }
        elements.currentStreak.textContent = currentStreak;

        // 3. 更新最长连续天数
        let bestStreak = localStorage.getItem(storageKeys.bestStreak) || 0;
        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
            localStorage.setItem(storageKeys.bestStreak, bestStreak);
        }
        elements.bestStreak.textContent = bestStreak;
    };

    /**
     * 渲染日历
     */
    const renderCalendar = () => {
        elements.calendarGrid.innerHTML = ''; // 清空日历
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        elements.calendarMonthYear.textContent = `${year}年 ${month + 1}月`;

        // 渲染星期几的表头
        ['日', '一', '二', '三', '四', '五', '六'].forEach(day => {
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'day-name';
            dayNameEl.textContent = day;
            elements.calendarGrid.appendChild(dayNameEl);
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 填充月初的空白格子
        for (let i = 0; i < firstDayOfMonth; i++) {
            elements.calendarGrid.appendChild(document.createElement('div'));
        }

        // 填充日期格子
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.textContent = day;
            
            const cellDateStr = toISODateString(new Date(year, month, day));
            const todayStr = toISODateString(new Date());

            if (cellDateStr === todayStr) {
                dayCell.classList.add('today');
            }
            if (checkIns.includes(cellDateStr)) {
                dayCell.classList.add('checked-in');
            }
            elements.calendarGrid.appendChild(dayCell);
        }
    };

    /**
     * 更新打卡按钮的状态
     */
    const updateCheckInButton = () => {
        const todayStr = toISODateString(new Date());
        if (checkIns.includes(todayStr)) {
            elements.checkInBtn.textContent = '今日已打卡';
            elements.checkInBtn.disabled = true;
        } else {
            elements.checkInBtn.textContent = '今日打卡';
            elements.checkInBtn.disabled = false;
        }
    };

    /**
     * 更新整个UI
     */
    const updateUI = () => {
        updateStats();
        renderCalendar();
        updateCheckInButton();
    };

    // --- 事件监听 ---

    // 打卡按钮
    elements.checkInBtn.addEventListener('click', () => {
        const todayStr = toISODateString(new Date());
        if (!checkIns.includes(todayStr)) {
            checkIns.push(todayStr);
            saveData();
            updateUI();
        }
    });

    // 上个月
    elements.prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    // 下个月
    elements.nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // 重置数据
    elements.resetDataBtn.addEventListener('click', () => {
        if (confirm('警告：这将清除您所有的打卡记录和最长连续记录。确定要重置吗？')) {
            checkIns = [];
            localStorage.removeItem(storageKeys.checkIns);
            localStorage.removeItem(storageKeys.bestStreak);
            updateUI();
        }
    });

    // --- 初始化 ---
    updateUI();
});
