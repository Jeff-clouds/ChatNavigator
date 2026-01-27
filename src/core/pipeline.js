window.Pipeline = class Pipeline {
    constructor() {
        this.config = this._getPlatformConfig(window.location.href);
        if (this.config) {
            console.log(`ChatNavigator: Identified platform ${this.config.name}`);
        } else {
            console.log('ChatNavigator: No matching platform found');
        }
    }

    _getPlatformConfig(url) {
        for (const key in window.SELECTORS) {
            const config = window.SELECTORS[key];
            if (config.urlPatterns) {
                for (const pattern of config.urlPatterns) {
                    if (pattern instanceof RegExp) {
                        if (pattern.test(url)) return config;
                    } else if (typeof pattern === 'string') {
                        if (url.includes(pattern)) return config;
                    }
                }
            }
        }
        return null;
    }

    extract() {
        if (!this.config) return [];
        
        const outline = [];
        const { selectors } = this.config;

        // 1. 优先尝试嵌套模式 (Conversation Item Mode)
        if (selectors.conversation) {
            const items = document.querySelectorAll(selectors.conversation);
            if (items.length > 0) {
                this._extractNested(items, outline);
                return outline;
            }
        }

        // 2. 回退到扁平模式 (Flat Mode)
        this._extractFlat(outline);
        return outline;
    }

    _extractNested(items, outline) {
        const { selectors } = this.config;

        items.forEach((item, index) => {
            const questionEl = item.querySelector(selectors.question);
            const answerEl = item.querySelector(selectors.answer);

            if (questionEl && answerEl) {
                this._addQuestionToOutline(questionEl, index, outline);
                this._processAnswerHeadings(answerEl, outline);
            }
        });
    }

    _extractFlat(outline) {
        const { selectors } = this.config;
        const questions = document.querySelectorAll(selectors.question);
        const answers = document.querySelectorAll(selectors.answer);
        const count = Math.min(questions.length, answers.length);

        for (let i = 0; i < count; i++) {
            const questionEl = questions[i];
            const answerEl = answers[i];

            this._addQuestionToOutline(questionEl, i, outline);
            this._processAnswerHeadings(answerEl, outline);
        }
    }

    _addQuestionToOutline(questionEl, index, outline) {
        if (!questionEl.id) questionEl.id = generateId();
        
        let text = questionEl.textContent.trim();
        if (text.length > 50) text = text.substring(0, 50) + '...';
        
        outline.push({
            text: `问题 ${index + 1}: ${text}`,
            level: 'h1',
            id: questionEl.id,
            type: 'question'
        });
    }

    _processAnswerHeadings(answerElement, outline) {
        const { selectors, features } = this.config;
        
        // 默认 H1-H6
        const headingsConfig = selectors.HEADINGS || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const allHeadings = [];

        headingsConfig.forEach((selector, index) => {
            const headings = answerElement.querySelectorAll(selector);
            headings.forEach(heading => {
                // 特性处理：如果开启了 removeThinking，且该标题位于 thinking 容器内，则跳过
                if (features && features.removeThinking && selectors.thinking) {
                    if (heading.closest(selectors.thinking)) {
                        return; 
                    }
                }
                
                // 忽略辅助阅读文本 (如 "ChatGPT说")
                if (heading.classList.contains('sr-only')) return;

                // 跳过空标题
                if (!heading.textContent.trim()) return;

                allHeadings.push({
                    element: heading,
                    level: index + 1
                });
            });
        });

        // 按文档位置排序
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
};
