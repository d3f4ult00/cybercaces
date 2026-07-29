/* ============================================
   Cyber Attacks Encyclopedia - Main App
   Author: Eng. Hussein Ghalib
   ============================================ */

// ==================== AUTH SYSTEM ====================
const AUTH_KEY = 'cyber_auth_session';
const LOCKOUT_KEY = 'cyber_lockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000;

const CREDENTIALS = {
    admin: {
        username: btoa('General'),
        password: btoa('d3f4ult'),
        role: 'admin',
        name: 'المدير العام'
    },
    users: [
        { username: btoa('Ameen'), password: btoa('3102amkh7gh'), role: 'user', name: 'أمين' },
        { username: btoa('Hussein'), password: btoa('Hussein7890'), role: 'user', name: 'حسين' },
        { username: btoa('Ahmed'), password: btoa('78199aalsraje'), role: 'user', name: 'أحمد' }
    ]
};

function getLockoutStatus() {
    const lockout = sessionStorage.getItem(LOCKOUT_KEY);
    if (!lockout) return { locked: false, remaining: 0 };
    const data = JSON.parse(lockout);
    const now = Date.now();
    if (now < data.until) {
        return { locked: true, remaining: Math.ceil((data.until - now) / 1000) };
    }
    sessionStorage.removeItem(LOCKOUT_KEY);
    return { locked: false, remaining: 0 };
}

function setLockout() {
    sessionStorage.setItem(LOCKOUT_KEY, JSON.stringify({
        until: Date.now() + LOCKOUT_DURATION,
        attempts: MAX_ATTEMPTS
    }));
}

function getAttempts() {
    const attempts = sessionStorage.getItem('cyber_attempts');
    return attempts ? parseInt(attempts) : 0;
}

function incrementAttempts() {
    const current = getAttempts() + 1;
    sessionStorage.setItem('cyber_attempts', current);
    return current;
}

function resetAttempts() {
    sessionStorage.removeItem('cyber_attempts');
}

function authenticate(username, password) {
    const lockout = getLockoutStatus();
    if (lockout.locked) {
        return { success: false, error: 'الحساب مقفل. انتظر ' + lockout.remaining + ' ثانية.', locked: true };
    }

    const inputUser = btoa(username.trim());
    const inputPass = btoa(password.trim());

    if (inputUser === CREDENTIALS.admin.username && inputPass === CREDENTIALS.admin.password) {
        resetAttempts();
        return { success: true, user: CREDENTIALS.admin };
    }

    for (const user of CREDENTIALS.users) {
        if (inputUser === user.username && inputPass === user.password) {
            resetAttempts();
            return { success: true, user: user };
        }
    }

    const attempts = incrementAttempts();
    const remaining = MAX_ATTEMPTS - attempts;

    if (attempts >= MAX_ATTEMPTS) {
        setLockout();
        return { success: false, error: 'تم تجاوز الحد الأقصى للمحاولات. الحساب مقفل لمدة 5 دقائق.', locked: true };
    }

    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة. محاولات متبقية: ' + remaining, locked: false };
}

function createSession(user) {
    const session = {
        username: atob(user.username),
        role: user.role,
        name: user.name,
        loginTime: Date.now(),
        token: generateToken()
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
}

function generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token + Date.now();
}

function getSession() {
    const data = sessionStorage.getItem(AUTH_KEY);
    if (!data) return null;
    try { return JSON.parse(data); } catch (e) { return null; }
}

function isAuthenticated() { return getSession() !== null; }
function isAdmin() {
    const session = getSession();
    return session && session.role === 'admin';
}

function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ==================== PARTICLES ====================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 10 + 's';
        p.style.animationDuration = (8 + Math.random() * 10) + 's';
        container.appendChild(p);
    }
}

// ==================== TYPEWRITER ====================
function initTypewriter() {
    const subtitleText = "موسوعة تفاعلية للهجمات الإلكترونية الكبرى (2021 - 2026)";
    let twIndex = 0;
    const twElement = document.getElementById('typewriterSubtitle');
    if (!twElement) return;
    function typeWriter() {
        if (twIndex < subtitleText.length) {
            twElement.innerHTML = subtitleText.substring(0, twIndex + 1) + '<span class="cursor"></span>';
            twIndex++;
            setTimeout(typeWriter, 60);
        } else {
            twElement.innerHTML = subtitleText + '<span class="cursor"></span>';
        }
    }
    setTimeout(typeWriter, 800);
}

// ==================== MATRIX RAIN ====================
const matrixCanvas = document.getElementById('matrixCanvas');
let matrixInterval = null;
let matrixActive = false;

function resizeMatrix() {
    if (!matrixCanvas) return;
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
}

const matrixChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZالهجماتالسيبرانية";
let matrixDrops = [];

function initMatrix() {
    if (!matrixCanvas) return;
    const cols = Math.floor(matrixCanvas.width / 16);
    matrixDrops = [];
    for (let i = 0; i < cols; i++) matrixDrops[i] = 1;
}

function drawMatrix() {
    if (!matrixCanvas) return;
    const ctx = matrixCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(5, 5, 8, 0.05)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.fillStyle = '#00f0ff';
    ctx.font = '14px JetBrains Mono';
    for (let i = 0; i < matrixDrops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(char, i * 16, matrixDrops[i] * 16);
        if (matrixDrops[i] * 16 > matrixCanvas.height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
        }
        matrixDrops[i]++;
    }
}

// ==================== SIMULATIONS ====================
const simulationTemplates = {
    ransomware: [
        { text: "root@ops:~# ./recon_target.sh --org {TARGET}", type: "cmd", delay: 300 },
        { text: "[RECON] جمع المعلومات عن البنية التحتية...", type: "info", delay: 1000 },
        { text: "[CREDS] العثور على بيانات اعتماد مسروقة في Dark Web", type: "warning", delay: 2000 },
        { text: "[ACCESS] تسجيل الدخول إلى بوابة Citrix بدون MFA", type: "danger", delay: 3000 },
        { text: "[LATERAL] الانتقال عبر الشبكة الداخلية...", type: "warning", delay: 4500 },
        { text: "[PRIVESC] رفع الصلاحيات إلى Domain Admin", type: "danger", delay: 6000 },
        { text: "[ENCRYPT] بدء تشفير 100+ خادم ESXi...", type: "danger", delay: 8000 },
        { text: "[RANSOM] عرض رسالة الفدية: 22 مليون دولار", type: "danger", delay: 10000 },
        { text: "[EXFIL] سحب 6 تيرابايت من البيانات الحساسة", type: "warning", delay: 12000 },
        { text: "[ALERT] اكتشاف النشاط المشبوه!", type: "danger", delay: 14000 },
        { text: "[DEFENSE] عزل الأنظمة المتأثرة...", type: "info", delay: 15500 },
        { text: "[RECOVER] بدء استعادة النسخ الاحتياطية", type: "success", delay: 17000 },
        { text: "root@ops:~# █", type: "cmd", delay: 19000 }
    ],
    vulnerability: [
        { text: "root@ops:~# nmap -sV --script=vuln {TARGET}", type: "cmd", delay: 300 },
        { text: "[SCAN] فحص المنافذ والخدمات...", type: "info", delay: 1200 },
        { text: "[VULN] CVE-2023-34362 مكتشفة! (SQL Injection)", type: "danger", delay: 2500 },
        { text: "[EXPLOIT] إرسال حمولة SQL Injection...", type: "warning", delay: 4000 },
        { text: "[SHELL] تثبيت Web Shell خلفي (LEMURLOOT)", type: "danger", delay: 5500 },
        { text: "[ENUM] استعراض قواعد البيانات المتصلة...", type: "warning", delay: 7000 },
        { text: "[EXFIL] تحميل سجلات 93.3 مليون مستخدم", type: "danger", delay: 9000 },
        { text: "[IMPACT] 2,700+ منظمة متأثرة حول العالم", type: "danger", delay: 11000 },
        { text: "[PATCH] نشر التحديث الأمني...", type: "info", delay: 13000 },
        { text: "[AUDIT] مراجعة سجلات الوصول", type: "success", delay: 14500 },
        { text: "root@ops:~# █", type: "cmd", delay: 16000 }
    ],
    social: [
        { text: "root@ops:~# ./osint.sh --target {TARGET}", type: "cmd", delay: 300 },
        { text: "[OSINT] البحث في LinkedIn عن موظفين...", type: "info", delay: 1000 },
        { text: "[PROFILE] العثور على موظف مكتب المساعدة", type: "warning", delay: 2000 },
        { text: "[VISH] إجراء مكالمة هندسة اجتماعية (10 دقائق)", type: "danger", delay: 3500 },
        { text: "[PRETEXT] التنكر بشخصية موظف كبير...", type: "danger", delay: 5000 },
        { text: "[MFA] إعادة تعيين كلمة المرور وتعطيل MFA", type: "danger", delay: 7000 },
        { text: "[ACCESS] الوصول إلى 100+ خادم ESXi", type: "danger", delay: 9000 },
        { text: "[ENCRYPT] تشفير الأنظمة وتعطيل الكازينوهات", type: "danger", delay: 11000 },
        { text: "[EXFIL] سرقة 6TB من بيانات العملاء", type: "warning", delay: 13000 },
        { text: "[TRAINING] تدريب الموظفين على التعرف على Vishing", type: "success", delay: 15000 },
        { text: "root@ops:~# █", type: "cmd", delay: 16500 }
    ],
    supply: [
        { text: "root@ops:~# git clone https://github.com/target/repo.git", type: "cmd", delay: 300 },
        { text: "[RECON] دراسة مشروع XZ Utils مفتوح المصدر...", type: "info", delay: 1200 },
        { text: "[TRUST] 3 سنوات من المساهمة المشروعة...", type: "warning", delay: 3000 },
        { text: "[INJECT] إدخال باب خلفي في إصدار 5.6.0", type: "danger", delay: 5000 },
        { text: "[OBFUSC] إخفاء الكود الضار في اختبارات الترجمة", type: "danger", delay: 7000 },
        { text: "[DIST] نشر التحديث عبر مديري الحزم", type: "warning", delay: 9000 },
        { text: "[DETECT] اكتشاف بالصدفة من مهندس Microsoft!", type: "success", delay: 11000 },
        { text: "[IMPACT] ملايين الأنظمة كانت معرضة للخطر", type: "danger", delay: 13000 },
        { text: "[AUDIT] مراجعة شاملة للكود المفتوح المصدر", type: "info", delay: 14500 },
        { text: "root@ops:~# █", type: "cmd", delay: 16000 }
    ],
    other: [
        { text: "root@ops:~# ./init_recon.sh", type: "cmd", delay: 300 },
        { text: "[INFO] بدء مسح الشبكة المستهدفة...", type: "info", delay: 800 },
        { text: "[SCAN] اكتشاف منافذ مفتوحة", type: "warning", delay: 1200 },
        { text: "[EXPLOIT] جاري استغلال الثغرة...", type: "cmd", delay: 2400 },
        { text: "[SUCCESS] تم الحصول على وصول أولي", type: "success", delay: 3000 },
        { text: "[ROOT] صلاحيات المسؤول مفعلة", type: "success", delay: 3500 },
        { text: "[EXFIL] جاري سحب البيانات...", type: "warning", delay: 4200 },
        { text: "[ALERT] تم اكتشاف نشاط مشبوه!", type: "danger", delay: 5000 },
        { text: "[DEFENSE] تفعيل جدار الحماية...", type: "info", delay: 5500 },
        { text: "[BLOCK] تم حظر الاتصال المشبوه", type: "success", delay: 6200 },
        { text: "[REPORT] إنشاء تقرير الحادثة...", type: "info", delay: 7000 },
        { text: "root@ops:~# █", type: "cmd", delay: 8000 }
    ]
};

function generateSimulation(attack) {
    const template = simulationTemplates[attack.type] || simulationTemplates.other;
    return template.map(line => ({
        text: line.text.replace('{TARGET}', attack.target || attack.name),
        type: line.type,
        delay: line.delay
    }));
}

let currentSimulation = null;

function toggleSimulation(attackId) {
    if (matrixActive) { closeSimulation(); return; }
    const attacks = getAttacks();
    const attack = attacks.find(a => a.id === attackId);
    if (!attack) return;
    currentSimulation = attack;
    matrixActive = true;
    if (matrixCanvas) matrixCanvas.classList.add('active');
    initMatrix();
    matrixInterval = setInterval(drawMatrix, 50);
    const titleEl = document.getElementById('terminalTitle');
    if (titleEl) titleEl.textContent = '🖥️ محاكاة: ' + attack.name;
    setTimeout(() => { openTerminalSimulation(attack); }, 1500);
    showToast('🖥️ تم تشغيل محاكاة: ' + attack.name, 'success');
}

function closeSimulation() {
    matrixActive = false;
    if (matrixCanvas) matrixCanvas.classList.remove('active');
    clearInterval(matrixInterval);
    if (matrixCanvas) {
        const ctx = matrixCanvas.getContext('2d');
        ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
    const overlay = document.getElementById('terminalOverlay');
    if (overlay) overlay.classList.remove('active');
    currentSimulation = null;
    const progress = document.getElementById('simProgress');
    if (progress) progress.style.width = '0%';
}

function openTerminalSimulation(attack) {
    const overlay = document.getElementById('terminalOverlay');
    const body = document.getElementById('terminalBody');
    const progressBar = document.getElementById('simProgress');
    if (!overlay || !body) return;
    body.innerHTML = '';
    overlay.classList.add('active');
    const lines = generateSimulation(attack);
    const maxDelay = Math.max(...lines.map(l => l.delay));
    lines.forEach((line) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'terminal-line';
            div.style.animationDelay = '0s';
            let colorClass = 'term-cmd';
            if (line.type === 'success') colorClass = 'term-success';
            if (line.type === 'warning') colorClass = 'term-warning';
            if (line.type === 'danger') colorClass = 'term-danger';
            if (line.type === 'info') colorClass = 'term-info';
            div.innerHTML = '<span class="' + colorClass + '">' + escapeHtml(line.text) + '</span>';
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
            if (progressBar) {
                const progress = (line.delay / maxDelay) * 100;
                progressBar.style.width = progress + '%';
            }
        }, line.delay);
    });
}

// ==================== DATA & STORAGE ====================
const STORAGE_KEY = 'cyber_attacks_data';

const defaultData = [
    {
        id: '1',
        name: 'هجوم MOVEit Transfer',
        year: 2023,
        type: 'vulnerability',
        severity: 'critical',
        desc: 'استغلت مجموعة CL0P ثغرة Zero-day (CVE-2023-34362) في برنامج نقل الملفات MOVEit عبر SQL Injection لتثبيت Web Shell خلفي (LEMURLOOT) وسرقة البيانات.',
        details: 'التاريخ: مايو 2023\nالجهة المنفذة: CL0P Ransomware Gang\nالآلية: SQL Injection → Web Shell (LEMURLOOT) → سرقة البيانات من أنظمة التخزين السحابية\nالأثر: أكثر من 2,700 منظمة متأثرة و93.3 مليون شخص، من بينهم وزارة الطاقة الأمريكية، جامعة جونز هوبكنز، وشركة شل\nالدروس المستفادة: التحديث الفوري للبرمجيات عند اكتشاف الثغرات، خطورة سلاسل التوريد الرقمية، مراقبة أنظمة نقل البيانات بشكل مستمر',
        sources: ['https://novascotia.ca/privacy-breach/docs/cyber-security-attack-moveit-public-report.pdf', 'https://en.wikipedia.org/wiki/2023_MOVEit_data_breach'],
        target: '2,700+ منظمة عالمية',
        impact: '93.3 مليون شخص متأثر',
        image: '',
        group: 'CL0P Ransomware Gang',
        groupOrigin: 'روسيا',
        countermeasures: [
            'تحديث فوري للبرمجيات عند صدور تنبيهات الأمان',
            'تفعيل WAF (جدار حماية تطبيقات الويب) لمنع SQL Injection',
            'عزل أنظمة نقل البيانات عن الشبكة الداخلية',
            'مراقبة مستمرة لسجلات الوصول غير الطبيعية',
            'تشفير البيانات أثناء النقل والتخزين'
        ],
        attackPath: [
            { step: 1, icon: '🔍', label: 'الاستطلاع', desc: 'فحص إنترنتي لأنظمة MOVEit عامة' },
            { step: 2, icon: '💉', label: 'SQL Injection', desc: 'استغلال CVE-2023-34362' },
            { step: 3, icon: '🐚', label: 'Web Shell', desc: 'تثبيت LEMURLOOT خلفي' },
            { step: 4, icon: '🗂️', label: 'استعراض', desc: 'فحص قواعد البيانات المتصلة' },
            { step: 5, icon: '⬇️', label: 'التسريب', desc: 'تحميل 93.3M سجل' }
        ]
    },
    {
        id: '2',
        name: 'هجوم MGM Resorts',
        year: 2023,
        type: 'social',
        severity: 'critical',
        desc: 'مجموعة Scattered Spider (تابعة لـ ALPHV/BlackCat) نفذت هجوماً عبر مكالمة هندسة اجتماعية (Vishing) استمرت 10 دقائق فقط لتعطيل 29 فندقاً وكازينو.',
        details: 'التاريخ: 8 سبتمبر 2023\nالجهة المنفذة: Scattered Spider / ALPHV (BlackCat)\nالآلية: البحث عن موظفين على LinkedIn → مكالمة Vishing متنكرين بشخصية موظف كبير → إعادة تعيين كلمة المرور وتعطيل MFA → الوصول إلى 100+ خادم ESXi\nالأثر: تشفير أكثر من 100 خادم، سرقة 6 تيرابايت من البيانات، إيقاف ماكينات القمار وأنظمة المفاتيح الرقمية لمدة 10 أيام\nالدروس المستفادة: العنصر البشري هو أضعف حلقة، تدريب الموظفين على التعرف على هجمات الهندسة الاجتماعية، عدم الاعتماد على معلومات LinkedIn كوسيلة تحقق',
        sources: ['https://medium.com/@jean-baptiste.lapeyre/the-mgm-resorts-cyberattack-when-identity-becomes-the-weakest-link-65d0b1daba52', 'https://www.tracesecurity.com/blog/articles/lessons-learned-mgm-cyberattack/'],
        target: 'MGM Resorts - 29 فندق وكازينو',
        impact: '100 مليون دولار خسارة',
        image: '',
        group: 'Scattered Spider / ALPHV',
        groupOrigin: 'أمريكا / روسيا',
        countermeasures: [
            'تدريب دوري للموظفين على هجمات الهندسة الاجتماعية',
            'تفعيل MFA قوي (FIDO2) لا يمكن تخطيه',
            'التحقق من هوية المتصل عبر قنوات مستقلة',
            'تقييد صلاحيات مكتب المساعدة',
            'تجزئة الشبكة لعزل الأنظمة الحساسة'
        ],
        attackPath: [
            { step: 1, icon: '👤', label: 'OSINT', desc: 'جمع معلومات من LinkedIn' },
            { step: 2, icon: '📞', label: 'Vishing', desc: 'مكالمة هندسة اجتماعية' },
            { step: 3, icon: '🔓', label: 'MFA Bypass', desc: 'إعادة تعيين وتعطيل MFA' },
            { step: 4, icon: '💻', label: 'الوصول', desc: 'دخول إلى 100+ خادم' },
            { step: 5, icon: '🔐', label: 'التشفير', desc: 'تعطيل الكازينوهات' }
        ]
    },
    {
        id: '3',
        name: 'هجوم Change Healthcare',
        year: 2024,
        type: 'ransomware',
        severity: 'critical',
        desc: 'مجموعة ALPHV/BlackCat اخترقت أكبر شركة معالجة مطالبات الرعاية الصحية في أمريكا عبر بوابة Citrix بدون MFA، مما أثر على نصف المطالبات الصحية في البلاد.',
        details: 'التاريخ: 21 فبراير 2024\nالجهة المنفذة: ALPHV / BlackCat Ransomware\nالآلية: استخدام بيانات اعتماد مسروقة لحساب Citrix بدون MFA → 9 أيام داخل الشبكة دون اكتشاف → تشفير الأنظمة وسرقة 6 تيرابايت\nالأثر: تأثير على 15 مليار مطالبة صحية سنوياً، دفع فدية 22 مليون دولار، تهديد بقاء مستشفيات عديدة، تكلفة إجمالية 2.45 مليار دولار\nالدروس المستفادة: MFA إلزامية على جميع الحسابات، تحديث إجراءات الأمن بعد الاستحواذ على الشركات، التكلفة الحقيقية تتجاوز الفدية بكثير',
        sources: ['https://www.hhs.gov/hipaa/for-professionals/special-topics/change-healthcare-cybersecurity-incident-frequently-asked-questions/index.html', 'https://www.nixonpeabody.com/insights/alerts/2025/11/12/change-healthcare-cybersecurity-breach-impact-on-healthcare-providers', 'https://www.blackfog.com/change-healthcare-landmark-cybersecurity-breach/'],
        target: 'Change Healthcare - أمريكا',
        impact: '2.45 مليار دولار + 22M فدية',
        image: '',
        group: 'ALPHV / BlackCat',
        groupOrigin: 'روسيا',
        countermeasures: [
            'تفعيل MFA إلزامي على جميع الحسابات بدون استثناء',
            'مراقبة الـ Lateral Movement داخل الشبكة',
            'تجزئة الشبكة لعزل أنظمة الرعاية الصحية',
            'نسخ احتياطية offline/air-gapped',
            'اختبارات اختراق دورية'
        ],
        attackPath: [
            { step: 1, icon: '🔑', label: 'بيانات مسروقة', desc: 'شراء اعتمادات من Dark Web' },
            { step: 2, icon: '🚪', label: 'الدخول', desc: 'Citrix بدون MFA' },
            { step: 3, icon: '🔄', label: 'الانتقال', desc: '9 أيام داخل الشبكة' },
            { step: 4, icon: '🔐', label: 'التشفير', desc: 'تشفير الأنظمة الحيوية' },
            { step: 5, icon: '💰', label: 'الفدية', desc: 'طلب 22 مليون دولار' }
        ]
    },
    {
        id: '4',
        name: 'هجوم Snowflake',
        year: 2024,
        type: 'vulnerability',
        severity: 'critical',
        desc: 'مجموعة ShinyHunters استهدفت عملاء منصة Snowflake عبر بيانات اعتماد مسروقة من أجهزة موظفين، مستغلين غياب MFA في معظم الحسابات.',
        details: 'التاريخ: مايو 2024\nالجهة المنفذة: ShinyHunters / UNC5537\nالآلية: برامج Infostealer على أجهزة موظفين شركات متعاقدة (EPAM Systems) → سركة بيانات اعتماد → غياب MFA → الوصول إلى قواعد بيانات العملاء\nالأثر: 160+ منظمة متأثرة منها Ticketmaster (560M عميل)، Santander Bank (30M حساب)، AT&T (50B سجل مكالمات)، LendingTree، Neiman Marcus\nالدروس المستفادة: MFA إلزامية على جميع الحسابات بما فيها Demo، خطورة تخزين بيانات الاعتماد على أجهزة شخصية، مراقبة الوصول من خلال أطراف ثالثة',
        sources: ['https://en.wikipedia.org/wiki/Snowflake_data_breach', 'https://www.wired.com/story/epam-snowflake-ticketmaster-breach-shinyhunters/'],
        target: '160+ منظمة (Ticketmaster, AT&T, Santander)',
        impact: '560 مليون عميل متأثر',
        image: '',
        group: 'ShinyHunters / UNC5537',
        groupOrigin: 'مجهول',
        countermeasures: [
            'MFA إلزامي على جميع الحسابات حتى Demo',
            'منع تخزين بيانات الاعتماد على الأجهزة الشخصية',
            'مراقبة الوصول من أطراف ثالثة بشكل دقيق',
            'تقييد الوصول حسب IP وجهاز',
            'تدوير مفاتيح API بشكل دوري'
        ],
        attackPath: [
            { step: 1, icon: '🦠', label: 'Infostealer', desc: 'إصابة أجهزة EPAM' },
            { step: 2, icon: '🔑', label: 'سركة', desc: 'سركة بيانات الاعتماد' },
            { step: 3, icon: '🚪', label: 'دخول', desc: 'غياب MFA' },
            { step: 4, icon: '🗄️', label: 'قواعد', desc: 'الوصول لبيانات العملاء' },
            { step: 5, icon: '⬇️', label: 'تسريب', desc: '560M عميل' }
        ]
    },
    {
        id: '5',
        name: 'هجوم Salt Typhoon',
        year: 2024,
        type: 'other',
        severity: 'critical',
        desc: 'حملة تجسس سيبراني واسعة النطاق نفذتها مجموعة صينية (APT) استهدفت شركات اتصالات أمريكية واخترقت أنظمة التنصت القانوني (CALEA).',
        details: 'التاريخ: سبتمبر - ديسمبر 2024\nالجهة المنفذة: Salt Typhoon (مرتبطة بوزارة أمن الدولة الصينية)\nالآلية: اختراق شركات اتصالات (Verizon, AT&T, T-Mobile, Spectrum, Lumen) → الوصول إلى أنظمة CALEA للتنصت القانوني → جمع metadata لمكالمات ورسائل\nالأثر: بيانات وصفية لأكثر من مليون مستخدم، مكالمات مسؤولين حكوميين رفيعي المستوى (ترامب، JD Vance)، امتداد إلى 80 دولة و600+ منظمة، اختراق وزارة الخزانة الأمريكية\nالدروس المستفادة: خطورة الثغرات في البنية التحتية للاتصالات، أهمية تشفير الاتصالات end-to-end، مراجعة إجراءات الأمن في الأنظمة الحكومية',
        sources: ['https://en.wikipedia.org/wiki/Salt_Typhoon', 'https://www.alvarezandmarsal.com/insights/salt-typhoon-implications-and-strategies-address-heightened-security-risks'],
        target: 'Verizon, AT&T, T-Mobile, وزارة الخزانة الأمريكية',
        impact: '80 دولة + 600 منظمة + بيانات مليون مستخدم',
        image: '',
        group: 'Salt Typhoon (APT)',
        groupOrigin: 'الصين',
        countermeasures: [
            'تشفير الاتصالات end-to-end (E2EE)',
            'عزل أنظمة CALEA عن الإنترنت',
            'مراقبة نشاط المستخدمين المميزين',
            'تجديد بيانات الاعتماد بشكل دوري',
            'تدقيق أمني للبنية التحتية'
        ],
        attackPath: [
            { step: 1, icon: '🌐', label: 'استطلاع', desc: 'دراسة بنية الاتصالات' },
            { step: 2, icon: '💉', label: 'اختراق', desc: 'ثغرات في أجهزة Cisco' },
            { step: 3, icon: '👂', label: 'CALEA', desc: 'الوصول لأنظمة التنصت' },
            { step: 4, icon: '📊', label: 'جمع', desc: 'Metadata لمكالمات' },
            { step: 5, icon: '🌍', label: 'امتداد', desc: '80 دولة متأثرة' }
        ]
    },
    {
        id: '6',
        name: 'ثغرة XZ Utils Backdoor',
        year: 2024,
        type: 'supply',
        severity: 'critical',
        desc: 'باب خلفي متطور اكتُشف في أداة ضغط XZ Utils المستخدمة في معظم توزيعات Linux، تم إدخاله عبر مساهم استغرق 3 سنوات في بناء الثقة.',
        details: 'التاريخ: مارس 2024 (CVE-2024-3094)\nالجهة المنفذة: مجهول (اسم مستعار: Jia Tan / JiaT75)\nالآلية: 3 سنوات من المساهمة المفتوحة المصدر → إدخال باب خلفي في الإصدارات 5.6.0 و5.6.1 → استهداف أنظمة x86_64 Linux عبر SSH\nالأثر: لو لم يُكتشف بالصدفة، كان سيؤثر على ملايين الأنظمة حول العالم. يُعتبر أكبر هجوم على سلسلة التوريد منذ Log4j\nالدروس المستفادة: خطورة الهجمات على البرمجيات مفتوحة المصدر، أهمية مراجعة الكود في المشاريع الحساسة، صعوبة اكتشاف التهديدات المتقدمة المستمرة (APT)',
        sources: ['https://www.catonetworks.com/blog/xz-backdoor-rce-cve-2024-3094-is-the-biggest-supply-chain-attack-since-log4j/'],
        target: 'توزيعات Linux (Debian, Ubuntu, Fedora)',
        impact: 'ملايين الأنظمة المحتملة',
        image: '',
        group: 'Jia Tan (مجهول)',
        groupOrigin: 'مجهول (مشتبه فيه دولة)',
        countermeasures: [
            'مراجعة يدوية للكود في المشاريع الحساسة',
            'توقيع التعليمات البرمجية رقمياً',
            'مراقبة تغييرات المساهمين الجدد',
            'اختبارات سلوكية (Behavioral Testing)',
            'تنويع مصادر البرمجيات'
        ],
        attackPath: [
            { step: 1, icon: '🤝', label: 'بناء الثقة', desc: '3 سنوات مساهمة مشروعة' },
            { step: 2, icon: '🎭', label: 'الإدخال', desc: 'إضافة باب خلفي مخفي' },
            { step: 3, icon: '📦', label: 'النشر', desc: 'إصدار 5.6.0 و 5.6.1' },
            { step: 4, icon: '🔓', label: 'التفعيل', desc: 'استهداف SSH عبر x86_64' },
            { step: 5, icon: '✅', label: 'الاكتشاف', desc: 'اكتشاف بالصدفة!' }
        ]
    },
    {
        id: '7',
        name: 'انقطاع CrowdStrike',
        year: 2024,
        type: 'other',
        severity: 'high',
        desc: 'تحديث خاطئ لملف تعريف Falcon Endpoint Protection تسبب في تعطل 8.5 مليون جهاز Windows حول العالم (Blue Screen of Death).',
        details: 'التاريخ: 19 يوليو 2024\nالجهة المنفذة: خطأ تقني (غير هجومي)\nالآلية: تحديث Channel File 291 (C-00000291-*.sys) يحتوي على منطق برمجي خاطئ → تعطل أنظمة Windows kernel-level\nالأثر: 8.5 مليون جهاز متأثر، خسائر 5.4 مليار دولار، تعطل مطارات (Delta Airlines)، بنوك، مستشفيات، محطات بث تلفزيوني\nالدروس المستفادة: خطورة نقاط الفشل الواحدة في البنية التحتية، أهمية اختبار التحديثات قبل النشر الواسع، ضرورة خطط الاستجابة للطوارئ',
        sources: ['https://cloudsecurityalliance.org/blog/2025/07/03/what-we-can-learn-from-the-2024-crowdstrike-outage'],
        target: '8.5 مليون جهاز Windows عالمياً',
        impact: '5.4 مليار دولار خسارة',
        image: '',
        group: 'خطأ تقني',
        groupOrigin: 'غير applicable',
        countermeasures: [
            'اختبار التحديثات في بيئة staging أولا',
            'نشر تدريجي (Canary Deployment)',
            'وجود آلية rollback سريعة',
            'تنويع حلول الأمان لتجنب نقطة الفشل الواحدة',
            'خطط استجابة للطوارئ مجربة'
        ],
        attackPath: [
            { step: 1, icon: '📋', label: 'التحديث', desc: 'Channel File 291' },
            { step: 2, icon: '💥', label: 'الخطأ', desc: 'منطق برمجي خاطئ' },
            { step: 3, icon: '💻', label: 'التعطل', desc: 'BSOD على 8.5M جهاز' },
            { step: 4, icon: '✈️', label: 'الأثر', desc: 'تعطل مطارات وبنوك' },
            { step: 5, icon: '🔧', label: 'الإصلاح', desc: 'إصلاح يدوي مكلف' }
        ]
    }
];

function getAttacks() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return JSON.parse(JSON.stringify(defaultData));
    }
    try {
        const parsed = JSON.parse(data);
        parsed.forEach(a => {
            if (!a.attackPath) a.attackPath = [];
            if (!a.countermeasures) a.countermeasures = [];
            if (!a.group) a.group = 'مجهول';
            if (!a.groupOrigin) a.groupOrigin = 'مجهول';
        });
        return parsed;
    } catch (e) {
        return JSON.parse(JSON.stringify(defaultData));
    }
}

function saveAttacks(attacks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attacks));
    renderTimeline();
    updateStats();
    updateFilters();
    updateCharts();
}

let currentImageData = '';
let searchQuery = '';

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('❌ حجم الصورة كبير جداً (الحد الأقصى 2MB)', 'error');
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImageData = e.target.result;
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        const uploadArea = document.getElementById('uploadArea');
        const imageData = document.getElementById('attackImageData');
        if (preview) { preview.src = currentImageData; preview.classList.add('active'); }
        if (placeholder) placeholder.style.display = 'none';
        if (uploadArea) uploadArea.classList.add('has-image');
        if (imageData) imageData.value = currentImageData;
    };
    reader.readAsDataURL(file);
}

function resetImageUpload() {
    currentImageData = '';
    const attackImage = document.getElementById('attackImage');
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const uploadArea = document.getElementById('uploadArea');
    const imageData = document.getElementById('attackImageData');
    if (attackImage) attackImage.value = '';
    if (preview) { preview.src = ''; preview.classList.remove('active'); }
    if (placeholder) placeholder.style.display = 'block';
    if (uploadArea) uploadArea.classList.remove('has-image');
    if (imageData) imageData.value = '';
}

const typeLabels = {
    ransomware: 'برمجية فدية',
    supply: 'سلسلة توريد',
    vulnerability: 'ثغرة أمنية',
    social: 'هندسة اجتماعية',
    crypto: 'عملات رقمية',
    ddos: 'حجب خدمة',
    other: 'أخرى'
};

const severityLabels = {
    critical: 'حرج',
    high: 'عالي',
    medium: 'متوسط',
    low: 'منخفض'
};

const severityWidths = {
    critical: '95%',
    high: '75%',
    medium: '50%',
    low: '25%'
};

let currentFilter = 'all';

function getPlaceholderImage(name) {
    const encoded = encodeURIComponent(name.substring(0, 20));
    return 'https://placehold.co/600x180/0a0a0f/00f0ff?text=' + encoded + '&font=cairo';
}

function renderTimeline() {
    const attacks = getAttacks();
    const container = document.getElementById('timelineContent');
    if (!container) return;

    let filtered = attacks;
    if (currentFilter !== 'all') {
        if (!isNaN(currentFilter)) {
            filtered = attacks.filter(a => a.year == currentFilter);
        } else {
            filtered = attacks.filter(a => a.type === currentFilter);
        }
    }

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a =>
            (a.name && a.name.toLowerCase().includes(q)) ||
            (a.desc && a.desc.toLowerCase().includes(q)) ||
            (a.target && a.target.toLowerCase().includes(q)) ||
            (a.impact && a.impact.toLowerCase().includes(q)) ||
            (a.details && a.details.toLowerCase().includes(q)) ||
            (a.group && a.group.toLowerCase().includes(q))
        );
    }

    filtered.sort((a, b) => b.year - a.year);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>لا توجد نتائج</h3><p>جرب تغيير الفلتر أو البحث أو أضف هجمات جديدة</p></div>';
        return;
    }

    const isAdminUser = isAdmin();

    container.innerHTML = filtered.map(attack => {
        const imageSrc = attack.image ? attack.image : getPlaceholderImage(attack.name);
        const imageHtml = '<img src="' + escapeHtml(imageSrc) + '" class="attack-image" alt="' + escapeHtml(attack.name) + '" loading="lazy" onerror="this.src=\'' + getPlaceholderImage(attack.name) + '\'">';

        let actionButtons = '<button class="btn-small btn-view" onclick="viewAttack(\'' + escapeHtml(attack.id) + '\')">👁️ عرض</button>';
        actionButtons += '<button class="btn-small btn-simulate" onclick="toggleSimulation(\'' + escapeHtml(attack.id) + '\')">🖥️ محاكاة</button>';

        if (isAdminUser) {
            actionButtons += '<button class="btn-small btn-edit" onclick="editAttack(\'' + escapeHtml(attack.id) + '\')">✏️ تعديل</button>';
            actionButtons += '<button class="btn-small btn-delete" onclick="deleteAttack(\'' + escapeHtml(attack.id) + '\')">🗑️ حذف</button>';
        }

        return '<div class="timeline-item" data-year="' + attack.year + '" data-type="' + escapeHtml(attack.type) + '"><div class="timeline-dot"></div><div class="timeline-content">' + imageHtml + '<div class="timeline-body"><span class="year-badge">' + attack.year + '</span><h3 class="attack-title">' + escapeHtml(attack.name) + '</h3><span class="attack-type type-' + escapeHtml(attack.type) + '">' + (typeLabels[attack.type] || attack.type) + '</span><p class="attack-desc">' + escapeHtml(attack.desc) + '</p><div class="attack-meta">' + (attack.impact ? '<span class="meta-tag">⚡ ' + escapeHtml(attack.impact) + '</span>' : '') + (attack.target ? '<span class="meta-tag">🎯 ' + escapeHtml(attack.target) + '</span>' : '') + '<span class="meta-tag">⚠️ ' + (severityLabels[attack.severity] || attack.severity) + '</span></div></div><div class="attack-actions">' + actionButtons + '</div><div class="severity-bar"><div class="severity-fill severity-' + escapeHtml(attack.severity) + '" style="width: 0%" data-width="' + (severityWidths[attack.severity] || '50%') + '"></div></div></div></div>';
    }).join('');

    setTimeout(() => {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('visible');
                const bar = item.querySelector('.severity-fill');
                if (bar) bar.style.width = bar.getAttribute('data-width');
            }, i * 100);
        });
    }, 50);
}

function handleSearch() {
    const input = document.getElementById('searchInput');
    searchQuery = input ? input.value : '';
    renderTimeline();
}

function updateCharts() {
    const attacks = getAttacks();

    const yearCounts = {};
    attacks.forEach(a => { yearCounts[a.year] = (yearCounts[a.year] || 0) + 1; });
    const years = Object.keys(yearCounts).sort();
    const maxYearCount = Math.max(...Object.values(yearCounts), 1);

    const yearChart = document.getElementById('yearChart');
    if (yearChart) {
        yearChart.innerHTML = years.map(year => {
            const height = (yearCounts[year] / maxYearCount * 100);
            return '<div class="css-chart-bar" style="height: ' + height + '%"><span class="css-chart-value">' + yearCounts[year] + '</span><span class="css-chart-label">' + year + '</span></div>';
        }).join('');
    }

    const typeCounts = {};
    attacks.forEach(a => {
        const label = typeLabels[a.type] || a.type;
        typeCounts[label] = (typeCounts[label] || 0) + 1;
    });
    const typeColors = ['#ff006e', '#8338ec', '#ffaa00', '#00ff88', '#00f0ff', '#ff6464', '#aaa'];

    const typeChart = document.getElementById('typeChart');
    if (typeChart) {
        typeChart.innerHTML = Object.entries(typeCounts).map(([label, count], i) => {
            return '<div class="pie-item"><div class="pie-color" style="background: ' + typeColors[i % typeColors.length] + '"></div><span class="pie-label">' + label + '</span><span class="pie-value">(' + count + ')</span></div>';
        }).join('');
    }

    const sevCounts = { 'حرج': 0, 'عالي': 0, 'متوسط': 0, 'منخفض': 0 };
    attacks.forEach(a => {
        const label = severityLabels[a.severity] || a.severity;
        if (sevCounts[label] !== undefined) sevCounts[label]++;
    });
    const sevColors = { 'حرج': '#ff3333', 'عالي': '#ffaa00', 'متوسط': '#00f0ff', 'منخفض': '#00ff88' };

    const severityChart = document.getElementById('severityChart');
    if (severityChart) {
        severityChart.innerHTML = Object.entries(sevCounts).filter(([_, count]) => count > 0).map(([label, count]) => {
            return '<div class="pie-item"><div class="pie-color" style="background: ' + sevColors[label] + '"></div><span class="pie-label">' + label + '</span><span class="pie-value">(' + count + ')</span></div>';
        }).join('');
    }
}

function updateStats() {
    const attacks = getAttacks();
    animateValue('totalAttacks', parseInt(document.getElementById('totalAttacks').textContent) || 0, attacks.length, 1000);
    const years = [...new Set(attacks.map(a => a.year))];
    animateValue('totalYears', parseInt(document.getElementById('totalYears').textContent) || 0, years.length, 1000);
    const types = [...new Set(attacks.map(a => a.type))];
    animateValue('totalTypes', parseInt(document.getElementById('totalTypes').textContent) || 0, types.length, 1000);
}

function animateValue(id, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    const obj = document.getElementById(id);
    if (!obj) return;
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        obj.textContent = current;
        if (current === end) clearInterval(timer);
    }, stepTime > 0 ? stepTime : 10);
}

function updateFilters() {
    const attacks = getAttacks();
    const years = [...new Set(attacks.map(a => a.year))].sort((a, b) => b - a);
    const types = [...new Set(attacks.map(a => a.type))];
    const filterContainer = document.getElementById('filters');
    if (!filterContainer) return;

    let html = '<button class="filter-btn ' + (currentFilter === 'all' ? 'active' : '') + '" onclick="filterAttacks(\'all\')">الكل</button>';
    years.forEach(year => {
        html += '<button class="filter-btn ' + (currentFilter == year ? 'active' : '') + '" onclick="filterAttacks(\'' + year + '\')">' + year + '</button>';
    });
    types.forEach(type => {
        if (typeLabels[type]) {
            html += '<button class="filter-btn ' + (currentFilter === type ? 'active' : '') + '" onclick="filterAttacks(\'' + type + '\')">' + typeLabels[type] + '</button>';
        }
    });
    filterContainer.innerHTML = html;
}

function filterAttacks(filter) {
    currentFilter = filter;
    renderTimeline();
    updateFilters();
}

let editingId = null;

function openForm() {
    if (!isAuthenticated()) {
        showToast('❌ يجب تسجيل الدخول أولاً', 'error');
        return;
    }
    editingId = null;
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'إضافة هجوم جديد';
    const form = document.getElementById('attackForm');
    if (form) form.reset();
    const attackId = document.getElementById('attackId');
    if (attackId) attackId.value = '';
    resetImageUpload();
    const modal = document.getElementById('formModal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeForm(event) {
    if (!event || event.target.id === 'formModal' || (event.target.closest && !event.target.closest('.modal-content'))) {
        const modal = document.getElementById('formModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        editingId = null;
    }
}

function editAttack(id) {
    if (!isAdmin()) {
        showToast('❌ لا تملك صلاحية التعديل', 'error');
        return;
    }
    const attacks = getAttacks();
    const attack = attacks.find(a => a.id === id);
    if (!attack) return;
    editingId = id;
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'تعديل الهجوم';

    const fields = {
        'attackId': attack.id,
        'attackName': attack.name,
        'attackYear': attack.year,
        'attackType': attack.type,
        'attackSeverity': attack.severity,
        'attackDesc': attack.desc,
        'attackDetails': attack.details || '',
        'attackSources': attack.sources ? attack.sources.join('\n') : '',
        'attackTarget': attack.target || '',
        'attackImpact': attack.impact || '',
        'attackGroup': attack.group || '',
        'attackGroupOrigin': attack.groupOrigin || '',
        'attackCountermeasures': attack.countermeasures ? attack.countermeasures.join('\n') : ''
    };

    for (const [fieldId, value] of Object.entries(fields)) {
        const el = document.getElementById(fieldId);
        if (el) el.value = value;
    }

    if (attack.image) {
        currentImageData = attack.image;
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        const uploadArea = document.getElementById('uploadArea');
        const imageData = document.getElementById('attackImageData');
        if (preview) { preview.src = attack.image; preview.classList.add('active'); }
        if (placeholder) placeholder.style.display = 'none';
        if (uploadArea) uploadArea.classList.add('has-image');
        if (imageData) imageData.value = attack.image;
    } else {
        resetImageUpload();
    }
    const modal = document.getElementById('formModal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function saveAttack(event) {
    event.preventDefault();
    if (!isAuthenticated()) {
        showToast('❌ يجب تسجيل الدخول', 'error');
        return;
    }

    const attacks = getAttacks();
    const newAttack = {
        id: editingId || Date.now().toString(),
        name: document.getElementById('attackName').value.trim(),
        year: parseInt(document.getElementById('attackYear').value),
        type: document.getElementById('attackType').value,
        severity: document.getElementById('attackSeverity').value,
        desc: document.getElementById('attackDesc').value.trim(),
        details: document.getElementById('attackDetails').value.trim(),
        sources: document.getElementById('attackSources').value.trim().split('\n').filter(s => s.trim()),
        target: document.getElementById('attackTarget').value.trim(),
        impact: document.getElementById('attackImpact').value.trim(),
        image: document.getElementById('attackImageData').value || '',
        group: document.getElementById('attackGroup').value.trim() || 'مجهول',
        groupOrigin: document.getElementById('attackGroupOrigin').value.trim() || 'مجهول',
        countermeasures: document.getElementById('attackCountermeasures').value.trim().split('\n').filter(s => s.trim()),
        attackPath: []
    };

    if (editingId) {
        const index = attacks.findIndex(a => a.id === editingId);
        if (index !== -1) {
            newAttack.attackPath = attacks[index].attackPath || [];
            attacks[index] = newAttack;
        }
        showToast('✅ تم تعديل الهجوم بنجاح', 'success');
    } else {
        attacks.push(newAttack);
        showToast('✅ تم إضافة الهجوم بنجاح', 'success');
    }
    saveAttacks(attacks);
    closeForm();
}

function deleteAttack(id) {
    if (!isAdmin()) {
        showToast('❌ لا تملك صلاحية الحذف', 'error');
        return;
    }
    if (!confirm('هل أنت متأكد من حذف هذا الهجوم؟')) return;
    const attacks = getAttacks().filter(a => a.id !== id);
    saveAttacks(attacks);
    showToast('🗑️ تم حذف الهجوم', 'success');
}

function clearAllData() {
    if (!isAdmin()) {
        showToast('❌ لا تملك صلاحية مسح البيانات', 'error');
        return;
    }
    if (!confirm('⚠️ هل أنت متأكد من مسح ALL البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
    if (!confirm('تأكيد نهائي: سيتم حذف جميع الهجمات المسجلة.')) return;
    localStorage.removeItem(STORAGE_KEY);
    saveAttacks([]);
    showToast('🗑️ تم مسح جميع البيانات', 'success');
}

function viewAttack(id) {
    const attacks = getAttacks();
    const attack = attacks.find(a => a.id === id);
    if (!attack) return;

    window.location.hash = 'attack-' + id;

    const detailTitle = document.getElementById('detailTitle');
    if (detailTitle) detailTitle.textContent = attack.name;

    const imageSrc = attack.image ? attack.image : getPlaceholderImage(attack.name);
    const imageHtml = '<img src="' + escapeHtml(imageSrc) + '" class="detail-header-image" alt="' + escapeHtml(attack.name) + '" onerror="this.src=\'' + getPlaceholderImage(attack.name) + '\'">';

    let aptHtml = '';
    if (attack.group && attack.group !== 'مجهول') {
        const groupColor = attack.groupOrigin === 'الصين' ? '🇨🇳' :
                          attack.groupOrigin === 'روسيا' ? '🇷🇺' :
                          attack.groupOrigin === 'أمريكا' ? '🇺🇸' :
                          attack.groupOrigin === 'مجهول' ? '❓' : '🌍';
        aptHtml = '<div class="apt-profile"><div class="apt-avatar">' + groupColor + '</div><div class="apt-info"><div class="apt-name">' + escapeHtml(attack.group) + '</div><div class="apt-meta"><span class="apt-tag">📍 ' + escapeHtml(attack.groupOrigin) + '</span><span class="apt-tag">🎯 ' + (typeLabels[attack.type] || attack.type) + '</span></div><div class="apt-desc">مجموعة منفذة مسؤولة عن هذا الهجوم. يُعتقد أنها تستخدم تقنيات متقدمة ومستمرة (APT) لتحقيق أهدافها الاستخباراتية أو المالية.</div></div></div>';
    }

    let pathHtml = '';
    if (attack.attackPath && attack.attackPath.length > 0) {
        pathHtml = '<div class="attack-path-container"><div class="attack-path-title">🧩 مسار الهجوم (Attack Path)</div><div class="attack-path">' + attack.attackPath.map(p => '<div class="path-step" data-step="' + p.step + '"><span class="path-step-icon">' + p.icon + '</span><div class="path-step-label">' + escapeHtml(p.label) + '</div><div class="path-step-desc">' + escapeHtml(p.desc) + '</div></div>').join('') + '</div></div>';
    }

    let counterHtml = '';
    if (attack.countermeasures && attack.countermeasures.length > 0) {
        counterHtml = '<div class="countermeasures-container"><div class="countermeasures-title">🛡️ الإجراءات الوقائية (Countermeasures)</div>' + attack.countermeasures.map(c => '<div class="countermeasure-item"><span class="countermeasure-check">✓</span><span class="countermeasure-text">' + escapeHtml(c) + '</span></div>').join('') + '</div>';
    }

    let sourcesHtml = '';
    if (attack.sources && attack.sources.length > 0) {
        sourcesHtml = '<div class="detail-section"><span class="detail-label">🔗 المصادر</span><div class="sources-box">' + attack.sources.map(s => {
            const display = s.length > 60 ? s.substring(0, 60) + '...' : s;
            return '<a href="' + escapeHtml(s) + '" target="_blank" rel="noopener noreferrer">🔗 ' + escapeHtml(display) + '</a>';
        }).join('') + '</div></div>';
    }

    const shareBtn = '<button class="share-btn" onclick="copyAttackLink(\'' + escapeHtml(attack.id) + '\')">🔗 نسخ الرابط</button>';

    let detailActions = shareBtn + '<button class="btn-small btn-simulate" onclick="closeDetail(); toggleSimulation(\'' + escapeHtml(attack.id) + '\')">🖥️ محاكاة الهجوم</button>';
    if (isAdmin()) {
        detailActions += '<button class="btn-small btn-edit" onclick="closeDetail(); editAttack(\'' + escapeHtml(attack.id) + '\')">✏️ تعديل</button>';
        detailActions += '<button class="btn-small btn-delete" onclick="closeDetail(); deleteAttack(\'' + escapeHtml(attack.id) + '\')">🗑️ حذف</button>';
    }

    const detailBody = document.getElementById('detailBody');
    if (detailBody) {
        detailBody.innerHTML = imageHtml + aptHtml + '<div class="detail-section"><span class="detail-label">📅 السنة</span><p class="detail-text">' + attack.year + '</p></div><div class="detail-section"><span class="detail-label">🏷️ النوع</span><span class="attack-type type-' + escapeHtml(attack.type) + '">' + (typeLabels[attack.type] || attack.type) + '</span></div><div class="detail-section"><span class="detail-label">⚠️ الخطورة</span><span class="attack-type type-' + (attack.severity === 'critical' ? 'ransomware' : attack.severity === 'high' ? 'vulnerability' : attack.severity === 'medium' ? 'crypto' : 'social') + '">' + (severityLabels[attack.severity] || attack.severity) + '</span></div>' + pathHtml + '<div class="detail-section"><span class="detail-label">📝 الوصف</span><p class="detail-text">' + escapeHtml(attack.desc) + '</p></div>' + (attack.target ? '<div class="detail-section"><span class="detail-label">🏢 الجهة المتأثرة</span><p class="detail-text">' + escapeHtml(attack.target) + '</p></div>' : '') + (attack.impact ? '<div class="detail-section"><span class="detail-label">💰 التأثير / الخسائر</span><p class="detail-text">' + escapeHtml(attack.impact) + '</p></div>' : '') + (attack.details ? '<div class="detail-section"><span class="detail-label">📊 التفاصيل الكاملة</span><p class="detail-text" style="white-space: pre-line;">' + escapeHtml(attack.details) + '</p></div>' : '') + counterHtml + sourcesHtml + '<div class="attack-actions" style="margin-top: 2rem; padding: 1rem 0; border-top: 1px solid var(--border);">' + detailActions + '</div>';
    }
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function copyAttackLink(id) {
    const url = window.location.origin + window.location.pathname + '#attack-' + id;
    navigator.clipboard.writeText(url).then(() => {
        const tooltip = document.getElementById('copyTooltip');
        if (tooltip) {
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), 2000);
        }
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        const tooltip = document.getElementById('copyTooltip');
        if (tooltip) {
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), 2000);
        }
    });
}

function closeDetail(event) {
    if (!event || event.target.id === 'detailModal') {
        const modal = document.getElementById('detailModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        if (window.location.hash.startsWith('#attack-')) {
            history.pushState('', document.title, window.location.pathname + window.location.search);
        }
    }
}

function exportData() {
    if (!isAdmin()) {
        showToast('❌ لا تملك صلاحية التصدير', 'error');
        return;
    }
    const attacks = getAttacks();
    const dataStr = JSON.stringify(attacks, null, 2);
    const blob = new Blob(["\uFEFF" + dataStr], { type: 'application/json; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyber_attacks_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 تم تصدير JSON بنجاح', 'success');
}

function exportTextReport() {
    if (!isAdmin()) {
        showToast('❌ لا تملك صلاحية التصدير', 'error');
        return;
    }
    const attacks = getAttacks();
    if (attacks.length === 0) {
        showToast('❌ لا توجد هجمات للتصدير', 'error');
        return;
    }

    const sorted = [...attacks].sort((a, b) => b.year - a.year);
    const lines = [];
    lines.push('╔══════════════════════════════════════════════════════════════════╗');
    lines.push('║         تقرير الهجمات السيبرانية - Cyber Attacks Report          ║');
    lines.push('╠══════════════════════════════════════════════════════════════════╣');
    lines.push('║  إعداد: Eng. Hussein Ghalib                                      ║');
    lines.push('║  التاريخ: ' + new Date().toLocaleDateString('ar-SA') + '                                      ║');
    lines.push('║  عدد الهجمات: ' + String(sorted.length).padEnd(47, ' ') + '║');
    lines.push('╚══════════════════════════════════════════════════════════════════╝');
    lines.push('');

    sorted.forEach((attack, index) => {
        const num = index + 1;
        lines.push('');
        lines.push('▓'.repeat(68));
        lines.push('▓  الهجوم #' + String(num).padStart(2, '0') + '  ' + ''.padEnd(54, ' ') + '▓');
        lines.push('▓'.repeat(68));
        lines.push('');
        lines.push('📛  اسم الهجوم: ' + attack.name);
        lines.push('📅  السنة: ' + attack.year);
        lines.push('🏷️  النوع: ' + (typeLabels[attack.type] || attack.type));
        lines.push('⚠️  مستوى الخطورة: ' + (severityLabels[attack.severity] || attack.severity));
        lines.push('👤  المنفذ: ' + (attack.group || 'مجهول'));
        lines.push('🌍  الأصل: ' + (attack.groupOrigin || 'مجهول'));
        lines.push('🎯  الجهة المتأثرة: ' + (attack.target || 'غير محدد'));
        lines.push('💰  الخسائر / التأثير: ' + (attack.impact || 'غير محدد'));
        lines.push('');
        lines.push('─'.repeat(68));
        lines.push('📝  الوصف المختصر:');
        lines.push('─'.repeat(68));
        lines.push(attack.desc);
        lines.push('');

        if (attack.attackPath && attack.attackPath.length > 0) {
            lines.push('─'.repeat(68));
            lines.push('🧩  مسار الهجوم:');
            lines.push('─'.repeat(68));
            attack.attackPath.forEach(p => {
                lines.push('  [' + p.step + '] ' + p.icon + ' ' + p.label + ' - ' + p.desc);
            });
            lines.push('');
        }

        if (attack.details && attack.details.trim()) {
            lines.push('─'.repeat(68));
            lines.push('📊  التفاصيل الكاملة:');
            lines.push('─'.repeat(68));
            lines.push(attack.details);
            lines.push('');
        }

        if (attack.countermeasures && attack.countermeasures.length > 0) {
            lines.push('─'.repeat(68));
            lines.push('🛡️  الإجراءات الوقائية:');
            lines.push('─'.repeat(68));
            attack.countermeasures.forEach((c, i) => {
                lines.push('  [' + (i + 1) + '] ✓ ' + c);
            });
            lines.push('');
        }

        if (attack.sources && attack.sources.length > 0) {
            lines.push('─'.repeat(68));
            lines.push('🔗  المصادر والمراجع:');
            lines.push('─'.repeat(68));
            attack.sources.forEach((src, i) => {
                lines.push('  [' + (i + 1) + '] ' + src);
            });
            lines.push('');
        }

        lines.push('═'.repeat(68));
    });

    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════════╗');
    lines.push('║                    نهاية التقرير                                 ║');
    lines.push('║         Eng. Hussein Ghalib - جميع الحقوق محفوظة © 2026         ║');
    lines.push('╚══════════════════════════════════════════════════════════════════╝');

    const textContent = lines.join('\n');
    const blob = new Blob([textContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'تقرير_الهجمات_السيبرانية_' + new Date().toISOString().split('T')[0] + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📄 تم تصدير التقرير النصي بنجاح', 'success');
}

function importData(input) {
    if (!isAdmin()) {
        showToast('❌ لا تملك صلاحية الاستيراد', 'error');
        return;
    }
    const file = input.files[0];
    if (!file) return;
    input.value = '';

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let text = e.target.result;
            if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);
            text = text.trimStart();

            let data;
            try { data = JSON.parse(text); }
            catch (parseErr) {
                showToast('❌ ملف JSON تالف: ' + parseErr.message, 'error');
                return;
            }

            if (!Array.isArray(data)) {
                showToast('❌ الملف يجب أن يحتوي على مصفوفة []', 'error');
                return;
            }

            const validItems = [];
            data.forEach((item) => {
                if (item && typeof item === 'object' &&
                    item.id !== undefined && item.id !== null && item.id !== '' &&
                    item.name && item.year !== undefined && item.type && item.severity) {
                    if (!item.attackPath) item.attackPath = [];
                    if (!item.countermeasures) item.countermeasures = [];
                    if (!item.group) item.group = 'مجهول';
                    if (!item.groupOrigin) item.groupOrigin = 'مجهول';
                    validItems.push(item);
                }
            });

            if (validItems.length === 0) {
                showToast('❌ لا توجد بيانات صالحة في الملف', 'error');
                return;
            }

            const current = getAttacks();
            const existingIds = new Set(current.map(a => a.id));
            const newItems = validItems.filter(a => !existingIds.has(a.id));
            const duplicateItems = validItems.filter(a => existingIds.has(a.id));

            let msg = '📁 ملف يحتوي على ' + validItems.length + ' هجوم صالح\n';
            msg += '\n🆕 جديد: ' + newItems.length + ' هجوم\n';
            msg += '🔄 موجود مسبقاً: ' + duplicateItems.length + ' هجوم\n\n';
            msg += 'اختر طريقة الاستيراد:';

            const choice = prompt(msg + '\n\n1 = دمج (استيراد الجديد فقط)\n2 = استبدال (حذف الكل واستيراد الجديد)\n3 = تحديث (تحديث الموجود + إضافة الجديد)\n\nاكتب 1 أو 2 أو 3:');

            if (!choice) { showToast('❌ تم إلغاء الاستيراد', 'error'); return; }

            if (choice === '2') {
                if (confirm('⚠️ سيتم حذف جميع الهجمات الحالية واستبدالها. متأكد؟')) {
                    saveAttacks(validItems);
                    showToast('✅ تم استبدال جميع البيانات بـ ' + validItems.length + ' هجوم', 'success');
                }
            } else if (choice === '3') {
                const merged = [...current];
                let updatedCount = 0;
                let addedCount = 0;
                validItems.forEach(item => {
                    const idx = merged.findIndex(a => a.id === item.id);
                    if (idx !== -1) { merged[idx] = item; updatedCount++; }
                    else { merged.push(item); addedCount++; }
                });
                saveAttacks(merged);
                showToast('✅ تم تحديث ' + updatedCount + ' وإضافة ' + addedCount + ' هجوم', 'success');
            } else {
                const merged = [...current, ...newItems];
                saveAttacks(merged);
                showToast('✅ تم استيراد ' + newItems.length + ' هجوم جديد', 'success');
            }
        } catch (err) {
            showToast('❌ خطأ غير متوقع: ' + err.message, 'error');
        }
    };
    reader.onerror = function() { showToast('❌ فشل في قراءة الملف', 'error'); };
    reader.readAsText(file);
}

function printReport() {
    window.print();
}

function togglePresentation() {
    document.body.classList.toggle('presentation-mode');
    if (document.body.classList.contains('presentation-mode')) {
        showToast('📽️ تم تفعيل وضع العرض التقديمي', 'success');
    } else {
        showToast('✕ تم إيقاف وضع العرض', 'success');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast toast-' + type;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function updateUserBadge() {
    const session = getSession();
    const badge = document.getElementById('userBadge');
    if (!badge || !session) return;

    const isAdminUser = session.role === 'admin';
    badge.className = 'user-badge' + (isAdminUser ? ' admin' : '');
    badge.innerHTML = (isAdminUser ? '👑 ' : '👤 ') + session.name +
        ' <span style="opacity:0.7;font-size:0.8rem;">(' + (isAdminUser ? 'مدير' : 'مستخدم') + ')</span>' +
        ' <button class="logout-btn" onclick="logout()">🚪 خروج</button>';
}

function setupControlPanel() {
    const panel = document.getElementById('controlPanel');
    if (!panel) return;

    const isAdminUser = isAdmin();

    let html = '';

    // All users can add
    html += '<button class="btn btn-primary" onclick="openForm()"><span>➕</span> إضافة هجوم جديد</button>';

    // Admin only buttons
    if (isAdminUser) {
        html += '<button class="btn btn-success" onclick="exportData()"><span>💾</span> تصدير JSON</button>';
        html += '<button class="btn btn-info" onclick="exportTextReport()"><span>📄</span> تصدير تقرير نصي</button>';
        html += '<button class="btn btn-warning" onclick="document.getElementById(\'importFile\').click()"><span>📁</span> استيراد JSON</button>';
        html += '<button class="btn btn-danger" onclick="clearAllData()"><span>🗑️</span> مسح الكل</button>';
    }

    // All users can print and presentation
    html += '<button class="btn btn-secondary" onclick="printReport()"><span>🖨️</span> طباعة / PDF</button>';
    html += '<button class="btn btn-accent" onclick="togglePresentation()"><span>📽️</span> وضع العرض</button>';

    // Hidden file input for import
    html += '<input type="file" id="importFile" accept=".json" style="display:none" onchange="importData(this)">';

    panel.innerHTML = html;
}

// ==================== EVENT LISTENERS ====================
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTop');
    if (btn) {
        if (window.scrollY > 500) btn.classList.add('visible');
        else btn.classList.remove('visible');
    }
});

window.addEventListener('resize', resizeMatrix);

function checkHashAndOpen() {
    const hash = window.location.hash;
    if (hash.startsWith('#attack-')) {
        const id = hash.replace('#attack-', '');
        const attacks = getAttacks();
        if (attacks.find(a => a.id === id)) {
            setTimeout(() => viewAttack(id), 500);
        }
    }
}

window.addEventListener('hashchange', () => {
    if (!window.location.hash) { closeDetail(); }
    else if (window.location.hash.startsWith('#attack-')) {
        const id = window.location.hash.replace('#attack-', '');
        viewAttack(id);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeForm();
        closeDetail();
        if (matrixActive) closeSimulation();
    }
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openForm();
    }
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
});

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    createParticles();
    initTypewriter();
    resizeMatrix();
    updateUserBadge();
    setupControlPanel();
    renderTimeline();
    updateStats();
    updateFilters();
    updateCharts();
    checkHashAndOpen();
});
