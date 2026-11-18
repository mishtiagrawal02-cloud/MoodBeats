import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import SessionList from '../components/shared/SessionList';
import { useUserData } from '../hooks/useUserData';
import { getAudioName, TASK_COMPLETION_LABELS } from '../utils/constants';

const PAGE_SIZE = 12;
const DATE_FILTERS = [7, 30, 90];

function sessionTimestamp(session) {
  return new Date(session.ts || session.id || 'invalid').getTime() || 0;
}

function Sessions() {
  const { sessions, userName } = useUserData();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [dateRange, setDateRange] = useState('');
  const [completion, setCompletion] = useState('');
  const [sort, setSort] = useState('recent');
  const history = useMemo(() => sessions
    .filter((session) => session?.mins != null && Number.isFinite(Number(session.mins)))
    .sort((first, second) => sessionTimestamp(second) - sessionTimestamp(first)), [sessions]);
  const search = query.trim().toLocaleLowerCase();
  const cutoff = dateRange ? Date.now() - Number(dateRange) * 864e5 : 0;
  const matching = history.filter((session) => {
    const matchesSearch = `${session.task || 'Study session'} ${getAudioName(session.audio)}`
      .toLocaleLowerCase().includes(search);
    const status = Object.hasOwn(TASK_COMPLETION_LABELS, session.taskCompletion)
      ? session.taskCompletion : 'unrecorded';
    return matchesSearch && (!cutoff || sessionTimestamp(session) >= cutoff)
      && (!completion || status === completion);
  });
  if (sort === 'duration') matching.sort((first, second) => Number(second.mins) - Number(first.mins));

  function clearFilters() {
    setQuery('');
    setDateRange('');
    setCompletion('');
    setLimit(PAGE_SIZE);
  }

  return (
    <main className="workspace-page" aria-labelledby="page-title">
      <Header title="Sessions" userName={userName} />

      <section className="workspace-panel workspace-section-intro" aria-labelledby="history-title">
        <div>
          <h2 id="history-title">Session history</h2>
          <p>{history.length} saved {history.length === 1 ? 'session' : 'sessions'}</p>
        </div>
        {history.length > 0 && (
          <div className="workspace-compact-field workspace-search">
            <label htmlFor="session-search">Find a session</label>
            <input
              className="workspace-select"
              id="session-search"
              type="search"
              placeholder="Search task or soundscape"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(PAGE_SIZE);
              }}
            />
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="workspace-panel workspace-history-filters" aria-label="Session filters">
          <div className="workspace-compact-field">
            <label htmlFor="session-range">Date</label>
            <select className="workspace-select" id="session-range" value={dateRange} onChange={(event) => {
              setDateRange(event.target.value);
              setLimit(PAGE_SIZE);
            }}>
              <option value="">All dates</option>
              {DATE_FILTERS.map((days) => <option key={days} value={days}>Last {days} days</option>)}
            </select>
          </div>
          <div className="workspace-compact-field">
            <label htmlFor="session-completion">Completion</label>
            <select className="workspace-select" id="session-completion" value={completion} onChange={(event) => {
              setCompletion(event.target.value);
              setLimit(PAGE_SIZE);
            }}>
              <option value="">All statuses</option>
              {Object.entries(TASK_COMPLETION_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              <option value="unrecorded">Not recorded</option>
            </select>
          </div>
          <div className="workspace-compact-field">
            <label htmlFor="session-sort">Sort by</label>
            <select className="workspace-select" id="session-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="recent">Most recent</option>
              <option value="duration">Longest duration</option>
            </select>
          </div>
        </section>
      )}

      {history.length === 0 ? (
        <section className="workspace-panel workspace-empty-panel" aria-label="Session history">
          <span className="workspace-session-icon" aria-hidden="true"><i className="fas fa-clock-rotate-left" /></span>
          <h2>No sessions yet</h2>
          <p>Finish a study session and save your check-in to see it here.</p>
          <Link className="btn btn-primary workspace-primary" to="/study">
            <i className="fas fa-play" aria-hidden="true" /> Start studying
          </Link>
        </section>
      ) : (
        <section className="workspace-panel workspace-history" aria-label="Saved sessions">
          {matching.length ? (
            <>
              <SessionList sessions={matching.slice(0, limit)} showDetails />
              {matching.length > limit && (
                <button
                  className="btn btn-secondary workspace-load-more"
                  type="button"
                  onClick={() => setLimit((count) => count + PAGE_SIZE)}
                >
                  Show more sessions
                </button>
              )}
            </>
          ) : (
            <div className="workspace-empty-panel">
              <h2>No matching sessions</h2>
              <button className="workspace-text-link" type="button" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default Sessions;
