const canvasContainer = document.querySelector(".canvas");
const canvas = document.createElement("canvas");
canvasContainer.appendChild(canvas);
const ctx = canvas.getContext("2d");

// track canvas size
function resizeCanvas() {
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  drawDefaultImage();
}
window.addEventListener("resize", resizeCanvas);

let img = new Image();
img.src = "/assets/test.jpg";
img.onload = () => {
  resizeCanvas();
};

function drawDefaultImage() {
  if (!img.complete) return;
  //   clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   fit image into canvas while maintaining aspect ratio
  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
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

// file input from user
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
    // redraw canvas when image is loaded
    img.onload = () => drawDefaultImage();
  };
  reader.readAsDataURL(file);
  uploadInput.value = "";
});
