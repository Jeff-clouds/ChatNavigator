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
                this._processAnswerHeadings(answerEl, outline, index);
            }
        });
    }

    _extractFlat(outline) {
        const { selectors } = this.config;
        const questions = Array.from(document.querySelectorAll(selectors.question));
        const answers = Array.from(document.querySelectorAll(selectors.answer));

        // 组合所有元素并保留原始索引
        const items = [
            ...questions.map((el, i) => ({ type: 'question', element: el, index: i })),
            ...answers.map((el, i) => ({ type: 'answer', element: el, index: i }))
        ];

        // 按文档位置排序
        items.sort((a, b) => {
            const position = a.element.compareDocumentPosition(b.element);
            if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            return 0;
        });

        // 按顺序处理
        items.forEach(item => {
            if (item.type === 'question') {
                this._addQuestionToOutline(item.element, item.index, outline);
            } else if (item.type === 'answer') {
                this._processAnswerHeadings(item.element, outline, item.index);
            }
        });
    }

    _addQuestionToOutline(questionEl, index, outline) {
        // 使用稳定 ID
        const stableId = `cn-q-${index}`;
        if (questionEl.id !== stableId) questionEl.id = stableId;
        
        let text = questionEl.textContent.trim();
        if (text.length > 50) text = text.substring(0, 50) + '...';
        
        outline.push({
            text: `问题 ${index + 1}: ${text}`,
            level: 'h1',
            id: questionEl.id,
            type: 'question',
            metadata: {
                type: 'question',
                index: index
            }
        });
    }

    _processAnswerHeadings(answerElement, outline, answerIndex) {
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

        sortedHeadings.forEach(({element, level}, headingIndex) => {
            // 使用稳定 ID
            const stableId = `cn-a-${answerIndex}-h-${headingIndex}`;
            if (element.id !== stableId) element.id = stableId;
            
            outline.push({
                text: element.textContent.trim(),
                level: `h${level}`,
                id: element.id,
                type: 'answer',
                metadata: {
                    type: 'answer',
                    answerIndex: answerIndex,
                    headingIndex: headingIndex
                }
            });
        });
    }

    // 根据元数据查找元素
    findElement(metadata) {
        if (!this.config || !metadata) return null;
        const { selectors } = this.config;

        if (metadata.type === 'question') {
            const questions = document.querySelectorAll(selectors.question);
            return questions[metadata.index] || null;
        } else if (metadata.type === 'answer') {
            const answers = document.querySelectorAll(selectors.answer);
            const answerEl = answers[metadata.answerIndex];
            if (!answerEl) return null;

            // 重新查找该回答下的所有标题
            const headingsConfig = selectors.HEADINGS || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
            const allHeadings = [];
            
            // 需要使用与 _processAnswerHeadings 相同的逻辑来收集标题，确保索引一致
            const { features } = this.config;
            headingsConfig.forEach((selector, index) => {
                const headings = answerEl.querySelectorAll(selector);
                headings.forEach(heading => {
                    if (features && features.removeThinking && selectors.thinking) {
                        if (heading.closest(selectors.thinking)) return; 
                    }
                    if (heading.classList.contains('sr-only')) return;
                    if (!heading.textContent.trim()) return;
                    allHeadings.push({ element: heading, level: index + 1 });
                });
            });

            const sortedHeadings = sortElementsByDocumentPosition(allHeadings);
            const target = sortedHeadings[metadata.headingIndex];
            return target ? target.element : null;
        }
        return null;
    }
};
