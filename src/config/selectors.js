/**
 * 平台选择器管理类
 * 
 * 职责：
 * 1. 加载并维护平台配置（从 JSON 或硬编码）
 * 2. 提供 Fallback 机制
 * 3. 维护运行时缓存
 */
class SelectorManager {
    constructor() {
        this.platforms = {};
        this.cache = new Map();
        this.isLoaded = false;
        
        // 初始硬编码配置（作为最后一道防线）
        this._initHardcodedConfig();
    }

    /**
     * 初始化：从 JSON 文件加载配置
     */
    async init() {
        try {
            const url = chrome.runtime.getURL('src/config/selectors.json');
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data.platforms) {
                // 合并配置：JSON 优先
                this.platforms = { ...this.platforms, ...data.platforms };
                this.isLoaded = true;
                console.log('ChatNavigator: Selector configuration loaded from JSON');
            }
        } catch (err) {
            console.warn('ChatNavigator: Failed to load selectors.json, using hardcoded fallback', err);
        }
    }

    _initHardcodedConfig() {
        this.platforms = {
            "DEEPSEEK": {
                "name": "DeepSeek",
                "urlPatterns": ["deepseek.com", "deepseek.ai"],
                "selectors": {
                    "conversation": null,
                    "title": ".f8d1e4c0",
                    "question": "._9663006",
                    "answer": "._4f9bf79._43c05b5",
                    "thinking": ".ds-think-content, ._74c0879",
                    "HEADINGS": ["h1", "h2", "h3", "h4", "h5", "h6"]
                },
                "features": { "removeThinking": true }
            },
            "YUANBAO": {
                "name": "YuanBao AI",
                "urlPatterns": ["yuanbao.tencent.com"],
                "selectors": {
                    "conversation": null,
                    "title": ".agent-dialogue__content--common__header",
                    "question": ".agent-chat__bubble--human",
                    "answer": ".agent-chat__bubble--ai",
                    "thinking": ".hyc-component-reasoner__think",
                    "HEADINGS": ["h1", "h2", "h3", "h4", "h5", "h6"]
                },
                "features": { "removeThinking": true }
            },
            "CHATGPT": {
                "name": "ChatGPT",
                "urlPatterns": ["chatgpt.com"],
                "selectors": {
                    "conversation": null,
                    "question": "[data-turn=\"user\"] .whitespace-pre-wrap",
                    "answer": "[data-turn=\"assistant\"]",
                    "HEADINGS": ["h1", "h2", "h3", "h4", "h5", "h6"]
                },
                "features": { "titleFromFirstQuestion": true }
            },
            "DOUBAO": {
                "name": "Doubao",
                "urlPatterns": ["doubao.com"],
                "selectors": {
                    "conversation": null,
                    "question": ".message-content.message-box-content-otxGGw.send-message-box-content-N1r3Gh.samantha-message-box-content-Qjmpja",
                    "answer": ".message-content.message-box-content-otxGGw.receive-message-box-content-_lREFj.samantha-message-box-content-Qjmpja",
                    "HEADINGS": ["h1", "h2", "h3", "h4", "h5", "h6"]
                },
                "features": { "titleFromFirstQuestion": true }
            },
            "GEMINI": {
                "name": "Gemini",
                "urlPatterns": ["gemini.google.com"],
                "selectors": {
                    "conversation": ".conversation-container",
                    "title": ".conversation-title-container",
                    "question": ".user-query-container",
                    "answer": ".response-container",
                    "HEADINGS": ["h1", "h2", "h3", "h4", "h5", "h6"]
                },
                "features": {}
            },
            "GROK": {
                "name": "Grok",
                "urlPatterns": ["grok.com"],
                "selectors": {
                    "conversation": null,
                    "question": ".message-bubble:not(:has(.response-content-markdown))",
                    "answer": ".response-content-markdown",
                    "HEADINGS": ["h1", "h2", "h3", "h4", "h5", "h6"]
                },
                "features": {}
            },
            "KIMI": {
                "name": "Kimi",
                "urlPatterns": ["kimi.com", "kimi.moonshot.cn"],
                "selectors": {
                    "conversation": null,
                    "question": ".user-content",
                    "answer": ".chat-content-item.chat-content-item-assistant .markdown-container, .markdown-body .markdown-container, [class*=\"assistant\"] .markdown-container",
                    "HEADINGS": ["h1", "h2", "h3", "h4", "h5", "h6", "[id*=\"heading\"]", "[class*=\"title\"]", "[class*=\"header\"]"]
                },
                "features": {}
            },
            "GENERIC": {
                "name": "Generic AI Chat",
                "urlPatterns": [],
                "selectors": {
                    "conversation": "article, section, .message, .chat-item",
                    "question": ".user-message, .question, [data-role=\"user\"]",
                    "answer": ".assistant-message, .answer, .markdown-body, [data-role=\"assistant\"]",
                    "HEADINGS": ["h1", "h2", "h3", "h4", "h5", "h6"]
                },
                "features": {}
            }
        };
    }

    /**
     * 智能提取逻辑 (Smart Extraction)
     * 按照优先级返回匹配的元素列表
     */
    getElements(platformId, type, context = document) {
        // 如果平台不存在，回退到 GENERIC
        const platform = this.getPlatform(platformId) || this.getPlatform('GENERIC');
        const selectors = platform ? (platform.selectors || {}) : {};
        const primarySelector = selectors[type];

        // 1. 尝试主选择器 (JSON/硬编码/GENERIC配置)
        if (primarySelector) {
            const elements = context.querySelectorAll(primarySelector);
            if (elements.length > 0) return Array.from(elements);
        }

        // 2. 如果主选择器失效，或者没有显式配置，启动智能自愈逻辑
        
        // 2.1 语义与无障碍特征 (Semantic & ARIA) - 稳定性最高
        const semanticElements = this._trySemantic(type, context);
        if (semanticElements.length > 0) return semanticElements;

        // 2.2 业务数据打标 (Data Attributes) - 稳定性次之
        const dataElements = this._tryDataAttributes(type, context);
        if (dataElements.length > 0) return dataElements;

        // 2.3 启发式特征识别 (Heuristic) - 兜底方案
        const heuristicElements = this._tryHeuristic(type, context);
        if (heuristicElements.length > 0) return heuristicElements;

        return [];
    }

    _trySemantic(type, context) {
        const semanticRules = {
            conversation: ['article', 'section[role="log"]', '.chat-messages > div', '[aria-label*="chat" i]'],
            question: [
                'pre[role="presentation"]', 
                'article[aria-label*="User" i]', 
                'section[aria-label*="User" i]',
                '.user-content',
                'div[class*="user" i] pre'
            ],
            answer: [
                '.markdown', 
                '.markdown-body',
                'article[aria-label*="Assistant" i]', 
                'section[aria-label*="Assistant" i]',
                '[role="presentation"] .markdown',
                'div[class*="assistant" i] .markdown'
            ],
            thinking: [
                '[role="status"]', 
                'details[open] summary', 
                '.thinking-process',
                'div[class*="think" i]',
                'blockquote:has(p:contains("思考"))'
            ],
            title: ['header h1', '[role="banner"] h1', 'title'],
            HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        };

        const rules = semanticRules[type] || [];
        for (const selector of rules) {
            try {
                const elements = context.querySelectorAll(selector);
                if (elements.length > 0) return Array.from(elements);
            } catch (e) {
                // 忽略无效的选择器（如 :contains 可能在某些浏览器不支持）
                continue;
            }
        }
        return [];
    }

    _tryDataAttributes(type, context) {
        const dataPatterns = {
            conversation: ['[data-testid*="message" i]', '[data-role*="turn" i]', '[data-qa*="chat-item" i]'],
            question: [
                '[data-testid*="user" i]', 
                '[data-role="user"]', 
                '[data-qa*="question" i]',
                '[data-message-author-role="user"]'
            ],
            answer: [
                '[data-testid*="assistant" i]', 
                '[data-role="assistant"]', 
                '[data-qa*="answer" i]', 
                '[data-testid*="message-text" i]',
                '[data-message-author-role="assistant"]'
            ],
            thinking: [
                '[data-testid*="thought" i]', 
                '[data-role="thought"]', 
                '[data-qa*="thinking" i]',
                '[data-is-thinking="true"]'
            ],
            title: ['[data-testid*="title" i]', '[data-role="chat-title"]'],
            HEADINGS: ['[data-testid*="heading" i]', '[id*="heading" i]', '[class*="title" i]', '[class*="header" i]']
        };

        const patterns = dataPatterns[type] || [];
        for (const pattern of patterns) {
            const elements = context.querySelectorAll(pattern);
            if (elements.length > 0) return Array.from(elements);
        }
        return [];
    }

    _tryHeuristic(type, context) {
        if (type === 'thinking') {
            const divs = context.querySelectorAll('div, p, span');
            return Array.from(divs).filter(el => {
                const text = el.textContent.trim().toLowerCase();
                return (text.includes('思考') || text.includes('thought')) && el.children.length < 3;
            });
        }
        
        if (type === 'answer') {
            // 启发式：寻找包含大量代码、表格或特定 Markdown 结构的容器
            const containers = context.querySelectorAll('div, section, article');
            return Array.from(containers).filter(el => {
                const hasMarkdown = el.querySelector('code, table, ul > li, ol > li, blockquote');
                const isLongEnough = el.textContent.trim().length > 20;
                // 排除可能是导航栏或侧边栏的情况
                const isNotNav = !el.closest('nav, aside');
                return hasMarkdown && isLongEnough && isNotNav;
            });
        }

        if (type === 'question') {
            // 启发式：寻找在回答之前的块
            const answers = this._trySemantic('answer', context);
            if (answers.length > 0) {
                return answers.map(ans => ans.previousElementSibling).filter(el => el !== null);
            }
        }

        return [];
    }

    getPlatform(id) {
        return this.platforms[id] || null;
    }

    /**
     * 生成供 SITE_PATTERNS 使用的正则表达式
     */
    getPattern(id) {
        const platform = this.getPlatform(id);
        if (!platform || !platform.urlPatterns) return null;
        
        // 将 urlPatterns 转换为正则表达式字符串
        const patterns = platform.urlPatterns.map(p => {
            if (p.includes('.')) {
                // 转义点号，处理通配符
                return p.replace(/\./g, '\\.').replace(/\*/g, '.*');
            }
            return p;
        });
        
        return new RegExp(patterns.join('|'));
    }
}

// 初始化管理器
window.SELECTOR_MANAGER = new SelectorManager();
window.SELECTOR_MANAGER.init();

// 使用 Proxy 导出 SELECTORS，保持向后兼容
window.SELECTORS = new Proxy({}, {
    get(target, prop) {
        // 如果是 Symbol 或者内置属性，直接返回
        if (typeof prop === 'symbol' || prop === 'prototype') return undefined;
        return window.SELECTOR_MANAGER.getPlatform(prop);
    },
    ownKeys() {
        return Object.keys(window.SELECTOR_MANAGER.platforms);
    },
    getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
    }
});

// 使用 Proxy 导出 SITE_PATTERNS，保持向后兼容
window.SITE_PATTERNS = new Proxy({}, {
    get(target, prop) {
        if (typeof prop === 'symbol' || prop === 'prototype') return undefined;
        return window.SELECTOR_MANAGER.getPattern(prop);
    },
    ownKeys() {
        return Object.keys(window.SELECTOR_MANAGER.platforms);
    },
    getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
    }
});