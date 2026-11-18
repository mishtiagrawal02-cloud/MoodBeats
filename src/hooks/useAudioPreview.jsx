import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { audioEngine } from '../utils/audioEngine';
import { useUserData } from './useUserData';

const PreviewContext = createContext(null);

export function AudioPreviewProvider({ children }) {
  const { pathname } = useLocation();
  const { quickStudyConfig } = useUserData();
  const defaultVolume = quickStudyConfig?.volume ?? 0.6;
  const [volume, setVolume] = useState(defaultVolume);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const canPreview = Boolean(window.AudioContext || window.webkitAudioContext);

  useEffect(() => { setVolume(defaultVolume); }, [defaultVolume]);

  useLayoutEffect(() => {
    if (!preview || pathname === '/dashboard' || pathname === '/audio') return;
    audioEngine.stop();
    setPreview(null);
    setError('');
  }, [pathname, preview]);

  function toggle(id) {
    if (!canPreview || id === 'none') return;
    setError('');
    try {
      if (preview?.id === id) {
        if (preview.paused) audioEngine.resume();
        else audioEngine.pause();
        setPreview({ id, paused: !preview.paused });
      } else if (audioEngine.start(id, volume)) {
        setPreview({ id, paused: false });
      } else {
        setPreview(null);
        setError('This soundscape could not play. Try again or choose another.');
      }
    } catch {
      audioEngine.stop();
      setPreview(null);
      setError('Audio could not start in this browser.');
    }
  }

  function stop() {
    if (!preview) return;
    audioEngine.stop();
    setPreview(null);
  }

  function changeVolume(next) {
    setVolume(next);
    if (preview) audioEngine.setVolume(next);
  }

  return (
    <PreviewContext.Provider value={{ preview, canPreview, error, toggle, stop, volume, changeVolume }}>
      {children}
    </PreviewContext.Provider>
  );
}

export function useAudioPreview() {
  return useContext(PreviewContext);
}
