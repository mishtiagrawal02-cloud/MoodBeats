import SessionList from '../shared/SessionList';

function RecentSessionsSection({ sessions, hasDemoData, onLoadDemoData, onRemoveDemoData }) {
  return (
    <section className="workspace-panel workspace-history" aria-labelledby="recent-title">
      <div className="workspace-panel-heading">
        <h2 id="recent-title">Recent sessions</h2>
        {hasDemoData && (
          <button className="btn btn-danger" type="button" onClick={onRemoveDemoData}>
            Remove demo data
          </button>
        )}
      </div>

      {sessions.length ? (
        <SessionList sessions={sessions} />
      ) : (
        <div className="workspace-history-empty">
          <span className="workspace-session-icon" aria-hidden="true"><i className="fas fa-book-open" /></span>
          <p>Your completed study sessions will appear here.</p>
          <button className="workspace-text-link" type="button" onClick={onLoadDemoData}>Load demo data</button>
        </div>
      )}
    </section>
  );
}

export default RecentSessionsSection;
