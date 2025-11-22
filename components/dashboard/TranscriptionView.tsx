import React from 'react';
import { motion } from 'framer-motion';

interface TranscriptionViewProps {
  text?: string;
  className?: string;
}

/**
 * TranscriptionView
 * - Left-aligns text
 * - Inserts two line breaks after every 2 sentences (full-stops only)
 * - Preserves whitespace/newlines so the UI shows breaks correctly
 */
export default function TranscriptionView({ text = '', className = '' }: TranscriptionViewProps) {
  // Normalize whitespace
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return (
      <div
        className={`bg-gray-400/10 rounded-xl p-4 min-h-[120px] w-full text-left whitespace-pre-wrap ${className}`}
      >
        <p className="text-gray-900">{''}</p>
      </div>
    );
  }

  // Split by full-stops that end sentences. Keep the full-stop on each sentence.
  // This uses a regex to match sequences ending with a single dot.
  const sentenceMatches = normalized.match(/[^.]*\./g) || [];

  // If there are no sentences detected with dots, treat the whole text as one block
  const remainder = normalized.replace(sentenceMatches.join(''), '').trim();

  const sentences: string[] = sentenceMatches.map((s) => s.trim());
  if (remainder) sentences.push(remainder);

  // Group sentences in pairs and join groups with two line breaks
  const groups: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const group = sentences.slice(i, i + 2).join(' ');
    groups.push(group);
  }

  return (
    <div
      className={`bg-gray-400/10 rounded-xl p-4 min-h-[120px] w-full text-left whitespace-pre-wrap ${className}`}
    >
      {groups.map((g, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: i * 0.06 }}
          className={`text-gray-900 mb-3 ${i === groups.length - 1 ? 'mb-0' : ''}`}
        >
          {g}
        </motion.p>
      ))}
    </div>
  );
}
