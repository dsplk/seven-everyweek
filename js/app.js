// ========== 数据存储模块（多用户版） ==========
const Storage = {
    // 获取当前用户前缀
    getPrefix() {
        const currentUser = this.getCurrentUser();
        return currentUser ? 'user_' + currentUser.id + '_' : 'fitness_';
    },

    // 获取数据
    get(key, defaultVal = null) {
        try {
            const data = localStorage.getItem(this.getPrefix() + key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            console.error('读取数据失败:', e);
            return defaultVal;
        }
    },

    // 保存数据
    set(key, value) {
        try {
            localStorage.setItem(this.getPrefix() + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },

    // 删除数据
    remove(key) {
        localStorage.removeItem(this.getPrefix() + key);
    },

    // ========== 用户管理 ==========
    getUsers() {
        return this.get('users', []);
    },

    saveUsers(users) {
        this.set('users', users);
    },

    register(username, password) {
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            return { success: false, message: '用户名已存在' };
        }
        const newUser = {
            id: Date.now().toString(),
            username,
            password: password, // 简化版，实际应加密
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this.saveUsers(users);
        return { success: true, user: newUser };
    },

    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            this.set('currentUser', user);
            return { success: true, user };
        }
        return { success: false, message: '用户名或密码错误' };
    },

    logout() {
        localStorage.removeItem(this.getPrefix() + 'currentUser');
    },

    getCurrentUser() {
        // 先尝试从全局前缀获取
        const currentUser = localStorage.getItem('fitness_currentUser');
        if (currentUser) {
            return JSON.parse(currentUser);
        }
        return null;
    },

    setCurrentUser(user) {
        localStorage.setItem('fitness_currentUser', JSON.stringify(user));
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    // 清除当前用户数据
    clearCurrentUserData() {
        const prefix = this.getPrefix();
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    },

    // 清除所有 FitCheck 数据
    clearAll() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('fitcheck_'));
        keys.forEach(k => localStorage.removeItem(k));
    },

    // ========== 打卡相关 ==========
    getCheckIns() {
        return this.get('checkins', []);
    },

    addCheckIn() {
        const checkins = this.getCheckIns();
        const today = getToday();
        if (checkins.some(c => c.date === today)) {
            return false;
        }
        checkins.push({ date: today, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) });
        this.set('checkins', checkins);
        return true;
    },

    isCheckedInToday() {
        const today = getToday();
        return this.getCheckIns().some(c => c.date === today);
    },

    getStreak() {
        const checkins = this.getCheckIns().map(c => c.date).sort().reverse();
        if (checkins.length === 0) return 0;

        let streak = 0;
        let checkDate = new Date();

        if (checkins[0] !== getToday()) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        for (let i = 0; i < 365; i++) {
            const dateStr = formatDate(checkDate);
            if (checkins.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    },

    getMaxStreak() {
        const checkins = this.getCheckIns().map(c => c.date).sort();
        if (checkins.length === 0) return 0;

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < checkins.length; i++) {
            const prev = new Date(checkins[i - 1]);
            const curr = new Date(checkins[i]);
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);

            if (diff === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else if (diff > 1) {
                currentStreak = 1;
            }
        }
        return maxStreak;
    },

    // ========== 训练计划 ==========
    getWorkoutPlans() {
        return this.get('workout_plans', []);
    },

    addWorkoutPlan(plan) {
        const plans = this.getWorkoutPlans();
        plan.id = Date.now();
        plan.date = plan.date || getToday();
        plans.push(plan);
        this.set('workout_plans', plans);
        return plan;
    },

    removeWorkoutPlan(id) {
        const plans = this.getWorkoutPlans().filter(p => p.id !== id);
        this.set('workout_plans', plans);
    },

    updateWorkoutPlan(id, updates) {
        const plans = this.getWorkoutPlans();
        const idx = plans.findIndex(p => p.id === id);
        if (idx >= 0) {
            plans[idx] = { ...plans[idx], ...updates };
            this.set('workout_plans', plans);
        }
    },

    getTodayWorkoutPlans() {
        const today = getToday();
        return this.getWorkoutPlans().filter(p => p.date === today);
    },

    // ========== 训练记录（每组单独记录） ==========
    getWorkoutRecords() {
        return this.get('workout_records', []);
    },

    // 添加一组训练记录
    addWorkoutRecord(record) {
        const records = this.getWorkoutRecords();
        record.id = Date.now();
        record.date = record.date || getToday();
        record.time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        // 计算消耗卡路里（每组）
        const profile = this.getProfile();
        const bodyWeight = profile.weight || 70;
        const calResult = calculateWorkoutCalories(record.exercise, record.weight, record.reps, bodyWeight, record.duration);
        record.calories = calResult.calories || 0;
        record.duration = calResult.duration || record.duration || 0;
        record.weightBased = calResult.weightBased;
        
        records.push(record);
        this.set('workout_records', records);
        return record;
    },

    removeWorkoutRecord(id) {
        const records = this.getWorkoutRecords().filter(r => r.id !== id);
        this.set('workout_records', records);
    },

    getTodayWorkoutRecords() {
        const today = getToday();
        return this.getWorkoutRecords().filter(r => r.date === today);
    },

    // 获取某个动作的已完成组数
    getCompletedSets(exercise, date) {
        return this.getWorkoutRecords().filter(r => 
            r.exercise === exercise && r.date === date
        ).length;
    },

    // 获取今日总消耗
    getTodayCaloriesBurned() {
        return this.getTodayWorkoutRecords()
            .reduce((sum, r) => sum + (r.calories || 0), 0);
    },

    // ========== 自定义训练动作 ==========
    getCustomExercises() {
        return this.get('custom_exercises', []);
    },

    addCustomExercise(exercise) {
        const list = this.getCustomExercises();
        // 检查是否重名
        if (list.some(e => e.name === exercise.name)) {
            return false;
        }
        exercise.id = Date.now();
        list.push(exercise);
        this.set('custom_exercises', list);
        return true;
    },

    removeCustomExercise(id) {
        const list = this.getCustomExercises().filter(e => e.id !== id);
        this.set('custom_exercises', list);
    },

    // ========== 隐藏预设动作 ==========
    getHiddenExercises() {
        return this.get('hidden_exercises', []);
    },

    addHiddenExercise(name) {
        const list = this.getHiddenExercises();
        if (!list.includes(name)) {
            list.push(name);
            this.set('hidden_exercises', list);
        }
    },

    removeHiddenExercise(name) {
        const list = this.getHiddenExercises().filter(n => n !== name);
        this.set('hidden_exercises', list);
    },

    // ========== 动作要领（用户自定义） ==========
    getExerciseTips(name) {
        const all = this.get('exercise_tips', {});
        return all[name] || '';
    },

    setExerciseTips(name, tips) {
        const all = this.get('exercise_tips', {});
        all[name] = tips;
        this.set('exercise_tips', all);
    },

    // ========== 饮食记录 ==========
    getMeals() {
        return this.get('meals_v2', []);
    },

    addMeal(meal) {
        const meals = this.getMeals();
        meal.id = Date.now();
        meal.date = getToday();
        meal.time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        meals.push(meal);
        this.set('meals_v2', meals);
    },

    removeMeal(id) {
        const meals = this.getMeals().filter(m => m.id !== id);
        this.set('meals_v2', meals);
    },

    getTodayMeals() {
        const today = getToday();
        return this.getMeals().filter(m => m.date === today);
    },

    getTodayCalories() {
        return this.getTodayMeals().reduce((sum, m) => sum + (m.cal || 0), 0);
    },

    getTodayMacros() {
        return this.getTodayMeals().reduce((acc, m) => ({
            protein: acc.protein + (m.protein || 0),
            carb: acc.carb + (m.carb || 0),
            fat: acc.fat + (m.fat || 0),
        }), { protein: 0, carb: 0, fat: 0 });
    },

    // ========== 自定义食物热量库 ==========
    getCustomFoods() {
        return this.get('custom_foods', []);
    },

    addCustomFood(food) {
        const foods = this.getCustomFoods();
        food.id = Date.now();
        foods.push(food);
        this.set('custom_foods', foods);
        return food;
    },

    removeCustomFood(id) {
        const foods = this.getCustomFoods().filter(f => f.id !== id);
        this.set('custom_foods', foods);
    },

    // ========== 体重记录 ==========
    getWeightRecords() {
        return this.get('weights', []);
    },

    addWeightRecord(weight) {
        const records = this.getWeightRecords();
        records.push({ date: getToday(), weight: weight });
        this.set('weights', records);
    },

    // ========== 用户信息 ==========
    getProfile() {
        return this.get('profile', {
            name: '健身达人',
            height: 170,
            weight: 70,
            goal: '减脂',
            calorieGoal: 2000
        });
    },

    saveProfile(profile) {
        this.set('profile', profile);
    },

    // ========== 统计 ==========
    getTotalCheckIns() {
        return this.getCheckIns().length;
    },

    getTotalWorkouts() {
        return this.getWorkoutRecords().length;
    },

    // ========== 获取最近7天的数据（用于图表） ==========
    getEnergyData(days = 7) {
        const result = [];
        const profile = this.getProfile();
        const bmr = Math.round((profile.weight || 70) * 24 * 1.2);

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = formatDate(date);
            
            const meals = this.getMeals().filter(m => m.date === dateStr);
            const intake = meals.reduce((sum, m) => sum + (m.cal || 0), 0);
            
            const workouts = this.getWorkoutRecords().filter(r => r.date === dateStr);
            const burned = workouts.reduce((sum, r) => sum + (r.calories || 0), 0);
            
            const net = intake - burned - bmr;
            
            result.push({
                date: dateStr.slice(5),
                intake,
                burned,
                bmr,
                net
            });
        }
        return result;
    },

    // 兼容旧调用
    getLast7DaysData() {
        return this.getEnergyData(7);
    },

    // ========== 获取最近7天运动数据（用于图表） ==========
    getLast7DaysWorkoutData() {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = formatDate(date);
            
            const records = this.getWorkoutRecords().filter(r => r.date === dateStr);
            
            result.push({
                date: dateStr.slice(5),
                count: records.length,
                exercises: [...new Set(records.map(r => r.exercise))].length,
                calories: records.reduce((sum, r) => sum + (r.calories || 0), 0),
                duration: records.reduce((sum, r) => sum + (r.duration || 0), 0)
            });
        }
        return result;
    },

    // ========== 获取饮食数据（用于饮食分析图表） ==========
    getDietData(days = 7) {
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = formatDate(date);
            
            const meals = this.getMeals().filter(m => m.date === dateStr);
            
            result.push({
                date: dateStr.slice(5),
                protein: meals.reduce((sum, m) => sum + (m.protein || 0), 0),
                carb: meals.reduce((sum, m) => sum + (m.carb || 0), 0),
                fat: meals.reduce((sum, m) => sum + (m.fat || 0), 0),
                calories: meals.reduce((sum, m) => sum + (m.cal || 0), 0)
            });
        }
        return result;
    },

    // ========== 身体数据记录 ==========
    getBodyData() {
        return this.get('body_data') || [];
    },

    addBodyData(data) {
        const records = this.getBodyData();
        const existingIndex = records.findIndex(r => r.date === data.date);
        if (existingIndex >= 0) {
            records[existingIndex] = { ...records[existingIndex], ...data };
        } else {
            records.push({ ...data, id: Date.now() });
        }
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.set('body_data', records);
    },

    removeBodyData(id) {
        const records = this.getBodyData().filter(r => r.id !== id);
        this.set('body_data', records);
    },

    getBodyDataForChart() {
        const records = this.getBodyData().sort((a, b) => new Date(a.date) - new Date(b.date));
        return records.map(r => ({
            date: r.date.slice(5),
            weight: r.weight || 0,
            fat: r.fat || 0,
            muscle: r.muscle || 0
        }));
    }
};

// ========== 工具函数 ==========
function getToday() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekDay() {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[new Date().getDay()];
}

function getMealTypeName(type) {
    const names = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };
    return names[type] || type;
}

function getCookMethodName(method) {
    const methodData = COOK_METHODS[method];
    return methodData ? methodData.name : '生食';
}
