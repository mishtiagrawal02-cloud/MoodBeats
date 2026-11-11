import Header from '../components/layout/Header';
import HeroSection from '../components/dashboard/HeroSection';
import StatsGrid from '../components/dashboard/StatsGrid';
import QuickStudySection from '../components/dashboard/QuickStudySection';
import WeeklyAndTrendSection from '../components/dashboard/WeeklyAndTrendSection';
import RecentSessionsSection from '../components/dashboard/RecentSessionsSection';
import PersonalInsightsSection from '../components/dashboard/PersonalInsightsSection';
import AudioExplorerSection from '../components/dashboard/AudioExplorerSection';

import { useUserData } from '../hooks/useUserData';
import { useDashboardStats } from '../hooks/useDashboardStats';

function Dashboard() {
  const {
    sessions,
    goal,
    userName,
    quickStudyConfig,
    updateQuickStudyConfig,
    hasDemoData,
    loadDemoData,
    removeDemoData
  } = useUserData();

  const stats = useDashboardStats(sessions, goal);

  return (
    <div className="dashboard-page-container">
      {/* 1. Personalised welcome header */}
      <Header userName={userName} latestMood={stats.latestMood} />

      {/* 2. Atmospheric illustrated hero section with Start Studying CTA */}
      <HeroSection
        streak={stats.streak}
        hasDemoData={hasDemoData}
        onRemoveDemoData={removeDemoData}
      />

      {/* 3. Four statistics cards */}
      <StatsGrid stats={stats} />

      {/* 4. Quick Study section */}
      <QuickStudySection
        quickConfig={quickStudyConfig}
        onUpdateConfig={updateQuickStudyConfig}
      />

      {/* 5. Weekly study progress and seven-day focus trend */}
      <WeeklyAndTrendSection stats={stats} />

      {/* 6. Recent study sessions */}
      <RecentSessionsSection
        sessions={stats.recentSessions}
        onLoadDemoData={loadDemoData}
      />

      {/* 7. Personal insights */}
      <PersonalInsightsSection stats={stats} />

      {/* 8. Audio environment explorer */}
      <AudioExplorerSection
        selectedAudio={quickStudyConfig.audio}
        onSelectAudio={updateQuickStudyConfig}
      />
    </div>
  );
}

export default Dashboard;
