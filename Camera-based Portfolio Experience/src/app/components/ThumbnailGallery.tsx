import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { PortfolioImage } from './CameraPortfolio';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ThumbnailGalleryProps {
  images: PortfolioImage[];
  fingertipPosition: { x: number; y: number } | null;
  onFocusChange: (id: string | null) => void;
  focusedImageId: string | null;
  dwellProgress: number;
  isSelecting: boolean;
}

export function ThumbnailGallery({
  images,
  fingertipPosition,
  onFocusChange,
  focusedImageId,
  dwellProgress,
  isSelecting,
}: ThumbnailGalleryProps) {
  const thumbnailRefs = useRef<Map<string, { rect: DOMRect; centerX: number; centerY: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current) return;
      const newBounds = new Map<string, { rect: DOMRect; centerX: number; centerY: number }>();
      containerRef.current.querySelectorAll('[data-thumbnail-id]').forEach((el) => {
        const id = el.getAttribute('data-thumbnail-id');
        if (id) {
          const rect = el.getBoundingClientRect();
          newBounds.set(id, {
            rect,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
          });
        }
      });
      thumbnailRefs.current = newBounds;
    };

    updateBounds();
    const interval = setInterval(updateBounds, 100);
    window.addEventListener('resize', updateBounds);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateBounds);
    };
  }, [images]);

  useEffect(() => {
    if (!fingertipPosition || isSelecting) {
      onFocusChange(null);
      return;
    }

    let nearestId: string | null = null;
    let nearestDistance = Infinity;
    const snapThreshold = 200;

    thumbnailRefs.current.forEach((data, id) => {
      const dx = fingertipPosition.x - data.centerX;
      const dy = fingertipPosition.y - data.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < snapThreshold && distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = id;
      }
    });

    onFocusChange(nearestId);
  }, [fingertipPosition, onFocusChange, isSelecting]);

  const containerOffsetX = fingertipPosition
    ? (fingertipPosition.x - window.innerWidth / 2) * 0.02
    : 0;

  return (
    <motion.div
      ref={containerRef}
      className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-6 px-6"
      animate={{
        x: containerOffsetX,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 150 }}
    >
      {images.map((image, index) => {
        const isFocused = focusedImageId === image.id;

        return (
          <motion.div
            key={image.id}
            data-thumbnail-id={image.id}
            className="relative"
            initial={{ y: 100, opacity: 0 }}
            animate={{
              y: 0,
              opacity: isSelecting ? 0.3 : 1,
            }}
            transition={{ delay: index * 0.05, type: 'spring', damping: 20 }}
          >
            <motion.div
              className="relative w-32 h-40 rounded-xl overflow-hidden"
              animate={{
                scale: isFocused ? 1.25 : 1,
                y: isFocused ? -20 : 0,
              }}
              transition={{ type: 'spring', damping: 18, stiffness: 250 }}
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />

              <ImageWithFallback
                src={`https://source.unsplash.com/500x600/?${encodeURIComponent(image.query)}`}
                alt={image.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <motion.div
                className="absolute inset-0 border-3 rounded-xl"
                animate={{
                  borderColor: isFocused ? 'rgba(99, 102, 241, 0.9)' : 'rgba(255, 255, 255, 0.15)',
                  boxShadow: isFocused
                    ? '0 0 30px rgba(99, 102, 241, 0.5), 0 20px 40px rgba(0, 0, 0, 0.6)'
                    : '0 10px 20px rgba(0, 0, 0, 0.4)',
                }}
                style={{ borderWidth: '3px' }}
                transition={{ duration: 0.2 }}
              />

              {isFocused && dwellProgress > 0 && (
                <motion.div
                  className="absolute inset-0 bg-indigo-500/20 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: dwellProgress }}
                />
              )}

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <motion.div
                  className="text-sm font-medium truncate"
                  animate={{
                    scale: isFocused ? 1.05 : 1,
                  }}
                >
                  {image.title}
                </motion.div>
                <div className="text-[11px] text-white/70 truncate">{image.category}</div>
              </div>
            </motion.div>

            {isFocused && (
              <motion.div
                className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                <div className="bg-indigo-500 text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-lg">
                  {dwellProgress > 0 ? 'Hold to open...' : 'Pinch or hold'}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
