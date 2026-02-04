// Particle System
function updateParticles(particles) {
    return particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life--;
        return p.life > 0;
    });
}

function createHeartParticles(x, y, particles) {
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 30,
            maxLife: 30,
            size: 8,
            color: '#FF6B9D'
        });
    }
}

function createConfetti(particles, canvas, count = 100) {
    const colors = ['#FF1744', '#FF6B9D', '#FFD700', '#FF69B4', '#FF1493'];
    for (let i = 0; i < count; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 5,
            life: 60,
            maxLife: 60,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function drawParticles(ctx, particles) {
    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.globalAlpha = 1;
    });
}

