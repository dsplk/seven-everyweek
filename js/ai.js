// ========== AI 健身助手模块 ==========
const FitAI = {
    /**
     * 处理用户输入，返回 AI 回复
     * @param {string} input 用户输入
     * @returns {string} AI 回复
     */
    process(input) {
        if (!input || input.trim() === '') {
            return '请输入你的健身问题，我会尽力回答！😊';
        }

        const text = input.trim().toLowerCase();

        // 1. 检查是否是食物热量查询
        const foodResult = this.searchFood(input);
        if (foodResult) return foodResult;

        // 2. 关键词匹配知识库
        const knowledgeResult = this.searchKnowledge(text);
        if (knowledgeResult) return knowledgeResult;

        // 3. 问候语
        if (this.isGreeting(text)) {
            return this.getGreetingResponse();
        }

        // 4. 鼓励语
        if (this.isEncouragement(text)) {
            return this.getEncouragement();
        }

        // 5. 默认回复
        return this.getDefaultResponse(input);
    },

    // 搜索食物热量
    searchFood(input) {
        for (const [name, info] of Object.entries(FOOD_DATABASE)) {
            if (input.includes(name)) {
                return `📊 **${name}** 营养信息(${info.per})：\n\n` +
                    `🔥 热量：${info.cal} 千卡\n` +
                    `💪 蛋白质：${info.protein}g\n` +
                    `🍚 碳水：${info.carb}g\n` +
                    `🥑 脂肪：${info.fat}g\n\n` +
                    `💡 提示：你可以把食物记录到饮食页面，我会帮你计算每日总摄入！`;
            }
        }
        return null;
    },

    // 关键词匹配知识库
    searchKnowledge(text) {
        let bestMatch = null;
        let bestScore = 0;

        for (const item of AI_KNOWLEDGE) {
            let score = 0;
            for (const keyword of item.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    score += keyword.length; // 更长的关键词权重更高
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }

        return bestMatch ? bestMatch.answer : null;
    },

    // 判断是否是问候
    isGreeting(text) {
        const greetings = ['你好', '嗨', 'hi', 'hello', '在吗', '在不在'];
        return greetings.some(g => text === g || text === g + '！');
    },

    getGreetingResponse() {
        const responses = [
            '你好！我是你的 AI 健身助手 💪 有什么健身问题都可以问我！\n\n你可以问我关于：\n- 训练动作和计划\n- 饮食和营养\n- 减脂/增肌建议\n- 食物热量查询\n- 训练恢复',
            '嗨！很高兴见到你！🤖\n\n今天准备练什么？我可以帮你推荐训练动作，或者回答任何健身相关的问题！',
            '你好呀！健身达人！🏋️\n\n有什么我可以帮你的？不管是训练、饮食还是恢复问题，尽管问我！'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // 判断是否需要鼓励
    isEncouragement(text) {
        const words = ['加油', '坚持', '好累', '不想练', '放弃', '太难了', '疼', '不想动'];
        return words.some(w => text.includes(w));
    },

    getEncouragement() {
        const responses = [
            '💪 加油！每一滴汗水都不会白费！\n\n记住：\n- 坚持比完美更重要\n- 每次训练都比不练强\n- 肌肉在休息时生长\n- 你已经比昨天的自己更强了！\n\n🔥 继续保持，你一定可以的！',
            '🌟 你已经很棒了！能坚持健身就已经超越了大多数人！\n\n累了就适当休息，但不要放弃。休息是为了更好地出发！\n\n记住你的目标，想想坚持下来后的自己，那个画面一定很帅！💪',
            '🤗 每个人都会有不想练的时候，这很正常！\n\n小建议：\n- 告诉自己"只练10分钟"，往往练着练着就完成了\n- 听一首喜欢的音乐\n- 想想训练后的成就感\n\n你已经走了这么远，不要停下来！🔥'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // 默认回复
    getDefaultResponse(input) {
        const defaults = [
            `关于"${input}"这个问题，让我想想...🤔\n\n我目前的知识库可能还没有覆盖到这个话题，但我可以帮你解答以下方面的问题：\n\n🏋️ 训练相关：动作推荐、训练计划、各部位训练\n🍎 饮食相关：营养搭配、食物热量、增肌/减脂饮食\n💪 健身知识：新手入门、恢复拉伸、补剂推荐\n\n你可以试试换个方式提问，或者点击下方的快捷问题按钮！`,
            `这个问题很好！不过我暂时还没有学到这方面的知识 😅\n\n你可以问我：\n- "新手应该怎么开始健身？"\n- "减脂期间应该怎么吃？"\n- "鸡胸肉的热量是多少？"\n- "胸肌训练推荐"\n\n我会不断学习更多知识来帮助你！💪`
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }
};
