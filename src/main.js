import initP5Canvas from "./canvasEffects.js";

// GLOBAL VARIABLES
const canvasContainer = document.querySelector(".canvas");
let scaleFactor = 1;
let originalImageSrc = "/assets/test.jpg"; // start with default

// Initialize p5 sketch and store instance globally, but wait until DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.myP5Instance = initP5Canvas(canvasContainer, originalImageSrc);

  // Handle window resize to update canvas dimensions
  window.addEventListener('resize', () => {
    if (window.myP5Instance) {
      // Resize canvas to match new container dimensions
      window.myP5Instance.resizeCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);

      // Reset background flag to allow image to redraw at new size
      if (window.myP5Instance.resetBackgroundFlag) {
        window.myP5Instance.resetBackgroundFlag();
      }

      // Trigger redraw to update with new dimensions
      window.myP5Instance.redraw();
    }
  });
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

// FREEZE EDITS BUTTON
const freezeButton = document.querySelector('.btn[aria-label="Freeze Edits"]');
freezeButton.addEventListener("click", () => {
  if (window.myP5Instance && window.myP5Instance.freezeEdits) {
    window.myP5Instance.freezeEdits();
    console.log('Edits frozen as new background');
  }
});

// TOGGLE SWITCH - Brush Mode Control
const toggleSwitch = document.querySelector('#shapeToggle');

// Set initial state: unchecked = blur mode (default), checked = pixelate mode
toggleSwitch.checked = false; // Start with blur mode

toggleSwitch.addEventListener('change', (event) => {
  if (window.myP5Instance && window.myP5Instance.setBrushMode) {
    if (event.target.checked) {
      // Toggle is ON (checked) = Pixelate mode
      window.myP5Instance.setBrushMode('pixelate');
      console.log('Switched to pixelate mode');
    } else {
      // Toggle is OFF (unchecked) = Blur mode
      window.myP5Instance.setBrushMode('blur');
      console.log('Switched to blur mode');
    }
  }
});