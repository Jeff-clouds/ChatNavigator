// 生成唯一ID
window.generateId = function() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// 节流函数
window.throttle = function(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 按照文档顺序排序元素
window.sortElementsByDocumentPosition = function(elements) {
    return elements.sort((a, b) => {
        const position = a.element.compareDocumentPosition(b.element);
        return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
}

// 判断当前网站类型
window.getCurrentSite = function(url = window.location.href) {
    if (SITE_PATTERNS.DEEPSEEK.test(url)) return 'DEEPSEEK';
    if (SITE_PATTERNS.YUANBAO.test(url)) return 'YUANBAO';
    if (SITE_PATTERNS.CHATGPT.test(url)) return 'CHATGPT';
    if (SITE_PATTERNS.GEMINI.test(url)) return 'GEMINI';
    if (SITE_PATTERNS.GROK.test(url)) return 'GROK';
    if (SITE_PATTERNS.DOUBAO.test(url)) return 'DOUBAO';
    return 'OTHER';
}
