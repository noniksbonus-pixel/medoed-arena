import {drawMap} from './map.js';import {getFighter} from './fighters.js';import {weaponByName} from './weapons.js';
export class Engine{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.resize();addEventListener('resize',()=>this.resize());this.state=null;this.me=null;this.fx=[];this.running=true;this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);}
 resize(){const d=Math.min(devicePixelRatio||1,2);this.canvas.width=innerWidth*d;this.canvas.height=innerHeight*d;this.canvas.style.width=innerWidth+'px';this.canvas.style.height=innerHeight+'px';this.ctx.setTransform(d,0,0,d,0,0);this.w=innerWidth;this.h=innerHeight;}
 setState(state,id){this.state=state;this.me=(state.players||[]).find(p=>p.id===id)||this.me;}
 addFx(x,y,color='#fff'){this.fx.push({x,y,color,t:Date.now()});}
 frame(){if(!this.running)return;requestAnimationFrame(this.frame);const c=this.ctx,w=this.w,h=this.h;const me=this.me;if(!me){c.fillStyle='#9bd889';c.fillRect(0,0,w,h);this.drawAmbient(c,w,h);return;}const camX=me.x,camY=me.y;drawMap(c,camX,camY,w,h,(this.state?.pickups||[]).map(p=>({...p,icon:weaponByName(p.id)?.icon||'🎁'})));
 c.save();c.translate(w/2-camX,h/2-camY);for(const p of this.state?.players||[]){if(!p.alive)continue;this.drawPlayer(c,p,p.id===me.id);}c.restore();
 // обзор и подсказки
 c.fillStyle='rgba(45,67,55,.58)';c.font='bold 13px Nunito, sans-serif';c.textAlign='center';c.fillText('Найди светящийся значок оружия и подойди к нему!',w/2,h-25);
 this.fx=this.fx.filter(f=>Date.now()-f.t<500);for(const f of this.fx){const age=(Date.now()-f.t)/500;c.globalAlpha=1-age;c.strokeStyle=f.color;c.lineWidth=5;c.beginPath();c.arc(w/2+(f.x-camX),h/2+(f.y-camY),18+age*70,0,Math.PI*2);c.stroke();}c.globalAlpha=1;
 }
 drawAmbient(c,w,h){c.font='60px sans-serif';c.textAlign='center';c.fillText('🦡',w/2,h/2);}
 drawPlayer(c,p,isMe){const f=getFighter(p.fighter),r=p.fighter==='boss'?28:20; c.save();c.translate(p.x,p.y);if(Date.now()<p.ghostUntil)c.globalAlpha=.4;
 // shadow and body
 c.fillStyle='#44372c33';c.beginPath();c.ellipse(0,r*.76,r*1.15,r*.45,0,0,7);c.fill();c.rotate(p.aim||0);c.fillStyle=f.color;c.strokeStyle='#563d32';c.lineWidth=3;c.beginPath();c.ellipse(0,0,r*1.2,r*.86,0,0,Math.PI*2);c.fill();c.stroke();
 // характерная светлая полоса
 c.fillStyle='#fff0cf';c.beginPath();c.ellipse(0,-1,r*.9,r*.3,0,0,Math.PI*2);c.fill();c.fillStyle='#342b29';c.beginPath();c.arc(r*.35,-r*.34,3,0,7);c.fill();c.fillStyle='#563d32';c.beginPath();c.arc(r*1.05,0,3,0,7);c.fill();
 c.rotate(-(p.aim||0));c.font=`${r+6}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(f.emoji,0,-r-7);c.restore();
 // имя, здоровье и оружейная метка
 c.font='bold 12px Nunito, sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#44372c';c.strokeText(p.name,p.x,p.y-r-24);c.fillStyle=isMe?'#fff7c8':'#fff';c.fillText(p.name,p.x,p.y-r-24);
 c.fillStyle='#793c43';c.fillRect(p.x-22,p.y-r-18,44,5);c.fillStyle='#ff706c';c.fillRect(p.x-22,p.y-r-18,44*Math.max(0,p.hp/p.maxHp),5);if(p.weapon){const we=weaponByName(p.weapon);c.font='14px sans-serif';c.fillText(we?.icon||'⚔️',p.x,p.y+r+14);}
 }
}
