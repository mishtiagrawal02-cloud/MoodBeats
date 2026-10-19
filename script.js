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
