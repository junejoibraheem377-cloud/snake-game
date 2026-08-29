const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');
const aliveCountEl = document.getElementById('aliveCount');
const leaderboardEl = document.getElementById('leaderboard');

// ---- CONFIG ----
const WORLD_W = 4000, WORLD_H = 4000;
const BOT_COUNT = 19;
const FOOD_COUNT = 220;
const SPEED = 4;
const SEG_SPACING_TICKS = 3;
const MAX_RADIUS = 22;
const TURN_RATE = 0.08;
const TICK_MS = 30;

const FRUIT_TYPES = [
  { color: '#ef4444', points: 1, r: 5 },
  { color: '#facc15', points: 3, r: 7 },
  { color: '#ec4899', points: 5, r: 9 }
];
const SNAKE_COLORS = ['#38bdf8','#fb923c','#a78bfa','#f472b6','#34d399','#f87171','#fbbf24','#60a5fa','#c084fc','#4ade80'];

let snakes = [], foods = [];
let pointer = { x: 0, y: 0, active: false };
let running = false;
let gameLoop = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function rand(min, max) { return Math.random() * (max - min) + min; }

function createSnake(x, y, color, isPlayer) {
  return {
    x, y,
    angle: rand(0, Math.PI * 2),
    targetAngle: rand(0, Math.PI * 2),
    trail: [{ x, y }],
    score: isPlayer ? 0 : Math.floor(rand(0, 15)),
    radius: 9,
    color,
    isPlayer,
    alive: true,
    botTurnTimer: 0
  };
}

function segmentCount(snake) {
  return Math.min(80, 6 + Math.floor(snake.score / 2));
}

function spawnFood() {
  const type = FRUIT_TYPES[Math.floor(rand(0, FRUIT_TYPES.length))];
  foods.push({
    x: rand(40, WORLD_W - 40),
    y: rand(40, WORLD_H - 40),
    type
  });
}

function dropFoodFromSnake(snake) {
  const segs = getSegments(snake);
  segs.forEach((s, i) => {
    if (i % 3 === 0) {
      foods.push({ x: s.x, y: s.y, type: FRUIT_TYPES[0] });
    }
  });
}

function initGame() {
  snakes = [];
  foods = [];
  running = true;
  score = 0;

  const player = createSnake(WORLD_W / 2, WORLD_H / 2, '#4ade80', true);
  snakes.push(player);

  for (let i = 0; i < BOT_COUNT; i++) {
    const bx = rand(200, WORLD_W - 200);
    const by = rand(200, WORLD_H - 200);
    const color = SNAKE_COLORS[i % SNAKE_COLORS.length];
    snakes.push(createSnake(bx, by, color, false));
  }

  for (let i = 0; i < FOOD_COUNT; i++) spawnFood();

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(tick, TICK_MS);
}

function getPlayer() {
  return snakes.find(s => s.isPlayer);
}

function getSegments(snake) {
  const count = segmentCount(snake);
  const segs = [];
  for (let i = 0; i < count; i++) {
    const idx = i * SEG_SPACING_TICKS;
    const p = snake.trail[Math.min(idx, snake.trail.length - 1)];
    segs.push(p || { x: snake.x, y: snake.y });
  }
  return segs;
}

function angleDiff(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function moveSnake(snake) {
  if (!snake.alive) return;

  if (snake.isPlayer) {
    if (pointer.active) {
      const dx = pointer.x - canvas.width / 2;
      const dy = pointer.y - canvas.height / 2;
      snake.targetAngle = Math.atan2(dy, dx);
    }
  } else {
    snake.botTurnTimer -= 1;
    if (snake.botTurnTimer <= 0) {
      snake.targetAngle = rand(0, Math.PI * 2);
      snake.botTurnTimer = rand(40, 120);
    }
    const margin = 250;
    if (snake.x < margin) snake.targetAngle = 0;
    if (snake.x > WORLD_W - margin) snake.targetAngle = Math.PI;
    if (snake.y < margin) snake.targetAngle = Math.PI / 2;
    if (snake.y > WORLD_H - margin) snake.targetAngle = -Math.PI / 2;
  }

  const diff = angleDiff(snake.angle, snake.targetAngle);
  snake.angle += diff * TURN_RATE;

  snake.x += Math.cos(snake.angle) * SPEED;
  snake.y += Math.sin(snake.angle) * SPEED;

  snake.x = Math.max(10, Math.min(WORLD_W - 10, snake.x));
  snake.y = Math.max(10, Math.min(WORLD_H - 10, snake.y));

  snake.radius = Math.min(MAX_RADIUS, 8 + Math.floor(snake.score / 6));

  snake.trail.unshift({ x: snake.x, y: snake.y });
  const maxTrail = segmentCount(snake) * SEG_SPACING_TICKS + 5;
  if (snake.trail.length > maxTrail) snake.trail.length = maxTrail;
}

function checkFoodCollision(snake) {
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    const dist = Math.hypot(snake.x - f.x, snake.y - f.y);
    if (dist < snake.radius + f.type.r) {
      snake.score += f.type.points;
      foods.splice(i, 1);
      spawnFood();
      if (snake.isPlayer) scoreEl.textContent = snake.score;
    }
  }
}

function checkSnakeCollisions() {
  snakes.forEach(a => {
    if (!a.alive) return;
    snakes.forEach(b => {
      if (a === b || !b.alive) return;
      const segs = getSegments(b);
      for (let i = 2; i < segs.length; i++) {
        const dist = Math.hypot(a.x - segs[i].x, a.y - segs[i].y);
        if (dist < a.radius * 0.7 + b.radius * 0.7) {
          a.alive = false;
          dropFoodFromSnake(a);
          if (a.isPlayer) endGame();
          break;
        }
      }
    });
  });

  snakes = snakes.filter(s => s.alive || s.isPlayer);

  const aliveBots = snakes.filter(s => !s.isPlayer && s.alive).length;
  while (aliveBots + snakes.filter(s => !s.isPlayer && s.alive).length < BOT_COUNT) break;

  while (snakes.filter(s => !s.isPlayer).length < BOT_COUNT) {
    const bx = rand(200, WORLD_W - 200);
    const by = rand(200, WORLD_H - 200);
    const color = SNAKE_COLORS[Math.floor(rand(0, SNAKE_COLORS.length))];
    snakes.push(createSnake(bx, by, color, false));
  }

  aliveCountEl.textContent = snakes.filter(s => s.alive).length;
}

function tick() {
  if (!running) return;
  snakes.forEach(s => {
    if (s.alive) {
      moveSnake(s);
      checkFoodCollision(s);
    }
  });
  checkSnakeCollisions();
  draw();
  updateLeaderboard();
}

function draw() {
  const player = getPlayer();
  const camX = player.x - canvas.width / 2;
  const camY = player.y - canvas.height / 2;

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1;
  const gridSize = 100;
  for (let x = -(camX % gridSize); x < canvas.width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = -(camY % gridSize); y < canvas.height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.strokeRect(-camX, -camY, WORLD_W, WORLD_H);

  foods.forEach(f => {
    const sx = f.x - camX, sy = f.y - camY;
    if (sx < -20 || sx > canvas.width + 20 || sy < -20 || sy > canvas.height + 20) return;
    ctx.beginPath();
    ctx.arc(sx, sy, f.type.r, 0, Math.PI * 2);
    ctx.fillStyle = f.type.color;
    ctx.fill();
  });

  snakes.forEach(s => {
    if (!s.alive) return;
    const segs = getSegments(s);
    for (let i = segs.length - 1; i >= 0; i--) {
      const sx = segs[i].x - camX, sy = segs[i].y - camY;
      ctx.beginPath();
      ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? s.color : shade(s.color);
      ctx.fill();
    }
    const headX = s.x - camX, headY = s.y - camY;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + Math.cos(s.angle) * s.radius * 0.5, headY + Math.sin(s.angle) * s.radius * 0.5, s.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  });
}

function shade(color) {
  return color + 'cc';
}

function updateLeaderboard() {
  const sorted = [...snakes].filter(s => s.alive).sort((a, b) => b.score - a.score).slice(0, 5);
  leaderboardEl.innerHTML = sorted.map((s, i) =>
    `<div class="${s.isPlayer ? 'me' : ''}">${i + 1}. ${s.isPlayer ? 'You' : 'Bot'} — ${s.score}</div>`
  ).join('');
}

function endGame() {
  running = false;
  clearInterval(gameLoop);
  const player = getPlayer();
  overlayTitle.textContent = 'Game Over!';
  overlayText.textContent = `Score: ${player.score}`;
  startBtn.textContent = 'Play Again';
  overlay.style.display = 'flex';
}

// Touch controls
canvas.addEventListener('touchstart', (e) => {
  pointer.active = true;
  pointer.x = e.touches[0].clientX;
  pointer.y = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  pointer.x = e.touches[0].clientX;
  pointer.y = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', () => {
  pointer.active = false;
}, { passive: true });

// Mouse controls (desktop testing)
canvas.addEventListener('mousemove', (e) => {
  pointer.active = true;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});

startBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
  overlayTitle.textContent = 'Snake Arena';
  overlayText.textContent = 'Finger se drag karke direction do — 19 bots se bachte hue bado!';
  initGame();
});
