import { useEffect, useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Slider from '../shared/Slider';
import Modal from '../shared/Modal';
import EnvironmentSelect from './EnvironmentSelect';
import useStudyStore from '../../store/useStudyStore';
import audioEngine from '../../utils/audioEngine';

function ActiveStudyRoom() {
  const {
    elapsedSeconds,
    isRunning,
    targetDuration,
    currentEnvironment,
    audioVolume,
    isAudioPlaying,
    startTimer,
    pauseTimer,
    incrementTimer,
    playAudio,
    pauseAudio,
    setAudioVolume,
    changeEnvironment,
    endStudySession,
  } = useStudyStore();
  
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  
  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        incrementTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, incrementTimer]);
  
  // Audio sync effect
  useEffect(() => {
    if (isAudioPlaying && currentEnvironment) {
      audioEngine.play(currentEnvironment);
    } else {
      audioEngine.stop();
    }
    
    return () => {
      audioEngine.stop();
    };
  }, [isAudioPlaying, currentEnvironment]);
  
  // Volume sync effect
  useEffect(() => {
    audioEngine.setVolume(audioVolume);
  }, [audioVolume]);
  
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const getProgressPercentage = () => {
    if (!targetDuration) return 0;
    const targetSeconds = targetDuration * 60;
    return Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  };
  
  const handlePlayPauseTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };
  
  const handlePlayPauseAudio = () => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };
  
  const handleVolumeChange = (value) => {
    setAudioVolume(value);
  };
  
  const handleEnvironmentChange = (environment) => {
    changeEnvironment(environment);
    setShowEnvironmentModal(false);
  };
  
  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this study session?')) {
      endStudySession();
    }
  };
  
  const targetSeconds = targetDuration * 60;
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const isTargetReached = elapsedSeconds >= targetSeconds;
  
  return (
    <div className="active-study-room">
      {/* Timer Display */}
      <Card className="timer-card">
        <div className="timer-display">
          <div className="timer-label">Elapsed Time</div>
          <div className="timer-value">{formatTime(elapsedSeconds)}</div>
          <div className="timer-target">Target: {targetDuration} minutes</div>
          
          {/* Progress Bar */}
          <div className="timer-progress-bar">
            <div
              className="timer-progress-fill"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          
          <div className="timer-remaining">
            {isTargetReached ? (
              <span className="target-reached">🎉 Target reached!</span>
            ) : (
              <span>{formatTime(remainingSeconds)} remaining</span>
            )}
          </div>
        </div>
        
        {/* Timer Controls */}
        <div className="timer-controls">
          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            size="large"
            onClick={handlePlayPauseTimer}
          >
            {isRunning ? (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" fill="currentColor" />
                </svg>
                Pause Timer
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                </svg>
                Resume Timer
              </>
            )}
          </Button>
        </div>
      </Card>
      
      {/* Audio Controls */}
      <Card className="audio-card">
        <h3 className="card-title">Audio Environment</h3>
        
        <div className="current-environment">
          <div
            className="environment-badge"
            style={{ backgroundColor: currentEnvironment?.color }}
          >
            <span className="environment-icon-large">{currentEnvironment?.icon}</span>
          </div>
          <div className="environment-details">
            <h4>{currentEnvironment?.name}</h4>
            <p>{currentEnvironment?.description}</p>
          </div>
        </div>
        
        <div className="audio-controls-group">
          <Button
            variant={isAudioPlaying ? 'secondary' : 'primary'}
            onClick={handlePlayPauseAudio}
            fullWidth
          >
            {isAudioPlaying ? (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="5" y="3" width="3" height="14" fill="currentColor" />
                  <rect x="12" y="3" width="3" height="14" fill="currentColor" />
                </svg>
                Pause Audio
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 3v14l10-7L6 3z" fill="currentColor" />
                </svg>
                Play Audio
              </>
            )}
          </Button>
          
          <div className="volume-control">
            <label>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M7 3L4 6H1v4h3l3 3V3zm6 5c0-1.5-1-2.7-2.5-3v6c1.5-.3 2.5-1.5 2.5-3z"
                  fill="currentColor"
                />
              </svg>
              Volume
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={audioVolume}
              onChange={handleVolumeChange}
            />
            <span className="volume-value">{Math.round(audioVolume * 100)}%</span>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setShowEnvironmentModal(true)}
            fullWidth
          >
            Change Environment
          </Button>
        </div>
      </Card>
      
      {/* End Session Button */}
      <div className="study-room-footer">
        <Button
          variant="danger"
          size="large"
          onClick={handleEndSession}
          fullWidth
        >
          End Study Session
        </Button>
      </div>
      
      {/* Environment Change Modal */}
      {showEnvironmentModal && (
        <Modal
          isOpen={showEnvironmentModal}
          onClose={() => setShowEnvironmentModal(false)}
          title="Change Audio Environment"
        >
          <EnvironmentSelect
            selectedEnvironment={currentEnvironment}
            onSelect={handleEnvironmentChange}
          />
        </Modal>
      )}
    </div>
  );
}

export default ActiveStudyRoom;
