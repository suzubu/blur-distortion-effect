// GLOBAL VARIABLES
const canvasContainer = document.querySelector(".canvas");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
let img = new Image();
let scaleFactor = 1;
let originalImageSrc = "/assets/test.jpg"; // start with default

// CANVAS SETUP
canvasContainer.appendChild(canvas);

function resizeCanvas() {
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  drawDefaultImage();
}
window.addEventListener("resize", resizeCanvas);

img.src = originalImageSrc;
img.onload = () => {
  resizeCanvas();
};

// LOAD DEFAULT IMAGE
function drawDefaultImage() {
  if (!img.complete) return;
  //   clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   fit image into canvas while maintaining aspect ratio

  const baseScale = Math.min(
    canvas.width / img.width,
    canvas.height / img.height
  );
  const scale = baseScale * scaleFactor;
  const x = (canvas.width - img.width * scale) / 2;
  const y = (canvas.height - img.height * scale) / 2;
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    x,
    y,
    img.width * scale,
    img.height * scale
  );
}

// FILE INPUT / UPLOAD LOGIC
const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.accept = "image/*";
uploadInput.style.display = "none";
uploadInput.value = "";
document.body.appendChild(uploadInput);
// link unput to upoload button
const uploadButton = document.querySelector('.btn[aria-label="Upload"]');
uploadButton.addEventListener("click", () => {
  uploadInput.click();
});

// file selection
uploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    // update global img
    img.src = e.target.result;
    // update "original" when a user uploads
    originalImageSrc = e.target.result;
    // redraw canvas when image is loaded
    img.onload = () => drawDefaultImage();
  };
  reader.readAsDataURL(file);
  uploadInput.value = "";
});

// BUTTONS

// RESET BUTTON
const resetButton = document.querySelector('.btn[aria-label="Reset"]');
// reset button logic -> uses whatever is currently set to 'original'
resetButton.addEventListener("click", () => {
  img.src = originalImageSrc;
  img.onload = () => drawDefaultImage();
  scaleFactor = 1;
});

// SCALE BUTTONS
const zoomInButton = document.querySelector('.btn[aria-label="Zoom In"]');
const zoomOutButton = document.querySelector('.btn[aria-label="Zoom Out"]');

zoomInButton.addEventListener("click", () => {
  scaleFactor *= 1.1; // zoom in by 10%
  drawDefaultImage();
});

zoomOutButton.addEventListener("click", () => {
  scaleFactor /= 1.1; // zoom out by 10%
  drawDefaultImage();
});

// DOWNLOAD BUTTON
const downloadButton = document.querySelector('.btn[aria-label="Download"]');
downloadButton.addEventListener("click", () => {
  canvas.toBlob((blob) => {
    const link = document.createElement("a");
    link.download = "canvas-image.png";
    link.href = URL.createObjectURL(blob);
    link.click();
    // clean up
    URL.revokeObjectURL(link.href);
  });
});
