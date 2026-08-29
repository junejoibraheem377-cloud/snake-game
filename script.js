const GRID_SIZE = 16;
const CELL = 20;
const board = document.getElementById('board');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const statusEl = document.getElementById('status');

board.style.width = (GRID_SIZE * CELL) + 'px';
board.style.height = (GRID_SIZE * CELL) + 'px';

let snake, dir, nextDir, food, walls, score, highScore, running, loop;
highScore = 0;

const FRUIT_TYPES = [
  { type: 'apple', points: 1, weight: 60 },
  { type: 'banana', points: 3, weight: 30 },
  { type: 'cherry', points: 5, weight: 10 }
];

function pickFruitType() {
  const total = FRUIT_TYPES.reduce((a, f) => a + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FRUIT_TYPES) {
    if (r < f.weight) return f;
    r -= f.weight;
  }
  return FRUIT_TYPES[0];
}

function generateWalls() {
  const w = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    w.push({ x, y: 0 });
    w.push({ x, y: GRID_SIZE - 1 });
  }
  for (let y = 0; y < GRID_SIZE; y++) {
    w.push({ x: 0, y });
    w.push({ x: GRID_SIZE - 1, y });
  }
  for (let x = 6; x <= 9; x++) w.push({ x, y: 5 });
  for (let x = 6; x <= 9; x++) w.push({ x, y: 10 });
  return w;
}

function isBlocked(pos, snakeArr) {
  return walls.some(w => w.x === pos.x && w.y === pos.y) ||
         snakeArr.some(s => s.x === pos.x && s.y === pos.y);
}

function randomFood(snakeArr) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (isBlocked(pos, snakeArr));
  const fruit = pickFruitType();
  return { ...pos, type: fruit.type, points: fruit.points };
}

function render() {
  board.querySelectorAll('.snake-head, .snake-body, .fruit, .eye, .tongue, .wall').forEach(el => el.remove());

  walls.forEach(w => {
    const el = document.createElement('div');
    el.className = 'wall';
    el.style.width = (CELL - 1) + 'px';
    el.style.height = (CELL - 1) + 'px';
    el.style.left = (w.x * CELL) + 'px';
    el.style.top = (w.y * CELL) + 'px';
    board.appendChild(el);
  });

  snake.forEach((s, i) => {
    const el = document.createElement('div');
    el.style.width = (CELL - 2) + 'px';
    el.style.height = (CELL - 2) + 'px';
    el.style.left = (s.x * CELL + 1) + 'px';
    el.style.top = (s.y * CELL + 1) + 'px';

    if (i === 0) {
      el.className = 'snake-head';
      const eye1 = document.createElement('div');
      const eye2 = document.createElement('div');
      eye1.className = 'eye';
      eye2.className = 'eye';
      const tongue = document.createElement('div');
      tongue.className = 'tongue';

      if (dir.x === 1) {
        eye1.style.left = '11px'; eye1.style.top = '4px';
        eye2.style.left = '11px'; eye2.style.top = '11px';
        tongue.style.left = '17px'; tongue.style.top = '7px';
        tongue.style.transform = 'rotate(90deg)';
      } else if (dir.x === -1) {
        eye1.style.left = '3px'; eye1.style.top = '4px';
        eye2.style.left = '3px'; eye2.style.top = '11px';
        tongue.style.left = '-3px'; tongue.style.top = '7px';
        tongue.style.transform = 'rotate(90deg)';
      } else if (dir.y === -1) {
        eye1.style.left = '4px'; eye1.style.top = '3px';
        eye2.style.left = '11px'; eye2.style.top = '3px';
        tongue.style.left = '7px'; tongue.style.top = '-4px';
      } else {
        eye1.style.left = '4px'; eye1.style.top = '11px';
        eye2.style.left = '11px'; eye2.style.top = '11px';
        tongue.style.left = '7px'; tongue.style.top = '16px';
      }

      el.appendChild(eye1);
      el.appendChild(eye2);
      el.appendChild(tongue);
    } else {
      el.className = 'snake-body';
    }

    board.appendChild(el);
  });

  const foodEl = document.createElement('div');
  foodEl.className = 'fruit ' + food.type;
  foodEl.style.width = (CELL - 4) + 'px';
  foodEl.style.height = (CELL - 4) + 'px';
  foodEl.style.left = (food.x * CELL + 2) + 'px';
  foodEl.style.top = (food.y * CELL + 2) + 'px';
  board.appendChild(foodEl);

  statusEl.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function setDirection(nx, ny) {
  if (dir.x === -nx && dir.y === -ny) return;
  nextDir = { x: nx, y: ny };
}

function tick() {
  dir = nextDir;
  const head = snake[0];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  if (walls.some(w => w.x === newHead.x && w.y === newHead.y)) {
    return endGame();
  }
  if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
    return endGame();
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += food.points;
    if (score > highScore) highScore = score;
    food = randomFood(snake);
  } else {
    snake.pop();
  }

  render();
}

function endGame() {
  running = false;
  clearInterval(loop);
  overlay.classList.remove('hidden');
  overlay.innerHTML = `<div id="gameOverText">Game Over!</div><button class="action" id="startBtn2">Play Again</button>`;
  document.getElementById('startBtn2').addEventListener('click', startGame);
}

function startGame() {
  walls = generateWalls();
  snake = [{ x: 8, y: 8 }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  food = randomFood(snake);
  score = 0;
  running = true;
  overlay.classList.add('hidden');
  render();
  clearInterval(loop);
  loop = setInterval(tick, 140);
}

startBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': setDirection(0, -1); break;
    case 'ArrowDown': case 's': case 'S': setDirection(0, 1); break;
    case 'ArrowLeft': case 'a': case 'A': setDirection(-1, 0); break;
    case 'ArrowRight': case 'd': case 'D': setDirection(1, 0); break;
  }
});

document.getElementById('up').addEventListener('click', () => setDirection(0, -1));
document.getElementById('down').addEventListener('click', () => setDirection(0, 1));
document.getElementById('left').addEventListener('click', () => setDirection(-1, 0));
document.getElementById('right').addEventListener('click', () => setDirection(1, 0));

walls = generateWalls();
snake = [{ x: 8, y: 8 }];
food = randomFood(snake);
score = 0;
render();
