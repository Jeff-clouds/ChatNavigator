/**
 * 平台选择器配置
 * 
 * 每个平台只需定义：
 * - name: 平台名称
 * - urlPatterns: URL匹配规则
 * - selectors: DOM选择器
 * - features: 可选的功能开关
 */

const deepseekConfig = {
    name: 'DeepSeek',
    urlPatterns: ['deepseek.com', 'deepseek.ai'],
    selectors: {
        conversation: null, // 待填入：对话容器选择器 (优先使用此嵌套模式)
        title: '.f8d1e4c0',
        question: '._9663006',
        answer: '._4f9bf79._43c05b5',
        thinking: '.ds-think-content, ._74c0879',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    features: {
        removeThinking: true
    }
};

const yuanbaoConfig = {
    name: 'YuanBao AI',
    urlPatterns: ['yuanbao.tencent.com'],
    selectors: {
        conversation: null, // 待填入：对话容器选择器 (优先使用此嵌套模式)
        title: '.agent-dialogue__content--common__header',
        question: '.agent-chat__bubble--human',
        answer: '.agent-chat__bubble--ai',
        thinking: '.hyc-component-reasoner__think',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    features: {
        removeThinking: true
    }
};

const chatgptConfig = {
    name: 'ChatGPT',
    urlPatterns: ['chatgpt.com'],
    selectors: {
        conversation: null, // ChatGPT 为扁平结构，通过 data-testid 分辨 turns，故此处留空
        question: '[data-turn="user"] .whitespace-pre-wrap',
        answer: '[data-turn="assistant"]',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    features: {
        titleFromFirstQuestion: true
    }
};

const doubaoConfig = {
    name: 'Doubao',
    urlPatterns: ['doubao.com'],
    selectors: {
        conversation: null, // 待填入：对话容器选择器 (优先使用此嵌套模式)
        question: '.message-content.message-box-content-otxGGw.send-message-box-content-N1r3Gh.samantha-message-box-content-Qjmpja',
        answer: '.message-content.message-box-content-otxGGw.receive-message-box-content-_lREFj.samantha-message-box-content-Qjmpja',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    features: {
        titleFromFirstQuestion: true
    }
};

const geminiConfig = {
    name: 'Gemini',
    urlPatterns: ['gemini.google.com'],
    selectors: {
        conversation: '.conversation-container', // 对话容器选择器
        title: '.conversation-title-container',
        question: '.user-query-container',
        answer: '.response-container',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    features: {}
};

const grokConfig = {
    name: 'Grok',
    urlPatterns: ['grok.com'],
    selectors: {
        conversation: null,
        question: '.message-bubble:not(:has(.response-content-markdown))',
        answer: '.response-content-markdown',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    features: {}
};

const kimiConfig = {
    name: 'Kimi',
    urlPatterns: ['kimi.com'],
    selectors: {
        conversation: null, // Kimi 没有嵌套的问答结构，所有问答在同一层级
        question: '.user-content',
        answer: '.chat-content-item.chat-content-item-assistant .markdown-container, .markdown-body .markdown-container, [class*="assistant"] .markdown-container',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '[id*="heading"]', '[class*="title"]', '[class*="header"]']
    },
    features: {}
};

// 导出配置到 window 对象
window.SELECTORS = {
    DEEPSEEK: deepseekConfig,
    YUANBAO: yuanbaoConfig,
    CHATGPT: chatgptConfig,
    DOUBAO: doubaoConfig,
    GEMINI: geminiConfig,
    GROK: grokConfig,
    KIMI: kimiConfig
};

// 保持兼容性的正则模式 (供 common.js 使用)
window.SITE_PATTERNS = {
    DEEPSEEK: /deepseek\.(com|ai)/,
    YUANBAO: /yuanbao\.tencent\.com/,
    CHATGPT: /chatgpt\.com/,
    GEMINI: /gemini\.google\.com/,
    GROK: /grok\.com/,
    DOUBAO: /doubao\.com/,
    KIMI: /kimi\.(com|moonshot\.cn)/
};
