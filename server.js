// Сервер авторитетно обрабатывает движение, атаки, подбор оружия и результаты.
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;
const WORLD = 4000;
app.use(express.static(__dirname));

const fighterData = [
  ['tank',220,150,22,520],['ninja',105,255,17,610],['chemist',125,175,24,540],['sniper',100,165,34,760],['berserk',145,195,24,560],
  ['engineer',130,175,19,570],['vampire',150,175,22,560],['ice',135,165,20,580],['pyro',125,185,25,560],['ghost',110,225,20,630],
  ['healer',145,170,18,570],['thief',120,215,20,590],['smith',175,155,23,540],['mimic',130,185,21,570],['boss',280,125,29,500]
];
const fighterStats = Object.fromEntries(fighterData.map(([id,hp,speed,damage,vision]) => [id,{hp,speed,damage,vision}]));
const weaponNames = ['меч','копьё','топор','молот','коса','кинжал','лук','арбалет','пистолет','дробовик','автомат','снайперская винтовка','гранаты','дымовая шашка','ловушка-капкан','мина','токсичный баллон','огнемёт','бумеранг','метательные звёзды','посох молний','ледяной посох','щит'];
const weaponById = Object.fromEntries(weaponNames.map((name,i)=>[name,{damage:[27,24,35,42,30,19,22,32,20,28,14,52,38,5,22,45,24,17,24,16,29,20,8][i],range:[65,130,70,66,105,48,370,320,300,190,270,560,220,160,80,85,160,150,260,230,320,270,65][i],cooldown:[600,700,950,1250,1000,420,800,1050,410,850,150,1700,1250,1300,1900,1600,900,180,950,330,1150,750,900][i],type:i<6||i===22?'melee':([14,15,16].includes(i)?'trap':'ranged')} ]));
const players = new Map();
const pickups = [];
const leaderboardPath = path.join(__dirname,'data','leaderboard.json');
fs.mkdirSync(path.dirname(leaderboardPath),{recursive:true});
let leaderboard = [];
try { leaderboard = JSON.parse(fs.readFileSync(leaderboardPath,'utf8')); } catch { leaderboard=[]; }
function saveBoard(){ try { fs.writeFileSync(leaderboardPath,JSON.stringify(leaderboard,null,2)); } catch(e){ console.error('Не удалось сохранить таблицу:',e.message); } }
function rand(max){return Math.random()*max;}
function seedPickups(){while(pickups.length<38){const id=weaponNames[Math.floor(rand(weaponNames.length))];pickups.push({id,x:80+rand(WORLD-160),y:80+rand(WORLD-160)});}}
seedPickups();
const upgradeDefs={
  power:{title:'Крепкие лапы',stat:'damage',amount:1.15}, swift:{title:'Лёгкие лапы',stat:'speed',amount:1.12}, heart:{title:'Дополнительное сердце',stat:'maxHp',amount:1.18}, reach:{title:'Ястребиный взгляд',stat:'vision',amount:1.12}, haste:{title:'Быстрая перезарядка',stat:'cooldown',amount:.88}, heal:{title:'Мёд бодрости',stat:'heal',amount:25}, vamp:{title:'Жажда победы',stat:'lifesteal',amount:.08}, shield:{title:'Крепкая шкурка',stat:'armor',amount:.08}, skill:{title:'Сила способности',stat:'skill',amount:1.2}
};
function newPlayer(socket,name,fighter){const f=fighterStats[fighter]||fighterStats.tank;const now=Date.now();return {id:socket.id,name:String(name||'Медоед').slice(0,18),fighter:fighterStats[fighter]?fighter:'tank',x:200+rand(WORLD-400),y:200+rand(WORLD-400),vx:0,vy:0,aim:0,hp:f.hp,maxHp:f.hp,speed:f.speed,damage:f.damage,vision:f.vision,kills:0,xp:0,level:1,weapon:null,armor:0,lifesteal:0,damageMul:1,speedMul:1,visionMul:1,cooldownMul:1,skillMul:1,lastAttack:0,lastSkill:0,input:{x:0,y:0,aim:0,attack:false},started:now,alive:true,respawnAt:0,ghostUntil:0,pendingCards:null};}
function publicPlayer(p){return {id:p.id,name:p.name,fighter:p.fighter,x:p.x,y:p.y,aim:p.aim,hp:p.hp,maxHp:p.maxHp,kills:p.kills,level:p.level,xp:p.xp,weapon:p.weapon,alive:p.alive,ghostUntil:p.ghostUntil};}
function pushBoard(p){const survived=Math.max(0,Math.floor((Date.now()-p.started)/1000));const old=leaderboard.find(x=>x.name===p.name);if(old){old.kills=Math.max(old.kills,p.kills);old.survival=Math.max(old.survival,survived);old.updated=Date.now();}else leaderboard.push({name:p.name,kills:p.kills,survival:survived,updated:Date.now()});leaderboard.sort((a,b)=>b.kills-a.kills||b.survival-a.survival);leaderboard=leaderboard.slice(0,100);saveBoard();io.emit('leaderboard',leaderboard.slice(0,10));return survived;}
const fighterThemes={tank:['shield','heart','skill'],ninja:['swift','haste','reach'],chemist:['skill','power','reach'],sniper:['reach','power','haste'],berserk:['power','heart','vamp'],engineer:['skill','haste','shield'],vampire:['vamp','heart','power'],ice:['skill','haste','reach'],pyro:['power','skill','haste'],ghost:['swift','shield','reach'],healer:['heart','skill','heal'],thief:['swift','power','haste'],smith:['shield','power','heart'],mimic:['skill','reach','haste'],boss:['heart','power','shield']};
function chooseCards(p){const theme=fighterThemes[p.fighter]||[];const pool=[...new Set([...theme,...Object.keys(upgradeDefs)])];return pool.sort(()=>Math.random()-.5).slice(0,3);}
function upgrade(p,id){const d=upgradeDefs[id];if(!d)return false;switch(d.stat){case'damage':p.damageMul*=d.amount;break;case'speed':p.speedMul*=d.amount;break;case'maxHp':p.maxHp=Math.round(p.maxHp*d.amount);p.hp=Math.min(p.maxHp,p.hp+35);break;case'vision':p.visionMul*=d.amount;break;case'cooldown':p.cooldownMul*=d.amount;break;case'heal':p.hp=Math.min(p.maxHp,p.hp+d.amount);break;case'lifesteal':p.lifesteal+=d.amount;break;case'armor':p.armor=Math.min(.55,p.armor+d.amount);break;case'skill':p.skillMul*=d.amount;break;}return true;}
function gainXp(p,amount){if(!p.alive)return; p.xp+=amount;let leveled=false;while(p.xp>=p.level*100){p.xp-=p.level*100;p.level++;leveled=true;}if(leveled){p.pendingCards=chooseCards(p);io.to(p.id).emit('level-up',{level:p.level,cards:p.pendingCards,defs:upgradeDefs});}}
function hurt(target,amount,attacker){if(!target.alive)return;const final=Math.max(1,amount*(1-target.armor));target.hp-=final;if(attacker&&attacker.id!==target.id){attacker.hp=Math.min(attacker.maxHp,attacker.hp+final*attacker.lifesteal);gainXp(attacker,Math.ceil(final*.15));}
 if(target.hp<=0){target.hp=0;target.alive=false;target.respawnAt=Date.now();if(attacker&&attacker.id!==target.id){attacker.kills++;gainXp(attacker,55);io.to(attacker.id).emit('toast','Победа! + убийство');}const survived=pushBoard(target);io.to(target.id).emit('death',{kills:target.kills,survival:survived,place:leaderboard.findIndex(x=>x.name===target.name)+1});}}
function attack(p,now){if(!p.alive||!p.input.attack)return;const w=weaponById[p.weapon]||{damage:p.damage,range:180,cooldown:520,type:'ranged'};const cd=w.cooldown*p.cooldownMul;if(now-p.lastAttack<cd)return;p.lastAttack=now;const range=w.range*(p.weapon==='снайперская винтовка'?1:1);const angle=p.aim;const radius=(p.weapon==='дробовик'||p.weapon==='огнемёт'||p.weapon==='гранаты')?0.38:0.22;let hitCount=0;
 for(const t of players.values()){if(t.id===p.id||!t.alive||now<t.ghostUntil)continue;const dx=t.x-p.x,dy=t.y-p.y,dist=Math.hypot(dx,dy);if(dist>range+20)continue;let da=Math.atan2(dy,dx)-angle;while(da>Math.PI)da-=Math.PI*2;while(da< -Math.PI)da+=Math.PI*2;if(w.type==='melee'?dist<range+24:Math.abs(da)<radius&&dist<range){let dmg=(w.damage||p.damage)*p.damageMul;if(p.fighter==='chemist'&&p.weapon==='токсичный баллон')dmg*=1.3;if(p.fighter==='berserk'&&p.hp<p.maxHp*.45)dmg*=1.5;if(p.fighter==='sniper'&&p.weapon==='снайперская винтовка')dmg*=1.35;if(['гранаты','мина','токсичный баллон'].includes(p.weapon))dmg*=Math.max(.45,1-dist/(range*1.5));hurt(t,dmg,p);hitCount++;if(w.type==='melee')break;}}
 if(hitCount)io.to(p.id).emit('hit',{count:hitCount});}
function ability(p,now){if(!p.alive||!p.input.ability||now-p.lastSkill<7000)return;p.lastSkill=now;const range=220*p.skillMul;io.to(p.id).emit('skill',{fighter:p.fighter});if(p.fighter==='tank'){p.hp=Math.min(p.maxHp,p.hp+40);p.armor=Math.min(.65,p.armor+.25);setTimeout(()=>{if(players.has(p.id))p.armor=Math.max(0,p.armor-.25);},2200);}
 else if(p.fighter==='ninja'){p.ghostUntil=now+1300;p.x+=Math.cos(p.aim)*155;p.y+=Math.sin(p.aim)*155;}
 else if(p.fighter==='healer'){for(const t of players.values())if(t.id===p.id||Math.hypot(t.x-p.x,t.y-p.y)<range)t.hp=Math.min(t.maxHp,t.hp+35*p.skillMul);}
 else if(p.fighter==='engineer'){p.hp=Math.min(p.maxHp,p.hp+15);for(const t of players.values())if(t.id!==p.id&&t.alive&&Math.hypot(t.x-p.x,t.y-p.y)<110)hurt(t,32*p.skillMul,p);}
 else {for(const t of players.values())if(t.id!==p.id&&t.alive&&Math.hypot(t.x-p.x,t.y-p.y)<range)hurt(t,(p.damage*.65+14)*p.skillMul,p);if(p.fighter==='vampire')p.hp=Math.min(p.maxHp,p.hp+22);if(p.fighter==='ghost')p.ghostUntil=now+900;}
}

io.on('connection',socket=>{
 socket.emit('leaderboard',leaderboard.slice(0,10));
 socket.on('join',data=>{const p=newPlayer(socket,String(data?.name||'Медоед'),String(data?.fighter||'tank'));players.set(socket.id,p);socket.emit('joined',{id:p.id,world:WORLD,player:publicPlayer(p)});});
 socket.on('input',data=>{const p=players.get(socket.id);if(!p||!p.alive)return;const x=Number(data?.x),y=Number(data?.y),aim=Number(data?.aim);p.input.x=Number.isFinite(x)?Math.max(-1,Math.min(1,x)):0;p.input.y=Number.isFinite(y)?Math.max(-1,Math.min(1,y)):0;p.input.aim=Number.isFinite(aim)?aim:p.aim;p.input.attack=!!data?.attack;p.input.ability=!!data?.ability;p.aim=p.input.aim;});
 socket.on('choose-upgrade',id=>{const p=players.get(socket.id),key=String(id);if(p&&p.alive&&p.pendingCards&&p.pendingCards.includes(key)&&upgrade(p,key)){p.pendingCards=null;socket.emit('upgrade-applied',{id:key});}});
 socket.on('disconnect',()=>{const p=players.get(socket.id);if(p&&p.kills>0)pushBoard(p);players.delete(socket.id);});
});
let tick=0;setInterval(()=>{const now=Date.now();for(const p of players.values())if(p.alive){let mx=p.input.x,my=p.input.y;const len=Math.hypot(mx,my);if(len>1){mx/=len;my/=len;}p.x=Math.max(35,Math.min(WORLD-35,p.x+mx*p.speed*p.speedMul/30));p.y=Math.max(35,Math.min(WORLD-35,p.y+my*p.speed*p.speedMul/30));for(let i=pickups.length-1;i>=0;i--){const q=pickups[i];if(Math.hypot(q.x-p.x,q.y-p.y)<39){p.weapon=q.id;pickups.splice(i,1);io.to(p.id).emit('toast',`Подобрано: ${q.id}`);setTimeout(()=>{if(pickups.length<45)pickups.push({id:weaponNames[Math.floor(rand(weaponNames.length))],x:80+rand(WORLD-160),y:80+rand(WORLD-160)});},1800);}}
 attack(p,now);ability(p,now);
 }if(++tick%1===0){io.emit('state',{players:[...players.values()].map(publicPlayer),pickups});}},1000/30);
app.get('/api/leaderboard',(req,res)=>res.json(leaderboard.slice(0,100)));
server.listen(PORT,'0.0.0.0',()=>console.log(`Медоед-Арена запущена: http://localhost:${PORT}`));
