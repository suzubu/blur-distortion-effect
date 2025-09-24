import p5 from "p5";

export default function initP5Canvas(container, initialImgSrc) {
  const instance = new p5((p) => {
    let img = null;
    let imgLoaded = false;
    let scaleFactor = 1;
    let brushSize = 100;
    let prevX = null,
      prevY = null;

    p.setup = () => {
      const canvas = p.createCanvas(
        container.clientWidth,
        container.clientHeight
      );
      canvas.parent(container);
      p.imageMode(p.CENTER);
      p.noStroke();

      imgLoaded = false;
      p.loadImage(initialImgSrc, (loadedImg) => {
        img = loadedImg;
        imgLoaded = true;
      });
    };

    p.draw = () => {
      if (!imgLoaded || !img) return;
      p.clear();
      // Compute baseScale so the image fits the canvas initially
      let baseScale = Math.min(p.width / img.width, p.height / img.height);
      const w = img.width * baseScale * scaleFactor;
      const h = img.height * baseScale * scaleFactor;
      p.image(img, p.width / 2, p.height / 2, w, h);
    };

    p.mouseDragged = () => {
      if (!imgLoaded) return;
      if (prevX === null) prevX = p.mouseX;
      if (prevY === null) prevY = p.mouseY;

      const dx = p.mouseX - prevX;
      const dy = p.mouseY - prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.ceil(distance / 5);

      for (let i = 0; i <= steps; i++) {
        const x = prevX + (dx * i) / steps;
        const y = prevY + (dy * i) / steps;
        const c = img.get(x, y);
        p.fill(c[0], c[1], c[2], 120);
        p.ellipse(x, y, brushSize, brushSize);
      }

      prevX = p.mouseX;
      prevY = p.mouseY;
    };

    p.mouseReleased = () => {
      prevX = null;
      prevY = null;
    };

    // Methods exposed externally
    p.updateImage = (newSrc) => {
      imgLoaded = false;
      p.loadImage(newSrc, (loadedImg) => {
        img = loadedImg;
        imgLoaded = true;
        p.redraw();
      });
    };

    p.resetImage = () => {
      scaleFactor = 1;
      if (imgLoaded) p.redraw();
    };

    p.setScaleFactor = (factor) => {
      scaleFactor = factor;
    };

    p.downloadCanvas = (filename = "canvas.png") => {
      p.saveCanvas(filename);
    };
  });

  return instance;
}
