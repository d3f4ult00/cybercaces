/* ============================================
   Cyber Attacks - Login System
   Author: Eng. Hussein Ghalib
   ============================================ */

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

function isAuthenticated() {
    return getSession() !== null;
}

// Check if already logged in
if (isAuthenticated()) {
    window.location.href = 'index.html';
}

// Particles
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

// Password toggle
function togglePassword() {
    const input = document.getElementById('password');
    const btn = document.getElementById('togglePass');
    if (!input || !btn) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

// Update attempts display
function updateAttemptsDisplay() {
    const counter = document.getElementById('attemptsCounter');
    if (!counter) return;
    const attempts = getAttempts();
    const lockout = getLockoutStatus();

    if (lockout.locked) {
        counter.textContent = '⏱️ الحساب مقفل. انتظر ' + lockout.remaining + ' ثانية';
        counter.className = 'attempts-counter danger';
        return;
    }

    const remaining = MAX_ATTEMPTS - attempts;
    if (remaining <= 2) {
        counter.textContent = '⚠️ محاولات متبقية: ' + remaining;
        counter.className = 'attempts-counter warning';
    } else {
        counter.textContent = 'محاولات متبقية: ' + remaining;
        counter.className = 'attempts-counter';
    }
}

// Login handler
function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    const lockoutDiv = document.getElementById('lockoutMessage');

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Check lockout first
    const lockout = getLockoutStatus();
    if (lockout.locked) {
        if (lockoutDiv) {
            lockoutDiv.textContent = '⏱️ الحساب مقفل. انتظر ' + lockout.remaining + ' ثانية قبل المحاولة مرة أخرى.';
            lockoutDiv.classList.add('show');
        }
        updateAttemptsDisplay();
        return;
    }

    if (lockoutDiv) lockoutDiv.classList.remove('show');

    if (!username || !password) {
        if (errorDiv) {
            errorDiv.textContent = '❌ الرجاء إدخال اسم المستخدم وكلمة المرور';
            errorDiv.classList.add('show');
        }
        return;
    }

    // Show loading
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = 'جاري التحقق... <span class="spinner"></span>';
    }

    // Simulate network delay for security
    setTimeout(() => {
        const result = authenticate(username, password);

        if (result.success) {
            createSession(result.user);
            if (errorDiv) errorDiv.classList.remove('show');
            if (loginBtn) {
                loginBtn.innerHTML = '✅ تم التسجيل بنجاح!';
                loginBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
            }
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        } else {
            if (errorDiv) {
                errorDiv.textContent = '❌ ' + result.error;
                errorDiv.classList.add('show');
            }
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '🔐 تسجيل الدخول';
            }
            updateAttemptsDisplay();

            if (result.locked && lockoutDiv) {
                lockoutDiv.textContent = '⏱️ تم قفل الحساب لمدة 5 دقائق بسبب المحاولات الفاشلة المتكررة.';
                lockoutDiv.classList.add('show');
            }
        }
    }, 600);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    updateAttemptsDisplay();

    const form = document.getElementById('loginForm');
    if (form) form.addEventListener('submit', handleLogin);

    // Check lockout periodically
    setInterval(() => {
        const lockout = getLockoutStatus();
        if (!lockout.locked) {
            const lockoutDiv = document.getElementById('lockoutMessage');
            if (lockoutDiv) lockoutDiv.classList.remove('show');
        }
        updateAttemptsDisplay();
    }, 1000);
});
