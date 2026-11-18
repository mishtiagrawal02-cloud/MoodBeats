import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import FocusActivity from '../components/dashboard/FocusActivity';
import RecentSessionsSection from '../components/dashboard/RecentSessionsSection';
import SoundEnvironmentMixer from '../components/dashboard/SoundEnvironmentMixer';
import Snowfall from '../components/study/Snowfall';
import { useUserData } from '../hooks/useUserData';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { readActiveSession } from '../utils/studyStorage';
import { AUDIO, getAudioName } from '../utils/constants';
import roomArt from '../assets/study-room-night.webp';

const INSPIRATION = [
  'A little focus today makes tomorrow’s work lighter.',
  'A quiet start is still a start.',
  'Make room for the next small step.',
  'Take the time to understand one thing well.'
];

function Dashboard() {
  const {
    sessions, goal, userName, quickStudyConfig, updateQuickStudyConfig,
    hasDemoData, loadDemoData, removeDemoData
  } = useUserData();
  const stats = useDashboardStats(sessions, goal);
  const [today, setToday] = useState(() => new Date());
  const [quote, setQuote] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const activeSession = readActiveSession();
  const isCheckingIn = activeSession?.stage === 'AFTER_CHECKIN'
    || activeSession?.status?.startsWith('COMPLETED_');
  const studyAction = isCheckingIn ? 'Finish check-in' : activeSession ? 'Return to study room' : 'Start studying';
  const savedMinutes = Number(quickStudyConfig?.mins);
  const duration = Number.isInteger(savedMinutes) && savedMinutes >= 1 && savedMinutes <= 180
    ? savedMinutes : 25;
  const audio = AUDIO.find((option) => option.id === quickStudyConfig?.audio)?.id ?? 'lofi';
  const focusSign = stats.avgFocusDelta > 0 ? '+' : '';
  const metrics = [
    { title: 'Study time today', value: stats.last7Days[6].minutes.toLocaleString(), unit: 'min', icon: 'fa-clock' },
    { title: 'Sessions today', value: stats.last7Days[6].sessionCount.toLocaleString(), icon: 'fa-layer-group' },
    { title: 'Current streak', value: stats.streak, unit: stats.streak === 1 ? 'day' : 'days', icon: 'fa-fire-flame-curved' },
    {
      title: 'Avg. focus change',
      value: stats.avgFocusDelta === null ? '—' : `${focusSign}${stats.avgFocusDelta}`,
      unit: stats.avgFocusDelta === null ? undefined : 'pts',
      icon: 'fa-chart-line'
    }
  ];

  return (
    <main className="workspace-dashboard" aria-labelledby="page-title">
      <Header title="Dashboard" userName={userName} date={today} showClock />

      <section className="workspace-hero" aria-labelledby="workspace-greeting">
        <div className="workspace-hero-scene" aria-hidden="true">
          <img src={roomArt} width="780" height="438" alt="" fetchPriority="high" />
          <Snowfall count={21} />
          <Snowfall layer="front" count={7} />
        </div>
        <div className="workspace-hero-content">
          <h2 id="workspace-greeting">{greeting}, {userName}.</h2>
          <p className="workspace-hero-subtitle">Settle in and make time for what matters.</p>
          <p className="workspace-hero-details">
            <span>
              <i className="far fa-clock" aria-hidden="true" />
              {activeSession?.targetMins || duration} min
            </span>
            <span>
              <i className="fas fa-headphones" aria-hidden="true" />
              {getAudioName(activeSession?.audio ?? audio)}
            </span>
          </p>
          <Link to="/study" className="btn btn-primary workspace-primary">
            <i className="fas fa-play" aria-hidden="true" />
            {studyAction}
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <dl className="workspace-metrics" aria-label="Study summary">
        {metrics.map(({ title, value, unit, icon }) => (
          <div className="workspace-metric" key={title}>
            <dt>
              <span className="workspace-metric-icon" aria-hidden="true"><i className={`fas ${icon}`} /></span>
              {title}
            </dt>
            <dd>{value}{unit && <span>{unit}</span>}</dd>
          </div>
        ))}
      </dl>

      <div className="workspace-detail-grid">
        <FocusActivity stats={stats} />
        <SoundEnvironmentMixer
          selectedAudio={audio}
          duration={duration}
          onUpdate={updateQuickStudyConfig}
        />
      </div>

      <section className="workspace-panel workspace-inspiration" aria-labelledby="inspiration-title">
        <span className="workspace-setup-icon" aria-hidden="true"><i className="fas fa-quote-left" /></span>
        <div>
          <h2 id="inspiration-title">Inspiration</h2>
          <blockquote aria-live="polite">{INSPIRATION[quote]}</blockquote>
        </div>
        <button
          className="btn btn-secondary btn-icon"
          type="button"
          aria-label="Refresh inspiration quote"
          onClick={() => setQuote((current) => (current + 1) % INSPIRATION.length)}
        >
          <i className="fas fa-rotate" aria-hidden="true" />
        </button>
      </section>

      <RecentSessionsSection
        sessions={stats.recentSessions}
        hasDemoData={hasDemoData}
        onLoadDemoData={loadDemoData}
        onRemoveDemoData={removeDemoData}
      />
    </main>
  );
}

export default Dashboard;
