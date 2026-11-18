// ============================================
// MOODBEATS - STUDY PRODUCTIVITY PLATFORM
// ============================================

const AUDIO = [
  { id: 'lofi', c: '#BF5AFF', n: 'Lo-fi', d: 'Mellow chords with vinyl hiss', icon: '🎵' },
  { id: 'instr', c: '#8B35FF', n: 'Instrumental', d: 'Soft arpeggios, no beat', icon: '🎹' },
  { id: 'nature', c: '#4cc790', n: 'Nature', d: 'Rain and wind sounds', icon: '🌿' },
  { id: 'freq', c: '#BF5AFF', n: 'Frequency', d: '10 Hz binaural (use headphones)', icon: '🎧' },
  { id: 'ambient', c: '#8B35FF', n: 'Ambient', d: 'Atmospheric soundscapes', icon: '🌌' },
  { id: 'none', c: '#938B9E', n: 'Silence', d: 'No audio, pure focus', icon: '🔇' }
];

const TASKS = ['Reading', 'Writing', 'Problem solving', 'Memorizing', 'Revision', 'Coding'];
const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

const an = id => AUDIO.find(a => a.id == id).n;
const ai = id => AUDIO.find(a => a.id == id).icon;

// ============================================
// DATA PERSISTENCE & MIGRATION
// ============================================

let SES = [];
const STORAGE_KEY = 'moodbeats:sessions';
const GOAL_KEY = 'moodbeats:goal';

// Migrate from old StudyBeats keys
function migrateStorage() {
  try {
    const oldSessions = localStorage.getItem('studybeats:sessions');
    const oldGoal = localStorage.getItem('studybeats:goal');
    
    if (oldSessions && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, oldSessions);
      console.log('Migrated sessions from StudyBeats to MoodBeats');
    }
    
    if (oldGoal && !localStorage.getItem(GOAL_KEY)) {
      localStorage.setItem(GOAL_KEY, oldGoal);
      console.log('Migrated goal from StudyBeats to MoodBeats');
    }
  } catch (e) {
    console.error('Migration error:', e);
  }
}

migrateStorage();

try {
  SES = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
} catch (e) {
  console.error('Failed to load sessions:', e);
}

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SES));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
};

// ============================================
// APPLICATION STATE
// ============================================

let S = {
  view: 'dash',
  step: 'pre',
  pre: { mood: 3, stress: 5, focus: 5, task: 'Reading', audio: 'lofi', mins: 25 },
  post: { mood: 3, stress: 5, focus: 5 },
  left: 0,
  total: 0,
  paused: false,
  vol: 0.5,
  metric: 'focus',
  filter: 'All',
  last: null,
  userName: localStorage.getItem('moodbeats:userName') || 'Awantika'
};

let tick = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

const $ = id => document.getElementById(id);
const dl = (x, k) => k == 'stress' ? x.pre.stress - x.post.stress : x.post[k] - x.pre[k];
const sg = v => (v > 0 ? '+' : '') + (Math.round(v * 10) / 10);
const cl = v => v > 0 ? 'pos' : v < 0 ? 'neg' : '';

// ============================================
// AUDIO ENGINE (Web Audio API)
// ============================================

let AC, master, srcs = [], tms = [];

function noise(brown) {
  const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = b.getChannelData(0);
  let l = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      l = (l + 0.02 * w) / 1.02;
      d[i] = l * 3.5;
    } else d[i] = w;
  }
  const s = AC.createBufferSource();
  s.buffer = b;
  s.loop = true;
  s.start();
  srcs.push(s);
  return s;
}

function chain(...n) {
  for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]);
  return n[0];
}

function filt(t, f) {
  const x = AC.createBiquadFilter();
  x.type = t;
  x.frequency.value = f;
  return x;
}

function gain(v) {
  const g = AC.createGain();
  g.gain.value = v;
  return g;
}

function note(f, t, dur, type, vol, dest) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.1);
}

const CH = [
  [130.8, 164.8, 196, 246.9],
  [110, 164.8, 196, 261.6],
  [174.6, 220, 261.6, 329.6],
  [98, 146.8, 196, 246.9]
];

function startAudio(k) {
  stopAudio();
  if (k == 'none') return;
  
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  AC.resume();
  
  master = gain(S.vol);
  master.connect(AC.destination);
  
  if (k == 'nature') {
    chain(noise(0), filt('highpass', 900), filt('lowpass', 7000), gain(0.22), master);
    const w = gain(0.5), lfo = AC.createOscillator(), lg = gain(0.25);
    lfo.frequency.value = 0.12;
    lfo.connect(lg);
    lg.connect(w.gain);
    lfo.start();
    srcs.push(lfo);
    chain(noise(1), filt('lowpass', 350), w, master);
  } else if (k == 'freq') {
    [[200, -1], [210, 1]].forEach(([f, p]) => {
      const o = AC.createOscillator(), pn = AC.createStereoPanner();
      o.frequency.value = f;
      pn.pan.value = p;
      chain(o, gain(0.18), pn, master);
      o.start();
      srcs.push(o);
    });
  } else if (k == 'ambient') {
    const lp = filt('lowpass', 600);
    lp.connect(master);
    chain(noise(1), filt('lowpass', 400), gain(0.15), master);
    let i = 0;
    const step = () => {
      const t = AC.currentTime + 0.05;
      const c = CH[i % 4];
      i++;
      c.forEach(f => note(f, t, 6.5, 'sine', 0.04, lp));
    };
    step();
    tms.push(setInterval(step, 6000));
  } else {
    const lofi = k == 'lofi';
    const lp = filt('lowpass', lofi ? 900 : 2400);
    lp.connect(master);
    if (lofi) chain(noise(1), filt('highpass', 2500), gain(0.05), master);
    let i = 0;
    const step = () => {
      const t = AC.currentTime + 0.05;
      const c = CH[i % 4];
      i++;
      c.forEach(f => note(f, t, 4.2, lofi ? 'triangle' : 'sine', 0.07, lp));
      if (!lofi) for (let j = 0; j < 8; j++) note(c[j % 4] * 2, t + j * 0.5, 1.4, 'sine', 0.05, lp);
    };
    step();
    tms.push(setInterval(step, 4000));
  }
}

function stopAudio() {
  tms.forEach(clearInterval);
  tms = [];
  srcs.forEach(s => {
    try { s.stop(); } catch (e) {}
  });
  srcs = [];
  if (master) {
    try { master.disconnect(); } catch (e) {}
    master = null;
  }
}

// ============================================
// NAVIGATION
// ============================================

function go(v) {
  S.view = v;
  render();
}

function render() {
  ['session', 'dash', 'hist', 'audio', 'analytics', 'profile'].forEach(v => {
    const b = $('n-' + v);
    if (b) {
      b.className = S.view == v ? 'nav-item on' : 'nav-item';
      b.setAttribute('aria-current', S.view == v ? 'page' : 'false');
    }
  });
  
  const content = {
    'dash': vDash(),
    'session': vSession(),
    'hist': vHist(),
    'audio': vAudio(),
    'analytics': vAnalytics(),
    'profile': vProfile()
  }[S.view] || vDash();
  
  $('app').innerHTML = content;
  
  // Notify React widget
  window.dispatchEvent(new CustomEvent('mb:render', { detail: { view: S.view, sessions: SES } }));
}

// ============================================
// DASHBOARD VIEW
// ============================================

function vDash() {
  const weekAgo = Date.now() - 7 * 864e5;
  const weekSessions = SES.filter(s => s.ts >= weekAgo);
  const weekMins = weekSessions.reduce((a, s) => a + s.mins, 0);
  const totalMins = SES.reduce((a, s) => a + s.mins, 0);
  
  // Calculate streak
  const days = new Set(SES.map(s => new Date(s.ts).toDateString()));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  
  // Get weekly goal
  const goal = +localStorage.getItem(GOAL_KEY) || 150;
  const goalPercent = Math.min(100, Math.round((weekMins / goal) * 100));
  
  // Greeting based on time
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  // Format date
  const dateStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  
  return `
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="greeting">${greet}, <span class="greeting-name">${S.userName}</span> <i class="fas fa-heart"></i></h1>
        <p class="subtitle">Focus, study and discover the music that works for you.</p>
      </div>
      <div class="header-actions">
        <div class="header-date">
          <i class="far fa-calendar"></i>
          <span>${dateStr}</span>
        </div>
        <button class="notification-btn" aria-label="Notifications">
          <i class="far fa-bell"></i>
        </button>
        <div class="profile-avatar" aria-label="Profile">
          ${S.userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
    
    <div class="hero-banner">
      <div class="hero-illustration">
        <div class="hero-item deco-plant">🪴</div>
        <div class="hero-item deco-books">📚</div>
        <div class="hero-item deco-mug">☕</div>
        <div class="hero-item deco-headphones">🎧</div>
        <div class="hero-item deco-moon">🌙</div>
      </div>
    </div>
    
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-fire"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">${streak}</span>
          <span class="stat-label">Day Streak</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-target"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">${weekMins} / ${goal}</span>
          <span class="stat-label">Weekly Goal</span>
          <div class="stat-progress">
            <div class="stat-progress-bar">
              <div class="stat-progress-fill" style="width: ${goalPercent}%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">${(totalMins / 60).toFixed(1)}</span>
          <span class="stat-label">Total Study Time (hrs)</span>
        </div>
      </div>
    </div>
    
    <div class="cards-grid">
      <div class="card study-card">
        <div class="study-card-icon">✨</div>
        <h2>Start a Study Session</h2>
        <p class="card-subtitle">Set your mood, pick a sound and get into focus.</p>
        <button class="btn" onclick="go('session')">
          <i class="fas fa-play"></i>
          New Study Session
        </button>
      </div>
      
      <div class="card">
        <h2><i class="fas fa-smile"></i> Your Current Mood</h2>
        ${moodRow('pre')}
        ${sliders(S.pre, 'pre')}
      </div>
      
      <div class="card progress-card">
        <h2><i class="fas fa-chart-pie"></i> This Week's Progress</h2>
        <div class="circular-progress">
          <svg viewBox="0 0 180 180">
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#8B35FF" />
                <stop offset="100%" style="stop-color:#BF5AFF" />
              </linearGradient>
            </defs>
            <circle class="circular-progress-bg" cx="90" cy="90" r="75"></circle>
            <circle class="circular-progress-fill" cx="90" cy="90" r="75"
              stroke-dasharray="${2 * Math.PI * 75}"
              stroke-dashoffset="${2 * Math.PI * 75 * (1 - goalPercent / 100)}">
            </circle>
          </svg>
          <div class="circular-progress-text">
            <div class="circular-progress-percent">${goalPercent}%</div>
            <div class="circular-progress-label">Complete</div>
          </div>
        </div>
        <p class="small">${weekMins} of ${goal} minutes this week</p>
      </div>
    </div>
    
    <div class="audio-section">
      <div class="audio-header">
        <h2><i class="fas fa-music"></i> Explore Audio Types</h2>
        <a href="#" class="view-library-link" onclick="go('audio'); return false;">
          View Library <i class="fas fa-arrow-right"></i>
        </a>
      </div>
      <div class="audio-grid">
        ${AUDIO.map(a => `
          <button class="aud ${S.pre.audio == a.id ? 'on' : ''}" 
                  style="--c:${a.c}" 
                  aria-pressed="${S.pre.audio == a.id}" 
                  onclick="S.pre.audio='${a.id}';render()">
            <div class="aud-icon">${a.icon}</div>
            <b>${a.n}</b>
            <span>${a.d}</span>
          </button>
        `).join('')}
      </div>
    </div>
    
    ${SES.length >= 3 ? dashboardInsights() : ''}
  `;
}

function dashboardInsights() {
  const list = SES.slice(-7);
  const avg = k => list.reduce((a, x) => a + dl(x, k), 0) / list.length;
  const totalMins = SES.reduce((a, s) => a + s.mins, 0);
  
  // Focus trend (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const daySessions = SES.filter(s => new Date(s.ts).toDateString() === dayStr);
    const avgFocus = daySessions.length ? 
      daySessions.reduce((a, s) => a + dl(s, 'focus'), 0) / daySessions.length : 0;
    last7Days.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      value: avgFocus
    });
  }
  
  const maxFocus = Math.max(...last7Days.map(d => Math.abs(d.value)), 1);
  const chartHeight = 200;
  const chartWidth = 800;
  const padding = 40;
  const pointSpacing = (chartWidth - padding * 2) / 6;
  
  const points = last7Days.map((d, i) => {
    const x = padding + i * pointSpacing;
    const y = chartHeight - padding - ((d.value + maxFocus) / (maxFocus * 2)) * (chartHeight - padding * 2);
    return { x, y, value: d.value, day: d.day };
  });
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L ${chartWidth - padding},${chartHeight - padding} L ${padding},${chartHeight - padding} Z`;
  
  return `
    <div class="insights-grid">
      <div class="insight-card">
        <div class="insight-icon"><i class="fas fa-clock"></i></div>
        <span class="insight-value">${(totalMins / 60).toFixed(1)} hrs</span>
        <span class="insight-label">Total Study Time</span>
      </div>
      
      <div class="insight-card">
        <div class="insight-icon"><i class="fas fa-brain"></i></div>
        <span class="insight-value ${cl(avg('focus'))}">${sg(avg('focus'))}</span>
        <span class="insight-label">Avg. Focus Change</span>
      </div>
      
      <div class="insight-card">
        <div class="insight-icon"><i class="fas fa-heart-pulse"></i></div>
        <span class="insight-value ${cl(avg('stress'))}">${sg(avg('stress'))}</span>
        <span class="insight-label">Avg. Stress Change</span>
      </div>
      
      <div class="insight-card">
        <div class="insight-icon"><i class="fas fa-face-smile"></i></div>
        <span class="insight-value ${cl(avg('mood'))}">${sg(avg('mood'))}</span>
        <span class="insight-label">Avg. Mood Change</span>
      </div>
    </div>
    
    <div class="card chart-card">
      <div class="chart-header">
        <h2><i class="fas fa-chart-line"></i> Focus Trend</h2>
        <span class="small">Last 7 Days</span>
      </div>
      <div class="scroll">
        <svg viewBox="0 0 ${chartWidth} ${chartHeight}" style="width:100%;min-width:600px;" role="img" aria-label="Focus trend chart">
          <defs>
            <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#BF5AFF;stop-opacity:0.4" />
              <stop offset="100%" style="stop-color:#8B35FF;stop-opacity:0.1" />
            </linearGradient>
          </defs>
          
          <!-- Grid lines -->
          <line x1="${padding}" y1="${chartHeight - padding}" x2="${chartWidth - padding}" y2="${chartHeight - padding}" stroke="rgba(201,180,255,0.2)" stroke-width="1"/>
          
          <!-- Area under curve -->
          <path d="${areaD}" fill="url(#area-gradient)" />
          
          <!-- Line -->
          <path d="${pathD}" fill="none" stroke="#BF5AFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- Points and labels -->
          ${points.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="5" fill="#BF5AFF" stroke="#09070D" stroke-width="2" />
            <text x="${p.x}" y="${chartHeight - 15}" text-anchor="middle" fill="#938B9E" font-size="12">${p.day}</text>
          `).join('')}
        </svg>
      </div>
      <p class="small">Chart shows average focus change per day. Positive values indicate improved focus after study sessions.</p>
    </div>
  `;
}

// ============================================
// STUDY SESSION VIEW
// ============================================

function sliders(o, k) {
  return [
    ['stress', 'Stress Level', '1 = calm, 10 = very stressed'],
    ['focus', 'Focus Level', '1 = scattered, 10 = locked in']
  ].map(([n, label, desc]) => `
    <div class="lbl">
      <label for="s-${k}-${n}" title="${desc}">${label}</label>
      <output id="o-${k}-${n}">${S[k][n]} / 10</output>
    </div>
    <input type="range" id="s-${k}-${n}" min="1" max="10" value="${S[k][n]}" 
           oninput="setV('${k}','${n}',+this.value)" aria-label="${label}">
  `).join('');
}

function moodRow(k) {
  return `
    <div class="lbl"><span>Mood</span></div>
    <div class="moods" role="group" aria-label="Mood">
      ${MOODS.map((m, i) => `
        <button class="mood ${S[k].mood == i + 1 ? 'on' : ''}" 
                aria-label="Mood ${i + 1} of 5" 
                aria-pressed="${S[k].mood == i + 1}" 
                onclick="S.${k}.mood=${i + 1};render()">
          ${m}
        </button>
      `).join('')}
    </div>
  `;
}

function setV(k, n, v) {
  S[k][n] = v;
  $('o-' + k + '-' + n).textContent = v + ' / 10';
}

function vSession() {
  if (S.step == 'pre') {
    const p = S.pre;
    return `
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="greeting">Setup Your Study Session</h1>
          <p class="subtitle">Let's understand your current state before you begin studying.</p>
        </div>
      </div>
      
      <div class="form-section">
        <h3><i class="fas fa-smile"></i> How are you feeling?</h3>
        ${moodRow('pre')}
        ${sliders(p, 'pre')}
      </div>
      
      <div class="form-section">
        <h3><i class="fas fa-tasks"></i> What are you studying?</h3>
        <div class="chips">
          ${TASKS.map(t => `
            <button class="chip ${p.task == t ? 'on' : ''}" 
                    aria-pressed="${p.task == t}" 
                    onclick="S.pre.task='${t}';render()">
              ${t}
            </button>
          `).join('')}
        </div>
      </div>
      
      <div class="form-section">
        <h3><i class="fas fa-music"></i> Choose your audio</h3>
        <div class="audio-grid">
          ${AUDIO.map(a => `
            <button class="aud ${p.audio == a.id ? 'on' : ''}" 
                    style="--c:${a.c}" 
                    aria-pressed="${p.audio == a.id}" 
                    onclick="S.pre.audio='${a.id}';render()">
              <div class="aud-icon">${a.icon}</div>
              <b>${a.n}</b>
              <span>${a.d}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <div class="form-section">
        <h3><i class="fas fa-clock"></i> Session duration</h3>
        <div class="chips">
          ${[1, 15, 25, 45, 60].map(m => `
            <button class="chip ${p.mins == m ? 'on' : ''}" 
                    aria-pressed="${p.mins == m}" 
                    onclick="S.pre.mins=${m};render()">
              ${m == 1 ? '1 min (test)' : m + ' min'}
            </button>
          `).join('')}
        </div>
      </div>
      
      <button class="btn" onclick="startSes()">
        <i class="fas fa-play"></i>
        Start Session
      </button>
    `;
  }
  
  if (S.step == 'run') {
    const p = S.pre;
    return `
      <div class="card run ${S.paused ? 'paused' : ''}" id="runcard">
        <h2>${an(p.audio)} · ${p.task}</h2>
        <p class="sub">Stay focused. The record spins while the timer runs.</p>
        
        <div class="disc">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <defs>
              <linearGradient id="ng">
                <stop offset="0" stop-color="#8B35FF"/>
                <stop offset="1" stop-color="#BF5AFF"/>
              </linearGradient>
            </defs>
            
            <g class="spin">
              <circle cx="150" cy="150" r="146" fill="#05060a"/>
              ${[128, 114, 100, 86].map(r => 
                `<circle cx="150" cy="150" r="${r}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`
              ).join('')}
              <path d="M150 20a130 130 0 0 1 112 65" stroke="#fff" stroke-opacity=".18" stroke-width="6" fill="none" stroke-linecap="round"/>
            </g>
            
            <circle cx="150" cy="150" r="146" fill="none" stroke="url(#ng)" stroke-width="5" 
                    stroke-dasharray="917.4" stroke-dashoffset="917.4" id="ring" 
                    transform="rotate(-90 150 150)" stroke-linecap="round"/>
            
            <circle cx="150" cy="150" r="62" fill="url(#ng)"/>
          </svg>
          <div class="time" id="clock">${fmt(S.left)}</div>
        </div>
        
        ${p.audio != 'none' ? `
          <div class="vol">
            <i class="fas fa-volume-up"></i>
            <label for="vol">Volume</label>
            <input id="vol" type="range" min="0" max="1" step=".05" value="${S.vol}" 
                   oninput="S.vol=+this.value;if(master)master.gain.value=S.vol">
          </div>
        ` : '<p class="small">No audio playing.</p>'}
        
        <button class="btn" id="pb" onclick="togglePause()">
          <i class="fas fa-${S.paused ? 'play' : 'pause'}"></i>
          ${S.paused ? 'Resume' : 'Pause'}
        </button>
        <button class="btn alt" onclick="finish()">
          <i class="fas fa-stop"></i>
          End and Check In
        </button>
      </div>
    `;
  }
  
  if (S.step == 'post') {
    return `
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="greeting">How Do You Feel Now?</h1>
          <p class="subtitle">Answer honestly for this moment, not how you hoped it would go.</p>
        </div>
      </div>
      
      <div class="card">
        ${moodRow('post')}
        ${sliders(S.post, 'post')}
        
        <button class="btn" onclick="saveSes()">
          <i class="fas fa-save"></i>
          Save Session
        </button>
      </div>
    `;
  }
  
  const x = S.last;
  return `
    <div class="card">
      <h2><i class="fas fa-check-circle"></i> Session Saved!</h2>
      <p class="sub">${an(x.audio)} · ${x.task} · ${x.mins} min</p>
      
      <div class="insights-grid">
        ${[
          ['focus', 'Focus Change', 'fa-brain'],
          ['stress', 'Stress Reduction', 'fa-heart-pulse'],
          ['mood', 'Mood Change', 'fa-face-smile']
        ].map(([k, label, icon]) => {
          const v = dl(x, k);
          return `
            <div class="insight-card">
              <div class="insight-icon"><i class="fas ${icon}"></i></div>
              <span class="insight-value ${cl(v)}">${sg(v)}</span>
              <span class="insight-label">${label}</span>
            </div>
          `;
        }).join('')}
      </div>
      
      <p class="small">One session is a single data point. Patterns emerge after several sessions.</p>
      
      <button class="btn" onclick="S.step='pre';render()">
        <i class="fas fa-plus"></i>
        New Session
      </button>
      <button class="btn alt" onclick="go('dash')">
        <i class="fas fa-chart-line"></i>
        View Dashboard
      </button>
    </div>
  `;
}

const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

function startSes() {
  S.total = S.left = S.pre.mins * 60;
  S.paused = false;
  S.step = 'run';
  startAudio(S.pre.audio);
  render();
  tick = setInterval(tk, 1000);
  tk(true);
}

function tk(first) {
  if (!first && !S.paused) S.left--;
  const c = $('clock');
  if (c) {
    c.textContent = fmt(S.left);
    $('ring').style.strokeDashoffset = 917.4 * (S.left / S.total);
  }
  if (S.left <= 0) finish();
}

function togglePause() {
  S.paused = !S.paused;
  if (S.paused) {
    if (AC) AC.suspend();
  } else if (AC) AC.resume();
  render();
}

function finish() {
  clearInterval(tick);
  stopAudio();
  S.post = { mood: S.pre.mood, stress: S.pre.stress, focus: S.pre.focus };
  S.step = 'post';
  S.view = 'session';
  S.elapsed = Math.max(1, Math.round((S.total - S.left) / 60));
  render();
}

function saveSes() {
  const p = S.pre;
  const x = {
    id: Date.now(),
    ts: Date.now(),
    task: p.task,
    audio: p.audio,
    mins: S.elapsed,
    pre: { mood: p.mood, stress: p.stress, focus: p.focus },
    post: { ...S.post }
  };
  SES.push(x);
  save();
  S.last = x;
  S.step = 'done';
  render();
}

// ============================================
// AUDIO LIBRARY VIEW
// ============================================

function vAudio() {
  return `
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="greeting">Audio Library</h1>
        <p class="subtitle">Explore different audio types and find what works best for you.</p>
      </div>
    </div>
    
    <div class="audio-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
      ${AUDIO.map(a => `
        <div class="card" style="border-color: ${a.c}; padding: 32px;">
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 16px;">${a.icon}</div>
            <h3 style="margin-bottom: 8px; color: var(--white);">${a.n}</h3>
            <p class="small" style="margin-bottom: 16px;">${a.d}</p>
            <button class="chip ${S.pre.audio == a.id ? 'on' : ''}" 
                    onclick="S.pre.audio='${a.id}';render();">
              ${S.pre.audio == a.id ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="card">
      <h2><i class="fas fa-info-circle"></i> About Audio Types</h2>
      <p class="small">
        All audio is generated synthetically using Web Audio API - no files are played. 
        Different people respond to different sounds. Try each type across multiple sessions 
        to discover what helps your focus and mood the most.
      </p>
    </div>
  `;
}

// ============================================
// SESSION HISTORY VIEW
// ============================================

function vHist() {
  if (!SES.length) {
    return `
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="greeting">Session History</h1>
          <p class="subtitle">Your completed study sessions will appear here.</p>
        </div>
      </div>
      
      <div class="card empty">
        <i class="fas fa-history"></i>
        <p>No sessions yet. Start your first study session to see it here!</p>
        <button class="btn" onclick="go('session')">
          <i class="fas fa-play"></i>
          Start Session
        </button>
      </div>
    `;
  }
  
  return `
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="greeting">Session History</h1>
        <p class="subtitle">${SES.length} total sessions</p>
      </div>
    </div>
    
    <div class="card">
      ${[...SES].reverse().map(x => {
        const f = dl(x, 'focus');
        const s = dl(x, 'stress');
        const m = dl(x, 'mood');
        return `
          <div class="sess">
            <div class="sess-info">
              <b>${an(x.audio)}</b>
              <span class="tag">${x.task}</span>
              <span class="tag">${x.mins} min</span>
              <div class="small">${new Date(x.ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </div>
            <div class="sess-stats">
              <div class="small">
                Focus <b class="${cl(f)}">${sg(f)}</b> · 
                Stress <b class="${cl(s)}">${sg(s)}</b> · 
                Mood <b class="${cl(m)}">${sg(m)}</b>
              </div>
              <button class="del" onclick="delS(${x.id})">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function delS(id) {
  if (confirm('Delete this session? This cannot be undone.')) {
    SES = SES.filter(x => x.id != id);
    save();
    render();
  }
}

// ============================================
// ANALYTICS VIEW
// ============================================

function vAnalytics() {
  if (SES.length < 3) {
    return `
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="greeting">Analytics</h1>
          <p class="subtitle">Track your focus patterns and productivity trends.</p>
        </div>
      </div>
      
      <div class="card empty">
        <i class="fas fa-chart-line"></i>
        <p>Complete at least 3 sessions to see analytics.</p>
        <button class="btn" onclick="go('session')">
          <i class="fas fa-play"></i>
          Start Session
        </button>
      </div>
    `;
  }
  
  const g = agg(SES);
  const M = { focus: 'Focus', stress: 'Stress Reduction', mood: 'Mood' };
  
  return `
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="greeting">Analytics</h1>
        <p class="subtitle">Based on ${SES.length} sessions</p>
      </div>
    </div>
    
    <div class="card">
      <h2><i class="fas fa-chart-bar"></i> Audio Type Comparison</h2>
      <div class="chips" role="group" aria-label="Metric" style="margin-bottom: 20px;">
        ${Object.entries(M).map(([k, t]) => `
          <button class="chip ${S.metric == k ? 'on' : ''}" 
                  aria-pressed="${S.metric == k}" 
                  onclick="S.metric='${k}';render()">
            ${t}
          </button>
        `).join('')}
      </div>
      ${chart(g, S.metric)}
      <p class="small">
        Bars show average change from before to after sessions. 
        Positive values are better for all metrics. Numbers in parentheses show session count.
        These patterns describe your personal experience only.
      </p>
    </div>
  `;
}

function agg(list) {
  const g = {};
  AUDIO.forEach(a => g[a.id] = { n: 0, focus: 0, stress: 0, mood: 0 });
  
  list.forEach(x => {
    const o = g[x.audio];
    o.n++;
    ['focus', 'stress', 'mood'].forEach(k => o[k] += dl(x, k));
  });
  
  AUDIO.forEach(a => {
    const o = g[a.id];
    ['focus', 'stress', 'mood'].forEach(k => o[k] = o.n ? o[k] / o.n : 0);
  });
  
  return g;
}

function chart(g, m) {
  const rows = AUDIO.filter(a => g[a.id].n);
  if (!rows.length) return '<p class="empty">No data yet.</p>';
  
  const mx = Math.max(1, ...rows.map(a => Math.abs(g[a.id][m])));
  const W = 700;
  const mid = 200;
  const H = rows.length * 60 + 20;
  
  return `
    <div class="scroll">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Average ${m} change by audio type" style="width:100%;min-width:600px;">
        <line x1="${mid}" x2="${mid}" y1="0" y2="${H}" stroke="rgba(201,180,255,0.3)" stroke-width="2"/>
        
        ${rows.map((a, i) => {
          const v = g[a.id][m];
          const w = Math.abs(v) / mx * 400;
          const y = i * 60 + 10;
          
          return `
            <text x="10" y="${y + 30}" fill="${a.c}" font-size="16" font-weight="700">${a.n}</text>
            <text x="170" y="${y + 30}" fill="var(--muted-grey)" font-size="14" text-anchor="end">(${g[a.id].n})</text>
            
            <rect x="${v >= 0 ? mid : mid - w}" y="${y}" width="${Math.max(w, 3)}" height="40" rx="8" 
                  fill="${v >= 0 ? a.c : 'var(--bad)'}" 
                  style="filter:drop-shadow(0 2px 8px ${v >= 0 ? a.c : '#ff7d73'})"/>
            
            <text x="${v >= 0 ? mid + w + 10 : mid - w - 10}" y="${y + 30}" 
                  text-anchor="${v >= 0 ? 'start' : 'end'}" 
                  fill="var(--white)" font-size="16" font-weight="700">
              ${sg(v)}
            </text>
          `;
        }).join('')}
      </svg>
    </div>
  `;
}

// ============================================
// PROFILE VIEW
// ============================================

function vProfile() {
  const goal = +localStorage.getItem(GOAL_KEY) || 150;
  
  return `
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="greeting">Profile</h1>
        <p class="subtitle">Manage your preferences and settings.</p>
      </div>
    </div>
    
    <div class="card">
      <h2><i class="fas fa-user"></i> Profile Information</h2>
      
      <div class="lbl">
        <label for="userName">Your Name</label>
      </div>
      <input type="text" id="userName" value="${S.userName}" 
             style="width:100%;padding:12px;border-radius:12px;border:1.5px solid var(--border);background:var(--obsidian);color:var(--white);font:inherit;"
             onchange="S.userName=this.value;localStorage.setItem('moodbeats:userName',this.value);render();">
    </div>
    
    <div class="card">
      <h2><i class="fas fa-target"></i> Study Goals</h2>
      
      <div class="lbl">
        <label for="goalInput">Weekly Study Goal (minutes)</label>
        <output id="goalOutput">${goal}</output>
      </div>
      <input type="range" id="goalInput" min="30" max="600" step="15" value="${goal}"
             oninput="$('goalOutput').textContent=this.value;localStorage.setItem('${GOAL_KEY}',this.value);window.dispatchEvent(new CustomEvent('mb:render',{detail:{view:S.view,sessions:SES}}));">
      
      <p class="small">Set a realistic weekly study target to stay motivated.</p>
    </div>
    
    <div class="card">
      <h2><i class="fas fa-database"></i> Data Management</h2>
      
      <button class="btn alt" onclick="sample()">
        <i class="fas fa-flask"></i>
        Load Sample Data
      </button>
      
      <button class="btn alt" onclick="clearAll()" style="margin-top:12px;">
        <i class="fas fa-trash"></i>
        Clear All Sessions
      </button>
      
      <p class="small" style="margin-top:16px;">
        All data is stored locally in your browser. No data is sent to any server.
      </p>
    </div>
  `;
}

function sample() {
  if (!confirm('Load sample data? This will add 20 example sessions.')) return;
  
  const bias = {
    lofi: [1.6, 1, 0.6],
    instr: [1.2, 0.8, 0.5],
    nature: [0.8, 1.6, 0.8],
    freq: [0.3, 0.2, 0],
    ambient: [1.0, 0.7, 0.4],
    none: [0.5, 0, 0]
  };
  const r = () => Math.random() - 0.5;
  const out = [];
  
  for (let i = 0; i < 20; i++) {
    const a = AUDIO[i % 6].id;
    const b = bias[a];
    const t = TASKS[Math.floor(Math.random() * 6)];
    const pf = 3 + Math.floor(Math.random() * 4);
    const ps = 4 + Math.floor(Math.random() * 4);
    const pm = 2 + Math.floor(Math.random() * 2);
    const cp = v => Math.max(1, Math.min(10, Math.round(v)));
    
    out.push({
      id: Date.now() + i,
      ts: Date.now() - (20 - i) * 86400000 * 1.2,
      task: t,
      audio: a,
      mins: [15, 25, 45][i % 3],
      pre: { mood: pm, stress: ps, focus: pf },
      post: {
        mood: Math.max(1, Math.min(5, Math.round(pm + b[2] + r() * 1.5))),
        stress: cp(ps - b[1] + r() * 2),
        focus: cp(pf + b[0] + r() * 2)
      }
    });
  }
  
  SES = SES.concat(out);
  save();
  render();
}

function clearAll() {
  if (confirm('Delete all saved sessions? This cannot be undone.')) {
    SES = [];
    save();
    render();
  }
}

// ============================================
// INITIALIZATION
// ============================================

render();
