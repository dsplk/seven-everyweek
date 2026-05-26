// ========== 主应用逻辑 ==========

// ========== 登录注册功能 ==========
function checkLoginStatus() {
    if (Storage.isLoggedIn()) {
        showMainApp();
    } else {
        showAuthPage();
    }
}

function showAuthPage() {
    document.getElementById('auth-page').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function showMainApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    refreshAll();
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('auth-error').textContent = '';
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!username || !password) {
        errorEl.textContent = '请输入用户名和密码';
        return;
    }
    
    const result = Storage.login(username, password);
    if (result.success) {
        showMainApp();
    } else {
        errorEl.textContent = result.message;
    }
}

function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!username || !password) {
        errorEl.textContent = '请填写所有字段';
        return;
    }
    if (password.length < 4) {
        errorEl.textContent = '密码至少4位';
        return;
    }
    if (password !== passwordConfirm) {
        errorEl.textContent = '两次密码不一致';
        return;
    }
    
    const result = Storage.register(username, password);
    if (result.success) {
        Storage.login(username, password);
        showMainApp();
    } else {
        errorEl.textContent = result.message;
    }
}

function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        Storage.logout();
        Storage.clearCurrentUserData();
        showAuthPage();
    }
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

// 图表实例
let energyChart = null;
let dietChart = null;

// 页面切换
function switchTab(pageName, tabEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageName).classList.add('active');

    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');

    const titles = { home: '一周七练', workout: '训练计划', meal: '饮食记录', ai: 'AI 健身助手', profile: '我的' };
    document.getElementById('page-title').textContent = titles[pageName] || '一周七练';

    if (pageName === 'home') refreshHome();
    if (pageName === 'meal') {
        refreshMeals();
        renderCustomFoodList();
    }
    if (pageName === 'profile') refreshProfile();
    if (pageName === 'workout') {
        // 重置训练页面的显示状态
        document.querySelector('.workout-categories').style.display = '';
        document.querySelectorAll('#page-workout .section-title, #page-workout .btn-add').forEach(el => el.style.display = '');
        document.getElementById('plan-list').style.display = '';
        document.getElementById('workout-detail').style.display = 'none';
        refreshPlans();
    }
}

// ========== 全局刷新 ==========
function refreshAll() {
    refreshHome();
    refreshProfile();
    refreshMeal();
    renderWorkoutPlans();
}

// ========== 首页功能 ==========
function refreshHome() {
    // 今日训练状态
    const records = Storage.getTodayWorkoutRecords();
    const plans = Storage.getTodayWorkoutPlans();
    const completedSets = records.length;
    const totalPlannedSets = plans.reduce((sum, p) => sum + (p.sets || 0), 0);
    
    const workoutEl = document.getElementById('today-workout');
    if (workoutEl) {
        if (completedSets > 0) {
            workoutEl.textContent = completedSets + (totalPlannedSets > 0 ? '/' + totalPlannedSets : '') + '组';
            workoutEl.style.color = completedSets >= totalPlannedSets ? 'var(--primary)' : 'var(--warning)';
        } else if (totalPlannedSets > 0) {
            workoutEl.textContent = totalPlannedSets + '组待完成';
            workoutEl.style.color = 'var(--warning)';
        } else {
            workoutEl.textContent = '未完成';
            workoutEl.style.color = 'var(--text-secondary)';
        }
    }

    // 今日热量统计
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    const profile = Storage.getProfile();
    const bmr = Math.round((profile.weight || 70) * 24 * 1.2);
    
    const meals = Storage.getMeals().filter(m => m.date === todayStr);
    const intake = meals.reduce((sum, m) => sum + (m.cal || 0), 0);
    
    const workouts = Storage.getWorkoutRecords().filter(r => r.date === todayStr);
    const burned = workouts.reduce((sum, r) => sum + (r.calories || 0), 0);
    const totalBurned = burned + bmr;
    const balance = intake - totalBurned;

    const intakeEl = document.getElementById('today-intake');
    const burnedEl = document.getElementById('today-burned');
    const balanceEl = document.getElementById('today-balance');
    if (intakeEl) intakeEl.textContent = intake;
    if (burnedEl) burnedEl.textContent = totalBurned;
    if (balanceEl) {
        balanceEl.textContent = (balance >= 0 ? '+' : '') + balance;
        balanceEl.style.color = balance >= 0 ? '#ff3b30' : '#34c759';
    }

    // 渲染GitHub风格打卡热力图
    renderContributionCalendar();

    // 今日训练列表（按组显示）
    renderTodayWorkoutList();
    
    // 图表
    renderEnergyChart();
    renderDietChart();
}

// ========== GitHub风格打卡热力图（格子版） ==========
let calendarWeeks = 13; // 默认近1月（约13周）

function switchCalendarRange(weeks, btn) {
    calendarWeeks = weeks;
    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderContributionCalendar();
}

function renderContributionCalendar() {
    const container = document.getElementById('calendar-graph');
    if (!container) return;

    // 获取所有训练记录
    const allRecords = Storage.getWorkoutRecords();
    const recordsByDate = {};
    
    allRecords.forEach(record => {
        const date = record.date;
        if (!recordsByDate[date]) {
            recordsByDate[date] = { calories: 0, sets: 0 };
        }
        recordsByDate[date].calories += (record.calories || 0);
        recordsByDate[date].sets += 1;
    });

    function formatDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // 计算起始日期：从今天往前推 calendarWeeks 周
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (calendarWeeks * 7) + 1);
    // 对齐到周日
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);
    startDate.setHours(0, 0, 0, 0);

    // 计算总周数（从 startDate 到 today）
    const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    let html = '';

    // 月份标签行
    html += '<div class="calendar-months">';
    let lastMonth = -1;
    for (let w = 0; w < totalWeeks; w++) {
        const firstDayOfWeek = new Date(startDate);
        firstDayOfWeek.setDate(startDate.getDate() + w * 7);
        const m = firstDayOfWeek.getMonth();
        if (m !== lastMonth) {
            let span = 1;
            for (let w2 = w + 1; w2 < totalWeeks; w2++) {
                const d2 = new Date(startDate);
                d2.setDate(startDate.getDate() + w2 * 7);
                if (d2.getMonth() === m) span++;
                else break;
            }
            html += `<span style="width:${span * 15}px;text-align:left;font-size:11px;color:#666;flex-shrink:0;">${monthNames[m]}</span>`;
            lastMonth = m;
        } else {
            html += '<span></span>';
        }
    }
    html += '</div>';

    // 主体：星期标签 + 格子
    html += '<div class="calendar-body">';
    
    // 左侧星期标签
    html += '<div class="calendar-week-labels">';
    dayNames.forEach(name => {
        html += `<span class="week-label">${name}</span>`;
    });
    html += '</div>';

    // 格子区域
    html += '<div class="calendar-grid-scroll"><div class="calendar-grid">';
    
    for (let w = 0; w < totalWeeks; w++) {
        html += '<div class="calendar-week-column">';
        
        for (let d = 0; d < 7; d++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + w * 7 + d);
            
            if (currentDate > today) {
                html += '<div class="calendar-day-cell" style="background:transparent;cursor:default;"></div>';
                continue;
            }
            
            const dateStr = formatDate(currentDate);
            const dayData = recordsByDate[dateStr];
            
            let level = 0;
            if (dayData) {
                const calories = dayData.calories;
                if (calories >= 500) level = 4;
                else if (calories >= 300) level = 3;
                else if (calories >= 150) level = 2;
                else level = 1;
            }
            
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            const dayName = '周' + dayNames[currentDate.getDay()];
            
            const tooltipText = dayData 
                ? `${month}月${day}日 ${dayName}: ${dayData.sets}组训练, ${Math.round(dayData.calories)}千卡`
                : `${month}月${day}日 ${dayName}: 休息`;
            
            html += `<div class="calendar-day-cell level-${level}" 
                         onmouseenter="showBarTooltip(this,'${tooltipText}')" 
                         onmouseleave="hideBarTooltip()"></div>`;
        }
        
        html += '</div>';
    }
    
    html += '</div></div>';
    html += '</div>';

    container.innerHTML = html;
}

function showBarTooltip(el, text) {
    hideBarTooltip();
    const tip = document.createElement('div');
    tip.className = 'bar-tooltip';
    tip.textContent = text;
    document.body.appendChild(tip);
    
    // 获取格子位置，将 tooltip 放在格子上方居中
    const rect = el.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    let top = rect.top - tipRect.height - 8;
    
    // 边界检测
    if (left < 4) left = 4;
    if (left + tipRect.width > window.innerWidth - 4) left = window.innerWidth - tipRect.width - 4;
    if (top < 4) {
        top = rect.bottom + 8; // 放到下方
    }
    
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
}

function hideBarTooltip() {
    const old = document.querySelector('.bar-tooltip');
    if (old) old.remove();
}

function renderTodayWorkoutList() {
    const container = document.getElementById('today-workout-list');
    const plans = Storage.getTodayWorkoutPlans();
    const records = Storage.getTodayWorkoutRecords();
    const today = getToday();

    if (plans.length === 0 && records.length === 0) {
        container.innerHTML = '<p class="empty-hint">今日暂无训练，去训练页面添加计划吧！</p>';
        return;
    }

    let html = '';

    // 按动作分组显示
    const actionGroups = {};
    
    // 先按动作分组计划
    plans.forEach(plan => {
        if (!actionGroups[plan.exercise]) {
            actionGroups[plan.exercise] = { plan: plan, completed: 0, sets: [] };
        }
    });
    
    // 再统计已完成的组
    records.forEach(record => {
        if (actionGroups[record.exercise]) {
            actionGroups[record.exercise].completed++;
            actionGroups[record.exercise].sets.push(record);
        } else {
            // 没有计划的额外记录
            if (!actionGroups[record.exercise]) {
                actionGroups[record.exercise] = { plan: null, completed: 0, sets: [] };
            }
            actionGroups[record.exercise].completed++;
            actionGroups[record.exercise].sets.push(record);
        }
    });

    // 渲染每个动作
    for (const [exercise, data] of Object.entries(actionGroups)) {
        const plan = data.plan;
        const completed = data.completed;
        const targetSets = plan ? plan.sets : completed;
        const weight = plan ? plan.weight : (data.sets[0] ? data.sets[0].weight : 0);
        const reps = plan ? plan.reps : (data.sets[0] ? data.sets[0].reps : 0);
        const duration = plan ? (plan.duration || 0) : (data.sets[0] ? (data.sets[0].duration || 0) : 0);
        const isWeight = isWeightBasedExercise(exercise);
        
        // 显示描述
        const planDesc = isWeight 
            ? `${weight}kg × ${reps}次` 
            : `${duration || 10}分钟${reps ? ' × ' + reps + '次' : ''}`;
        
        html += `
            <div class="action-group">
                <div class="action-header">
                    <div class="action-name">${exercise}</div>
                    <div class="action-plan">${completed}/${targetSets}组 ${planDesc}</div>
                </div>
                <div class="sets-container">
        `;
        
        // 显示已完成的组
        data.sets.forEach((set, index) => {
            const setDesc = isWeight 
                ? `${set.weight || 0}kg × ${set.reps || 0}次` 
                : `${set.duration || 0}分钟${set.reps ? ' × ' + set.reps + '次' : ''}`;
            html += `
                <div class="set-item completed">
                    <div class="set-info">
                        <span class="set-number">${index + 1}</span>
                        <span class="set-detail">${setDesc}</span>
                    </div>
                    <div class="set-actions">
                        <span class="set-cal">🔥 ${set.calories || 0}千卡</span>
                        <span class="set-done-badge">✓ 完成</span>
                        <button class="btn-delete-set" onclick="deleteWorkoutRecord(${set.id})">✕</button>
                    </div>
                </div>
            `;
        });
        
        // 显示待完成的组（根据计划）
        if (plan && completed < targetSets) {
            const pendingDesc = isWeight 
                ? `计划: ${plan.weight}kg × ${plan.reps}次` 
                : `计划: ${plan.duration || 10}分钟`;
            for (let i = completed + 1; i <= targetSets; i++) {
                html += `
                    <div class="set-item">
                        <div class="set-info">
                            <span class="set-number">${i}</span>
                            <span class="set-detail">${pendingDesc}</span>
                        </div>
                        <div class="set-actions">
                            <button class="btn-complete-set" onclick="showCompleteSetDialog('${exercise}', ${plan.weight || 0}, ${plan.reps || 0}, ${plan.duration || 0})">完成</button>
                        </div>
                    </div>
                `;
            }
        }
        
        // 添加额外组的按钮
        html += `
                </div>
                <button class="btn-add-set" onclick="showCompleteSetDialog('${exercise}', ${weight || 0}, ${reps || 0}, ${duration || 0})">+ 加一组</button>
            </div>
        `;
    }

    container.innerHTML = html;
}

function showCompleteSetDialog(exercise, defaultWeight, defaultReps, defaultDuration) {
    const isWeight = isWeightBasedExercise(exercise);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    let formFields = '';
    if (isWeight) {
        formFields = `
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;">实际重量 (kg)</label>
            <input type="number" id="set-weight" placeholder="重量" class="input-field" value="${defaultWeight || 0}">
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;margin-top:12px;">实际次数</label>
            <input type="number" id="set-reps" placeholder="次数" class="input-field" value="${defaultReps || 10}">
        `;
    } else {
        formFields = `
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;">实际时长 (分钟)</label>
            <input type="number" id="set-duration" placeholder="时长(分钟)" class="input-field" value="${defaultDuration || 10}">
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;margin-top:12px;">实际次数 (可选)</label>
            <input type="number" id="set-reps" placeholder="次数(可选)" class="input-field" value="${defaultReps || ''}">
        `;
    }
    
    overlay.innerHTML = `
        <div class="modal-content">
            <h3>完成 ${exercise}</h3>
            ${formFields}
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="btn-secondary" style="flex:1;" onclick="closeModal()">取消</button>
                <button class="btn-primary" style="flex:1;" onclick="completeSet('${exercise}', ${isWeight})">确认完成</button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
}

function completeSet(exercise, isWeight) {
    const weightEl = document.getElementById('set-weight');
    const repsEl = document.getElementById('set-reps');
    const durationEl = document.getElementById('set-duration');
    
    const weight = isWeight ? (parseFloat(weightEl?.value) || 0) : 0;
    const reps = parseInt(repsEl?.value) || 0;
    const duration = !isWeight ? (parseFloat(durationEl?.value) || 0) : 0;
    
    if (isWeight && (weight <= 0 || reps <= 0)) {
        showToast('请输入有效的重量和次数');
        return;
    }
    if (!isWeight && duration <= 0) {
        showToast('请输入有效的时长');
        return;
    }
    
    const record = Storage.addWorkoutRecord({ exercise, weight, reps, duration });
    closeModal();
    refreshHome();
    showToast(`完成第${Storage.getCompletedSets(exercise, getToday())}组！🔥${record.calories}千卡`);
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(m => m.remove());
}

function deleteWorkoutRecord(id) {
    if (confirm('确定删除这组训练记录吗？')) {
        Storage.removeWorkoutRecord(id);
        refreshHome();
    }
}

function doCheckIn() {
    if (Storage.isCheckedInToday()) {
        showToast('今天已经打过卡了！明天继续加油 💪');
        return;
    }
    Storage.addCheckIn();
    showToast('打卡成功！🎉 连续 ' + Storage.getStreak() + ' 天');
    refreshHome();
}

let energyDays = 7;

function switchEnergyRange(days, btn) {
    energyDays = days;
    btn.parentElement.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderEnergyChart();
}

function renderEnergyChart() {
    const ctx = document.getElementById('energy-chart');
    if (!ctx) return;

    const data = Storage.getEnergyData(energyDays);

    if (energyChart) {
        energyChart.destroy();
    }

    // 计算热量缺口颜色（股市风格：缺口>0绿色涨，缺口<0红色跌）
    const deficitColors = data.map(d => {
        const deficit = d.burned + d.bmr - d.intake; // 消耗 - 摄入
        return deficit >= 0 ? 'rgba(52, 199, 89, 0.8)' : 'rgba(255, 59, 48, 0.8)'; // 绿涨红跌
    });
    
    const deficitBorderColors = data.map(d => {
        const deficit = d.burned + d.bmr - d.intake;
        return deficit >= 0 ? 'rgba(52, 199, 89, 1)' : 'rgba(255, 59, 48, 1)';
    });

    energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: '摄入',
                    data: data.map(d => d.intake),
                    backgroundColor: 'rgba(255, 149, 0, 0.8)', // 橙色表示摄入
                    borderRadius: 4,
                    order: 2
                },
                {
                    label: '总消耗',
                    data: data.map(d => d.burned + d.bmr),
                    backgroundColor: 'rgba(0, 122, 255, 0.8)', // 蓝色表示消耗
                    borderRadius: 4,
                    order: 3
                },
                {
                    label: '热量缺口',
                    data: data.map(d => d.burned + d.bmr - d.intake), // 消耗 - 摄入
                    type: 'line',
                    borderColor: 'rgba(100, 100, 100, 0.5)',
                    backgroundColor: 'rgba(100, 100, 100, 0.1)',
                    pointBackgroundColor: deficitColors,
                    pointBorderColor: deficitBorderColors,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y + '千卡';
                            if (context.dataset.label === '热量缺口') {
                                const val = context.parsed.y;
                                label += val >= 0 ? ' (减脂中↑)' : ' (增重中↓)';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    title: { display: true, text: '热量(千卡)' }
                },
                y1: { 
                    position: 'right', 
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: '热量缺口(千卡)' },
                    ticks: {
                        callback: function(value) {
                            return value >= 0 ? '+' + value : value;
                        }
                    }
                }
            }
        }
    });
}

let dietDays = 7;

function switchDietRange(days, btn) {
    dietDays = days;
    btn.parentElement.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderDietChart();
}

function renderDietChart() {
    const ctx = document.getElementById('diet-chart');
    if (!ctx) return;

    const data = Storage.getDietData(dietDays);

    // 计算摄入总量
    const totalProtein = data.reduce((sum, d) => sum + d.protein, 0);
    const totalCarb = data.reduce((sum, d) => sum + d.carb, 0);
    const totalFat = data.reduce((sum, d) => sum + d.fat, 0);

    // 更新统计显示
    const proteinEl = document.getElementById('diet-total-protein');
    const carbEl = document.getElementById('diet-total-carb');
    const fatEl = document.getElementById('diet-total-fat');

    if (proteinEl) proteinEl.textContent = Math.round(totalProtein) + 'g';
    if (carbEl) carbEl.textContent = Math.round(totalCarb) + 'g';
    if (fatEl) fatEl.textContent = Math.round(totalFat) + 'g';

    if (dietChart) {
        dietChart.destroy();
    }

    dietChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: '蛋白质',
                    data: data.map(d => d.protein),
                    borderColor: 'rgba(255, 59, 48, 1)',
                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: '碳水',
                    data: data.map(d => d.carb),
                    borderColor: 'rgba(255, 149, 0, 1)',
                    backgroundColor: 'rgba(255, 149, 0, 0.1)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: '脂肪',
                    data: data.map(d => d.fat),
                    borderColor: 'rgba(52, 199, 89, 1)',
                    backgroundColor: 'rgba(52, 199, 89, 0.1)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += Math.round(context.parsed.y * 10) / 10 + 'g';
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    title: { display: true, text: '摄入量(g)' }
                },
                x: {
                    ticks: {
                        maxTicksLimit: 10
                    }
                }
            }
        }
    });
}

function renderRecentRecords() {
    const container = document.getElementById('recent-records');
    const checkins = Storage.getCheckIns().slice(-5).reverse();
    const meals = Storage.getMeals().slice(-5).reverse();
    const workouts = Storage.getWorkoutRecords().slice(-5).reverse();

    const records = [
        ...checkins.map(c => ({ type: 'checkin', text: '完成打卡', date: c.date, time: c.time, icon: '✅' })),
        ...meals.map(m => ({ type: 'meal', text: m.name + ' ' + m.cal + '千卡', date: m.date, time: m.time, icon: '🍎' })),
        ...workouts.map(w => ({ type: 'workout', text: w.exercise + ' 第' + (Storage.getWorkoutRecords().filter(r => r.exercise === w.exercise && r.date === w.date).indexOf(w) + 1) + '组 ' + w.calories + '千卡', date: w.date, time: w.time, icon: '💪' }))
    ].sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || '')).slice(0, 8);

    if (records.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无记录，开始你的第一次打卡吧！</p>';
        return;
    }

    container.innerHTML = records.map(r => `
        <div class="record-item">
            <span class="record-icon">${r.icon}</span>
            <span class="record-text">${r.text}</span>
            <span class="record-date">${r.date}</span>
        </div>
    `).join('');
}

// ========== 训练页功能 ==========
let currentCategory = null; // 记录当前查看的部位

function showWorkoutList(category) {
    currentCategory = category;
    const exercises = getExercisesByCategory(category);

    document.querySelector('.workout-categories').style.display = 'none';
    document.querySelectorAll('#page-workout .section-title, #page-workout .btn-add').forEach(el => el.style.display = 'none');
    document.getElementById('plan-list').style.display = 'none';

    const detail = document.getElementById('workout-detail');
    detail.style.display = 'block';
    
    const allCats = getAllCategories();
    document.getElementById('workout-category-title').textContent = (allCats[category]?.name || category) + '训练';

    let html = '';
    if (exercises.length === 0) {
        html = '<p class="empty-hint">暂无动作，点击下方添加</p>';
    } else {
        html = exercises.map((ex, idx) => {
            const tips = ex.tips || '点击编辑添加动作要领';
            const hasTips = !!ex.tips;
            const isCustom = ex.custom;
            // 对自定义动作用 customId，对预设动作用 name+idx 作为标识
            const deleteId = isCustom ? ex.customId : '';
            const deleteAction = isCustom 
                ? `event.stopPropagation();deleteCustomExerciseFromList(${deleteId},'${category}')` 
                : `event.stopPropagation();hideExercise('${ex.name}','${category}')`;
            
            return `
            <div class="exercise-item" onclick="selectExerciseForPlan('${ex.name}')" style="${isCustom ? 'border-left:3px solid var(--primary);' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;min-width:0;" onclick="event.stopPropagation();">
                        <div class="ex-name" style="margin-bottom:4px;">${ex.name} ${isCustom ? '<span style="font-size:11px;color:var(--primary);font-weight:400;">自定义</span>' : ''}</div>
                        <div class="ex-muscle" style="font-size:12px;color:${hasTips ? '#666' : '#aaa'};line-height:1.4;cursor:pointer;" onclick="event.stopPropagation();editExerciseTips('${ex.name}','${category}',${isCustom ? 'true' : 'false'},${isCustom ? ex.customId : 'null'})">
                            💡 ${tips}
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px;">
                        <button onclick="event.stopPropagation();editExerciseTips('${ex.name}','${category}',${isCustom ? 'true' : 'false'},${isCustom ? ex.customId : 'null'})" 
                            style="background:none;border:none;font-size:16px;cursor:pointer;padding:4px 6px;color:var(--primary);" title="编辑要领">✏️</button>
                        <button onclick="${deleteAction}" 
                            style="background:none;border:none;font-size:16px;cursor:pointer;padding:4px 6px;color:var(--danger);" title="${isCustom ? '删除动作' : '隐藏动作'}">🗑️</button>
                    </div>
                </div>
            </div>
        `}).join('');
    }
    
    // 添加"添加自定义动作"按钮
    html += `
        <div class="exercise-item" onclick="showAddCustomExerciseForCategory('${category}')" style="border:2px dashed var(--primary);background:var(--primary-light);margin-top:12px;">
            <div class="ex-name" style="color:var(--primary);">+ 添加自定义动作</div>
            <div class="ex-muscle" style="color:var(--primary);">添加新的${allCats[category]?.name || category}训练动作</div>
        </div>
    `;
    
    document.getElementById('exercise-list').innerHTML = html;
}

function hideWorkoutDetail() {
    document.querySelector('.workout-categories').style.display = '';
    document.querySelectorAll('#page-workout .section-title, #page-workout .btn-add').forEach(el => el.style.display = '');
    document.getElementById('plan-list').style.display = '';
    document.getElementById('workout-detail').style.display = 'none';
}

// ========== 编辑动作要领 ==========
function editExerciseTips(name, category, isCustom, customId) {
    // 获取当前要领
    let currentTips = '';
    if (isCustom && customId) {
        const customs = Storage.getCustomExercises();
        const ex = customs.find(e => e.id === customId);
        currentTips = ex?.tips || '';
    } else {
        for (const cat of Object.values(EXERCISES)) {
            const ex = cat.exercises.find(e => e.name === name);
            if (ex) { currentTips = ex.tips || ''; break; }
        }
    }
    // 检查用户自定义要领
    const userTips = Storage.getExerciseTips(name);
    if (userTips) currentTips = userTips;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <h3>编辑动作要领</h3>
            <p style="font-size:14px;font-weight:600;margin-bottom:8px;">${name}</p>
            <textarea id="edit-tips-textarea" class="input-field" rows="4" placeholder="输入动作要领，如：肩胛骨收紧贴凳，下放至胸部中段..." style="resize:vertical;">${currentTips}</textarea>
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="btn-secondary" style="flex:1;" onclick="closeModal()">取消</button>
                <button class="btn-primary" style="flex:1;" onclick="saveExerciseTips('${name}')">保存</button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
    // 自动聚焦
    setTimeout(() => document.getElementById('edit-tips-textarea').focus(), 100);
}

function saveExerciseTips(name) {
    const tips = document.getElementById('edit-tips-textarea').value.trim();
    Storage.setExerciseTips(name, tips);
    closeModal();
    showToast('已保存动作要领');
    // 刷新当前列表
    if (currentCategory) showWorkoutList(currentCategory);
}

// ========== 隐藏预设动作 ==========
function hideExercise(name, category) {
    if (confirm(`确定隐藏"${name}"吗？可以恢复。`)) {
        Storage.addHiddenExercise(name);
        showToast('已隐藏');
        showWorkoutList(category);
    }
}

// ========== 从列表删除自定义动作 ==========
function deleteCustomExerciseFromList(id, category) {
    if (confirm('确定删除该自定义动作吗？')) {
        Storage.removeCustomExercise(id);
        showToast('已删除');
        showWorkoutList(category);
    }
}

// ========== 自定义动作管理 ==========
// 在指定部位添加自定义动作
function showAddCustomExerciseForCategory(category) {
    const allCats = getAllCategories();
    const categoryName = allCats[category]?.name || category;
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content" style="max-height:85vh;">
            <h3>添加${categoryName}动作</h3>
            <p style="font-size:12px;color:#8e8e93;margin-bottom:12px;">添加新的${categoryName}训练动作到系统中</p>
            
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;">动作名称 *</label>
            <input type="text" id="custom-ex-name" placeholder="如：蝴蝶夹胸" class="input-field">
            
            <input type="hidden" id="custom-ex-category" value="${category}">
            
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;margin-top:8px;">目标肌群</label>
            <input type="text" id="custom-ex-muscle" placeholder="如：胸大肌内侧" class="input-field">
            
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;margin-top:8px;">动作类型</label>
            <div style="display:flex;gap:12px;margin-bottom:12px;">
                <label style="font-size:14px;cursor:pointer;display:flex;align-items:center;gap:4px;">
                    <input type="radio" name="custom-ex-type" value="true" checked style="accent-color:var(--primary);"> 负重类（杠铃/哑铃）
                </label>
                <label style="font-size:14px;cursor:pointer;display:flex;align-items:center;gap:4px;">
                    <input type="radio" name="custom-ex-type" value="false"> 自重/有氧类
                </label>
            </div>
            
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;">运动强度 (MET值)</label>
            <input type="number" id="custom-ex-met" placeholder="默认5.0，越大消耗越多" class="input-field" value="5" step="0.5" min="1" max="15">
            <p style="font-size:11px;color:#aaa;margin-top:4px;">参考：散步3 / 跑步9 / HIIT12 / 深蹲8</p>
            
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="btn-secondary" style="flex:1;" onclick="closeModal()">取消</button>
                <button class="btn-primary" style="flex:1;" onclick="saveCustomExerciseForCategory()">添加</button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
}

function saveCustomExerciseForCategory() {
    const name = document.getElementById('custom-ex-name').value.trim();
    const category = document.getElementById('custom-ex-category').value;
    const muscle = document.getElementById('custom-ex-muscle').value.trim();
    const weightBased = document.querySelector('input[name="custom-ex-type"]:checked').value === 'true';
    const met = parseFloat(document.getElementById('custom-ex-met').value) || 5.0;
    
    if (!name) {
        showToast('请输入动作名称');
        return;
    }
    
    const categoryNameMap = { chest:'胸部', back:'背部', shoulder:'肩部', arms:'手臂', legs:'腿部', core:'核心', cardio:'有氧', custom:'其他' };
    
    const success = Storage.addCustomExercise({
        name,
        category,
        categoryName: categoryNameMap[category] || '其他',
        muscle: muscle || '自定义',
        weightBased,
        met: Math.max(1, Math.min(15, met))
    });
    
    if (!success) {
        showToast('该动作已存在');
        return;
    }
    
    closeModal();
    showToast(`已添加${categoryNameMap[category]}动作：${name}`);
    // 刷新当前部位的列表
    showWorkoutList(category);
}

// 保留旧的自定义动作管理入口（可选）
function showCustomExerciseList() {
    document.querySelector('.workout-categories').style.display = 'none';
    document.querySelectorAll('#page-workout .section-title, #page-workout .btn-add').forEach(el => el.style.display = 'none');
    document.getElementById('plan-list').style.display = 'none';

    const detail = document.getElementById('workout-detail');
    detail.style.display = 'block';
    document.getElementById('workout-category-title').textContent = '自定义动作';

    const customs = Storage.getCustomExercises();
    let html = '';
    
    if (customs.length === 0) {
        html = '<p class="empty-hint">暂无自定义动作</p>';
    } else {
        html = customs.map(ex => `
            <div class="exercise-item" onclick="selectExerciseForPlan('${ex.name}')" style="border-left:3px solid var(--primary);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div class="ex-name">${ex.name} <span style="font-size:11px;color:var(--primary);font-weight:400;">自定义</span></div>
                        <div class="ex-muscle">目标肌群：${ex.muscle || '未设置'} | 所属：${ex.categoryName || '其他'} | ${ex.weightBased !== false ? '负重类' : '自重/有氧'}</div>
                    </div>
                    <button onclick="event.stopPropagation();deleteCustomExercise(${ex.id})" style="background:none;border:none;color:var(--danger);font-size:18px;cursor:pointer;padding:8px;">✕</button>
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('exercise-list').innerHTML = html;
}

function deleteCustomExercise(id) {
    if (confirm('确定删除该自定义动作吗？')) {
        Storage.removeCustomExercise(id);
        showToast('已删除');
        showCustomExerciseList();
    }
}

function deleteCustomExercise(id) {
    if (confirm('确定删除该自定义动作吗？')) {
        Storage.removeCustomExercise(id);
        showToast('已删除');
        showCustomExerciseList();
    }
}

function selectExerciseForPlan(name) {
    showAddPlan(name);
}

function showAddPlan(exerciseName = '') {
    const isWeight = exerciseName ? isWeightBasedExercise(exerciseName) : true;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'plan-modal';
    overlay.innerHTML = `
        <div class="modal-content" style="max-height:85vh;">
            <h3>添加训练计划</h3>
            <p style="font-size:12px;color:#8e8e93;margin-bottom:12px;">设定今天要完成的训练目标</p>
            
            <!-- 部位选择 -->
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:8px;">选择锻炼部位</label>
            <div class="body-part-selector" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                ${Object.entries(getAllCategories()).map(([key, cat]) => `
                    <button class="btn-part" data-part="${key}" onclick="selectBodyPart('${key}')" style="padding:8px 12px;border:1px solid #e5e5ea;border-radius:20px;background:#fff;font-size:13px;cursor:pointer;${key.startsWith('custom') ? 'border-style:dashed;color:var(--primary);' : ''}">${cat.name}</button>
                `).join('')}
            </div>
            
            <!-- 动作列表 -->
            <div id="exercise-selector" style="display:none;margin-bottom:12px;max-height:150px;overflow-y:auto;">
                <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:8px;">选择动作</label>
                <div id="exercise-options" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
            </div>
            
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;">动作名称</label>
            <input type="text" id="plan-exercise" placeholder="如：杠铃卧推" class="input-field" value="${exerciseName}" oninput="onPlanExerciseChange()">
            
            <!-- 负重类参数 -->
            <div id="weight-based-fields" style="${isWeight ? '' : 'display:none;'}">
                <div class="input-row">
                    <input type="number" id="plan-weight" placeholder="重量(kg)" class="input-field input-short" value="20">
                    <input type="number" id="plan-sets" placeholder="组数" class="input-field input-short" value="4">
                </div>
                <div class="input-row">
                    <input type="number" id="plan-reps" placeholder="每组次数" class="input-field input-short" value="10">
                    <input type="date" id="plan-date" class="input-field input-short" value="${getToday()}">
                </div>
            </div>
            
            <!-- 自重/有氧类参数 -->
            <div id="time-based-fields" style="${!isWeight ? '' : 'display:none;'}">
                <div class="input-row">
                    <input type="number" id="plan-sets" placeholder="组数" class="input-field input-short" value="4">
                    <input type="number" id="plan-duration" placeholder="每组时长(分钟)" class="input-field input-short" value="10">
                </div>
                <div class="input-row">
                    <input type="number" id="plan-reps" placeholder="每组次数(可选)" class="input-field input-short" value="">
                    <input type="date" id="plan-date2" class="input-field input-short" value="${getToday()}">
                </div>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="btn-secondary" style="flex:1;" onclick="closeModal()">取消</button>
                <button class="btn-primary" style="flex:1;" onclick="savePlan()">添加</button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
}

// 动作名称变化时，自动切换输入模式
function onPlanExerciseChange() {
    const name = document.getElementById('plan-exercise').value.trim();
    if (!name) return;
    const isWeight = isWeightBasedExercise(name);
    document.getElementById('weight-based-fields').style.display = isWeight ? '' : 'none';
    document.getElementById('time-based-fields').style.display = isWeight ? 'none' : '';
}

function selectBodyPart(partKey) {
    // 更新选中状态
    document.querySelectorAll('.btn-part').forEach(btn => {
        btn.style.background = '#fff';
        btn.style.color = '#333';
        btn.style.borderColor = '#e5e5ea';
    });
    const selectedBtn = document.querySelector(`[data-part="${partKey}"]`);
    if (selectedBtn) {
        selectedBtn.style.background = '#34C759';
        selectedBtn.style.color = '#fff';
        selectedBtn.style.borderColor = '#34C759';
    }
    
    // 显示该部位的动作列表
    const exercises = getExercisesByCategory(partKey);
    if (exercises.length > 0) {
        const container = document.getElementById('exercise-options');
        const selector = document.getElementById('exercise-selector');
        container.innerHTML = exercises.map(ex => `
            <button class="btn-exercise" onclick="selectExercise('${ex.name}')" 
                style="padding:6px 12px;border:1px solid #e5e5ea;border-radius:16px;background:${ex.custom ? '#e8f5e9' : '#f5f5f5'};font-size:13px;cursor:pointer;white-space:nowrap;">
                ${ex.name}${ex.custom ? ' ✏️' : ''}
            </button>
        `).join('');
        selector.style.display = 'block';
    }
}

function selectExercise(exerciseName) {
    document.getElementById('plan-exercise').value = exerciseName;
    // 切换输入模式
    onPlanExerciseChange();
    // 高亮选中的动作
    document.querySelectorAll('.btn-exercise').forEach(btn => {
        if (btn.textContent.trim() === exerciseName) {
            btn.style.background = '#34C759';
            btn.style.color = '#fff';
            btn.style.borderColor = '#34C759';
        } else {
            btn.style.background = '#f5f5f5';
            btn.style.color = '#333';
            btn.style.borderColor = '#e5e5ea';
        }
    });
}

function savePlan() {
    const exercise = document.getElementById('plan-exercise').value.trim();
    const isWeight = isWeightBasedExercise(exercise);
    
    const weightEl = document.getElementById('plan-weight');
    const setsEl = document.getElementById('plan-sets');
    const repsEl = document.getElementById('plan-reps');
    const durationEl = document.getElementById('plan-duration');
    const dateEl = document.getElementById('plan-date') || document.getElementById('plan-date2');
    
    const weight = isWeight ? (parseFloat(weightEl?.value) || 0) : 0;
    const sets = parseInt(setsEl?.value) || 0;
    const reps = parseInt(repsEl?.value) || 0;
    const duration = !isWeight ? (parseFloat(durationEl?.value) || 0) : 0;
    const date = dateEl?.value || getToday();

    if (!exercise) {
        showToast('请输入动作名称');
        return;
    }
    if (sets <= 0) {
        showToast('请填写组数');
        return;
    }
    if (isWeight && reps <= 0) {
        showToast('请填写每组次数');
        return;
    }
    if (!isWeight && duration <= 0) {
        showToast('请填写每组时长');
        return;
    }

    Storage.addWorkoutPlan({ exercise, weight, sets, reps, duration, date });
    closeModal();
    refreshPlans();
    refreshHome();
    showToast(`已添加训练计划：${exercise} ${sets}组`);
}

function refreshPlans() {
    const container = document.getElementById('plan-list');
    const plans = Storage.getWorkoutPlans().slice().reverse();

    if (plans.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无训练计划</p>';
        return;
    }

    container.innerHTML = plans.map(p => {
        const completed = Storage.getCompletedSets(p.exercise, p.date);
        return `
            <div class="plan-item">
                <div>
                    <div class="plan-name">${p.exercise}</div>
                    <div class="plan-meta">${p.date} | ${p.weight}kg × ${p.sets}组 × ${p.reps}次 | 已完成${completed}组</div>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <span class="plan-status ${completed >= p.sets ? 'done' : 'pending'}">${completed}/${p.sets}组</span>
                    <button class="btn-edit" onclick="editPlan(${p.id})" title="修改">✏️</button>
                    <button class="btn-delete" onclick="deletePlan(${p.id})" title="删除">✕</button>
                </div>
            </div>
        `;
    }).join('');
}

function editPlan(id) {
    const plan = Storage.getWorkoutPlans().find(p => p.id === id);
    if (!plan) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width:320px;">
            <h3>修改训练计划</h3>
            <p style="font-size:14px;color:#666;margin-bottom:12px;">${plan.exercise}</p>
            <div class="input-group">
                <label>日期</label>
                <input type="date" id="edit-plan-date" class="input-field" value="${plan.date}">
            </div>
            <div class="input-group">
                <label>重量 (kg)</label>
                <input type="number" id="edit-plan-weight" class="input-field" value="${plan.weight}" step="0.5">
            </div>
            <div class="input-group">
                <label>组数</label>
                <input type="number" id="edit-plan-sets" class="input-field" value="${plan.sets}" min="1">
            </div>
            <div class="input-group">
                <label>次数</label>
                <input type="number" id="edit-plan-reps" class="input-field" value="${plan.reps}" min="1">
            </div>
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="btn-secondary" style="flex:1;" onclick="closeModal()">取消</button>
                <button class="btn-primary" style="flex:1;" onclick="saveEditPlan(${id})">保存</button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
}

function saveEditPlan(id) {
    const date = document.getElementById('edit-plan-date').value;
    const weight = parseFloat(document.getElementById('edit-plan-weight').value) || 0;
    const sets = parseInt(document.getElementById('edit-plan-sets').value) || 1;
    const reps = parseInt(document.getElementById('edit-plan-reps').value) || 1;

    if (!date) {
        showToast('请选择日期');
        return;
    }

    Storage.updateWorkoutPlan(id, { date, weight, sets, reps });
    closeModal();
    showToast('训练计划已修改');
    refreshPlans();
    refreshHome();
}

function deletePlan(id) {
    if (confirm('确定删除这个训练计划吗？')) {
        Storage.removeWorkoutPlan(id);
        refreshPlans();
        refreshHome();
    }
}

// ========== 饮食页功能 ==========
function refreshMeals() {
    const todayMeals = Storage.getTodayMeals();
    const macros = Storage.getTodayMacros();
    const totalCal = Storage.getTodayCalories();
    const profile = Storage.getProfile();

    document.getElementById('meal-total').textContent = totalCal;
    document.getElementById('protein-val').textContent = Math.round(macros.protein * 10) / 10;
    document.getElementById('carb-val').textContent = Math.round(macros.carb * 10) / 10;
    document.getElementById('fat-val').textContent = Math.round(macros.fat * 10) / 10;

    const proteinGoal = profile.weight * 2;
    const carbGoal = (profile.calorieGoal * 0.45) / 4;
    const fatGoal = (profile.calorieGoal * 0.25) / 9;

    document.getElementById('protein-fill').style.width = Math.min(100, (macros.protein / proteinGoal) * 100) + '%';
    document.getElementById('carb-fill').style.width = Math.min(100, (macros.carb / carbGoal) * 100) + '%';
    document.getElementById('fat-fill').style.width = Math.min(100, (macros.fat / fatGoal) * 100) + '%';

    const container = document.getElementById('meal-list');
    if (todayMeals.length === 0) {
        container.innerHTML = '<p class="empty-hint">今天还没有记录哦</p>';
        return;
    }

    container.innerHTML = todayMeals.map(m => `
        <div class="meal-item">
            <div class="meal-info">
                <div class="meal-name">${m.name} <span class="meal-type-tag">${getMealTypeName(m.type)}</span></div>
                <div class="meal-macros">${m.weight}g ${m.cookMethod || '生食'} | 蛋白${Math.round(m.protein * 10) / 10}g | 碳水${Math.round(m.carb * 10) / 10}g | 脂肪${Math.round(m.fat * 10) / 10}g</div>
            </div>
            <span class="meal-cal">${m.cal || 0}千卡</span>
            <button class="btn-delete" onclick="deleteMeal(${m.id})">✕</button>
        </div>
    `).join('');
}

// 自动计算食物营养和显示份量选项
document.addEventListener('input', function(e) {
    if (e.target.id === 'meal-name') {
        showPortionOptions(e.target.value.trim());
        calculateMealAuto();
    }
    if (e.target.id === 'meal-weight' || e.target.id === 'meal-cook-method') {
        calculateMealAuto();
    }
});

function showPortionOptions(foodName) {
    const section = document.getElementById('portion-section');
    const container = document.getElementById('portion-options');
    
    if (!foodName) {
        section.style.display = 'none';
        return;
    }

    // 查找自定义食物
    const customFoods = Storage.getCustomFoods();
    const customMatch = customFoods.find(f => foodName.includes(f.name) || f.name.includes(foodName));
    if (customMatch) {
        section.innerHTML = `<p style="font-size:12px;color:var(--primary);">已找到自定义食物：${customMatch.name} (${customMatch.cal}千卡/100g)</p>`;
        section.style.display = 'block';
        return;
    }

    // 查找内置食物的份量数据
    let portions = null;
    for (const [name, data] of Object.entries(FOOD_PORTIONS)) {
        if (foodName.includes(name) || name.includes(foodName)) {
            portions = data;
            break;
        }
    }

    if (!portions) {
        portions = GENERAL_PORTIONS;
    }

    section.style.display = 'block';
    container.innerHTML = portions.map(p => `
        <button class="btn-portion" onclick="selectPortion(${p.weight})">
            <span class="portion-name">${p.name}</span>
            <span class="portion-desc">${p.desc}</span>
        </button>
    `).join('');
}

function selectPortion(weight) {
    document.getElementById('meal-weight').value = weight;
    calculateMealAuto();
}

function calculateMealAuto() {
    const name = document.getElementById('meal-name').value.trim();
    const weight = parseFloat(document.getElementById('meal-weight').value) || 0;
    const cookMethod = document.getElementById('meal-cook-method').value;

    if (name && weight > 0) {
        // 先查找自定义食物
        const customFoods = Storage.getCustomFoods();
        const customMatch = customFoods.find(f => name.includes(f.name) || f.name.includes(name));
        
        if (customMatch) {
            const ratio = weight / 100;
            const method = COOK_METHODS[cookMethod] || COOK_METHODS.raw;
            document.getElementById('meal-cal').value = Math.round(customMatch.cal * ratio * method.multiplier);
            document.getElementById('meal-protein').value = Math.round(customMatch.protein * ratio * 10) / 10;
            document.getElementById('meal-carb').value = Math.round(customMatch.carb * ratio * 10) / 10;
            document.getElementById('meal-fat').value = Math.round(customMatch.fat * ratio * 10) / 10;
            return;
        }

        // 查找内置食物
        const nutrition = calculateMealNutrition(name, weight, cookMethod);
        if (nutrition) {
            document.getElementById('meal-cal').value = nutrition.cal;
            document.getElementById('meal-protein').value = nutrition.protein;
            document.getElementById('meal-carb').value = nutrition.carb;
            document.getElementById('meal-fat').value = nutrition.fat;
        }
    }
}

function addMeal() {
    const name = document.getElementById('meal-name').value.trim();
    const weight = parseFloat(document.getElementById('meal-weight').value) || 0;
    const cal = parseInt(document.getElementById('meal-cal').value) || 0;
    const protein = parseFloat(document.getElementById('meal-protein').value) || 0;
    const carb = parseFloat(document.getElementById('meal-carb').value) || 0;
    const fat = parseFloat(document.getElementById('meal-fat').value) || 0;
    const type = document.querySelector('input[name="meal-type"]:checked').value;
    const cookMethod = getCookMethodName(document.getElementById('meal-cook-method').value);

    if (!name) {
        showToast('请输入食物名称');
        return;
    }
    if (cal <= 0) {
        showToast('请输入热量');
        return;
    }

    Storage.addMeal({ name, weight, cal, protein, carb, fat, type, cookMethod });

    document.getElementById('meal-name').value = '';
    document.getElementById('meal-weight').value = '';
    document.getElementById('meal-cal').value = '';
    document.getElementById('meal-protein').value = '';
    document.getElementById('meal-carb').value = '';
    document.getElementById('meal-fat').value = '';
    document.getElementById('portion-section').style.display = 'none';

    refreshMeals();
    showToast('饮食记录已添加！');
}

function deleteMeal(id) {
    Storage.removeMeal(id);
    refreshMeals();
}

// ========== 自定义食物热量库 ==========
function showAddFood() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'food-modal';
    overlay.innerHTML = `
        <div class="modal-content">
            <h3>添加自定义食物</h3>
            <p style="font-size:12px;color:#8e8e93;margin-bottom:12px;">添加到你的个人食物库，下次记录更方便</p>
            <label style="font-size:13px;color:#8e8e93;display:block;margin-bottom:4px;">食物名称</label>
            <input type="text" id="food-name" placeholder="如：自制鸡胸肉肠" class="input-field">
            <div class="input-row">
                <input type="number" id="food-cal" placeholder="热量(千卡/100g)" class="input-field input-short">
                <input type="number" id="food-protein" placeholder="蛋白质(g/100g)" class="input-field input-short">
            </div>
            <div class="input-row">
                <input type="number" id="food-carb" placeholder="碳水(g/100g)" class="input-field input-short">
                <input type="number" id="food-fat" placeholder="脂肪(g/100g)" class="input-field input-short">
            </div>
            <div style="display:flex;gap:10px;margin-top:8px;">
                <button class="btn-secondary" style="flex:1;" onclick="closeModal()">取消</button>
                <button class="btn-primary" style="flex:1;" onclick="saveCustomFood()">保存</button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
}

function saveCustomFood() {
    const name = document.getElementById('food-name').value.trim();
    const cal = parseFloat(document.getElementById('food-cal').value) || 0;
    const protein = parseFloat(document.getElementById('food-protein').value) || 0;
    const carb = parseFloat(document.getElementById('food-carb').value) || 0;
    const fat = parseFloat(document.getElementById('food-fat').value) || 0;

    if (!name) {
        showToast('请输入食物名称');
        return;
    }
    if (cal <= 0) {
        showToast('请输入热量');
        return;
    }

    Storage.addCustomFood({ name, cal, protein, carb, fat });
    closeModal();
    renderCustomFoodList();
    showToast(`已添加：${name} (${cal}千卡/100g)`);
}

function renderCustomFoodList() {
    const container = document.getElementById('custom-food-list');
    const foods = Storage.getCustomFoods();

    if (foods.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = foods.map(f => `
        <div class="custom-food-item">
            <div class="cf-info">
                <div class="cf-name">${f.name}</div>
                <div class="cf-detail">${f.cal}千卡 | 蛋白${f.protein}g | 碳水${f.carb}g | 脂肪${f.fat}g (每100g)</div>
            </div>
            <button class="btn-delete" onclick="deleteCustomFood(${f.id})">✕</button>
        </div>
    `).join('');
}

function deleteCustomFood(id) {
    if (confirm('确定删除这个食物吗？')) {
        Storage.removeCustomFood(id);
        renderCustomFoodList();
    }
}

// ========== AI 聊天功能 ==========
function sendChat() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage('user', message);
    input.value = '';

    const loadingId = showTyping();

    setTimeout(() => {
        removeTyping(loadingId);
        const response = FitAI.process(message);
        addChatMessage('ai', response);
    }, 500 + Math.random() * 1000);
}

function sendQuickQ(question) {
    document.getElementById('chat-input').value = question;
    sendChat();
}

function addChatMessage(role, content) {
    const container = document.getElementById('chat-container');

    const welcome = container.querySelector('.chat-welcome');
    if (welcome) welcome.style.display = 'none';

    let msgContainer = container.querySelector('.chat-messages');
    if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.className = 'chat-messages';
        container.appendChild(msgContainer);
    }

    const msg = document.createElement('div');
    msg.className = `msg ${role}`;

    const avatar = role === 'ai' ? '🤖' : '👤';

    const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    msg.innerHTML = `
        <div class="msg-avatar">${avatar}</div>
        <div class="msg-bubble">${formattedContent}</div>
    `;

    msgContainer.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chat-container');
    let msgContainer = container.querySelector('.chat-messages');
    if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.className = 'chat-messages';
        container.appendChild(msgContainer);
    }

    const id = 'typing-' + Date.now();
    const typing = document.createElement('div');
    typing.className = 'msg ai';
    typing.id = id;
    typing.innerHTML = `
        <div class="msg-avatar">🤖</div>
        <div class="msg-bubble">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    msgContainer.appendChild(typing);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ========== 个人中心功能 ==========
function refreshProfile() {
    const profile = Storage.getProfile();

    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('user-goal').textContent = profile.goal;
    document.getElementById('input-name').value = profile.name;
    document.getElementById('input-height').value = profile.height || '';
    document.getElementById('input-weight').value = profile.weight || '';
    document.getElementById('input-goal').value = profile.goal;
    document.getElementById('input-calorie-goal').value = profile.calorieGoal || 2000;

    document.getElementById('total-checkins').textContent = Storage.getTotalCheckIns();
    document.getElementById('total-workouts').textContent = Storage.getTotalWorkouts();
    document.getElementById('max-streak').textContent = Storage.getMaxStreak();

    renderWeightRecords();

    // 设置身体数据日期默认为今天
    const dateInput = document.getElementById('body-data-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = getToday();
    }
    renderBodyDataList();
    renderBodyDataChart();
}

// 折叠/展开个人信息表单
function toggleProfileForm() {
    const container = document.getElementById('profile-form-container');
    const icon = document.getElementById('profile-toggle-icon');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.textContent = '▼';
    } else {
        container.style.display = 'none';
        icon.textContent = '▶';
    }
}

// 实时保存个人信息
function saveProfileOnInput() {
    const profile = {
        name: document.getElementById('input-name').value.trim() || '健身达人',
        height: parseInt(document.getElementById('input-height').value) || 170,
        weight: parseFloat(document.getElementById('input-weight').value) || 70,
        goal: document.getElementById('input-goal').value,
        calorieGoal: parseInt(document.getElementById('input-calorie-goal').value) || 2000,
    };
    Storage.saveProfile(profile);

    // 实时更新首页显示
    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('user-goal').textContent = profile.goal;

    // 刷新首页热量计算（使用新体重）
    refreshHome();
}

function addWeightRecord() {
    const weight = parseFloat(document.getElementById('input-weight-record').value);
    if (!weight || weight < 20 || weight > 300) {
        showToast('请输入有效的体重');
        return;
    }
    Storage.addWeightRecord(weight);
    document.getElementById('input-weight-record').value = '';
    renderWeightRecords();
    showToast('体重已记录！');
}

function renderWeightRecords() {
    const container = document.getElementById('weight-list');
    const records = Storage.getWeightRecords().slice(-10).reverse();

    if (records.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无体重记录</p>';
        return;
    }

    container.innerHTML = records.map(r => `
        <div class="weight-item">
            <span>${r.date}</span>
            <span class="weight-val">${r.weight} kg</span>
        </div>
    `).join('');
}

function clearAllData() {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
        if (confirm('再次确认：所有打卡记录、饮食记录、训练记录都将被删除。')) {
            Storage.clearAll();
            showToast('数据已清除');
            refreshAll();
        }
    }
}

// ========== 数据备份功能 ==========
function exportData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        checkins: Storage.getCheckIns(),
        workoutRecords: Storage.getWorkoutRecords(),
        workoutPlans: Storage.getWorkoutPlans(),
        meals: Storage.getMeals(),
        bodyData: Storage.getBodyData(),
        profile: Storage.getProfile(),
        customFoods: Storage.getCustomFoods()
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitcheck_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('数据已导出！请保存到安全位置');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.version) {
                throw new Error('无效的备份文件');
            }
            
            if (confirm('导入数据将覆盖现有数据，确定继续吗？')) {
                // 导入所有数据
                if (data.checkins) Storage.set('checkins', data.checkins);
                if (data.workoutRecords) Storage.set('workout_records', data.workoutRecords);
                if (data.workoutPlans) Storage.set('workout_plans', data.workoutPlans);
                if (data.meals) Storage.set('meals', data.meals);
                if (data.bodyData) Storage.set('body_data', data.bodyData);
                if (data.profile) Storage.saveProfile(data.profile);
                if (data.customFoods) Storage.set('custom_foods', data.customFoods);
                
                refreshAll();
                showToast('数据导入成功！');
            }
        } catch (err) {
            showToast('导入失败：' + err.message);
        }
    };
    input.click();
}

// ========== 身体数据功能 ==========
let bodyDataChart = null;

function addBodyData() {
    const date = document.getElementById('body-data-date').value;
    const weight = parseFloat(document.getElementById('input-body-weight').value);
    const fat = parseFloat(document.getElementById('input-body-fat').value);
    const muscle = parseFloat(document.getElementById('input-body-muscle').value);

    if (!date) {
        showToast('请选择日期');
        return;
    }
    if (!weight && !fat && !muscle) {
        showToast('请至少输入一项数据');
        return;
    }

    Storage.addBodyData({
        date,
        weight: weight || 0,
        fat: fat || 0,
        muscle: muscle || 0
    });

    document.getElementById('input-body-weight').value = '';
    document.getElementById('input-body-fat').value = '';
    document.getElementById('input-body-muscle').value = '';

    renderBodyDataList();
    renderBodyDataChart();
    showToast('身体数据已记录！');
}

function deleteBodyData(id) {
    if (confirm('确定删除这条记录吗？')) {
        Storage.removeBodyData(id);
        renderBodyDataList();
        renderBodyDataChart();
        showToast('已删除');
    }
}

function renderBodyDataList() {
    const container = document.getElementById('body-data-list');
    const records = Storage.getBodyData();

    if (records.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#86868b;font-size:14px;padding:20px 0;">暂无身体数据记录</p>';
        return;
    }

    container.innerHTML = records.map(r => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f5f5f7;">
            <div>
                <div style="font-size:15px;color:#1d1d1f;font-weight:500;">${r.date}</div>
                <div style="font-size:13px;color:#86868b;margin-top:4px;">
                    ${r.weight ? `<span style="color:#007aff;">体重 ${r.weight}kg</span>` : ''}
                    ${r.fat ? `<span style="color:#ff9500;margin-left:12px;">体脂 ${r.fat}%</span>` : ''}
                    ${r.muscle ? `<span style="color:#34c759;margin-left:12px;">骨骼肌 ${r.muscle}kg</span>` : ''}
                </div>
            </div>
            <button onclick="deleteBodyData(${r.id})" style="background:none;border:none;color:#ff3b30;font-size:20px;cursor:pointer;padding:4px 8px;">×</button>
        </div>
    `).join('');
}

function renderBodyDataChart() {
    const ctx = document.getElementById('body-data-chart');
    if (!ctx) return;

    const data = Storage.getBodyDataForChart();
    if (data.length < 2) {
        if (bodyDataChart) bodyDataChart.destroy();
        return;
    }

    if (bodyDataChart) {
        bodyDataChart.destroy();
    }

    bodyDataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: '体重',
                    data: data.map(d => d.weight),
                    borderColor: '#007aff',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    yAxisID: 'y'
                },
                {
                    label: '体脂率',
                    data: data.map(d => d.fat),
                    borderColor: '#ff9500',
                    backgroundColor: 'rgba(255, 149, 0, 0.1)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    yAxisID: 'y1'
                },
                {
                    label: '骨骼肌',
                    data: data.map(d => d.muscle),
                    borderColor: '#34c759',
                    backgroundColor: 'rgba(52, 199, 89, 0.1)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, padding: 10, font: { size: 11 } }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    position: 'left',
                    title: { display: true, text: 'kg', font: { size: 10 } }
                },
                y1: {
                    beginAtZero: false,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: '%', font: { size: 10 } }
                }
            }
        }
    });
}

// ========== Toast 提示 ==========
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 24px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
        max-width: 80%;
        text-align: center;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    const today = getToday();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) input.value = today;
    });
    
    refreshHome();
});
