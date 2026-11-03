function mumbai(){
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
const out={P,adj,edges,K,parks,lakes,icons,W:Math.round(1640*KX),H:Math.round(2680*KY),XS:[2,3,7,10,17,20,25,29,32,38,48,56,60],DS:[1,4,6,8,11,12,14,16,19,22,24,27,30,34,37,41,46,51]};
out.view={id:'mumbai',style:'blob',P,edges,K,parks,lakes,icons,W:out.W,H:out.H};
return out;
}

function dubai(){
 const S=70,LON0=54.95,LAT0=25.42,KX=100.9,KY=110.6,W=3900,H=4270,G=108,TOT=400;
 const xy=(lo,la)=>[Math.round((lo-LON0)*KX*S),Math.round((LAT0-la)*KY*S)];
 let seed=11;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
 const nearOn=(x,y,p)=>{let b={d:1e9};for(let i=0;i<Math.max(1,p.length-1);i++){const a=p[i],c=p[Math.min(i+1,p.length-1)],dx=c[0]-a[0],dy=c[1]-a[1],l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l)),px=a[0]+t*dx,py=a[1]+t*dy,d=Math.hypot(x-px,y-py);if(d<b.d)b={d,x:px,y:py}}return b};
 const pip=(x,y,pg)=>{let c=false;for(let i=0,j=pg.length-1;i<pg.length;j=i++){const[a,b]=pg[i],[p,q]=pg[j];if((b>y)!=(q>y)&&x<(p-a)*(y-b)/(q-b)+a)c=!c}return c};
 const coastLL=[[54.965,24.935],[55.000,24.972],[55.045,25.000],[55.085,25.030],[55.105,25.045],[55.120,25.060],[55.131,25.076],[55.140,25.089],[55.153,25.099],[55.165,25.108],[55.178,25.123],[55.190,25.140],[55.205,25.165],[55.225,25.190],[55.242,25.211],[55.256,25.231],[55.264,25.244],[55.272,25.256],[55.280,25.266],[55.290,25.273],[55.2985,25.280],[55.310,25.290],[55.325,25.299],[55.340,25.308],[55.355,25.317],[55.370,25.327]];
 const inLL=[[55.430,25.290],[55.450,25.220],[55.440,25.140],[55.420,25.070],[55.400,24.950],[55.300,24.900],[55.220,24.880],[55.150,24.865],[55.050,24.875],[54.980,24.890],[54.940,24.910]];
 const coast=coastLL.map(p=>xy(...p)),land=[...coast,...inLL.map(p=>xy(...p))];
 // ---- water features (inside the land polygon): creek, canal, lakes
 const waters=[{p:[[55.2985,25.2800],[55.3000,25.2730],[55.3030,25.2670],[55.3090,25.2600],[55.3180,25.2520],[55.3260,25.2440],[55.3330,25.2380],[55.3400,25.2300],[55.3450,25.2180],[55.3470,25.2060],[55.3430,25.1950],[55.3380,25.1890]].map(p=>xy(...p)),w:30,k:'creek'},
  {p:[[55.3380,25.1890],[55.3100,25.1820],[55.2850,25.1780],[55.2680,25.1850],[55.2550,25.1960],[55.2420,25.2110]].map(p=>xy(...p)),w:26,k:'canal'},
  {p:[[55.1325,25.0770],[55.1390,25.0735],[55.1450,25.0690],[55.1500,25.0640],[55.1560,25.0610]].map(p=>xy(...p)),w:22,k:'marina'}];
 const lakes=[{x:xy(55.3500,24.9400)[0],y:xy(55.3500,24.9400)[1],rx:80,ry:44,n:'Al Qudra Lakes'},{x:xy(55.3680,24.9300)[0],y:xy(55.3680,24.9300)[1],rx:60,ry:36},{x:xy(55.3340,25.1810)[0],y:xy(55.3340,25.1810)[1],rx:46,ry:30,n:'Ras Al Khor'}];
 const inWater=(x,y,m)=>waters.some(w=>nearOn(x,y,w.p).d<w.w/2+(m||0))||lakes.some(l=>((x-l.x)/(l.rx+m))**2+((y-l.y)/(l.ry+m))**2<1);
 // ---- islands & Palm Jumeirah (enlarged 1.5x so stations fit): capsule shapes
 const caps=[];const cap=(p,r)=>caps.push({p,r});
 const pb=xy(55.1530,25.0990),pt=xy(55.1171,25.1304),LL=Math.hypot(pt[0]-pb[0],pt[1]-pb[1]),dv=[(pt[0]-pb[0])/LL,(pt[1]-pb[1])/LL],pv=[-dv[1],dv[0]],U=S*1.8;
 const at=(u,v)=>[Math.round(pb[0]+dv[0]*u*U+pv[0]*v*U),Math.round(pb[1]+dv[1]*u*U+pv[1]*v*U)];
 const flen=k=>1.15*(1-.15*Math.abs(k-3.5)/3.5),fu=k=>.9+k*.386;
 cap([at(0,0),at(3.9,0)],12);
 for(let k=0;k<8;k++){cap([at(fu(k),0),at(fu(k),-flen(k))],8);cap([at(fu(k),0),at(fu(k),flen(k))],8)}
 const arc=(a,b,st,sg)=>{const o=[];for(let t=a;sg>0?t<=b+.01:t>=b-.01;t+=st*sg)o.push(at(2.9+2.45*Math.cos(t*Math.PI/180),2.45*Math.sin(t*Math.PI/180)));return o};
 cap(arc(-115,115,5,1),9);
 const bw=xy(55.1214,25.0795),di1=xy(55.3060,25.3150),di2=xy(55.3290,25.3250),baa=xy(55.1862,25.1425);
 cap([bw],26);cap([di1],38);cap([di2],38);cap([di1,di2],9);cap([baa],20);
 const inCaps=(x,y)=>caps.some(c=>nearOn(x,y,c.p).d<=c.r);
 const onLand=(x,y)=>pip(x,y,land)||inCaps(x,y);
 // ---- named landmarks (real places, approximate real positions)
 const NM=[['Expo City Dubai',55.1520,24.9650,'🌐'],['Al Maktoum Airport',55.1610,24.8980,'🛫'],['Jebel Ali Port',55.0560,25.0000,'🚢'],['Dubai Parks & Resorts',55.0050,24.9220,'🎢'],['Ibn Battuta Mall',55.1180,25.0450,'🛍️'],['Jebel Ali Village',55.0950,25.0150],['Discovery Gardens',55.1450,25.0390],['Dubai Marina',55.1450,25.0700],['JBR Beach',55.1315,25.0775],['Dubai Internet City',55.1650,25.0960],['Jumeirah Lakes Towers',55.1520,25.0640],['Emirates Hills',55.1720,25.0650],['Al Sufouh',55.1750,25.1150],['Mall of the Emirates',55.2008,25.1181,'🛍️'],['Al Barsha South',55.2050,25.0900],['Umm Suqeim',55.2150,25.1480],['Burj Al Arab',55.1900,25.1400],['Al Quoz',55.2300,25.1350],['Dubai Hills',55.2500,25.1050],['Motor City',55.2400,25.0480],['Dubai Sports City',55.2100,25.0380,'🏟️'],['Arabian Ranches',55.2750,25.0550],['Dubai Miracle Garden',55.2450,25.0700,'🌸'],['Global Village',55.3080,25.0720,'🎪'],['Dubai Investments Park',55.1700,24.9800],['JAFZA',55.1050,25.0100],['Jumeirah Golf Estates',55.1850,25.0250],['Meydan',55.3010,25.1590,'🏇'],['Nad Al Sheba',55.3250,25.1620],['Business Bay',55.2650,25.1830],['Burj Khalifa / Dubai Mall',55.2744,25.1972],['DIFC',55.2808,25.2119,'🏙️'],['Dubai Frame',55.3000,25.2352],['Safa Park',55.2380,25.1830],['Jumeirah Canal Pier',55.2470,25.2090],['Jumeirah Mosque',55.2640,25.2330,'🕌'],['Satwa',55.2700,25.2230],['Karama',55.3040,25.2437],['Healthcare City',55.3170,25.2280],['Bur Dubai',55.2972,25.2638],['Port Rashid',55.2820,25.2650,'🚢'],['Deira Gold Souk',55.3070,25.2740,'💰'],['Al Ras',55.3120,25.2830],['Baniyas Square',55.3200,25.2700],['Port Saeed',55.3350,25.2600],['Dubai Airport DXB',55.3657,25.2532,'✈️'],['Al Garhoud',55.3500,25.2400],['Festival City',55.3520,25.2200,'🛍️'],['Creek Harbour',55.3530,25.2020,'🌇'],['Ras Al Khor',55.3340,25.1800,'🦩'],['Mirdif',55.4200,25.2200],['Al Nahda',55.3700,25.2890],['Al Qusais',55.3900,25.2850],['Al Mamzar',55.3430,25.3030],['Silicon Oasis',55.3830,25.1230],['Academic City',55.4050,25.1100],['Al Warqa',55.4300,25.1900],['Rashidiya',55.3920,25.2330],['Al Qudra Lakes',55.3500,24.9400,'🦢'],['Al Jadaf',55.3260,25.2120],['Mushrif Park',55.4000,25.2550],['International City',55.4100,25.1600],['Dubai South',55.1900,24.9100]];
 const named=NM.map(([n,lo,la,ic])=>{const q=xy(lo,la);return{n,ic,x:q[0],y:q[1]}});
 for(let it=0;it<70;it++){for(const q of named){let k=0;while(!pip(q.x,q.y,land)&&k++<60){q.x+=7;q.y+=7}
   for(const w of waters){const r=nearOn(q.x,q.y,w.p),m=w.w/2+20;if(r.d<m){const dx=q.x-r.x,dy=q.y-r.y,l=Math.hypot(dx,dy)||1;q.x+=dx/l*(m-r.d);q.y+=dy/l*(m-r.d)}}}
  for(let i=0;i<named.length;i++)for(let j=i+1;j<named.length;j++){const a=named[i],b=named[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<G-6){const m=(G-d)/2,dx=(a.x-b.x)/(d||1),dy=(a.y-b.y)/(d||1);a.x+=dx*m;a.y+=dy*m;b.x-=dx*m;b.y-=dy*m}}}
 const P={},ID={},special=[];let n=0;const addP=(nm,x,y,ic,kind)=>{n++;P[n]={id:n,n:nm,x:Math.round(x),y:Math.round(y)};if(kind)P[n].k=kind;ID[nm]=n;if(ic)icons[n]=ic;return n};
 const icons={};named.forEach(q=>addP(q.n,q.x,q.y,q.ic));
 // Palm Jumeirah stations
 const palmIds=[];const ps=(nm,pos,ic)=>{palmIds.push(addP(nm,pos[0],pos[1],ic,'i'))};
 ps('Palm Trunk',at(fu(1),0));ps('Golden Mile (Palm Hub)',at(fu(5),0),'🌴');ps('Palm Trunk North',at(3.9,0));
 ps('Palm West Frond',at(fu(1),-flen(1)));ps('Palm East Frond',at(fu(1),flen(1)));ps('Palm West Frond North',at(fu(5),-flen(5)));ps('Palm East Frond North',at(fu(5),flen(5)));
 const cr=[-100,-50,0,50,100].map(t=>at(2.9+2.45*Math.cos(t*Math.PI/180),2.45*Math.sin(t*Math.PI/180)));
 ['West Crescent','Palm Crescent West','Atlantis The Palm','Palm Crescent East','East Crescent'].forEach((nm,i)=>ps(nm,cr[i],i==2?'🏨':null));
 addP('Bluewaters Island',bw[0],bw[1],'🎡','i');addP('Deira Islands West',di1[0],di1[1],null,'i');addP('Deira Islands East',di2[0],di2[1],null,'i');
 const fixed=n;
 // generated stations
 const NMP=named.filter(q=>!/Palm/.test(q.n)),SUF=['Square','Road','Gate','Plaza','Heights','Towers','Walk','Park','Souk','Residences','Junction','Corniche'];
 for(let t=0;n<TOT&&t<900000;t++){const x=40+rnd()*(W-80),y=40+rnd()*(H-80);if(!pip(x,y,land)||inWater(x,y,18))continue;
  const dc=nearOn(x,y,coast).d;if(rnd()>.2+.8*Math.exp(-dc/1000))continue;
  let ok=true;for(let i=1;i<=n;i++){if(Math.hypot(P[i].x-x,P[i].y-y)<G){ok=false;break}}if(!ok)continue;
  let nl=null,nd=1e9;for(const q of NMP){const d=Math.hypot(q.x-x,q.y-y);if(d<nd){nd=d;nl=q}}
  addP(nl.n+' '+SUF[n%12],x,y)}
 const ids=Array.from({length:n},(_,i)=>i+1),adj={};ids.forEach(i=>adj[i]=[]);
 const d=(a,b)=>Math.hypot(P[a].x-P[b].x,P[a].y-P[b].y),isl=i=>P[i].k=='i';
 const add=(a,b,t,via)=>{if(adj[a].some(e=>e.to==b&&e.t==t))return;adj[a].push({to:b,t,via});adj[b].push({to:a,t,via:via?[...via].reverse():undefined})};
 const segLand=(a,b)=>{for(let k=1;k<9;k++){const x=P[a].x+(P[b].x-P[a].x)*k/9,y=P[a].y+(P[b].y-P[a].y)*k/9;if(!onLand(x,y))return false}return true};
 // metro, ferry, bus
 const L=nm=>{if(!ID[nm])throw new Error('no station '+nm);return ID[nm]};
 const metro=[['Rashidiya','Dubai Airport DXB','Al Garhoud','Baniyas Square','Karama','DIFC','Burj Khalifa / Dubai Mall','Business Bay','Mall of the Emirates','Dubai Internet City','Dubai Marina','Jumeirah Lakes Towers','Jebel Ali Village','Expo City Dubai','Al Maktoum Airport'],['Al Qusais','Al Nahda','Baniyas Square','Deira Gold Souk','Al Ras','Port Rashid','Karama','Healthcare City','Al Jadaf','Creek Harbour'],['Mirdif','Al Warqa','International City','Silicon Oasis','Academic City'],['Umm Suqeim','Al Quoz','Dubai Hills','Motor City','Arabian Ranches']].map(r=>r.map(L));
 metro.forEach(r=>{for(let i=0;i<r.length-1;i++)add(r[i],r[i+1],'metro')});
 const creek=waters[0].p,off=(ll,dd)=>{const q=xy(...ll);return[q[0]-dd*.707,q[1]-dd*.707]};
 const sideSign=(()=>{const a=arc(-150,-30,10,1),b=arc(150,30,10,-1),w=bw;return Math.hypot(a[0][0]-w[0],a[0][1]-w[1])<Math.hypot(b[0][0]-w[0],b[0][1]-w[1])?-1:1})();
 const outer=(a,b,st)=>{const o=[];for(let t=a;t<=b+.01;t+=st)o.push(at(2.9+3.15*Math.cos(t*Math.PI/180),sideSign*3.15*Math.sin(t*Math.PI/180)));return o};
 const ferries=[['JBR Beach','Bluewaters Island',[]],['Bluewaters Island','Atlantis The Palm',outer(-150,0,25).slice(0)],['Port Rashid','Jumeirah Canal Pier',[off([55.2720,25.2560],120),off([55.2560,25.2310],120),off([55.2420,25.2110],120)]],['Bur Dubai','Deira Gold Souk',[creek[3]]],['Bur Dubai','Festival City',creek.slice(3,9)],['Festival City','Creek Harbour',creek.slice(8,11)],['Al Ras','Deira Islands West',[off([55.3050,25.2900],130),off([55.3080,25.3050],110)]]];
 ferries.forEach(([a,b,v])=>add(L(a),L(b),'ferry',v.map(q=>[Math.round(q[0]),Math.round(q[1])])));
 // explicit roads: Palm crescent (follows the arc), tunnel, bridges
 const pid=nm=>L(nm);
 [['West Crescent','Palm Crescent West',-100,-50],['Palm Crescent West','Atlantis The Palm',-50,0],['Atlantis The Palm','Palm Crescent East',0,50],['Palm Crescent East','East Crescent',50,100]].forEach(([a,b,t1,t2])=>add(pid(a),pid(b),'taxi',arc(t1,t2,10,1).slice(1,-1)));
 add(pid('Palm Trunk North'),pid('Atlantis The Palm'),'taxi');add(pid('Palm Trunk'),L('Dubai Internet City'),'taxi',[pb]);add(pid('Bluewaters Island'),pid('JBR Beach'),'taxi');
 add(pid('Deira Islands West'),pid('Deira Islands East'),'taxi');add(pid('Deira Islands West'),pid('Al Ras'),'taxi');
 // random bus routes (never over open sea, never on the Palm / islands)
 const bus=[];const land_ids=ids.filter(i=>!isl(i));
 for(let r=0;r<18;r++){let cur=land_ids[rnd()*land_ids.length|0],ang=rnd()*6.283,route=[cur];
  for(let s=0;s<8;s++){const c=land_ids.filter(i=>{if(route.includes(i))return false;const dd=d(cur,i);if(dd<150||dd>340)return false;let da=Math.atan2(P[i].y-P[cur].y,P[i].x-P[cur].x)-ang;da=Math.atan2(Math.sin(da),Math.cos(da));return Math.abs(da)<.9&&segLand(cur,i)});
   if(!c.length)break;const nx=c[rnd()*c.length|0];ang=Math.atan2(P[nx].y-P[cur].y,P[nx].x-P[cur].x);route.push(nx);cur=nx}
  if(route.length>=4)bus.push(route)}
 bus.forEach(r=>{for(let i=0;i<r.length-1;i++)add(r[i],r[i+1],'bus')});
 // taxi: greedy non-crossing proximity graph restricted to land
 const ccw=(a,b,c)=>(P[c].y-P[a].y)*(P[b].x-P[a].x)>(P[b].y-P[a].y)*(P[c].x-P[a].x),inter=(a,b,c,e)=>a!=c&&a!=e&&b!=c&&b!=e&&ccw(a,c,e)!=ccw(b,c,e)&&ccw(a,b,c)!=ccw(a,b,e);
 const tx=[],dg={};ids.forEach(i=>dg[i]=adj[i].filter(e=>e.t=='taxi').length);ids.forEach(a=>adj[a].forEach(e=>{if(e.t=='taxi'&&a<e.to)tx.push([a,e.to])}));
 const pairs=[];ids.forEach(a=>ids.forEach(b=>{if(a<b){const dd=d(a,b);if(dd<215)pairs.push([dd,a,b])}}));pairs.sort((x,y)=>x[0]-y[0]);
 for(const[,a,b]of pairs){if(dg[a]>=5||dg[b]>=5||!segLand(a,b)||tx.some(([c,e])=>inter(a,b,c,e)))continue;tx.push([a,b]);dg[a]++;dg[b]++;add(a,b,'taxi')}
 ids.filter(a=>!isl(a)).forEach(a=>{const g=()=>adj[a].filter(e=>e.t=='taxi').length,cs=ids.filter(b=>b!=a).sort((x,y)=>d(a,x)-d(a,y));cs.forEach(b=>{if(g()<2&&segLand(a,b))add(a,b,'taxi')});cs.forEach(b=>{if(g()<2&&!isl(a)==!isl(b))add(a,b,'taxi')})});
 const comps=()=>{const c={};let k=0;ids.forEach(i=>{if(c[i])return;k++;const q=[i];c[i]=k;while(q.length){const a=q.pop();adj[a].forEach(e=>{if(e.t=='taxi'&&!c[e.to]){c[e.to]=k;q.push(e.to)}})}});return[c,k]};
 for(let[c,k]=comps();k>1;[c,k]=comps()){let best=[1e9];ids.forEach(a=>ids.forEach(b=>{if(c[a]==c[ids[0]]&&c[b]!=c[ids[0]]){const dd=d(a,b);if(dd<best[0])best=[dd,a,b]}}));add(best[1],best[2],'taxi')}
 const edges=[];ids.forEach(a=>adj[a].forEach(e=>{if(a<e.to){const o={a,b:e.to,t:e.t};if(e.via&&e.via.length)o.v=e.via;edges.push(o)}}));
 // parks (green areas) away from stations, water and the sea
 const cand=[];for(let t=0;t<30000&&cand.length<900;t++){const x=40+rnd()*(W-80),y=40+rnd()*(H-80);if(!pip(x,y,land)||inWater(x,y,40))continue;let m=1e9;for(const i of ids){const dd=Math.hypot(P[i].x-x,P[i].y-y);if(dd<m)m=dd}if(m>=66)cand.push({x:Math.round(x),y:Math.round(y),c:m})}
 const parks=[],PR=c=>Math.round(Math.min(c.c*.8,92)),free=(q,r)=>[...parks,...lakes.map(l=>({x:l.x,y:l.y,r:Math.max(l.rx,l.ry)}))].every(p=>Math.hypot(p.x-q.x,p.y-q.y)>(p.r||0)+r+14);
 const pick=nm=>{let b=null;for(const c of cand){if(Math.hypot(P[L(nm)].x-c.x,P[L(nm)].y-c.y)>330||!free(c,PR(c)))continue;if(!b||c.c>b.c)b=c}return b};
 for(const[pn,an]of[['Zabeel Park','Dubai Frame'],['Safa Park','Safa Park'],['Mushrif Park','Mushrif Park'],['Creekside Park','Festival City'],['Miracle Garden','Dubai Miracle Garden'],['Dubai Hills Park','Dubai Hills'],['Al Mamzar Park','Al Mamzar'],['Al Barsha Pond Park','Al Barsha South'],['Quranic Park','Al Warqa'],['Jumeirah Beach Park','Jumeirah Mosque']]){const c=pick(an);if(c)parks.push({x:c.x,y:c.y,r:PR(c),n:pn})}
 for(let i=cand.length-1;i>0;i--){const j=rnd()*(i+1)|0;[cand[i],cand[j]]=[cand[j],cand[i]]}
 for(const c of cand){if(parks.length>=34)break;if(free(c,PR(c)))parks.push({x:c.x,y:c.y,r:PR(c)})}
 // start positions: well spread stations (farthest-point sampling)
 const fp=[];const pool=ids.filter(i=>!isl(i));fp.push(pool[0]);while(fp.length<48){let b=-1,bd=-1;for(const i of pool){let m=1e9;for(const j of fp)m=Math.min(m,d(i,j));if(m>bd){bd=m;b=i}}fp.push(b)}
 const XS=fp.filter((_,i)=>i%3==1).slice(0,13),DS=fp.filter((_,i)=>i%3!=1).slice(0,18);
 // drawing data for the client
 const flat=p=>p.flatMap(q=>q),dd2=p=>p.length==1?`M${p[0][0]} ${p[0][1]}l.1 0`:'M'+p.map(q=>q.join(' ')).join('L');
 const lines={};caps.forEach(c=>{(lines[c.r]=lines[c.r]||'');lines[c.r]+=dd2(c.p)});
 const world=[];for(let i=0;i<30;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd()),u=rr*Math.cos(a)*230,v=rr*Math.sin(a)*165,c=xy(55.2150,25.2350);world.push([Math.round(c[0]+u*.82-v*.57),Math.round(c[1]+u*.57+v*.82),6+Math.round(rnd()*7)])}
 const sp=[{k:'burj',id:L('Burj Khalifa / Dubai Mall')},{k:'arab',id:L('Burj Al Arab')},{k:'frame',id:L('Dubai Frame')}];
 const out={P,adj,edges,W,H,XS,DS};
 out.view={id:'dubai',style:'poly',named:fixed,P,edges,W,H,parks,lakes,icons,specials:sp,
  land:{poly:'M'+land.map(q=>q.join(' ')).join('L')+'Z',lines},
  waters:waters.map(w=>({d:dd2(w.p),w:w.w,k:w.k})),world,
  mask:{poly:flat(land),caps:caps.map(c=>({p:flat(c.p),r:c.r})),waters:waters.map(w=>({p:flat(w.p),w:w.w})),lakes:lakes.map(l=>[l.x,l.y,l.rx,l.ry])}};
 return out}

const maps={mumbai:mumbai(),dubai:dubai()};
const info={mumbai:{name:'Mumbai Map',emoji:'🚉',desc:'Local trains, harbour ferries and parks in the city of dreams.'},dubai:{name:'Dubai Map',emoji:'🌴',desc:'Burj Khalifa, Palm Jumeirah, the Creek and a desert skyline.'}};
const list=Object.keys(maps).map(id=>{const v=maps[id].view,sc=100/Math.max(v.W,v.H),ox=(100-v.W*sc)/2,oy=(100-v.H*sc)/2,ids=Object.keys(v.P);
 const has=t=>new Set(v.edges.filter(e=>e.t==t).flatMap(e=>[e.a,e.b])).size;
 return{id,...info[id],stations:ids.length,metro:has('metro'),ferry:has('ferry'),w:v.W,h:v.H,pts:ids.map(i=>[+(ox+v.P[i].x*sc).toFixed(1),+(oy+v.P[i].y*sc).toFixed(1)])}});
module.exports={maps,list};
