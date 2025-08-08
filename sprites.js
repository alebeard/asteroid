// sprites.js — load and expose sprite sheet frames
export const SPRITES = {
  image: null,
  size: 64,
  frames: {
    ship: [0,0], flame:[1,0], bullet:[2,0], asteroid_big:[3,0], asteroid_med:[0,1], asteroid_small:[1,1]
  }
};

const img = new Image();
img.src = 'assets/sprites.png';
await new Promise((res, rej)=>{ img.onload=res; img.onerror=rej; });
SPRITES.image = img;
