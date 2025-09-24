import initP5Canvas from "./canvasEffects.js";

// GLOBAL VARIABLES
const canvasContainer = document.querySelector(".canvas");
let scaleFactor = 1;
let originalImageSrc = "/assets/test.jpg"; // start with default

// Initialize p5 sketch and store instance globally, but wait until DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.myP5Instance = initP5Canvas(canvasContainer, originalImageSrc);
});

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
    // update "original" when a user uploads
    originalImageSrc = e.target.result;
    if (window.myP5Instance && window.myP5Instance.updateImage) {
      window.myP5Instance.updateImage(originalImageSrc);
    }
  };
  reader.readAsDataURL(file);
  uploadInput.value = "";
});

// BUTTONS

// RESET BUTTON
const resetButton = document.querySelector('.btn[aria-label="Reset"]');
// reset button logic -> uses whatever is currently set to 'original'
resetButton.addEventListener("click", () => {
  scaleFactor = 1;
  if (window.myP5Instance && window.myP5Instance.resetImage) {
    window.myP5Instance.resetImage(originalImageSrc);
  }
});

// SCALE BUTTONS
const zoomInButton = document.querySelector('.btn[aria-label="Zoom In"]');
const zoomOutButton = document.querySelector('.btn[aria-label="Zoom Out"]');

zoomInButton.addEventListener("click", () => {
  scaleFactor *= 1.1; // zoom in by 10%
  if (window.myP5Instance && window.myP5Instance.setScaleFactor) {
    window.myP5Instance.setScaleFactor(scaleFactor);
  }
});

zoomOutButton.addEventListener("click", () => {
  scaleFactor /= 1.1; // zoom out by 10%
  if (window.myP5Instance && window.myP5Instance.setScaleFactor) {
    window.myP5Instance.setScaleFactor(scaleFactor);
  }
});

// DOWNLOAD BUTTON
const downloadButton = document.querySelector('.btn[aria-label="Download"]');
downloadButton.addEventListener("click", () => {
  if (window.myP5Instance && window.myP5Instance.downloadCanvas) {
    window.myP5Instance.downloadCanvas();
  }
});
