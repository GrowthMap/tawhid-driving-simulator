// Simple input handling
const keys = {
  left: false,
  right: false,
  fly: false,
};

export function createInput() {
  // Keyboard
  function onKeyDown(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      keys.left = true;
      console.log('KEY DOWN: LEFT');
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      keys.right = true;
      console.log('KEY DOWN: RIGHT');
    }
    if (e.code === 'Space') {
      keys.fly = true;
      console.log('KEY DOWN: FLY');
    }
  }

  function onKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'Space') keys.fly = false;
  }

  // Touch buttons
  const leftBtn = document.getElementById('steer-left');
  const rightBtn = document.getElementById('steer-right');
  const flyBtn = document.getElementById('fly-btn');

  if (leftBtn) {
    leftBtn.addEventListener('touchstart', () => { keys.left = true; }, false);
    leftBtn.addEventListener('touchend', () => { keys.left = false; }, false);
    leftBtn.addEventListener('mousedown', () => { keys.left = true; });
    leftBtn.addEventListener('mouseup', () => { keys.left = false; });
    leftBtn.addEventListener('mouseleave', () => { keys.left = false; });
  }

  if (rightBtn) {
    rightBtn.addEventListener('touchstart', () => { keys.right = true; }, false);
    rightBtn.addEventListener('touchend', () => { keys.right = false; }, false);
    rightBtn.addEventListener('mousedown', () => { keys.right = true; });
    rightBtn.addEventListener('mouseup', () => { keys.right = false; });
    rightBtn.addEventListener('mouseleave', () => { keys.right = false; });
  }

  if (flyBtn) {
    flyBtn.addEventListener('touchstart', () => { keys.fly = true; }, false);
    flyBtn.addEventListener('touchend', () => { keys.fly = false; }, false);
    flyBtn.addEventListener('mousedown', () => { keys.fly = true; });
    flyBtn.addEventListener('mouseup', () => { keys.fly = false; });
    flyBtn.addEventListener('mouseleave', () => { keys.fly = false; });
  }

  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('keyup', onKeyUp, false);

  return {
    getLeft: () => keys.left,
    getRight: () => keys.right,
    getFly: () => {
      const val = keys.fly;
      keys.fly = false; // Reset after reading
      return val;
    },
  };
}
