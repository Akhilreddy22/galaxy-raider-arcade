// Galaxy Raider - Main Game Controller

class GalaxyRaiderGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.width = 600;
    this.height = 800;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.starfield = new Starfield(this.width, this.height);
    this.player = new Player(this.width / 2, this.height - 80);

    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('galaxy_raider_hi') || '0', 10);
    this.wave = 1;
    this.bombs = 2;
    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'

    this.keys = {};
    this.waveTimer = 0;
    this.enemiesRemainingInWave = 0;
    this.screenShake = 0;

    this.setupInputs();
    this.updateHUD();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'KeyP') {
        this.togglePause();
      }
      if (e.code === 'KeyB') {
        this.useBomb();
      }
      if (e.code === 'Space') {
        if (this.state === 'START' || this.state === 'GAMEOVER') {
          this.startGame();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mobile / Touch controls
    let touchX = null;
    let touchY = null;
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.soundFX.init();
      if (this.state === 'START' || this.state === 'GAMEOVER') {
        this.startGame();
        return;
      }
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      touchX = (touch.clientX - rect.left) * (this.width / rect.width);
      touchY = (touch.clientY - rect.top) * (this.height / rect.height);
      this.keys['Space'] = true;
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const nextX = (touch.clientX - rect.left) * (this.width / rect.width);
      const nextY = (touch.clientY - rect.top) * (this.height / rect.height);
      if (touchX !== null) {
        this.player.x += (nextX - touchX) * 1.4;
        this.player.y += (nextY - touchY) * 1.4;
        this.player.x = Math.max(20, Math.min(this.width - 20, this.player.x));
        this.player.y = Math.max(30, Math.min(this.height - 30, this.player.y));
      }
      touchX = nextX;
      touchY = nextY;
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      touchX = null;
      touchY = null;
    });

    // Action button listeners
    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.addEventListener('click', () => this.startGame());

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', () => this.startGame());

    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());

    const bombBtn = document.getElementById('bombBtn');
    if (bombBtn) bombBtn.addEventListener('click', () => this.useBomb());

    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) soundBtn.addEventListener('click', () => {
      window.soundFX.init();
      const on = window.soundFX.toggle();
      soundBtn.textContent = on ? '🔊 Audio: ON' : '🔇 Audio: OFF';
    });
  }

  startGame() {
    window.soundFX.init();
    this.score = 0;
    this.wave = 1;
    this.bombs = 2;
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.player.reset(this.width / 2, this.height - 80);
    this.state = 'PLAYING';
    this.startWave(this.wave);

    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');
    document.getElementById('pauseOverlay').classList.add('hidden');
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      document.getElementById('pauseOverlay').classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      document.getElementById('pauseOverlay').classList.add('hidden');
    }
  }

  startWave(w) {
    this.wave = w;
    this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 2, `WAVE ${this.wave}`, '#a855f7'));

    const isBossWave = w % 5 === 0;
    if (isBossWave) {
      this.enemies.push(new Enemy(this.width / 2, -50, 'boss', w));
      this.enemiesRemainingInWave = 0;
    } else {
      const scoutCount = 8 + w * 2;
      const cruiserCount = Math.floor(w * 1.5);
      this.enemiesRemainingInWave = scoutCount + cruiserCount;
      this.spawnTimer = 0;
    }
    this.updateHUD();
  }

  spawnEnemies() {
    if (this.enemiesRemainingInWave <= 0) return;
    this.spawnTimer = (this.spawnTimer || 0) + 1;

    if (this.spawnTimer >= 35) {
      this.spawnTimer = 0;
      const type = Math.random() < 0.35 && this.wave >= 2 ? 'cruiser' : 'scout';
      const x = 50 + Math.random() * (this.width - 100);
      this.enemies.push(new Enemy(x, -30, type, this.wave));
      this.enemiesRemainingInWave--;
    }
  }

  useBomb() {
    if (this.state !== 'PLAYING' || this.bombs <= 0) return;
    this.bombs--;
    window.soundFX.playExplosion(true);
    this.screenShake = 16;

    // Flash particles & damage all enemies
    for (let i = 0; i < 40; i++) {
      this.particles.push(new Particle(Math.random() * this.width, Math.random() * this.height, '#f97316'));
    }

    for (const e of this.enemies) {
      e.health -= 150;
      if (e.health <= 0) {
        e.active = false;
        this.addScore(e.scoreVal, e.x, e.y);
      }
    }
    this.enemyBullets = []; // Vaporize enemy bullets
    this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, 'NUKE CLEARED!', '#f97316'));
    this.updateHUD();
  }

  addScore(pts, x, y) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('galaxy_raider_hi', String(this.highScore));
    }
    this.floatingTexts.push(new FloatingText(x, y, `+${pts}`, '#38bdf8'));
    this.updateHUD();
  }

  explode(x, y, color, large = false) {
    window.soundFX.playExplosion(large);
    const count = large ? 30 : 15;
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update() {
    this.starfield.update();

    if (this.screenShake > 0) this.screenShake--;

    if (this.state !== 'PLAYING') return;

    const now = performance.now();
    this.player.update(this.keys, { width: this.width, height: this.height });

    // Player Shooting (Space or Click)
    if ((this.keys['Space'] || this.keys['KeyK']) && this.player.canShoot(now)) {
      const newBullets = this.player.shoot(now);
      this.bullets.push(...newBullets);
      window.soundFX.playLaser();
    }

    // Spawn Waves
    this.spawnEnemies();
    if (this.enemies.length === 0 && this.enemiesRemainingInWave <= 0) {
      this.startWave(this.wave + 1);
    }

    // Update Bullets
    for (const b of this.bullets) {
      b.update();
      if (b.y < -10 || b.x < -10 || b.x > this.width + 10) b.active = false;
    }
    this.bullets = this.bullets.filter((b) => b.active);

    // Update Enemy Bullets
    for (const eb of this.enemyBullets) {
      eb.update();
      if (eb.y > this.height + 10) eb.active = false;

      // Hit Player
      const dist = Math.hypot(eb.x - this.player.x, eb.y - this.player.y);
      if (dist < 20) {
        eb.active = false;
        this.damagePlayer(15);
      }
    }
    this.enemyBullets = this.enemyBullets.filter((eb) => eb.active);

    // Update Enemies
    for (const e of this.enemies) {
      e.update({ width: this.width, height: this.height });

      if (e.y > this.height + 50) {
        e.active = false;
      }

      if (e.canShoot()) {
        this.enemyBullets.push(...e.createBullets());
      }

      // Enemy vs Player collision
      const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      if (dist < (e.width / 2 + this.player.width / 2)) {
        this.damagePlayer(25);
        e.health -= 50;
        if (e.health <= 0) e.active = false;
      }
    }

    // Bullet vs Enemy Collision
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (!b.active || !e.active) continue;
        const dist = Math.hypot(b.x - e.x, b.y - e.y);
        if (dist < e.width / 2 + b.radius) {
          b.active = false;
          e.health -= 1;
          this.particles.push(new Particle(b.x, b.y, b.color));
          window.soundFX.playHit();

          if (e.health <= 0) {
            e.active = false;
            const isBoss = e.type === 'boss';
            this.explode(e.x, e.y, e.color, isBoss);
            this.addScore(e.scoreVal, e.x, e.y);

            // Powerup drop chance
            if (Math.random() < 0.22 || isBoss) {
              const types = ['weapon', 'shield', 'bomb'];
              const type = types[Math.floor(Math.random() * types.length)];
              this.powerups.push(new PowerUp(e.x, e.y, type));
            }
          }
        }
      }
    }
    this.enemies = this.enemies.filter((e) => e.active);

    // Update Powerups
    for (const p of this.powerups) {
      p.update();
      if (p.y > this.height + 20) p.active = false;

      // Pickup
      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (dist < p.radius + 20) {
        p.active = false;
        window.soundFX.playPowerup();
        if (p.type === 'weapon') {
          this.player.weaponLevel = Math.min(4, this.player.weaponLevel + 1);
          this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, `WEAPON LVL ${this.player.weaponLevel}`, '#a855f7'));
        } else if (p.type === 'shield') {
          this.player.health = Math.min(100, this.player.health + 35);
          this.player.shieldActive = true;
          setTimeout(() => { this.player.shieldActive = false; }, 4000);
          this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, '+35 SHIELD', '#06b6d4'));
        } else if (p.type === 'bomb') {
          this.bombs++;
          this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, '+1 NUKE BOMB', '#f97316'));
        }
        this.updateHUD();
      }
    }
    this.powerups = this.powerups.filter((p) => p.active);

    // Update Particles
    for (const pt of this.particles) pt.update();
    this.particles = this.particles.filter((pt) => pt.active);

    // Update Floating Text
    for (const ft of this.floatingTexts) ft.update();
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.active);
  }

  damagePlayer(amt) {
    if (this.player.invulnerableTimer > 0) return;
    this.player.health -= amt;
    this.screenShake = 10;
    this.explode(this.player.x, this.player.y, '#38bdf8');
    this.player.invulnerableTimer = 40;
    this.updateHUD();

    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.state = 'GAMEOVER';
    window.soundFX.playGameOver();
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalWave').textContent = this.wave;
    document.getElementById('gameOverOverlay').classList.remove('hidden');
  }

  updateHUD() {
    const scoreEl = document.getElementById('hudScore');
    const highEl = document.getElementById('hudHighScore');
    const waveEl = document.getElementById('hudWave');
    const healthBar = document.getElementById('hudHealthBar');
    const bombCount = document.getElementById('hudBombCount');

    if (scoreEl) scoreEl.textContent = this.score;
    if (highEl) highEl.textContent = this.highScore;
    if (waveEl) waveEl.textContent = this.wave;
    if (healthBar) {
      const pct = Math.max(0, this.player.health);
      healthBar.style.width = `${pct}%`;
      if (pct > 50) healthBar.className = 'h-full bg-emerald-500 transition-all duration-300';
      else if (pct > 25) healthBar.className = 'h-full bg-amber-500 transition-all duration-300';
      else healthBar.className = 'h-full bg-rose-500 transition-all duration-300';
    }
    if (bombCount) bombCount.textContent = this.bombs;
  }

  draw() {
    this.ctx.save();

    // Screen Shake
    if (this.screenShake > 0) {
      const dx = (Math.random() - 0.5) * this.screenShake;
      const dy = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(dx, dy);
    }

    // Space background
    this.ctx.fillStyle = '#030712';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.starfield.draw(this.ctx);

    // Draw Entities
    for (const p of this.powerups) p.draw(this.ctx);
    for (const b of this.bullets) b.draw(this.ctx);
    for (const eb of this.enemyBullets) eb.draw(this.ctx);
    for (const e of this.enemies) e.draw(this.ctx);
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.player.draw(this.ctx);
    }
    for (const pt of this.particles) pt.draw(this.ctx);
    for (const ft of this.floatingTexts) ft.draw(this.ctx);

    this.ctx.restore();
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new GalaxyRaiderGame();
});
