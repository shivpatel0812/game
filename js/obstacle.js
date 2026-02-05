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

class ChaserBot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.jumpCooldown = 0;
        this.color = '#FF0000';
        // Store player speed as a fixed value, independent of CONFIG changes
        this.baseSpeed = 5; // Fixed base speed (same as CONFIG.PLAYER_SPEED but independent)
        this.speedLevel = 3; // Will be set from gameState.botSpeed (1-10)
        this.chaseDelay = 120; // Start chasing after 2 seconds
        this.chaseTimer = 0;
        this.currentPlatform = null;
    }

    update(player, platforms, currentLevel, canvas, onCaught) {
        // Wait before starting to chase
        if (this.chaseTimer < this.chaseDelay) {
            this.chaseTimer++;
            return;
        }

        if (!player) return;

        // Calculate direction to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;

        // Calculate speed based on speedLevel (1-10): 1 = 10%, 10 = 100% of player speed
        const speed = this.baseSpeed * (this.speedLevel / 10);

        // Horizontal movement toward player
        let moveX = 0;
        if (Math.abs(dx) > 5) {
            moveX = dx > 0 ? speed : -speed;
        }

        if (this.onGround) {
            this.vx = moveX;
        } else {
            // Air control - move toward player while in air
            this.vx += moveX * CONFIG.AIR_CONTROL * 1.5;
            this.vx *= CONFIG.FRICTION;
        }

        // Smart jumping logic
        if (this.onGround && this.jumpCooldown === 0) {
            let shouldJump = false;
            
            // 1. Jump if player is above us
            if (dy < -30) {
                shouldJump = true;
            }
            
            // 2. Jump if about to fall off platform edge (gap ahead)
            if (!shouldJump && this.currentPlatform) {
                const movingRight = dx > 0;
                const edgeThreshold = 50;
                
                if (movingRight) {
                    // Check if near right edge of platform
                    const distToRightEdge = (this.currentPlatform.x + this.currentPlatform.width) - (this.x + this.width);
                    if (distToRightEdge < edgeThreshold && distToRightEdge > 0) {
                        // Check if there's a platform to jump to
                        for (let platform of platforms) {
                            if (platform !== this.currentPlatform &&
                                platform.x > this.x && platform.x < this.x + 300 &&
                                platform.y < this.y + 100 && platform.y > this.y - 200) {
                                shouldJump = true;
                                break;
                            }
                        }
                        // Jump anyway if player is ahead
                        if (dx > 50) shouldJump = true;
                    }
                } else {
                    // Check if near left edge of platform
                    const distToLeftEdge = this.x - this.currentPlatform.x;
                    if (distToLeftEdge < edgeThreshold && distToLeftEdge > 0) {
                        // Check if there's a platform to jump to
                        for (let platform of platforms) {
                            if (platform !== this.currentPlatform &&
                                platform.x + platform.width < this.x && platform.x + platform.width > this.x - 300 &&
                                platform.y < this.y + 100 && platform.y > this.y - 200) {
                                shouldJump = true;
                                break;
                            }
                        }
                        // Jump anyway if player is behind
                        if (dx < -50) shouldJump = true;
                    }
                }
            }
            
            // 3. Jump if there's a platform blocking us horizontally
            if (!shouldJump) {
                for (let platform of platforms) {
                    const blockingRight = dx > 0 && platform.x > this.x && platform.x < this.x + 60 &&
                                         platform.y < this.y + this.height && platform.y + platform.height > this.y;
                    const blockingLeft = dx < 0 && platform.x + platform.width < this.x + this.width && 
                                        platform.x + platform.width > this.x - 30 &&
                                        platform.y < this.y + this.height && platform.y + platform.height > this.y;
                    if (blockingRight || blockingLeft) {
                        shouldJump = true;
                        break;
                    }
                }
            }
            
            if (shouldJump) {
                this.vy = CONFIG.JUMP_STRENGTH;
                this.onGround = false;
                this.jumpCooldown = 12;
            }
        }

        if (this.jumpCooldown > 0) this.jumpCooldown--;

        // Apply gravity
        this.vy += CONFIG.GRAVITY;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Platform collision
        this.onGround = false;
        this.currentPlatform = null;
        for (let platform of platforms) {
            if (this.checkCollision(platform)) {
                // Landing on top
                if (this.vy > 0 && this.y - this.height < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    this.currentPlatform = platform;
                }
                // Hitting from below
                else if (this.vy < 0 && this.y > platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Side collisions - jump over instead of stopping
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
            // Teleport to player's platform instead of respawning at start
            this.x = player.x - 100;
            this.y = player.y - 50;
            this.vx = 0;
            this.vy = 0;
        }

        // Limit fall speed
        if (this.vy > 20) this.vy = 20;

        // Check if caught player
        if (this.checkCollision(player)) {
            if (onCaught) {
                onCaught();
            }
        }
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
        
        // Draw bot (red rounded rectangle with angry face)
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
        
        // Angry face
        ctx.fillStyle = 'white';
        ctx.fillRect(6, 10, 6, 6);
        ctx.fillRect(18, 10, 6, 6);
        ctx.beginPath();
        ctx.moveTo(8, 28);
        ctx.lineTo(22, 28);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
}

