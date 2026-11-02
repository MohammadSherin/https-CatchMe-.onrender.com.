// Mumbai map: 300 stations. Ids 1-66 are named landmarks; 67-300 are generated deterministically (same map every run).
const K=1.65,KX=1.85,KY=1.55,raw="Borivali,300,60;Kandivali,310,130;Malad,320,200;Goregaon,330,270;Andheri,340,350;Versova,230,330;Juhu,250,420;Santacruz,360,430;Airport,450,390;Powai,520,300;Mulund,600,170;Thane,640,70;Bhandup,600,250;Vikhroli,590,340;Ghatkopar,560,430;Kurla,470,480;BKC,390,500;Bandra,320,520;Mahim,320,590;Dharavi,400,580;Sion,470,590;Chembur,600,520;Dadar,370,660;Wadala,500,670;Worli,290,720;Lower Parel,360,750;Mahalaxmi,300,820;Haji Ali,230,850;Byculla,440,800;Mumbai Central,360,880;Grant Road,320,950;Malabar Hill,230,1000;Chowpatty,300,1040;Marine Drive,250,1100;Mazgaon,470,900;Cotton Green,540,780;Sewri,530,860;Crawford Market,400,1010;CSMT,450,1070;Fort,380,1130;Churchgate,300,1160;Nariman Point,250,1210;Colaba,340,1260;Gateway of India,440,1220;Sassoon Dock,370,1200;Vashi,700,620;Mankhurd,630,620;Belapur,720,780;JNPT,700,930;Jogeshwari,290,310;Matunga,430,650;Currey Road,400,780;Dahisar,285,15;Mira Road,400,40;Vile Parle,380,390;Sakinaka,440,330;Chandivali,500,370;Vidyavihar,520,470;Govandi,540,580;Antop Hill,440,720;Parel,400,720;Dongri,400,920;Pydhonie,470,970;Kalyan,740,150;Dombivli,710,260;Nerul,710,700";
const P={};raw.split(';').forEach((s,i)=>{const [n,x,y]=s.split(',');P[i+1]={id:i+1,n,x:Math.round(+x*2*KX),y:Math.round(+y*2*KY)}});
const LM=Object.values(P);let seed=7;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
const SUF=['Chowk','Naka','Market','Circle','Nagar','Road','Bazaar','Junction','Gali','Park','Colony','Sagar'];
const d0=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
for(let n=66,t=0;n<300&&t<400000;t++){const q={x:60+rnd()*1520*KX,y:60+rnd()*2560*KY};let near=null,nd=1e9;
 for(const l of LM){const dd=d0(l,q);if(dd<nd){nd=dd;near=l}}
 if(nd>150*K||Object.values(P).some(p=>d0(p,q)<66*K))continue;
 n++;P[n]={id:n,n:near.n+' '+SUF[n%12],x:Math.round(q.x),y:Math.round(q.y)}}
const ids=Object.keys(P).map(Number),adj={};ids.forEach(i=>adj[i]=[]);
const d=(a,b)=>Math.hypot(P[a].x-P[b].x,P[a].y-P[b].y);
const R={bus:[[1,3,5,8,18,19,25,27,31,41],[12,11,13,14,15,16,21,24,29,35,39],[4,56,9,16,17,23,26,52,62,38,40],[6,7,8,17,20,51,60,29],[15,22,47,46,66,48,49],[64,65,13,10,57,9],[43,42,41,40,39,63,35],[34,33,32,28,25]],
 metro:[[6,5,9,15],[1,5,18,23],[23,26,30,40,43],[12,15,22,46],[64,65,11,14,58,16],[2,4,56,10,13],[19,20,21,24,36],[31,38,63,35]],ferry:[[44,35],[44,49],[42,7],[37,46]]};
for(let r=0;r<10;r++){let cur=ids[rnd()*ids.length|0],ang=rnd()*6.283,route=[cur];
 for(let s=0;s<8;s++){const c=ids.filter(i=>{if(route.includes(i))return false;const dd=d(cur,i);if(dd<150*K||dd>270*K)return false;
   let da=Math.atan2(P[i].y-P[cur].y,P[i].x-P[cur].x)-ang;da=Math.atan2(Math.sin(da),Math.cos(da));return Math.abs(da)<.9});
  if(!c.length)break;const nx=c[rnd()*c.length|0];ang=Math.atan2(P[nx].y-P[cur].y,P[nx].x-P[cur].x);route.push(nx);cur=nx}
 if(route.length>=4)R.bus.push(route)}
const add=(a,b,t)=>{if(adj[a].some(e=>e.to==b&&e.t==t))return;adj[a].push({to:b,t});adj[b].push({to:a,t})};
for(const t of['bus','metro'])R[t].forEach(r=>{for(let i=0;i<r.length-1;i++)add(r[i],r[i+1],t)});
R.ferry.forEach(([a,b])=>add(a,b,'ferry'));
// taxi: greedy non-crossing proximity graph (max 5 per station)
const ccw=(a,b,c)=>(P[c].y-P[a].y)*(P[b].x-P[a].x)>(P[b].y-P[a].y)*(P[c].x-P[a].x);
const inter=(a,b,c,e)=>a!=c&&a!=e&&b!=c&&b!=e&&ccw(a,c,e)!=ccw(b,c,e)&&ccw(a,b,c)!=ccw(a,b,e);
const pairs=[],tx=[],dg={};ids.forEach(i=>dg[i]=0);
ids.forEach(a=>ids.forEach(b=>{if(a<b){const dd=d(a,b);if(dd<175*K)pairs.push([dd,a,b])}}));pairs.sort((x,y)=>x[0]-y[0]);
for(const[,a,b]of pairs){if(dg[a]>=5||dg[b]>=5||tx.some(([c,e])=>inter(a,b,c,e)))continue;tx.push([a,b]);dg[a]++;dg[b]++;add(a,b,'taxi')}
ids.forEach(a=>{const g=()=>adj[a].filter(e=>e.t=='taxi').length;ids.filter(b=>b!=a).sort((x,y)=>d(a,x)-d(a,y)).forEach(b=>{if(g()<2)add(a,b,'taxi')})});
const comps=()=>{const c={};let k=0;ids.forEach(i=>{if(c[i])return;k++;const q=[i];c[i]=k;while(q.length){const a=q.pop();adj[a].forEach(e=>{if(e.t=='taxi'&&!c[e.to]){c[e.to]=k;q.push(e.to)}})}});return[c,k]};
for(let[c,k]=comps();k>1;[c,k]=comps()){let best=[1e9];ids.forEach(a=>ids.forEach(b=>{if(c[a]==1&&c[b]!=1){const dd=d(a,b);if(dd<best[0])best=[dd,a,b]}}));add(best[1],best[2],'taxi')}
const edges=[];ids.forEach(a=>adj[a].forEach(e=>{if(a<e.to)edges.push({a,b:e.to,t:e.t})}));
// scenery: parks, lake, landmark icons (pure decoration, drawn by the client)
const near=q=>{let m=1e9;for(const i of ids){const dd=d0(P[i],q);if(dd<m)m=dd}return m};
const cand=[];for(let t=0;t<12000&&cand.length<1500;t++){const q={x:60+rnd()*1520*KX,y:60+rnd()*2560*KY};let nd=1e9;for(const l of LM)nd=Math.min(nd,d0(l,q));if(nd>115*K)continue;const c=near(q);if(c>=46*K)cand.push({x:Math.round(q.x),y:Math.round(q.y),c})}
const parks=[],lakes=[],PR=c=>Math.round(Math.min(c.c*.8,80*K));
const free=(q,r)=>[...parks,...lakes.map(l=>({x:l.x,y:l.y,r:Math.max(l.rx,l.ry)}))].every(p=>d0(p,q)>p.r+r+14);
const pick=a=>{let b=null;for(const c of cand){if(d0(P[a],c)>330*K||!free(c,PR(c)))continue;if(!b||c.c>b.c)b=c}return b};
for(const[n,a]of[['Sanjay Gandhi Park',1],['Aarey Forest',4],['Mahim Nature Park',19],['Shivaji Park',23],['Race Course',27],['Hanging Gardens',32],['Oval Maidan',41],['Joggers Park',18],['Rani Baug',29],['Cooperage Garden',40]]){const c=pick(a);if(c)parks.push({x:c.x,y:c.y,r:PR(c),n})}
{const c=pick(10);if(c){const r=PR(c);lakes.push({x:c.x,y:c.y,rx:Math.round(r*1.1),ry:Math.round(r*.68),n:'Powai Lake'})}}
for(let i=cand.length-1;i>0;i--){const j=rnd()*(i+1)|0;[cand[i],cand[j]]=[cand[j],cand[i]]}
for(const c of cand){if(parks.length>=30)break;if(free(c,PR(c)))parks.push({x:c.x,y:c.y,r:PR(c)})}
const icons={44:'🏛️',39:'🚉',28:'🕌',9:'✈️',33:'🏖️',49:'🚢',46:'🌉',26:'🏙️',18:'🎬'};
module.exports={P,adj,edges,K,parks,lakes,icons,W:Math.round(1640*KX),H:Math.round(2680*KY),XS:[2,3,7,10,17,20,25,29,32,38,48,56,60],DS:[1,4,6,8,11,12,14,16,19,22,24,27,30,34,37,41,46,51]};
