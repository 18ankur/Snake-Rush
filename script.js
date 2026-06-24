const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Smaller box for mobile
const box = window.innerWidth < 600 ? 20 : 25;

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

// Responsive canvas
function resizeCanvas() {
    let size;

    if (window.innerWidth < 600) {
        size = window.innerWidth - 20;
    } else {
        size = 500;
    }

    canvas.width = size;
    canvas.height = size;
}

// Mobile speed balance
function setGameSpeed() {
    if (window.innerWidth < 600) {
        speed = 180;
    } else {
        speed = 120;
    }
}

// Initialize game
function initGame() {
    resizeCanvas();

    snake = [{ x: box * 5, y: box * 5 }];
    food = randomFood();
    direction = "RIGHT";
    score = 0;
    level = 1;
    obstacles = [];

    setGameSpeed();

    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
    document.getElementById("gameOver").style.display = "none";

    generateObstacles();
}

// Random food
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

        if (
            obstacle.x === snake[0].x &&
            obstacle.y === snake[0].y
        ) {
            i--;
            continue;
        }

        obstacles.push(obstacle);
    }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Touch swipe controls
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

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
        else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
    } else {
        if (dy > 0 && direction !== "UP") direction = "DOWN";
        else if (dy < 0 && direction !== "DOWN") direction = "UP";
    }
});

// Collision check
function collision(head, body) {
    for (let i = 0; i < body.length; i++) {
        if (head.x === body[i].x && head.y === body[i].y) {
            return true;
        }
    }
    return false;
}

// Draw rounded block
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

    // Food glow
    ctx.shadowColor = "red";
    ctx.shadowBlur = 20;
    drawRoundedRect(food.x, food.y, box, box, 8, "red");
    ctx.shadowBlur = 0;

    // Obstacles
    obstacles.forEach((obs) => {
        drawRoundedRect(obs.x, obs.y, box, box, 8, "purple");
    });

    // Snake
    for (let i = 0; i < snake.length; i++) {
        let green = Math.max(80, 255 - i * 12);
        let color = i === 0 ? "#00ff88" : `rgb(0,${green},100)`;

        drawRoundedRect(
            snake[i].x,
            snake[i].y,
            box,
            box,
            8,
            color
        );
    }

    let headX = snake[0].x;
    let headY = snake[0].y;

    // Movement
    if (direction === "UP") headY -= box;
    if (direction === "DOWN") headY += box;
    if (direction === "LEFT") headX -= box;
    if (direction === "RIGHT") headX += box;

    const newHead = { x: headX, y: headY };

    // Obstacle collision
    const obstacleHit = obstacles.some(
        (obs) => obs.x === headX && obs.y === headY
    );

    // Game over
    if (
        headX < 0 ||
        headY < 0 ||
        headX >= canvas.width ||
        headY >= canvas.height ||
        collision(newHead, snake) ||
        obstacleHit
    ) {
        clearInterval(game);

        document.getElementById("finalScore").innerText = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }

        document.getElementById("highScore").innerText = highScore;
        document.getElementById("gameOver").style.display = "block";

        return;
    }

    // Food eaten
    if (headX === food.x && headY === food.y) {
        score++;
        document.getElementById("score").innerText = score;

        food = randomFood();

        // Level up
        if (score % 5 === 0) {
            level++;

            if (window.innerWidth < 600) {
                speed = Math.max(100, speed - 5);
            } else {
                speed = Math.max(50, speed - 10);
            }

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

// Restart
function restartGame() {
    clearInterval(game);
    initGame();
    game = setInterval(drawGame, speed);
}

// Resize support
window.onload = () => {
    initGame();
    game = setInterval(drawGame, speed);
};

window.onresize = resizeCanvas;