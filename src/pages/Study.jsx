import Header from '../components/layout/Header';
import BeforeStudyCheckIn from '../components/study/BeforeStudyCheckIn';
import EnvironmentSelect from '../components/study/EnvironmentSelect';
import ActiveStudyRoom from '../components/study/ActiveStudyRoom';
import AfterStudyCheckIn from '../components/study/AfterStudyCheckIn';
import SessionCompleteCard from '../components/study/SessionCompleteCard';
import { useActiveStudySession } from '../hooks/useActiveStudySession';
import { useUserData } from '../hooks/useUserData';

function Study() {
  const { userName } = useUserData();
  const {
    stage,
    setStage,
    preCheckIn,
    setPreCheckIn,
    envConfig,
    setEnvConfig,
    activeSession,
    timerData,
    completedReceipt,
    startSession,
    pauseSession,
    resumeSession,
    setVolume,
    endSessionForCheckIn,
    abandonSession,
    finishAfterCheckIn,
    resetToNewSession
  } = useActiveStudySession();

  return (
    <div className="study-page-container">
      {/* Page Header (hidden during distraction-free active study room for pure focus) */}
      {stage !== 'ACTIVE' && (
        <Header userName={userName} />
      )}

      <main className="study-main-area">
        {stage === 'CHECK_IN' && (
          <BeforeStudyCheckIn
            preCheckIn={preCheckIn}
            onChange={(update) => setPreCheckIn((prev) => ({ ...prev, ...update }))}
            onNext={() => setStage('ENVIRONMENT')}
          />
        )}

        {stage === 'ENVIRONMENT' && (
          <EnvironmentSelect
            envConfig={envConfig}
            preCheckIn={preCheckIn}
            onChange={(update) => setEnvConfig((prev) => ({ ...prev, ...update }))}
            onBack={() => setStage('CHECK_IN')}
            onStart={startSession}
          />
        )}

        {stage === 'ACTIVE' && activeSession && (
          <ActiveStudyRoom
            activeSession={activeSession}
            timerData={timerData}
            onPause={pauseSession}
            onResume={resumeSession}
            onSetVolume={setVolume}
            onEndForCheckIn={endSessionForCheckIn}
            onAbandon={abandonSession}
          />
        )}

        {stage === 'AFTER_CHECKIN' && (
          <AfterStudyCheckIn
            activeSession={activeSession}
            onComplete={finishAfterCheckIn}
          />
        )}

        {stage === 'COMPLETED' && (
          <SessionCompleteCard
            receipt={completedReceipt}
            onNewSession={resetToNewSession}
          />
        )}
      </main>
    </div>
  );
}

export default Study;
