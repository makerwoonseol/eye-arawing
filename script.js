const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const startScreen = document.getElementById("startScreen");

const calibrationScreen = document.getElementById("calibrationScreen");
const calibrationPoints = document.getElementById("calibrationPoints");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let previousX = null;
let previousY = null;

let currentX = window.innerWidth / 2;
let currentY = window.innerHeight / 2;

let drawingEnabled = false;

let calibrationClicks = 0;
const totalPoints = 9;
const clicksPerPoint = 5;

const positions = [
  [10, 10],
  [50, 10],
  [90, 10],
  [10, 50],
  [50, 50],
  [90, 50],
  [10, 90],
  [50, 90],
  [90, 90],
];

// --------------------
// 1. 페이지 로드시 바로 시작
// --------------------

window.onload = async () => {
  await webgazer
    .setRegression("ridge")
    .setTracker("clmtrackr")
    .setGazeListener((data) => {
      if (!data) return;

      currentX = data.x;
      currentY = data.y;

      render();
    })
    .begin();

  webgazer.showVideo(true);
  webgazer.showFaceOverlay(true);
  webgazer.showFaceFeedbackBox(true);
};

// --------------------
// 2. 렌더링
// --------------------

function render() {
  // drawing 활성화 시 선 그림
  if (drawingEnabled && previousX !== null) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(previousX, previousY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
  }

  // 빨간 점
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
  ctx.fill();

  previousX = currentX;
  previousY = currentY;
}

// --------------------
// 3. 시작 버튼
// --------------------

startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  calibrationScreen.classList.remove("hidden");

  createCalibrationPoints();
});

// --------------------
// 4. 캘리브레이션
// --------------------

function createCalibrationPoints() {
  calibrationPoints.innerHTML = "";

  positions.forEach(([x, y]) => {
    const point = document.createElement("div");
    point.classList.add("calibration-point");

    point.style.left = `${x}%`;
    point.style.top = `${y}%`;

    let clicks = 0;

    point.addEventListener("click", () => {
      clicks++;

      point.style.opacity = 0.3 + clicks * 0.15;

      webgazer.recordScreenPosition(x, y, "click");

      if (clicks >= clicksPerPoint) {
        point.remove();
        calibrationClicks++;

        if (calibrationClicks >= totalPoints) {
          finishCalibration();
        }
      }
    });

    calibrationPoints.appendChild(point);
  });
}

// --------------------
// 5. 캘리브레이션 완료
// --------------------

function finishCalibration() {
  calibrationScreen.style.display = "none";

  drawingEnabled = true;
}

// --------------------
// 6. 리사이즈
// --------------------

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
