// 获取DOM元素
const woodenFish = document.getElementById('woodenFish');
const mallet = document.getElementById('mallet');
const sessionCountElement = document.getElementById('sessionCount');
const todayCountElement = document.getElementById('todayCount');
const totalCountElement = document.getElementById('totalCount');
const prayOnceBtn = document.getElementById('prayOnce');
const autoPrayBtn = document.getElementById('autoPray');
const dataToggleBtn = document.getElementById('dataToggleBtn');
const counters = document.getElementById('counters');
const languageBtn = document.getElementById('languageBtn');
const languageDropdown = document.getElementById('languageDropdown');
const currentLanguageElement = document.getElementById('currentLanguage');

// 移动端语言切换器元素
const mobileLanguageBtn = document.getElementById('mobileLanguageBtn');
const mobileLanguageDrawer = document.getElementById('mobileLanguageDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const mobileLanguageOptions = document.getElementById('mobileLanguageOptions');
const drawerTitle = document.getElementById('drawerTitle');

// 初始化计数
let sessionCount = 0;
let todayCount = 0;
let totalCount = 0;

// 自动敲击相关变量
let autoPrayInterval = null;
let isAutoPraying = false;
const prayerSpeed = 800;

// 木鱼敲击音效
const woodSound = new Audio('wooden-fish.wav');
woodSound.volume = 0.4;

// 当前语言
let currentLanguage = localStorage.getItem('prayerLanguage') || 'zh-CN';

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

// 应用翻译
function applyTranslations() {
    const lang = translations[currentLanguage];
    
    // 更新页面元素
    document.getElementById('headerTitle').textContent = lang.title;
    document.getElementById('headerSubtitle').textContent = lang.subtitle;
    document.getElementById('sessionCountLabel').textContent = lang.sessionCountLabel;
    document.getElementById('todayCountLabel').textContent = lang.todayCountLabel;
    document.getElementById('totalCountLabel').textContent = lang.totalCountLabel;
    document.getElementById('instructionsText').textContent = lang.instructionsText;
    document.getElementById('prayOnceText').textContent = lang.prayOnceText;
    document.getElementById('footerText').textContent = lang.footerText;
    currentLanguageElement.textContent = lang.languageName;
    
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
    const isShowingAll = counters.classList.contains('show-all');
    document.getElementById('dataToggleText').textContent = isShowingAll ? lang.dataToggleTextHide : lang.dataToggleTextShow;
    
    // 更新自动敲击按钮文本
    if (isAutoPraying) {
        document.getElementById('autoPrayText').textContent = lang.stopAutoPrayText;
    } else {
        document.getElementById('autoPrayText').textContent = lang.autoPrayText;
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
    initMobileLanguageOptions();
    updateDrawerTitle();
    
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
    sessionCountElement.textContent = sessionCount;
    todayCountElement.textContent = todayCount;
    totalCountElement.textContent = totalCount;
}

// 敲击木鱼动画
function hitWoodenFish() {
    return new Promise((resolve) => {
        woodenFish.classList.add('hit');
        mallet.classList.add('swing');
        
        woodSound.currentTime = 0;
        woodSound.play();
        
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
    document.getElementById('autoPrayText').textContent = translations[currentLanguage].stopAutoPrayText;
    
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
    document.getElementById('autoPrayText').textContent = translations[currentLanguage].autoPrayText;
    
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
    const isShowingAll = counters.classList.contains('show-all');
    
    if (isShowingAll) {
        counters.classList.remove('show-all');
        document.getElementById('dataToggleText').textContent = translations[currentLanguage].dataToggleTextShow;
        dataToggleBtn.classList.remove('active');
    } else {
        counters.classList.add('show-all');
        document.getElementById('dataToggleText').textContent = translations[currentLanguage].dataToggleTextHide;
        dataToggleBtn.classList.add('active');
    }
}

// 特殊效果
function showSpecialEffect() {
    const container = document.querySelector('.container');
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
            particle.remove();
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

// ==================== 移动端语言切换器功能 ====================

// 更新移动端按钮文字
function updateMobileLanguageButton() {
    const currentLangData = mobileLanguageList.find(lang => lang.code === currentLanguage);
    if (currentLangData) {
        mobileLanguageBtn.textContent = currentLangData.short;
    }
}

// 更新抽屉标题
function updateDrawerTitle() {
    drawerTitle.textContent = drawerTitleMap[currentLanguage] || 'Select Language';
}

// 初始化移动端语言选项列表
function initMobileLanguageOptions() {
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
            
            // 同步更新桌面端选项状态
            document.querySelectorAll('.language-option').forEach(desktopOption => {
                if(desktopOption.dataset.lang === lang.code) {
                    desktopOption.classList.add('active');
                } else {
                    desktopOption.classList.remove('active');
                }
            });
        });
        
        mobileLanguageOptions.appendChild(option);
    });
}

// 打开移动端抽屉
function openMobileDrawer() {
    mobileLanguageDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭移动端抽屉
function closeMobileDrawer() {
    mobileLanguageDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// 根据屏幕宽度切换UI显示
function toggleLanguageUIByScreenSize() {
    const isMobile = window.innerWidth <= 900;
    
    if (isMobile) {
        // 移动端：显示浮动按钮，隐藏桌面选择器
        mobileLanguageBtn.style.display = 'flex';
        document.querySelector('.language-selector').style.display = 'none';
    } else {
        // 桌面端：隐藏浮动按钮和抽屉，显示桌面选择器
        mobileLanguageBtn.style.display = 'none';
        document.querySelector('.language-selector').style.display = 'block';
        closeMobileDrawer();
    }
}

// ==================== 事件监听 ====================

// 木鱼敲击事件
woodenFish.addEventListener('click', () => hitWoodenFish());
prayOnceBtn.addEventListener('click', () => hitWoodenFish());
autoPrayBtn.addEventListener('click', toggleAutoPray);
dataToggleBtn.addEventListener('click', toggleDataDisplay);

// 桌面端语言选择器事件
languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle('active');
});

document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', () => {
        const langCode = option.dataset.lang;
        switchLanguage(langCode);
        languageDropdown.classList.remove('active');
        
        // 同步更新移动端选项状态
        document.querySelectorAll('.mobile-language-option').forEach(mobileOption => {
            if(mobileOption.dataset.lang === langCode) {
                mobileOption.classList.add('active');
            } else {
                mobileOption.classList.remove('active');
            }
        });
    });
});

// 移动端语言选择器事件
mobileLanguageBtn.addEventListener('click', openMobileDrawer);
closeDrawerBtn.addEventListener('click', closeMobileDrawer);
drawerOverlay.addEventListener('click', closeMobileDrawer);

// 点击页面其他区域关闭桌面端下拉菜单
document.addEventListener('click', () => {
    languageDropdown.classList.remove('active');
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
        } else {
            languageDropdown.classList.toggle('active');
        }
    }
});

// ==================== 页面初始化 ====================

// 页面加载时初始化
window.addEventListener('load', () => {
    // 加载语言设置
    const savedLang = localStorage.getItem('prayerLanguage');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    } else {
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
    
    // 初始检查屏幕尺寸
    checkScreenSize();
    
    // 显示欢迎提示
    setTimeout(() => {
        const instructions = document.querySelector('.instructions');
        instructions.style.transition = 'all 0.5s ease';
        instructions.style.backgroundColor = 'rgba(255, 245, 215, 0.9)';
        instructions.style.boxShadow = '0 0 15px rgba(184, 148, 70, 0.2)';
        
        setTimeout(() => {
            instructions.style.backgroundColor = 'rgba(255, 249, 230, 0.9)';
            instructions.style.boxShadow = 'none';
        }, 2000);
    }, 1000);
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
    toggleLanguageUIByScreenSize();
    
    // PC端数据显示控制
    if (window.innerWidth > 900) {
        counters.classList.add('show-all');
        dataToggleBtn.style.display = 'none';
    } else {
        counters.classList.remove('show-all');
        dataToggleBtn.style.display = 'inline-flex';
        document.getElementById('dataToggleText').textContent = translations[currentLanguage].dataToggleTextShow;
        dataToggleBtn.classList.remove('active');
    }
});

// 屏幕尺寸检查函数
function checkScreenSize() {
    if (window.innerWidth > 900) {
        counters.classList.add('show-all');
        dataToggleBtn.style.display = 'none';
    } else {
        counters.classList.remove('show-all');
        dataToggleBtn.style.display = 'inline-flex';
        document.getElementById('dataToggleText').textContent = translations[currentLanguage].dataToggleTextShow;
        dataToggleBtn.classList.remove('active');
    }
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