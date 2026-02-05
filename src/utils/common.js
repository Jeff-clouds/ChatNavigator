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


