// ========== 数据存储模块 ==========
const Storage = {
    // 获取数据
    get(key, defaultVal = null) {
        try {
            const data = localStorage.getItem('fitcheck_' + key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            console.error('读取数据失败:', e);
            return defaultVal;
        }
    },

    // 保存数据
    set(key, value) {
        try {
            localStorage.setItem('fitcheck_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },

    // 删除数据
    remove(key) {
        localStorage.removeItem('fitcheck_' + key);
    },

    // 清除所有数据
    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('fitcheck_')) {
                localStorage.removeItem(key);
            }
        });
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

    // ========== 打卡记录 ==========
    getCheckIns() {
        return this.get('checkins', []);
    },

    addCheckIn(date) {
        const checkins = this.getCheckIns();
        const existing = checkins.find(c => c.date === date);
        if (existing) {
            existing.count++;
        } else {
            checkins.push({ date, count: 1 });
        }
        this.set('checkins', checkins);
    },

    // ========== 训练记录 ==========
    getWorkoutRecords() {
        return this.get('workout_records', []);
    },

    addWorkoutRecord(record) {
        const records = this.getWorkoutRecords();
        records.push({ ...record, id: Date.now() });
        this.set('workout_records', records);
    },

    getTodayWorkoutRecords() {
        const today = new Date().toISOString().split('T')[0];
        return this.getWorkoutRecords().filter(r => r.date === today);
    },

    getTotalWorkouts() {
        return this.getWorkoutRecords().length;
    },

    // ========== 训练计划 ==========
    getWorkoutPlans() {
        return this.get('workout_plans', []);
    },

    addWorkoutPlan(plan) {
        const plans = this.getWorkoutPlans();
        plans.push({ ...plan, id: Date.now() });
        this.set('workout_plans', plans);
    },

    removeWorkoutPlan(id) {
        const plans = this.getWorkoutPlans().filter(p => p.id !== id);
        this.set('workout_plans', plans);
    },

    getTodayWorkoutPlans() {
        return this.getWorkoutPlans();
    },

    // ========== 饮食记录 ==========
    getMeals() {
        return this.get('meals', []);
    },

    addMeal(meal) {
        const meals = this.getMeals();
        meals.push({ ...meal, id: Date.now() });
        this.set('meals', meals);
    },

    removeMeal(id) {
        const meals = this.getMeals().filter(m => m.id !== id);
        this.set('meals', meals);
    },

    // ========== 身体数据 ==========
    getBodyData() {
        return this.get('body_data', []);
    },

    addBodyData(data) {
        const records = this.getBodyData();
        const existingIndex = records.findIndex(r => r.date === data.date);
        if (existingIndex >= 0) {
            records[existingIndex] = { ...records[existingIndex], ...data, id: records[existingIndex].id || Date.now() };
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

    // ========== 自定义食物 ==========
    getCustomFoods() {
        return this.get('custom_foods', []);
    },

    addCustomFood(food) {
        const foods = this.getCustomFoods();
        foods.push({ ...food, id: Date.now() });
        this.set('custom_foods', foods);
    },

    // ========== 统计数据 ==========
    getTotalCheckIns() {
        return this.getCheckIns().reduce((sum, c) => sum + c.count, 0);
    },

    getMaxStreak() {
        const checkins = this.getCheckIns().map(c => c.date).sort();
        if (checkins.length === 0) return 0;
        
        let maxStreak = 1;
        let currentStreak = 1;
        
        for (let i = 1; i < checkins.length; i++) {
            const prev = new Date(checkins[i-1]);
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
    }
};
