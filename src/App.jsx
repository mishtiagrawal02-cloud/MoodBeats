import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { AudioPreviewProvider } from './hooks/useAudioPreview';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import AudioLibrary from './pages/AudioLibrary';
import Sessions from './pages/Sessions';
import Profile from './pages/Profile';
import './styles/global.css';
import './styles/components.css';
import './styles/study.css';
import './styles/analytics.css';
import './styles/workspace.css';

const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <AudioPreviewProvider>
          <div className="app-layout">
            <Sidebar />
            <MainContent>
              <Suspense fallback={<p className="route-loading" role="status">Loading page…</p>}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/study" element={<Study />} />
                  <Route path="/audio" element={<AudioLibrary />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </MainContent>
          </div>
        </AudioPreviewProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
