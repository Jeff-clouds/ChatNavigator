(function() {
    // 清理旧的实例和监听器
    if (window.chatNavigatorCleanup) {
        window.chatNavigatorCleanup();
    }

    // 初始化管道
    const pipeline = new Pipeline();

    // 状态变量
    let readingPositionObserver = null;
    let currentReadingElement = null;
    let mainObserver = null;

    // 提取大纲并发送
    window.extractAndSendOutline = function() {
        const outline = pipeline.extract();
        chrome.runtime.sendMessage({
            type: 'outline',
            outline: outline
        });
        
        // 初始化阅读位置检测
        setTimeout(initializeReadingPositionDetection, 500);
    }

    function initializeReadingPositionDetection() {
        if (readingPositionObserver) readingPositionObserver.disconnect();
        
        const outlineElements = Array.from(document.querySelectorAll('[id^="_"]'));
        if (outlineElements.length === 0) return;
        
        readingPositionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCurrentReadingPosition(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
        });
        
        outlineElements.forEach(element => readingPositionObserver.observe(element));
    }

    function updateCurrentReadingPosition(element) {
        if (currentReadingElement === element) return;
        currentReadingElement = element;
        chrome.runtime.sendMessage({
            type: 'updateReadingPosition',
            elementId: element.id,
            elementText: element.textContent.trim()
        });
    }

    // 消息处理函数
    function handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'scrollTo':
                const element = document.getElementById(message.elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 暂时高亮
                    element.style.transition = 'background-color 0.5s';
                    const originalBg = element.style.backgroundColor;
                    element.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                    setTimeout(() => {
                        element.style.backgroundColor = originalBg;
                    }, 1500);
                }
                break;
            case 'getOutline':
                extractAndSendOutline();
                break;
            case 'toggle_outline':
                // 仅作日志，实际功能由 SidePanel 处理
                console.log('toggle_outline command received');
                break;
            case 'next_heading':
                navigateHeadings('next');
                break;
            case 'prev_heading':
                navigateHeadings('prev');
                break;
        }
    }

    // 添加消息监听
    chrome.runtime.onMessage.addListener(handleMessage);

    function initializeOutline() {
        setTimeout(extractAndSendOutline, 1000);
        
        // 监听DOM变化
        mainObserver = new MutationObserver(throttle(() => {
            extractAndSendOutline();
        }, 1000)); // 1秒节流

        mainObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 导航功能实现
    function navigateHeadings(direction) {
        const outlineElements = Array.from(document.querySelectorAll('[id^="_"]'));
        if (outlineElements.length === 0) return;

        // 找到当前视口中最接近顶部的元素
        let currentIndex = -1;
        
        // 如果有当前阅读位置记录
        if (currentReadingElement) {
            currentIndex = outlineElements.indexOf(currentReadingElement);
        } else {
            // 否则查找视口中的第一个
            const viewportHeight = window.innerHeight;
            for (let i = 0; i < outlineElements.length; i++) {
                const rect = outlineElements[i].getBoundingClientRect();
                if (rect.top >= 0 && rect.top < viewportHeight) {
                    currentIndex = i;
                    break;
                }
            }
        }

        let nextIndex;
        if (direction === 'next') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= outlineElements.length) nextIndex = 0; // 循环
        } else {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = outlineElements.length - 1; // 循环
        }

        const targetElement = outlineElements[nextIndex];
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            updateCurrentReadingPosition(targetElement);
        }
    }

    // 启动
    if (document.readyState === 'complete') {
        initializeOutline();
    } else {
        window.addEventListener('load', initializeOutline);
    }

    // 注册清理函数
    window.chatNavigatorCleanup = function() {
        if (mainObserver) mainObserver.disconnect();
        if (readingPositionObserver) readingPositionObserver.disconnect();
        chrome.runtime.onMessage.removeListener(handleMessage);
        window.removeEventListener('load', initializeOutline);
    };

})();
