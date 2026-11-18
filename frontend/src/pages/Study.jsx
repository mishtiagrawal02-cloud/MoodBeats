import { AnimatePresence } from 'framer-motion';
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
    saveError,
    audioError,
    startSession,
    pauseSession,
    resumeSession,
    setVolume,
    setAudio,
    setBackground,
    endSessionForCheckIn,
    abandonSession,
    finishAfterCheckIn,
    resetToNewSession
  } = useActiveStudySession();

  return (
    <div className="workspace-page study-page-container">
      {/* Page Header (hidden during distraction-free active study room for pure focus) */}
      {stage !== 'ACTIVE' && (
        <Header title="Study room" userName={userName} />
      )}

      <main className="study-main-area">
        <AnimatePresence mode="wait">
          {stage === 'CHECK_IN' && (
            <BeforeStudyCheckIn
              key="check-in"
              preCheckIn={preCheckIn}
              onChange={(update) => setPreCheckIn((prev) => ({ ...prev, ...update }))}
              onNext={() => setStage('ENVIRONMENT')}
            />
          )}

          {stage === 'ENVIRONMENT' && (
            <EnvironmentSelect
              key="environment"
              envConfig={envConfig}
              preCheckIn={preCheckIn}
              onChange={(update) => setEnvConfig((prev) => ({ ...prev, ...update }))}
              onSceneChange={setBackground}
              onBack={() => setStage('CHECK_IN')}
              onStart={startSession}
            />
          )}

          {stage === 'ACTIVE' && activeSession && (
            <ActiveStudyRoom
              key="active"
              activeSession={activeSession}
              timerData={timerData}
              onPause={pauseSession}
              onResume={resumeSession}
              onSetVolume={setVolume}
              onSetAudio={setAudio}
              onSetBackground={setBackground}
              audioError={audioError}
              onEndForCheckIn={endSessionForCheckIn}
              onAbandon={abandonSession}
            />
          )}

          {stage === 'AFTER_CHECKIN' && (
            <AfterStudyCheckIn
              key="after-checkin"
              activeSession={activeSession}
              onComplete={finishAfterCheckIn}
              saveError={saveError}
            />
          )}

          {stage === 'COMPLETED' && (
            <SessionCompleteCard
              key="completed"
              receipt={completedReceipt}
              onNewSession={resetToNewSession}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Study;
