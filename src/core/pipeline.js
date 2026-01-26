window.Pipeline = class Pipeline {
    constructor() {
        this.siteType = getCurrentSite();
        this.selectors = SELECTORS[this.siteType];
    }

    // 核心提取逻辑
    extract() {
        if (!this.selectors) return [];

        const outline = [];
        
        if (this.siteType === 'CHATGPT') {
            this._extractChatGPT(outline);
        } else if (this.siteType === 'DOUBAO') {
            this._extractDoubao(outline);
        } else {
            // 通用处理逻辑 (DeepSeek, Yuanbao, Gemini, Grok)
            this._extractStandard(outline);
        }

        return outline;
    }

    // 处理标准结构的问答 (DeepSeek, Gemini, Grok, Yuanbao)
    _extractStandard(outline) {
        const { QUESTION, ANSWER } = this.selectors;
        const pairs = document.querySelectorAll(`${QUESTION}, ${ANSWER}`);
        
        pairs.forEach((element, index) => {
            if (!element.id) element.id = generateId();

            if (element.matches(QUESTION)) {
                outline.push({
                    text: `问题 ${Math.floor(index/2) + 1}: ${element.textContent.trim()}`,
                    level: 'h1',
                    id: element.id,
                    type: 'question'
                });
            } else {
                this._processAnswerHeadings(element, outline);
            }
        });
    }

    // ChatGPT 特殊处理 (DOM 结构分离)
    _extractChatGPT(outline) {
        const questions = document.querySelectorAll(this.selectors.QUESTION);
        const answers = document.querySelectorAll(this.selectors.ANSWER);
        
        questions.forEach((question, index) => {
            if (!question.id) question.id = generateId();
            
            outline.push({
                text: `问题 ${index + 1}: ${question.textContent.trim()}`,
                level: 'h1',
                id: question.id,
                type: 'question'
            });

            const answer = answers[index];
            if (answer) {
                if (!answer.id) answer.id = generateId();
                this._processAnswerHeadings(answer, outline);
            }
        });
    }

    // 豆包特殊处理
    _extractDoubao(outline) {
        const questions = document.querySelectorAll(this.selectors.QUESTION);
        const answers = document.querySelectorAll(this.selectors.ANSWER);
        
        questions.forEach((question, index) => {
            if (!question.id) question.id = generateId();
            
            const questionText = question.textContent.trim().replace(/\s+/g, ' ');
            outline.push({
                text: `问题 ${index + 1}: ${questionText}`,
                level: 'h1',
                id: question.id,
                type: 'question'
            });

            const answer = answers[index];
            if (answer) {
                if (!answer.id) answer.id = generateId();
                this._processAnswerHeadings(answer, outline);
            }
        });
    }

    // 通用标题提取
    _processAnswerHeadings(answerElement, outline) {
        let headingsConfig = this.selectors.HEADINGS;
        
        // 元宝特殊处理：区分深度/简单回答
        if (this.siteType === 'YUANBAO') {
             if (answerElement.querySelector(this.selectors.DEEP_ANSWER.CONTAINER)) {
                 headingsConfig = this.selectors.DEEP_ANSWER.HEADINGS;
             } else {
                 headingsConfig = this.selectors.SIMPLE_ANSWER.HEADINGS;
             }
        }

        const allHeadings = [];
        headingsConfig.forEach((selector, index) => {
            const headings = answerElement.querySelectorAll(selector);
            headings.forEach(heading => {
                allHeadings.push({
                    element: heading,
                    level: index + 1
                });
            });
        });

        const sortedHeadings = sortElementsByDocumentPosition(allHeadings);

        sortedHeadings.forEach(({element, level}) => {
            if (!element.id) element.id = generateId();
            outline.push({
                text: element.textContent.trim(),
                level: `h${level}`,
                id: element.id,
                type: 'answer'
            });
        });
    }
}
