// =============== ミッション管理システム ===============
export function initializeMissions(app) {
    // サンプルミッション
    app.gameState.missions = [
        {
            id: 1,
            title: 'First Hack',
            description: 'Connect to target server 192.168.1.50',
            targetIP: '192.168.1.50',
            reward: { xp: 100, money: 500 },
            completed: false,
            accepted: true
        },
        {
            id: 2,
            title: 'Data Extraction',
            description: 'Extract file "secrets.txt" from target',
            targetIP: '192.168.1.100',
            reward: { xp: 250, money: 1000 },
            completed: false,
            accepted: false
        },
        {
            id: 3,
            title: 'System Infiltration',
            description: 'Gain admin access to network database',
            targetIP: '192.168.1.200',
            reward: { xp: 500, money: 2500 },
            completed: false,
            accepted: false
        }
    ];
    
    renderMissions(app);
}

function renderMissions(app) {
    const missionsList = document.getElementById('missions-list');
    missionsList.innerHTML = '';
    
    app.gameState.missions.forEach(mission => {
        const card = document.createElement('div');
        card.className = `mission-card ${mission.completed ? 'completed' : ''}`;
        
        const statusText = mission.completed ? '✓ COMPLETED' : 
                          mission.accepted ? '◆ ACTIVE' : 'NOT ACCEPTED';
        
        card.innerHTML = `
            <div class="mission-title">${mission.title}</div>
            <div class="mission-desc">${mission.description}</div>
            <div class="mission-status">${statusText}</div>
            <div class="mission-reward">
                Reward: ${mission.reward.xp} XP + $${mission.reward.money}
            </div>
            ${!mission.accepted ? `<button onclick="window.hackosApp.acceptMission(${mission.id})" class="btn-small">ACCEPT</button>` : ''}
        `;
        
        missionsList.appendChild(card);
    });
}

export function acceptMission(app, missionId) {
    const mission = app.gameState.missions.find(m => m.id === missionId);
    if (mission) {
        mission.accepted = true;
        renderMissions(app);
    }
}

export function completeMission(app, missionId) {
    const mission = app.gameState.missions.find(m => m.id === missionId);
    if (mission) {
        mission.completed = true;
        app.addXP(mission.reward.xp);
        app.addMoney(mission.reward.money);
        app.showPopup(
            `MISSION COMPLETE!\n\n+${mission.reward.xp} XP\n+$${mission.reward.money}`,
            'success'
        );
        renderMissions(app);
    }
}

export default initializeMissions;
