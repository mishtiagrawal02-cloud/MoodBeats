import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsOverview from '../components/analytics/AnalyticsOverview';
import MoodTrendsChart from '../components/analytics/MoodTrendsChart';
import FocusStressChart from '../components/analytics/FocusStressChart';
import StudyConsistencyChart from '../components/analytics/StudyConsistencyChart';
import AudioEnvironmentChart from '../components/analytics/AudioEnvironmentChart';
import TaskDistributionChart from '../components/analytics/TaskDistributionChart';
import PersonalInsights from '../components/analytics/PersonalInsights';

import { useUserData } from '../hooks/useUserData';
import { useAnalytics } from '../hooks/useAnalytics';

function Analytics() {
  const navigate = useNavigate();
  const { sessions, userName } = useUserData();

  const {
    dateRange,
    setDateRange,
    overview,
    moodTrends,
    focusStress,
    consistency,
    audio,
    tasks,
    insights,
    hasAnyData
  } = useAnalytics(sessions);

  return (
    <div className="analytics-page-container">
      {/* Top Application Header */}
      <Header userName={userName} />

      <main className="analytics-main-content">
        {/* Analytics Section Header with Date Range Selector */}
        <AnalyticsHeader
          dateRange={dateRange}
          onRangeChange={setDateRange}
          userName={userName}
        />

        {/* Global Empty State when no study sessions exist at all */}
        {!hasAnyData ? (
          <div className="analytics-global-empty-state">
            <div className="empty-state-visual">
              <div className="empty-state-icon-disc">
                <i className="fas fa-chart-line text-gradient"></i>
              </div>
              <div className="empty-ring-glow"></div>
            </div>

            <h2 className="empty-state-headline">No Study Data Recorded Yet</h2>
            <p className="empty-state-subtext">
              MoodBeats analyzes your focus trajectories, mood transformations, and audio correlations as you complete study sessions. Start your first session to unlock personalized intelligence.
            </p>

            <button
              type="button"
              className="btn btn-primary start-study-cta-btn"
              onClick={() => navigate('/study')}
            >
              <i className="fas fa-play"></i>
              <span>Start Your First Study Session</span>
            </button>
          </div>
        ) : (
          <>
            {/* Overview Summary Cards */}
            <AnalyticsOverview overview={overview} dateRange={dateRange} />

            {/* Row 1: Mood Trends & Focus/Stress Dynamics */}
            <div className="analytics-charts-grid-two-col">
              <MoodTrendsChart moodData={moodTrends} />
              <FocusStressChart focusStressData={focusStress} />
            </div>

            {/* Row 2: Consistency & Audio Environment Correlation */}
            <div className="analytics-charts-grid-two-col">
              <StudyConsistencyChart consistencyData={consistency} />
              <AudioEnvironmentChart audioData={audio} />
            </div>

            {/* Row 3: Task Distribution */}
            <div className="analytics-single-col-grid">
              <TaskDistributionChart taskData={tasks} />
            </div>

            {/* Row 4: Personal Intelligence Insights */}
            <PersonalInsights insights={insights} />
          </>
        )}
      </main>
    </div>
  );
}

export default Analytics;
