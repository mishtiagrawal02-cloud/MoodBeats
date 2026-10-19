const { useState, useEffect } = React;
const h = React.createElement;

function GoalTracker() {
  const [view, setView] = useState('session');
  const [sessions, setSessions] = useState([]);
  const [goal, setGoal] = useState(() => {
    try { return +localStorage.getItem('studybeats:goal') || 150; } catch (e) { return 150; }
  });

  // vanilla JS app se data lo
  useEffect(() => {
    const onRender = (e) => {
      setView(e.detail.view);
      setSessions(e.detail.sessions.slice());
    };
    window.addEventListener('sb:render', onRender);
    return () => window.removeEventListener('sb:render', onRender);
  }, []);

  // goal save karo
  useEffect(() => {
    try { localStorage.setItem('studybeats:goal', goal); } catch (e) {}
  }, [goal]);

  if (view !== 'dash') return null;

  // last 7 din ke minutes
  const weekAgo = Date.now() - 7 * 864e5;
  const done = sessions.filter(s => s.ts >= weekAgo).reduce((a, s) => a + s.mins, 0);
  const pct = Math.min(100, Math.round((done / goal) * 100));

  // streak (lagatar kitne din study kiya)
  const days = new Set(sessions.map(s => new Date(s.ts).toDateString()));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1); // aaj abhi nahi kiya to kal se ginti
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }

  return h('section', { className: 'card goal', 'aria-label': 'Weekly goal' },
    h('h2', null, 'Weekly goal'),
    h('div', { className: 'lbl' },
      h('label', { htmlFor: 'goal-in' }, 'Target (minutes per week)'),
      h('output', null, goal)
    ),
    h('input', {
      id: 'goal-in', type: 'range', min: 30, max: 600, step: 15, value: goal,
      onChange: (e) => setGoal(+e.target.value)
    }),
    h('div', {
      className: 'bar', role: 'progressbar',
      'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct
    }, h('div', { className: 'fill', style: { width: pct + '%' } })),
    h('p', { className: 'small' },
      done + ' of ' + goal + ' min this week (' + pct + '%)',
      pct >= 100 ? ' 🎉 Goal complete!' : ''
    ),
    h('div', { className: 'stat streak' },
      h('b', null, '🔥 ' + streak),
      h('span', null, 'day streak')
    )
  );
}

ReactDOM.createRoot(document.getElementById('react-root')).render(h(GoalTracker));
