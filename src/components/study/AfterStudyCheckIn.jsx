import { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Slider from '../shared/Slider';
import useStudyStore from '../../store/useStudyStore';

function AfterStudyCheckIn() {
  const { submitAfterCheckIn, beforeCheckInData, elapsedSeconds } = useStudyStore();
  
  const [formData, setFormData] = useState({
    mood: 5,
    stress: 5,
    focus: 5,
    productive: 5,
    notes: '',
  });
  
  const handleSliderChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    submitAfterCheckIn(formData);
  };
  
  const getMoodEmoji = (value) => {
    if (value <= 3) return '😔';
    if (value <= 7) return '😐';
    return '😊';
  };
  
  const getStressEmoji = (value) => {
    if (value <= 3) return '😌';
    if (value <= 7) return '😰';
    return '😫';
  };
  
  const getFocusEmoji = (value) => {
    if (value <= 3) return '😴';
    if (value <= 7) return '🙂';
    return '🎯';
  };
  
  const getProductiveEmoji = (value) => {
    if (value <= 3) return '📉';
    if (value <= 7) return '📊';
    return '📈';
  };
  
  const formatDuration = () => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const getMoodChange = () => {
    if (!beforeCheckInData) return null;
    return formData.mood - beforeCheckInData.mood;
  };
  
  const getStressChange = () => {
    if (!beforeCheckInData) return null;
    return beforeCheckInData.stress - formData.stress; // Lower stress is better
  };
  
  const getFocusChange = () => {
    if (!beforeCheckInData) return null;
    return formData.focus - beforeCheckInData.focus;
  };
  
  const renderChangeIndicator = (change) => {
    if (change === null || change === 0) return null;
    
    const isPositive = change > 0;
    return (
      <span className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change)}
      </span>
    );
  };
  
  return (
    <div className="after-study-checkin">
      <div className="checkin-header">
        <h1>Great work! 🎉</h1>
        <p className="subtitle">Tell us how you're feeling after studying for {formatDuration()}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="checkin-form">
        {/* Mood, Stress, Focus Sliders with Before/After Comparison */}
        <Card>
          <h3 className="card-title">How do you feel now?</h3>
          
          <div className="slider-group">
            <div className="slider-item">
              <label className="slider-label">
                <span>Mood {getMoodEmoji(formData.mood)}</span>
                <span className="slider-value-group">
                  <span className="slider-value">{formData.mood}/10</span>
                  {renderChangeIndicator(getMoodChange())}
                </span>
              </label>
              <Slider
                min={1}
                max={10}
                value={formData.mood}
                onChange={(value) => handleSliderChange('mood', value)}
              />
              <div className="slider-hints">
                <span>Low</span>
                <span>High</span>
              </div>
              {beforeCheckInData && (
                <div className="before-value">
                  Before: {beforeCheckInData.mood}/10
                </div>
              )}
            </div>
            
            <div className="slider-item">
              <label className="slider-label">
                <span>Stress {getStressEmoji(formData.stress)}</span>
                <span className="slider-value-group">
                  <span className="slider-value">{formData.stress}/10</span>
                  {renderChangeIndicator(getStressChange())}
                </span>
              </label>
              <Slider
                min={1}
                max={10}
                value={formData.stress}
                onChange={(value) => handleSliderChange('stress', value)}
              />
              <div className="slider-hints">
                <span>Low</span>
                <span>High</span>
              </div>
              {beforeCheckInData && (
                <div className="before-value">
                  Before: {beforeCheckInData.stress}/10
                </div>
              )}
            </div>
            
            <div className="slider-item">
              <label className="slider-label">
                <span>Focus {getFocusEmoji(formData.focus)}</span>
                <span className="slider-value-group">
                  <span className="slider-value">{formData.focus}/10</span>
                  {renderChangeIndicator(getFocusChange())}
                </span>
              </label>
              <Slider
                min={1}
                max={10}
                value={formData.focus}
                onChange={(value) => handleSliderChange('focus', value)}
              />
              <div className="slider-hints">
                <span>Low</span>
                <span>High</span>
              </div>
              {beforeCheckInData && (
                <div className="before-value">
                  Before: {beforeCheckInData.focus}/10
                </div>
              )}
            </div>
            
            <div className="slider-item">
              <label className="slider-label">
                <span>Productivity {getProductiveEmoji(formData.productive)}</span>
                <span className="slider-value">{formData.productive}/10</span>
              </label>
              <Slider
                min={1}
                max={10}
                value={formData.productive}
                onChange={(value) => handleSliderChange('productive', value)}
              />
              <div className="slider-hints">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Optional Notes */}
        <Card>
          <h3 className="card-title">Session Notes (Optional)</h3>
          <div className="form-group">
            <label htmlFor="notes">How did the session go?</label>
            <textarea
              id="notes"
              className="textarea-input"
              placeholder="Any thoughts, achievements, or challenges..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
            />
          </div>
        </Card>
        
        <div className="form-actions">
          <Button type="submit" variant="primary" size="large" fullWidth>
            Complete Session
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AfterStudyCheckIn;
