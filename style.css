const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayMsg = document.getElementById('overlayMsg');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreBox = document.getElementById('scoreBox');
const lbList = document.getElementById('lbList');

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const FOOD_COUNT = 40;
const BOT_COUNT = 4;
const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#fb7185'];

let snakes = [];
let food = [];
let running = false;
let pointer = { x: 0, y: 0, active: false };

function rand(min, max) { return Math.random() * (max - min) + min; }

function makeSnake(name, color, isPlayer) {
  return {
    name,
    color,
    isPlayer,
    alive: true,
    angle: rand(0, Math.PI * 2),
    speed: isPlayer ? 2.4 : 2,
    turnCooldown: 0,
    score: 0,
    path: [{ x: rand(100, W - 100), y: rand(100, H - 100) }],
    len: 16
  };
}

function spawnFood(n) {
  for (let i = 0; i < n; i++) {
    food.push({
      x: rand(20, W - 20),
      y: rand(20, H - 20),
      r: rand(3, 5),
      color: COLORS[Math.floor(rand(0, COLORS.length))]
    });
  }
}

function resetGame() {
  snakes = [];
  food = [];
  const player = makeSnake('You', '#34d399', true);
  snakes.push(player);
  for (let i = 0; i < BOT_COUNT; i++) {
    snakes.push(makeSnake('Bot' + (i + 1), COLORS[i % COLORS.length], false));
  }
  spawnFood(FOOD_COUNT);
}

function head(s) { return s.path[0]; }

function updateSnake(s) {
  if (!s.alive) return;
  const h = head(s);

  if (s.isPlayer) {
    if (pointer.active) {
      const targetAngle = Math.atan2(pointer.y - h.y, pointer.x - h.x);
      let diff = targetAngle - s.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      s.angle += diff * 0.15;
    }
  } else {
    s.turnCooldown -= 1;
    if (s.turnCooldown <= 0) {
      s.angle += rand(-0.6, 0.6);
      s.turnCooldown = rand(20, 60);
    }
    const margin = 60;
    if (h.x < margin) s.angle = 0;
    if (h.x > W - margin) s.angle = Math.PI;
    if (h.y < margin) s.angle = Math.PI / 2;
    if (h.y > H - margin) s.angle = -Math.PI / 2;
  }

  const nx = h.x + Math.cos(s.angle) * s.speed;
  const ny = h.y + Math.sin(s.angle) * s.speed;

  if (s.isPlayer) {
    if (nx < 8 || nx > W - 8 || ny < 8 || ny > H - 8) {
      return killSnake(s);
    }
  } else {
    if (nx < 0 || nx > W || ny < 0 || ny > H) {
      s.angle += Math.PI;
      return;
    }
  }

  s.path.unshift({ x: nx, y: ny });
  const maxPoints = s.len * 4;
  if (s.path.length > maxPoints) s.path.length = maxPoints;

  for (let i = food.length - 1; i >= 0; i--) {
    const f = food[i];
    if (Math.hypot(f.x - nx, f.y - ny) < 10) {
      food.splice(i, 1);
      s.len += 1;
      s.score += 1;
      spawnFood(1);
    }
  }
}

function checkCollisions() {
  for (const a of snakes) {
    if (!a.alive) continue;
    const h = head(a);
    for (const b of snakes) {
      if (a === b || !b.alive) continue;
      for (let i = 4; i < b.path.length; i += 2) {
        const p = b.path[i];
        if (Math.hypot(p.x - h.x, p.y - h.y) < 9) {
          killSnake(a);
          break;
        }
      }
      if (!a.alive) break;
    }
  }
}

function killSnake(s) {
  if (!s.alive) return;
  s.alive = false;
  for (let i = 0; i < s.path.length; i += 6) {
    food.push({ x: s.path[i].x, y: s.path[i].y, r: rand(3, 5), color: s.color });
  }
  if (s.isPlayer) {
    endGame();
  } else {
    setTimeout(() => respawnBot(s), 1500);
  }
}

function respawnBot(s) {
  const idx = snakes.indexOf(s);
  if (idx === -1) return;
  snakes[idx] = makeSnake(s.name, s.color, false);
}

function drawSnake(s) {
  if (!s.alive) return;
  for (let i = s.path.length - 1; i >= 0; i--) {
    const p = s.path[i];
    const t = 1 - i / s.path.length;
    const radius = 6 + t * 3;
    ctx.beginPath();
    ctx.fillStyle = s.color;
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  const h = head(s);
  const eyeOffset = 4;
  const ex = Math.cos(s.angle + Math.PI / 2) * eyeOffset;
  const ey = Math.sin(s.angle + Math.PI / 2) * eyeOffset;
  const fx = Math.cos(s.angle) * 5;
  const fy = Math.sin(s.angle) * 5;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(h.x + fx + ex, h.y + fy + ey, 2, 0, Math.PI * 2);
  ctx.arc(h.x + fx - ex, h.y + fy - ey, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawFood() {
  for (const f of food) {
    ctx.beginPath();
    ctx.fillStyle = f.color;
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateUI() {
  const player = snakes.find(s => s.isPlayer);
  scoreBox.textContent = player ? player.score : 0;

  const ranked = [...snakes].sort((a, b) => b.score - a.score).slice(0, 6);
  lbList.innerHTML = '';
  ranked.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.name}: ${s.score}`;
    if (s.isPlayer) li.className = 'me';
    lbList.appendChild(li);
  });
}

function loop() {
  if (!running) return;
  ctx.clearRect(0, 0, W, H);
  drawFood();
  for (const s of snakes) updateSnake(s);
  checkCollisions();
  for (const s of snakes) drawSnake(s);
  updateUI();
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  const player = snakes.find(s => s.isPlayer);
  overlayMsg.textContent = `Game Over! Score: ${player ? player.score : 0}`;
  startBtn.textContent = 'Play Again';
  overlay.classList.remove('hidden');
}

startBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  resetGame();
  running = true;
  loop();
});

restartBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  resetGame();
  running = true;
  loop();
});

function setPointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
}

canvas.addEventListener('mousemove', e => setPointer(e.clientX, e.clientY));
canvas.addEventListener('touchstart', e => {
  const t = e.touches[0];
  setPointer(t.clientX, t.clientY);
}, { passive: true });
canvas.addEventListener('touchmove', e => {
  const t = e.touches[0];
  setPointer(t.clientX, t.clientY);
}, { passive: true });
