// sprites.js — no top-level await, explicit loader
export const SPRITES = {
  image: null,
  size: 64,
  frames: { ship:[0,0], flame:[1,0], bullet:[2,0], asteroid_big:[3,0], asteroid_med:[0,1], asteroid_small:[1,1] }
};

export function loadSprites(path='assets/sprites.png'){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = ()=>{ SPRITES.image = img; resolve(); };
    img.onerror = (e)=> reject(new Error('Sprite image failed to load: '+path));
    img.src = path;
  });
}
