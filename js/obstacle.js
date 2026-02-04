// Obstacle Classes
class BouncyBlob {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.bounceTime = 0;
        this.color = '#9B59B6';
    }

    update(player) {
        this.bounceTime += 0.1;
        
        if (player && player.checkCollision(this)) {
            // Bounce player up
            if (player.vy >= 0) {
                player.vy = -12;
                player.onGround = false;
            }
        }
    }

    draw(ctx, camera) {
        ctx.save();
        const offsetY = Math.sin(this.bounceTime) * 3;
        ctx.translate(this.x - camera.x, this.y - camera.y + offsetY);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.width / 2 - 5, this.height / 2 - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

