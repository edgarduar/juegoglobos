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
let clicks = 0;
let missedBalloons = {};

const balloonImages = [
    'GloboCeleste.jpg',
    'GloboRojo.jpg',
    'GloboAzul.jpg',
    'GloboNaranja.jpg',
    'GloboClaro.jpg'
];

const loadedImages = balloonImages.map(src => {
    let img = new Image();
    img.src = src;
    return img;
});

class Balloon {
    constructor(x, y, radius, speed, img, isScoring, type, direction) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.img = img;
        this.isScoring = isScoring;
        this.type = type;
        this.direction = direction;
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
    
    let imgIndex1 = Math.min(level - 1, loadedImages.length - 1);
    let imgIndex2 = Math.min(level, loadedImages.length - 1);
    let isScoring = Math.random() < 0.5;
    let img = isScoring ? loadedImages[imgIndex1] : loadedImages[imgIndex2];
    let type = isScoring ? balloonImages[imgIndex1] : balloonImages[imgIndex2];
    
    let direction = Math.random() < 0.5 ? 1 : -1;
    let startY = direction === 1 ? canvas.height - radius : radius;
    
    balloons.push(new Balloon(x, startY, radius, speed, img, isScoring, type, direction));
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
            if (balloon.isScoring) {
                missedBalloons[balloon.type] = (missedBalloons[balloon.type] || 0) + 1;
            }
        }
    });

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Puntaje: ${score}`, 10, 30);
    ctx.fillText(`Nivel: ${level}`, 10, 60);
    ctx.fillText(`Globos perdidos: ${Object.values(missedBalloons).reduce((a, b) => a + b, 0)}`, 10, 90);

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
                clicks++;
            }
            balloons.splice(index, 1);
            
            if (clicks >= 10) {
                level++;
                balloonSpeed += 0.5;
                spawnRate = Math.max(500, spawnRate - 200);
                clearInterval(spawnInterval);
                spawnInterval = setInterval(spawnBalloon, spawnRate);
                lastLevelUpTime = Date.now();
                clicks = 0;
                alert(`Nivel ${level} alcanzado.`);
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
    let lostBalloonsText = Object.entries(missedBalloons)
        .map(([type, count]) => `${type}: ${count}`)
        .join(", ");
    
    ctx.fillText(`Total globos perdidos:`, canvas.width / 2 - 250, canvas.height / 2 + 70);
    
    ctx.font = "10px Arial";
    ctx.fillText(lostBalloonsText, canvas.width / 2 - 380, canvas.height / 2 + 110);
    
}

update();
let spawnInterval = setInterval(spawnBalloon, spawnRate);
