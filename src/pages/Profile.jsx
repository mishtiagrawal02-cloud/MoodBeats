import RangeInput from '../components/shared/RangeInput';
import { useState } from 'react';
import Header from '../components/layout/Header';
import { AUDIO } from '../utils/constants';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useUserData } from '../hooks/useUserData';

function Profile() {
  const { userName, goal, sessions, quickStudyConfig, updateSettings } = useUserData();
  const stats = useDashboardStats(sessions, goal);
  const metrics = [
    ['Study time', stats.totalMins, 'min', 'fa-clock'],
    ['Sessions', stats.completedSessions, '', 'fa-layer-group'],
    ['Current streak', stats.streak, stats.streak === 1 ? 'day' : 'days', 'fa-fire-flame-curved'],
    ['Weekly goal', stats.goalPercent, '%', 'fa-bullseye']
  ];
  const [name, setName] = useState(userName);
  const [minutes, setMinutes] = useState(String(goal));
  const [audio, setAudio] = useState(quickStudyConfig.audio);
  const [volume, setVolume] = useState(quickStudyConfig.volume);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(false);
    setError('');
    const cleanName = name.trim();
    const goalMinutes = Number(minutes);

    if (!cleanName || cleanName.length > 60) {
      setError('Enter a display name between 1 and 60 characters.');
      return;
    }
    if (!Number.isInteger(goalMinutes) || goalMinutes < 1 || goalMinutes > 10080) {
      setError('Enter a weekly goal between 1 and 10,080 minutes.');
      return;
    }

    try {
      updateSettings(cleanName, goalMinutes, { audio, volume });
      setName(cleanName);
      setMinutes(String(goalMinutes));
      setSaved(true);
    } catch {
      setError('Settings could not be saved in this browser. Please try again.');
    }
  }

  return (
    <main className="workspace-page" aria-labelledby="page-title">
      <Header title="Profile" userName={userName} />

      <dl className="workspace-metrics" aria-label="Profile study statistics">
        {metrics.map(([label, value, unit, icon]) => (
          <div className="workspace-metric" key={label}>
            <dt><span className="workspace-metric-icon" aria-hidden="true"><i className={`fas ${icon}`} /></span>{label}</dt>
            <dd>{value}{unit && <span>{unit}</span>}</dd>
          </div>
        ))}
      </dl>

      <section className="workspace-panel workspace-settings" aria-labelledby="settings-title">
        <div className="workspace-section-intro">
          <div>
            <h2 id="settings-title">Profile settings</h2>
            <p>Set your display name, weekly goal, and default study audio.</p>
          </div>
          <span className="workspace-setup-icon" aria-hidden="true"><i className="fas fa-user" /></span>
        </div>

        <form className="workspace-settings-form" onSubmit={handleSubmit}>
          <div className="workspace-compact-field">
            <label htmlFor="profile-name">Display name</label>
            <input
              className="workspace-select"
              id="profile-name"
              autoComplete="nickname"
              value={name}
              maxLength={60}
              required
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="workspace-compact-field">
            <label htmlFor="profile-goal">Weekly study goal (minutes)</label>
            <input
              className="workspace-select"
              id="profile-goal"
              type="number"
              inputMode="numeric"
              min="1"
              max="10080"
              step="1"
              value={minutes}
              required
              onChange={(event) => {
                setMinutes(event.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="workspace-compact-field">
            <label htmlFor="profile-soundscape">Default soundscape</label>
            <select
              className="workspace-select"
              id="profile-soundscape"
              value={audio}
              onChange={(event) => {
                setAudio(event.target.value);
                setSaved(false);
              }}
            >
              {AUDIO.map(({ id, n }) => <option value={id} key={id}>{n}</option>)}
            </select>
          </div>
          <div className="workspace-compact-field workspace-profile-volume">
            <label htmlFor="profile-volume">Default volume</label>
            <RangeInput
              id="profile-volume"
              min="0"
              max="1"
              step="0.05"
              aria-valuetext={`${Math.round(volume * 100)}%`}
              value={volume}
              onChange={(event) => {
                setVolume(Number(event.target.value));
                setSaved(false);
              }}
            />
            <output htmlFor="profile-volume">{Math.round(volume * 100)}%</output>
          </div>

          <div className="workspace-settings-actions">
            <button className="btn btn-primary" type="submit">Save settings</button>
            {saved && <p role="status">Settings saved.</p>}
            {error && <p className="validation-error-alert" role="alert">{error}</p>}
          </div>
        </form>
      </section>
    </main>
  );
}

export default Profile;
