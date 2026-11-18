function PersonalInsights({ insights = [] }) {
  const hasInsights = Array.isArray(insights) && insights.length > 0;

  return (
    <section className="analytics-insights-section" aria-label="Personal Intelligence Insights">
      <div className="section-header-row">
        <div>
          <div className="section-title-wrap">
            <i className="fas fa-brain text-gradient"></i>
            <h2 className="section-title">Personal Intelligence Insights</h2>
          </div>
          <p className="section-subtitle">
            Observations calculated from your recorded study sessions and check-ins.
          </p>
        </div>

        <span className="insights-count-pill">
          {insights.length} {insights.length === 1 ? 'Insight' : 'Insights'}
        </span>
      </div>

      <div className="insights-cards-grid">
        {hasInsights ? (
          insights.map((item) => (
            <div key={item.id} className={`insight-card-item type-${item.type || 'neutral'}`}>
              <div className="insight-card-header">
                <div className="insight-icon-box">
                  <i className={item.icon || 'fas fa-chart-line'}></i>
                </div>
                <span className="insight-type-badge">{item.type || 'insight'}</span>
              </div>

              <h3 className="insight-card-title">{item.title}</h3>
              {item.evidenceLabel && (
                <span className="insight-evidence-label">
                  <i className="fas fa-flask-vial"></i>
                  {item.evidenceLabel}
                </span>
              )}
              <p className="insight-card-desc">{item.desc}</p>
            </div>
          ))
        ) : (
          <div className="insights-empty-card">
            <i className="fas fa-wand-magic-sparkles"></i>
            <h3>No Insights Available Yet</h3>
            <p>
              Complete study sessions with before and after check-ins to reveal your focus, mood, and soundscape patterns.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PersonalInsights;

