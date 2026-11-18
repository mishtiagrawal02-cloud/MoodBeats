import { TASK_COMPLETION_LABELS } from '../../utils/constants';

function CompletionPatterns({ sessions }) {
  const totals = Object.fromEntries(Object.keys(TASK_COMPLETION_LABELS).map((status) => [status, 0]));
  let recorded = 0;
  for (const session of sessions) {
    if (!Object.hasOwn(totals, session.taskCompletion)) continue;
    totals[session.taskCompletion] += 1;
    recorded += 1;
  }

  return (
    <section className="workspace-panel workspace-completion" aria-labelledby="completion-patterns-title">
      <div className="workspace-panel-heading">
        <div>
          <h2 id="completion-patterns-title">Task completion</h2>
          {recorded > 0 && <p>{recorded} {recorded === 1 ? 'session' : 'sessions'} with a recorded outcome</p>}
        </div>
      </div>
      {recorded > 0 ? (
        <ul className="workspace-completion-list">
          {Object.entries(TASK_COMPLETION_LABELS).map(([status, label]) => (
            <li key={status}>
              <div><span>{label}</span><strong>{totals[status]}</strong></div>
              <progress max={recorded} value={totals[status]} aria-label={label} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="workspace-data-empty">No task outcomes recorded in this date range.</p>
      )}
    </section>
  );
}

export default CompletionPatterns;
