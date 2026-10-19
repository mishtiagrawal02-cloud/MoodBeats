const AUDIO=[
{id:'lofi',c:'#9d6bff',n:'Lo-fi',d:'Mellow chords with vinyl hiss'},
{id:'instr',c:'#00d8f0',n:'Instrumental',d:'Soft arpeggios, no beat'},
{id:'nature',c:'#5fe03a',n:'Nature sounds',d:'Rain and wind'},
{id:'freq',c:'#ff2bd6',n:'Frequency sound',d:'10 Hz binaural. Use headphones'},
{id:'none',c:'#ffc933',n:'No music',d:'Silence'}];
const TASKS=['Reading','Writing','Problem solving','Memorizing','Revision','Coding'];
const MOODS=['😞','😕','😐','🙂','😄'];
const an=id=>AUDIO.find(a=>a.id==id).n;
let SES=[];try{SES=JSON.parse(localStorage.getItem('studybeats:sessions')||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem('studybeats:sessions',JSON.stringify(SES))}catch(e){}};
let S={view:'session',step:'pre',pre:{mood:3,stress:5,focus:5,task:'Reading',audio:'lofi',mins:25},post:{mood:3,stress:5,focus:5},left:0,total:0,paused:false,vol:.5,metric:'focus',filter:'All',last:null};
let tick=null;
const $=id=>document.getElementById(id);
const dl=(x,k)=>k=='stress'?x.pre.stress-x.post.stress:x.post[k]-x.pre[k];
const sg=v=>(v>0?'+':'')+(Math.round(v*10)/10);
const cl=v=>v>0?'pos':v<0?'neg':'';

/* ---------- audio engine (Web Audio, no files needed) ---------- */
let AC,master,srcs=[],tms=[];
function noise(brown){const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=b.getChannelData(0);let l=0;
 for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(brown){l=(l+.02*w)/1.02;d[i]=l*3.5}else d[i]=w}
 const s=AC.createBufferSource();s.buffer=b;s.loop=true;s.start();srcs.push(s);return s}
function chain(...n){for(let i=0;i<n.length-1;i++)n[i].connect(n[i+1]);return n[0]}
function filt(t,f){const x=AC.createBiquadFilter();x.type=t;x.frequency.value=f;return x}
function gain(v){const g=AC.createGain();g.gain.value=v;return g}
function note(f,t,dur,type,vol,dest){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.06);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.1)}
const CH=[[130.8,164.8,196,246.9],[110,164.8,196,261.6],[174.6,220,261.6,329.6],[98,146.8,196,246.9]];
function startAudio(k){stopAudio();if(k=='none')return;
 AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume();
 master=gain(S.vol);master.connect(AC.destination);
 if(k=='nature'){chain(noise(0),filt('highpass',900),filt('lowpass',7000),gain(.22),master);
  const w=gain(.5),lfo=AC.createOscillator(),lg=gain(.25);lfo.frequency.value=.12;lfo.connect(lg);lg.connect(w.gain);lfo.start();srcs.push(lfo);
  chain(noise(1),filt('lowpass',350),w,master)}
 else if(k=='freq'){[[200,-1],[210,1]].forEach(([f,p])=>{const o=AC.createOscillator(),pn=AC.createStereoPanner();o.frequency.value=f;pn.pan.value=p;
  chain(o,gain(.18),pn,master);o.start();srcs.push(o)})}
 else{const lofi=k=='lofi',lp=filt('lowpass',lofi?900:2400);lp.connect(master);
  if(lofi)chain(noise(1),filt('highpass',2500),gain(.05),master);
  let i=0;const step=()=>{const t=AC.currentTime+.05,c=CH[i%4];i++;
   c.forEach(f=>note(f,t,4.2,lofi?'triangle':'sine',.07,lp));
   if(!lofi)for(let j=0;j<8;j++)note(c[j%4]*2,t+j*.5,1.4,'sine',.05,lp)};
  step();tms.push(setInterval(step,4000))}}
function stopAudio(){tms.forEach(clearInterval);tms=[];srcs.forEach(s=>{try{s.stop()}catch(e){}});srcs=[];if(master){try{master.disconnect()}catch(e){}master=null}}
/* ---------- navigation ---------- */
function go(v){S.view=v;render()}
function render(){
 ['session','dash','hist'].forEach(v=>{const b=$('n-'+v);b.className=S.view==v?'on':'';b.setAttribute('aria-current',S.view==v?'page':'false')});
 $('app').innerHTML=S.view=='session'?vSession():S.view=='dash'?vDash():vHist()}

/* ---------- study flow ---------- */
function sliders(o,k){return [['stress','Stress level (1 = calm, 10 = very stressed)'],['focus','Focus level (1 = scattered, 10 = locked in)']].map(([n,t])=>
 `<div class="lbl"><label for="s-${k}-${n}">${t}</label><output id="o-${k}-${n}">${S[k][n]}</output></div><input type="range" id="s-${k}-${n}" min="1" max="10" value="${S[k][n]}" oninput="setV('${k}','${n}',+this.value)">`).join('')}
function moodRow(k){return `<div class="lbl"><span>Mood</span></div><div class="moods" role="group" aria-label="Mood">${MOODS.map((m,i)=>`<button class="mood ${S[k].mood==i+1?'on':''}" aria-label="Mood ${i+1} of 5" aria-pressed="${S[k].mood==i+1}" onclick="S.${k}.mood=${i+1};render()">${m}</button>`).join('')}</div>`}
function setV(k,n,v){S[k][n]=v;$('o-'+k+'-'+n).textContent=v}
function vSession(){
 if(S.step=='pre'){const p=S.pre;return `<div class="hero"><h1>Find the sound that helps you study.</h1><p>Check in, pick a sound, study, then check in again. After a few sessions your dashboard shows how each sound works for you. It does not claim any sound works for everyone.</p></div>
 <div class="card"><h2>Before you start</h2>${moodRow('pre')}${sliders(p,'pre')}
 <div class="lbl"><span>What are you studying?</span></div><div class="chips">${TASKS.map(t=>`<button class="chip ${p.task==t?'on':''}" aria-pressed="${p.task==t}" onclick="S.pre.task='${t}';render()">${t}</button>`).join('')}</div>
 <div class="lbl"><span>Choose your sound</span></div><div class="grid">${AUDIO.map(a=>`<button class="aud ${p.audio==a.id?'on':''}" style="--c:${a.c}" aria-pressed="${p.audio==a.id}" onclick="S.pre.audio='${a.id}';render()"><b>${a.n}</b><span>${a.d}</span></button>`).join('')}</div>
 <div class="lbl"><span>Session length</span></div><div class="chips">${[1,15,25,45,60].map(m=>`<button class="chip ${p.mins==m?'on':''}" aria-pressed="${p.mins==m}" onclick="S.pre.mins=${m};render()">${m==1?'1 min (test)':m+' min'}</button>`).join('')}</div>
 <button class="btn" onclick="startSes()">Start session</button></div>`}
 if(S.step=='run'){const p=S.pre;return `<div class="card run ${S.paused?'paused':''}" id="runcard"><h2>${an(p.audio)} · ${p.task}</h2>
 <p class="sub">Stay with it. The record spins while the timer runs.</p>
 <div class="disc"><svg viewBox="0 0 300 300" aria-hidden="true"><defs><linearGradient id="ng"><stop offset="0" stop-color="#00e5ff"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient></defs><g class="spin"><circle cx="150" cy="150" r="146" fill="var(--rec)"/>
 ${[128,114,100,86].map(r=>`<circle cx="150" cy="150" r="${r}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`).join('')}
 <path d="M150 20a130 130 0 0 1 112 65" stroke="#fff" stroke-opacity=".18" stroke-width="6" fill="none" stroke-linecap="round"/></g>
 <circle cx="150" cy="150" r="146" fill="none" stroke="url(#ng)" stroke-width="5" stroke-dasharray="917.4" stroke-dashoffset="917.4" id="ring" transform="rotate(-90 150 150)" stroke-linecap="round"/>
 <circle cx="150" cy="150" r="62" fill="url(#ng)"/></svg><div class="time" id="clock">${fmt(S.left)}</div></div>
 ${p.audio!='none'?`<div class="vol"><label for="vol">Volume</label><input id="vol" type="range" min="0" max="1" step=".05" value="${S.vol}" oninput="S.vol=+this.value;if(master)master.gain.value=S.vol"></div>`:'<p class="small">No audio playing.</p>'}
 <button class="btn" id="pb" onclick="togglePause()">${S.paused?'Resume':'Pause'}</button><button class="btn alt" onclick="finish()">End and check in</button></div>`}
 if(S.step=='post')return `<div class="card"><h2>How do you feel now?</h2><p class="sub">Answer for this moment, not how you hoped it would go.</p>${moodRow('post')}${sliders(S.post,'post')}<button class="btn" onclick="saveSes()">Save session</button></div>`;
 const x=S.last;return `<div class="card"><h2>Session saved</h2><p class="sub">${an(x.audio)} · ${x.task} · ${x.mins} min</p><div class="stats">
 ${[['focus','Focus'],['stress','Stress (lower is better)'],['mood','Mood']].map(([k,t])=>{const v=dl(x,k);return `<div class="stat"><b class="${cl(v)}">${sg(v)}</b><span>${t} change</span></div>`}).join('')}</div>
 <p class="small">One session is a single data point. Patterns show up after several.</p><button class="btn" onclick="S.step='pre';render()">New session</button><button class="btn alt" onclick="go('dash')">See dashboard</button></div>`}
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function startSes(){S.total=S.left=S.pre.mins*60;S.paused=false;S.step='run';startAudio(S.pre.audio);render();tick=setInterval(tk,1000);tk(true)}
function tk(first){if(!first&&!S.paused)S.left--;const c=$('clock');if(c){c.textContent=fmt(S.left);$('ring').style.strokeDashoffset=917.4*(S.left/S.total)}if(S.left<=0)finish()}
function togglePause(){S.paused=!S.paused;if(S.paused){if(AC)AC.suspend()}else if(AC)AC.resume();$('pb').textContent=S.paused?'Resume':'Pause';$('runcard').classList.toggle('paused',S.paused)}
function finish(){clearInterval(tick);stopAudio();S.post={mood:S.pre.mood,stress:S.pre.stress,focus:S.pre.focus};S.step='post';S.view='session';S.elapsed=Math.max(1,Math.round((S.total-S.left)/60));render()}
function saveSes(){const p=S.pre,x={id:Date.now(),ts:Date.now(),task:p.task,audio:p.audio,mins:S.elapsed,pre:{mood:p.mood,stress:p.stress,focus:p.focus},post:{...S.post}};
 SES.push(x);save();S.last=x;S.step='done';render()}
function agg(list){const g={};AUDIO.forEach(a=>g[a.id]={n:0,focus:0,stress:0,mood:0});
 list.forEach(x=>{const o=g[x.audio];o.n++;['focus','stress','mood'].forEach(k=>o[k]+=dl(x,k))});
 AUDIO.forEach(a=>{const o=g[a.id];['focus','stress','mood'].forEach(k=>o[k]=o.n?o[k]/o.n:0)});return g}
function chart(g,m){const rows=AUDIO.filter(a=>g[a.id].n);if(!rows.length)return '';
 const mx=Math.max(1,...rows.map(a=>Math.abs(g[a.id][m]))),W=640,mid=330,H=rows.length*46+10;
 return `<div class="scroll"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Average ${m} change by sound" style="width:100%;min-width:480px">
 <line x1="${mid}" x2="${mid}" y1="0" y2="${H}" stroke="var(--line)"/>${rows.map((a,i)=>{const v=g[a.id][m],w=Math.abs(v)/mx*250,y=i*46+8;
 return `<text x="0" y="${y+20}" fill="var(--ink)" font-size="14">${a.n} (${g[a.id].n})</text><rect x="${v>=0?mid:mid-w}" y="${y}" width="${Math.max(w,2)}" height="28" rx="6" fill="${v>=0?a.c:'var(--bad)'}" style="filter:drop-shadow(0 0 5px ${v>=0?a.c:'#c9473f'})"/>
 <text x="${v>=0?mid+w+6:mid-w-6}" y="${y+20}" text-anchor="${v>=0?'start':'end'}" fill="var(--ink)" font-size="14" font-weight="700">${sg(v)}</text>`}).join('')}</svg></div>`}
function vDash(){
 const list=S.filter=='All'?SES:SES.filter(x=>x.task==S.filter);
 const bar=`<div class="tools"><label for="flt">Task</label><select id="flt" onchange="S.filter=this.value;render()">${['All',...TASKS].map(t=>`<option ${S.filter==t?'selected':''}>${t}</option>`).join('')}</select>
 <button class="chip" onclick="sample()">Load sample data</button><button class="chip" onclick="clearAll()">Clear all data</button></div>`;
 if(!list.length)return `<div class="hero"><h1>Your dashboard</h1></div><div class="card">${bar}<div class="empty"><p>No sessions${S.filter!='All'?' for this task':''} yet.</p><button class="btn" onclick="go('session')">Start your first session</button></div></div>`;
 const g=agg(list),mins=list.reduce((a,x)=>a+x.mins,0),M={focus:'Focus',stress:'Stress reduction',mood:'Mood'};
 const c=AUDIO.filter(a=>g[a.id].n>=2).sort((a,b)=>g[b.id][S.metric]-g[a.id][S.metric]);
 const ins=c.length?`<b>${an(c[0].id)}</b> has the highest average ${M[S.metric].toLowerCase()} change for you (${sg(g[c[0].id][S.metric])} across ${g[c[0].id].n} sessions).${c.length==1?' Try another sound to compare.':''}`:'Log at least 2 sessions with the same sound to see comparisons.';
 const avg=k=>list.reduce((a,x)=>a+dl(x,k),0)/list.length;
 return `<div class="hero"><h1>Your dashboard</h1></div><div class="card">${bar}
 <div class="stats"><div class="stat"><b>${list.length}</b><span>sessions</span></div><div class="stat"><b>${mins}</b><span>minutes studied</span></div>
 ${['focus','stress','mood'].map(k=>`<div class="stat"><b class="${cl(avg(k))}">${sg(avg(k))}</b><span>avg ${k=='stress'?'stress reduction':k+' change'}</span></div>`).join('')}</div></div>
 <div class="card"><h2>Which sound works for you?</h2><div class="chips" role="group" aria-label="Metric" style="margin-bottom:14px">${Object.entries(M).map(([k,t])=>`<button class="chip ${S.metric==k?'on':''}" aria-pressed="${S.metric==k}" onclick="S.metric='${k}';render()">${t}</button>`).join('')}</div>
 <p class="insight">${ins}</p>${chart(g,S.metric)}
 <p class="small">Bars show the average change from before to after a session. Positive is better for every metric. Numbers in brackets are session counts. Small samples are noisy, and these results describe you only.</p></div>`}
function sample(){const bias={lofi:[1.6,1,.6],instr:[1.2,.8,.5],nature:[.8,1.6,.8],freq:[.3,.2,0],none:[.5,0,0]},r=()=>Math.random()-.5;
 const out=[];for(let i=0;i<20;i++){const a=AUDIO[i%5].id,b=bias[a],t=TASKS[Math.floor(Math.random()*6)],pf=3+Math.floor(Math.random()*4),ps=4+Math.floor(Math.random()*4),pm=2+Math.floor(Math.random()*2),cp=v=>Math.max(1,Math.min(10,Math.round(v)));
  out.push({id:Date.now()+i,ts:Date.now()-(20-i)*86400000*1.2,task:t,audio:a,mins:[15,25,45][i%3],pre:{mood:pm,stress:ps,focus:pf},post:{mood:Math.max(1,Math.min(5,Math.round(pm+b[2]+r()*1.5))),stress:cp(ps-b[1]+r()*2),focus:cp(pf+b[0]+r()*2)}})}
 SES=SES.concat(out);save();render()}
function clearAll(){if(confirm('Delete all saved sessions? This cannot be undone.')){SES=[];save();render()}}
function vHist(){
 if(!SES.length)return `<div class="hero"><h1>Session history</h1></div><div class="card"><div class="empty"><p>Nothing here yet. Finished sessions appear in this list.</p><button class="btn" onclick="go('session')">Start a session</button></div></div>`;
 return `<div class="hero"><h1>Session history</h1></div><div class="card">${[...SES].reverse().map(x=>{const f=dl(x,'focus'),s=dl(x,'stress'),m=dl(x,'mood');
 return `<div class="sess"><div><b>${an(x.audio)}</b> <span class="tag">${x.task}</span><span class="tag">${x.mins} min</span><div class="small">${new Date(x.ts).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}</div></div>
 <div class="small">Focus <b class="${cl(f)}">${sg(f)}</b> · Stress <b class="${cl(s)}">${sg(s)}</b> · Mood <b class="${cl(m)}">${sg(m)}</b> <button class="del" onclick="delS(${x.id})">Delete</button></div></div>`}).join('')}</div>`}
function delS(id){SES=SES.filter(x=>x.id!=id);save();render()}
render();
