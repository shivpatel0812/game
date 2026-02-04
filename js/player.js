// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.jumpCooldown = 0;
        this.color = '#FF6B9D';
    }

    update(platforms, currentLevel, canvas) {
        // Horizontal movement
        let moveX = 0;
        if (keys['arrowleft'] || keys['a']) moveX -= CONFIG.PLAYER_SPEED;
        if (keys['arrowright'] || keys['d']) moveX += CONFIG.PLAYER_SPEED;

        if (this.onGround) {
            this.vx = moveX;
        } else {
            // Air control
            this.vx += moveX * CONFIG.AIR_CONTROL;
            this.vx *= CONFIG.FRICTION;
        }

        // Jumping
        if ((keys['arrowup'] || keys['w'] || keys[' ']) && this.onGround && this.jumpCooldown === 0) {
            this.vy = CONFIG.JUMP_STRENGTH;
            this.onGround = false;
            this.jumpCooldown = 10;
        }

        if (this.jumpCooldown > 0) this.jumpCooldown--;

        // Apply gravity
        this.vy += CONFIG.GRAVITY;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Platform collision
        this.onGround = false;
        for (let platform of platforms) {
            if (this.checkCollision(platform)) {
                // Landing on top
                if (this.vy > 0 && this.y - this.height < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
                // Hitting from below
                else if (this.vy < 0 && this.y > platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Side collisions
                else if (this.vx > 0) {
                    this.x = platform.x - this.width;
                    this.vx = 0;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width;
                    this.vx = 0;
                }
            }
        }

        // Boundary collision
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x + this.width > currentLevel.width) {
            this.x = currentLevel.width - this.width;
            this.vx = 0;
        }
        if (this.y + this.height > canvas.height) {
            // Respawn
            this.x = currentLevel.startX;
            this.y = currentLevel.startY;
            this.vx = 0;
            this.vy = 0;
        }

        // Limit fall speed
        if (this.vy > 20) this.vy = 20;
    }

    checkCollision(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        
        // Draw player (simple rounded rectangle)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const radius = 5;
        ctx.moveTo(radius, 0);
        ctx.lineTo(this.width - radius, 0);
        ctx.quadraticCurveTo(this.width, 0, this.width, radius);
        ctx.lineTo(this.width, this.height - radius);
        ctx.quadraticCurveTo(this.width, this.height, this.width - radius, this.height);
        ctx.lineTo(radius, this.height);
        ctx.quadraticCurveTo(0, this.height, 0, this.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
        
        // Simple face
        ctx.fillStyle = 'white';
        ctx.fillRect(8, 10, 5, 5);
        ctx.fillRect(17, 10, 5, 5);
        ctx.beginPath();
        ctx.arc(15, 25, 5, 0, Math.PI);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
}

