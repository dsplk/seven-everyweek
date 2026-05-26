// ========== 训练动作数据库 ==========
const EXERCISES = {
    chest: {
        name: '胸部',
        exercises: [
            { name: '杠铃卧推', muscle: '胸大肌', difficulty: '中级', met: 6.0, weightBased: true, tips: '肩胛骨收紧贴凳，下放至胸部中段，推起时不要完全锁肘' },
            { name: '哑铃飞鸟', muscle: '胸大肌外侧', difficulty: '初级', met: 4.5, weightBased: true, tips: '手肘保持微弯，想象抱树动作，下放时感受胸部拉伸' },
            { name: '上斜哑铃卧推', muscle: '胸大肌上部', difficulty: '中级', met: 5.5, weightBased: true, tips: '凳面倾斜30-45度，哑铃下放至上胸位置' },
            { name: '俯卧撑', muscle: '胸大肌、三角肌前束', difficulty: '初级', met: 4.0, weightBased: false, tips: '身体保持一条直线，核心收紧，下降至胸部接近地面' },
            { name: '龙门架夹胸', muscle: '胸大肌内侧', difficulty: '初级', met: 4.0, weightBased: true, tips: '双手在胸前交叉，顶峰收缩1-2秒，控制回放速度' },
            { name: '双杠臂屈伸', muscle: '胸大肌下部、三头肌', difficulty: '中级', met: 5.0, weightBased: false, tips: '身体前倾约30度重点练胸，肘部指向后方而非外展' },
        ]
    },
    back: {
        name: '背部',
        exercises: [
            { name: '引体向上', muscle: '背阔肌', difficulty: '高级', met: 8.0, weightBased: false, tips: '肩胛骨先下沉再拉起，拉至下巴过杠，全程控制速度' },
            { name: '杠铃划船', muscle: '背阔肌、斜方肌', difficulty: '中级', met: 6.0, weightBased: true, tips: '上身前倾约45度，拉向腹部，肘部贴近身体' },
            { name: '坐姿下拉', muscle: '背阔肌', difficulty: '初级', met: 5.0, weightBased: true, tips: '挺胸直背，拉至锁骨位置，感受背阔肌发力' },
            { name: '单臂哑铃划船', muscle: '背阔肌', difficulty: '初级', met: 5.5, weightBased: true, tips: '一手撑凳，背部保持平直，拉向髋部方向' },
            { name: '硬拉', muscle: '竖脊肌、臀大肌', difficulty: '高级', met: 8.0, weightBased: true, tips: '背部始终保持平直，杠铃贴身上升，不要弯腰弓背' },
            { name: '面拉', muscle: '斜方肌、菱形肌', difficulty: '初级', met: 4.0, weightBased: true, tips: '拉向面部，双手外旋，终点时双肘与肩平齐' },
        ]
    },
    shoulder: {
        name: '肩部',
        exercises: [
            { name: '哑铃推举', muscle: '三角肌前束、中束', difficulty: '中级', met: 5.5, weightBased: true, tips: '核心收紧，不要过度后仰，推至头顶但不要锁肘' },
            { name: '侧平举', muscle: '三角肌中束', difficulty: '初级', met: 4.0, weightBased: true, tips: '小指侧略高于拇指侧（倾水姿势），举至与肩平齐' },
            { name: '前平举', muscle: '三角肌前束', difficulty: '初级', met: 4.0, weightBased: true, tips: '交替或同时上举，举至与眼平齐，控制下放速度' },
            { name: '俯身飞鸟', muscle: '三角肌后束', difficulty: '初级', met: 4.0, weightBased: true, tips: '上身俯身至接近水平，手臂微弯，向两侧飞起至与肩平' },
            { name: '阿诺德推举', muscle: '三角肌全面', difficulty: '中级', met: 5.0, weightBased: true, tips: '起始掌心朝向面部，推举过程中旋转至掌心朝前' },
        ]
    },
    arms: {
        name: '手臂',
        exercises: [
            { name: '杠铃弯举', muscle: '肱二头肌', difficulty: '初级', met: 4.5, weightBased: true, tips: '大臂贴紧身体，不要借力甩动，顶峰收缩停顿1秒' },
            { name: '锤式弯举', muscle: '肱二头肌、肱桡肌', difficulty: '初级', met: 4.0, weightBased: true, tips: '掌心相对（像拿锤子），上举至肩部位置' },
            { name: '三头绳索下压', muscle: '肱三头肌', difficulty: '初级', met: 4.5, weightBased: true, tips: '大臂固定不动，只有前臂移动，充分伸展三头肌' },
            { name: '窄距卧推', muscle: '肱三头肌', difficulty: '中级', met: 6.0, weightBased: true, tips: '握距与肩同宽，手肘贴近身体，下放至胸部下段' },
            { name: '哑铃臂屈伸', muscle: '肱三头肌', difficulty: '初级', met: 4.0, weightBased: true, tips: '双手持铃举过头顶，大臂不动，前臂向后下放至感受拉伸' },
        ]
    },
    legs: {
        name: '腿部',
        exercises: [
            { name: '深蹲', muscle: '股四头肌、臀大肌', difficulty: '中级', met: 8.0, weightBased: true, tips: '膝盖与脚尖方向一致，蹲至大腿与地面平行，背部保持挺直' },
            { name: '腿举', muscle: '股四头肌', difficulty: '初级', met: 6.0, weightBased: true, tips: '脚放踏板中下方，膝盖不要完全锁死，控制下放速度' },
            { name: '罗马尼亚硬拉', muscle: '腘绳肌、臀大肌', difficulty: '中级', met: 7.0, weightBased: true, tips: '微屈膝，臀部后推，杠铃沿腿面下滑，感受腘绳肌拉伸' },
            { name: '腿弯举', muscle: '腘绳肌', difficulty: '初级', met: 5.0, weightBased: true, tips: '控制回放速度，不要借助惯性甩起' },
            { name: '保加利亚分腿蹲', muscle: '股四头肌、臀大肌', difficulty: '中级', met: 6.5, weightBased: false, tips: '后脚抬高放凳上，前腿下蹲至大腿平行，膝盖不超过脚尖' },
            { name: '提踵', muscle: '小腿肌群', difficulty: '初级', met: 3.5, weightBased: true, tips: '在最高点停顿2秒，充分收缩小腿，缓慢下放至拉伸感' },
        ]
    },
    core: {
        name: '核心',
        exercises: [
            { name: '平板支撑', muscle: '腹横肌', difficulty: '初级', met: 3.5, weightBased: false, tips: '身体保持一条直线，不要塌腰或撅臀，收紧腹部和臀部' },
            { name: '卷腹', muscle: '腹直肌', difficulty: '初级', met: 3.0, weightBased: false, tips: '下背部贴地，只需微微抬起上背，不要坐起来' },
            { name: '俄罗斯转体', muscle: '腹斜肌', difficulty: '初级', met: 3.5, weightBased: false, tips: '双脚离地，躯干左右旋转，保持核心收紧' },
            { name: '悬垂举腿', muscle: '腹直肌下部', difficulty: '中级', met: 5.0, weightBased: false, tips: '控制摆动，用腹肌发力抬腿，避免借力摆荡' },
            { name: '死虫式', muscle: '核心稳定肌群', difficulty: '初级', met: 3.0, weightBased: false, tips: '下背始终贴地，对侧手脚同时伸展，动作缓慢控制' },
        ]
    },
    cardio: {
        name: '有氧',
        exercises: [
            { name: '跑步', muscle: '全身', difficulty: '初级', met: 9.0, weightBased: false, tips: '保持均匀呼吸，前脚掌先着地过渡到全脚掌，步频180/分钟为佳' },
            { name: '跳绳', muscle: '小腿、核心', difficulty: '初级', met: 10.0, weightBased: false, tips: '手腕发力甩绳，保持轻盈弹跳，不要跳太高' },
            { name: 'HIIT间歇训练', muscle: '全身', difficulty: '高级', met: 12.0, weightBased: false, tips: '高强度20-30秒，休息10-15秒，循环6-8组' },
            { name: '动感单车', muscle: '腿部', difficulty: '初级', met: 8.0, weightBased: false, tips: '调整座椅高度至腿微弯，保持踏频80-100RPM' },
            { name: '游泳', muscle: '全身', difficulty: '中级', met: 8.0, weightBased: false, tips: '保持规律呼吸节奏，划水要充分伸展，注意放松恢复' },
        ]
    }
};

// ========== 烹饪方式热量系数 ==========
const COOK_METHODS = {
    raw: { name: '生食', multiplier: 1.0 },
    boiled: { name: '水煮', multiplier: 1.0 },
    steamed: { name: '清蒸', multiplier: 1.0 },
    stirfried: { name: '炒', multiplier: 1.15 },
    fried: { name: '油炸', multiplier: 1.4 },
    roasted: { name: '烤', multiplier: 1.1 },
    braised: { name: '红烧', multiplier: 1.25 }
};

// ========== 食物份量估算（不知道重量时使用） ==========
const FOOD_PORTIONS = {
    // 主食类
    '米饭': [
        { name: '一小碗', weight: 100, desc: '约半碗' },
        { name: '一中碗', weight: 150, desc: '约一碗' },
        { name: '一大碗', weight: 250, desc: '约一碗半' },
        { name: '一拳头', weight: 120, desc: '自己的拳头大小' }
    ],
    '面条': [
        { name: '一小碗', weight: 150, desc: '约半碗' },
        { name: '一中碗', weight: 250, desc: '约一碗' },
        { name: '一大碗', weight: 350, desc: '约一碗半' }
    ],
    '馒头': [
        { name: '半个', weight: 50, desc: '小馒头' },
        { name: '一个', weight: 100, desc: '标准馒头' },
        { name: '大个', weight: 150, desc: '大馒头' }
    ],
    '红薯': [
        { name: '小个', weight: 100, desc: '约手掌大小' },
        { name: '中个', weight: 200, desc: '约拳头大小' },
        { name: '大个', weight: 300, desc: '约两个拳头' }
    ],
    '燕麦': [
        { name: '一勺', weight: 30, desc: '标准勺子' },
        { name: '两勺', weight: 60, desc: '标准勺子' },
        { name: '一小碗', weight: 50, desc: '干燕麦' }
    ],
    // 蛋白质类
    '鸡胸肉': [
        { name: '一小块', weight: 80, desc: '约手掌大小' },
        { name: '一块', weight: 150, desc: '约手掌大小' },
        { name: '一大块', weight: 200, desc: '约两个手掌' }
    ],
    '牛肉': [
        { name: '一小块', weight: 80, desc: '约手掌大小' },
        { name: '一块', weight: 150, desc: '约手掌大小' },
        { name: '一大块', weight: 200, desc: '约两个手掌' }
    ],
    '鸡蛋': [
        { name: '一个', weight: 50, desc: '约50g' },
        { name: '两个', weight: 100, desc: '约100g' },
        { name: '蛋白(一个)', weight: 30, desc: '约30g' }
    ],
    '虾仁': [
        { name: '一小份', weight: 80, desc: '约8-10只' },
        { name: '一份', weight: 150, desc: '约15-20只' },
        { name: '大份', weight: 200, desc: '约25-30只' }
    ],
    '豆腐': [
        { name: '一小块', weight: 100, desc: '约1/4块' },
        { name: '半块', weight: 200, desc: '约半块' },
        { name: '一块', weight: 400, desc: '标准盒装' }
    ],
    // 蔬菜类
    '西兰花': [
        { name: '一小份', weight: 80, desc: '约半碗' },
        { name: '一份', weight: 150, desc: '约一碗' },
        { name: '大份', weight: 250, desc: '约一碗半' }
    ],
    '菠菜': [
        { name: '一小把', weight: 50, desc: '约半碗' },
        { name: '一把', weight: 100, desc: '约一碗' },
        { name: '大份', weight: 200, desc: '约两碗' }
    ],
    '番茄': [
        { name: '小个', weight: 100, desc: '约一个' },
        { name: '中个', weight: 150, desc: '约一个' },
        { name: '大个', weight: 200, desc: '约一个' }
    ],
    '黄瓜': [
        { name: '半根', weight: 100, desc: '约半根' },
        { name: '一根', weight: 200, desc: '约一根' }
    ],
    // 水果类
    '香蕉': [
        { name: '小根', weight: 80, desc: '约小香蕉' },
        { name: '中根', weight: 120, desc: '约标准香蕉' },
        { name: '大根', weight: 150, desc: '约大香蕉' }
    ],
    '苹果': [
        { name: '小个', weight: 150, desc: '约小苹果' },
        { name: '中个', weight: 200, desc: '约标准苹果' },
        { name: '大个', weight: 250, desc: '约大苹果' }
    ],
    // 饮品类
    '牛奶': [
        { name: '一杯', weight: 250, desc: '约250ml' },
        { name: '一盒', weight: 250, desc: '标准盒装' },
        { name: '一瓶', weight: 500, desc: '约500ml' }
    ],
    '酸奶': [
        { name: '一小杯', weight: 100, desc: '约100g' },
        { name: '一杯', weight: 200, desc: '约200g' },
        { name: '大杯', weight: 300, desc: '约300g' }
    ]
};

// ========== 通用份量估算（当没有特定食物时使用） ==========
const GENERAL_PORTIONS = [
    { name: '一小口', weight: 20, desc: '约20g' },
    { name: '一口', weight: 30, desc: '约30g' },
    { name: '一勺子', weight: 15, desc: '约15g' },
    { name: '一筷子', weight: 10, desc: '约10g' },
    { name: '一小把', weight: 30, desc: '约30g' },
    { name: '一把', weight: 50, desc: '约50g' },
    { name: '一小碟', weight: 80, desc: '约80g' },
    { name: '一碟', weight: 150, desc: '约150g' },
    { name: '一小碗', weight: 150, desc: '约150g' },
    { name: '一中碗', weight: 250, desc: '约250g' },
    { name: '一大碗', weight: 400, desc: '约400g' },
    { name: '一拳头', weight: 100, desc: '自己的拳头' },
    { name: '一巴掌', weight: 120, desc: '自己的手掌' }
];

// ========== 常见食物热量数据（每100g） ==========
const FOOD_DATABASE = {
    '鸡胸肉': { cal: 165, protein: 31, carb: 0, fat: 3.6 },
    '鸡蛋': { cal: 155, protein: 13, carb: 1.1, fat: 11 },
    '米饭': { cal: 116, protein: 2.6, carb: 25.6, fat: 0.3 },
    '红薯': { cal: 86, protein: 1.6, carb: 20, fat: 0.1 },
    '燕麦': { cal: 379, protein: 13, carb: 68, fat: 7 },
    '牛奶': { cal: 42, protein: 3.4, carb: 5, fat: 1 },
    '香蕉': { cal: 89, protein: 1.1, carb: 23, fat: 0.3 },
    '苹果': { cal: 52, protein: 0.3, carb: 14, fat: 0.2 },
    '西兰花': { cal: 34, protein: 2.8, carb: 7, fat: 0.4 },
    '牛肉': { cal: 250, protein: 26, carb: 0, fat: 15 },
    '三文鱼': { cal: 208, protein: 20, carb: 0, fat: 13 },
    '豆腐': { cal: 76, protein: 8, carb: 1.9, fat: 4.8 },
    '全麦面包': { cal: 247, protein: 13, carb: 41, fat: 3.4 },
    '酸奶': { cal: 61, protein: 3.5, carb: 7.7, fat: 1.5 },
    '蛋白粉': { cal: 400, protein: 80, carb: 10, fat: 3.3 },
    '花生酱': { cal: 588, protein: 25, carb: 20, fat: 50 },
    '牛油果': { cal: 160, protein: 2, carb: 9, fat: 15 },
    '蛋白': { cal: 52, protein: 11, carb: 0.7, fat: 0.2 },
    '虾仁': { cal: 99, protein: 24, carb: 0.2, fat: 0.3 },
    '猪里脊': { cal: 143, protein: 21, carb: 1.5, fat: 5 },
    '土豆': { cal: 77, protein: 2, carb: 17, fat: 0.1 },
    '玉米': { cal: 86, protein: 3.2, carb: 19, fat: 1.2 },
    '菠菜': { cal: 23, protein: 2.9, carb: 3.6, fat: 0.4 },
    '番茄': { cal: 18, protein: 0.9, carb: 3.9, fat: 0.2 },
    '黄瓜': { cal: 15, protein: 0.7, carb: 3.6, fat: 0.1 },
    '胡萝卜': { cal: 41, protein: 0.9, carb: 10, fat: 0.2 },
    '洋葱': { cal: 40, protein: 1.1, carb: 9, fat: 0.1 },
    '大蒜': { cal: 149, protein: 6.4, carb: 33, fat: 0.5 },
    '生姜': { cal: 80, protein: 1.8, carb: 18, fat: 0.8 },
    '青椒': { cal: 20, protein: 0.9, carb: 4.6, fat: 0.2 },
    '茄子': { cal: 25, protein: 1, carb: 6, fat: 0.2 },
    '白菜': { cal: 13, protein: 1.5, carb: 2.2, fat: 0.2 },
    '生菜': { cal: 15, protein: 1.4, carb: 2.9, fat: 0.2 },
    '芹菜': { cal: 14, protein: 0.7, carb: 3, fat: 0.2 },
    '蘑菇': { cal: 22, protein: 3.1, carb: 3.3, fat: 0.3 },
    '海带': { cal: 43, protein: 1.8, carb: 9.9, fat: 0.6 },
    '紫菜': { cal: 250, protein: 43.6, carb: 44.1, fat: 1.1 },
    '豆腐干': { cal: 140, protein: 16, carb: 5, fat: 7 },
    '腐竹': { cal: 460, protein: 44, carb: 21, fat: 21 },
    '豆皮': { cal: 260, protein: 24, carb: 12, fat: 16 },
    '豆浆': { cal: 31, protein: 3, carb: 1.8, fat: 1.6 },
    '豆腐脑': { cal: 15, protein: 1.9, carb: 0.7, fat: 0.8 },
    '千张': { cal: 260, protein: 24, carb: 5, fat: 16 },
    '素鸡': { cal: 192, protein: 16, carb: 4, fat: 13 },
    '油豆腐': { cal: 245, protein: 17, carb: 4, fat: 18 },
    '冻豆腐': { cal: 107, protein: 11, carb: 5, fat: 5 },
    '内酯豆腐': { cal: 49, protein: 5, carb: 2.9, fat: 2.7 },
    '北豆腐': { cal: 98, protein: 12, carb: 1.5, fat: 5 },
    '南豆腐': { cal: 57, protein: 6, carb: 2.6, fat: 3 },
};

// ========== 根据食物名称、重量、烹饪方式计算营养 ==========
function calculateMealNutrition(foodName, weight, cookMethod) {
    // 查找食物数据
    let foodData = null;
    for (const [name, data] of Object.entries(FOOD_DATABASE)) {
        if (foodName.includes(name) || name.includes(foodName)) {
            foodData = { ...data, name };
            break;
        }
    }
    
    if (!foodData) {
        return null; // 未找到食物
    }
    
    // 计算基础营养（按重量比例）
    const ratio = weight / 100;
    const method = COOK_METHODS[cookMethod] || COOK_METHODS.raw;
    
    return {
        name: foodData.name,
        cal: Math.round(foodData.cal * ratio * method.multiplier),
        protein: Math.round(foodData.protein * ratio * 10) / 10,
        carb: Math.round(foodData.carb * ratio * 10) / 10,
        fat: Math.round(foodData.fat * ratio * 10) / 10,
        cookMethod: method.name
    };
}

// ========== 获取所有部位（含自定义） ==========
function getAllCategories() {
    // 深拷贝预设部位数据
    const result = JSON.parse(JSON.stringify(EXERCISES));
    
    // 过滤掉用户隐藏的预设动作
    const hiddenExercises = Storage.getHiddenExercises();
    const userTips = {};
    // 收集用户自定义要领
    const allStoredTips = Storage.get('exercise_tips', {});
    Object.assign(userTips, allStoredTips);
    
    for (const catKey in result) {
        result[catKey].exercises = result[catKey].exercises.filter(ex => !hiddenExercises.includes(ex.name));
        // 合并用户自定义要领（覆盖默认要领）
        result[catKey].exercises.forEach(ex => {
            if (userTips[ex.name]) {
                ex.tips = userTips[ex.name];
            }
        });
    }
    
    // 将自定义动作追加到对应部位
    const customExercises = Storage.getCustomExercises();
    customExercises.forEach(ex => {
        const key = ex.category || 'custom';
        if (!result[key]) {
            result[key] = { name: ex.categoryName || '其他', exercises: [] };
        }
        result[key].exercises.push({
            name: ex.name,
            muscle: ex.muscle || '自定义',
            difficulty: '自定义',
            met: ex.met || 5.0,
            weightBased: ex.weightBased !== false,
            tips: ex.tips || (userTips[ex.name] || ''),
            custom: true,
            customId: ex.id
        });
    });
    
    return result;
}

// ========== 获取指定部位的动作列表（含自定义） ==========
function getExercisesByCategory(categoryKey) {
    const all = getAllCategories();
    return all[categoryKey]?.exercises || [];
}

// ========== 查询动作是否为负重类 ==========
function isWeightBasedExercise(exerciseName) {
    // 先查预设动作
    for (const category of Object.values(EXERCISES)) {
        const exercise = category.exercises.find(e => e.name === exerciseName);
        if (exercise) {
            return exercise.weightBased !== false;
        }
    }
    // 再查自定义动作
    const customExercises = Storage.getCustomExercises();
    const custom = customExercises.find(e => e.name === exerciseName);
    if (custom) {
        return custom.weightBased !== false;
    }
    return true; // 未知动作默认负重类
}

// ========== 计算训练消耗卡路里（每组） ==========
function calculateWorkoutCalories(exerciseName, weight, reps, bodyWeight, duration) {
    // 查找 MET 值和动作类型
    let met = 5.0; // 默认 MET
    let weightBased = true; // 默认负重类
    
    // 先查预设动作
    for (const category of Object.values(EXERCISES)) {
        const exercise = category.exercises.find(e => e.name === exerciseName);
        if (exercise) {
            met = exercise.met;
            weightBased = exercise.weightBased !== false;
            break;
        }
    }
    
    // 再查自定义动作
    if (met === 5.0) {
        const customExercises = Storage.getCustomExercises();
        const custom = customExercises.find(e => e.name === exerciseName);
        if (custom) {
            met = custom.met || 5.0;
            weightBased = custom.weightBased !== false;
        }
    }
    
    const safeBodyWeight = bodyWeight || 70;
    
    if (!weightBased) {
        // ===== 自重/有氧类：以时长为主要计算依据 =====
        // duration 单位为分钟，如果没传则用 reps 估算（每组约1.5分钟）
        const durationMinutes = duration || (reps ? Math.max(1.5, reps * 0.15) : 1.5);
        
        // 核心公式：MET × 体重(kg) × 时间(小时)
        const calories = Math.round(met * safeBodyWeight * (durationMinutes / 60));
        
        return {
            calories: calories > 0 ? calories : 5,
            duration: durationMinutes,
            met: met,
            weightBased: false
        };
    } else {
        // ===== 负重类：以重量×次数为主要计算依据 =====
        const durationMinutes = 1.5; // 每组约1.5分钟
        
        // 基础消耗：MET × 体重(kg) × 时间(小时)
        const baseCalories = met * safeBodyWeight * (durationMinutes / 60);
        
        // 根据训练强度调整（重量越大消耗越多）
        const safeWeight = weight || 0;
        const intensityFactor = 1 + (safeWeight / safeBodyWeight) * 0.15;
        
        // 根据次数调整
        const safeReps = reps || 10;
        const repsFactor = Math.min(safeReps, 20) / 10;
        
        const calories = Math.round(baseCalories * intensityFactor * repsFactor);
        
        return {
            calories: calories > 0 ? calories : 5,
            duration: durationMinutes,
            met: met,
            weightBased: true
        };
    }
}

// ========== AI 知识库 ==========
const AI_KNOWLEDGE = [
    {
        keywords: ['新手', '开始', '入门', '刚练', '第一次'],
        answer: '欢迎开始健身之旅！新手建议：\n\n1️⃣ **前2周**：以学习动作为主，重量从轻开始，每组12-15次\n2️⃣ **训练频率**：每周3次全身训练，隔天练\n3️⃣ **优先动作**：深蹲、卧推、划船、肩推、硬拉\n4️⃣ **注意事项**：\n   - 每次训练前热身5-10分钟\n   - 注重动作标准，不要贪重\n   - 训练后拉伸放松\n   - 保证充足睡眠(7-8小时)\n5️⃣ **饮食**：保证蛋白质摄入(每kg体重1.5-2g)'
    },
    {
        keywords: ['减脂', '减肥', '瘦', '掉秤', '减重'],
        answer: '科学减脂指南：\n\n🔥 **核心原则**：热量缺口(摄入<消耗)\n\n📊 **热量计算**：\n- 基础代谢 ≈ 体重(kg) × 24 × 活动系数\n- 轻度活动：×1.2 | 中度活动：×1.5 | 高强度：×1.8\n- 每日缺口建议：300-500千卡\n\n🍽️ **饮食建议**：\n- 蛋白质：每kg体重2-2.2g(防止肌肉流失)\n- 碳水：不要完全断碳！选粗粮(燕麦、红薯)\n- 脂肪：适量健康脂肪(坚果、牛油果)\n- 多吃蔬菜增加饱腹感\n\n🏃 **训练建议**：\n- 力量训练 + 有氧结合\n- 每周3次力量 + 2次有氧\n- 有氧在力量训练后或休息日做'
    },
    {
        keywords: ['增肌', '长肌肉', '变壮', '变大', '围度'],
        answer: '增肌核心要点：\n\n💪 **训练原则**：\n- 渐进超负荷：逐步增加重量或次数\n- 每个肌群每周训练2次效果最佳\n- 复合动作为主(深蹲、卧推、硬拉、划船)\n- 每组8-12次，最后2次有明显困难\n- 组间休息60-90秒\n\n🍽️ **营养关键**：\n- 热量盈余：每日多摄入300-500千卡\n- 蛋白质：每kg体重1.8-2.2g\n- 碳水：充足的碳水是增肌燃料\n- 训练前后各一餐加餐\n\n😴 **恢复同样重要**：\n- 肌肉在休息时生长\n- 每个肌群训练后休息48小时\n- 保证7-8小时睡眠'
    },
    {
        keywords: ['胸肌', '胸', '卧推', '飞鸟'],
        answer: '胸肌训练推荐方案：\n\n🏋️ **动作安排**（按顺序）：\n1. 杠铃卧推 4组×8-12次（主攻整体厚度）\n2. 上斜哑铃卧推 4组×10-12次（上胸）\n3. 哑铃飞鸟 3组×12-15次（拉伸感）\n4. 龙门架夹胸 3组×12-15次（收尾雕刻）\n\n💡 **技巧要点**：\n- 卧推时肩胛骨收紧下沉\n- 感受胸肌发力，不要用手臂代偿\n- 下放时控制速度(2-3秒)\n- 推起时不要完全锁死手肘\n- 上胸薄弱就先做上斜动作'
    },
    {
        keywords: ['背', '引体', '划船', '背阔肌'],
        answer: '背部训练推荐方案：\n\n🔙 **动作安排**：\n1. 引体向上 4组×6-10次（做不了可用辅助带）\n2. 杠铃划船 4组×8-12次（厚度）\n3. 坐姿下拉 3组×10-12次（宽度）\n4. 单臂哑铃划船 3组×10-12次/侧\n5. 面拉 3组×15次（肩部后束+上背）\n\n💡 **技巧要点**：\n- 所有划船动作先收紧肩胛骨\n- 想象用手肘拉，而不是用手拉\n- 引体向上全程控制，不要甩身体\n- 背部训练要"感受"肌肉发力'
    },
    {
        keywords: ['腿', '深蹲', '臀', '股四'],
        answer: '腿部训练推荐方案：\n\n🦵 **动作安排**：\n1. 深蹲 4组×8-12次（王牌动作）\n2. 罗马尼亚硬拉 3组×10次（腘绳肌）\n3. 腿举 3组×10-12次\n4. 保加利亚分腿蹲 3组×10次/腿\n5. 提踵 4组×15-20次（小腿）\n\n💡 **深蹲技巧**：\n- 脚与肩同宽，脚尖微微外展\n- 蹲下时膝盖方向与脚尖一致\n- 保持背部挺直，核心收紧\n- 蹲到大腿与地面平行或更低\n- 起身时臀部先发力'
    },
    {
        keywords: ['饮食', '吃什么', '食谱', '营养', '蛋白质'],
        answer: '健身饮食指南：\n\n🍽️ **每日营养分配**：\n- 蛋白质：每kg体重1.6-2.2g\n- 碳水：占总热量40-50%\n- 脂肪：占总热量25-30%\n\n🥩 **优质蛋白来源**：\n- 鸡胸肉、牛肉、鱼肉、虾仁\n- 鸡蛋、豆腐、牛奶\n- 蛋白粉(方便补充)\n\n🍚 **优质碳水来源**：\n- 燕麦、红薯、糙米、全麦面包\n- 香蕉(训练前后吃很好)\n\n🥑 **优质脂肪来源**：\n- 坚果、牛油果、橄榄油\n- 三文鱼、蛋黄\n\n⏰ **进食时机**：\n- 训练前1-2小时：碳水+少量蛋白\n- 训练后30分钟内：蛋白+碳水'
    },
    {
        keywords: ['恢复', '休息', '酸痛', '疲劳', '受伤', '拉伸'],
        answer: '训练恢复指南：\n\n😴 **休息原则**：\n- 每个肌群训练后至少休息48小时\n- 每周至少安排1-2天完全休息\n- 保证7-8小时高质量睡眠\n\n🧘 **缓解酸痛**：\n- 训练后静态拉伸10-15分钟\n- 泡沫轴放松紧张肌群\n- 充足饮水(每天2-3升)\n- 补充蛋白质和维生素C\n\n⚠️ **区分正常酸痛和受伤**：\n- 正常酸痛：训练后24-72小时，钝痛感，活动后缓解\n- 受伤信号：尖锐疼痛、关节痛、肿胀、活动受限\n- 如有受伤信号，立即停止训练并就医'
    },
    {
        keywords: ['蛋白粉', '补剂', '肌酸', '氮泵'],
        answer: '常见补剂指南：\n\n✅ **推荐补剂**：\n1. **蛋白粉**：方便的蛋白质来源，训练后1勺\n2. **肌酸**：研究最充分的补剂，提升力量和肌肉量\n   - 每天5g，随时服用\n   - 服用期间多喝水\n3. **维生素D**：很多人缺乏，有助于骨骼健康\n\n⚠️ **可选补剂**：\n- 氮泵(训练前)：提升训练专注度和耐力\n- BCAA：有充足蛋白摄入时非必需\n- 鱼油：抗炎，关节健康\n\n❌ **新手不建议**：\n- 不要一开始就依赖补剂\n- 优先保证饮食和训练质量\n- 补剂只是锦上添花'
    },
    {
        keywords: ['计划', '安排', '一周', '周计划', '怎么练'],
        answer: '推荐训练计划安排：\n\n📅 **新手(每周3天)**：\n- 周一：全身训练A\n- 周三：全身训练B\n- 周五：全身训练A\n\n📅 **进阶(每周4天)**：\n- 周一：上肢(胸+肩+三头)\n- 周二：下肢(腿+核心)\n- 周四：上肢(背+二头)\n- 周五：下肢(腿+核心)\n\n📅 **高级(每周5天)**：\n- 周一：胸部\n- 周二：背部\n- 周三：肩部+核心\n- 周四：腿部\n- 周五：手臂\n\n💡 **通用建议**：\n- 先做大肌群(胸背腿)，再做小肌群(肩臂)\n- 有氧放在力量训练后\n- 每个动作先做热身组(轻重量)'
    }
];
