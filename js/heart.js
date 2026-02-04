// Heart Class
class Heart {
    constructor(x, y, type = 'normal') {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.size = 20;
        this.collected = false;
        this.type = type;
        this.animationTime = 0;
        this.runawayVx = 0;
        this.runawayVy = 0;
        this.runawayTargetX = x;
        this.runawayTargetY = y;
    }

    update(player, platforms, currentLevel, canvas, onAllCollected) {
        if (this.collected) return;

        this.animationTime += 0.1;

        // Runaway heart behavior
        if (this.type === 'runaway' && player) {
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                // Run away from player (slower movement)
                const angle = Math.atan2(dy, dx);
                this.runawayVx += Math.cos(angle) * 0.3;
                this.runawayVy += Math.sin(angle) * 0.3;
            }

            // Apply gravity to keep it near platforms
            this.runawayVy += 0.3;
            
            // Apply velocity
            this.x += this.runawayVx;
            this.y += this.runawayVy;

            // Damping (stronger to slow it down)
            this.runawayVx *= 0.92;
            this.runawayVy *= 0.92;

            // Platform collision to keep it on platforms
            let onPlatform = false;
            for (let platform of platforms) {
                if (this.x < platform.x + platform.width &&
                    this.x + this.size > platform.x &&
                    this.y < platform.y + platform.height &&
                    this.y + this.size > platform.y) {
                    // On top of platform
                    if (this.runawayVy > 0 && this.y < platform.y) {
                        this.y = platform.y - this.size;
                        this.runawayVy = 0;
                        onPlatform = true;
                    }
                }
            }

            // Boundary check
            if (this.x < 50) {
                this.x = 50;
                this.runawayVx *= -0.5;
            }
            if (this.x > currentLevel.width - 50) {
                this.x = currentLevel.width - 50;
                this.runawayVx *= -0.5;
            }
            if (this.y < 50) {
                this.y = 50;
                this.runawayVy = 0;
            }
            if (this.y > canvas.height - 50) {
                // Respawn on nearest platform
                let nearestPlatform = null;
                let minDist = Infinity;
                platforms.forEach(p => {
                    const dist = Math.abs(this.x - (p.x + p.width / 2));
                    if (dist < minDist) {
                        minDist = dist;
                        nearestPlatform = p;
                    }
                });
                if (nearestPlatform) {
                    this.x = nearestPlatform.x + nearestPlatform.width / 2;
                    this.y = nearestPlatform.y - this.size;
                    this.runawayVx = 0;
                    this.runawayVy = 0;
                } else {
                    this.y = canvas.height - 50;
                    this.runawayVy = 0;
                }
            }
        }

        // Check collection
        if (player && !this.collected) {
            const dx = this.x - (player.x + player.width / 2);
            const dy = this.y - (player.y + player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.size + 15) {
                this.collect(onAllCollected);
            }
        }
    }

    collect(onAllCollected) {
        if (this.collected) return;
        this.collected = true;
        
        if (onAllCollected) {
            onAllCollected();
        }
    }

    draw(ctx, camera) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);

        // Draw heart
        ctx.fillStyle = '#FF1744';
        ctx.strokeStyle = '#C51162';
        ctx.lineWidth = 2;

        ctx.beginPath();
        const scale = 1 + Math.sin(this.animationTime) * 0.1;
        ctx.scale(scale, scale);
        
        // Heart shape
        ctx.moveTo(0, this.size * 0.3);
        ctx.bezierCurveTo(0, 0, -this.size * 0.5, 0, -this.size * 0.5, this.size * 0.3);
        ctx.bezierCurveTo(-this.size * 0.5, this.size * 0.7, 0, this.size * 1.2, 0, this.size * 1.2);
        ctx.bezierCurveTo(0, this.size * 1.2, this.size * 0.5, this.size * 0.7, this.size * 0.5, this.size * 0.3);
        ctx.bezierCurveTo(this.size * 0.5, 0, 0, 0, 0, this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawForReveal(ctx, x, y, scale = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.fillStyle = '#FF1744';
        ctx.strokeStyle = '#C51162';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, this.size * 0.3);
        ctx.bezierCurveTo(0, 0, -this.size * 0.5, 0, -this.size * 0.5, this.size * 0.3);
        ctx.bezierCurveTo(-this.size * 0.5, this.size * 0.7, 0, this.size * 1.2, 0, this.size * 1.2);
        ctx.bezierCurveTo(0, this.size * 1.2, this.size * 0.5, this.size * 0.7, this.size * 0.5, this.size * 0.3);
        ctx.bezierCurveTo(this.size * 0.5, 0, 0, 0, 0, this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}

