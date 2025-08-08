// main.js — fullscreen build with theme & mute
import { TAU, rand, circleHit, beep, setMuted, requestFullscreen } from './engine.js';
import { Ship, Asteroid, Particle } from './entities.js';
import './sprites.js'; // ensure sprites are loaded before starting

const canvas = document.getElementById('game');
const g = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const btnFS = document.getElementById('btnFS');
const btnMute = document.getElementById('btnMute');
const themeSel = document.getElementById('theme');

function resize(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
  g.setTransform(1,0,0,1,0,0); g.scale(dpr, dpr);
}
window.addEventListener('resize', resize, {passive:true});
const ro = new ResizeObserver(()=>resize());
ro.observe(document.getElementById('wrap'));
resize();

let ship, bullets=[], asts=[], parts=[], score=0, lives=3, level=1, over=false;
function updateHUD(){ scoreEl.textContent=score; livesEl.textContent=lives; levelEl.textContent=level; }
function spawnWave(n){
  asts=[]; const count = 3 + n;
  for(let i=0;i<count;i++){
    let x,y; do{ x=rand(0, canvas.clientWidth); y=rand(0, canvas.clientHeight); } while(Math.hypot(x-ship.x, y-ship.y) < 160);
    asts.push(new Asteroid(x,y,3));
  }
}
function resetGame(){ ship=new Ship(canvas.clientWidth, canvas.clientHeight); bullets=[]; parts=[]; score=0; lives=3; level=1; over=false; spawnWave(level); updateHUD(); }

// Input
const keys = {left:false,right:false,up:false,fire:false,hyper:false};
document.addEventListener('keydown', e=>{
  if(e.code==='ArrowLeft') keys.left=true;
  else if(e.code==='ArrowRight') keys.right=true;
  else if(e.code==='ArrowUp') keys.up=true;
  else if(e.code==='Space'){ keys.fire=true; e.preventDefault(); }
  else if(e.code==='ShiftLeft'||e.code==='ShiftRight') keys.hyper=true;
  if(over && e.code==='Space'){ resetGame(); }
}, {passive:false});
document.addEventListener('keyup', e=>{
  if(e.code==='ArrowLeft') keys.left=false;
  else if(e.code==='ArrowRight') keys.right=false;
  else if(e.code==='ArrowUp') keys.up=false;
  else if(e.code==='Space') keys.fire=false;
  else if(e.code==='ShiftLeft'||e.code==='ShiftRight') keys.hyper=false;
}, {passive:true});
function bindHold(id, on, off){
  const el=document.getElementById(id);
  const start=(e)=>{ e.preventDefault(); on(); };
  const end=(e)=>{ e.preventDefault(); off(); };
  ['touchstart','mousedown'].forEach(ev=>el.addEventListener(ev, start, {passive:false}));
  ['touchend','touchcancel','mouseup','mouseleave'].forEach(ev=>el.addEventListener(ev, end, {passive:false}));
}
bindHold('btnLeft', ()=>keys.left=true, ()=>keys.left=false);
bindHold('btnRight', ()=>keys.right=true, ()=>keys.right=false);
bindHold('btnThrust', ()=>keys.up=true, ()=>keys.up=false);
document.getElementById('btnFire').addEventListener('click', e=>{ e.preventDefault(); if(!over) ship.fire(bullets); else resetGame(); }, {passive:false});
document.getElementById('btnHyp').addEventListener('click', e=>{ e.preventDefault(); ship.hyperspace(canvas.clientWidth, canvas.clientHeight); }, {passive:false});

// Toolbar actions
btnFS.addEventListener('click', ()=>requestFullscreen(document.getElementById('wrap')));
btnMute.addEventListener('click', ()=>{
  const pressed = btnMute.getAttribute('aria-pressed') === 'true';
  const next = !pressed;
  btnMute.setAttribute('aria-pressed', String(next));
  btnMute.textContent = next ? '🔇' : '🔊';
  setMuted(next);
});
themeSel.addEventListener('change', ()=>{
  document.body.className = themeSel.value;
});

// Loop
let last=0, fireCooldown=0, shake=0;
function loop(t){
  const dt = Math.min(0.033, (t-last)/1000 || 0.016); last=t;
  step(dt); draw(); requestAnimationFrame(loop);
}
function step(dt){
  if(over) return;
  ship.rot=(keys.left?-1:0)+(keys.right?1:0);
  ship.thrust=keys.up;
  fireCooldown-=dt;
  if(keys.fire && fireCooldown<=0){ ship.fire(bullets); fireCooldown=0.18; }
  if(keys.hyper){ ship.hyperspace(canvas.clientWidth, canvas.clientHeight); keys.hyper=false; }

  ship.update(dt, canvas.clientWidth, canvas.clientHeight);
  bullets.forEach(b=>b.update(dt, canvas.clientWidth, canvas.clientHeight));
  asts.forEach(a=>a.update(dt, canvas.clientWidth, canvas.clientHeight));
  parts.forEach(p=>p.update(dt, canvas.clientWidth, canvas.clientHeight));

  // bullets vs asteroids
  for(let i=asts.length-1;i>=0;i--){
    const a=asts[i];
    for(let j=bullets.length-1;j>=0;j--){
      const b=bullets[j];
      if(circleHit(a.x,a.y,a.r, b.x,b.y,b.r)){
        bullets.splice(j,1); asts.splice(i,1);
        score += (a.sz===3?20:a.sz===2?50:100); updateHUD();
        asts.push(...a.split());
        for(let k=0;k<12;k++){
          const ang=Math.random()*TAU; const spd=50+Math.random()*120;
          parts.push(new Particle(a.x,a.y, Math.cos(ang)*spd, Math.sin(ang)*spd, 0.6));
        }
        shake = Math.min(0.5, shake + 0.12);
        beep(200,0.05,"square",0.04);
        break;
      }
    }
  }

  // ship vs asteroids
  if(ship.inv<=0){
    for(const a of asts){
      if(circleHit(a.x,a.y,a.r*0.9, ship.x, ship.y, ship.r)){
        lives-=1; updateHUD();
        ship.reset(canvas.clientWidth, canvas.clientHeight);
        shake = Math.min(0.7, shake + 0.2);
        beep(120,0.1,"sawtooth",0.05);
        if(lives<=0){ over=true; }
        break;
      }
    }
  }

  bullets=bullets.filter(b=>!b.dead);
  parts=parts.filter(p=>!p.dead);
  if(asts.length===0){ level+=1; updateHUD(); spawnWave(level); beep(600,0.12,"triangle",0.03); }

  // decay screen shake
  if(shake>0) shake = Math.max(0, shake - dt*1.5);
}
function draw(){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  g.resetTransform(); g.clearRect(0,0,w,h);

  // simple starfield
  g.fillStyle = "rgba(255,255,255,0.05)";
  for(let i=0;i<40;i++){ g.fillRect((i*53)%w, (i*97)%h, 1, 1); }

  // screenshake
  if(shake>0){ g.translate((Math.random()-0.5)*8*shake, (Math.random()-0.5)*8*shake); }

  g.strokeStyle="#fff"; g.fillStyle="#fff"; g.lineWidth=2;
  asts.forEach(a=>a.draw(g)); ship.draw(g); bullets.forEach(b=>b.draw(g)); parts.forEach(p=>p.draw(g));

  if(over){
    g.fillStyle="#fff"; g.font="28px system-ui, sans-serif"; g.textAlign="center";
    g.fillText("GAME OVER — Press Space or ● to restart", w/2, h/2);
  }
}

class Particle{
  constructor(x,y,vx,vy,life=0.4){ this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.life=life; }
  update(dt, W, H){ this.x=(this.x+this.vx*dt+w)%w; this.y=(this.y+this.vy*dt+h)%h; this.life-=dt; }
  draw(g){ g.fillRect(this.x,this.y,2,2); }
  get dead(){ return this.life<=0; }
}

resetGame(); requestAnimationFrame(loop);
