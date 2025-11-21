'use client';

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, FileText, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface VoiceInputContentProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'transcribed';

export default function VoiceInputContent({ user }: VoiceInputContentProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcription, setTranscription] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processRecording(audioBlob);
      };

      mediaRecorder.start();
      setState('recording');
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic client-side size check (match server limit)
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      alert('File too large. Max 10MB allowed.');
      return;
    }

    // Process the uploaded file directly
    await processRecording(file);
  };

  const generateSummary = async () => {
    try {
      const res = await fetch('/api/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription }),
      });

      if (!res.ok) throw new Error('Failed to generate summary');
      router.push('/dashboard/summaries');
    } catch (err) {
      console.error(err);
      alert('Failed to generate summary');
    }
  };

  const createFlashcardsAction = async () => {
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription }),
      });

      if (!res.ok) throw new Error('Failed to create flashcards');
      router.push('/dashboard/flashcards');
    } catch (err) {
      console.error(err);
      alert('Failed to create flashcards');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setState('processing');
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    try {
      // Prepare form data and send audio blob to our server transcribe endpoint
      const form = new FormData();
      // Use a filename with webm extension
      form.append('file', audioBlob, 'recording.webm');

      setState('processing');

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Transcription failed (${res.status})`);
      }

      const data = await res.json();
      // OpenAI's transcription response normally contains `text`.
      const text = data.text ?? data.transcription ?? data.result ?? '';

      setTranscription(text);
      setState('transcribed');
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe recording. Please try again.');
      setState('idle');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveAsNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Voice Note - ${user?.name ?? ''} - ${new Date().toLocaleDateString()}`,
          content: transcription,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const resetRecording = () => {
    setTranscription('');
    setRecordingDuration(0);
    setState('idle');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Voice Input</h1>
        <p className="text-gray-600 mt-2">Record your thoughts and convert them to notes</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Idle State - Before Recording */}
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                  <Mic className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Ready to Record</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                  Click the button below to start recording. Speak clearly and your voice will be
                  transcribed automatically.
                </p>
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
                <div className="mt-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="ml-2 text-sm text-gray-600 underline">
                      Or upload an audio file
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recording State - Recording in Progress */}
        {state === 'recording' && (
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
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Mic className="w-12 h-12 text-red-600" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-400"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
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
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg rounded-xl border-2 border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Square className="w-5 h-5 mr-2 fill-current" />
                  Stop Recording
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Processing State */}
        {state === 'processing' && (
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
              </div>
            </Card>
          </motion.div>
        )}

        {/* Transcribed State - Show Actions */}
        {state === 'transcribed' && (
          <motion.div
            key="transcribed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
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

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{transcription}</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={saveAsNote}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Save as Note
                </Button>
                <Button onClick={resetRecording} variant="outline" className="px-6 py-6 rounded-xl">
                  Record Again
                </Button>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4 px-4 rounded-xl hover:bg-indigo-50 border-gray-200"
                  onClick={generateSummary}
                >
                  <Sparkles className="w-5 h-5 mr-3 text-amber-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Generate Summary</div>
                    <div className="text-xs text-gray-600">Create a quick summary</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
                <Button
                  variant="outline"
                  onClick={createFlashcardsAction}
                  className="justify-start h-auto py-4 px-4 rounded-xl hover:bg-indigo-50 border-gray-200"
                >
                  <Layers className="w-5 h-5 mr-3 text-indigo-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Create Flashcards</div>
                    <div className="text-xs text-gray-600">Generate study cards</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
