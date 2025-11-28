'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNextjsAudioToTextRecognition } from 'nextjs-audio-to-text-recognition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Loader2, FileText, Sparkles, ArrowRight, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosClient';
import { toast } from 'sonner';
import TranscriptionView from './TranscriptionView';
import FlashCardCarousel from '@/components/flashcards/FlashCardCarousel';
import getErrorMessage from '@/lib/getErrorMessage';

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
    // Capture transcript value immediately before stopping
    const currentTranscript = transcript;

    setIsProcessing(true);
    stopListening();

    // Allow a short grace period for any final interim results
    setTimeout(() => {
      // Use the captured transcript value
      if (currentTranscript) {
        console.log('Transcript (final):', currentTranscript);
        setFinalTranscript(currentTranscript);

        // AFTER finalTranscript is set, validate length and show toast if needed
        if (currentTranscript.length > 0 && currentTranscript.length < 200) {
          toast.error(
            `Transcript must be at least 200 characters (currently ${currentTranscript.length}).`,
            {
              duration: 5000,
            }
          );
        }
      } else {
        setFinalTranscript('');
      }

      // Clear processing UI
      setIsProcessing(false);
    }, 500);
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
      toast.error(getErrorMessage(err) || 'Failed to generate flashcards');
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
      toast.error(getErrorMessage(err) || 'Failed to save note');
    },
  });

  // Generation mutation: create a note via the notesAgent API
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const generateNotesMutation = useMutation<any, any, { text: string }>({
    mutationFn: (payload) => api.post('/api/notes/generate', payload),
    onMutate: () => setIsGeneratingNote(true),
    onSuccess: (response) => {
      const created = response?.data;
      if (created && created.id) {
        toast.success('Note generated');
        // Redirect to the newly created note page
        router.push(`/dashboard/notes/${created.id}`);
      } else {
        toast.success('Note generated');
      }
    },
    onError: (err) => {
      console.error('Error generating note:', err);
      toast.error(getErrorMessage(err) || 'Failed to generate note');
    },
    onSettled: () => setIsGeneratingNote(false),
  });

  const handleGenerateFlashcards = () => {
    if (isTranscriptTooShort) {
      toast.error(
        `Transcript must be at least 200 characters (currently ${finalTranscript.length}).`,
        {
          duration: 5000,
        }
      );
      return;
    }
    flashcardsMutation.mutate({ text: finalTranscript });
  };

  const handleGenerateNotes = () => {
    if (isTranscriptTooShort) {
      toast.error(
        `Transcript must be at least 200 characters (currently ${finalTranscript.length}).`,
        {
          duration: 5000,
        }
      );
      return;
    }
    // Use the notes generation endpoint which uses the agent to produce title/content
    generateNotesMutation.mutate({ text: finalTranscript });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If either generation mutation is running, treat as busy to prevent parallel requests
  const isAnyGenerating = flashcardsMutation.isPending || generateNotesMutation.isPending;

  // Validation: Check if transcript is long enough (minimum 200 characters)
  const isTranscriptTooShort = finalTranscript.length < 200;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Voice Input</h1>
        <p className="text-gray-600 mt-2">Record your thoughts and convert them to notes</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Idle State - Before Recording */}
        {!isListening && !isProcessing && !finalTranscript && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 rounded-2xl shadow-sm border border-gray-200">
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
                  Start Recording
                </MotionButton>
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
            <Card className="p-6 rounded-2xl shadow-sm border border-gray-200">
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
            <Card className="p-6 rounded-2xl shadow-sm border border-gray-200">
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
        {!isListening && finalTranscript && finalTranscript.length >= 200 && (
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
                <Card className="p-4 rounded-2xl shadow-sm border border-gray-200">
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
                    {/* Flashcards button: disabled while loading or transcript too short */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <MotionButton
                              onClick={handleGenerateFlashcards}
                              variant={flashcardsMutation.isError ? 'destructive' : 'outline'}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: 0.04 }}
                              className="w-full justify-start h-auto py-4 px-4 rounded-xl hover:bg-indigo-50 border-gray-200"
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
                          </div>
                        </TooltipTrigger>
                        {isTranscriptTooShort && (
                          <TooltipContent>
                            <p>
                              Transcript must be at least 200 characters ({finalTranscript.length}
                              /200)
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>

                    {/* Notes button (generate via agent) */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <MotionButton
                              onClick={handleGenerateNotes}
                              variant={generateNotesMutation.isError ? 'destructive' : 'outline'}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: 0.08 }}
                              className="w-full justify-start h-auto py-4 px-4 rounded-xl hover:bg-indigo-50 border-gray-200"
                              disabled={generateNotesMutation.isPending}
                            >
                              {generateNotesMutation.isPending ? (
                                <Loader2 className="w-5 h-5 mr-3 text-gray-500 animate-spin" />
                              ) : (
                                <FileText className="w-5 h-5 mr-3 text-indigo-600" />
                              )}
                              <div className="text-left">
                                <div className="font-medium text-gray-900">Generate Notes</div>
                                <div className="text-xs text-gray-600">
                                  Save transcription as a note
                                </div>
                              </div>
                              {!generateNotesMutation.isPending && (
                                <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                              )}
                            </MotionButton>
                          </div>
                        </TooltipTrigger>
                        {isTranscriptTooShort && (
                          <TooltipContent>
                            <p>
                              Transcript must be at least 200 characters ({finalTranscript.length}
                              /200)
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
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
                  className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 hide-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    aria-label="Close flashcards"
                    onClick={() => setGeneratedFlashcards([])}
                    className="absolute top-4 left-4 z-50 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <FlashCardCarousel cards={generatedFlashcards} />
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
