// ========== AI 聊天功能 ==========
const AIResponses = {
    '新手': `新手健身建议：
1. 从基础动作开始：深蹲、俯卧撑、引体向上
2. 每周训练3-4次，每次45-60分钟
3. 注重动作质量，不要追求大重量
4. 保证充足睡眠和蛋白质摄入
5. 坚持记录训练数据，循序渐进`,

    '减脂': `减脂饮食建议：
1. 控制总热量，制造300-500千卡缺口
2. 高蛋白饮食：每公斤体重1.6-2g蛋白质
3. 多吃蔬菜，增加饱腹感
4. 减少精制碳水，选择粗粮
5. 多喝水，每天2-3升
6. 避免含糖饮料和酒精`,

    '胸肌': `胸肌训练推荐：
1. 杠铃卧推 - 4组×8-12次
2. 哑铃飞鸟 - 3组×12-15次
3. 上斜哑铃推举 - 3组×10-12次
4. 双杠臂屈伸 - 3组×力竭
5. 绳索夹胸 - 3组×15次

建议每周训练胸部1-2次`,

    '恢复': `训练后恢复建议：
1. 训练后30分钟内补充蛋白质和碳水
2. 保证每晚7-9小时睡眠
3. 训练后拉伸放松肌肉
4. 每周安排1-2天完全休息
5. 可以泡澡或按摩促进血液循环
6. 多喝水帮助代谢废物排出`,

    '蛋白': `蛋白质摄入建议：
- 增肌期：每公斤体重1.6-2.2g
- 减脂期：每公斤体重2-2.4g
- 优质来源：鸡胸肉、鱼、蛋、牛肉、豆类
- 建议分散到每餐，每次20-40g
- 训练后30分钟内补充效果最佳`,

    'default': `我是您的AI健身助手，可以回答：
• 新手如何开始健身
• 减脂期间怎么饮食
• 各部位肌肉训练方法
• 训练后如何恢复
• 蛋白质怎么补充

请直接输入您的问题！`
};

function sendChat() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    // 模拟AI回复
    setTimeout(() => {
        const response = getAIResponse(message);
        addChatMessage(response, 'ai');
    }, 500);
}

function sendQuickQ(question) {
    document.getElementById('chat-input').value = question;
    sendChat();
}

function addChatMessage(text, sender) {
    const container = document.getElementById('chat-container');
    
    // 隐藏欢迎界面
    const welcome = container.querySelector('.chat-welcome');
    if (welcome) welcome.style.display = 'none';
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.textContent = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function getAIResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('新手') || lowerMsg.includes('开始')) {
        return AIResponses['新手'];
    }
    if (lowerMsg.includes('减脂') || lowerMsg.includes('减肥') || lowerMsg.includes('怎么吃')) {
        return AIResponses['减脂'];
    }
    if (lowerMsg.includes('胸') || lowerMsg.includes('胸肌')) {
        return AIResponses['胸肌'];
    }
    if (lowerMsg.includes('恢复') || lowerMsg.includes('休息') || lowerMsg.includes('酸痛')) {
        return AIResponses['恢复'];
    }
    if (lowerMsg.includes('蛋白') || lowerMsg.includes('吃多少')) {
        return AIResponses['蛋白'];
    }
    
    return AIResponses['default'];
}
