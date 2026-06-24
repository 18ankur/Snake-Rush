const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
    const size = Math.min(window.innerWidth * 0.9, 500);
    canvas.width = size;
    canvas.height = size;
}
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

const box = 25;

let snake;
let food;
let direction;
let score;
let level;
let speed;
let game;
let obstacles = [];

let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

// Initialize game
function initGame() {
    snake = [{ x: 250, y: 250 }];
    food = randomFood();
    direction = "RIGHT";
    score = 0;
    level = 1;
    speed = 120;
    obstacles = [];

    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
    document.getElementById("gameOver").style.display = "none";

    generateObstacles();
}

// Generate random food
function randomFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
}

// Generate obstacles
function generateObstacles() {
    obstacles = [];

    for (let i = 0; i < level; i++) {
        let obstacle = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };

        // Prevent obstacle spawning on snake head
        if (obstacle.x === snake[0].x && obstacle.y === snake[0].y) {
            i--;
            continue;
        }

        obstacles.push(obstacle);
    }
}

// Controls
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", (e) => {
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if(Math.abs(dx) > Math.abs(dy)){
        if(dx > 0 && direction !== "LEFT") direction = "RIGHT";
        else if(dx < 0 && direction !== "RIGHT") direction = "LEFT";
    } else {
        if(dy > 0 && direction !== "UP") direction = "DOWN";
        else if(dy < 0 && direction !== "DOWN") direction = "UP";
    }
});

// Snake self-collision
function collision(head, body) {
    for (let i = 0; i < body.length; i++) {
        if (head.x === body[i].x && head.y === body[i].y) {
            return true;
        }
    }
    return false;
}

// Draw rounded blocks
function drawRoundedRect(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
}

// Main game loop
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    for (let i = 0; i < canvas.width; i += box) {
        for (let j = 0; j < canvas.height; j += box) {
            ctx.strokeStyle = "rgba(255,255,255,0.05)";
            ctx.strokeRect(i, j, box, box);
        }
    }

    // Draw glowing food
    ctx.shadowColor = "red";
    ctx.shadowBlur = 20;
    drawRoundedRect(food.x, food.y, box, box, 8, "red");
    ctx.shadowBlur = 0;

    // Draw obstacles
    obstacles.forEach((obs) => {
        drawRoundedRect(obs.x, obs.y, box, box, 8, "purple");
    });

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        let green = Math.max(80, 255 - i * 12);
        let color = i === 0 ? "#00ff88" : `rgb(0,${green},100)`;

        drawRoundedRect(snake[i].x, snake[i].y, box, box, 8, color);
    }

    let headX = snake[0].x;
    let headY = snake[0].y;

    // Move snake
    if (direction === "UP") headY -= box;
    if (direction === "DOWN") headY += box;
    if (direction === "LEFT") headX -= box;
    if (direction === "RIGHT") headX += box;

    const newHead = { x: headX, y: headY };

    // Obstacle collision
    const obstacleHit = obstacles.some(
        (obs) => obs.x === headX && obs.y === headY
    );

    // Game over conditions
    if (
        headX < 0 ||
        headY < 0 ||
        headX >= canvas.width ||
        headY >= canvas.height ||
        collision(newHead, snake) ||
        obstacleHit
    ) {
        clearInterval(game);

        // Final score display
        document.getElementById("finalScore").innerText = score;

        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }

        // Refresh UI
        document.getElementById("highScore").innerText = highScore;

        // Show popup
        document.getElementById("gameOver").style.display = "block";

        return;
    }

    // Eat food
    if (headX === food.x && headY === food.y) {
        score++;
        document.getElementById("score").innerText = score;

        food = randomFood();

        // Level up every 5 points
        if (score % 5 === 0) {
            level++;
            speed = Math.max(50, speed - 10);

            document.getElementById("level").innerText = level;

            generateObstacles();

            clearInterval(game);
            game = setInterval(drawGame, speed);
        }
    } else {
        snake.pop();
    }

    snake.unshift(newHead);
}

// Restart game
function restartGame() {
    clearInterval(game);
    initGame();
    game = setInterval(drawGame, speed);
}

// Start game
initGame();
game = setInterval(drawGame, speed);