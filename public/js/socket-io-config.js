// =============== Socket.IO 設定 ===============
export const getSocketIOURL = () => {
    // 開発環境
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    
    // 本番環境 - Render バックエンド
    const backendURL = window.__HACKO_BACKEND_URL__ || 
                      localStorage.getItem('hacko_backend_url') ||
                      'https://hackosgame-backend.onrender.com';
    
    return backendURL;
};

export const initializeSocketIO = (app) => {
    const socketURL = getSocketIOURL();
    
    try {
        app.socket = io(socketURL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            }
        });
        
        app.socket.on('connect', () => {
            console.log('[Socket.IO] Connected to backend:', socketURL);
            app.socket.emit('user_login', {
                username: app.user.username,
                ip: app.user.ip
            });
        });
        
        app.socket.on('disconnect', () => {
            console.log('[Socket.IO] Disconnected from backend');
        });
        
        app.socket.on('user_online', (data) => {
            console.log(`[Online] ${data.username} (${data.ip})`);
        });
        
        app.socket.on('network_activity', (data) => {
            console.log('[Alert] Network activity detected:', data);
        });
        
    } catch (error) {
        console.error('Socket.IO initialization failed:', error);
    }
};

export default getSocketIOURL;
