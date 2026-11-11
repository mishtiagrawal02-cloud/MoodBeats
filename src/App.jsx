import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import AudioLibrary from './pages/AudioLibrary';
import Sessions from './pages/Sessions';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import './styles/global.css';
import './styles/components.css';
import './styles/dashboard.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <MainContent>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/study" element={<Study />} />
            <Route path="/audio" element={<AudioLibrary />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainContent>
      </div>
    </BrowserRouter>
  );
}

export default App;
