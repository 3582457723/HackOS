// =============== スキルツリーシステム ===============
export function initializeSkills(app) {
    // スキル定義
    const skillTree = {
        basic: [
            {
                id: 'network_scan',
                name: 'Network Scan',
                description: 'Unlock the scan command',
                cost: 0,
                unlocked: true,
                command: 'scan'
            },
            {
                id: 'port_hack',
                name: 'Port Hack',
                description: 'Unlock porthack command',
                cost: 100,
                unlocked: false,
                command: 'porthack'
            }
        ],
        intermediate: [
            {
                id: 'ssh_crack',
                name: 'SSH Cracking',
                description: 'Unlock sshcrack command',
                cost: 250,
                unlocked: false,
                command: 'sshcrack'
            },
            {
                id: 'file_wipe',
                name: 'File Wipe',
                description: 'Safely erase files without recovery',
                cost: 300,
                unlocked: false,
                command: 'fileWipe'
            }
        ],
        advanced: [
            {
                id: 'deep_scan',
                name: 'Deep Scan',
                description: 'Find hidden backdoor nodes',
                cost: 500,
                unlocked: false,
                command: 'deepscan'
            },
            {
                id: 'log_mirror',
                name: 'Log Mirror',
                description: 'Replace connection logs with decoys',
                cost: 600,
                unlocked: false,
                command: 'logmirror'
            }
        ]
    };
    
    app.gameState.skillTree = skillTree;
    renderSkillTree(app);
}

function renderSkillTree(app) {
    const skillTree = document.getElementById('skill-tree');
    skillTree.innerHTML = '';
    
    const skillCategories = app.gameState.skillTree;
    
    Object.entries(skillCategories).forEach(([category, skills]) => {
        // カテゴリタイトル
        const categoryDiv = document.createElement('div');
        categoryDiv.style.gridColumn = '1 / -1';
        categoryDiv.innerHTML = `<div style="color: var(--color-accent); font-weight: bold; margin: 10px 0; text-transform: uppercase;">${category} SKILLS</div>`;
        skillTree.appendChild(categoryDiv);
        
        // スキル
        skills.forEach(skill => {
            const skillNode = document.createElement('div');
            skillNode.className = `skill-node ${skill.unlocked ? 'unlocked' : ''}`;
            
            skillNode.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-desc">${skill.description}</div>
                <div class="skill-cost">
                    ${skill.unlocked ? '✓ UNLOCKED' : `Cost: ${skill.cost} XP`}
                </div>
            `;
            
            if (!skill.unlocked) {
                skillNode.style.cursor = 'pointer';
                skillNode.onclick = () => unlockSkill(app, skill.id, skill.cost);
            }
            
            skillTree.appendChild(skillNode);
        });
    });
}

function unlockSkill(app, skillId, cost) {
    // フラット化してスキルを探す
    let skill = null;
    Object.values(app.gameState.skillTree).forEach(skills => {
        const found = skills.find(s => s.id === skillId);
        if (found) skill = found;
    });
    
    if (!skill) return;
    
    if (app.gameState.xp >= cost) {
        app.gameState.xp -= cost;
        skill.unlocked = true;
        app.showPopup(`Skill "${skill.name}" UNLOCKED!\nCommand available: ${skill.command}`, 'success');
        renderSkillTree(app);
    } else {
        app.showPopup(`Not enough XP.\nNeed ${cost - app.gameState.xp} more XP`, 'warning');
    }
}

export default initializeSkills;
