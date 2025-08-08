// engine.js — helpers + audio + fullscreen
export const TAU = Math.PI * 2;
export const rand  = (min, max)=>Math.random()*(max-min)+min;
export const randi = (min, max)=>Math.floor(rand(min,max));
export function wrap(v, max){ let x=v; while(x<0) x+=max; while(x>=max) x-=max; return x; }
export function dist2(ax,ay,bx,by){ const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; }
export function circleHit(ax,ay,ar,bx,by,br){ const r=ar+br; return dist2(ax,ay,bx,by) <= r*r; }

let ACtx, muted=false;
export function setMuted(m){ muted=m; }
export function beep(freq=600, dur=0.05, type="square", gain=0.02){
  if(muted) return;
  try{
    if(!ACtx){ const AC = window.AudioContext || window.webkitAudioContext; ACtx = new AC(); }
    const t=ACtx.currentTime, o=ACtx.createOscillator(), g=ACtx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(g).connect(ACtx.destination); o.start(t); o.stop(t+dur);
  }catch(e){ /* ignore */ }
}

export async function requestFullscreen(el){
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if(fn) await fn.call(el);
}
