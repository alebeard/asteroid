// entities.js — sprite-based entities
import { TAU, rand, randi, wrap, circleHit, beep } from './engine.js';
import { SPRITES } from './sprites.js';

function drawSprite(g, name, x, y, a=0, scale=1){
  const [cx, cy] = SPRITES.frames[name];
  const s = SPRITES.size;
  const sx = cx*s, sy = cy*s;
  const hw = (s*scale)/2, hh = (s*scale)/2;
  g.save();
  g.translate(x, y);
  g.rotate(a);
  g.drawImage(SPRITES.image, sx, sy, s, s, -hw, -hh, s*scale, s*scale);
  g.restore();
}

export class Bullet{
  constructor(x,y,ang){
    const speed=520;
    this.x=x; this.y=y; this.vx=Math.cos(ang)*speed; this.vy=Math.sin(ang)*speed;
    this.life=0.8; this.r=2; this.a=ang;
  }
  update(dt, W, H){
    this.x = wrap(this.x + this.vx*dt, W);
    this.y = wrap(this.y + this.vy*dt, H);
    this.life -= dt;
  }
  draw(g){ drawSprite(g, 'bullet', this.x, this.y, 0, 0.25); }
  get dead(){ return this.life<=0; }
}

export class Particle{
  constructor(x,y,vx,vy,life=0.4){ this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.life=life; }
  update(dt, W, H){ this.x=wrap(this.x+this.vx*dt,W); this.y=wrap(this.y+this.vy*dt,H); this.life-=dt; }
  draw(g){ g.fillRect(this.x,this.y,2,2); }
  get dead(){ return this.life<=0; }
}

export class Asteroid{
  constructor(x,y,sz=3){
    this.x=x; this.y=y; this.sz=sz;
    const speed = rand(20, 60) + (3-sz)*25;
    const ang = rand(0, TAU);
    this.vx = Math.cos(ang)*speed; this.vy = Math.sin(ang)*speed;
    this.r = 50 * (sz/3); // matches sprite scale when drawn at 1.0
    this.rot = rand(-1,1)*0.8;
    this.a = rand(0, TAU);
  }
  update(dt, W, H){ this.x=wrap(this.x+this.vx*dt,W); this.y=wrap(this.y+this.vy*dt,H); this.a+=this.rot*dt; }
  draw(g){
    const name = this.sz===3?'asteroid_big': this.sz===2?'asteroid_med':'asteroid_small';
    drawSprite(g, name, this.x, this.y, this.a, 1.0);
  }
  split(){
    if(this.sz>1){
      return [new Asteroid(this.x,this.y,this.sz-1), new Asteroid(this.x,this.y,this.sz-1)];
    }
    return [];
  }
}

export class Ship{
  constructor(W,H){ this.reset(W,H); }
  reset(W,H){ this.x=W/2; this.y=H/2; this.vx=0; this.vy=0; this.a=-Math.PI/2; this.r=12; this.thrust=false; this.rot=0; this.inv=2.0; this.dead=false; }
  update(dt, W, H){
    const ACC=220, MAX=260, FRI=0.992, ROT=3.4;
    if(this.thrust){ this.vx += Math.cos(this.a)*ACC*dt; this.vy += Math.sin(this.a)*ACC*dt; }
    const vlen=Math.hypot(this.vx,this.vy); if(vlen>MAX){ const s=MAX/vlen; this.vx*=s; this.vy*=s; }
    this.vx*=FRI; this.vy*=FRI; this.a += this.rot*ROT*dt;
    this.x=wrap(this.x+this.vx*dt,W); this.y=wrap(this.y+this.vy*dt,H);
    if(this.inv>0) this.inv-=dt;
  }
  draw(g){
    drawSprite(g, 'ship', this.x, this.y, this.a, 0.7);
    if(this.thrust){ drawSprite(g, 'flame', this.x, this.y, this.a, 0.7); }
  }
  fire(bullets){ bullets.push(new Bullet(this.x+Math.cos(this.a)*18, this.y+Math.sin(this.a)*18, this.a)); beep(900,0.04,"square",0.02); }
  hyperspace(W,H){ this.x=rand(0,W); this.y=rand(0,H); this.vx=0; this.vy=0; this.inv=1.0; beep(300,0.08,"sine",0.03); }
}
