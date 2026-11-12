import { useEffect } from 'react';
import BeforeStudyCheckIn from '../components/study/BeforeStudyCheckIn';
import ActiveStudyRoom from '../components/study/ActiveStudyRoom';
import AfterStudyCheckIn from '../components/study/AfterStudyCheckIn';
import SessionCompleteCard from '../components/study/SessionCompleteCard';
import useStudyStore from '../store/useStudyStore';

function Study() {
  const { sessionStage, startBeforeCheckIn } = useStudyStore();
  
  // Auto-start check-in if no session
  useEffect(() => {
    if (sessionStage === 'none') {
      startBeforeCheckIn();
    }
  }, [sessionStage, startBeforeCheckIn]);
  
  const renderStage = () => {
    switch (sessionStage) {
      case 'before-checkin':
        return <BeforeStudyCheckIn />;
      case 'study-room':
        return <ActiveStudyRoom />;
      case 'after-checkin':
        return <AfterStudyCheckIn />;
      case 'complete':
        return <SessionCompleteCard />;
      default:
        return <BeforeStudyCheckIn />;
    }
  };
  
  return (
    <div className="page-study">
      {renderStage()}
    </div>
  );
}

export default Study;
