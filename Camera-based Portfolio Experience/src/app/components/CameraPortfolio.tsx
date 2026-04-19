import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { ThumbnailGallery } from './ThumbnailGallery';
import { ImageDetailView } from './ImageDetailView';
import { HandCursor } from './HandCursor';
import { motion, AnimatePresence } from 'motion/react';

export interface PortfolioImage {
  id: string;
  title: string;
  category: string;
  year: string;
  query: string;
}

const portfolioImages: PortfolioImage[] = [
  { id: '1', title: 'Urban Futures', category: 'Architecture', year: '2025', query: 'modern architecture cityscape' },
  { id: '2', title: 'Kinetic Forms', category: 'Sculpture', year: '2024', query: 'abstract sculpture installation' },
  { id: '3', title: 'Digital Terrains', category: 'Data Viz', year: '2024', query: 'data visualization technology' },
  { id: '4', title: 'Material Lab', category: 'Research', year: '2023', query: 'material texture close up' },
  { id: '5', title: 'Sound Spaces', category: 'Spatial Design', year: '2023', query: 'concert hall architecture' },
  { id: '6', title: 'Light Studies', category: 'Photography', year: '2025', query: 'dramatic lighting abstract' },
  { id: '7', title: 'Fluid Dynamics', category: 'Generative', year: '2024', query: 'fluid motion abstract' },
];

export function CameraPortfolio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fingertipPosition, setFingertipPosition] = useState<{ x: number; y: number } | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [focusedImageId, setFocusedImageId] = useState<string | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const smoothedPositionRef = useRef<{ x: number; y: number } | null>(null);
  const dwellTimerRef = useRef<number | null>(null);
  const dwellStartRef = useRef<number | null>(null);
  const lastFocusedRef = useRef<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleSelection = useCallback((imageId: string) => {
    if (selectedImage) return;
    const image = portfolioImages.find(img => img.id === imageId);
    if (image) {
      setSelectedImage(image);
      setDwellProgress(0);
      setFocusedImageId(null);
      if (dwellTimerRef.current) {
        cancelAnimationFrame(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
    }
  }, [selectedImage]);

  useEffect(() => {
    const initHandTracking = async () => {
      if (!videoRef.current) return;

      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });

      cameraRef.current = camera;
      camera.start();
    };

    initHandTracking();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (dwellTimerRef.current) {
        cancelAnimationFrame(dwellTimerRef.current);
      }
    };
  }, []);

  const onResults = (results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      if (showInstructions) {
        setTimeout(() => setShowInstructions(false), 3000);
      }

      const landmarks = results.multiHandLandmarks[0];
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const rawX = (1 - indexTip.x) * window.innerWidth;
        const rawY = indexTip.y * window.innerHeight;

        if (smoothedPositionRef.current) {
          const smoothing = 0.3;
          smoothedPositionRef.current = {
            x: smoothedPositionRef.current.x + (rawX - smoothedPositionRef.current.x) * smoothing,
            y: smoothedPositionRef.current.y + (rawY - smoothedPositionRef.current.y) * smoothing,
          };
        } else {
          smoothedPositionRef.current = { x: rawX, y: rawY };
        }

        setFingertipPosition(smoothedPositionRef.current);

        const distance = Math.sqrt(
          Math.pow((indexTip.x - thumbTip.x) * canvas.width, 2) +
          Math.pow((indexTip.y - thumbTip.y) * canvas.height, 2)
        );

        const wasPinching = isPinching;
        const nowPinching = distance < 50;
        setIsPinching(nowPinching);

        if (!wasPinching && nowPinching) {
          if (selectedImage) {
            setSelectedImage(null);
            setDwellProgress(0);
            setFocusedImageId(null);
          } else if (focusedImageId) {
            handleSelection(focusedImageId);
          }
        }
      }
    } else {
      smoothedPositionRef.current = null;
      setFingertipPosition(null);
      setIsPinching(false);
      setFocusedImageId(null);
      setDwellProgress(0);
      if (dwellTimerRef.current) {
        cancelAnimationFrame(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (focusedImageId && focusedImageId === lastFocusedRef.current && !selectedImage) {
      if (!dwellStartRef.current) {
        dwellStartRef.current = Date.now();
      }

      const updateDwell = () => {
        if (!dwellStartRef.current || selectedImage) return;

        const elapsed = Date.now() - dwellStartRef.current;
        const dwellDuration = 900;
        const progress = Math.min(elapsed / dwellDuration, 1);
        setDwellProgress(progress);

        if (progress >= 1 && focusedImageId) {
          handleSelection(focusedImageId);
        } else {
          dwellTimerRef.current = requestAnimationFrame(updateDwell);
        }
      };

      dwellTimerRef.current = requestAnimationFrame(updateDwell);
    } else {
      dwellStartRef.current = null;
      setDwellProgress(0);
      if (dwellTimerRef.current) {
        cancelAnimationFrame(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
    }

    lastFocusedRef.current = focusedImageId;

    return () => {
      if (dwellTimerRef.current) {
        cancelAnimationFrame(dwellTimerRef.current);
      }
    };
  }, [focusedImageId, selectedImage, handleSelection]);

  const handleCloseDetail = () => {
    setSelectedImage(null);
    setDwellProgress(0);
    setFocusedImageId(null);
  };

  return (
    <div className="size-full relative overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        playsInline
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-0"
        width={1280}
        height={720}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-3">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className={`w-2 h-2 rounded-full ${fingertipPosition ? 'bg-green-400' : 'bg-white/30'} transition-colors`} />
          <div className="text-white/70 text-xs uppercase tracking-widest">
            {fingertipPosition ? 'Tracking Active' : 'Show Hand'}
          </div>
        </div>
      </div>

      {fingertipPosition && !selectedImage && (
        <HandCursor
          x={fingertipPosition.x}
          y={fingertipPosition.y}
          isPinching={isPinching}
          isFocused={focusedImageId !== null}
          dwellProgress={dwellProgress}
        />
      )}

      <ThumbnailGallery
        images={portfolioImages}
        fingertipPosition={fingertipPosition}
        onFocusChange={setFocusedImageId}
        focusedImageId={focusedImageId}
        dwellProgress={dwellProgress}
        isSelecting={selectedImage !== null}
      />

      {selectedImage && (
        <ImageDetailView
          image={selectedImage}
          onClose={handleCloseDetail}
        />
      )}

      <AnimatePresence>
        {showInstructions && fingertipPosition && (
          <motion.div
            className="absolute top-24 left-1/2 -translate-x-1/2 max-w-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-black/60 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 space-y-2">
              <div className="text-white/90 text-sm font-medium text-center">
                Move your index finger near a project
              </div>
              <div className="text-white/60 text-xs text-center leading-relaxed">
                Hold for 1 second or pinch to select
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
