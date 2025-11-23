'use client';

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FlashCard from './FlashCard';

interface FlashCardData {
  id: string;
  question: string;
  answer: string;
}

interface FlashCardCarouselProps {
  cards: FlashCardData[];
  title?: string;
}

export default function FlashCardCarousel({ cards, title }: FlashCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100 && currentIndex > 0) {
      handlePrev();
    } else if (info.offset.x < -100 && currentIndex < cards.length - 1) {
      handleNext();
    }
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {title && <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h3>}

      <div className="relative w-full max-w-2xl mx-auto">
        {/* Card counter */}
        <div className="text-center mb-4">
          <span className="text-sm font-medium text-gray-600">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        {/* Card display area (centered) */}
        <div className="relative h-[400px] mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              style={{ x, rotate, opacity }}
              className="w-full h-full flex items-center justify-center pointer-events-auto"
            >
              <FlashCard
                question={cards[currentIndex].question}
                answer={cards[currentIndex].answer}
                index={currentIndex}
                variant="carousel"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination (centered) - rely on swipe gestures for navigation */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex gap-2">
            {cards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-indigo-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* View all button */}
        <div className="text-center">
          <Button
            onClick={() => router.push('/dashboard/flashcards')}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            View All Flashcards
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
