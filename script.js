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
let score = 0;

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
      snake.tar
