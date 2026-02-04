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
    particles: [],
    collectedHearts: 0,
    totalHearts: 0,
    revealHearts: [],
    revealAnimationProgress: 0,
    camera: { x: 0, y: 0 }
};

// Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState.gameState === GameState.PLAYING) {
        // Update
        gameState.player.update(gameState.platforms, gameState.currentLevel, canvas);
        
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
        gameState.particles = updateParticles(gameState.particles);
        updateCamera(gameState.camera, gameState.player, gameState.currentLevel, canvas);

        // Draw background elements
        gameState.platforms.forEach(p => p.draw(ctx, gameState.camera));
        gameState.obstacles.forEach(o => o.draw(ctx, gameState.camera));
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

// Start game loop
gameLoop();

