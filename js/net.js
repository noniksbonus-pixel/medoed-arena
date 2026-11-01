// Socket.IO клиент: соединение и события сервера.
export class Network{
 constructor(){this.socket=io({transports:['websocket','polling']});this.state=null;this.leaderboard=[];this.handlers={};this.socket.on('state',s=>{this.state=s;this.emit('state',s);});this.socket.on('leaderboard',b=>{this.leaderboard=b;this.emit('leaderboard',b);});for(const event of ['joined','death','level-up','upgrade-applied','toast','hit','skill'])this.socket.on(event,data=>this.emit(event,data));this.socket.on('connect',()=>this.emit('connect'));this.socket.on('disconnect',()=>this.emit('disconnect'));}
 on(event,fn){(this.handlers[event]??=[]).push(fn);}emit(event,data){for(const fn of this.handlers[event]||[])fn(data);}
 join(name,fighter){this.socket.emit('join',{name,fighter});}sendInput(input){this.socket.emit('input',input);}chooseUpgrade(id){this.socket.emit('choose-upgrade',id);}
}
