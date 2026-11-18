import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';

function StatsGrid({ stats }) {
  const {
    totalHours = '0.0',
    totalMins = 0,
    completedSessions = 0,
    streak = 0,
    weekMins = 0,
    goalMinutes = 150,
    goalPercent = 0
  } = stats || {};

  // Animated counter for completed sessions
  const [animatedSessions, setAnimatedSessions] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedSessions < completedSessions) {
        setAnimatedSessions(prev => Math.min(prev + Math.ceil(completedSessions / 20), completedSessions));
      }
    }, 20);
    return () => clearTimeout(timer);
  }, [animatedSessions, completedSessions]);

  // Animated counter for streak
  const [animatedStreak, setAnimatedStreak] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedStreak < streak) {
        setAnimatedStreak(prev => Math.min(prev + 1, streak));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [animatedStreak, streak]);

  // Animated progress bar
  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedProgress < goalPercent) {
        setAnimatedProgress(prev => Math.min(prev + goalPercent / 30, goalPercent));
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [animatedProgress, goalPercent]);

  return (
    <motion.section 
      className="stats-four-grid" 
      aria-label="Key Study Statistics"
      variants={staggerContainer(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      {/* 1. Total Study Hours */}
      <motion.div className="stat-card" variants={staggerItem}>
        <div className="stat-icon-wrapper">
          <i className="fas fa-clock"></i>
        </div>
        <div className="stat-body">
          <span className="stat-number">{totalHours} <span className="stat-unit">hrs</span></span>
          <span className="stat-title">Total Study Hours</span>
          <span className="stat-subtext">{totalMins} minutes focused</span>
        </div>
      </motion.div>

      {/* 2. Completed Sessions */}
      <motion.div className="stat-card" variants={staggerItem}>
        <div className="stat-icon-wrapper">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="stat-body">
          <motion.span 
            className="stat-number"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {Math.floor(animatedSessions)}
          </motion.span>
          <span className="stat-title">Completed Sessions</span>
          <span className="stat-subtext">
            {completedSessions === 0 ? 'No sessions logged yet' : `${completedSessions} total sessions recorded`}
          </span>
        </div>
      </motion.div>

      {/* 3. Current Study Streak */}
      <motion.div className="stat-card" variants={staggerItem}>
        <div className="stat-icon-wrapper streak-icon">
          <motion.i 
            className="fas fa-fire"
            animate={streak > 0 ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 1.5, repeat: streak > 0 ? Infinity : 0, delay: 0.5 }}
          />
        </div>
        <div className="stat-body">
          <motion.span 
            className="stat-number"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {animatedStreak} <span className="stat-unit">{animatedStreak === 1 ? 'day' : 'days'}</span>
          </motion.span>
          <span className="stat-title">Current Study Streak</span>
          <span className="stat-subtext">
            {streak > 0 ? 'Daily momentum active' : 'Complete today to start a streak'}
          </span>
        </div>
      </motion.div>

      {/* 4. Weekly Goal Progress */}
      <motion.div className="stat-card" variants={staggerItem}>
        <div className="stat-icon-wrapper goal-icon">
          <i className="fas fa-bullseye"></i>
        </div>
        <div className="stat-body">
          <div className="stat-number-row">
            <span className="stat-number">{weekMins} <span className="stat-unit">/ {goalMinutes} m</span></span>
            <motion.span 
              className="stat-percent-badge"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {Math.floor(animatedProgress)}%
            </motion.span>
          </div>
          <span className="stat-title">Weekly Goal Progress</span>
          <div className="stat-mini-progress-track">
            <motion.div
              className="stat-mini-progress-bar"
              initial={{ scaleX: 0, transformOrigin: '0 50%' }}
              animate={{ scaleX: animatedProgress / 100 }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
              role="progressbar"
              aria-valuenow={Math.floor(animatedProgress)}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

export default StatsGrid;

