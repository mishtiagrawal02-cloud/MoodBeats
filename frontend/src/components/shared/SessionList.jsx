import { getAudioGlyph, getAudioName, MOOD_LABELS, TASK_COMPLETION_LABELS } from '../../utils/constants';

const SESSION_DATE = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const SESSION_DATETIME = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function ratingChange(before, after) {
  if (!Number.isFinite(before) || !Number.isFinite(after)) return 'Not recorded';
  const change = after - before;
  return `${before} → ${after} (${change > 0 ? '+' : ''}${change})`;
}

function SessionList({ sessions, showDetails = false }) {
  return (
    <ul className="workspace-session-list">
      {sessions.map((session, index) => {
        const date = new Date(session.ts || session.id || 'invalid');
        const delta = session.pre?.focus == null || session.post?.focus == null
          ? null
          : Number(session.post.focus) - Number(session.pre.focus);
        const completion = Object.hasOwn(TASK_COMPLETION_LABELS, session.taskCompletion)
          ? TASK_COMPLETION_LABELS[session.taskCompletion] : 'Completion not recorded';
        const hasNotes = typeof session.notes === 'string' && Boolean(session.notes.trim());

        return (
          <li key={session.id ?? session.ts ?? index}>
            <div className="workspace-session-row">
              <span className="workspace-session-icon" aria-hidden="true">
                <i className={`fas ${getAudioGlyph(session.audio)}`} />
              </span>
              <div className="workspace-session-task">
                <strong>{session.task || 'Study session'}</strong>
                <span>
                    {Number.isFinite(date.getTime()) && `${(showDetails ? SESSION_DATETIME : SESSION_DATE).format(date)} · `}
                  {getAudioName(session.audio)}
                  {session.isDemo && ' · Demo'}
                    {showDetails && ` · ${completion}`}
                </span>
              </div>
              {Number.isFinite(delta) && (
                <span className="workspace-session-delta" data-positive={delta > 0}>
                  {delta > 0 ? '+' : ''}{delta} focus
                </span>
              )}
              <span className="workspace-session-duration">{session.mins} min</span>
            </div>
            {showDetails && (
              <details className="workspace-session-notes">
                <summary>Session details</summary>
                <dl className="workspace-session-details">
                  <div><dt>Mood before</dt><dd>{MOOD_LABELS[session.pre?.mood - 1] || 'Not recorded'}</dd></div>
                  <div><dt>Mood after</dt><dd>{MOOD_LABELS[session.post?.mood - 1] || 'Not recorded'}</dd></div>
                  <div><dt>Stress</dt><dd>{ratingChange(session.pre?.stress, session.post?.stress)}</dd></div>
                  <div><dt>Focus</dt><dd>{ratingChange(session.pre?.focus, session.post?.focus)}</dd></div>
                </dl>
                {hasNotes && <p>{session.notes}</p>}
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default SessionList;
