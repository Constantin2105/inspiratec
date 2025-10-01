import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImageLightbox = ({ images, selectedIndex, onClose, onPrev, onNext }) => {
  if (selectedIndex === null) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
  };

  const selectedImage = images[selectedIndex];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20 hover:text-white z-10"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}
        
        <AnimatePresence mode="wait">
            <motion.div
                key={selectedIndex}
                className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <img
                    src={selectedImage}
                    alt={`Illustration ${selectedIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ImageLightbox;