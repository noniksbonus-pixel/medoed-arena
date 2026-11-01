// Лёгкая процедурная карта без внешних изображений.
export const WORLD_SIZE=4000;
const decorations=[];let seed=42;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<260;i++)decorations.push({x:rnd()*WORLD_SIZE,y:rnd()*WORLD_SIZE,r:8+rnd()*24,type:i%4});
export function drawMap(ctx,cameraX,cameraY,w,h,pickups=[]){
 ctx.fillStyle='#9bd889';ctx.fillRect(0,0,w,h);const left=cameraX-w/2,top=cameraY-h/2;
 ctx.save();ctx.translate(-left,-top);
 // земля с мягкой сеткой и границей мира
 ctx.fillStyle='#a7df8e';ctx.fillRect(0,0,WORLD_SIZE,WORLD_SIZE);
 ctx.strokeStyle='rgba(76,139,83,.13)';ctx.lineWidth=2;for(let x=0;x<=WORLD_SIZE;x+=120){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,WORLD_SIZE);ctx.stroke();}for(let y=0;y<=WORLD_SIZE;y+=120){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WORLD_SIZE,y);ctx.stroke();}
 for(const d of decorations){if(d.x<left-50||d.x>left+w+50||d.y<top-50||d.y>top+h+50)continue;ctx.globalAlpha=.35;ctx.fillStyle=['#6dbb6c','#efd36e','#fff4c6','#7cbf93'][d.type];ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();if(d.type===1){ctx.globalAlpha=.8;ctx.fillStyle='#fff8d8';ctx.beginPath();ctx.arc(d.x,d.y,3,0,7);ctx.fill();}}
 ctx.globalAlpha=1;for(const p of pickups){if(p.x<left-40||p.x>left+w+40||p.y<top-40||p.y>top+h+40)continue;ctx.fillStyle='#fff2ba';ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,23,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.font='20px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.icon||'🎁',p.x,p.y+1);}
 ctx.strokeStyle='#fff1b5';ctx.lineWidth=20;ctx.strokeRect(0,0,WORLD_SIZE,WORLD_SIZE);ctx.restore();
 // лёгкое затемнение за пределами обзора — декорация
}
