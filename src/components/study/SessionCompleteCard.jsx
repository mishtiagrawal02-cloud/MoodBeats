import { useNavigate } from 'react-router-dom';
import Card from '../shared/Card';
import Button from '../shared/Button';
import useStudyStore from '../../store/useStudyStore';

function SessionCompleteCard() {
  const navigate = useNavigate();
  const { activeSession, resetSession } = useStudyStore();
  
  const handleStartNewSession = () => {
    resetSession();
  };
  
  const handleViewDashboard = () => {
    resetSession();
    navigate('/');
  };
  
  const handleViewAnalytics = () => {
    resetSession();
    navigate('/analytics');
  };
  
  if (!activeSession) return null;
  
  const formatDuration = () => {
    const mins = Math.floor(activeSession.duration || 0);
    return `${mins} minutes`;
  };
  
  const getMoodChange = () => {
    if (activeSession.moodAfter === undefined || activeSession.moodBefore === undefined) {
      return 0;
    }
    return activeSession.moodAfter - activeSession.moodBefore;
  };
  
  const getStressChange = () => {
    if (activeSession.stressAfter === undefined || activeSession.stressBefore === undefined) {
      return 0;
    }
    return activeSession.stressBefore - activeSession.stressAfter; // Lower stress is positive
  };
  
  const getFocusChange = () => {
    if (activeSession.focusAfter === undefined || activeSession.focusBefore === undefined) {
      return 0;
    }
    return activeSession.focusAfter - activeSession.focusBefore;
  };
  
  const renderMetricChange = (label, change, emoji) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    return (
      <div className="metric-change-item">
        <div className="metric-label">{label} {emoji}</div>
        <div className={`metric-change ${isPositive ? 'positive' : isNeutral ? 'neutral' : 'negative'}`}>
          {isNeutral ? '=' : isPositive ? '↑' : '↓'} {Math.abs(change)}
        </div>
      </div>
    );
  };
  
  return (
    <div className="session-complete">
      <div className="complete-header">
        <div className="complete-icon">✨</div>
        <h1>Session Complete!</h1>
        <p className="subtitle">Great job staying focused</p>
      </div>
      
      {/* Session Summary */}
      <Card className="summary-card">
        <h3 className="card-title">Session Summary</h3>
        
        <div className="summary-stats">
          <div className="summary-stat-item">
            <div className="stat-label">Duration</div>
            <div className="stat-value">{formatDuration()}</div>
          </div>
          
          <div className="summary-stat-item">
            <div className="stat-label">Task</div>
            <div className="stat-value">{activeSession.taskDescription || 'N/A'}</div>
          </div>
          
          <div className="summary-stat-item">
            <div className="stat-label">Environment</div>
            <div className="stat-value">
              {activeSession.environment?.icon} {activeSession.environment?.name || 'N/A'}
            </div>
          </div>
          
          <div className="summary-stat-item">
            <div className="stat-label">Productivity</div>
            <div className="stat-value">{activeSession.productive || 'N/A'}/10</div>
          </div>
        </div>
      </Card>
      
      {/* Before/After Comparison */}
      <Card className="comparison-card">
        <h3 className="card-title">How You Changed</h3>
        
        <div className="metrics-comparison">
          {renderMetricChange('Mood', getMoodChange(), '😊')}
          {renderMetricChange('Stress', getStressChange(), '😌')}
          {renderMetricChange('Focus', getFocusChange(), '🎯')}
        </div>
        
        {activeSession.notes && (
          <div className="session-notes">
            <h4>Your Notes</h4>
            <p>{activeSession.notes}</p>
          </div>
        )}
      </Card>
      
      {/* Action Buttons */}
      <div className="complete-actions">
        <Button
          variant="primary"
          size="large"
          onClick={handleStartNewSession}
          fullWidth
        >
          Start New Session
        </Button>
        
        <div className="secondary-actions">
          <Button variant="secondary" onClick={handleViewDashboard}>
            View Dashboard
          </Button>
          <Button variant="secondary" onClick={handleViewAnalytics}>
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SessionCompleteCard;
