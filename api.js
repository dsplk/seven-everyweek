// ========== API 服务层 ==========
const API_BASE_URL = 'http://localhost:3000'; // 部署后改为实际地址

const API = {
    // 获取token
    getToken() {
        return localStorage.getItem('fitcheck_token');
    },

    // 设置token
    setToken(token) {
        localStorage.setItem('fitcheck_token', token);
    },

    // 清除token
    clearToken() {
        localStorage.removeItem('fitcheck_token');
    },

    // 通用请求
    async request(url, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }
            return data;
        } catch (err) {
            console.error('API请求失败:', err);
            throw err;
        }
    },

    // GET请求
    get(url) {
        return this.request(url, { method: 'GET' });
    },

    // POST请求
    post(url, body) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // PUT请求
    put(url, body) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // DELETE请求
    delete(url) {
        return this.request(url, { method: 'DELETE' });
    },

    // ========== 认证API ==========
    register(username, password) {
        return this.post('/api/register', { username, password });
    },

    login(username, password) {
        return this.post('/api/login', { username, password });
    },

    getUser() {
        return this.get('/api/user');
    },

    updateUser(profile) {
        return this.put('/api/user', profile);
    },

    // ========== 打卡API ==========
    getCheckIns() {
        return this.get('/api/checkins');
    },

    addCheckIn(data) {
        return this.post('/api/checkins', data);
    },

    // ========== 训练记录API ==========
    getWorkoutRecords() {
        return this.get('/api/workout-records');
    },

    addWorkoutRecord(data) {
        return this.post('/api/workout-records', data);
    },

    deleteWorkoutRecord(id) {
        return this.delete(`/api/workout-records/${id}`);
    },

    // ========== 训练计划API ==========
    getWorkoutPlans() {
        return this.get('/api/workout-plans');
    },

    addWorkoutPlan(data) {
        return this.post('/api/workout-plans', data);
    },

    deleteWorkoutPlan(id) {
        return this.delete(`/api/workout-plans/${id}`);
    },

    // ========== 饮食记录API ==========
    getMeals() {
        return this.get('/api/meals');
    },

    addMeal(data) {
        return this.post('/api/meals', data);
    },

    deleteMeal(id) {
        return this.delete(`/api/meals/${id}`);
    },

    // ========== 身体数据API ==========
    getBodyData() {
        return this.get('/api/body-data');
    },

    addBodyData(data) {
        return this.post('/api/body-data', data);
    },

    deleteBodyData(id) {
        return this.delete(`/api/body-data/${id}`);
    }
};
