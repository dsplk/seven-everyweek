// ========== 训练动作数据库 ==========
const ExerciseDB = {
    chest: {
        name: '胸部',
        icon: '🏋️',
        actions: {
            pushup: { name: '俯卧撑', type: '自重' },
            benchPress: { name: '杠铃卧推', type: '杠铃' },
            dumbbellPress: { name: '哑铃卧推', type: '哑铃' },
            dumbbellFly: { name: '哑铃飞鸟', type: '哑铃' },
            cableCrossover: { name: '绳索夹胸', type: '器械' },
            chestDip: { name: '双杠臂屈伸', type: '自重' },
            machinePress: { name: '器械推胸', type: '器械' }
        }
    },
    back: {
        name: '背部',
        icon: '🔙',
        actions: {
            pullup: { name: '引体向上', type: '自重' },
            deadlift: { name: '硬拉', type: '杠铃' },
            barbellRow: { name: '杠铃划船', type: '杠铃' },
            dumbbellRow: { name: '哑铃划船', type: '哑铃' },
            latPulldown: { name: '高位下拉', type: '器械' },
            seatedRow: { name: '坐姿划船', type: '器械' },
            facePull: { name: '面拉', type: '绳索' }
        }
    },
    shoulder: {
        name: '肩部',
        icon: '💪',
        actions: {
            overheadPress: { name: '杠铃推举', type: '杠铃' },
            dumbbellPress: { name: '哑铃推举', type: '哑铃' },
            lateralRaise: { name: '侧平举', type: '哑铃' },
            frontRaise: { name: '前平举', type: '哑铃' },
            rearDeltFly: { name: '反向飞鸟', type: '哑铃' },
            uprightRow: { name: '直立划船', type: '杠铃' },
            shrugs: { name: '耸肩', type: '哑铃' }
        }
    },
    arms: {
        name: '手臂',
        icon: '💪',
        actions: {
            barbellCurl: { name: '杠铃弯举', type: '杠铃' },
            dumbbellCurl: { name: '哑铃弯举', type: '哑铃' },
            hammerCurl: { name: '锤式弯举', type: '哑铃' },
            tricepPushdown: { name: '三头下压', type: '绳索' },
            skullcrusher: { name: '碎颅者', type: '杠铃' },
            closeGripBench: { name: '窄距卧推', type: '杠铃' },
            preacherCurl: { name: '牧师凳弯举', type: '器械' }
        }
    },
    legs: {
        name: '腿部',
        icon: '🦵',
        actions: {
            squat: { name: '深蹲', type: '杠铃' },
            legPress: { name: '腿举', type: '器械' },
            legExtension: { name: '腿屈伸', type: '器械' },
            legCurl: { name: '腿弯举', type: '器械' },
            calfRaise: { name: '提踵', type: '器械' },
            lunge: { name: '箭步蹲', type: '哑铃' },
            romanianDeadlift: { name: '罗马尼亚硬拉', type: '杠铃' }
        }
    },
    core: {
        name: '核心',
        icon: '🎯',
        actions: {
            plank: { name: '平板支撑', type: '自重' },
            crunch: { name: '卷腹', type: '自重' },
            legRaise: { name: '举腿', type: '自重' },
            russianTwist: { name: '俄罗斯转体', type: '自重' },
            hangingLegRaise: { name: '悬垂举腿', type: '自重' },
            abWheel: { name: '健腹轮', type: '器械' },
            cableCrunch: { name: '绳索卷腹', type: '绳索' }
        }
    },
    cardio: {
        name: '有氧',
        icon: '🏃',
        actions: {
            running: { name: '跑步', type: '有氧' },
            cycling: { name: '骑行', type: '有氧' },
            swimming: { name: '游泳', type: '有氧' },
            rowing: { name: '划船机', type: '有氧' },
            elliptical: { name: '椭圆机', type: '有氧' },
            jumpRope: { name: '跳绳', type: '有氧' },
            hiit: { name: 'HIIT', type: '有氧' }
        }
    }
};

// ========== 食物热量数据库 ==========
const FoodDB = {
    // 蛋白质类
    chicken_breast: { name: '鸡胸肉', cal: 165, protein: 31, carb: 0, fat: 3.6, unit: 100 },
    beef: { name: '牛肉', cal: 250, protein: 26, carb: 0, fat: 15, unit: 100 },
    pork: { name: '猪肉', cal: 242, protein: 27, carb: 0, fat: 14, unit: 100 },
    fish: { name: '鱼肉', cal: 206, protein: 22, carb: 0, fat: 12, unit: 100 },
    shrimp: { name: '虾', cal: 99, protein: 24, carb: 0, fat: 0.3, unit: 100 },
    egg: { name: '鸡蛋', cal: 155, protein: 13, carb: 1.1, fat: 11, unit: 100 },
    egg_white: { name: '蛋白', cal: 52, protein: 11, carb: 0.7, fat: 0.2, unit: 100 },
    tofu: { name: '豆腐', cal: 76, protein: 8, carb: 1.9, fat: 4.8, unit: 100 },
    
    // 碳水类
    rice: { name: '米饭', cal: 130, protein: 2.7, carb: 28, fat: 0.3, unit: 100 },
    brown_rice: { name: '糙米', cal: 111, protein: 2.6, carb: 23, fat: 0.9, unit: 100 },
    oatmeal: { name: '燕麦', cal: 389, protein: 16.9, carb: 66, fat: 6.9, unit: 100 },
    sweet_potato: { name: '红薯', cal: 86, protein: 1.6, carb: 20, fat: 0.1, unit: 100 },
    potato: { name: '土豆', cal: 77, protein: 2, carb: 17, fat: 0.1, unit: 100 },
    bread: { name: '面包', cal: 265, protein: 9, carb: 49, fat: 3.2, unit: 100 },
    noodle: { name: '面条', cal: 138, protein: 4.5, carb: 25, fat: 2.1, unit: 100 },
    
    // 蔬菜类
    broccoli: { name: '西兰花', cal: 34, protein: 2.8, carb: 7, fat: 0.4, unit: 100 },
    spinach: { name: '菠菜', cal: 23, protein: 2.9, carb: 3.6, fat: 0.4, unit: 100 },
    tomato: { name: '番茄', cal: 18, protein: 0.9, carb: 3.9, fat: 0.2, unit: 100 },
    cucumber: { name: '黄瓜', cal: 16, protein: 0.7, carb: 3.6, fat: 0.1, unit: 100 },
    carrot: { name: '胡萝卜', cal: 41, protein: 0.9, carb: 10, fat: 0.2, unit: 100 },
    mushroom: { name: '蘑菇', cal: 22, protein: 3.1, carb: 3.3, fat: 0.3, unit: 100 },
    
    // 水果类
    apple: { name: '苹果', cal: 52, protein: 0.3, carb: 14, fat: 0.2, unit: 100 },
    banana: { name: '香蕉', cal: 89, protein: 1.1, carb: 23, fat: 0.3, unit: 100 },
    orange: { name: '橙子', cal: 47, protein: 0.9, carb: 12, fat: 0.1, unit: 100 },
    grape: { name: '葡萄', cal: 69, protein: 0.7, carb: 18, fat: 0.2, unit: 100 },
    
    // 脂肪类
    olive_oil: { name: '橄榄油', cal: 884, protein: 0, carb: 0, fat: 100, unit: 100 },
    peanut_butter: { name: '花生酱', cal: 588, protein: 25, carb: 20, fat: 50, unit: 100 },
    almond: { name: '杏仁', cal: 579, protein: 21, carb: 22, fat: 50, unit: 100 },
    walnut: { name: '核桃', cal: 654, protein: 15, carb: 14, fat: 65, unit: 100 },
    
    // 乳制品
    milk: { name: '牛奶', cal: 42, protein: 3.4, carb: 5, fat: 1, unit: 100 },
    greek_yogurt: { name: '希腊酸奶', cal: 59, protein: 10, carb: 3.6, fat: 0.4, unit: 100 },
    cheese: { name: '奶酪', cal: 402, protein: 25, carb: 1.3, fat: 33, unit: 100 }
};

// 烹饪方式热量系数
const CookMethodMultipliers = {
    raw: 1.0,
    boiled: 1.0,
    steamed: 1.0,
    stirfried: 1.2,
    fried: 1.5,
    roasted: 1.1,
    braised: 1.3
};
