// =============== HackOS バックエンドサーバー ===============
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// CORS オリジン設定
const corsOrigin = process.env.CORS_ORIGIN || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://3582457723.github.io',
    'https://3582457723.github.io/HackOS/'
];

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ミドルウェア
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// グローバル状態
const gameState = {
    onlineUsers: {},
    serverDatabase: {},
    networkNodes: [],
    activeSessions: {}
};

// =============== ルート ===============
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        players: Object.keys(gameState.onlineUsers).length,
        version: '1.0-ALPHA'
    });
});

// =============== Socket.IO イベント ===============
io.on('connection', (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.id}`);
    
    socket.on('user_login', (userData) => {
        gameState.onlineUsers[socket.id] = {
            username: userData.username,
            ip: userData.ip,
            connected: true,
            socketId: socket.id
        };
        
        io.emit('user_online', {
            username: userData.username,
            ip: userData.ip
        });
        
        console.log(`[Login] ${userData.username} from ${userData.ip}`);
    });
    
    socket.on('user_logout', (username) => {
        delete gameState.onlineUsers[socket.id];
        io.emit('user_offline', { username });
        console.log(`[Logout] ${username}`);
    });
    
    socket.on('scan_network', (userData, callback) => {
        // ネットワークスキャン結果
        const scanResults = [
            { ip: '203.0.113.10', name: 'PublicServer', ports: [80, 443] },
            { ip: '203.0.113.20', name: 'Database', ports: [3306] },
            { ip: '203.0.113.30', name: 'FileServer', ports: [21, 22] }
        ];
        
        // オンラインユーザーもスキャン結果に含める
        Object.values(gameState.onlineUsers).forEach(user => {
            if (user.socketId !== socket.id) {
                scanResults.push({
                    ip: user.ip,
                    name: user.username + "'s PC",
                    ports: [22, 80, 443],
                    playerNode: true
                });
            }
        });
        
        callback(scanResults);
    });
    
    socket.on('attempt_connection', (data, callback) => {
        const { targetIP, username } = data;
        
        // 接続試行をログ
        console.log(`[Connection] ${username} -> ${targetIP}`);
        
        // 接続成功/失敗の模擬
        const success = Math.random() > 0.2; // 80%の確率で成功
        
        callback({
            success: success,
            message: success ? 'Connection established' : 'Connection refused',
            serverInfo: success ? {
                name: 'Target Server',
                ip: targetIP,
                os: 'Linux',
                ports: [22, 80, 443],
                firewall: true
            } : null
        });
        
        // 他のユーザーに通知（攻撃検知）
        io.emit('network_activity', {
            attacker: username,
            target: targetIP,
            type: 'connection_attempt',
            success: success
        });
    });
    
    socket.on('hack_attempt', (data, callback) => {
        const { targetIP, method, username } = data;
        
        console.log(`[Hack] ${username} attempting ${method} on ${targetIP}`);
        
        const success = Math.random() > 0.5;
        callback({
            success: success,
            xp: success ? 150 : 0,
            reward: success ? 1000 : 0
        });
    });
    
    socket.on('save_game_state', (gameState) => {
        // ゲーム状態をサーバーに保存（データベース連携可能）
        console.log(`[Save] Game state saved for user`);
    });
    
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] User disconnected: ${socket.id}`);
        delete gameState.onlineUsers[socket.id];
    });
});

// =============== サーバー起動 ===============
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  HackOS Backend Server                                    ║
║  🚀 Running on: ${PORT === '10000' ? 'Render' : 'localhost'}
║  🌐 Listening on: http://0.0.0.0:${PORT}
║  🔗 Frontend: https://3582457723.github.io/HackOS
║  📡 WebSocket: Enabled
╚═══════════════════════════════════════════════════════════╝
    `);
    console.log('Players can connect and start hacking!');
});

export default app;
