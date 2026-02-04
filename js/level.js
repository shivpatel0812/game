// Level Data
const levels = [
    {
        width: 2000,
        startX: 100,
        startY: 500,
        platforms: [
            { x: 0, y: 650, width: 400, height: 50 },
            { x: 300, y: 550, width: 200, height: 20 },
            { x: 500, y: 450, width: 200, height: 20 },
            { x: 700, y: 550, width: 200, height: 20 },
            { x: 900, y: 400, width: 300, height: 20 },
            { x: 1200, y: 500, width: 200, height: 20 },
            { x: 1400, y: 350, width: 200, height: 20 },
            { x: 1600, y: 450, width: 200, height: 20 },
            { x: 1800, y: 550, width: 200, height: 20 },
            { x: 1800, y: 650, width: 200, height: 50 },
            { x: 1850, y: 550, width: 100, height: 20 }
        ],
        hearts: [
            { x: 350, y: 500, type: 'normal' },
            { x: 550, y: 400, type: 'normal' },
            { x: 750, y: 500, type: 'normal' },
            { x: 1050, y: 350, type: 'normal' },
            { x: 1300, y: 300, type: 'normal' },
            { x: 1500, y: 300, type: 'normal' },
            { x: 1700, y: 400, type: 'normal' },
            { x: 1850, y: 500, type: 'runaway' }
        ],
        obstacles: [
            { x: 600, y: 420, type: 'bouncy' },
            { x: 1000, y: 350, type: 'bouncy' },
            { x: 1500, y: 300, type: 'bouncy' }
        ]
    }
];

// Initialize Level
function initLevel(levelData, gameState) {
    gameState.currentLevel = levelData;
    gameState.player = new Player(levelData.startX, levelData.startY);
    gameState.hearts = [];
    gameState.platforms = [];
    gameState.obstacles = [];
    gameState.particles = [];
    gameState.collectedHearts = 0;
    gameState.totalHearts = levelData.hearts.length;

    // Create platforms
    levelData.platforms.forEach(p => {
        gameState.platforms.push(new Platform(p.x, p.y, p.width, p.height));
    });

    // Create hearts
    levelData.hearts.forEach(h => {
        gameState.hearts.push(new Heart(h.x, h.y, h.type));
    });

    // Create obstacles
    levelData.obstacles.forEach(o => {
        if (o.type === 'bouncy') {
            gameState.obstacles.push(new BouncyBlob(o.x, o.y));
        }
    });

    // Update UI
    document.getElementById('hearts-count').textContent = gameState.collectedHearts;
    document.getElementById('hearts-total').textContent = gameState.totalHearts;
}

