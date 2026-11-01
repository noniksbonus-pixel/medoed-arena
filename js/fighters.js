// Параметры и образы всех бойцов; сервер использует те же базовые характеристики.
export const FIGHTERS=[
{id:'tank',name:'Медоед-Танк',emoji:'🛡️',color:'#8e6653',hp:220,speed:150,damage:22,vision:520,skill:'Крепкий щит: временно снижает входящий урон.'},
{id:'ninja',name:'Медоед-Ниндзя',emoji:'🥷',color:'#49465f',hp:105,speed:255,damage:17,vision:610,skill:'Рывок и краткая невидимость.'},
{id:'chemist',name:'Медоед-Химик',emoji:'🧪',color:'#75b86e',hp:125,speed:175,damage:24,vision:540,skill:'Ядовитая волна вокруг бойца.'},
{id:'sniper',name:'Медоед-Снайпер',emoji:'🎯',color:'#6b92b8',hp:100,speed:165,damage:34,vision:760,skill:'Точный выстрел наносит усиленный урон.'},
{id:'berserk',name:'Медоед-Берсерк',emoji:'🔥',color:'#dc6255',hp:145,speed:195,damage:24,vision:560,skill:'Ярость: сильный удар по ближайшим врагам.'},
{id:'engineer',name:'Медоед-Инженер',emoji:'🔧',color:'#d5a14b',hp:130,speed:175,damage:19,vision:570,skill:'Ставит временную турель-всплеск вокруг себя.'},
{id:'vampire',name:'Медоед-Вампир',emoji:'🦇',color:'#875d8f',hp:150,speed:175,damage:22,vision:560,skill:'Вампирская волна и небольшое лечение.'},
{id:'ice',name:'Медоед-Ледовик',emoji:'❄️',color:'#6ebccc',hp:135,speed:165,damage:20,vision:580,skill:'Ледяной импульс замедляет врагов.'},
{id:'pyro',name:'Медоед-Пиромант',emoji:'🔥',color:'#e57a3e',hp:125,speed:185,damage:25,vision:560,skill:'Огненный взрыв поражает соседей.'},
{id:'ghost',name:'Медоед-Призрак',emoji:'👻',color:'#b6a8d4',hp:110,speed:225,damage:20,vision:630,skill:'Проходит сквозь опасность, становясь неуязвимым.'},
{id:'healer',name:'Медоед-Целитель',emoji:'💚',color:'#68b889',hp:145,speed:170,damage:18,vision:570,skill:'Лечит себя и ближайших игроков.'},
{id:'thief',name:'Медоед-Грабитель',emoji:'💰',color:'#c89b51',hp:120,speed:215,damage:20,vision:590,skill:'Быстрый удар; оружие усиливает его добычу.'},
{id:'smith',name:'Медоед-Кузнец',emoji:'⚒️',color:'#9a7160',hp:175,speed:155,damage:23,vision:540,skill:'Ударная волна и крепкая броня.'},
{id:'mimic',name:'Медоед-Мимик',emoji:'🎭',color:'#da8baa',hp:130,speed:185,damage:21,vision:570,skill:'Копирует боевую способность в виде волны.'},
{id:'boss',name:'Медоед-Босс',emoji:'👑',color:'#b87346',hp:280,speed:125,damage:29,vision:500,skill:'Мощный широкий удар; крупный и медленный.'}
];
export const getFighter=id=>FIGHTERS.find(f=>f.id===id)||FIGHTERS[0];
