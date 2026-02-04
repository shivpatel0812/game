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

class FallingObstacle {
    constructor(x, y, speed = 3) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.vy = speed;
        this.color = '#FF4444';
        this.rotation = 0;
    }

    update(player, canvas, onHit) {
        // Fall down
        this.y += this.vy;
        this.rotation += 0.1;
        
        // Check collision with player
        if (player && player.checkCollision(this)) {
            if (onHit) {
                onHit();
            }
        }
        
        // Remove if off screen
        return this.y < canvas.height + 100;
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.translate(this.x - camera.x + this.width / 2, this.y - camera.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-this.width / 2, -this.height / 2);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#CC0000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
}

