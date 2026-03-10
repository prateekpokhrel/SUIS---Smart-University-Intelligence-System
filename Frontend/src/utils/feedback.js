// ===============================
// UI FEEDBACK UTILITIES
// ===============================

let clickSound = null;

// Initialize sound lazily (autoplay-safe)
const initSound = () => {
  if (!clickSound) {
    clickSound = new Audio("/sounds/slider-tick.mp3");
    clickSound.volume = 0.4;
  }
};

// Play sound safely
export const playTickSound = () => {
  try {
    initSound();
    clickSound.currentTime = 0;
    clickSound.play();
  } catch (err) {
    // Browser blocked autoplay — safe to ignore
  }
};

// Haptic feedback (mobile devices only)
export const triggerHaptic = (type = "light") => {
  if (!("vibrate" in navigator)) return;

  if (type === "light") navigator.vibrate(10);
  else if (type === "medium") navigator.vibrate(20);
  else if (type === "heavy") navigator.vibrate([30, 20, 30]);
};
