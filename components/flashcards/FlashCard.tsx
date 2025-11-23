'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface FlashCardProps {
  question: string;
  answer: string;
  index?: number;
}

export default function FlashCard({ question, answer, index = 0 }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative w-full h-[400px] cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - Question */}
        <Card
          className="absolute inset-0 p-8 rounded-2xl shadow-lg border-2 border-gray-200 flex items-center justify-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm font-medium text-white/80 uppercase tracking-wide">
              Question
            </div>
            <p className="text-2xl font-semibold text-white leading-relaxed">{question}</p>
            <div className="mt-4 text-xs text-white/60">Click to reveal answer</div>
          </div>
        </Card>

        {/* Back - Answer */}
        <Card
          className="absolute inset-0 p-8 rounded-2xl shadow-lg border-2 border-gray-200 flex items-center justify-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Answer</div>
            <p className="text-2xl font-semibold text-white leading-relaxed">{answer}</p>
            <div className="mt-4 text-xs text-white/60">Click to see question</div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
