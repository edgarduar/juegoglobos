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
let clicks = 0; // Contador de clics válidos para subir de nivel

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
    constructor(x, y, radius, speed, img, isScoring, direction) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.img = img;
        this.isScoring = isScoring; // Determina si este globo suma puntos o no
        this.direction = direction; // Dirección de movimiento (1 = arriba, -1 = abajo)
    }

    move() {
        this.y -= this.speed * this.direction;
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
    
    // Determinar qué imágenes de globos usar según el nivel
    let imgIndex1 = Math.min(level - 1, loadedImages.length - 1);
    let imgIndex2 = Math.min(level, loadedImages.length - 1); // Segundo tipo de globo
    let isScoring = Math.random() < 0.5;
    let img = isScoring ? loadedImages[imgIndex1] : loadedImages[imgIndex2];
    
    // Determinar si el globo sube o baja
    let direction = Math.random() < 0.5 ? 1 : -1;
    let startY = direction === 1 ? canvas.height - radius : radius;
    
    balloons.push(new Balloon(x, startY, radius, speed, img, isScoring, direction));
}

function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    balloons.forEach((balloon, index) => {
        balloon.move();
        balloon.draw();
        if ((balloon.direction === 1 && balloon.y + balloon.radius < 0) || 
            (balloon.direction === -1 && balloon.y - balloon.radius > canvas.height)) {
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
            if (balloon.isScoring) {
                score++;
                clicks++; // Contar clics solo en globos válidos
            }
            balloons.splice(index, 1);
            
            if (clicks >= 10) { // Subir de nivel cada 10 clics válidos
                level++;
                balloonSpeed += 0.5;
                spawnRate = Math.max(500, spawnRate - 200);
                clearInterval(spawnInterval);
                spawnInterval = setInterval(spawnBalloon, spawnRate);
                lastLevelUpTime = Date.now();
                clicks = 0; // Reiniciar el contador de clics
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
