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
    // Create a copy of level data to modify for hard mode
    let modifiedLevelData = { ...levelData };
    
    // In hard mode, expand the map and add more platforms with hearts
    if (gameState.difficulty === 'hard') {
        modifiedLevelData.width = levelData.width * 1.5; // Make map 50% wider
        
        // Add more platforms extending the map
        const additionalPlatforms = [
            { x: 2000, y: 600, width: 200, height: 20 },
            { x: 2200, y: 500, width: 200, height: 20 },
            { x: 2400, y: 400, width: 200, height: 20 },
            { x: 2600, y: 500, width: 200, height: 20 },
            { x: 2800, y: 350, width: 200, height: 20 },
            { x: 2000, y: 650, width: 400, height: 50 }, // Ground extension
        ];
        modifiedLevelData.platforms = [...levelData.platforms, ...additionalPlatforms];
        
        // Add more hearts on the new platforms
        const additionalHearts = [
            { x: 2100, y: 550, type: 'normal' },
            { x: 2300, y: 450, type: 'normal' },
            { x: 2500, y: 350, type: 'normal' },
            { x: 2700, y: 450, type: 'normal' },
            { x: 2900, y: 300, type: 'normal' },
            { x: 2850, y: 300, type: 'runaway' } // Final heart on last platform
        ];
        modifiedLevelData.hearts = [...levelData.hearts, ...additionalHearts];
        
        // Add more obstacles
        const additionalObstacles = [
            { x: 2100, y: 550, type: 'bouncy' },
            { x: 2500, y: 350, type: 'bouncy' },
            { x: 2800, y: 300, type: 'bouncy' }
        ];
        modifiedLevelData.obstacles = [...levelData.obstacles, ...additionalObstacles];
    }
    
    gameState.currentLevel = modifiedLevelData;
    gameState.player = new Player(modifiedLevelData.startX, modifiedLevelData.startY);
    gameState.hearts = [];
    gameState.platforms = [];
    gameState.obstacles = [];
    gameState.fallingObstacles = [];
    gameState.particles = [];
    gameState.fallingObstacleTimer = 0;

    // Create platforms
    modifiedLevelData.platforms.forEach(p => {
        gameState.platforms.push(new Platform(p.x, p.y, p.width, p.height));
    });

    // Create hearts based on difficulty
    gameState.hearts = [];
    let heartsToCreate = [...modifiedLevelData.hearts];
    
    // In easy mode, make the last heart not runaway
    if (gameState.difficulty === 'easy') {
        heartsToCreate = heartsToCreate.map((h, index) => {
            if (index === heartsToCreate.length - 1 && h.type === 'runaway') {
                return { ...h, type: 'normal' };
            }
            return h;
        });
    }
    
    heartsToCreate.forEach(h => {
        const heart = new Heart(h.x, h.y, h.type);
        heart.collected = false;
        gameState.hearts.push(heart);
    });

    // Reset collected hearts count (unless in easy mode and preserving)
    if (gameState.difficulty !== 'easy' || gameState.collectedHearts === 0) {
        gameState.collectedHearts = 0;
    }
    
    gameState.totalHearts = heartsToCreate.length;

    // Create obstacles
    modifiedLevelData.obstacles.forEach(o => {
        if (o.type === 'bouncy') {
            gameState.obstacles.push(new BouncyBlob(o.x, o.y));
        }
    });

    // Update UI
    document.getElementById('hearts-count').textContent = gameState.collectedHearts;
    document.getElementById('hearts-total').textContent = gameState.totalHearts;
}

