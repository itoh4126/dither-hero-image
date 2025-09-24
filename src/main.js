import { DitherBackground } from './dither.js';

// Initialize the dither background
const canvas = document.getElementById('dither-canvas');
const ditherBg = new DitherBackground(canvas);

// Scroll-based canvas animation (only affects the wave background)
let isCanvasVisible = true;

function handleScroll() {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const triggerPoint = viewportHeight * 0.75; // When 3/4 of viewport is scrolled
  
  // Update scroll offset for wave animation
  const scrollProgress = Math.min(scrollY / triggerPoint, 1);
  const flowOffset = scrollProgress * 8; // Accelerate flow when scrolling
  ditherBg.setScrollOffset(flowOffset);
  
  if (scrollY >= triggerPoint && isCanvasVisible) {
    // Start flowing out effect (only canvas)
    canvas.classList.remove('flow-in');
    canvas.classList.add('flow-out');
    isCanvasVisible = false;
    
    // Accelerate the flow animation dramatically
    setTimeout(() => {
      ditherBg.setScrollOffset(flowOffset + 20); // Strong flow effect
    }, 100);
    
  } else if (scrollY < triggerPoint && !isCanvasVisible) {
    // Show canvas again when scrolling back up with smooth animation
    canvas.classList.remove('flow-out');
    
    // Small delay to ensure the flow-out class is removed first
    setTimeout(() => {
      canvas.classList.add('flow-in');
      isCanvasVisible = true;
      
      // Reset flow animation to normal
      ditherBg.setScrollOffset(0);
    }, 50);
  }
}

window.addEventListener('scroll', handleScroll);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  ditherBg.destroy();
  window.removeEventListener('scroll', handleScroll);
});