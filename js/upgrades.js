// Карты: общий пул и тематические дополнения к каждому из 15 персонажей.
const common=[
{id:'power',icon:'💪',title:'Крепкие лапы',text:'+15% к урону',kind:'damage'},
{id:'swift',icon:'👟',title:'Лёгкие лапы',text:'+12% к скорости',kind:'speed'},
{id:'heart',icon:'❤️',title:'Дополнительное сердце',text:'+18% к запасу здоровья и лечение',kind:'maxHp'},
{id:'reach',icon:'👁️',title:'Ястребиный взгляд',text:'+12% к радиусу обзора',kind:'vision'},
{id:'haste',icon:'⏱️',title:'Быстрая перезарядка',text:'Атаки восстанавливаются быстрее',kind:'cooldown'},
{id:'heal',icon:'🍯',title:'Мёд бодрости',text:'Восстанавливает 25 здоровья',kind:'heal'},
{id:'vamp',icon:'🧛',title:'Жажда победы',text:'Лечитесь от нанесённого урона',kind:'lifesteal'},
{id:'shield',icon:'🧱',title:'Крепкая шкурка',text:'Снижает получаемый урон',kind:'armor'},
{id:'skill',icon:'✨',title:'Искра таланта',text:'+20% к силе способности',kind:'skill'}
];
const themes={tank:['shield','heart','skill'],ninja:['swift','haste','reach'],chemist:['skill','power','reach'],sniper:['reach','power','haste'],berserk:['power','heart','vamp'],engineer:['skill','haste','shield'],vampire:['vamp','heart','power'],ice:['skill','haste','reach'],pyro:['power','skill','haste'],ghost:['swift','shield','reach'],healer:['heart','skill','heal'],thief:['swift','power','haste'],smith:['shield','power','heart'],mimic:['skill','reach','haste'],boss:['heart','power','shield']};
export function getUpgradeCards(fighter,ids=[]){const themed=themes[fighter]||[];const combined=[...new Set([...ids,...themed,...common.map(x=>x.id)])];return combined.map(id=>common.find(c=>c.id===id)).filter(Boolean).slice(0,3);}
export function applyUpgradeLocal(stats,id){const c=common.find(x=>x.id===id);if(!c)return;switch(c.kind){case'damage':stats.damageMul*=1.15;break;case'speed':stats.speedMul*=1.12;break;case'maxHp':stats.maxHp=Math.round(stats.maxHp*1.18);stats.hp=Math.min(stats.maxHp,stats.hp+35);break;case'vision':stats.visionMul*=1.12;break;case'cooldown':stats.cooldownMul*=.88;break;case'heal':stats.hp=Math.min(stats.maxHp,stats.hp+25);break;case'lifesteal':stats.lifesteal+=.08;break;case'armor':stats.armor=Math.min(.55,stats.armor+.08);break;case'skill':stats.skillMul*=1.2;break;}}
export const allUpgradeCards=common;
