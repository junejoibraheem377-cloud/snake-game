
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
const MAX_TRAIL = 160;
const MAX_RADIUS = 22;
const TURN_RATE = 0.07;

const FRUIT_TYPES = [
  { color: '#ef4444', points: 1, r: 6 },
  { color: '#facc15', points: 3, r: 8 },
  { color: '#ec4899', points: 5, r: 10 }
];
const SNAKE_COLORS = ['#38bdf8','#fb923c','#a78bfa','#f472b6','#34d399','#f87171','#fbbf24','#60a5fa','#c084fc','#4ade80'];

let snakes = [], foods = [], pointer = { active:false, x:0, y:0 };
let player, running = false, score = 0;

function resizeCanvas() {
  canvas.width = window.innerW
