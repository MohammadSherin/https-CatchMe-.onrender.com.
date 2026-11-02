const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws'),M=require('./map');
const REVEAL=[3,8,13,18,24],ROUNDS=24,rooms={},PUB=path.join(__dirname,'public');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{const f=path.join(PUB,q.url.split('?')[0]=='/'?'index.html':q.url.split('?')[0]);
 if(!f.startsWith(PUB)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 r.writeHead(200,{'Content-Type':mime[path.extname(f)]||'text/plain'});fs.createReadStream(f).pipe(r)});
const wss=new WebSocketServer({server:srv});
const rid=()=>Math.random().toString(36).slice(2,10),sh=a=>[...a].sort(()=>Math.random()-.5);
const send=(p,m)=>p.ws&&p.ws.readyState==1&&p.ws.send(JSON.stringify(m));
const mk=()=>{let c;do{c=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random()*24|0]).join('')}while(rooms[c]);return c};
function legal(room,p){const occ=new Set(room.players.filter(q=>q.role=='det'&&q!=p).map(q=>q.pos)),out=[];
 for(const e of M.adj[p.pos]){if(occ.has(e.to))continue;
  if(p.role=='det'){if(e.t!='ferry'&&p.tk[e.t]>0)out.push({to:e.to,ticket:e.t})}
  else{if(e.t!='ferry')out.push({to:e.to,ticket:e.t});if(p.tk.black>0)out.push({to:e.to,ticket:'black'})}}
 return out}
function view(room,me){const over=room.phase=='over';
 return{t:'state',code:room.code,phase:room.phase,host:room.host,turn:room.turn,left:room.left,fresh:room.fresh,winner:room.winner,why:room.why,log:room.log,seen:room.seen,round:room.log.length,me:me.id,
  players:room.players.map(p=>({id:p.id,name:p.name,role:p.role,on:!!p.ws,pos:p.role=='x'&&!(over||p==me)?null:p.pos,tk:p.role=='x'&&!(over||p==me)?null:p.tk})),
  legal:room.phase=='play'&&room.turn==me.id?legal(room,me):[],trail:over?room.trail:null,notice:room.notice||''}}
const bc=room=>room.players.forEach(p=>send(p,view(room,p)));
function start(room){const ps=room.players,xi=Math.random()*ps.length|0,xs=sh(M.XS),ds=sh(M.DS),nd=ps.length-1;let k=0;
 ps.forEach((p,i)=>{if(i==xi){p.role='x';p.pos=xs[0];p.tk={black:Math.max(4,nd),dbl:2}}else{p.role='det';p.pos=ds[k++];p.tk={taxi:10,bus:8,metro:4}}});
 Object.assign(room,{notice:'',phase:'play',log:[],seen:null,left:1,fresh:true,turn:ps[xi].id,winner:null,why:'',trail:[ps[xi].pos],di:0})}
function nextDet(room,i){const ds=room.players.filter(q=>q.role=='det');
 for(;i<ds.length;i++)if(legal(room,ds[i]).length){room.turn=ds[i].id;room.di=i;return true}return false}
function toLobby(room,why){Object.assign(room,{phase:'lobby',notice:why,turn:null});room.players.forEach(p=>p.role=null);bc(room)}
function roundEnd(room){const x=room.players.find(q=>q.role=='x');
 if(room.log.length>=ROUNDS)return end(room,'x','Mr. X escaped for all 24 moves!');
 if(!legal(room,x).length)return end(room,'det','Mr. X is trapped!');
 Object.assign(room,{turn:x.id,left:1,fresh:true})}
function kick(room,host,id){const t=room.players.find(p=>p.id==id);if(!t||t==host||!(room.phase=='lobby'||!t.ws))return;
 send(t,{t:'kicked'});if(t.ws)t.ws.close();
 const ds=room.players.filter(p=>p.role=='det'),idx=ds.indexOf(t),was=room.turn==t.id;
 room.players=room.players.filter(p=>p!=t);
 if(room.phase=='play'){
  if(t.role=='x'||ds.length<=1)return toLobby(room,`${t.name} was removed by the host - game stopped`);
  if(idx<room.di)room.di--;
  if(was&&!nextDet(room,idx)){roundEnd(room);if(room.phase!='play')return}}
 bc(room)}
function end(room,w,why){Object.assign(room,{phase:'over',winner:w,why,turn:null});bc(room)}
function move(room,p,to,tk){
 if(room.phase!='play'||room.turn!=p.id||!legal(room,p).some(m=>m.to==to&&m.ticket==tk))return;
 const x=room.players.find(q=>q.role=='x');
 if(p.role=='x'){
  if(tk=='black')p.tk.black--;
  p.pos=to;room.trail.push(to);room.fresh=false;
  const e={k:tk,rev:null};room.log.push(e);
  if(REVEAL.includes(room.log.length)){e.rev=to;room.seen={pos:to,n:room.log.length}}
  if(--room.left>0){if(!legal(room,p).length)return end(room,'det','Mr. X ran out of moves!');return bc(room)}
  if(!nextDet(room,0))return end(room,'x','The detectives are stuck without tickets!');
 }else{
  p.tk[tk]--;p.pos=to;
  if(to==x.pos)return end(room,'det',`${p.name} caught Mr. X at ${M.P[to].n}!`);
  if(!nextDet(room,room.di+1)){roundEnd(room);if(room.phase!='play')return}
 }
 bc(room)}
wss.on('connection',ws=>{
 ws.send(JSON.stringify({t:'map',...M.view,reveal:REVEAL,rounds:ROUNDS}));
 ws.dead=false;ws.on('pong',()=>ws.dead=false);let room,pl;const err=(msg,fatal)=>ws.send(JSON.stringify({t:'err',msg,fatal}));
 const joined=()=>{send(pl,{t:'hello',pid:pl.id,code:room.code});bc(room)};
 ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch{return}
  const name=String(m.name||'Player').slice(0,14);
  if(m.t=='create'){const code=mk();room=rooms[code]={code,players:[],phase:'lobby',log:[],trail:[]};pl={id:rid(),name,ws};room.players.push(pl);room.host=pl.id;return joined()}
  if(m.t=='join'){const r=rooms[String(m.code||'').toUpperCase()];if(!r)return err('Room not found',1);
   const old=r.players.find(p=>p.id==m.pid);
   if(old){old.ws=ws;pl=old}else{if(r.phase!='lobby')return err('Game already started');if(r.players.length>=9)return err('Room is full (max 9)');pl={id:rid(),name,ws};r.players.push(pl)}
   room=r;return joined()}
  if(!room||!pl)return;
  if(m.t=='start'&&pl.id==room.host&&room.phase=='lobby'&&room.players.length>=3){start(room);bc(room)}
  else if(m.t=='move')move(room,pl,m.to,m.ticket);
  else if(m.t=='double'&&pl.role=='x'&&room.turn==pl.id&&room.fresh&&room.left==1&&pl.tk.dbl>0&&room.log.length<=ROUNDS-2){pl.tk.dbl--;room.left=2;bc(room)}
  else if(m.t=='again'&&pl.id==room.host&&room.phase=='over')toLobby(room,'');
  else if(m.t=='kick'&&pl.id==room.host)kick(room,pl,m.id);
 });
 ws.on('close',()=>{if(!pl||pl.ws!==ws)return;pl.ws=null;const r=room;bc(r);
  setTimeout(()=>{if(r.phase=='lobby'&&!pl.ws){r.players=r.players.filter(p=>p!=pl);if(r.host==pl.id&&r.players[0])r.host=r.players[0].id;bc(r)}
   if(r.players.every(p=>!p.ws))setTimeout(()=>{if(r.players.every(p=>!p.ws))delete rooms[r.code]},36e5)},6e4)});
});
setInterval(()=>wss.clients.forEach(c=>{if(c.dead)return c.terminate();c.dead=true;c.ping()}),25000);
srv.listen(process.env.PORT||3000,()=>console.log('Catch Me running on port '+(process.env.PORT||3000)));
