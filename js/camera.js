// Camera System
function updateCamera(camera, player, currentLevel, canvas) {
    if (!player) return;
    
    const targetX = player.x - canvas.width / 2;
    const targetY = player.y - canvas.height / 2;
    
    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;
    
    // Clamp camera
    camera.x = Math.max(0, Math.min(camera.x, currentLevel.width - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, canvas.height - canvas.height));
}

