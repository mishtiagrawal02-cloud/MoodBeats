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
