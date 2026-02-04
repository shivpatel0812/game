// Initialize Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to fill viewport
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    CONFIG.CANVAS_WIDTH = canvas.width;
    CONFIG.CANVAS_HEIGHT = canvas.height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game State Object
const gameState = {
    gameState: GameState.MENU,
    currentLevel: null,
    player: null,
    hearts: [],
    platforms: [],
    obstacles: [],
    fallingObstacles: [],
    particles: [],
    collectedHearts: 0,
    totalHearts: 0,
    revealHearts: [],
    revealAnimationProgress: 0,
    camera: { x: 0, y: 0 },
    fallingObstacleTimer: 0,
    fallingObstacleInterval: 120, // Spawn every 2 seconds at 60fps
    difficulty: 'medium' // easy, medium, hard
};

// Restart game function
function restartGame() {
    if (gameState.currentLevel) {
        const savedHearts = gameState.collectedHearts;
        const savedTotalHearts = gameState.totalHearts;
        
        initLevel(gameState.currentLevel, gameState);
        gameState.fallingObstacles = [];
        gameState.fallingObstacleTimer = 0;
        
        // In easy mode, preserve collected hearts
        if (gameState.difficulty === 'easy') {
            gameState.collectedHearts = savedHearts;
            gameState.totalHearts = savedTotalHearts;
            
            // Mark previously collected hearts as collected
            gameState.hearts.forEach((heart, index) => {
                if (index < savedHearts) {
                    heart.collected = true;
                }
            });
        }
        
        // Respawn player at start
        gameState.player.x = gameState.currentLevel.startX;
        gameState.player.y = gameState.currentLevel.startY;
        gameState.player.vx = 0;
        gameState.player.vy = 0;
    }
}

// Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState.gameState === GameState.PLAYING) {
        // Spawn falling obstacles (faster in hard mode)
        gameState.fallingObstacleTimer++;
        const interval = gameState.difficulty === 'hard' ? gameState.fallingObstacleInterval / 2 : gameState.fallingObstacleInterval;
        if (gameState.fallingObstacleTimer >= interval) {
            gameState.fallingObstacleTimer = 0;
            // Spawn at random x position within camera view
            const spawnX = gameState.camera.x + Math.random() * canvas.width;
            const fallSpeed = gameState.difficulty === 'hard' ? 5 : 3;
            gameState.fallingObstacles.push(new FallingObstacle(spawnX, -50, fallSpeed));
            
            // In hard mode, sometimes spawn 2 at once
            if (gameState.difficulty === 'hard' && Math.random() > 0.5) {
                const spawnX2 = gameState.camera.x + Math.random() * canvas.width;
                gameState.fallingObstacles.push(new FallingObstacle(spawnX2, -50, fallSpeed));
            }
        }
        
        // Update
        gameState.player.update(gameState.platforms, gameState.currentLevel, canvas, restartGame);
        
        // Update hearts with collection callback
        gameState.hearts.forEach(h => {
            h.update(
                gameState.player,
                gameState.platforms,
                gameState.currentLevel,
                canvas,
                () => {
                    // On heart collected
                    gameState.collectedHearts++;
                    createHeartParticles(h.x, h.y, gameState.particles);
                    
                    // Check if all hearts collected
                    if (gameState.collectedHearts >= gameState.totalHearts) {
                        setTimeout(() => {
                            startValentineReveal(gameState, canvas);
                        }, 500);
                    }
                }
            );
        });
        
        gameState.obstacles.forEach(o => o.update(gameState.player));
        
        // Update falling obstacles
        gameState.fallingObstacles = gameState.fallingObstacles.filter(obstacle => {
            return obstacle.update(gameState.player, canvas, restartGame);
        });
        
        gameState.particles = updateParticles(gameState.particles);
        updateCamera(gameState.camera, gameState.player, gameState.currentLevel, canvas);

        // Draw background elements
        gameState.platforms.forEach(p => p.draw(ctx, gameState.camera));
        gameState.obstacles.forEach(o => o.draw(ctx, gameState.camera));
        gameState.fallingObstacles.forEach(o => o.draw(ctx, gameState.camera));
        gameState.hearts.forEach(h => h.draw(ctx, gameState.camera));
        gameState.player.draw(ctx, gameState.camera);
        drawParticles(ctx, gameState.particles);

        // Update UI
        document.getElementById('hearts-count').textContent = gameState.collectedHearts;
    }
    else if (gameState.gameState === GameState.REVEAL) {
        updateValentineReveal(gameState, canvas, gameState.particles);
        gameState.particles = updateParticles(gameState.particles);
        drawValentineReveal(ctx, gameState);
        drawParticles(ctx, gameState.particles);
    }

    requestAnimationFrame(gameLoop);
}

// Make gameState globally accessible for heart.js
window.gameState = gameState;

// Difficulty selection
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.difficulty = btn.dataset.difficulty;
    });
});

// Event Listeners
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('menu').classList.add('hidden');
    gameState.gameState = GameState.PLAYING;
    initLevel(levels[0], gameState);
});

document.getElementById('yes-btn').addEventListener('click', () => {
    document.getElementById('valentine-text').textContent = "Yay! 💖💖💖";
    document.getElementById('valentine-buttons').classList.add('hidden');
    
    // More confetti!
    createConfetti(gameState.particles, canvas, 200);
});

document.getElementById('no-btn').addEventListener('click', () => {
    document.getElementById('valentine-text').textContent = "Aww, that's okay! 💙";
    document.getElementById('valentine-buttons').classList.add('hidden');
});

// Exit button listeners
document.getElementById('exit-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('exit-btn-menu').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Start game loop
gameLoop();

