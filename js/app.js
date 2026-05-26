// ========== 主应用逻辑 ==========

// 图表实例
let energyChart = null;
let dietChart = null;
let bodyDataChart = null;

// 当前选中的范围
let currentCalendarRange = 13;
let currentEnergyRange = 7;
let currentDietRange = 7;

// 页面切换
function switchTab(pageName, tabEl) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // 显示目标页面
    const targetPage = document.getElementById('page-' + pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新底部导航状态
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    if (tabEl) {
        tabEl.classList.add('active');
    }
    
    // 刷新页面数据
    if (pageName === 'home') {
        refreshHome();
    } else if (pageName === 'workout') {
        renderWorkoutPlans();
    } else if (pageName === 'meal') {
        refreshMeal();
    } else if (pageName === 'profile') {
        refreshProfile();
    }
    
    // 更新页面标题
    const titles = {
        home: '一周七练',
        workout: '训练计划',
        meal: '饮食记录',
        ai: 'AI 健身助手',
        profile: '我的'
    };
    const titleEl = document.getElementById('page-title');
    if (titleEl) {
        titleEl.textContent = titles[pageName] || '一周七练';
    }
}

// 全局刷新
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
            workoutEl.style.color = completedSets >= totalPlannedSets ? '#34c759' : '#ff9500';
        } else if (totalPlannedSets > 0) {
            workoutEl.textContent = totalPlannedSets + '组待完成';
            workoutEl.style.color = '#ff9500';
        } else {
            workoutEl.textContent = '未完成';
            workoutEl.style.color = '#86868b';
        }
    }

    // 今日热量统计
    const today = new Date().toISOString().split('T')[0];
    const profile = Storage.getProfile();
    const bmr = Math.round((profile.weight || 70) * 24 * 1.2);
    
    const meals = Storage.getMeals().filter(m => m.date === today);
    const intake = meals.reduce((sum, m) => sum + (m.cal || 0), 0);
    
    const workouts = Storage.getWorkoutRecords().filter(r => r.date === today);
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

    // 渲染各个组件
    renderContributionCalendar();
    renderTodayWorkoutList();
    renderEnergyChart();
    renderDietChart();
}

// ========== 打卡热力图 ==========
function renderContributionCalendar() {
    const container = document.getElementById('calendar-graph');
    if (!container) return;
    
    const checkins = Storage.getCheckIns();
    const weeksToShow = currentCalendarRange;
    
    let html = '';
    for (let week = 0; week < weeksToShow; week++) {
        html += '<div class="calendar-row">';
        for (let day = 0; day < 7; day++) {
            const date = new Date();
            date.setDate(date.getDate() - ((weeksToShow - 1 - week) * 7 + (6 - day)));
            const dateStr = date.toISOString().split('T')[0];
            const count = checkins.find(c => c.date === dateStr)?.count || 0;
            let level = 0;
            if (count >= 5) level = 4;
            else if (count >= 3) level = 3;
            else if (count >= 1) level = 2;
            else if (count > 0) level = 1;
            
            html += `<div class="calendar-cell level-${level}" title="${dateStr}: ${count}次训练" onclick="showDateDetail('${dateStr}')"></div>`;
        }
        html += '</div>';
    }
    container.innerHTML = html;
}

function showDateDetail(date) {
    const records = Storage.getWorkoutRecords().filter(r => r.date === date);
    const meals = Storage.getMeals().filter(m => m.date === date);
    
    let message = `${date}\n`;
    if (records.length > 0) {
        message += `\n训练：${records.length}组`;
        records.forEach(r => {
            message += `\n• ${r.exercise} ${r.weight}kg×${r.reps}次`;
        });
    }
    if (meals.length > 0) {
        const totalCal = meals.reduce((sum, m) => sum + m.cal, 0);
        message += `\n\n饮食：${totalCal}千卡`;
    }
    if (records.length === 0 && meals.length === 0) {
        message += '\n无记录';
    }
    
    alert(message);
}

function switchCalendarRange(weeks, btn) {
    currentCalendarRange = weeks;
    document.querySelectorAll('#contribution-calendar .range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderContributionCalendar();
}

// ========== 今日训练计划 ==========
function renderTodayWorkoutList() {
    const plans = Storage.getTodayWorkoutPlans();
    const records = Storage.getTodayWorkoutRecords();
    const container = document.getElementById('today-workout-list');
    
    if (!container) return;
    
    if (plans.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#86868b;font-size:14px;padding:16px 0;">今日暂无训练计划<br>去训练页面添加吧！</p>';
        return;
    }
    
    // 计算每个计划的完成进度
    const planProgress = {};
    records.forEach(r => {
        if (!planProgress[r.exercise]) planProgress[r.exercise] = 0;
        planProgress[r.exercise]++;
    });
    
    container.innerHTML = plans.map(p => {
        const completed = planProgress[p.exercise] || 0;
        const isDone = completed >= p.sets;
        
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f5f5f7;">
                <div>
                    <div style="font-size:15px;font-weight:500;color:${isDone ? '#34c759' : '#1d1d1f'};">
                        ${p.exercise} ${isDone ? '✓' : ''}
                    </div>
                    <div style="font-size:13px;color:#86868b;">
                        目标：${p.sets}组×${p.reps}次 ${p.weight > 0 ? '@' + p.weight + 'kg' : ''}
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:13px;color:${completed >= p.sets ? '#34c759' : '#ff9500'};">
                        ${completed}/${p.sets}组
                    </div>
                    <button onclick="quickLogWorkout(${p.id})" style="background:#007aff;color:#fff;border:none;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;margin-top:4px;">
                        记录
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function quickLogWorkout(planId) {
    const plans = Storage.getWorkoutPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    const weight = prompt(`请输入实际重量 (kg)：`, plan.weight || '');
    if (weight === null) return;
    
    const reps = prompt(`请输入实际次数：`, plan.reps);
    if (reps === null) return;
    
    Storage.addWorkoutRecord({
        date: new Date().toISOString().split('T')[0],
        exercise: plan.exercise,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || 0,
        sets: 1,
        calories: Math.round((parseFloat(weight) || 0) * (parseInt(reps) || 0) * 0.1)
    });
    
    // 添加打卡
    Storage.addCheckIn(new Date().toISOString().split('T')[0]);
    
    refreshHome();
    showToast('训练记录已保存！');
}

// ========== 能量分析图表 ==========
function renderEnergyChart() {
    const ctx = document.getElementById('energy-chart');
    if (!ctx) return;
    
    const days = currentEnergyRange;
    const dates = [];
    const intakeData = [];
    const burnedData = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr.slice(5));
        
        const meals = Storage.getMeals().filter(m => m.date === dateStr);
        intakeData.push(meals.reduce((sum, m) => sum + m.cal, 0));
        
        const records = Storage.getWorkoutRecords().filter(r => r.date === dateStr);
        const workoutCal = records.reduce((sum, r) => sum + (r.calories || 0), 0);
        const bmr = Math.round((Storage.getProfile().weight || 70) * 24 * 1.2);
        burnedData.push(workoutCal + bmr);
    }
    
    if (energyChart) {
        energyChart.destroy();
    }
    
    energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '摄入',
                    data: intakeData,
                    backgroundColor: '#ff9500',
                    borderRadius: 4
                },
                {
                    label: '消耗',
                    data: burnedData,
                    backgroundColor: '#007aff',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, padding: 10 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function switchEnergyRange(days, btn) {
    currentEnergyRange = days;
    const btns = btn.parentElement.querySelectorAll('.range-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderEnergyChart();
}

// ========== 饮食分析图表 ==========
function renderDietChart() {
    const ctx = document.getElementById('diet-chart');
    if (!ctx) return;
    
    const days = currentDietRange;
    const dates = [];
    const proteinData = [];
    const carbData = [];
    const fatData = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr.slice(5));
        
        const meals = Storage.getMeals().filter(m => m.date === dateStr);
        proteinData.push(meals.reduce((sum, m) => sum + (m.protein || 0), 0));
        carbData.push(meals.reduce((sum, m) => sum + (m.carb || 0), 0));
        fatData.push(meals.reduce((sum, m) => sum + (m.fat || 0), 0));
    }
    
    // 更新统计数字
    const totalProtein = proteinData.reduce((a, b) => a + b, 0);
    const totalCarb = carbData.reduce((a, b) => a + b, 0);
    const totalFat = fatData.reduce((a, b) => a + b, 0);
    
    document.getElementById('diet-total-protein').textContent = Math.round(totalProtein) + 'g';
    document.getElementById('diet-total-carb').textContent = Math.round(totalCarb) + 'g';
    document.getElementById('diet-total-fat').textContent = Math.round(totalFat) + 'g';
    
    if (dietChart) {
        dietChart.destroy();
    }
    
    dietChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '蛋白质',
                    data: proteinData,
                    borderColor: '#ff3b30',
                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: '碳水',
                    data: carbData,
                    borderColor: '#ff9500',
                    backgroundColor: 'rgba(255, 149, 0, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: '脂肪',
                    data: fatData,
                    borderColor: '#34c759',
                    backgroundColor: 'rgba(52, 199, 89, 0.1)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, padding: 10 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function switchDietRange(days, btn) {
    currentDietRange = days;
    btn.parentElement.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderDietChart();
}

// ========== 训练页面功能 ==========
function showWorkoutList(category) {
    const db = ExerciseDB[category];
    if (!db) return;
    
    document.getElementById('workout-category-title').textContent = db.name;
    const list = document.getElementById('exercise-list');
    
    // 按类型分组
    const groups = {};
    Object.entries(db.actions).forEach(([key, action]) => {
        if (!groups[action.type]) groups[action.type] = [];
        groups[action.type].push({ key, ...action });
    });
    
    let html = '';
    Object.entries(groups).forEach(([type, actions]) => {
        html += `<div class="action-group"><div class="action-group-title">${type}</div>`;
        actions.forEach(action => {
            html += `
                <div class="action-item" onclick="showAddExerciseModal('${category}', '${action.key}')">
                    <span class="action-name">${action.name}</span>
                    <button class="action-add">+</button>
                </div>
            `;
        });
        html += '</div>';
    });
    
    list.innerHTML = html;
    document.getElementById('workout-detail').style.display = 'block';
    document.querySelector('.workout-categories').style.display = 'none';
}

function hideWorkoutDetail() {
    document.getElementById('workout-detail').style.display = 'none';
    document.querySelector('.workout-categories').style.display = 'grid';
}

function showAddExerciseModal(category, actionKey) {
    const action = ExerciseDB[category].actions[actionKey];
    
    const sets = prompt(`${action.name}\n\n请输入组数：`, '3');
    if (!sets || isNaN(sets)) return;
    
    const reps = prompt('每组次数：', '10');
    if (!reps || isNaN(reps)) return;
    
    const weight = prompt('重量 (kg，可选)：', '0');
    
    Storage.addWorkoutPlan({
        exercise: action.name,
        category: category,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight) || 0
    });
    
    showToast('已添加到训练计划');
    hideWorkoutDetail();
    renderWorkoutPlans();
}

function showAddPlan() {
    // 返回分类列表
    hideWorkoutDetail();
}

function renderWorkoutPlans() {
    const plans = Storage.getWorkoutPlans();
    const container = document.getElementById('plan-list');
    
    if (!container) return;
    
    if (plans.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无训练计划<br>点击上方"添加训练动作"</p>';
        return;
    }
    
    container.innerHTML = plans.map(p => `
        <div class="plan-item">
            <div class="plan-info">
                <div class="plan-name">${p.exercise}</div>
                <div class="plan-detail">${p.sets}组 × ${p.reps}次 ${p.weight > 0 ? '@ ' + p.weight + 'kg' : ''}</div>
            </div>
            <button class="btn-delete-small" onclick="deletePlan(${p.id})">✕</button>
        </div>
    `).join('');
}

function deletePlan(id) {
    if (confirm('确定删除这个训练计划吗？')) {
        Storage.removeWorkoutPlan(id);
        renderWorkoutPlans();
        showToast('已删除');
    }
}
// ========== 饮食页面功能 ==========
function refreshMeal() {
    const today = new Date().toISOString().split('T')[0];
    const meals = Storage.getMeals().filter(m => m.date === today);
    
    // 计算今日摄入
    const totalCal = meals.reduce((sum, m) => sum + (m.cal || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalCarb = meals.reduce((sum, m) => sum + (m.carb || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);
    
    // 更新显示
    const mealTotalEl = document.getElementById('meal-total');
    if (mealTotalEl) mealTotalEl.textContent = totalCal;
    
    const proteinEl = document.getElementById('protein-val');
    const carbEl = document.getElementById('carb-val');
    const fatEl = document.getElementById('fat-val');
    
    if (proteinEl) proteinEl.innerHTML = totalProtein + '<span style="font-size:12px;font-weight:400;">g</span>';
    if (carbEl) carbEl.innerHTML = totalCarb + '<span style="font-size:12px;font-weight:400;">g</span>';
    if (fatEl) fatEl.innerHTML = totalFat + '<span style="font-size:12px;font-weight:400;">g</span>';
    
    // 渲染饮食列表
    const list = document.getElementById('meal-list');
    if (!list) return;
    
    if (meals.length === 0) {
        list.innerHTML = '<p class="empty-hint">今天还没有记录<br>点击下方添加</p>';
    } else {
        list.innerHTML = meals.map(m => `
            <div class="meal-item">
                <div class="meal-info">
                    <div class="meal-name">${m.name}</div>
                    <div class="meal-detail">${m.weight}g | 蛋${m.protein || 0}g 碳${m.carb || 0}g 脂${m.fat || 0}g</div>
                </div>
                <div style="text-align:right;">
                    <div class="meal-cal">${m.cal}千卡</div>
                    <button class="btn-delete-small" onclick="deleteMeal(${m.id})" style="font-size:12px;">删除</button>
                </div>
            </div>
        `).join('');
    }
}

function addMeal() {
    const name = document.getElementById('meal-name').value.trim();
    const weight = parseFloat(document.getElementById('meal-weight').value) || 0;
    const cal = parseFloat(document.getElementById('meal-cal').value) || 0;
    const protein = parseFloat(document.getElementById('meal-protein').value) || 0;
    const carb = parseFloat(document.getElementById('meal-carb').value) || 0;
    const fat = parseFloat(document.getElementById('meal-fat').value) || 0;
    const typeEl = document.querySelector('input[name="meal-type"]:checked');
    const type = typeEl ? typeEl.value : 'breakfast';
    
    if (!name) {
        showToast('请填写食物名称');
        return;
    }
    if (!cal && !protein && !carb && !fat) {
        showToast('请至少填写热量或营养素');
        return;
    }
    
    Storage.addMeal({
        date: new Date().toISOString().split('T')[0],
        name,
        weight,
        cal,
        protein,
        carb,
        fat,
        type
    });
    
    // 清空输入
    document.getElementById('meal-name').value = '';
    document.getElementById('meal-weight').value = '';
    document.getElementById('meal-cal').value = '';
    document.getElementById('meal-protein').value = '';
    document.getElementById('meal-carb').value = '';
    document.getElementById('meal-fat').value = '';
    
    refreshMeal();
    showToast('饮食记录已添加');
}

function deleteMeal(id) {
    if (confirm('确定删除这条记录吗？')) {
        Storage.removeMeal(id);
        refreshMeal();
        showToast('已删除');
    }
}

// ========== 个人中心功能 ==========
function refreshProfile() {
    const profile = Storage.getProfile();
    
    // 更新显示
    const userNameEl = document.getElementById('user-name');
    const userGoalEl = document.getElementById('user-goal');
    const inputNameEl = document.getElementById('input-name');
    const inputHeightEl = document.getElementById('input-height');
    const inputWeightEl = document.getElementById('input-weight');
    const inputGoalEl = document.getElementById('input-goal');
    const inputCalorieEl = document.getElementById('input-calorie-goal');
    
    if (userNameEl) userNameEl.textContent = profile.name;
    if (userGoalEl) userGoalEl.textContent = profile.goal;
    if (inputNameEl) inputNameEl.value = profile.name;
    if (inputHeightEl) inputHeightEl.value = profile.height || '';
    if (inputWeightEl) inputWeightEl.value = profile.weight || '';
    if (inputGoalEl) inputGoalEl.value = profile.goal;
    if (inputCalorieEl) inputCalorieEl.value = profile.calorieGoal || 2000;
    
    // 统计数据
    const totalCheckinsEl = document.getElementById('total-checkins');
    const totalWorkoutsEl = document.getElementById('total-workouts');
    const maxStreakEl = document.getElementById('max-streak');
    
    if (totalCheckinsEl) totalCheckinsEl.textContent = Storage.getTotalCheckIns();
    if (totalWorkoutsEl) totalWorkoutsEl.textContent = Storage.getTotalWorkouts();
    if (maxStreakEl) maxStreakEl.textContent = Storage.getMaxStreak();
    
    // 设置身体数据日期默认为今天
    const dateInput = document.getElementById('body-data-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    renderBodyDataList();
    renderBodyDataChart();
}

function toggleProfileForm() {
    const container = document.getElementById('profile-form-container');
    const icon = document.getElementById('profile-toggle-icon');
    
    if (!container || !icon) return;
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.textContent = '▼';
    } else {
        container.style.display = 'none';
        icon.textContent = '▶';
    }
}

function saveProfileOnInput() {
    const profile = {
        name: document.getElementById('input-name')?.value.trim() || '健身达人',
        height: parseInt(document.getElementById('input-height')?.value) || 170,
        weight: parseFloat(document.getElementById('input-weight')?.value) || 70,
        goal: document.getElementById('input-goal')?.value || '减脂',
        calorieGoal: parseInt(document.getElementById('input-calorie-goal')?.value) || 2000,
    };
    
    Storage.saveProfile(profile);
    
    const userNameEl = document.getElementById('user-name');
    const userGoalEl = document.getElementById('user-goal');
    if (userNameEl) userNameEl.textContent = profile.name;
    if (userGoalEl) userGoalEl.textContent = profile.goal;
    
    // 刷新首页热量计算
    refreshHome();
}

// ========== 身体数据功能 ==========
function addBodyData() {
    const date = document.getElementById('body-data-date')?.value;
    const weight = parseFloat(document.getElementById('input-body-weight')?.value);
    const fat = parseFloat(document.getElementById('input-body-fat')?.value);
    const muscle = parseFloat(document.getElementById('input-body-muscle')?.value);
    
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
    
    // 清空输入
    const weightInput = document.getElementById('input-body-weight');
    const fatInput = document.getElementById('input-body-fat');
    const muscleInput = document.getElementById('input-body-muscle');
    
    if (weightInput) weightInput.value = '';
    if (fatInput) fatInput.value = '';
    if (muscleInput) muscleInput.value = '';
    
    renderBodyDataList();
    renderBodyDataChart();
    showToast('身体数据已记录');
}

function renderBodyDataList() {
    const container = document.getElementById('body-data-list');
    if (!container) return;
    
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

function deleteBodyData(id) {
    if (confirm('确定删除这条记录吗？')) {
        Storage.removeBodyData(id);
        renderBodyDataList();
        renderBodyDataChart();
        showToast('已删除');
    }
}

function renderBodyDataChart() {
    const ctx = document.getElementById('body-data-chart');
    if (!ctx) return;
    
    const records = Storage.getBodyData().slice().reverse(); // 按时间正序
    if (records.length < 2) {
        // 数据点太少，不显示图表
        if (bodyDataChart) {
            bodyDataChart.destroy();
            bodyDataChart = null;
        }
        return;
    }
    
    const labels = records.map(r => r.date.slice(5)); // 只显示月-日
    const weightData = records.map(r => r.weight || null);
    const fatData = records.map(r => r.fat || null);
    const muscleData = records.map(r => r.muscle || null);
    
    if (bodyDataChart) {
        bodyDataChart.destroy();
    }
    
    const datasets = [];
    if (weightData.some(v => v !== null)) {
        datasets.push({
            label: '体重',
            data: weightData,
            borderColor: '#007aff',
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            spanGaps: true
        });
    }
    if (fatData.some(v => v !== null)) {
        datasets.push({
            label: '体脂率',
            data: fatData,
            borderColor: '#ff9500',
            backgroundColor: 'rgba(255, 149, 0, 0.1)',
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            spanGaps: true,
            yAxisID: 'y1'
        });
    }
    if (muscleData.some(v => v !== null)) {
        datasets.push({
            label: '骨骼肌',
            data: muscleData,
            borderColor: '#34c759',
            backgroundColor: 'rgba(52, 199, 89, 0.1)',
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            spanGaps: true
        });
    }
    
    if (datasets.length === 0) return;
    
    bodyDataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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
                    title: { display: true, text: 'kg', font: { size: 10 } },
                    grid: { color: '#f0f0f0' }
                },
                y1: {
                    beginAtZero: false,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: '%', font: { size: 10 } }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
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

function clearAllData() {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
        if (confirm('再次确认：所有打卡记录、饮食记录、训练记录都将被删除。')) {
            Storage.clearAll();
            showToast('数据已清除');
            refreshAll();
        }
    }
}

// ========== 工具函数 ==========
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    refreshAll();
    
    // 每分钟刷新一次首页（跨天时更新）
    setInterval(() => {
        if (document.getElementById('page-home')?.classList.contains('active')) {
            refreshHome();
        }
    }, 60000);
});
