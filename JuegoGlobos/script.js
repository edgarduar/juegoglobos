const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let balloons = [];
let score = 0;
let level = 1;
let balloonSpeed = 1;
let spawnRate = 2000; 
let lastLevelUpTime = Date.now();
let gameRunning = true;

// Cargar imágenes de globos según el nivel
const balloonImages = [
    'globo.jpg', // Nivel 1
    'globor.jpg', // Nivel 2
    'globoa.jpg', // Nivel 3
    'globon.jpg', // Nivel 4
    'globov.jpg'  // Nivel 5+
];

const loadedImages = balloonImages.map(src => {
    let img = new Image();
    img.src = src;
    return img;
});

class Balloon {
    constructor(x, y, radius, speed, img) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.img = img;
    }

    move() {
        this.y -= this.speed;
    }

    draw() {
        if (this.img.complete && this.img.naturalWidth !== 0) {
            ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = "red"; 
            ctx.fill();
            ctx.stroke();
        }
    }
}

function spawnBalloon() {
    if (!gameRunning) return;
    let x = Math.random() * (canvas.width - 40) + 20;
    let radius = 20;
    let speed = balloonSpeed;
    
    // Determinar qué imagen de globo usar según el nivel
    let imgIndex = Math.min(level - 1, loadedImages.length - 1);
    let img = loadedImages[imgIndex];

    balloons.push(new Balloon(x, canvas.height - radius, radius, speed, img));
}

function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    balloons.forEach((balloon, index) => {
        balloon.move();
        balloon.draw();
        if (balloon.y + balloon.radius < 0) {
            balloons.splice(index, 1);
        }
    });

    // Mostrar puntaje y nivel
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Puntaje: ${score}`, 10, 30);
    ctx.fillText(`Nivel: ${level}`, 10, 60);

    // Comprobar si ha pasado 1 minuto sin subir de nivel
    if (Date.now() - lastLevelUpTime > 60000) {
        endGame();
        return;
    }

    requestAnimationFrame(update);
}

canvas.addEventListener("click", function(event) {
    let clickX = event.offsetX;
    let clickY = event.offsetY;
    
    balloons.forEach((balloon, index) => {
        let dist = Math.sqrt((clickX - balloon.x) ** 2 + (clickY - balloon.y) ** 2);
        if (dist < balloon.radius) {
            balloons.splice(index, 1);
            score++;
            
            if (score % 10 === 0) { // Subir de nivel cada 10 puntos
                level++;
                balloonSpeed += 0.5;
                spawnRate = Math.max(500, spawnRate - 200);
                clearInterval(spawnInterval);
                spawnInterval = setInterval(spawnBalloon, spawnRate);
                lastLevelUpTime = Date.now();
            }
        }
    });
});

function endGame() {
    gameRunning = false;
    clearInterval(spawnInterval);
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("¡Juego Terminado!", canvas.width / 2 - 150, canvas.height / 2 - 20);
    ctx.fillText(`Puntaje Final: ${score}`, canvas.width / 2 - 100, canvas.height / 2 + 30);
}

update();
let spawnInterval = setInterval(spawnBalloon, spawnRate);
