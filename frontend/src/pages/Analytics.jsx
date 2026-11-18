import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import ActivityTrends from '../components/analytics/ActivityTrends';
import CompletionPatterns from '../components/analytics/CompletionPatterns';
import { useDashboardStats } from '../hooks/useDashboardStats';
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
  const { sessions, userName, goal } = useUserData();
  const totals = useDashboardStats(sessions, goal);

  const {
    dateRange,
    currentSessions,
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
    <main className="workspace-page analytics-page-container" aria-labelledby="page-title">
      <Header title="Analytics" userName={userName} />

      <div className="analytics-main-content">
        <AnalyticsHeader
          dateRange={dateRange}
          onRangeChange={setDateRange}
        />

        {/* Global Empty State when no study sessions exist at all */}
        {!hasAnyData ? (
          <div className="workspace-panel workspace-empty-panel">
            <span className="workspace-session-icon" aria-hidden="true"><i className="fas fa-chart-line" /></span>

            <h2>No Study Data Recorded Yet</h2>
            <p>
              Save a study session to see your trends here.
            </p>

            <Link className="btn btn-primary workspace-primary" to="/study">
              <i className="fas fa-play" aria-hidden="true" /> Start studying
            </Link>
          </div>
        ) : (
          <>
            {/* Overview Summary Cards */}
            <AnalyticsOverview overview={overview} dateRange={dateRange} totals={totals} />
            <ActivityTrends sessions={currentSessions} />

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
            <div className="analytics-charts-grid-two-col">
              <TaskDistributionChart taskData={tasks} />
              <CompletionPatterns sessions={currentSessions} />
            </div>

            {/* Row 4: Personal Intelligence Insights */}
            <PersonalInsights insights={insights} />
          </>
        )}
      </div>
    </main>
  );
}

export default Analytics;
