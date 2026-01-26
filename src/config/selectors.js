window.SELECTORS = {
    DEEPSEEK: {
        QUESTION: '.fbb737a4',
        ANSWER: '.ds-markdown.ds-markdown--block',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    YUANBAO: {
        QUESTION: '.agent-chat__bubble--human',
        ANSWER: '.agent-chat__bubble--ai',
        DEEP_ANSWER: {
            HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            CONTAINER: '.agent-chat__bubble--ai-deep'
        },
        SIMPLE_ANSWER: {
            HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        }
    },
    CHATGPT: {
        QUESTION: '[data-message-author-role="user"] .whitespace-pre-wrap',
        ANSWER: '[data-message-author-role="assistant"]',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    GEMINI: {
        QUESTION: '.user-query-container:not(.user-query-container .user-query-container)',
        ANSWER: '.response-container-content',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    GROK: {
        QUESTION: '.message-bubble:not(:has(.response-content-markdown))',
        ANSWER: '.response-content-markdown',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    DOUBAO: {
        QUESTION: '[data-testid="send_message"]',
        ANSWER: '[data-testid="receive_message"]',
        HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    }
};

window.SITE_PATTERNS = {
    DEEPSEEK: /deepseek\.com/,
    YUANBAO: /yuanbao\.tencent\.com/,
    CHATGPT: /chatgpt\.com/,
    GEMINI: /gemini\.google\.com/,
    GROK: /grok\.com/,
    DOUBAO: /doubao\.com/
};
