'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  Lightbulb,
  Music,
  Globe,
  Code,
  Heart,
  Star,
  Film,
  Coffee,
  User,
} from 'lucide-react';

interface FlashCardProps {
  question: string;
  answer: string;
  index?: number;
}

export default function FlashCard({ question, answer, index = 0 }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const { frontGradient, backGradient, Icon } = useMemo(() => {
    const gradientPairs: [string, string][] = [
      ['#f6d365', '#fda085'],
      ['#ffecd2', '#fcb69f'],
      ['#a1c4fd', '#c2e9fb'],
      ['#fbc2eb', '#a6c1ee'],
      ['#cfd9df', '#e2ebf0'],
    ];

    const icons = [BookOpen, Lightbulb, Music, Globe, Code, Heart, Star, Film, Coffee, User];

    const text = (question + ' ' + answer).toLowerCase();
    const keywordMap: [RegExp, any][] = [
      [/book|define|term|what is|who is|history/, BookOpen],
      [/idea|why|think|reason|concept/, Lightbulb],
      [/music|song|melody|sound/, Music],
      [/world|country|map|geography|globe/, Globe],
      [/code|javascript|program|algorithm|function/, Code],
      [/love|feel|emotion|heart/, Heart],
      [/star|famous|notable/, Star],
      [/film|movie|scene|cinema/, Film],
      [/coffee|drink|break|morning/, Coffee],
      [/person|who|name|born/, User],
    ];

    let SelectedIcon: any = undefined;
    for (const [rx, IconCandidate] of keywordMap) {
      if (rx.test(text)) {
        SelectedIcon = IconCandidate;
        break;
      }
    }

    if (!SelectedIcon) {
      SelectedIcon = icons[(index + text.length) % icons.length];
    }

    const seed = index + text.length;
    const primary = gradientPairs[seed % gradientPairs.length];
    const secondary = gradientPairs[(seed + 3) % gradientPairs.length];

    return {
      frontGradient: `linear-gradient(135deg, ${primary[0]} 0%, ${primary[1]} 100%)`,
      backGradient: `linear-gradient(135deg, ${secondary[0]} 0%, ${secondary[1]} 100%)`,
      Icon: SelectedIcon,
    };
  }, [question, answer, index]);

  return (
    <motion.div
      className="relative w-48 sm:w-64 md:w-72 lg:w-80 xl:w-96 cursor-pointer perspective-1000 max-h-[85vh]"
      onClick={() => setIsFlipped((s) => !s)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{ aspectRatio: '1 / 2' }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - Question */}
        <Card
          className="absolute inset-0 p-6 rounded-2xl shadow-lg border-2 border-gray-200 flex items-center justify-center text-center overflow-hidden"
          style={{ backfaceVisibility: 'hidden', background: frontGradient }}
        >
          <div className="absolute inset-0 bg-black/24 rounded-2xl pointer-events-none" />

          <div className="absolute top-4 left-4 p-2 rounded-md bg-white/20 backdrop-blur-sm z-20">
            <Icon className="text-white" size={18} />
          </div>

          <div className="relative z-20 flex flex-col items-center gap-4 px-2">
            <div className="text-sm font-medium text-white/90 uppercase tracking-wide">
              Question
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-relaxed">
              {question}
            </p>
            <div className="mt-4 text-xs text-white/70">Click to reveal answer</div>
          </div>
        </Card>

        {/* Back - Answer */}
        <Card
          className="absolute inset-0 p-6 rounded-2xl shadow-lg border-2 border-gray-200 flex items-center justify-center text-center overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: backGradient,
          }}
        >
          <div className="absolute inset-0 bg-black/24 rounded-2xl pointer-events-none" />

          <div className="absolute top-4 left-4 p-2 rounded-md bg-white/20 backdrop-blur-sm z-20">
            <Icon className="text-white" size={18} />
          </div>

          <div className="relative z-20 flex flex-col items-center gap-4 px-2">
            <div className="text-sm font-medium text-white/90 uppercase tracking-wide">Answer</div>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-relaxed">
              {answer}
            </p>
            <div className="mt-4 text-xs text-white/70">Click to see question</div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
