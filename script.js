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