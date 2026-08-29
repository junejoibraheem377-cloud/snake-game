const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20;
const canvasSize = canvas.width;
let snake, direction, food, score, highScore, game, speed;

highScore = 0;

function init() {
  snake = [{ x: 9 * box, y: 9 * box }];
  direction = null;
  score = 0;
  speed = 130;
  placeFood();
  document.getElementById('message').textContent = '';
  document.getElementById('restartBtn').style.display = 'none';
  updateScore();
  if (game) clearInterval(game);
  game = setInterval(draw, speed);
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box
  };
}

document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  else if (key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

function updateScore() {
  document.getElementById('scoreBoard').textContent =
    `Score: ${score} | High Score: ${highScore}`;
}

function draw() {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  ctx.fillStyle = '#f87171';
  ctx.fillRect(food.x, food.y, box, box);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = '#111827';
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  if (!direction) return;

  let head = { x: snake[0].x, y: snake[0].y };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'DOWN') head.y += box;

  if (
    head.x < 0 || head.x >= canvasSize ||
    head.y < 0 || head.y >= canvasSize ||
    collision(head, snake)
  ) {
    gameOver();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    score++;
    if (score > highScore) highScore = score;
    placeFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);
  updateScore();
}

function collision(head, array) {
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function gameOver() {
  clearInterval(game);
  document.getElementById('message').textContent =
    `Game Over! Final Score: ${score}`;
  document.getElementById('restartBtn').style.display = 'inline-block';
}

document.getElementById('restartBtn').addEventListener('click', init);

init();
