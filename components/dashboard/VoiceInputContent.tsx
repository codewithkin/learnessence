'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNextjsAudioToTextRecognition } from 'nextjs-audio-to-text-recognition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Loader2, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosClient';
import { toast } from 'sonner';
import TranscriptionView from './TranscriptionView';
import FlashCardCarousel from '@/components/flashcards/FlashCardCarousel';

export default function VoiceInputContent() {
  const { isListening, transcript, startListening, stopListening } =
    useNextjsAudioToTextRecognition({
      lang: 'en-US',
      continuous: true,
      interimResults: true,
    });

  // UI-only state: duration and processing flag. We do not change the recognition logic.
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<any[]>([]);

  useEffect(() => {
    if (isListening) {
      setRecordingDuration(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isListening]);

  useEffect(() => {
    // Log transcript whenever it updates
    if (transcript) {
      console.log('Transcript:', transcript);
      // If recording has stopped, persist the last transcript so it remains visible
      if (!isListening) {
        setFinalTranscript(`
          The Great Recession was a period of market decline in economies around the world that occurred from late 2007 to mid-2009,[1] overlapping with the closely related 2008 financial crisis. The scale and timing of the recession varied from country to country (see map).[2][3] At the time, the International Monetary Fund (IMF) concluded that it was the most severe economic and financial meltdown since the Great Depression.

The causes of the Great Recession include a combination of vulnerabilities that developed in the financial system, along with a series of triggering events that began with the bursting of the United States housing bubble in 2005–2012. When housing prices fell and homeowners began to abandon their mortgages, the value of mortgage-backed securities held by investment banks declined in 2007–2008, causing several to collapse or be bailed out in September 2008. This 2007–2008 phase was called the subprime mortgage crisis.

The combination of banks being unable to provide funds to businesses and homeowners paying down debt rather than borrowing and spending resulted in the Great Recession. The recession officially began in the U.S. in December 2007 and lasted until June 2009, thus extending over 19 months.[4][5] As with most other recessions, it appears that no known formal theoretical or empirical model was able to accurately predict the advance of this recession, except for minor signals in the sudden rise of forecast probabilities, which were still well under 50%.[6]

The recession was not felt equally around the world; whereas most of the world's developed economies, particularly in North America, South America and Europe, fell into a severe, sustained recession, many more recently developing economies suffered far less impact, particularly China, India and Indonesia, whose economies grew substantially during this period. Similarly, Oceania suffered minimal impact, in part due to its proximity to Asian markets.

Terminology
Two definitions of the term "economic recession" exist: one sense referring generally to "a period of reduced economic activity"[7] and ongoing hardship; and a technical definition used in economics, which is defined operationally, specifically the contraction phase of a business cycle with two or more consecutive quarters of GDP contraction (negative GDP growth rate). The latter is typically used to influence abrupt changes in monetary policy.

Under the technical definition, the recession ended in the United States in June or July 2009.[8][9][10][11]

Journalist Robert Kuttner has argued that 'The Great Recession' is a misnomer. According to Kuttner, "recessions are mild dips in the business cycle that are either self-correcting or soon cured by modest fiscal or monetary stimulus. Because of the continuing deflationary trap, it would be more accurate to call this decade's stagnant economy The Lesser Depression or The Great Deflation."[12]

Overview
The Great Recession met the IMF criteria for being a global recession only in the single calendar year 2009.[13][14] That IMF definition requires a decline in annual real world GDP per capita. Despite the fact that quarterly data are being used as recession definition criteria by all G20 members, representing 85% of the world GDP,[15] the International Monetary Fund (IMF) has decided – in the absence of a complete data set – not to declare/measure global recessions according to quarterly GDP data. The seasonally adjusted PPP‑weighted real GDP for the G20‑zone, however, is a good indicator for the world GDP, and it was measured to have suffered a direct quarter on quarter decline during the three quarters from Q3‑2008 until Q1‑2009, which more accurately mark when the recession took place at the global level.[16]

According to the U.S. National Bureau of Economic Research (the official arbiter of U.S. recessions), the recession began in December 2007 and ended in June 2009, and thus extended over eighteen months.[5][17]
          `);
        if (isProcessing) setIsProcessing(false);
      }
    }
  }, [transcript, isProcessing]);

  const handleStart = () => {
    setIsProcessing(false);
    // If there's a previous transcript, reset it when starting a new recording
    if (finalTranscript) {
      setFinalTranscript('');
      setRecordingDuration(0);
    }
    startListening();
  };

  const handleStop = () => {
    // Show processing UI until transcript updates
    setIsProcessing(true);
    stopListening();
  };

  const router = useRouter();
  // Motion-enabled Button for subtle hover/press and entrance animations
  const MotionButton = motion(Button);

  const queryClient = useQueryClient();
  const flashcardsMutation = useMutation<any, any, { text: string }>({
    mutationFn: (payload) => api.post('/api/flashcards', payload),
    onSuccess: (response) => {
      // Store the generated flashcards from the response
      if (response.data && Array.isArray(response.data)) {
        setGeneratedFlashcards(response.data);
      }
      toast.success('Flashcards generated');
      // Don't redirect immediately - user can view carousel first
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to generate flashcards');
    },
  });

  const notesMutation = useMutation<any, any, { title: string; content: string }>({
    mutationFn: (payload) => api.post('/api/notes', payload),
    onSuccess: () => {
      toast.success('Note saved');
      setTimeout(() => router.push('/dashboard'), 900);
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to save note');
    },
  });

  const handleGenerateFlashcards = () => {
    flashcardsMutation.mutate({ text: finalTranscript });
  };

  const handleGenerateNotes = () => {
    notesMutation.mutate({
      title: `Voice Note - ${new Date().toLocaleDateString()}`,
      content: finalTranscript,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Voice Input</h1>
        <p className="text-gray-600 mt-2">Record your thoughts and convert them to notes</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Idle State - Before Recording */}
        {!isListening && !transcript && !isProcessing && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                >
                  <Mic className="w-12 h-12 text-indigo-600" />
                </motion.div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Ready to Record</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                  Click the button below to start recording. Speak clearly and your voice will be
                  transcribed automatically.
                </p>
                <MotionButton
                  onClick={handleStart}
                  size="lg"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {finalTranscript ? 'New Recording' : 'Start Recording'}
                </MotionButton>
                {/* upload UI removed per request */}
                {/* show last transcript (if any) inside the card */}
                {finalTranscript ? (
                  <TranscriptionView text={finalTranscript} className="mt-6" />
                ) : null}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recording State - Recording in Progress */}
        {isListening && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6 relative"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Mic className="w-12 h-12 text-red-600" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-red-600 font-medium">Recording</span>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-6 font-mono">
                  {formatDuration(recordingDuration)}
                </p>
                <p className="text-gray-600 mb-8 max-w-md">
                  Speak clearly into your microphone. Your voice is being captured.
                </p>
                <MotionButton
                  onClick={handleStop}
                  size="lg"
                  variant="outline"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="px-8 py-6 text-lg rounded-xl border-2 border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Square className="w-5 h-5 mr-2 fill-current" />
                  Stop Recording
                </MotionButton>
                {/* live transcript while recording */}
                <TranscriptionView text={transcript} className="mt-6" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Processing State */}
        {!isListening && isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Processing Recording</h2>
                <p className="text-gray-600">Transcribing your audio, please wait...</p>
                {/* show any partial or final transcript while processing inside the card */}
                <TranscriptionView text={transcript || finalTranscript} className="mt-6" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Transcribed State - Show Actions and recording summary side-by-side on md+ */}
        {!isListening && finalTranscript && (
          <motion.div
            key="transcribed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 mt-4"
          >
            <div className="md:flex md:items-start md:gap-6">
              {/* Action buttons card */}
              <div className="w-full">
                <Card className="p-8 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        Transcription Complete
                      </h2>
                      <p className="text-sm text-gray-600">
                        Duration: {formatDuration(recordingDuration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Flashcards button: disabled while loading */}
                    <MotionButton
                      onClick={handleGenerateFlashcards}
                      variant={flashcardsMutation.isError ? 'destructive' : 'outline'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.04 }}
                      className="justify-start h-auto py-4 px-4 rounded-xl hover:bg-indigo-50 border-gray-200 flex-1"
                      disabled={flashcardsMutation.isPending}
                    >
                      {flashcardsMutation.isPending ? (
                        <Loader2 className="w-5 h-5 mr-3 text-gray-500 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5 mr-3 text-amber-500" />
                      )}
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Generate Flashcards</div>
                        <div className="text-xs text-gray-600">Create study flashcards</div>
                      </div>
                      {!flashcardsMutation.isPending && (
                        <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                      )}
                    </MotionButton>

                    {/* Notes button */}
                    <MotionButton
                      onClick={handleGenerateNotes}
                      variant={notesMutation.isError ? 'destructive' : 'outline'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.08 }}
                      className="justify-start h-auto py-4 px-4 rounded-xl hover:bg-indigo-50 border-gray-200 flex-1"
                      disabled={notesMutation.isPending}
                    >
                      {notesMutation.isPending ? (
                        <Loader2 className="w-5 h-5 mr-3 text-gray-500 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5 mr-3 text-indigo-600" />
                      )}
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Generate Notes</div>
                        <div className="text-xs text-gray-600">Save transcription as a note</div>
                      </div>
                      {!notesMutation.isPending && (
                        <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                      )}
                    </MotionButton>
                  </div>
                </Card>
              </div>
            </div>

            {/* Show flashcard carousel after generation */}
            {generatedFlashcards.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
                onClick={() => setGeneratedFlashcards([])}
              >
                <div
                  className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FlashCardCarousel
                    cards={generatedFlashcards}
                    title="Your Generated Flashcards"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* persistent transcript area removed — transcript now shown inside each card */}
    </div>
  );
}
