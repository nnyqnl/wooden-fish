// ==================== 版本管理 ====================
const APP_VERSION = '1.0.4';
console.log(`木鱼祈福应用 v${APP_VERSION}`);

// 版本检查
function checkVersion() {
    const storedVersion = localStorage.getItem('wooden_fish_version');
    if (storedVersion !== APP_VERSION) {
        console.log(`版本更新: ${storedVersion || '未知'} -> ${APP_VERSION}`);
        // 清除可能的旧数据
        if (storedVersion && storedVersion < '1.0.4') {
            console.log('检测到旧版本，执行数据迁移...');
        }
        localStorage.setItem('wooden_fish_version', APP_VERSION);
    }
}

// ==================== DOM 元素获取 ====================
const woodenFish = document.getElementById('woodenFish');
const mallet = document.getElementById('mallet');
const sessionCountElement = document.getElementById('sessionCount');
const todayCountElement = document.getElementById('todayCount');
const totalCountElement = document.getElementById('totalCount');
const prayOnceBtn = document.getElementById('prayOnce');
const autoPrayBtn = document.getElementById('autoPray');
const dataToggleBtn = document.getElementById('dataToggleBtn');
const counters = document.getElementById('counters');

// 桌面端语言切换器
const languageBtn = document.getElementById('languageBtn');
const languageDropdown = document.getElementById('languageDropdown');
const currentLanguageElement = document.getElementById('currentLanguage');

// 移动端语言切换器
const mobileLanguageBtn = document.getElementById('mobileLanguageBtn');
const mobileLanguageDrawer = document.getElementById('mobileLanguageDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const mobileLanguageOptions = document.getElementById('mobileLanguageOptions');
const drawerTitle = document.getElementById('drawerTitle');

// ==================== 状态变量 ====================
let sessionCount = 0;
let todayCount = 0;
let totalCount = 0;
let autoPrayInterval = null;
let isAutoPraying = false;
const prayerSpeed = 800;

// 当前语言
let currentLanguage = localStorage.getItem('prayerLanguage') || 'zh-CN';

// 木鱼敲击音效
const woodSound = new Audio('assets/audio/wooden-fish.wav');
woodSound.volume = 0.4;

// 移动端语言选项数据
const mobileLanguageList = [
    { code: 'zh-CN', name: '中文', short: '中', flag: 'https://flagcdn.com/w20/cn.png' },
    { code: 'en-US', name: 'English (US)', short: 'EN', flag: 'https://flagcdn.com/w20/us.png' },
    { code: 'en-GB', name: 'English (UK)', short: 'UK', flag: 'https://flagcdn.com/w20/gb.png' },
    { code: 'fr-FR', name: 'Français', short: 'FR', flag: 'https://flagcdn.com/w20/fr.png' },
    { code: 'sv-SE', name: 'Svenska', short: 'SV', flag: 'https://flagcdn.com/w20/se.png' },
    { code: 'de-DE', name: 'Deutsch', short: 'DE', flag: 'https://flagcdn.com/w20/de.png' },
    { code: 'ru-RU', name: 'Русский', short: 'RU', flag: 'https://flagcdn.com/w20/ru.png' }
];

// 抽屉标题翻译映射
const drawerTitleMap = {
    'zh-CN': '选择语言',
    'en-US': 'Select Language',
    'en-GB': 'Select Language',
    'fr-FR': 'Choisir la langue',
    'sv-SE': 'Välj språk',
    'de-DE': 'Sprache auswählen',
    'ru-RU': 'Выберите язык'
};

// ==================== 核心功能函数 ====================

// 更新移动端按钮文字
function updateMobileLanguageButton() {
    const currentLangData = mobileLanguageList.find(lang => lang.code === currentLanguage);
    if (currentLangData && mobileLanguageBtn) {
        mobileLanguageBtn.textContent = currentLangData.short;
    }
}

// 更新抽屉标题
function updateDrawerTitle() {
    if (drawerTitle) {
        drawerTitle.textContent = drawerTitleMap[currentLanguage] || 'Select Language';
    }
}

// 初始化移动端语言选项列表
function initMobileLanguageOptions() {
    if (!mobileLanguageOptions) return;
    
    mobileLanguageOptions.innerHTML = '';
    
    mobileLanguageList.forEach(lang => {
        const option = document.createElement('div');
        option.className = `mobile-language-option ${currentLanguage === lang.code ? 'active' : ''}`;
        option.dataset.lang = lang.code;
        
        option.innerHTML = `
            <img src="${lang.flag}" alt="${lang.name}" class="mobile-language-flag">
            <span class="mobile-language-name">${lang.name}</span>
        `;
        
        option.addEventListener('click', () => {
            switchLanguage(lang.code);
            closeMobileDrawer();
        });
        
        mobileLanguageOptions.appendChild(option);
    });
}

// 打开移动端抽屉
function openMobileDrawer() {
    if (!mobileLanguageDrawer || !drawerOverlay) return;
    
    mobileLanguageDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭移动端抽屉
function closeMobileDrawer() {
    if (!mobileLanguageDrawer || !drawerOverlay) return;
    
    mobileLanguageDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// 应用翻译
function applyTranslations() {
    const lang = translations[currentLanguage];
    if (!lang) return;
    
    // 更新页面元素
    const updateElement = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    
    updateElement('headerTitle', lang.title);
    updateElement('headerSubtitle', lang.subtitle);
    updateElement('sessionCountLabel', lang.sessionCountLabel);
    updateElement('todayCountLabel', lang.todayCountLabel);
    updateElement('totalCountLabel', lang.totalCountLabel);
    updateElement('instructionsText', lang.instructionsText);
    updateElement('prayOnceText', lang.prayOnceText);
    updateElement('footerText', lang.footerText);
    updateElement('about', lang.about);
    updateElement('aboutTitle', lang.aboutTitle);
    updateElement('aboutContent', lang.aboutContent);
    updateElement('privacy', lang.privacy);
    updateElement('privacyTitle', lang.privacyTitle);
    updateElement('privacyContent', lang.privacyContent);
    updateElement('contact', lang.contact);
    updateElement('contactTitle', lang.contactTitle);
    updateElement('contactContent', lang.contactContent);
    updateElement('backToHome', lang.backToHome);
    
    if (currentLanguageElement) {
        currentLanguageElement.textContent = lang.languageName;
    }
    
    // 更新页面标题和meta信息
    document.title = lang.pageTitle;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', lang.metaDescription);
    }
    
    // 更新Open Graph标签
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', lang.pageTitle);
    if (ogDescription) ogDescription.setAttribute('content', lang.metaDescription);
    
    // 更新Twitter标签
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterTitle) twitterTitle.setAttribute('content', lang.title);
    if (twitterDescription) twitterDescription.setAttribute('content', lang.metaDescription);
    
    // 更新数据切换按钮文本
    const isShowingAll = counters && counters.classList.contains('show-all');
    updateElement('dataToggleText', isShowingAll ? lang.dataToggleTextHide : lang.dataToggleTextShow);
    
    // 更新自动敲击按钮文本
    if (autoPrayBtn) {
        const autoPrayText = isAutoPraying ? lang.stopAutoPrayText : lang.autoPrayText;
        updateElement('autoPrayText', autoPrayText);
    }
    
    // 更新HTML lang属性
    document.documentElement.lang = currentLanguage;
    
    // 更新语言选择器中的活动状态
    document.querySelectorAll('.language-option').forEach(option => {
        if (option.dataset.lang === currentLanguage) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // 更新移动端组件
    updateMobileLanguageButton();
    updateDrawerTitle();
    initMobileLanguageOptions();
    
    // 保存语言偏好
    localStorage.setItem('prayerLanguage', currentLanguage);
}

// 切换语言
function switchLanguage(langCode) {
    if (translations[langCode]) {
        currentLanguage = langCode;
        applyTranslations();
    }
}

// 从localStorage加载数据
function loadPrayerData() {
    // 加载总祈福次数
    const savedTotal = localStorage.getItem('totalPrayCount');
    if (savedTotal) {
        totalCount = parseInt(savedTotal);
    }
    
    // 加载今日祈福次数
    const today = new Date().toDateString();
    const savedToday = localStorage.getItem('todayPrayData');
    if (savedToday) {
        const todayData = JSON.parse(savedToday);
        if (todayData.date === today) {
            todayCount = todayData.count;
        } else {
            todayCount = 0;
        }
    }
    
    updateCounters();
}

// 保存数据到localStorage
function savePrayerData() {
    localStorage.setItem('totalPrayCount', totalCount.toString());
    
    const today = new Date().toDateString();
    const todayData = {
        date: today,
        count: todayCount
    };
    localStorage.setItem('todayPrayData', JSON.stringify(todayData));
}

// 更新计数器显示
function updateCounters() {
    if (sessionCountElement) sessionCountElement.textContent = sessionCount;
    if (todayCountElement) todayCountElement.textContent = todayCount;
    if (totalCountElement) totalCountElement.textContent = totalCount;
}

// 敲击木鱼动画
function hitWoodenFish() {
    return new Promise((resolve) => {
        woodenFish.classList.add('hit');
        mallet.classList.add('swing');
        
        woodSound.currentTime = 0;
        woodSound.play().catch(e => console.log('音效播放失败:', e));
        
        sessionCount++;
        todayCount++;
        totalCount++;
        
        updateCounters();
        savePrayerData();
        
        // 视觉反馈
        const counterItems = document.querySelectorAll('.counter-item');
        counterItems.forEach(item => {
            item.style.transform = 'scale(1.05)';
            item.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
            }, 200);
        });
        
        setTimeout(() => {
            woodenFish.classList.remove('hit');
        }, 150);
        
        setTimeout(() => {
            mallet.classList.remove('swing');
            resolve();
        }, 300);
        
        // 特殊效果
        if (totalCount % 108 === 0) {
            showSpecialEffect();
        }
    });
}

// 开始自动敲击
function startAutoPray() {
    if (isAutoPraying) return;
    
    isAutoPraying = true;
    autoPrayBtn.classList.remove('btn-secondary');
    autoPrayBtn.classList.add('btn-active');
    
    const autoPrayTextEl = document.getElementById('autoPrayText');
    if (autoPrayTextEl) {
        autoPrayTextEl.textContent = translations[currentLanguage].stopAutoPrayText;
    }
    
    function scheduleNextHit() {
        if (!isAutoPraying) return;
        
        hitWoodenFish().then(() => {
            if (isAutoPraying) {
                autoPrayInterval = setTimeout(scheduleNextHit, prayerSpeed);
            }
        });
    }
    
    scheduleNextHit();
}

// 停止自动敲击
function stopAutoPray() {
    if (!isAutoPraying) return;
    
    isAutoPraying = false;
    autoPrayBtn.classList.remove('btn-active');
    autoPrayBtn.classList.add('btn-secondary');
    
    const autoPrayTextEl = document.getElementById('autoPrayText');
    if (autoPrayTextEl) {
        autoPrayTextEl.textContent = translations[currentLanguage].autoPrayText;
    }
    
    if (autoPrayInterval) {
        clearTimeout(autoPrayInterval);
        autoPrayInterval = null;
    }
}

// 切换自动敲击状态
function toggleAutoPray() {
    if (isAutoPraying) {
        stopAutoPray();
    } else {
        startAutoPray();
    }
}

// 切换数据显示
function toggleDataDisplay() {
    if (!counters || !dataToggleBtn) return;
    
    const isShowingAll = counters.classList.contains('show-all');
    
    if (isShowingAll) {
        counters.classList.remove('show-all');
        const textEl = document.getElementById('dataToggleText');
        if (textEl) textEl.textContent = translations[currentLanguage].dataToggleTextShow;
        dataToggleBtn.classList.remove('active');
    } else {
        counters.classList.add('show-all');
        const textEl = document.getElementById('dataToggleText');
        if (textEl) textEl.textContent = translations[currentLanguage].dataToggleTextHide;
        dataToggleBtn.classList.add('active');
    }
}

// 特殊效果
function showSpecialEffect() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const originalBg = container.style.backgroundColor;
    
    container.style.transition = 'background-color 0.5s';
    container.style.backgroundColor = '#fff8dc';
    
    setTimeout(() => {
        container.style.backgroundColor = originalBg;
        createGoldenParticles();
    }, 500);
}

// 创建金色粒子效果
function createGoldenParticles() {
    const container = document.querySelector('.content');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '✨';
        particle.style.position = 'absolute';
        particle.style.fontSize = Math.random() * 20 + 15 + 'px';
        particle.style.left = Math.random() * 80 + 10 + '%';
        particle.style.top = Math.random() * 80 + 10 + '%';
        particle.style.opacity = '0.8';
        particle.style.zIndex = '100';
        particle.style.pointerEvents = 'none';
        particle.style.animation = `floatUp ${Math.random() * 1 + 1}s ease-out forwards`;
        
        if (!document.querySelector('#particle-animation')) {
            const style = document.createElement('style');
            style.id = 'particle-animation';
            style.innerHTML = `
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 0.8; }
                    100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 1000);
    }
}

// 检查并重置今天的数据
function checkAndResetTodayData() {
    const today = new Date().toDateString();
    const savedToday = localStorage.getItem('todayPrayData');
    
    if (savedToday) {
        const todayData = JSON.parse(savedToday);
        if (todayData.date !== today) {
            todayCount = 0;
            updateCounters();
            const newTodayData = {
                date: today,
                count: todayCount
            };
            localStorage.setItem('todayPrayData', JSON.stringify(newTodayData));
        }
    }
}

// ==================== 响应式UI控制 ====================

// 根据屏幕宽度切换语言UI显示 - 这是修复的核心！
function toggleLanguageUIByScreenSize() {
    const isMobile = window.innerWidth <= 900;
    const desktopSelector = document.querySelector('.language-selector');
    
    // 确保元素存在
    if (!desktopSelector || !mobileLanguageBtn) return;
    
    if (isMobile) {
        // 移动端：显示浮动按钮，隐藏桌面选择器
        mobileLanguageBtn.style.display = 'flex';
        desktopSelector.style.display = 'none';
        
        // 确保桌面端下拉菜单关闭
        if (languageDropdown) {
            languageDropdown.classList.remove('active');
        }
    } else {
        // 桌面端：隐藏浮动按钮和抽屉，显示桌面选择器
        mobileLanguageBtn.style.display = 'none';
        desktopSelector.style.display = 'block';
        
        // 确保移动端抽屉关闭
        closeMobileDrawer();
    }
}

// 根据屏幕宽度切换计数器显示
function toggleCountersDisplay() {
    const isMobile = window.innerWidth <= 900;
    
    if (isMobile) {
        // 移动端：默认只显示第一个计数器
        if (counters && !counters.classList.contains('show-all')) {
            dataToggleBtn.style.display = 'inline-flex';
        }
    } else {
        // 桌面端：显示所有计数器
        if (counters) {
            counters.classList.add('show-all');
        }
        if (dataToggleBtn) {
            dataToggleBtn.style.display = 'none';
        }
    }
}

// ==================== 事件监听 ====================

// 木鱼敲击事件
if (woodenFish) woodenFish.addEventListener('click', () => hitWoodenFish());
if (prayOnceBtn) prayOnceBtn.addEventListener('click', () => hitWoodenFish());
if (autoPrayBtn) autoPrayBtn.addEventListener('click', toggleAutoPray);
if (dataToggleBtn) dataToggleBtn.addEventListener('click', toggleDataDisplay);

// 桌面端语言选择器事件
if (languageBtn) {
    languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (languageDropdown) {
            languageDropdown.classList.toggle('active');
        }
    });
}

document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', () => {
        const langCode = option.dataset.lang;
        switchLanguage(langCode);
        if (languageDropdown) {
            languageDropdown.classList.remove('active');
        }
    });
});

// 移动端语言选择器事件
if (mobileLanguageBtn) mobileLanguageBtn.addEventListener('click', openMobileDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeMobileDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileDrawer);

// 点击页面其他区域关闭桌面端下拉菜单
document.addEventListener('click', () => {
    if (languageDropdown) {
        languageDropdown.classList.remove('active');
    }
});

// 键盘快捷键
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        hitWoodenFish();
    }
    
    if (event.code === 'KeyA') {
        event.preventDefault();
        toggleAutoPray();
    }
    
    if (event.code === 'KeyD' && window.innerWidth <= 900) {
        event.preventDefault();
        toggleDataDisplay();
    }
    
    if (event.code === 'KeyL') {
        event.preventDefault();
        if (window.innerWidth <= 900) {
            openMobileDrawer();
        } else if (languageDropdown) {
            languageDropdown.classList.toggle('active');
        }
    }
});

// 窗口大小变化事件
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        toggleLanguageUIByScreenSize();
        toggleCountersDisplay();
    }, 100);
});

// ==================== 页面初始化 ====================

// 主初始化函数
function initApp() {
    console.log('初始化木鱼祈福应用...');
    
    // 检查版本
    checkVersion();
    
    // 加载语言设置
    const savedLang = localStorage.getItem('prayerLanguage');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    } else {
        // 尝试根据浏览器语言自动选择
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('en')) {
            if (browserLang.includes('GB') || browserLang.includes('UK')) {
                currentLanguage = 'en-GB';
            } else {
                currentLanguage = 'en-US';
            }
        } else if (browserLang.startsWith('sv')) {
            currentLanguage = 'sv-SE';
        } else if (browserLang.startsWith('de')) {
            currentLanguage = 'de-DE';
        } else if (browserLang.startsWith('ru')) {
            currentLanguage = 'ru-RU';
        } else if (browserLang.startsWith('fr')) {
            currentLanguage = 'fr-FR';
        }
    }
    
    // 应用翻译
    applyTranslations();
    
    // 加载数据
    loadPrayerData();
    
    // 检查是否需要重置今日数据
    checkAndResetTodayData();
    
    // 初始化UI显示
    toggleLanguageUIByScreenSize();
    toggleCountersDisplay();
    initMobileLanguageOptions();
    updateMobileLanguageButton();
    
    // 显示欢迎提示
    setTimeout(() => {
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.style.transition = 'all 0.5s ease';
            instructions.style.backgroundColor = 'rgba(255, 245, 215, 0.9)';
            instructions.style.boxShadow = '0 0 15px rgba(184, 148, 70, 0.2)';
            
            setTimeout(() => {
                instructions.style.backgroundColor = 'rgba(255, 249, 230, 0.9)';
                instructions.style.boxShadow = 'none';
            }, 2000);
        }
    }, 1000);
    
    console.log('应用初始化完成');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// 页面关闭或刷新前保存数据
window.addEventListener('beforeunload', () => {
    savePrayerData();
});

// 移动端触摸优化：防止双击缩放
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// 错误处理
window.addEventListener('error', function(e) {
    console.error('应用错误:', e.error);
});

// ==================== 开发工具 ====================
// 在控制台显示有用的命令
if (window.console) {
    console.log('%c木鱼祈福调试命令:', 'color: #b89446; font-weight: bold;');
    console.log('window.switchLanguage("zh-CN") - 切换到中文');
    console.log('window.switchLanguage("en-US") - 切换到英文');
    console.log('window.toggleAutoPray() - 切换自动敲击');
    console.log('当前版本:', APP_VERSION);
}