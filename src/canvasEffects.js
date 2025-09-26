import p5 from "p5";

/**
 * BLUR DISTORTION EFFECT CANVAS
 *
 * This creates an interactive canvas where users can create blur/distortion effects
 * by dragging their cursor over an image. The effect samples colors from the original
 * image and creates a brush-like distortion effect.
 *
 * ARCHITECTURE NOTES:
 * - Uses direct canvas drawing (not graphics layers) to avoid coordinate system issues
 * - Background image draws once, brush effects accumulate on top
 * - Uses p5.js noLoop() mode for performance - only redraws when needed
 */
export default function initP5Canvas(container, initialImgSrc) {
  const instance = new p5((p) => {
    // === CORE STATE VARIABLES ===
    let img = null; // The loaded image object
    let imgLoaded = false; // Flag to track if image is ready to use
    let scaleFactor = 1; // Zoom level for the image (1 = original size)
    let brushSize = 70; // Size of the distortion brush in pixels

    // Mouse tracking for smooth brush strokes
    let prevX = null, // Previous mouse X position
      prevY = null; // Previous mouse Y position

    // Graphics layer (currently unused but kept for potential future use)
    let brushLayer;

    // Image display dimensions (calculated based on canvas size and scale)
    let imgDrawW, imgDrawH;

    // === DRAWING STATE MANAGEMENT ===
    let backgroundDrawn = false; // Flag to prevent background from redrawing over brush effects

    p.setup = () => {
      // Create canvas to fit the container
      const canvas = p.createCanvas(
        container.clientWidth,
        container.clientHeight
      );
      canvas.parent(container);

      // Set drawing modes for consistent image positioning
      p.imageMode(p.CENTER); // Images draw from center point
      p.noStroke(); // No outlines on shapes by default

      // Create graphics layer (legacy - kept for potential future use)
      // NOTE: We don't use this for drawing due to coordinate system issues
      brushLayer = p.createGraphics(p.width, p.height);
      brushLayer.clear();

      // Load the initial image
      imgLoaded = false;
      p.loadImage(initialImgSrc, (loadedImg) => {
        img = loadedImg;
        imgLoaded = true;
        p.redraw(); // Trigger a redraw when image loads
      });

      // Use noLoop() for performance - only redraw when needed (mouse events, etc.)
      p.noLoop();
    };

    /**
     * MAIN DRAW FUNCTION
     *
     * This runs whenever p.redraw() is called. Key design decisions:
     * 1. Background image draws only ONCE to avoid covering brush effects
     * 2. Image dimensions are recalculated each time to handle zoom changes
     * 3. Uses noLoop() mode so this only runs when explicitly triggered
     */
    p.draw = () => {
      if (!imgLoaded || !img) return;

      // === CALCULATE IMAGE DISPLAY DIMENSIONS ===
      // Scale image to fit canvas while maintaining aspect ratio
      const baseScale = Math.min(p.width / img.width, p.height / img.height);
      imgDrawW = img.width * baseScale * scaleFactor; // Final display width
      imgDrawH = img.height * baseScale * scaleFactor; // Final display height

      // Calculate corner positions (used in mouse bounds checking)
      const imgTopLeftX = p.width / 2 - imgDrawW / 2;
      const imgTopLeftY = p.height / 2 - imgDrawH / 2;

      // === BACKGROUND IMAGE DRAWING ===
      // CRITICAL: Only draw background image once, then let brush effects accumulate on top
      // This prevents the background from covering up brush strokes on each redraw
      if (!backgroundDrawn) {
        p.image(img, p.width / 2, p.height / 2, imgDrawW, imgDrawH);
        backgroundDrawn = true;
      }

      // Ensure image pixel data is loaded for color sampling
      if (img.pixels.length === 0) img.loadPixels();
    };

    /**
     * MOUSE DRAG HANDLER - BRUSH EFFECT CREATION
     *
     * This creates the blur/distortion effect by:
     * 1. Sampling colors from the original image at brush area
     * 2. Drawing averaged color circles directly on main canvas
     * 3. Interpolating between mouse positions for smooth strokes
     *
     * COORDINATE SYSTEM NOTES:
     * - Uses main canvas coordinates directly (not graphics layers)
     * - All drawing is relative to canvas (0,0) at top-left
     * - Image is centered, so we calculate bounds for interaction area
     */
    p.mouseDragged = () => {
      if (!imgLoaded || !img || !img.pixels || img.pixels.length === 0) return;

      // === RECALCULATE IMAGE BOUNDS ===
      // We recalculate these fresh each time to avoid stale values
      // (imgDrawW/imgDrawH from draw() might not be current)
      const baseScale = Math.min(p.width / img.width, p.height / img.height);
      const currentImgDrawW = img.width * baseScale * scaleFactor;
      const currentImgDrawH = img.height * baseScale * scaleFactor;
      const imgTopLeftX = p.width / 2 - currentImgDrawW / 2;
      const imgTopLeftY = p.height / 2 - currentImgDrawH / 2;
      const imgBottomRightX = imgTopLeftX + currentImgDrawW;
      const imgBottomRightY = imgTopLeftY + currentImgDrawH;

      // === BOUNDS CHECKING ===
      // Only create brush effects when mouse is actually over the image
      if (
        p.mouseX < imgTopLeftX ||
        p.mouseX > imgBottomRightX ||
        p.mouseY < imgTopLeftY ||
        p.mouseY > imgBottomRightY
      ) {
        prevX = null; // Reset tracking when outside bounds
        prevY = null;
        return;
      }

      // === STROKE INTERPOLATION SETUP ===
      // Initialize previous position tracking for smooth strokes
      if (prevX === null) prevX = p.mouseX;
      if (prevY === null) prevY = p.mouseY;

      // Calculate smooth interpolation between previous and current mouse position
      const dx = p.mouseX - prevX;
      const dy = p.mouseY - prevY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.ceil(distance / 5); // Create steps every 5 pixels for smoothness

      // === BRUSH STROKE INTERPOLATION ===
      // Draw brush effects at each interpolated point for smooth continuous strokes
      for (let i = 0; i <= steps; i++) {
        const x = prevX + (dx * i) / steps; // Interpolated X position
        const y = prevY + (dy * i) / steps; // Interpolated Y position

        // Skip if this interpolated step is outside image bounds
        if (
          x < imgTopLeftX ||
          x > imgBottomRightX ||
          y < imgTopLeftY ||
          y > imgBottomRightY
        ) {
          continue;
        }

        // === COLOR SAMPLING ALGORITHM ===
        // Sample colors from a circular area around the brush position
        const r = brushSize / 7; // Brush radius
        let sumR = 0,
          sumG = 0,
          sumB = 0,
          count = 0; // Color accumulators

        // Iterate through a square area around the brush center
        for (let ox = -r; ox <= r; ox++) {
          for (let oy = -r; oy <= r; oy++) {
            // Only sample pixels within circular brush area
            if (Math.sqrt(ox * ox + oy * oy) <= r) {
              // === COORDINATE TRANSFORMATION ===
              // Convert canvas coordinates to original image pixel coordinates
              // This is the key coordinate transformation that maps:
              // Canvas position -> Display image position -> Original image pixel
              const mappedX = Math.floor(
                ((x + ox - imgTopLeftX) / currentImgDrawW) * img.width
              );
              const mappedY = Math.floor(
                ((y + oy - imgTopLeftY) / currentImgDrawH) * img.height
              );

              // Ensure we're sampling within the original image bounds
              if (
                mappedX >= 0 &&
                mappedX < img.width &&
                mappedY >= 0 &&
                mappedY < img.height
              ) {
                // Sample pixel color from original image
                // p5.js stores pixels as [R,G,B,A,R,G,B,A,...] array
                const idx = 4 * (mappedY * img.width + mappedX);
                sumR += img.pixels[idx]; // Red channel
                sumG += img.pixels[idx + 1]; // Green channel
                sumB += img.pixels[idx + 2]; // Blue channel
                count++;
              }
            }
          }
        }

        // === BRUSH EFFECT DRAWING ===
        if (count > 0) {
          // Calculate average color from all sampled pixels
          const avgR = sumR / count;
          const avgG = sumG / count;
          const avgB = sumB / count;

          // Draw brush effect directly on main canvas
          // CRITICAL: Drawing directly on main canvas (not graphics layer)
          // This ensures coordinates work correctly without offset issues
          p.noStroke();
          p.fill(avgR, avgG, avgB, 150); // Semi-transparent for blending effect
          p.ellipse(x, y, brushSize, brushSize);
        }
      }

      // Update position tracking for next frame
      prevX = p.mouseX;
      prevY = p.mouseY;
      p.redraw(); // Trigger redraw to show new brush stroke
    };

    /**
     * MOUSE RELEASED HANDLER
     * Reset position tracking when user stops dragging
     */
    p.mouseReleased = () => {
      prevX = null;
      prevY = null;
    };

    /**
     * PUBLIC API FUNCTIONS
     * These functions are exposed to allow external control of the canvas
     */

    // Update to a new image
    p.updateImage = (newSrc) => {
      imgLoaded = false;
      backgroundDrawn = false; // Allow background to redraw with new image
      p.loadImage(newSrc, (loadedImg) => {
        img = loadedImg;
        imgLoaded = true;
        if (brushLayer) brushLayer.clear(); // Clear any legacy graphics layer
        p.clear(); // Clear entire canvas for fresh start
        p.redraw();
      });
    };

    // Reset to original image state (clear all brush effects)
    p.resetImage = () => {
      scaleFactor = 1; // Reset zoom to original size
      backgroundDrawn = false; // Allow background to redraw
      if (brushLayer) brushLayer.clear(); // Clear legacy graphics layer
      p.clear(); // Clear all brush effects from canvas
      p.redraw();
    };

    // Change brush size (repurposed from zoom control)
    p.setScaleFactor = (factor) => {
      // Convert the scale factor to brush size
      // factor typically ranges from 0.5 to 2.0, so we'll map it to brush sizes
      brushSize = Math.max(20, Math.min(200, factor * 70)); // Range: 20-200 pixels

      // No need to redraw or clear - brush size change takes effect on next stroke
      // This provides immediate feedback without disrupting current brush effects
    };

    // More descriptive brush size control function
    p.setBrushSize = (size) => {
      brushSize = Math.max(10, Math.min(300, size)); // Clamp between 10-300 pixels
    };

    // Get current brush size for UI feedback
    p.getBrushSize = () => {
      return brushSize;
    };

    // Download current canvas state as image
    p.downloadCanvas = (filename = "canvas.png") => {
      p.saveCanvas(filename);
    };
  });

  return instance;
}

/**
 * KEY ARCHITECTURAL DECISIONS SUMMARY:
 *
 * 1. COORDINATE SYSTEM:
 *    - Uses direct main canvas drawing (not p5.createGraphics layers)
 *    - Avoids coordinate transformation issues between graphics layers
 *    - All positioning is relative to main canvas (0,0) at top-left
 *
 * 2. DRAWING STRATEGY:
 *    - Background image draws once, brush effects accumulate on top
 *    - Uses backgroundDrawn flag to prevent image from covering brush strokes
 *    - noLoop() mode for performance - only redraws when needed
 *
 * 3. BRUSH EFFECT:
 *    - Samples colors from original image pixels in circular brush area
 *    - Averages sampled colors and draws semi-transparent circles
 *    - Interpolates between mouse positions for smooth strokes
 *
 * 4. COORDINATE TRANSFORMATIONS:
 *    - Canvas mouse position → Display image position → Original image pixels
 *    - Handles zoom scaling and image centering automatically
 *    - Bounds checking ensures interaction only within image area
 *
 * 5. LESSONS LEARNED:
 *    - p5.js graphics layers can have coordinate system inconsistencies
 *    - Direct canvas drawing is more reliable for precise positioning
 *    - Always test coordinate systems with simple shapes first
 */
