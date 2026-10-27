// Game Entities & Objects

class Starfield {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stars = [];
    this.init();
  }

  init() {
    this.stars = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() < 0.6 ? 1 : Math.random() < 0.9 ? 2 : 3,
        speed: Math.random() * 2.5 + 0.5,
        brightness: Math.random() * 0.7 + 0.3,
        color: Math.random() < 0.2 ? '#38bdf8' : Math.random() < 0.1 ? '#f43f5e' : '#ffffff'
      });
    }
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.init();
  }

  update() {
    for (const s of this.stars) {
      s.y += s.speed;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    }
  }

  draw(ctx) {
    for (const s of this.stars) {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.brightness;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1.0;
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 38;
    this.height = 42;
    this.speed = 7;
    this.maxHealth = 100;
    this.health = 100;
    this.weaponLevel = 1; // 1 to 4
    this.lastShotTime = 0;
    this.fireRate = 140; // ms
    this.shieldActive = false;
    this.invulnerableTimer = 0;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.health = 100;
    this.weaponLevel = 1;
    this.invulnerableTimer = 60;
  }

  update(keys, bounds) {
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;

    let moveX = 0;
    let moveY = 0;

    if (keys['ArrowLeft'] || keys['KeyA']) moveX -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) moveX += 1;
    if (keys['ArrowUp'] || keys['KeyW']) moveY -= 1;
    if (keys['ArrowDown'] || keys['KeyS']) moveY += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7071;
      moveY *= 0.7071;
    }

    this.x += moveX * this.speed;
    this.y += moveY * this.speed;

    // Boundaries
    this.x = Math.max(this.width / 2, Math.min(bounds.width - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(bounds.height - this.height / 2, this.y));
  }

  canShoot(now) {
    return now - this.lastShotTime >= this.fireRate;
  }

  shoot(now) {
    this.lastShotTime = now;
    const bullets = [];

    if (this.weaponLevel === 1) {
      bullets.push(new Bullet(this.x, this.y - 20, 0, -12, true, '#38bdf8'));
    } else if (this.weaponLevel === 2) {
      bullets.push(new Bullet(this.x - 12, this.y - 15, 0, -12, true, '#38bdf8'));
      bullets.push(new Bullet(this.x + 12, this.y - 15, 0, -12, true, '#38bdf8'));
    } else if (this.weaponLevel === 3) {
      bullets.push(new Bullet(this.x, this.y - 20, 0, -13, true, '#a855f7'));
      bullets.push(new Bullet(this.x - 14, this.y - 12, -2.5, -12, true, '#38bdf8'));
      bullets.push(new Bullet(this.x + 14, this.y - 12, 2.5, -12, true, '#38bdf8'));
    } else {
      // Level 4 Quad-Plasma
      bullets.push(new Bullet(this.x - 6, this.y - 22, -0.8, -14, true, '#ec4899'));
      bullets.push(new Bullet(this.x + 6, this.y - 22, 0.8, -14, true, '#ec4899'));
      bullets.push(new Bullet(this.x - 18, this.y - 10, -4, -12, true, '#38bdf8'));
      bullets.push(new Bullet(this.x + 18, this.y - 10, 4, -12, true, '#38bdf8'));
    }

    return bullets;
  }

  draw(ctx) {
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
      return; // Flicker
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Thruster glow
    const thrusterHeight = 12 + Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(-6, 16);
    ctx.lineTo(6, 16);
    ctx.lineTo(0, 16 + thrusterHeight);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 15;
    ctx.fill();

    // Spaceship Hull
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, -22); // Nose
    ctx.lineTo(16, 14);  // Right wing
    ctx.lineTo(6, 18);   // Right inner
    ctx.lineTo(0, 12);   // Engine center
    ctx.lineTo(-6, 18);  // Left inner
    ctx.lineTo(-16, 14); // Left wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.beginPath();
    ctx.ellipse(0, -4, 4, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Shield bubble
    if (this.shieldActive) {
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 14;
      ctx.stroke();
    }

    ctx.restore();
  }
}

class Bullet {
  constructor(x, y, vx, vy, isPlayer = true, color = '#38bdf8') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isPlayer = isPlayer;
    this.color = color;
    this.radius = isPlayer ? 4 : 5;
    this.active = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  }
}

class Enemy {
  constructor(x, y, type = 'scout', level = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.startX = x;
    this.time = Math.random() * 100;

    if (type === 'boss') {
      this.width = 90;
      this.height = 70;
      this.health = 250 + level * 60;
      this.maxHealth = this.health;
      this.speed = 1.2;
      this.scoreVal = 1000;
      this.color = '#e11d48';
      this.shootCooldown = 60;
    } else if (type === 'cruiser') {
      this.width = 44;
      this.height = 40;
      this.health = 4 + Math.floor(level * 0.8);
      this.maxHealth = this.health;
      this.speed = 2.4;
      this.scoreVal = 250;
      this.color = '#f59e0b';
      this.shootCooldown = 90;
    } else {
      // scout
      this.width = 30;
      this.height = 30;
      this.health = 1 + Math.floor(level * 0.3);
      this.maxHealth = this.health;
      this.speed = 3.2;
      this.scoreVal = 100;
      this.color = '#10b981';
      this.shootCooldown = 130;
    }
    this.shotTimer = Math.floor(Math.random() * this.shootCooldown);
  }

  update(bounds) {
    this.time += 0.05;

    if (this.type === 'boss') {
      if (this.y < 90) {
        this.y += this.speed;
      } else {
        this.x = this.startX + Math.sin(this.time * 0.6) * (bounds.width * 0.35);
      }
    } else if (this.type === 'cruiser') {
      this.y += this.speed;
      this.x = this.startX + Math.sin(this.time) * 45;
    } else {
      this.y += this.speed;
      this.x = this.startX + Math.sin(this.time * 1.5) * 60;
    }

    this.shotTimer++;
  }

  canShoot() {
    if (this.shotTimer >= this.shootCooldown) {
      this.shotTimer = 0;
      return true;
    }
    return false;
  }

  createBullets() {
    const bullets = [];
    if (this.type === 'boss') {
      bullets.push(new Bullet(this.x - 25, this.y + 25, -2, 6, false, '#f43f5e'));
      bullets.push(new Bullet(this.x, this.y + 35, 0, 7, false, '#f43f5e'));
      bullets.push(new Bullet(this.x + 25, this.y + 25, 2, 6, false, '#f43f5e'));
    } else if (this.type === 'cruiser') {
      bullets.push(new Bullet(this.x, this.y + 15, 0, 5.5, false, '#fbbf24'));
    } else {
      bullets.push(new Bullet(this.x, this.y + 12, 0, 6, false, '#34d399'));
    }
    return bullets;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    if (this.type === 'boss') {
      ctx.beginPath();
      ctx.moveTo(0, 35);
      ctx.lineTo(45, -15);
      ctx.lineTo(30, -35);
      ctx.lineTo(0, -20);
      ctx.lineTo(-30, -35);
      ctx.lineTo(-45, -15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Boss health bar
      const barW = 80;
      const barH = 5;
      const pct = Math.max(0, this.health / this.maxHealth);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-barW / 2, -45, barW, barH);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-barW / 2, -45, barW * pct, barH);

    } else if (this.type === 'cruiser') {
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(20, -15);
      ctx.lineTo(0, -8);
      ctx.lineTo(-20, -15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(14, -12);
      ctx.lineTo(0, -6);
      ctx.lineTo(-14, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'weapon', 'shield', 'bomb'
    this.radius = 14;
    this.speed = 2;
    this.active = true;
    this.time = 0;
  }

  update() {
    this.y += this.speed;
    this.time += 0.08;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const pulse = 1 + Math.sin(this.time) * 0.15;
    ctx.scale(pulse, pulse);

    const colors = {
      weapon: '#a855f7',
      shield: '#06b6d4',
      bomb: '#f97316'
    };
    const c = colors[this.type] || '#fff';

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = c;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = c;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = c;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type === 'weapon' ? 'W' : this.type === 'shield' ? 'S' : 'B', 0, 0);

    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = Math.random() * 3 + 1;
    this.alpha = 1.0;
    this.decay = Math.random() * 0.03 + 0.015;
    this.active = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    if (this.alpha <= 0) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FloatingText {
  constructor(x, y, text, color = '#38bdf8') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.alpha = 1.0;
    this.vy = -1.5;
    this.active = true;
  }

  update() {
    this.y += this.vy;
    this.alpha -= 0.02;
    if (this.alpha <= 0) this.active = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}
