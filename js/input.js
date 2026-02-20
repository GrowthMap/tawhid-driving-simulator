/**
 * Input abstraction: getSteer(), getAccel(), getBrake()
 * Implementations: keyboard, touch, tilt
 */

const STORAGE_KEY = 'driving_steeringMode';

export function getStoredSteeringMode() {
  return localStorage.getItem(STORAGE_KEY) || 'touch';
}

export function setStoredSteeringMode(mode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

// --- Keyboard ---
const keys = { steerLeft: false, steerRight: false, accel: false, brake: false };

function onKeyDown(e) {
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      keys.steerLeft = true;
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.steerRight = true;
      e.preventDefault();
      break;
    case 'ArrowUp':
    case 'KeyW':
      keys.accel = true;
      e.preventDefault();
      break;
    case 'ArrowDown':
    case 'KeyS':
      keys.brake = true;
      e.preventDefault();
      break;
  }
}

function onKeyUp(e) {
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      keys.steerLeft = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.steerRight = false;
      break;
    case 'ArrowUp':
    case 'KeyW':
      keys.accel = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      keys.brake = false;
      break;
  }
}

export function createKeyboardInput() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  return {
    getSteer() {
      let s = 0;
      if (keys.steerLeft) s -= 1;
      if (keys.steerRight) s += 1;
      return s;
    },
    getAccel() {
      return keys.accel ? 1 : 0;
    },
    getBrake() {
      return keys.brake ? 1 : 0;
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}

// --- Touch (state from buttons) ---
const touchState = { steerLeft: false, steerRight: false, accel: false, brake: false };

function setTouchKey(id, value) {
  if (id === 'steer-left') touchState.steerLeft = value;
  else if (id === 'steer-right') touchState.steerRight = value;
  else if (id === 'gas') touchState.accel = value;
  else if (id === 'brake') touchState.brake = value;
}

function addTouchListeners(element) {
  element.addEventListener('touchstart', (e) => {
    e.preventDefault();
    setTouchKey(element.id, true);
  }, { passive: false });
  element.addEventListener('touchend', (e) => {
    e.preventDefault();
    setTouchKey(element.id, false);
  }, { passive: false });
  element.addEventListener('mousedown', () => setTouchKey(element.id, true));
  element.addEventListener('mouseup', () => setTouchKey(element.id, false));
  element.addEventListener('mouseleave', () => setTouchKey(element.id, false));
}

export function createTouchInput() {
  const ids = ['steer-left', 'steer-right', 'gas', 'brake'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) addTouchListeners(el);
  });
  return {
    getSteer() {
      let s = 0;
      if (touchState.steerLeft) s -= 1;
      if (touchState.steerRight) s += 1;
      return s;
    },
    getAccel() {
      return touchState.accel ? 1 : 0;
    },
    getBrake() {
      return touchState.brake ? 1 : 0;
    },
    destroy() {},
  };
}

// --- Tilt (DeviceOrientation) ---
let tiltSteer = 0;
const TILT_SENSITIVITY = 3;
const TILT_DEADZONE = 5;

function onDeviceOrientation(e) {
  // gamma: left-right tilt (-90 to 90)
  const g = e.gamma != null ? e.gamma : 0;
  const raw = Math.max(-1, Math.min(1, g / 30));
  if (Math.abs(raw * 30) < TILT_DEADZONE) {
    tiltSteer = 0;
  } else {
    tiltSteer = raw * TILT_SENSITIVITY;
  }
}

export function createTiltInput() {
  tiltSteer = 0;
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then((permission) => {
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', onDeviceOrientation);
        }
      })
      .catch(() => {});
  } else {
    window.addEventListener('deviceorientation', onDeviceOrientation);
  }
  return {
    getSteer() {
      return Math.max(-1, Math.min(1, tiltSteer));
    },
    getAccel() {
      return 0; // tilt typically only steering; use on-screen or keyboard for gas/brake
    },
    getBrake() {
      return 0;
    },
    destroy() {
      window.removeEventListener('deviceorientation', onDeviceOrientation);
    },
  };
}

// Combined: use one steering mode for steer; accel/brake always from keyboard + touch buttons
export function createCombinedInput(steeringMode) {
  const keyboard = createKeyboardInput();
  const touch = createTouchInput();
  let tilt = null;
  if (steeringMode === 'tilt') {
    tilt = createTiltInput();
  }

  return {
    getSteer() {
      if (steeringMode === 'tilt' && tilt) return tilt.getSteer();
      return touch.getSteer() || keyboard.getSteer();
    },
    getAccel() {
      return keyboard.getAccel() || touch.getAccel() || (tilt && tilt.getAccel());
    },
    getBrake() {
      return keyboard.getBrake() || touch.getBrake() || (tilt && tilt.getBrake());
    },
    destroy() {
      keyboard.destroy();
      if (tilt) tilt.destroy();
    },
  };
}
