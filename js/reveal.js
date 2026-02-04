// Valentine Reveal System
function startValentineReveal(gameState, canvas) {
    gameState.gameState = GameState.REVEAL;
    gameState.revealAnimationProgress = 0;
    gameState.revealHearts = [];

    // Store all collected heart positions
    gameState.hearts.forEach(heart => {
        if (heart.collected) {
            gameState.revealHearts.push({
                x: heart.x - gameState.camera.x,
                y: heart.y - gameState.camera.y,
                targetX: 0,
                targetY: 0,
                startX: heart.x - gameState.camera.x,
                startY: heart.y - gameState.camera.y,
                delay: 0,
                heart: heart
            });
        }
    });

    // Generate text positions for "Will you be my Valentine?"
    const text = "Will you be my Valentine?";
    const fontSize = 40;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const spacing = fontSize * 0.8;
    
    let charIndex = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') continue;
        if (charIndex >= gameState.revealHearts.length) break;
        
        const charX = centerX - (text.length * spacing) / 2 + i * spacing;
        const charY = centerY;
        
        gameState.revealHearts[charIndex].targetX = charX;
        gameState.revealHearts[charIndex].targetY = charY;
        gameState.revealHearts[charIndex].delay = i * 2;
        charIndex++;
    }

    // Hide game UI
    document.getElementById('ui').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
}

function updateValentineReveal(gameState, canvas, particles) {
    gameState.revealAnimationProgress++;

    // Phase 1: Hearts float up
    if (gameState.revealAnimationProgress < 60) {
        gameState.revealHearts.forEach(h => {
            h.y -= 2;
            h.x += Math.sin(gameState.revealAnimationProgress * 0.1) * 0.5;
        });
    }
    // Phase 2: Hearts come back and swirl
    else if (gameState.revealAnimationProgress < 120) {
        const progress = (gameState.revealAnimationProgress - 60) / 60;
        gameState.revealHearts.forEach((h, i) => {
            const angle = (i / gameState.revealHearts.length) * Math.PI * 2 + progress * Math.PI * 2;
            const radius = 200 * (1 - progress);
            h.x = canvas.width / 2 + Math.cos(angle) * radius;
            h.y = canvas.height / 2 + Math.sin(angle) * radius;
        });
    }
    // Phase 3: Form text
    else if (gameState.revealAnimationProgress < 300) {
        const progress = Math.min(1, (gameState.revealAnimationProgress - 120) / 180);
        gameState.revealHearts.forEach(h => {
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            h.x = h.startX + (h.targetX - h.startX) * easeProgress;
            h.y = h.startY + (h.targetY - h.startY) * easeProgress;
        });
    }
    // Phase 4: Show text
    else if (gameState.revealAnimationProgress === 300) {
        document.getElementById('valentine-reveal').classList.remove('hidden');
        document.getElementById('valentine-text').textContent = "Will you be my Valentine?";
        
        // Create confetti
        createConfetti(particles, canvas, 100);
    }
    else if (gameState.revealAnimationProgress > 360) {
        document.getElementById('valentine-buttons').classList.remove('hidden');
    }
}

function drawValentineReveal(ctx, gameState) {
    // Draw hearts
    gameState.revealHearts.forEach(h => {
        if (h.heart) {
            h.heart.drawForReveal(ctx, h.x, h.y, 1.5);
        }
    });
}

