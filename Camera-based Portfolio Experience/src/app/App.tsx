import { useState } from 'react';
import { CameraPortfolio } from './components/CameraPortfolio';

export default function App() {
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted'>('prompt');

  const requestCamera = () => {
    setCameraPermission('granted');
  };

  if (cameraPermission === 'prompt') {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="text-center space-y-6 px-6 max-w-md">
          <div className="text-white/90 text-xl">Hand-Tracked Portfolio</div>
          <div className="text-white/60 text-sm">
            This experience uses your camera and hand tracking to create an interactive portfolio interface. Use your fingertip to select and view projects.
          </div>
          <button
            onClick={requestCamera}
            className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
          >
            Enable Camera & Start
          </button>
        </div>
      </div>
    );
  }

  return <CameraPortfolio />;
}