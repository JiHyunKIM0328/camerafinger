import { motion, AnimatePresence } from 'motion/react';
import type { PortfolioImage } from './CameraPortfolio';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ImageDetailViewProps {
  image: PortfolioImage;
  onClose: () => void;
}

export function ImageDetailView({ image, onClose }: ImageDetailViewProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative z-50 w-[90vw] max-w-2xl"
          initial={{ scale: 0.7, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        >
          <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
            <div className="aspect-[3/4] relative">
              <ImageWithFallback
                src={`https://source.unsplash.com/1200x1600/?${encodeURIComponent(image.query)}`}
                alt={image.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4">
                <motion.div
                  className="text-white text-5xl font-light tracking-tight leading-tight"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {image.title}
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 text-white/80 text-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="uppercase tracking-widest font-medium">{image.category}</div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                  <div className="font-light">{image.year}</div>
                </motion.div>
              </div>
            </div>

            <motion.button
              onClick={onClose}
              className="absolute top-5 right-5 w-14 h-14 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 flex items-center justify-center transition-colors border-2 border-white/30"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <motion.div
            className="mt-6 text-center text-white/60 text-sm bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full mx-auto w-fit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Tap anywhere to close
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
