// =============== アプリケーション管理システム ===============
import { initializeBoot } from './boot.js';
import { initializeDesktop, initializeSettings } from './desktop.js';
import { initializeTerminal } from './terminal.js';
import { initializeNetworkMap } from './network-map.js';
import { initializeMissions, acceptMission } from './missions.js';
import { initializeSkills } from './skills.js';
import { initializeSocketIO } from './socket-io-config.js';

class HackOSApp {
    constructor() {
        this.user = null;
        this.currentIP = '127.0.0.1';
        this.connectedServers = [];
        this.gameState = {
            xp: 0,
            money: 0,
            level: 1,
            skills: {},
            missions: [],
            serverDatabase: {},
            networkNodes: []
        };
        this.socket = null;
        this.init();
    }

    async init() {
        console.log('[HackOS] Initializing application...');
        
        // LocalStorage からデータを復元
        this.loadSaveData();
        
        // ブート画面を初期化
        await this.showBootScreen();
        
        // ログイン画面を表示
        this.showLoginScreen();
    }

    async showBootScreen() {
        return new Promise((resolve) => {
            const bootScreen = document.getElementById('boot-screen');
            initializeBoot((completed) => {
                if (completed) {
                    bootScreen.classList.add('hidden');
                    resolve();
                }
            });
        });
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        loginScreen.classList.remove('hidden');
        this.loginMode = 'login';
        this.activeLoginIndex = 0;
        this.renderToggleOptions();
        this.renderLoginForm();

        document.addEventListener('keydown', this.handleLoginKeydown.bind(this));
    }

    handleLoginKeydown(e) {
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen.classList.contains('hidden')) {
            return;
        }
        const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (!validKeys.includes(e.key)) {
            return;
        }
        e.preventDefault();

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            this.activeLoginIndex = 0;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            this.activeLoginIndex = 1;
        }
        this.loginMode = this.activeLoginIndex === 0 ? 'login' : 'register';
        this.renderToggleOptions();
        if (this.loginMode === 'login') {
            this.renderLoginForm();
        } else {
            this.renderRegisterForm();
        }
    }

    renderToggleOptions() {
        const toggleContainer = document.querySelector('.login-toggle');
        if (!toggleContainer) return;
        toggleContainer.innerHTML = `
            <button type="button" class="toggle-option ${this.loginMode === 'login' ? 'active' : ''}" data-mode="login">LOGIN</button>
            <button type="button" class="toggle-option ${this.loginMode === 'register' ? 'active' : ''}" data-mode="register">REGISTER</button>
        `;
        const buttons = toggleContainer.querySelectorAll('.toggle-option');
        buttons.forEach(button => {
            button.onclick = () => {
                this.loginMode = button.dataset.mode;
                this.activeLoginIndex = this.loginMode === 'login' ? 0 : 1;
                this.renderToggleOptions();
                if (this.loginMode === 'login') {
                    this.renderLoginForm();
                } else {
                    this.renderRegisterForm();
                }
            };
        });
    }

    renderLoginForm() {
        const loginMode = document.getElementById('login-mode');
        loginMode.innerHTML = `
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" placeholder="Enter username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" placeholder="Enter password" required>
                </div>
                <button type="submit" class="btn-login">LOGIN</button>
            </form>
            <div class="login-hint">
                <p>Use arrow keys to toggle selection. Press <strong>Enter</strong> or click button.</p>
            </div>
        `;

        const loginForm = document.getElementById('login-form');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username && password) {
                this.login(username, password);
            }
        };
        usernameInput.focus();
    }

    renderRegisterForm() {
        const loginMode = document.getElementById('login-mode');
        loginMode.innerHTML = `
            <form id="register-form">
                <div class="form-group">
                    <label for="reg-username">Username:</label>
                    <input type="text" id="reg-username" placeholder="Choose username" required>
                </div>
                <div class="form-group">
                    <label for="reg-password">Password:</label>
                    <input type="password" id="reg-password" placeholder="Enter password" required>
                </div>
                <div class="form-group">
                    <label for="reg-password-confirm">Confirm Password:</label>
                    <input type="password" id="reg-password-confirm" placeholder="Confirm password" required>
                </div>
                <button type="submit" class="btn-login">REGISTER</button>
            </form>
            <div class="login-hint">
                <p>Use arrow keys to toggle selection. Press <strong>Enter</strong> or click button.</p>
            </div>
        `;

        const registerForm = document.getElementById('register-form');
        registerForm.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;

            if (password === passwordConfirm) {
                this.register(username, password);
            } else {
                alert('Passwords do not match');
            }
        };
        document.getElementById('reg-username').focus();
    }

    login(username, password) {
        // パスワードのハッシュ化（簡易版）
        const hashedPassword = this.simpleHash(password);
        const storedUsers = JSON.parse(localStorage.getItem('hackosx_users') || '{}');
        
        if (storedUsers[username] && storedUsers[username].password === hashedPassword) {
            this.user = {
                username,
                ip: storedUsers[username].ip || this.generateIP(),
                created: storedUsers[username].created
            };
            
            this.startGame();
        } else {
            alert('Invalid credentials');
        }
    }

    showRegisterScreen() {
        const loginScreen = document.getElementById('login-screen');
        const loginMode = document.getElementById('login-mode');
        
        loginMode.innerHTML = `
            <form id="register-form">
                <div class="form-group">
                    <label for="reg-username">Username:</label>
                    <input type="text" id="reg-username" placeholder="Choose username" required>
                </div>
                <div class="form-group">
                    <label for="reg-password">Password:</label>
                    <input type="password" id="reg-password" placeholder="Enter password" required>
                </div>
                <div class="form-group">
                    <label for="reg-password-confirm">Confirm Password:</label>
                    <input type="password" id="reg-password-confirm" placeholder="Confirm password" required>
                </div>
                <button type="submit" class="btn-login">REGISTER</button>
            </form>
            <div class="login-hint">
                <p>Already have an account? Press <kbd>SHIFT+TAB</kbd> to login</p>
            </div>
        `;
        
        const registerForm = document.getElementById('register-form');
        registerForm.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            
            if (password === passwordConfirm) {
                this.register(username, password);
            } else {
                alert('Passwords do not match');
            }
        };
    }

    register(username, password) {
        const storedUsers = JSON.parse(localStorage.getItem('hackosx_users') || '{}');
        
        if (storedUsers[username]) {
            alert('Username already exists');
            return;
        }
        
        const hashedPassword = this.simpleHash(password);
        const newUser = {
            username,
            password: hashedPassword,
            ip: this.generateIP(),
            created: new Date().toISOString()
        };
        
        storedUsers[username] = newUser;
        localStorage.setItem('hackosx_users', JSON.stringify(storedUsers));
        
        this.user = newUser;
        this.startGame();
    }

    startGame() {
        const loginScreen = document.getElementById('login-screen');
        const desktop = document.getElementById('desktop');
        
        loginScreen.classList.add('hidden');
        desktop.classList.remove('hidden');
        
        // 各システムを初期化
        this.initializeGameSystems();
    }

    initializeGameSystems() {
        // Socket.IO 初期化
        initializeSocketIO(this);
        
        // デスクトップUI初期化
        initializeDesktop(this);
        
        // ターミナル初期化
        initializeTerminal(this);
        
        // ネットワークマップ初期化
        initializeNetworkMap(this);
        
        // ミッション初期化
        initializeMissions(this);
        
        // スキルツリー初期化
        initializeSkills(this);
        
        // 設定パネル初期化
        initializeSettings(this);
        
        // ステータス更新ループ
        this.startStatusUpdater();
        
        // オートセーブ
        this.startAutoSave();
    }

    startStatusUpdater() {
        setInterval(() => {
            // 時刻更新
            const now = new Date();
            document.getElementById('current-time').textContent = 
                now.toLocaleTimeString();
            document.getElementById('current-date').textContent = 
                now.toLocaleDateString();
            
            // ステータス更新
            document.getElementById('current-user').textContent = 
                `${this.user.username}@hackosx`;
            document.getElementById('current-ip').textContent = 
                `IP: ${this.currentIP}`;
            
            // メモリ使用率（模擬）
            const fakeMemory = Math.floor(Math.random() * 60) + 20;
            document.getElementById('memory-usage').textContent = 
                `RAM: ${fakeMemory}%`;
            
            // バッテリー（ホストから取得可能）
            if (navigator.getBattery) {
                navigator.getBattery().then((battery) => {
                    const percent = Math.round(battery.level * 100);
                    document.getElementById('battery-status').textContent = 
                        `Battery: ${percent}%`;
                });
            }
        }, 1000);
    }

    startAutoSave() {
        setInterval(() => {
            this.saveGameState();
        }, 30000); // 30秒ごと
    }

    saveGameState() {
        localStorage.setItem('hackosx_gamestate', JSON.stringify(this.gameState));
        localStorage.setItem('hackosx_lastlogin', new Date().toISOString());
        console.log('[HackOS] Game state saved');
    }

    loadSaveData() {
        const savedState = localStorage.getItem('hackosx_gamestate');
        if (savedState) {
            this.gameState = JSON.parse(savedState);
        }
    }

    // ユーティリティ
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32-bit
        }
        return hash.toString();
    }

    generateIP() {
        return [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        ].join('.');
    }

    addXP(amount) {
        this.gameState.xp += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const xpPerLevel = 1000;
        const newLevel = Math.floor(this.gameState.xp / xpPerLevel) + 1;
        
        if (newLevel > this.gameState.level) {
            this.gameState.level = newLevel;
            this.showPopup(`LEVEL UP! You are now level ${newLevel}`, 'success');
        }
    }

    addMoney(amount) {
        this.gameState.money += amount;
        this.updateMoneyDisplay();
    }

    updateMoneyDisplay() {
        // UI更新（存在する場合）
    }

    acceptMission(missionId) {
        acceptMission(this, missionId);
    }

    showPopup(message, type = 'info') {
        const overlay = document.getElementById('popup-overlay');
        const box = document.getElementById('popup-box');
        
        box.innerHTML = `
            <div class="popup-title">${type.toUpperCase()}</div>
            <div class="popup-content">${message}</div>
            <div class="popup-buttons">
                <button id="popup-close" class="btn-login">OK</button>
            </div>
        `;
        
        overlay.classList.remove('hidden');
        document.getElementById('popup-close').onclick = () => {
            overlay.classList.add('hidden');
        };
    }
}

// アプリケーション起動
const app = new HackOSApp();
window.hackosApp = app;
