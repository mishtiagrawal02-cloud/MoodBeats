import { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Slider from '../shared/Slider';
import Input from '../shared/Input';
import EnvironmentSelect from './EnvironmentSelect';
import useStudyStore from '../../store/useStudyStore';
import { TASK_TYPES, AUDIO_ENVIRONMENTS } from '../../utils/constants';

function BeforeStudyCheckIn() {
  const { submitBeforeCheckIn } = useStudyStore();
  
  const [formData, setFormData] = useState({
    mood: 5,
    stress: 5,
    focus: 5,
    taskType: 'homework',
    taskDescription: '',
    targetDuration: 25,
    environment: AUDIO_ENVIRONMENTS[0],
  });
  
  const [errors, setErrors] = useState({});
  
  const handleSliderChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleEnvironmentSelect = (environment) => {
    setFormData(prev => ({ ...prev, environment }));
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.taskDescription.trim()) {
      newErrors.taskDescription = 'Please describe what you\'ll be working on';
    }
    
    if (formData.targetDuration < 1 || formData.targetDuration > 180) {
      newErrors.targetDuration = 'Duration must be between 1 and 180 minutes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      submitBeforeCheckIn(formData);
    }
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
  
  return (
    <div className="before-study-checkin">
      <div className="checkin-header">
        <h1>Let's get started</h1>
        <p className="subtitle">Tell us how you're feeling before you begin</p>
      </div>
      
      <form onSubmit={handleSubmit} className="checkin-form">
        {/* Mood, Stress, Focus Sliders */}
        <Card>
          <div className="slider-group">
            <div className="slider-item">
              <label className="slider-label">
                <span>Mood {getMoodEmoji(formData.mood)}</span>
                <span className="slider-value">{formData.mood}/10</span>
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
            </div>
            
            <div className="slider-item">
              <label className="slider-label">
                <span>Stress {getStressEmoji(formData.stress)}</span>
                <span className="slider-value">{formData.stress}/10</span>
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
            </div>
            
            <div className="slider-item">
              <label className="slider-label">
                <span>Focus {getFocusEmoji(formData.focus)}</span>
                <span className="slider-value">{formData.focus}/10</span>
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
            </div>
          </div>
        </Card>
        
        {/* Task Details */}
        <Card>
          <h3 className="card-title">What are you working on?</h3>
          
          <div className="form-group">
            <label htmlFor="taskType">Task Type</label>
            <select
              id="taskType"
              value={formData.taskType}
              onChange={(e) => handleInputChange('taskType', e.target.value)}
              className="select-input"
            >
              {TASK_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="taskDescription">Task Description *</label>
            <Input
              id="taskDescription"
              placeholder="e.g., Finish math homework chapter 5"
              value={formData.taskDescription}
              onChange={(e) => handleInputChange('taskDescription', e.target.value)}
              error={errors.taskDescription}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="targetDuration">Target Duration (minutes) *</label>
            <Input
              id="targetDuration"
              type="number"
              min="1"
              max="180"
              value={formData.targetDuration}
              onChange={(e) => handleInputChange('targetDuration', parseInt(e.target.value) || 0)}
              error={errors.targetDuration}
            />
          </div>
        </Card>
        
        {/* Environment Selection */}
        <Card>
          <h3 className="card-title">Choose your audio environment</h3>
          <EnvironmentSelect
            selectedEnvironment={formData.environment}
            onSelect={handleEnvironmentSelect}
          />
        </Card>
        
        <div className="form-actions">
          <Button type="submit" variant="primary" size="large" fullWidth>
            Start Study Session
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BeforeStudyCheckIn;
